// Record one explicitly selected macOS window. No audio and no whole-display fallback.
// swift scripts/video/record-window.swift list
// swift scripts/video/record-window.swift record WINDOW_ID OUTPUT.mov [SECONDS]
import Foundation
import AppKit
import ScreenCaptureKit
import AVFoundation
import CoreMedia

final class WindowRecorder: NSObject, SCStreamOutput, SCStreamDelegate, @unchecked Sendable {
    var writer: AVAssetWriter!
    var input: AVAssetWriterInput!
    var stream: SCStream!
    var started = false
    var frameCount = 0
    var adaptor: AVAssetWriterInputPixelBufferAdaptor!
    var latest: CVPixelBuffer?
    var origin = 0.0
    var timer: DispatchSourceTimer?
    var failed: String?
    let queue = DispatchQueue(label: "nova.window.recorder")

    func stream(_ stream: SCStream, didStopWithError error: Error) { failed = error.localizedDescription }
    func stream(_ stream: SCStream, didOutputSampleBuffer sample: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .screen, sample.isValid, CMSampleBufferGetImageBuffer(sample) != nil else { return }
        guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sample, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
              let status = attachments.first?[.status] as? Int, status == SCFrameStatus.complete.rawValue else { return }
        latest = CMSampleBufferGetImageBuffer(sample)
        if !started {
            guard writer.startWriting() else { failed = writer.error?.localizedDescription; return }
            writer.startSession(atSourceTime: .zero)
            origin = ProcessInfo.processInfo.systemUptime
            started = true
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
        config.minimumFrameInterval = CMTime(value: 1, timescale: 30)
        config.queueDepth = 6
        config.showsCursor = true
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
        adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: nil)
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
    try await recorder.start(window: window, output: output)
    if args.count > 4, let seconds = Double(args[4]), seconds > 0 {
        try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    } else {
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            DispatchQueue.global().async { _ = readLine(); continuation.resume() }
        }
    }
    try await recorder.stop()
} else { print("Usage: record-window.swift list | record WINDOW_ID OUTPUT.mov [SECONDS]"); exit(2) }
