# One browser engine, a companion for each website

Nova 0.6.0 separates browser execution from website identity. Every site uses the
same observer, planner, native input controller, action policy and outcome checks.
No Amazon, YouTube or Google selector or handler is required by that engine.
Website profiles contain optional owner-authored context, not executable adapters.
Requests outside a saved flow are planned from the live page.

The architecture follows the observe → decide → act → observe pattern documented
in [OpenAI's computer-use guide](https://developers.openai.com/api/docs/guides/tools-computer-use).
Nova currently uses structured actions with Sol and its own browser executor. It
does not embed ChatGPT, copy a proprietary extension, or claim benchmark parity.

## General discovery and visual recovery

The observer covers standard controls, ARIA menus/options/radios/tree items,
editable fields, media, open shadow DOM, SVG controls, CSS pointer controls, and
scroll containers regardless of their class names. Focus, dialogs and controls
inside the viewport take priority. Scrolling therefore brings new controls into
the bounded observation instead of repeatedly returning the first 180 nodes.
Observation metadata reports omitted controls; text in view also takes priority.

When a useful control is visible in a screenshot but lacks a ref, the planner can
use `inspect(x,y)`. This resolves the actual DOM hit, including an icon's enclosing
button, without clicking. The next observation contains the resolved target. The
normal input tools then use its ref and preserve the inspected point. Movement
invalidates that point. The model cannot invent the recovered target's label to
avoid policy checks. Unlabeled/canvas targets retain a review boundary.

This provides another general recovery path. It does not yet make arbitrary
canvas apps, cross-origin frames, closed shadow roots, or browser-owned dialogs
fully observable or controllable. See [coverage](CAPABILITIES.md).

## Website identity and preferences

Dashboard → Your websites → Configure opens the profile editor. Set:

- Website name and accent, used in the native panel and floating launcher.
- Companion introduction, shown on that site's welcome screen.
- Site instructions: vocabulary, preferences, useful context and decision criteria.
- Suggested tasks and guides: optional starters that prefill an editable message.

Suggestions never execute a saved task merely because the user opens the panel.
The user can send any request; the suggestion list does not limit capabilities.
Profile edits propagate to active sessions. Custom accents are preserved when
Nova first observes a new website. Normal visits remain inactive, chat remains
the default, and voice remains opt-in.

The planner uses site context for relevant replies but does not impersonate an
employee or official support service. Context never overrides user intent,
permissions, serious-action confirmation, or the requirement to verify results.

## Evidence

`npm run test:general` uses a fictional, previously unseen project workspace with
empty instructions and no flows. The live model must discover its custom ARIA
dropdown, filter projects, open the requested one, favorite it and report the
observed deadline. Fixture handlers require trusted input; postconditions are
checked independently of the model's final answer.

DOM and extension tests cover long-page discovery, an unmarked control whose
active click area is away from its center, SVG input, shadow icons, moved targets,
and privacy checks for fields omitted from the bounded observation. This is
measured coverage, not proof that every task on every website works.
