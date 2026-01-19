# Ceremonial Response Prefix — Gated Randomizer Spec

## Purpose
Add light, comedic feedback through **excessive formality** by occasionally emitting a ceremonial “callout” at the start of an assistant response.

This spec introduces:
- Randomized triggering at an average cadence of **N** user inputs
- Gatekeeping (only respond to short “advance/continue” commands)
- A render system that outputs either:
  - **Title-only**, or
  - **Phrase + title**, with special handling for **direct quotes**

---

## Definitions

### N (Cadence)
**N** is a configurable positive integer (recommended: **N = 4–10**).

**Trigger model (MVP-friendly):**
- For each **eligible** user input, trigger with probability **p = 1 / N**.
- This yields an *expected* interval of ~N eligible inputs between ceremonial callouts.

> Alternative (optional): pick a random integer `k ∈ [1..N]` after each trigger and trigger on the k-th next eligible input. Either model is acceptable; prefer the probability model for simplicity.

---

## Gatekeeping (Eligibility)

A ceremonial callout is only considered if the user input is **eligible**.

### Eligibility Rules
User input must satisfy **both**:

1) **Word count**
- Input is **< 10 words** (strictly fewer than ten).
- Word count is computed by splitting on whitespace after trimming.

2) **Intent: advance/continue**
- Input constitutes a **command** or **confirmation** to advance or continue.

### Practical Heuristic (Recommended)
Treat input as eligible if it matches any of the following patterns (case-insensitive, punctuation ignored):

**Confirmations**
- “yes”
- “yep” / “yeah”
- “ok” / “okay”
- “do it”
- “go ahead”
- “continue”
- “proceed”
- “carry on”
- “ship it”
- “make it so”
- “run it”
- “send it”
- “let’s do this”
- “sounds good”

**Questions requesting confirmation to proceed**
- Starts with: “should I …” / “shall I …” / “can you …” / “can we …”
- Example: “Should I continue?”

> Implementation note: if you already have a command classifier, you may use it. Otherwise, the above string-match heuristic is sufficient for MVP.

### Non-Eligible Inputs
- Any input ≥ 10 words
- Requests for analysis, brainstorming, or explanation
- Inputs that are not about continuing/advancing execution

---

## Output Contract

### When Not Triggered (or Not Eligible)
Return the normal assistant response with no ceremonial callout.

### When Triggered (and Eligible)
A ceremonial callout MUST appear at the **beginning** of the assistant response, followed by the normal response content.

The callout rendering is determined by the rules below.

---

## Rendering Rules

### Step 1 — Choose Render Mode
Randomly select **one** render mode:

- **Mode A: Title-only**
- **Mode B: Phrase (optional title) + newline + normal response**

Recommended probabilities:
- Mode A: 35%
- Mode B: 65%

(Exact probabilities are implementation-defined.)

---

### Mode A — Title-only
Emit only a title addressing the user.

**Format:**
```
<Title>,
<Normal response content>
```

Example:
```
My liege,
Proceeding with the requested changes.
```

---

### Mode B — Phrase + (maybe) Title
Select **one** phrase from the phrase pool.

#### Rule: Direct Quote Handling
- If the selected phrase is a **Direct Quote**, **do not** include a title.
- If the selected phrase is **Not a Direct Quote**, include a title and place it in a **grammatically correct** position.

##### Format (Direct Quote)
```
<Phrase>
<Normal response content>
```

Example:
```
“A good plan violently executed now is better than a perfect plan next week.”
Proceeding with the requested changes.
```

##### Format (Not a Direct Quote)
Choose a **title** and place it at one of three positions (randomly):

1) **Prefix**
- `<Title>, <Phrase>`

2) **Infix**
- Insert the title after an opening clause or comma boundary within the phrase

3) **Suffix**
- `<Phrase>, <title>` (or `; <title>` when appropriate)

**Examples:**
- Prefix: `My liege, execution is underway; and its course will be seen through.`
- Infix: `Execution is underway, my liege; and its course will be seen through.`
- Suffix: `Execution is underway; and its course will be seen through, my liege.`

> Implementation note: prefer “my liege” / “sir” / “esteemed colleague” for suffix/infix insertion. Avoid awkward insertions like “Augustus” mid-sentence unless the phrase supports it.

---

## Phrase Pool

### Not a Direct Quote (Title permitted)
- Cry havoc.
- Let slip the dogs of war.
- The die is cast.
- Cross the Rubicon.
- Begin the last act.
- Break the seals.
- Set the world in motion.
- The threshold is crossed.
- Execution is underway.
- The work proceeds.
- Events are in motion.
- So it begins.

### Direct Quotes (No title)
- “A good plan violently executed now is better than a perfect plan next week.”
- “In war, there is no substitute for victory.”
- “Impossible is a word to be found only in the dictionary of fools.”
- “Speed is the essence of war.”
- “Let your plans be dark and impenetrable as night, and when you move, fall like a thunderbolt.”
- “Burn the ships.”
- “Fortune favors the bold.”
- “Action this day.”
- “Duty, honor, country.”
- “Alea iacta est.”
- “Veni, vidi, vici.”
- “Acta est fabula.”
- “Excellent.”
- “Excellent, sir.”

> Note: quotation marks are part of the stored phrase strings for direct quotes (recommended) to reduce ambiguity.

---

## Title Pool
Titles MUST be short and address-like, and are typically emitted with a trailing comma.

- My liege
- Your Grace
- Your Excellency
- Commander
- General
- Marshal
- Imperator
- Consul
- Tribune
- Esteemed colleague
- Distinguished user
- Honored human

---

## Randomization Requirements
- Phrase selection MUST be uniform random within its pool.
- Title selection MUST be uniform random within its pool.
- Mode selection MUST be random according to configured weights.
- Trigger selection MUST be random with probability `1/N` per eligible input (or equivalent cadence model).

No memory of prior selections is required.

---

## Pseudocode (Probability Trigger Model)

```
onUserMessage(msg):
  if not eligible(msg): return normalResponse()

  if random() >= (1/N):
    return normalResponse()

  mode = weightedChoice({TITLE_ONLY:0.35, PHRASE:0.65})

  if mode == TITLE_ONLY:
    title = randomTitle()
    return f"{title},\n" + normalResponse()

  phrase = randomPhrase()

  if isDirectQuote(phrase):
    return f"{phrase}\n" + normalResponse()

  title = randomTitle()
  placement = randomChoice([PREFIX, INFIX, SUFFIX])
  rendered = placeTitle(phrase, title, placement)

  return f"{rendered}\n" + normalResponse()
```

---

## Non-Goals
- No semantic coupling to actual execution state
- No promise that a task is running
- No agent-mode switching
- No safety/policy bypass

---

## Status
MVP+ (gated + randomized + grammatically-aware rendering)
