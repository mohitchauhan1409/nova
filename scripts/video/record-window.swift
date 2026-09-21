// Record one explicitly selected macOS window. No audio and no whole-display fallback.
// swift scripts/video/record-window.swift list
// swift scripts/video/record-window.swift record WINDOW_ID OUTPUT.mov [SECONDS] [--masks PLAN.json] [--hide-cursor]
import Foundation
import AppKit
import ScreenCaptureKit
import AVFoundation
import CoreMedia
import CoreImage

// Coordinates use native video pixels from the top-left. A declared canvas
// prevents a resized window from silently moving private details outside masks.
struct PrivacyMask: Decodable {
    let x: Int, y: Int, width: Int, height: Int
    let color: String
}
struct PrivacyPlan: Decodable {
    let width: Int, height: Int
    let masks: [PrivacyMask]
    func validate(width actualWidth: Int, height actualHeight: Int) throws {
        guard width == actualWidth, height == actualHeight, !masks.isEmpty,
            masks.allSatisfy({ m in
                m.x >= 0 && m.y >= 0 && m.width > 0 && m.height > 0 &&
                m.x + m.width <= width && m.y + m.height <= height &&
                m.color.range(of: "^#[0-9a-fA-F]{6}$", options: .regularExpression) != nil
            }) else { throw NSError(domain: "NovaRecorder", code: 3, userInfo: [NSLocalizedDescriptionKey: "Privacy masks must fit the exact native capture dimensions and use #RRGGBB colors."]) }
    }
}

final class WindowRecorder: NSObject, SCStreamOutput, SCStreamDelegate, @unchecked Sendable {
    var writer: AVAssetWriter!
    var input: AVAssetWriterInput!
    var stream: SCStream!
    var showsCursor = true
    var started = false
    var frameCount = 0
    var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    var latest: CVPixelBuffer?
    var origin = 0.0
    var timer: DispatchSourceTimer?
    var failed: String?
    var privacy: PrivacyPlan?
    var privacyURL: URL?
    var privacyBytes: Data?
    let imageContext = CIContext()
    let queue = DispatchQueue(label: "nova.window.recorder")

    func stream(_ stream: SCStream, didStopWithError error: Error) { failed = error.localizedDescription }
    func stream(_ stream: SCStream, didOutputSampleBuffer sample: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .screen, sample.isValid, CMSampleBufferGetImageBuffer(sample) != nil else { return }
        guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sample, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
              let status = attachments.first?[.status] as? Int, status == SCFrameStatus.complete.rawValue else { return }
        let source = CMSampleBufferGetImageBuffer(sample)!
        if let privacyURL {
            do {
                let data = try Data(contentsOf: privacyURL)
                if data != privacyBytes {
                    let updated = try JSONDecoder().decode(PrivacyPlan.self, from: data)
                    try updated.validate(width: CVPixelBufferGetWidth(source), height: CVPixelBufferGetHeight(source))
                    privacy = updated
                    privacyBytes = data
                    print("Privacy plan updated before source frame at epoch milliseconds: \(Int64(Date().timeIntervalSince1970 * 1000))")
                    fflush(stdout)
                }
            } catch {
                failed = "Privacy plan reload failed: \(error.localizedDescription)"
                latest = nil
                return
            }
        }
        if let privacy {
            // Do not retain or write an unredacted frame when masks are enabled.
            guard CVPixelBufferGetWidth(source) == privacy.width,
                  CVPixelBufferGetHeight(source) == privacy.height,
                  let pool = adaptor.pixelBufferPool else {
                failed = "Capture dimensions changed or the privacy buffer is unavailable."
                latest = nil
                return
            }
            var destination: CVPixelBuffer?
            guard CVPixelBufferPoolCreatePixelBuffer(nil, pool, &destination) == kCVReturnSuccess,
                  let destination else { failed = "Could not allocate privacy buffer"; latest = nil; return }
            var rendered = CIImage(cvPixelBuffer: source)
            for mask in privacy.masks {
                let rgb = UInt32(mask.color.dropFirst(), radix: 16)!
                let color = CIColor(red: CGFloat((rgb >> 16) & 255) / 255,
                                    green: CGFloat((rgb >> 8) & 255) / 255,
                                    blue: CGFloat(rgb & 255) / 255, alpha: 1)
                let rect = CGRect(x: mask.x, y: privacy.height - mask.y - mask.height,
                                  width: mask.width, height: mask.height)
                rendered = CIImage(color: color).cropped(to: rect).composited(over: rendered)
            }
            imageContext.render(rendered, to: destination)
            latest = destination
        } else { latest = source }
        if !started {
            writer.startSession(atSourceTime: .zero)
            origin = ProcessInfo.processInfo.systemUptime
            started = true
            print("First encoded frame epoch milliseconds: \(Int64(Date().timeIntervalSince1970 * 1000))")
            fflush(stdout)
        }
    }

