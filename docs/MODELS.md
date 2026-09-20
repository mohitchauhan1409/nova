# Model cost and validation

Nova 0.5.0 uses **GPT-5.6 Sol** by default and **GPT-5.6 Terra** for the
dashboard's Lower cost option. `.env` selects these as `OPENAI_MODEL` and
`OPENAI_FAST_MODEL`. There is no automatic fallback to Astra.

Official standard rates checked 16 September 2026, USD per million tokens:

| Model | Input | Cached input | Output |
|---|---:|---:|---:|
| GPT-6 Astra | $10 | $1 | $50 |
| GPT-5.6 Sol | $4 | $0.40 | $20 |
| GPT-5.6 Terra | $2 | $0.20 | $12 |

Sources: [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra),
[Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol),
[Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra).
Sol's standard token rates are 60% below Astra's. Terra's input/output rates are
80%/76% below Astra's. Actual cost depends on tokens, cache hits, retries, and task
length. Sol's listed pricing is promotional, available at least through
21 November 2026; recheck official rates before financial planning.

Sol is the flagship tier; Terra balances intelligence and cost. Both support
image input and structured outputs used by Nova. They are not proven identical
to Astra in reasoning quality. No such equivalence is claimed.

## Local task samples

`npm run test:models` used real API responses and the same browser runner/policy
against a fictional shop. Each model searched for an adapter, opened product
details and answered price/resolution; then added exactly one item and verified
quantity and total without checkout. Both passed.

| Model | Search/details | Add and verify cart | Calls | Input / cached input / output tokens | Estimated total |
|---|---:|---:|---:|---|---:|
| Sol | 11.393 s | 6.850 s | 5 | 14,058 / 7,108 / 515 | $0.04094 |
| Terra | 9.516 s | 6.166 s | 5 | 13,963 / 7,108 / 503 | $0.02117 |

Input totals include cached tokens. Estimates use the rates above; they exclude
Sarvam, hosting, and taxes and are not billing records. These are single-run
samples on one small fixture, not averages or a general quality benchmark.

Nova now packs observed controls into rows with shared context strings, keeping
their names, roles, options, states and refs. It removes IDs/timestamps from
conversation history and presentation-only snapshot metadata. The initial fixture
context was 2,020 characters versus 3,401 for the unpacked comparison. This is a
payload-size sample, not a universal token-saving percentage. Static instructions
remain at the start of requests so provider prompt caching can apply. Per-session
usage records actual API calls, input, cached-input and output tokens.

For broader deployment, evaluate task success, false completion, recovery, latency
and cost per successful task across representative websites before choosing Terra
as the default. See [validation](VALIDATION.md) for the current test limits.
