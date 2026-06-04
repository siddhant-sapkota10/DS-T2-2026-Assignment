/**
 * main.js — Scrollytelling engine for "AI and the Finance Pipeline"
 *
 * Architecture:
 *   - SECTION_CONFIGS drives everything. Add a config object per section;
 *     the engine builds the Scrollama instance, handles overlay state,
 *     fires count-ups, and applies background shifts automatically.
 *   - Overlay elements are in the HTML with data-active-steps="N [N ...]"
 *     The engine adds/removes .is-active as the step number changes.
 *   - All coordinate fine-tuning is done in index.html CSS (left/top %).
 *     No coordinate values live in this file.
 *
 * Adding a new section (Sections 2–6):
 *   1. Add a config object to SECTION_CONFIGS (see stubs below).
 *   2. Add the HTML section block in index.html (copy section-1 pattern).
 *   3. That's it — no engine rewrite required.
 */

'use strict';

/* ==========================================================================
   ACCESSIBILITY: detect prefers-reduced-motion once at startup
   ========================================================================== */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ==========================================================================
   SECTION CONFIGS
   One object per section. The engine reads these to wire up Scrollama.

   Required fields:
     id           {string}  — must match the HTML element id
     assetType    {string}  — 'png' | 'iframe'
     totalSteps   {number}  — number of .step elements in the section

   Optional fields:
     heroCountEl      {string}  — id of the .hero-number element to count up
     heroCountTarget  {number}  — the final value to count to
     heroCountSuffix  {string}  — appended after the number, e.g. '%'
     heroCountStep    {number}  — which step (1-based) triggers the count-up
     heroCountDuration{number}  — animation duration in ms (default 2200)
     warmStep         {number}  — step number that triggers the warm background
   ========================================================================== */

const SECTION_CONFIGS = [

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 1  ·  Power BI iframe  (Graph4PowerBI)
     Asset: iframe  ·  1024 × 1060 px embed
     Narrative: Global AI hiring trends — the opener
     ─────────────────────────────────────────────────────────────────────────
     heroCountTarget: TODO — replace 0 with the actual growth figure once
     you can see what number the Power BI chart highlights.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-1',
    assetType:   'iframe',
    totalSteps:  5,

    /*
      TODO: set heroCountTarget to the real stat visible in this chart,
      e.g. if it shows a 3× rise, use heroCountTarget: 200 (= 200%)
      with heroCountSuffix: '%'.
      Until set, the hero number shows "—" and the count-up is skipped.
    */
    heroCountEl:       'hero-number-s1',
    heroCountTarget:   0,        /* TODO: replace with actual figure */
    heroCountSuffix:   '%',
    heroCountStep:     2,
    heroCountDuration: 2000,

    warmStep: 5,
  },

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 2  ·  PNG  (Graph2.png)
     Asset: PNG  →  assets/images/Graph2.png  ·  595 × 790 px
     Chart: Scatter plot — augmentation exposure (y) vs automation
            exposure (x) across 200+ occupations / all industry groups.
            Circled dots = extreme dual-exposure cases.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-2',
    assetType:   'png',
    totalSteps:  5,

    /*
      TODO: replace 71 with the actual % of Accounting/Banking/Financial
      occupations scoring above 0.5 on BOTH axes in your dataset.
    */
    heroCountEl:       'hero-number-s2',
    heroCountTarget:   71,       /* TODO: verify against data */
    heroCountSuffix:   '%',
    heroCountStep:     2,
    heroCountDuration: 2000,

    warmStep: 5,
  },

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 3  ·  Power BI iframe  (Graph3PowerBI)
     Asset: iframe  ·  1024 × 1060 px embed
     Narrative: AI skill requirements in finance job postings
     ─────────────────────────────────────────────────────────────────────────
     No hero count-up configured — add heroCountEl/Target if the chart
     has a memorable single statistic to highlight in Step 2.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-3',
    assetType:   'iframe',
    totalSteps:  4,

    warmStep: 4,
  },

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 4  ·  PNG  (Graph4.png)
     Asset: PNG  →  assets/images/Graph4.png  ·  1001 × 502 px
     Chart: Bar chart — automation exposure (0–0.8) for 8 finance
            occupations: red = Junior/Clerical, blue = Senior/Professional.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-4',
    assetType:   'png',
    totalSteps:  5,

    /*
      71 = the 0.71 automation exposure score for Accounting Clerks.
      Displayed as "71%" in the text column on Step 2 entry.
      TODO: confirm this matches the exact figure in your dataset.
    */
    heroCountEl:       'hero-number-s4',
    heroCountTarget:   71,
    heroCountSuffix:   '%',
    heroCountStep:     2,
    heroCountDuration: 2000,

    warmStep: 5,
  },

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 5  ·  Power BI iframe  (Graph5PowerBI)
     Asset: iframe  ·  1024 × 1060 px embed
     Narrative: Australian procurement / Defence finance focus
     ─────────────────────────────────────────────────────────────────────────
     Add heroCountEl/Target if the chart has a notable statistic for Step 2.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-5',
    assetType:   'iframe',
    totalSteps:  4,

    warmStep: 4,
  },

  /* ──────────────────────────────────────────────────────────────────────────
     SECTION 6  ·  Power BI iframe  (Graph6PowerBI)
     Asset: iframe  ·  1024 × 1060 px embed
     Narrative: Organisational response and workforce readiness
     ─────────────────────────────────────────────────────────────────────────
     Add heroCountEl/Target if the chart has a notable statistic for Step 2.
     ────────────────────────────────────────────────────────────────────────── */
  {
    id:          'section-6',
    assetType:   'iframe',
    totalSteps:  4,

    warmStep: 4,
  },

];


