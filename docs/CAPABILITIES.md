# Website interaction coverage

Current extension: **0.6.0**. See [the shared engine and site identity](GENERAL-AGENT.md).

Nova composes a small action vocabulary into larger tasks. It is not hardcoded to three sites, and does not require the target site's code to integrate an SDK. This also does not establish compatibility with every website or every browser-controlled surface.

| Capability | Dedicated browser | Browser extension |
|---|---|---|
| Dashboard launches in the same browser window | Separate driver retained for explicit API/testing use | Default dashboard path: new tab in the dashboard’s own browser window |
| Conversation surface | Legacy in-page voice introduction and optional typing | Native browser side panel; chat by default, opt-in live voice; floating launcher on website |
| Conversation and approvals after navigation | Reinstalled from backend session | Native panel persists beside the page, with session updates from the background connection |
| Voice ownership | Legacy page microphone reacquired after navigation | Extension microphone permission requested through a setup tab on first use and reused while allowed; panel captures audio; Chat, panel close, and switching to another tab stop capture |
| Visible agent pointer | Actual target coordinates, brief movement and click feedback | Same visual indication for DOM actions |
| Click/tap, double-click, hover, right-click | Native browser pointer events | Trusted Chrome input in the attached tab |
| Drag and drop | Native pointer movement between observed controls | Native pointer drag; widget support still varies |
| Replace, append, clear, explicit-text paste | Native keyboard input; short text appears progressively | Trusted browser text insertion; requested values checked locally without exposing private field contents |
| Dropdowns, checkboxes and radio buttons | Implemented and fixture-tested | Native checkbox/radio clicks; semantic HTML select changes; resulting state checked |
| Media play/pause/mute/unmute/seek | Generic HTML media controls | Generic HTML media controls with observed playback-state verification; next video/skip ad uses an observed website button |
| Page and nested scrolling | Smooth scroll, four directions, top/bottom, target element | Same |
| Zoom | Page-content zoom, 50–200% | Browser tab zoom, 50–200% |
| Select and copy visible text | Selection plus native Copy shortcut; clipboard permission/platform behavior applies | Clipboard write with browser Copy fallback; permission may require manual Copy |
| Paste | Explicit provided text, or the dedicated driver's last copied text | Explicit provided text; never reads the operating-system clipboard |
| Keyboard navigation and editing | Enter, Escape, Tab, Shift-Tab, arrows, Home/End, PageUp/Down, Backspace/Delete, select all, undo/redo | Trusted browser events to the observed focused control; same supported keys |
| Back, forward, reload | Routine browsing; no extra confirmation | Routine browsing; no extra confirmation |
| Visual target inspection | Screenshot point resolves to a real DOM target without clicking; next input uses its ref | Same; native input preserves the inspected point and rejects moved targets |
| Screenshot and coordinate click | Grounded screenshot first; confirmation for visual clicks | Browser-control screenshot without all_urls/activeTab dependency; grounded native coordinate click with confirmation |
| Clarifying questions | Model asks on the page; answer continues the conversation | Same |
| Stop / voice interruption | Cancels pending planning and stops new actions; dispatched actions cannot always be undone | Same |

The agent does not read the operating system clipboard. Private form values, passwords, OTPs and payment fields are excluded from normal observations and blocked from agent entry. Copy targets are observed visible page text, not input contents.

Native right-click can open browser chrome that is outside DOM observation. File pickers, uploads/downloads, print dialogs, browser settings, cross-origin frames, closed shadow roots, arbitrary canvas applications, login challenges and CAPTCHA need additional integration or human handling. A user can perform many actions in these surfaces that the current agent cannot perform reliably.

## Fast path

The direct parser recognizes complete, unambiguous requests such as `scroll down`, `zoom out`, `pause the video`, and `skip forward 10 seconds`. A media shortcut needs exactly one observed player; ambiguity returns to the planner. Bare `skip` needs context because it could mean seek, next video, or skip an ad. Direct actions still observe the page and apply policy checks. `scroll down and buy it` is not a direct viewport command.

## Browser control and completion

Versions 0.5.0 and later require Chrome's debugger permission at install/update; Chrome does not allow it as an optional runtime permission. It enables a fixed set of input and screenshot commands in the attached Nova tab. The model cannot submit arbitrary CDP commands or scripts. Chrome displays its control banner. Disconnecting control stops further input until Resume; ending the Nova session detaches the connection. Normal website visits remain inactive.

Completion includes evidence from the current page (text, URL, control state, or a verified local action). Missing evidence is rejected. Delayed UI changes are observed without replaying the action; inconclusive saved changes stop rather than risk duplication. These checks reduce false completion claims but do not prove semantic correctness for every website or task.

The latest extension test measured its direct zoom command in hundreds of milliseconds, including test input/click time. Model-driven searches and product inspection still take seconds. These are separate workloads; no universal real-time completion claim is made.

## Visible behavior

The Nova pointer marks the actual target used by the executor, rather than playing a prerecorded animation. Short typing uses browser key events in the dedicated browser; long input is inserted in one operation to avoid artificial delay. Scrolling is smooth and bounded. The native side panel resizes the website and never covers an action target. The legacy diagnostic popup minimizes if needed. Assistant messages render as Markdown with raw HTML disabled; remote image URLs are not fetched by message rendering. Nova’s own page launcher and cursor are excluded from agent observations.

Both local and extension execution are local single-user preview surfaces. Large-scale website coverage, adversarial robustness and production hosting require the evaluation and deployment work listed in `VALIDATION.md`.

## General discovery and website identity

Viewport-first observations discover controls beyond the initial list after scrolling.
Custom ARIA menus, options, radios, tree items, SVG controls, CSS pointer targets,
and unlabeled scroll containers use the shared observer. Observation limits are
reported to the planner. The panel uses the selected profile’s name, accent,
introduction and suggested tasks; the launcher shares the accent. No flow is
required to attempt a new task. See [architecture and configuration](GENERAL-AGENT.md).
