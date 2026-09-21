# Candidate scenario — not recording-ready

Synthetic scenario: Vector is preparing an AI workflow workspace. No real
customer, transaction or usage event should be introduced.

Choose the final journeys only after inspecting the signed-in forms and safe save
boundaries. The leading candidate is a usage meter followed by a plan or credits
benefit that references it. A targeted offer is an alternative if it proves both
safe and more reliable. These are candidate prompts, not a performed transcript.

1. Open Nova from a fresh, single-tab Home view: “I’m a little lost setting up
   usage for our team plan. Can you help me?”
2. Candidate grouped answers: name **Workflow Units**; event
   **vector.workflow.completed**; only **successful** workflows; numeric property
   **compute_units**. Leave the aggregation undecided and select **Help me choose**.
3. Nova should retain the supplied answers and explain counting workflow events
   versus totaling compute units. Choose **Sum of compute_units** if supported.
4. Save only a safe new configuration and reopen it. Pass: exact name, all
   filter clauses, conjunction, aggregation and unit; no events were ingested.
5. Connected candidate: “Prepare Vector Teams with 5,000 workflow units each
   month, using the meter we just created.” Nova must resolve the actual
   product/credits dependencies and ask about any missing commercial decisions.
6. Targeted revision: “Make that 7,500 included units; keep everything else the
   same.” Pass: update the same scenario record, preserve other values and reopen.
7. Closing questions: “What did we save?”, “Is any real usage being billed yet?”
   and “Show me Home.” Answer from actual evidence; zero activity is valid.

Rehearsal variation: use a fully specified brief with a different exact name,
inspect an existing record before resuming, and test Stop/Continue on read-only
work. Reuse owned rehearsal records instead of accumulating duplicates. Do not
prepare the final outcome before the camera starts.

The final exact prompts, grouped answers and evidence must replace this candidate
after two successful live rehearsals of each selected critical workflow.
