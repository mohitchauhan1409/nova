# Bounded processing waits

Drivers advertise `bounded-processing-wait` in snapshot capabilities. With that
capability, `kind: "wait", value: "10", ref: null` requests ten seconds. Values
are seconds, capped at ten seconds per action; null or invalid values keep the
600 ms settling wait. Both extension and isolated-browser drivers honor this.

Repeated waits require observed processing: a visible Please wait button,
progress bar, busy state, loading status, or standalone processing indicator.
The runner reobserves after every wait. It preserves the previous mutation's
repeat protection and does not resubmit the operation to poll its status.

One task has a 90-second total wait budget, counting both dispatched duration and
elapsed time including planning from its first wait. Changing durations, page
text or inspected controls does not reset it. Exhaustion stops with the outcome
pending. Without processing evidence or capability, the existing repeated-action
limit remains active. Older extensions retain short waits until reloaded.