/* ==========================================================================
   UTILITY: Count-up animation
   Counts from 0 → target with an ease-out cubic curve.
   Respects prefers-reduced-motion (sets final value instantly).
   ========================================================================== */

/**
 * @param {HTMLElement} el       - element whose textContent to update
 * @param {number}      target   - final value
 * @param {string}      suffix   - appended after the number (e.g. "%")
 * @param {number}      duration - animation duration in ms
 */
function countUp(el, target, suffix, duration) {
  if (!el) return;

  suffix   = suffix   || '';
  duration = duration || 2200;

  if (REDUCED_MOTION) {
    el.textContent = target.toLocaleString() + suffix;
    return;
  }

  let startTime = null;

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    /* Ease-out cubic: slows as it approaches the target */
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(target * eased);

    el.textContent = current.toLocaleString() + suffix;

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/* ==========================================================================
   UTILITY: Activate/deactivate overlay annotations for a step
   ========================================================================== */

/**
 * Sets .is-active on every overlay element whose data-active-steps
 * attribute contains stepNum, clears it from all others.
 *
 * data-active-steps format: space-separated integers, e.g. "3 4"
 *
 * @param {HTMLElement} overlayEl
 * @param {number}      stepNum    - 1-based; pass 0 to clear all
 */
function setOverlayStep(overlayEl, stepNum) {
  if (!overlayEl) return;

  overlayEl.querySelectorAll('[data-active-steps]').forEach(function (el) {
    var steps = el.getAttribute('data-active-steps')
      .split(' ')
      .map(function (s) { return parseInt(s, 10); });

    if (steps.indexOf(stepNum) !== -1) {
      el.classList.add('is-active');
    } else {
      el.classList.remove('is-active');
    }
  });
}


/* ==========================================================================
   UTILITY: Reveal all overlay annotations (reduced-motion path)
   ========================================================================== */

function revealAllAnnotations(overlayEl) {
  if (!overlayEl) return;
  overlayEl.querySelectorAll('[data-active-steps]').forEach(function (el) {
    el.classList.add('is-active');
  });
}


/* ==========================================================================
   IMAGE ERROR HANDLER
   Shows the placeholder div when a section-graphic PNG fails to load.
   ========================================================================== */

function initImageFallbacks() {
  document.querySelectorAll('.section-graphic').forEach(function (img) {
    img.addEventListener('error', function () {
      /* Hide the broken image */
      img.style.display = 'none';

      /* Find and show the sibling .graphic-placeholder */
      var wrap = img.closest('.graphic-wrap');
      if (!wrap) return;
      var placeholder = wrap.querySelector('.graphic-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
        /* Also make the wrap visible so the placeholder renders */
        wrap.classList.add('is-visible');
      }
    });
  });
}


/* ==========================================================================
   GRAPHIC ENTRY OBSERVER
   Makes .graphic-wrap.is-visible fire as soon as the section enters the
   viewport (independent of Scrollama step events — graphic fades in
   before the user hits the first step).
   ========================================================================== */

function initSectionObserver() {
  if (!('IntersectionObserver' in window)) {
    /* Fallback: show all graphics immediately */
    document.querySelectorAll('.graphic-wrap').forEach(function (w) {
      w.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var wrap = entry.target.querySelector('.graphic-wrap');
        if (wrap) wrap.classList.add('is-visible');
        /* Once visible, stop observing — no need to hide it again */
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.scrolly-section').forEach(function (section) {
    observer.observe(section);
  });
}


/* ==========================================================================
   SECTION ENGINE
   Wires up one Scrollama instance per config entry.
   ========================================================================== */

function initSection(config) {
  var sectionEl = document.getElementById(config.id);
  if (!sectionEl) return; /* section not in DOM yet (stubs) */

  var stepsColEl  = sectionEl.querySelector('.steps-col');
  var overlayEl   = sectionEl.querySelector('.overlay');
  var graphicWrap = sectionEl.querySelector('.graphic-wrap');

  if (!stepsColEl) return;

  /* Mark iframe overlays so CSS can adjust behaviour */
  if (config.assetType === 'iframe' && overlayEl) {
    overlayEl.classList.add('overlay--iframe');
  }

  /* ── Reduced motion: skip Scrollama, reveal everything immediately ── */
  if (REDUCED_MOTION) {
    if (graphicWrap) graphicWrap.classList.add('is-visible');
    revealAllAnnotations(overlayEl);
    sectionEl.querySelectorAll('.step').forEach(function (s) {
      s.classList.add('is-active');
    });
    /* Show hero number at final value */
    if (config.heroCountEl) {
      var heroEl = document.getElementById(config.heroCountEl);
      if (heroEl) {
        heroEl.textContent =
          (config.heroCountTarget || 0).toLocaleString() +
          (config.heroCountSuffix || '');
      }
    }
    return;
  }

  /* ── Track count-up state (fire once per page load) ── */
  var heroFired = false;

  /* ── Scrollama instance ── */
  if (typeof scrollama === 'undefined') {
    console.warn('Scrollama not loaded — check CDN connectivity.');
    return;
  }

  var scroller = scrollama();

  scroller
    .setup({
      step:   '#' + config.id + ' .steps-col .step',
      /*
        offset: 0 = top of viewport, 1 = bottom.
        0.55 means a step activates when its top edge reaches 55% down
        from the top of the viewport — roughly the reading zone.
      */
      offset: 0.55,
      debug:  false,
    })

    .onStepEnter(function (response) {
      var element = response.element;
      var stepNum = parseInt(element.getAttribute('data-step'), 10);

      /* ── Mark active step in text column ── */
      sectionEl.querySelectorAll('.step').forEach(function (s) {
        s.classList.remove('is-active');
      });
      element.classList.add('is-active');

      /* ── Drive overlay annotations ── */
      setOverlayStep(overlayEl, stepNum);

      /* ── Hero count-up (fires once; skips if target is 0 or unset) ── */
      if (
        config.heroCountEl &&
        config.heroCountTarget &&   /* skip when target is 0 / falsy (= TODO) */
        stepNum === (config.heroCountStep || 2) &&
        !heroFired
      ) {
        heroFired = true;
        var heroEl = document.getElementById(config.heroCountEl);
        countUp(
          heroEl,
          config.heroCountTarget,
          config.heroCountSuffix || '',
          config.heroCountDuration || 2200
        );
      }

      /* ── Warm background shift ── */
      if (config.warmStep && stepNum >= config.warmStep) {
        sectionEl.classList.add('is-warm');
      } else {
        sectionEl.classList.remove('is-warm');
      }
    })

    .onStepExit(function (response) {
      var element   = response.element;
      var direction = response.direction;
      var stepNum   = parseInt(element.getAttribute('data-step'), 10);

      /* When scrolling back up past step 1, clear all overlay state */
      if (stepNum === 1 && direction === 'up') {
        setOverlayStep(overlayEl, 0); /* 0 matches nothing → clears all */
        sectionEl.classList.remove('is-warm');
      }
    });

  /* Recompute step positions on resize */
  window.addEventListener('resize', function () {
    scroller.resize();
  });
}


/* ==========================================================================
   INIT
   ========================================================================== */

function init() {
  initImageFallbacks();
  initSectionObserver();
  SECTION_CONFIGS.forEach(initSection);
}

/* Run after DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
