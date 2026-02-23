---
name: paper-tree
description: >
  Generate an interactive paper lineage tree for any academic field.
  Given a topic (e.g. "diffusion models", "reinforcement learning", "NLP"),
  produces a fully interactive HTML file with: timeline Y-axis, thematic
  column X-axis, drag-to-pan canvas, filter sidebar, landmark/SOTA badges,
  and a click-to-open detail panel with authors, abstract, and arXiv link.
  Use whenever the user asks to "draw a paper tree", "map the research lineage",
  or "visualize how [field] evolved".
---

# Paper Tree Skill

## Purpose

Produce a beautiful, navigable HTML paper tree that lets researchers browse
how a field developed — from foundational work through to the latest models.
The output is a **single self-contained HTML file** that requires no server.

---

## Workflow Overview

```
1. UNDERSTAND   →  clarify field, scope, depth
2. CURATE       →  identify ~25–45 landmark papers
3. TAXONOMIZE   →  define 6–9 column tracks (themes)
4. TIMELINE     →  define row eras (year groupings)
5. LAYOUT       →  assign each paper a (col, era) grid cell
6. EDGES        →  define influence/dependency links
7. GENERATE     →  fill HTML template → output file
8. VERIFY       →  sanity-check layout, open in browser
```

---

## Step 1 — Understand Scope

Ask (or infer from context):

- **Field**: e.g. "deep learning → VLA", "NLP", "diffusion models", "RL"
- **Depth**: how many papers? (default: 30–45)
- **End year**: up to which year? (default: current)
- **Focus**: broad survey vs. narrow lineage (e.g. just the GPT family)

If the user provides a paper list, skip Step 2 and go straight to Step 3.

---

## Step 2 — Curate Papers

Select papers following these rules:

### Selection criteria (in priority order)
1. **Foundational** — papers that introduced a core idea the field builds on
2. **Landmark** (`star: true`) — papers that caused a paradigm shift; a researcher in the field would consider "must-know". Aim for ~40% of papers.
3. **SOTA at time of publication** (`sota: true`) — papers that achieved best results on an important benchmark when published. Aim for ~35% of papers.
4. **Enabling infrastructure** — datasets, toolkits, scaling analyses