    // ScreenCaptureKit emits only changed frames. Retain the last image at
    // 30 fps so real idle time remains present in the untouched source video.
    func tick() {
        guard started, let pixelBuffer = latest else { return }
        let through = Int((ProcessInfo.processInfo.systemUptime - origin) * 30)
        while frameCount <= through && input.isReadyForMoreMediaData {
            if !adaptor.append(pixelBuffer, withPresentationTime: CMTime(value: Int64(frameCount), timescale: 30)) {
                failed = writer.error?.localizedDescription
                return
            }
            frameCount += 1
        }
    }

    func start(window: SCWindow, output: URL) async throws {
        let filter = SCContentFilter(desktopIndependentWindow: window)
        let config = SCStreamConfiguration()
        let scale = Int(filter.pointPixelScale)
        config.width = Int(filter.contentRect.width) * scale
        config.height = Int(filter.contentRect.height) * scale
        try privacy?.validate(width: config.width, height: config.height)
        config.minimumFrameInterval = CMTime(value: 1, timescale: 30)
        config.queueDepth = 6
        config.showsCursor = showsCursor
        config.capturesAudio = false
        config.pixelFormat = kCVPixelFormatType_32BGRA
        config.scalesToFit = false
        writer = try AVAssetWriter(outputURL: output, fileType: .mov)
        input = AVAssetWriterInput(mediaType: .video, outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: config.width, AVVideoHeightKey: config.height,
            AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 14000000,
                AVVideoExpectedSourceFrameRateKey: 30, AVVideoMaxKeyFrameIntervalKey: 60]
        ])
        input.expectsMediaDataInRealTime = true
        writer.add(input)
        adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            kCVPixelBufferWidthKey as String: config.width,
            kCVPixelBufferHeightKey as String: config.height,
            kCVPixelBufferIOSurfacePropertiesKey as String: [:]
        ])
        // Starting the writer here makes its pixel-buffer pool available before
        // the first source frame is processed by the privacy filter.
        guard writer.startWriting() else { throw writer.error ?? NSError(domain:"NovaRecorder",code:4) }
        stream = SCStream(filter: filter, configuration: config, delegate: self)
        try stream.addStreamOutput(self, type: .screen, sampleHandlerQueue: queue)
        let clock = DispatchSource.makeTimerSource(queue: queue)
        clock.schedule(deadline: .now(), repeating: .nanoseconds(33_333_333))
        clock.setEventHandler { [weak self] in self?.tick() }
        timer = clock
        clock.resume()
        try await stream.startCapture()
        print("Recording window \(window.windowID), \(config.width)x\(config.height), up to 30 fps, no audio. Press Return to finish.")
        fflush(stdout)
    }

    func stop() async throws {
        try await stream.stopCapture()
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            queue.async { self.timer?.cancel(); self.tick(); self.input.markAsFinished(); continuation.resume() }
        }
        if started { await writer.finishWriting() }
        if let failed { throw NSError(domain: "NovaRecorder", code: 1, userInfo: [NSLocalizedDescriptionKey: failed]) }
        guard writer.status == .completed else { throw writer.error ?? NSError(domain:"NovaRecorder",code:2) }
        print("Saved \(frameCount) captured frames. Verify duration and CFR before delivery.")
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let args = CommandLine.arguments
let content = try await SCShareableContent.excludingDesktopWindows(true, onScreenWindowsOnly: false)
if args.count == 2 && args[1] == "list" {
    for w in content.windows where w.owningApplication?.bundleIdentifier == "com.google.Chrome" {
        print("\(w.windowID)\t\(Int(w.frame.width))x\(Int(w.frame.height))\t\(w.title ?? "Untitled")")
    }
} else if args.count >= 4 && args[1] == "record", let id = UInt32(args[2]), let window = content.windows.first(where: {$0.windowID == id}) {
    guard window.owningApplication?.bundleIdentifier == "com.google.Chrome" else { fatalError("Select an observed Chrome window") }
    let output = URL(fileURLWithPath: args[3])
    guard !FileManager.default.fileExists(atPath: output.path) else { fatalError("Will not overwrite source recording") }
    let recorder = WindowRecorder()
    recorder.showsCursor = !args.contains("--hide-cursor")
    if let flag = args.firstIndex(of: "--masks") {
        guard args.indices.contains(flag + 1) else { fatalError("--masks needs a JSON path") }
        let privacyURL = URL(fileURLWithPath: args[flag + 1])
        let privacyBytes = try Data(contentsOf: privacyURL)
        recorder.privacyURL = privacyURL
        recorder.privacyBytes = privacyBytes
        recorder.privacy = try JSONDecoder().decode(PrivacyPlan.self, from: privacyBytes)
    }
    try await recorder.start(window: window, output: output)
    if args.count > 4, let seconds = Double(args[4]), seconds > 0 {
        try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    } else {
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            DispatchQueue.global().async { _ = readLine(); continuation.resume() }
        }
    }
    try await recorder.stop()
} else { print("Usage: record-window.swift list | record WINDOW_ID OUTPUT.mov [SECONDS] [--masks PLAN.json] [--hide-cursor]"); exit(2) }
