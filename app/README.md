# Nova mobile agent

Reserved for the mobile phase. No mobile agent is implemented yet.

The reusable backend contract is `BrowserDriver` (observe, execute, screenshot, close). A future `DeviceDriver` should expose equivalent grounded actions over an Android accessibility service or an app-owned integration. iOS does not permit a normal App Store app to control arbitrary other apps globally; a simulator with XCUITest is a development surface, not a consumer distribution solution.

Do not promise that a website extension can be ported unchanged to every mobile app. Validate platform permissions and distribution requirements before choosing the native runtime. Preserve the same action policy, confirmation binding, provider abstraction, stop semantics, and voice protocol.
