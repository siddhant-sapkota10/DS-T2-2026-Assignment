# AI and the Finance Pipeline

A static scrollytelling data story about AI's impact on finance and procurement hiring, built for a Defence finance/procurement audience.

**Tech stack:** Vanilla HTML5, CSS3, ES6 JavaScript. No framework, no build step, no npm. Runs by opening `index.html` directly in a browser.

---

## Running locally

```
# No server needed — just open the file:
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

An internet connection is needed on first load only (Google Fonts + Scrollama CDN). For fully offline use, download `scrollama.min.js` from https://unpkg.com/scrollama@3.2.0/build/scrollama.min.js, save it to `js/`, and update the `<script>` tag in `index.html`.

---

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (contents at the repo root, not inside a subdirectory).
2. Go to **Settings → Pages**.
3. Set **Source** → `Deploy from a branch`, branch: `main` (or `master`), folder: `/ (root)`.
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/` within a minute.

No build step is needed — GitHub Pages serves static files directly.

---

## Adding chart assets

### PNG charts (CODAP / Google Colab exports)

Drop the exported PNG into `assets/images/` and make sure the filename matches the `<img src="...">` in `index.html`.

| Section | Expected filename |
|---------|-------------------|
| 1 | `graph4-job-postings-by-region.png` |
| 2–6 | *(add as you build each section)* |

If the file is absent, a labelled placeholder box is shown instead — the layout won't break.

**Aspect ratio:** The graphic container defaults to `16:9`. If your exported chart has a different ratio, update the `aspect-ratio` property on `.graphic-wrap` in `css/styles.css`.

### Power BI iframes

1. In Power BI Service, click **File → Embed report → Website or portal** to get the embed `<iframe>` HTML.
2. In `index.html`, find the section's `.graphic-wrap` div.
3. Remove the `<div class="graphic-placeholder">` and `<img>` tags.
4. Paste the `<iframe>` HTML in their place.
5. Set `data-asset-type="iframe"` on the parent `.scrolly-section` element.

The engine automatically switches to iframe-safe overlay mode (no click-blocking dim masks; only edge callouts and rings are used, so the embed stays fully interactive).

---

## Adjusting overlay annotation positions

All annotation positions are percentage-based (`left: X%; top: Y%`) so they scale with the graphic container on any screen size.

**To calibrate after placing the real PNG:**

1. Open `index.html` and find the overlay section for that chart (search for `id="s1-overlay"` etc.).
2. Adjust the `style="left: XX%; top: YY%;"` on each annotation element.
3. Comments marked `TODO: adjust to sit over …` show exactly which elements need tuning.

No JavaScript changes are needed — CSS inline styles only. The SVG spotlight rectangle (`x / y / width / height`) also uses 0–100 coordinates (= percentages of the image), so adjust those values directly in the `<rect class="spotlight-hole">` element.

---

## Adding Sections 2–6

Each new section requires two changes:

**1. `index.html`** — Copy the entire Section 1 block (`<section id="section-1" ...>...</section>`), then:
- Change `id="section-1"` → `id="section-2"` (etc.)
- Change `data-section="1"` → `data-section="2"`
- Update `data-asset-type` to `"png"` or `"iframe"`
- Replace the image / iframe
- Update the overlay annotations (`data-active-steps`, positions)
- Update the step text

**2. `js/main.js`** — Uncomment and fill in the stub config for that section in `SECTION_CONFIGS`. The engine handles the rest.

---

## Project structure

```
ai-finance-pipeline/
├── index.html          All section markup, overlay annotations, step text
├── css/
│   └── styles.css      Theme variables, layout, animations, responsive rules
├── js/
│   └── main.js         Scrollama engine + per-section config array
├── assets/
│   └── images/         Drop PNG chart exports here
└── README.md           This file
```

---

## Customisation quick-reference

| What to change | Where |
|---|---|
| Accent colour | `--accent` in `css/styles.css` `:root` |
| Graphic column width | `--graphic-col` in `css/styles.css` `:root` |
| Step activation point (how far down viewport) | `offset` in `main.js` `scroller.setup()` |
| Count-up target number | `heroCountTarget` in `SECTION_CONFIGS` in `main.js` |
| Spotlight rectangle (APAC region) | `x / y / width / height` on `<rect class="spotlight-hole">` in `index.html` |
| Pulse ring position (Australia) | `style="left: X%; top: Y%;"` on `.pulse-ring-wrap` in `index.html` |
| Quote text | Inside `.quote-card` in `index.html` — look for `TODO` comment |
| Data source credits | Footer `<p class="footer-sources">` in `index.html` |