### Coverage rules
- Every column track must have ≥ 3 papers
- Spread across the full timeline (no decade left empty if it's relevant)
- Include the "boring but important" training/infrastructure papers — not just the famous ones
- For VLA/robotics fields: always include the robotics imitation learning foundations, even if they predate the main field

### Paper object schema
```js
{
  id:      string,          // short camelCase unique ID, e.g. 'alexnet12'
  cat:     string,          // category ID from CATS array
  col:     number,          // column index (0-based)
  era:     number,          // row index into ROWS array (0-based)
  star:    boolean,         // landmark paper?
  sota:    boolean,         // SOTA at publication?
  short:   string,          // ≤20 chars node label, e.g. 'AlexNet'
  venue:   string,          // e.g. 'NeurIPS 2012'
  title:   string,          // full paper title
  authors: [{n: string, i: string}],  // name + institution
  desc:    string,          // 2–4 sentence Chinese summary of contribution
  tags:    string[],        // 3–6 keyword tags
  url:     string,          // arXiv or canonical URL
}
```

---

## Step 3 — Define Column Tracks (X-axis themes)

Columns represent **thematic research threads**, not institutions or authors.

### Column design rules
- **6–9 columns** total; fewer for narrow fields, more for broad surveys
- Each column should have a clear single-sentence purpose
- Order columns left→right by: infrastructure → representations → models → applications
- One column should be the "Core Trunk" — the main lineage of foundational papers
- Columns that feed INTO the trunk go left; columns that branch OUT go right
- Every paper should fit naturally into exactly one column

### Column object schema
```js
{
  label: string,   // 1–2 word title, use \n for line break, e.g. 'Core\nTrunk'
  sub:   string,   // ≤50 char description of what papers live here
}
```

### Recommended column patterns by field type

**Deep learning / AI field:**
`Training Methods | Vision | NLP | Core Trunk | Data/Datasets | Domain Foundations | Core Models | Open/Specialized`

**Single model family (e.g. just diffusion models):**
`Score Matching | Denoising | Architecture | Core Trunk | Guidance/Control | Applications | Fast Sampling`

**Robotics/embodied AI:**
`Learning Methods | Perception | Language | Core Trunk | Simulation/Data | Robot Hardware | Policies | Deployment`

**Biomedical/science field:**
`Wet Lab Methods | Computational Foundations | Representations | Core Models | Benchmarks | Applications | Clinical`

---

## Step 4 — Define Timeline Rows (Y-axis eras)

Rows represent **time periods**, grouped by meaningful research epochs.

### Row design rules
- Group by **natural epochs** in the field, not just calendar years
- If a field had a breakthrough year, give that year its own row
- For very active recent years, split by H1/H2 or Q1–Q4
- Typical count: 12–20 rows for a 15–20 year span
- Label format: year or "2022 H1" or "2022–23" — be consistent

### Row object schema
```js
{ y: number, label: string }
```

`y` is the pixel Y offset from the top of the canvas. Use ~70–80px spacing
between rows to leave room for nodes. Start at y=40.

### Example spacing calculation
```
Row 0 (2006):  y=40
Row 1 (2010):  y=120   (+80)
Row 2 (2012):  y=196   (+76)
Row 3 (2013):  y=268   (+72)
...
```
For eras with multiple papers in the same column, offset them by adding
~70–80px per additional era rather than trying to overlap.

---

## Step 5 — Layout Assignment

Map each paper to `(col, era)`:

### Layout rules
1. **Same column = same theme.** Never put a paper in a column just because it has space.
2. **Same era = same time period.** The y-position communicates chronology.
3. **No two papers share the same (col, era).** If two papers in the same column appear the same year, add an intermediate era row for one of them.
4. **Keep the Core Trunk clean.** The trunk column should form an unbroken vertical chain of the most important papers, top to bottom.
5. **Cross-column papers go where their PRIMARY contribution lives**, not their secondary uses.

---

## Step 6 — Define Edges

Edges represent **direct intellectual influence** — paper B builds on, extends, or was directly inspired by paper A.

### Edge rules
- Only draw edges where there is **clear, direct influence** (citations, stated baselines, or widely known in the field)
- No "transitivity edges" — if A→B and B→C, don't add A→C unless that direct link is also real
- Cross-column edges are fine but should cross as few columns as possible
- Landmark papers (`star: true`) should have visually bolder edges (handled automatically)
- Each paper should have **at least 1 incoming edge** (except the earliest papers)
- Each paper should have **at least 1 outgoing edge** (except the most recent papers)

### Edge format
```js
['source_id', 'target_id']
```

---

## Step 7 — Generate HTML

Use the template in `skills/paper-tree/base.html`. Fill in these sections:

### Sections to fill
1. **`COLS` array** — column definitions
2. **`ROWS` array** — era definitions  
3. **`CATS` array** — category color palette
4. **`P` array** — all paper objects
5. **`E` array** — all edges
6. **`<title>` tag** — update to reflect the field

### Category palette guidelines
- Use **desaturated, refined colors** — avoid neon or saturated hues
- Dark background (bg ≈ `#0b0d12`) needs colors with sufficient contrast
- 6–8 categories is ideal; more gets confusing
- Always include: a "milestone/breakthrough" category (warm red ~`#e06060`), a "methods/training" category (amber ~`#e0a048`), and a "core model" category
- Suggested base palette:
  ```
  foundations:  #5b9cf6  (blue)
  nlp/text:     #a07ae8  (purple)
  vision:       #52c2a0  (teal)
  training:     #e0a048  (amber)
  milestone:    #e06060  (red)
  domain:       #5ab0d8  (sky)
  robotics:     #86c468  (green)
  ```

### Canvas size calculation
```js
CANVAS_W = PAD_L + COLS.length * COL_W + PAD_L
CANVAS_H = PAD_T + max(ROWS[*].y) + 100
```

---

## Step 8 — Verify

After generating, mentally walk through:

- [ ] Run `npm test` inside the project to verify that the generated HTML output matches criteria
- [ ] Every column has ≥ 3 visible nodes in "All Papers" view
- [ ] The Y-axis year labels align correctly with node positions
- [ ] The X-axis column labels are readable (≤ 20 chars)
- [ ] No two nodes overlap (same col AND same era)
- [ ] The Core Trunk forms a clean vertical chain
- [ ] Filter buttons work (each category has at least 3 papers)
- [ ] ★ and SOTA badges appear on appropriate nodes
- [ ] All URLs are real arXiv/paper links (not made up)

---

## Output

Save the final file to a user-specified path, or default to the `output/` directory in the current workspace (so it can be evaluated by tests if needed).

Default path: `output/paper_tree_[field].html`

Where `[field]` is a short slug, e.g.:
- `output/paper_tree_diffusion.html`
- `output/paper_tree_rl.html`
- `output/paper_tree_nlp.html`
- `output/paper_tree_vla.html`

If the user specifies a custom output path, use that instead.

---

## Quality Standards

### Must-have
- All paper URLs are real and accessible
- Chinese `desc` field is accurate and informative (not just a translation of the title)
- Author institutions are correct
- No two papers at the same `(col, era)` position
- The HTML file opens and renders correctly without a server

### Nice-to-have  
- `desc` mentions the specific benchmark result or metric when the paper is SOTA
- Tags include the key benchmark name (e.g. `'ImageNet Top-5: 3.57%'`)
- For foundational methods, `desc` explains WHY it was important, not just what it does
- Cross-field connections (e.g. showing how ResNet ideas appear in robot perception) are noted in `desc`

### Avoid
- Making up paper details, author names, or institutions
- Marking a paper as `sota: true` if it didn't achieve clear SOTA at the time
- Drawing speculative edges between papers that didn't directly influence each other
- Putting too many papers in the Core Trunk (max ~8–10 for readability)

---

## Handling Edge Cases

### "I want a very deep tree (50+ papers)"
Increase `COL_W` from 178 to 200 and add more era rows with tighter y spacing.

### "I want to add a paper that doesn't fit any column"
Add a new column. It's better to have 9 clean columns than 8 with one awkward paper.

### "Two important papers came out the same year in the same column"
Add a sub-era row. E.g. if both papers are from 2023 H1, split into `2023 Q1` and `2023 Q2`.

### "I don't know all the author institutions"
Use the organization the lead author was at during the research, as listed on the arXiv paper. If unknown, use the university/company name visible in the paper PDF.

### "A paper has 10+ authors"
List the first 3–4 authors plus a note like `"et al. (8 authors)"` in the last author slot.
