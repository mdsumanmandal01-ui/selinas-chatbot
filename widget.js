/*! Selina's Beauty Assistant: chat widget frontend.
 *  Vanilla JS + Shadow DOM. No frameworks, no API keys.
 *  Embed:  <script src="widget.js" defer data-api-url="https://your-backend/chat"></script>
 *  See README.md for setup, testing and the backend contract.
 */
(function () {
  "use strict";
  if (window.SelinasChat) return; // never mount twice

  /* =========================================================
   * 1. CONFIG
   * ========================================================= */

  // Backend endpoint. Leave as-is to run in DEMO MODE (no AI, pre-written answers).
  // Never put an API key here: keys belong on the backend only.
  const API_URL = "YOUR_BACKEND_ENDPOINT";

  const SCRIPT = document.currentScript;
  const DS = (SCRIPT && SCRIPT.dataset) || {};
  const USER_CFG = window.SelinasChatConfig || {};

  const CONFIG = {
    apiUrl: DS.apiUrl || USER_CFG.apiUrl || API_URL,
    // Optional endpoint that receives the enquiry form as JSON. Needs a real backend.
    enquiryUrl: DS.enquiryUrl || USER_CFG.enquiryUrl || "",
    cssUrl:
      DS.cssUrl ||
      USER_CFG.cssUrl ||
      (SCRIPT && SCRIPT.src ? new URL("styles.css", SCRIPT.src).href : "styles.css"),
    timeoutMs: 20000,
    maxLength: 1000,
  };

  function isConfigured(url) {
    if (!url || /^YOUR_/i.test(url)) return false;
    try {
      new URL(url, window.location.href);
      return true;
    } catch (e) {
      return false;
    }
  }
  const LIVE = isConfigured(CONFIG.apiUrl); // false = demo mode

  /* =========================================================
   * 2. VERIFIED BUSINESS DATA (built-in fallback)
   * Source: https://selinashairandbeauty.co.uk/ (pages checked 25-27 Oct 2026).
   * Kept identical to backend/src/data/business.js. When LIVE mode is active,
   * the widget also refreshes from GET /services and GET /locations with a
   * silent fallback to this built-in data if offline or unreachable.
   * ========================================================= */

  const SITE = "https://selinashairandbeauty.co.uk";
  const URLS = {
    home: SITE + "/",
    hair: SITE + "/hair-services/",
    beauty: SITE + "/beauty-services/",
    aesthetics: SITE + "/home/aesthetic-treatments/",
    courses: SITE + "/home/aesthetic-courses/",
    contact: SITE + "/contact_us/",
  };

  const BUSINESS = {
    name: "Selina's Hair, Beauty & Aesthetics",
    email: "ask@selinashairandbeauty.co.uk",
    hours:
      "Monday to Sunday, 10am to 6pm, as listed on our website's contact page. Please confirm the hours for your chosen location.",
    locations: [
      {
        id: "manchester",
        name: "Manchester",
        address: "8 Kingsway, Burnage, Manchester, M19 2DD",
        phone: "0161 256 4299",
      },
      {
        id: "yorkshire",
        name: "Yorkshire (Dewsbury)",
        address: "116 Hillcrest Road, Savile Town, Dewsbury, WF12 9NX",
        phone: "07739660079",
      },
    ],
  };

  // group: hair | beauty | aesthetic | course
  // price: undefined = unknown ("Contact us for pricing"); quote: true = "Price on consultation"
  const SERVICES = {};
  function svc(id, group, name, desc, url, extra) {
    SERVICES[id] = Object.assign({ id, group, name, desc, url }, extra || {});
  }

  svc("haircare", "hair", "Haircare: cut, colour, style and extensions",
    "Cut and finish, wash and style, full-head colour, highlights, roots and ombre or balayage, plus hair extensions. Every visit starts with a one-to-one consultation.",
    URLS.hair, { quote: true, note: "Prices depend on hair length and style and are quoted by the salon at consultation." });

  svc("eyebrows", "beauty", "Eyebrow shaping, lamination and tinting",
    "Full, natural or striking brows using threading, waxing, tinting and brow lamination techniques.",
    SITE + "/eyebrow-shaping-lamination-tinting/");
  svc("eyelashes", "beauty", "Eyelash lift, tint and extensions",
    "A range of eyelash treatments carried out by qualified beauticians.",
    SITE + "/eyelashes/");
  svc("waxing", "beauty", "Waxing",
    "From smaller areas such as eyebrows or underarms through to a full body wax.",
    SITE + "/waxing/");
  svc("facials", "beauty", "Facials",
    "Relaxing facials that moisturise, soften, unclog pores, exfoliate, stimulate circulation and deep clean the skin.",
    SITE + "/facials/");
  svc("massages", "beauty", "Massages",
    "Relaxing, therapeutic massages, including Swedish Deep Tissue and Indian Head and Shoulder, and more.",
    SITE + "/massages/");
  svc("makeup", "beauty", "Makeup",
    "Bespoke make-up packages. Our make-up artists can also apply semi-permanent makeup.",
    SITE + "/makeup-2/");

  svc("bb-glow", "aesthetic", "BB Glow",
    "A facial and rejuvenation technique aimed at smoother, firmer, brighter-looking skin.",
    SITE + "/bb-glow/");
  svc("plasma", "aesthetic", "Plasma Treatment",
    "Plasma Pen 'fibroblasting': a non-surgical procedure used for wrinkle softening, eyelid tightening and more.",
    SITE + "/plasma/");
  svc("mesotherapy", "aesthetic", "Mesotherapy",
    "A gentle digital skin needling option.",
    SITE + "/meso-needling-therapy/");
  svc("rf-microneedling", "aesthetic", "RF Microneedling",
    "A gold-plated needle device that delivers radio-frequency deep into the dermal layers of the skin.",
    SITE + "/rf-microneedling-therapy/");
  svc("profound", "aesthetic", "Profound",
    "A non-surgical option for facial wrinkles and the appearance of cellulite.",
    SITE + "/profound1/");
  svc("exilis", "aesthetic", "Exilis Elite",
    "A non-surgical treatment used to tighten skin and reduce fat on the face or body.",
    SITE + "/exilis-elite/");
  svc("hydrafacial", "aesthetic", "Hydrafacial",
    "Cleanses, exfoliates and removes impurities from the skin using specialist technology.",
    SITE + "/hydrafacial/");
  svc("scalp-pigmentation", "aesthetic", "Scalp Pigmentation",
    "Micro pigmentation that replicates hair follicles as a hair loss solution.",
    SITE + "/scalp-pigmentation/");
  svc("botox", "aesthetic", "Botox",
    "Botulinum toxin injections that relax facial muscles to smooth lines such as crow's feet and frown lines.",
    SITE + "/botox/");
  svc("ipl", "aesthetic", "IPL Hair Removal",
    "Intense Pulsed Light hair removal.",
    SITE + "/ipl-hair-removal/");
  svc("ice-laser", "aesthetic", "Ice Laser Hair Removal",
    "Uses the Soprano ICE Platinum device to gradually heat the dermis and prevent hair growth.",
    SITE + "/ice-laser-hair-removal/");

  const COURSE_NOTE = "CPD accredited. Contact the salon to book.";
  svc("course-spm", "course", "Semi Permanent Makeup course",
    "CPD accredited with employability certification. Book by the day or take the full course.",
    URLS.courses, {
      price: "From £995, or £3,995 for all areas",
      details: [
        "Day 1, Brows Machine & Blading: £1,495",
        "Day 2, Lips Liner & Blush: £1,995",
        "Day 3, Eyeliner: £995",
        "All areas, full course: £3,995",
      ],
      note: "A deposit holds your date and the full balance is due 10 days before the course starts. Deposits are non-refundable.",
    });
  svc("course-lash-ext", "course", "Eyelash Extension course (Russian, Classic and Hybrid)",
    "Learn to apply Classic, Hybrid and Russian Volume extensions. Practical session and assessment included.",
    URLS.courses, { price: "£199", details: ["1 day training course"], note: COURSE_NOTE });
  svc("course-brow", "course", "Brow Lamination, Shaping and Tinting course",
    "Techniques, products and tools for a uniform, full eyebrow shape. Assessment included.",
    URLS.courses, { price: "£225", details: ["1 day course, 10am to 4pm"], note: COURSE_NOTE });
  svc("course-lash-lift", "course", "Lash Lift and Tint training course",
    "Techniques, products and tools for a professional lash lift and tint. Practical session and assessment included.",
    URLS.courses, {
      price: "£200",
      details: ["3 before-and-after case studies are required to complete the course"],
      note: COURSE_NOTE,
    });
  svc("course-microblading", "course", "Microblading for beginners course",
    "The semi-permanent microblading technique, with a practical session and assessment.",
    URLS.courses, { price: "£500", details: ["2 day training course"], note: COURSE_NOTE });
  svc("course-hair-ext", "course", "Hair Extension Training course",
    "Safely applying and removing five techniques: micro rings, nano rings, fusion bonds, tapes and celebrity weave.",
    URLS.courses, { price: "£500", details: ["3 day training course"], note: COURSE_NOTE });

  const CATEGORIES = {
    hair: {
      ids: ["haircare"],
      url: URLS.hair,
      intro: "Our hair services cover cut and finish, wash and style, colouring and extensions. Every visit begins with a one-to-one consultation about your hair type and the result you want.",
    },
    beauty: {
      ids: ["eyebrows", "eyelashes", "waxing", "facials", "massages", "makeup"],
      url: URLS.beauty,
      intro: "Here are our beauty services.",
    },
    aesthetics: {
      ids: ["bb-glow", "plasma", "mesotherapy", "rf-microneedling", "profound", "exilis", "hydrafacial", "scalp-pigmentation", "botox", "ipl", "ice-laser"],
      url: URLS.aesthetics,
      intro: "Our aesthetic treatments are provided by qualified practitioners, with a complimentary consultation from your first visit. Some of the most popular aesthetic treatments are available at our Yorkshire location, so please check availability for the treatment you want.\n\nResults vary from person to person, and a practitioner needs to assess what is suitable for you.",
    },
    skincare: {
      ids: ["facials", "hydrafacial", "bb-glow", "mesotherapy", "rf-microneedling"],
      url: URLS.beauty,
      intro: "These are our facial and skin treatments. A practitioner can advise at consultation on what suits your skin.",
    },
    massage: {
      ids: ["massages"],
      url: SITE + "/massages/",
      intro: "We offer different types of massage, including Swedish Deep Tissue and Indian Head and Shoulder.",
    },
    lashbrow: {
      ids: ["eyelashes", "eyebrows"],
      url: URLS.beauty,
      intro: "Here are our eyelash and eyebrow treatments.",
    },
    hairremoval: {
      ids: ["waxing", "ipl", "ice-laser"],
      url: URLS.beauty,
      intro: "We offer waxing, IPL and Ice Laser hair removal.",
    },
    makeup: {
      ids: ["makeup"],
      url: SITE + "/makeup-2/",
      intro: "Our qualified make-up artists create bespoke make-up packages and can also apply semi-permanent makeup.",
    },
    courses: {
      ids: ["course-spm", "course-lash-ext", "course-brow", "course-lash-lift", "course-microblading", "course-hair-ext"],
      url: URLS.courses,
      intro: "We run CPD-accredited beauty training courses. Prices below are the ones published on our website. A deposit is needed to hold your date, and the full balance is due 10 days before the course starts.",
    },
  };

  const SRC = "From the official website";

  /* =========================================================
   * 3. SMALL HELPERS (no unsafe HTML anywhere)
   * ========================================================= */

  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return n;
  }

  // External links always get safe attributes.
  function ext(href, text, cls) {
    return h("a", { href, class: cls || "", target: "_blank", rel: "noopener noreferrer" }, text);
  }

  const ICONS = {
    sparkle: '<path d="M12 2.5l1.9 5.9 5.9 1.9-5.9 1.9L12 18.1l-1.9-5.9L4.2 10.3l5.9-1.9z"/><path d="M19 15.5l.8 2.3 2.2.7-2.2.8L19 21.6l-.8-2.3-2.2-.8 2.2-.7z"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    restart: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  };
  function icon(name) {
    const tpl = document.createElement("template");
    tpl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      ICONS[name] + "</svg>"; // constant strings only, never user input
    return tpl.content.firstChild;
  }

  function timeStr() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function newId() {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : "s-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = () => window.matchMedia("(max-width: 520px)").matches;
  let uid = 0;

  // Paragraphs and "- " lists, rendered with textContent only.
  function richText(text) {
    const frag = document.createDocumentFragment();
    for (const block of String(text).split(/\n{2,}/)) {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
        frag.append(h("ul", null, lines.map((l) => h("li", { text: l.replace(/^\s*[-•]\s+/, "") }))));
      } else {
        frag.append(h("p", null, lines.flatMap((l, i) => (i ? [h("br"), l] : [l]))));
      }
    }
    return frag;
  }

  /* =========================================================
   * 4. STATE + DOM SHELL
   * ========================================================= */

  const state = {
    open: false,
    busy: false,
    sessionId: newId(),
    enquiry: null,
    lastChips: null,
    started: false,
    synced: false,
    controller: null,
    history: [], // recent chat turns sent to the backend so follow-up questions make sense
  };

  const host = h("div", { id: "selinas-chat-root" });
  host.style.visibility = "hidden"; // avoids unstyled flash until CSS arrives
  const root = host.attachShadow({ mode: "open" });

  const cssLink = h("link", { rel: "stylesheet", href: CONFIG.cssUrl });
  let revealed = false;
  const reveal = () => { if (!revealed) { revealed = true; host.style.visibility = "visible"; } };
  cssLink.addEventListener("load", reveal);
  cssLink.addEventListener("error", () => {
    console.error("[Selina's chat] styles.css failed to load from " + CONFIG.cssUrl + ". Keep it next to widget.js.");
  });
  root.append(cssLink);

  const launcher = h("button", {
    class: "launcher", type: "button",
    "aria-label": "Open chat with Selina's", "aria-expanded": "false",
    "aria-controls": "sb-panel", "aria-describedby": "sb-tip",
  }, icon("sparkle"));
  const dot = h("span", { class: "dot", "aria-hidden": "true" });
  launcher.append(dot);
  const tip = h("div", { class: "tip", id: "sb-tip", role: "tooltip" }, "Chat with Selina's");

  const restartBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Start a new conversation", title: "Start over" }, icon("restart"));
  const closeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Minimise chat", title: "Minimise" }, icon("down"));

  const log = h("div", { class: "log", role: "log", "aria-live": "polite", "aria-label": "Conversation", tabindex: "0" });

  const input = h("textarea", {
    rows: "1", placeholder: "Ask us anything...", maxlength: String(CONFIG.maxLength),
    "aria-label": "Type your message", enterkeyhint: "send", autocomplete: "off",
  });
  const sendBtn = h("button", { class: "send", type: "button", "aria-label": "Send message", disabled: true }, icon("send"));
  const count = h("p", { class: "count", hidden: true, "aria-live": "polite" });

  const panel = h("section", {
    class: "panel", id: "sb-panel", role: "dialog", "aria-label": "Selina's Beauty Assistant", "aria-modal": "false",
  },
    h("header", { class: "header" },
      h("span", { class: "avatar", "aria-hidden": "true" }, icon("sparkle")),
      h("div", { class: "titles" },
        h("h2", { class: "title" }, "Selina's Beauty Assistant"),
        h("p", { class: "subtitle" }, "Virtual assistant")),
      restartBtn, closeBtn),
    LIVE ? null : h("p", { class: "banner" }, "Demo mode: answers are pre-written from our website, not generated by an AI service."),
    log,
    h("div", { class: "composer" },
      h("div", { class: "composer-row" }, input, sendBtn),
      count),
    h("p", { class: "footer" },
      "Information provided by Selina's virtual assistant. ",
      ext(URLS.home, "Official website")));

  const app = h("div", { class: "app" }, launcher, tip, panel);
  root.append(app);
  panel.inert = true;

  /* =========================================================
   * 5. MESSAGE RENDERING
   * ========================================================= */

  function scrollToRow(row, toBottom) {
    const behavior = reducedMotion() ? "auto" : "smooth";
    const top = toBottom ? log.scrollHeight : Math.max(0, row.offsetTop - 12);
    log.scrollTo({ top, behavior });
  }

  function clearChips() {
    if (state.lastChips) { state.lastChips.remove(); state.lastChips = null; }
  }

  function renderChips(list) {
    const wrap = h("div", { class: "chips" });
    for (const item of list) {
      const label = typeof item === "string" ? item : item.label;
      wrap.append(h("button", {
        class: "chip", type: "button",
        onclick: () => {
          if (typeof item === "string") { handleUserText(item); return; }
          if (state.busy) return;
          clearChips(); addUser(item.label); item.run();
        },
      }, label));
    }
    return wrap;
  }

  function addUser(text) {
    clearChips();
    const row = h("div", { class: "row user" },
      h("div", { class: "stack" },
        h("div", { class: "bubble", text }),
        h("div", { class: "meta" }, timeStr())));
    log.append(row);
    scrollToRow(row, true);
    return row;
  }

  function addBot(text, o) {
    o = o || {};
    clearChips();
    const stack = h("div", { class: "stack" });
    if (text) stack.append(h("div", { class: "bubble" + (o.error ? " is-error" : "") }, richText(text)));
    for (const n of o.nodes || []) stack.append(n);
    if (o.suggestions && o.suggestions.length) {
      state.lastChips = renderChips(o.suggestions);
      stack.append(state.lastChips);
    }
    stack.append(h("div", { class: "meta" }, timeStr() + (o.meta ? ", " + o.meta : "")));
    const row = h("div", { class: "row bot" }, stack);
    log.append(row);
    scrollToRow(row, false);
    return row;
  }

  function addTyping() {
    const row = h("div", { class: "row bot" },
      h("div", { class: "stack" },
        h("div", { class: "bubble typing", role: "status" },
          h("span", { class: "visually-hidden" }, "The assistant is typing"),
          h("span"), h("span"), h("span"))));
    log.append(row);
    scrollToRow(row, true);
    return row;
  }

  /* =========================================================
   * 6. CARDS
   * ========================================================= */

  function priceNodes(s) {
    const nodes = [];
    let line;
    if (s.price) line = s.price;
    else if (s.quote) line = "Price on consultation";
    else line = "Contact us for pricing";
    nodes.push(h("p", { class: "card-price" }, line));
    if (s.details) nodes.push(h("ul", { class: "card-details" }, s.details.map((d) => h("li", { text: d }))));
    if (s.note) nodes.push(h("p", { class: "card-note" }, s.note));
    return nodes;
  }

  function serviceCard(s) {
    return 
