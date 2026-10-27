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
   * 2. VERIFIED BUSINESS DATA
   * Source: https://selinashairandbeauty.co.uk/ (pages checked 25 Oct 2026).
   * Anything not found there is left out. Re-check before going live.
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
    "Cut and finish, wash and style, full-head colour, highlights, roots and ombre or balayage. Every visit starts with a one-to-one consultation.",
    URLS.hair, { quote: true, note: "Prices depend on hair length and style." });

  svc("eyebrows", "beauty", "Eyebrow shaping, lamination and tinting",
    "Full, natural or striking brows using the most popular eyebrow techniques.",
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
    controller: null,
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
    return h("article", { class: "card" },
      s.img && /^https:\/\//.test(s.img) ? h("img", { src: s.img, alt: "", loading: "lazy" }) : null,
      h("h3", { class: "card-title" }, s.name),
      h("p", { class: "card-desc" }, s.desc),
      priceNodes(s),
      h("div", { class: "card-actions" },
        ext(s.url, "Learn more", "btn btn-ghost"),
        h("button", {
          class: "btn btn-solid", type: "button",
          onclick: () => {
            if (state.busy) return;
            clearChips(); addUser("Enquire about " + s.name); startEnquiry(s.id);
          },
        }, s.group === "course" ? "Course enquiry" : "Enquire")));
  }

  function linkRow(url, text) {
    return h("p", { class: "link-row" }, ext(url, text));
  }

  function telHref(p) { return "tel:" + p.replace(/\s+/g, ""); }
  function mapsHref(address) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
  }

  function contactCard() {
    return h("article", { class: "card" },
      BUSINESS.locations.map((l) =>
        h("div", { class: "place" },
          h("h3", { class: "place-name" }, l.name),
          h("address", null, l.address),
          h("div", { class: "place-links" },
            h("a", { class: "btn btn-solid", href: telHref(l.phone) }, "Call " + l.phone),
            ext(mapsHref(l.address), "Directions", "btn btn-ghost")))),
      h("p", { class: "card-note" }, BUSINESS.hours),
      h("div", { class: "place-links" },
        h("a", { class: "btn btn-ghost", href: "mailto:" + BUSINESS.email }, "Email us"),
        ext(URLS.contact, "Contact page", "btn btn-ghost")));
  }

  /* =========================================================
   * 7. LOCAL INFORMATION FLOWS (verified website info, no AI)
   * ========================================================= */

  const MAIN_MENU = [
    "Explore Treatments", "Hair Services", "Beauty & Skincare", "Aesthetic Treatments",
    "Beauty Training Courses", "Treatment Prices", "Book a Consultation", "Contact the Salon",
  ];
  const AFTER_INFO = ["Treatment Prices", "Book a Consultation", "Contact the Salon", "Main menu"];

  function showCategory(key, intro, follow) {
    const cat = CATEGORIES[key];
    addBot(intro || cat.intro, {
      nodes: [...cat.ids.map((id) => serviceCard(SERVICES[id])), linkRow(cat.url, "See this on our website")],
      suggestions: follow || AFTER_INFO,
      meta: SRC,
    });
  }

  const ACTIONS = {
    "main menu": () => addBot("What would you like to explore?", { suggestions: MAIN_MENU, meta: SRC }),
    "explore treatments": () => addBot(
      "We offer hair services, beauty treatments, aesthetic treatments and CPD-accredited beauty training courses.\n\nWhich would you like to explore?",
      { suggestions: ["Hair Services", "Beauty & Skincare", "Aesthetic Treatments", "Beauty Training Courses"], meta: SRC }),
    "hair services": () => showCategory("hair"),
    "beauty & skincare": () => addBot(
      "We offer a range of beauty services, including eyebrow treatments, eyelash treatments, waxing, facials, massage and makeup.\n\nWould you like to explore a particular treatment?",
      { suggestions: ["Explore Facials", "Eyelash Treatments", "Massage Services", "View Beauty Services"], meta: SRC }),
    "view beauty services": () => showCategory("beauty"),
    "explore facials": () => showCategory("skincare"),
    "eyelash treatments": () => showCategory("lashbrow"),
    "massage services": () => showCategory("massage"),
    "hair removal": () => showCategory("hairremoval"),
    "makeup": () => showCategory("makeup"),
    "aesthetic treatments": () => showCategory("aesthetics"),
    "beauty training courses": () => showCategory("courses", null, ["Book a Consultation", "Contact the Salon", "Main menu"]),
    "treatment prices": showPrices,
    "book a consultation": () => startEnquiry(),
    "contact the salon": () => addBot(
      "You can reach either location directly, or send us a message through the website.",
      { nodes: [contactCard()], suggestions: ["Book a Consultation", "Main menu"], meta: SRC }),
  };

  function showPrices() {
    addBot(
      "This is what I can confirm from our website:\n\n" +
      "- Hair cutting and colouring: prices depend on hair length and style, and are quoted at consultation.\n" +
      "- Courses: Eyelash Extension £199, Lash Lift and Tint £200, Brow Lamination, Shaping and Tinting £225, Microblading for beginners £500, Hair Extension Training £500. Semi Permanent Makeup is £995 to £1,995 per day, or £3,995 for the full course.\n" +
      "- Beauty and aesthetic treatments: I don't have verified prices, so please contact the salon for a quote.\n\n" +
      "Deposits are non-refundable, as stated on our website.",
      { suggestions: ["Beauty Training Courses", "Contact the Salon", "Book a Consultation"], meta: SRC });
  }

  function medicalReply() {
    addBot(
      "I can't advise on medical questions or on whether a treatment is suitable for you. A qualified practitioner needs to assess that in person.\n\nThe salon offers a free consultation, and you can call either location to talk it through.",
      { suggestions: ["Book a Consultation", "Contact the Salon"], meta: SRC });
  }

  /* ---------- Demo-mode keyword router (clearly labelled, never presented as AI) ---------- */

  const INTENTS = [
    [/(suitab|safe\b|safety|pregnan|allerg|medical|medication|diagnos|reaction|side effect|eczema|psoriasis|guarantee)/i, "__medical"],
    [/(\bprice|\bcost|how much|\bfees?\b|£)/i, "treatment prices"],
    [/(\bbook|appointment|consult|enquir|inquir|reserve)/i, "book a consultation"],
    [/(contact|phone|\bcall\b|email|address|\bwhere\b|location|direction|\bopen|hours|manchester|yorkshire|dewsbury|burnage)/i, "contact the salon"],
    [/(course|train|\blearn|\bcpd|qualif)/i, "beauty training courses"],
    [/(botox|aesthetic|bb glow|plasma|meso|microneedl|profound|exilis|scalp|filler)/i, "aesthetic treatments"],
    [/(\bwax|\bipl\b|laser|hair removal)/i, "hair removal"],
    [/(massage)/i, "massage services"],
    [/(lash|brow)/i, "eyelash treatments"],
    [/(facial|hydrafacial|skin)/i, "explore facials"],
    [/(make.?up|bridal)/i, "makeup"],
    [/(hair|colour|color|\bcut\b|style|balayage|highlight|extension)/i, "hair services"],
    [/(treatment|service|offer)/i, "explore treatments"],
  ];

  function demoRespond(text) {
    for (const [re, key] of INTENTS) {
      if (re.test(text)) {
        if (key === "__medical") return medicalReply();
        return ACTIONS[key]();
      }
    }
    addBot(
      "I'm in demo mode, so I can't answer open questions yet. I can share what is published on our website, or you can contact the salon directly.",
      { suggestions: MAIN_MENU, meta: "Demo mode" });
  }

  /* =========================================================
   * 8. BACKEND CLIENT
   * Request:  POST { message, sessionId }
   * Response: { reply: string, suggestions?: string[] }
   * ========================================================= */

  async function callBackend(text) {
    const ctrl = new AbortController();
    state.controller = ctrl;
    const timer = setTimeout(() => ctrl.abort("timeout"), CONFIG.timeoutMs);
    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: state.sessionId }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("http");
      const data = await res.json();
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("shape");
      return {
        reply: data.reply.slice(0, 3000),
        suggestions: Array.isArray(data.suggestions)
          ? data.suggestions.filter((s) => typeof s === "string" && s.trim()).map((s) => s.slice(0, 60)).slice(0, 6)
          : [],
      };
    } finally {
      clearTimeout(timer);
      if (state.controller === ctrl) state.controller = null;
    }
  }

  async function askBackend(text) {
    state.busy = true; syncComposer();
    const typing = addTyping();
    try {
      const out = await callBackend(text);
      typing.remove();
      addBot(out.reply, { suggestions: out.suggestions, meta: "Virtual assistant" });
    } catch (e) {
      typing.remove();
      if (e && e.name === "AbortError" && state.controller === null && state.aborted) return; // user restarted
      // Generic message only: never expose server details.
      addBot("We couldn't get a reply just now. Check your connection and try again, or call the salon on " +
        BUSINESS.locations[0].phone + ".", {
        error: true,
        nodes: [h("div", { class: "chips" },
          h("button", { class: "chip", type: "button", onclick: (ev) => { ev.currentTarget.closest(".row").remove(); askBackend(text); } }, "Try again"))],
        meta: "Connection problem",
      });
    } finally {
      state.busy = false; state.aborted = false; syncComposer();
    }
  }

  /* =========================================================
   * 9. SENDING
   * ========================================================= */

  function handleUserText(raw) {
    const text = String(raw || "").trim().slice(0, CONFIG.maxLength);
    if (!text || state.busy) return;
    addUser(text);
    const action = ACTIONS[text.toLowerCase()];
    if (action) return action();
    if (!LIVE) return demoRespond(text);
    return askBackend(text);
  }

  function syncComposer() {
    const len = input.value.length;
    sendBtn.disabled = state.busy || !input.value.trim();
    input.disabled = state.busy;
    if (len > CONFIG.maxLength * 0.8) {
      count.hidden = false;
      count.textContent = len + " of " + CONFIG.maxLength + " characters";
    } else {
      count.hidden = true;
    }
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }

  function submitInput() {
    if (state.busy || !input.value.trim()) return;
    const text = input.value;
    input.value = ""; autosize(); syncComposer();
    handleUserText(text);
    if (!smallScreen()) input.focus();
  }

  input.addEventListener("input", () => { autosize(); syncComposer(); });
  input.addEventListener("keydown", (e) => {
    // Enter sends; Shift+Enter adds a new line. Don't hijack IME composition.
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); submitInput(); }
  });
  sendBtn.addEventListener("click", submitInput);

  /* =========================================================
   * 10. ENQUIRY FLOW (no appointment is ever claimed as booked)
   * ========================================================= */

  function serviceOptions(selected) {
    const groups = [
      ["Hair", "hair"], ["Beauty", "beauty"], ["Aesthetic treatments", "aesthetic"], ["Training courses", "course"],
    ];
    const out = [h("option", { value: "" }, "Choose a service")];
    for (const [label, g] of groups) {
      out.push(h("optgroup", { label },
        Object.values(SERVICES).filter((s) => s.group === g).map((s) =>
          h("option", { value: s.id, selected: s.id === selected }, s.name))));
    }
    out.push(h("option", { value: "general", selected: selected === "general" }, "Not sure yet / general enquiry"));
    return out;
  }
  const serviceLabel = (id) => (id === "general" ? "Not sure yet / general enquiry" : SERVICES[id] ? SERVICES[id].name : "Not chosen");
  const locationLabel = (id) => {
    const l = BUSINESS.locations.find((x) => x.id === id);
    return l ? l.name : id === "any" ? "No preference" : "Not chosen";
  };
  const KINDS = { consultation: "Request a free consultation", appointment: "Enquire about an appointment" };

  function startEnquiry(prefId) {
    state.enquiry = { kind: "", service: prefId || "", location: "", name: "", email: "", phone: "", message: "" };
    addBot("I can help you prepare an enquiry. It takes three quick questions and a short form. Nothing is booked by this chat.", { meta: SRC });
    prefId ? askLocation() : askService();
  }

  function askService() {
    const id = "sb-f" + ++uid;
    const sel = h("select", { id, "aria-label": "Service of interest" }, serviceOptions(""));
    const note = h("p", { class: "field-error", "aria-live": "polite" });
    const card = h("div", { class: "card form" },
      h("div", { class: "field" }, h("label", { for: id }, "Service of interest"), sel, note),
      h("button", {
        class: "btn btn-solid", type: "button",
        onclick: () => {
          if (!sel.value) { note.textContent = "Please choose a service, or pick 'Not sure yet'."; sel.setAttribute("aria-invalid", "true"); sel.focus(); return; }
          state.enquiry.service = sel.value;
          addUser(serviceLabel(sel.value));
          askLocation();
        },
      }, "Next"));
    addBot("Which service are you interested in?", { nodes: [card] });
  }

  function askLocation() {
    const pick = (id) => ({ label: id === "any" ? "No preference" : locationLabel(id), run: () => { state.enquiry.location = id; askKind(); } });
    addBot("Which location would you prefer?", { suggestions: [pick("manchester"), pick("yorkshire"), pick("any")] });
  }

  function askKind() {
    const pick = (k) => ({ label: KINDS[k], run: () => { state.enquiry.kind = k; showForm(); } });
    addBot("Would you like to request a consultation, or enquire about an appointment?", { suggestions: [pick("consultation"), pick("appointment")] });
  }

  function enquiryText(e) {
    return [
      "Enquiry for " + BUSINESS.name,
      "Type: " + (KINDS[e.kind] || "Not chosen"),
      "Service: " + serviceLabel(e.service),
      "Preferred location: " + locationLabel(e.location),
      "Name: " + e.name,
      "Email: " + e.email,
      "Phone: " + (e.phone || "Not provided"),
      "Message: " + (e.message || "None"),
    ].join("\n");
  }

  function validate(e) {
    const err = {};
    if (e.name.trim().length < 2) err.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email.trim())) err.email = "Please enter a valid email address, like name@example.com.";
    if (e.phone.trim() && !/^[+\d][\d\s()-]{6,19}$/.test(e.phone.trim())) err.phone = "Please check the phone number, or leave it blank.";
    if (!e.service) err.service = "Please choose a service.";
    if (!e.location) err.location = "Please choose a location.";
    if (!e.kind) err.kind = "Please choose an enquiry type.";
    if (e.message.length > 500) err.message = "Please keep your message under 500 characters.";
    return err;
  }

  function showForm() {
    const card = h("div", { class: "card" });
    addBot("Thank you. Please add your details so the salon knows how to reach you.", { nodes: [card] });
    renderForm(card);
  }

  function renderForm(card) {
    const e = state.enquiry;
    const ids = { name: "sb-f" + ++uid, email: "sb-f" + ++uid, phone: "sb-f" + ++uid, service: "sb-f" + ++uid, location: "sb-f" + ++uid, kind: "sb-f" + ++uid, message: "sb-f" + ++uid };
    const errs = {};
    const mkErr = (k) => (errs[k] = h("p", { class: "field-error", id: ids[k] + "-e", "aria-live": "polite" }));

    const f = {
      name: h("input", { id: ids.name, type: "text", autocomplete: "name", maxlength: "80", value: e.name, "aria-describedby": ids.name + "-e" }),
      email: h("input", { id: ids.email, type: "email", autocomplete: "email", inputmode: "email", maxlength: "120", value: e.email, "aria-describedby": ids.email + "-e" }),
      phone: h("input", { id: ids.phone, type: "tel", autocomplete: "tel", inputmode: "tel", maxlength: "20", value: e.phone, "aria-describedby": ids.phone + "-e" }),
      service: h("select", { id: ids.service, "aria-describedby": ids.service + "-e" }, serviceOptions(e.service)),
      location: h("select", { id: ids.location, "aria-describedby": ids.location + "-e" },
        h("option", { value: "" }, "Choose a location"),
        BUSINESS.locations.map((l) => h("option", { value: l.id, selected: e.location === l.id }, l.name)),
        h("option", { value: "any", selected: e.location === "any" }, "No preference")),
      kind: h("select", { id: ids.kind, "aria-describedby": ids.kind + "-e" },
        h("option", { value: "" }, "Choose an enquiry type"),
        Object.entries(KINDS).map(([k, v]) => h("option", { value: k, selected: e.kind === k }, v))),
      message: h("textarea", { id: ids.message, maxlength: "500", "aria-describedby": ids.message + "-e" }),
    };
    f.message.value = e.message;

    const field = (k, label, optional, hint) =>
      h("div", { class: "field" },
        h("label", { for: ids[k] }, label, optional ? h("span", { class: "opt" }, " (optional)") : null),
        f[k], hint ? h("p", { class: "hint" }, hint) : null, mkErr(k));

    const courseHint = h("p", { class: "notice", hidden: true },
      "For courses, the salon also asks for your address, phone number and any previous qualifications in your message.");
    const syncCourse = () => { courseHint.hidden = !(SERVICES[f.service.value] && SERVICES[f.service.value].group === "course"); };
    f.service.addEventListener("change", syncCourse);

    const collect = () => Object.assign(e, {
      name: f.name.value, email: f.email.value, phone: f.phone.value, service: f.service.value,
      location: f.location.value, kind: f.kind.value, message: f.message.value,
    });

    const review = () => {
      collect();
      const problems = validate(e);
      let first = null;
      for (const k of Object.keys(f)) {
        const bad = problems[k];
        errs[k].textContent = bad || "";
        if (bad) { f[k].setAttribute("aria-invalid", "true"); first = first || f[k]; } else f[k].removeAttribute("aria-invalid");
      }
      if (first) { first.focus(); return; }
      renderReview(card);
    };

    card.replaceChildren(
      h("div", { class: "form" },
        field("service", "Service of interest"),
        field("location", "Preferred location"),
        field("kind", "Enquiry type"),
        courseHint,
        field("name", "Your name"),
        field("email", "Email address"),
        field("phone", "Phone number", true),
        field("message", "Message", true),
        h("p", { class: "hint" }, "Please don't include health or payment details. We only use what you enter here to prepare your enquiry."),
        h("button", { class: "btn btn-solid", type: "button", onclick: review }, "Review enquiry")));
    syncCourse();
  }

  function renderReview(card) {
    const e = state.enquiry;
    const row = (k, v) => [h("dt", null, k), h("dd", null, v)];
    card.replaceChildren(
      h("div", { class: "form" },
        h("h3", { class: "card-title" }, "Check your enquiry"),
        h("dl", { class: "summary" },
          row("Type", KINDS[e.kind]), row("Service", serviceLabel(e.service)), row("Location", locationLabel(e.location)),
          row("Name", e.name), row("Email", e.email), row("Phone", e.phone || "Not provided"), row("Message", e.message || "None")),
        e.location === "yorkshire"
          ? h("p", { class: "notice" }, "Some services are only available at certain locations. Please confirm your chosen service is offered at the Yorkshire location.")
          : null,
        h("div", { class: "card-actions" },
          h("button", { class: "btn btn-ghost", type: "button", onclick: () => renderForm(card) }, "Edit details"),
          h("button", { class: "btn btn-solid", type: "button", onclick: (ev) => finishEnquiry(card, ev.currentTarget) }, "Continue"))));
  }

  async function finishEnquiry(card, btn) {
    const e = state.enquiry;
    if (isConfigured(CONFIG.enquiryUrl)) {
      btn.disabled = true; btn.textContent = "Sending...";
      try {
        const res = await fetch(CONFIG.enquiryUrl, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId, enquiry: e }),
        });
        if (!res.ok) throw new Error("http");
        card.replaceChildren(h("div", { class: "form" },
          h("h3", { class: "card-title" }, "Enquiry sent"),
          h("p", null, "Thank you. The salon will contact you using the details you gave. This is an enquiry, not a confirmed appointment.")));
        addBot("Is there anything else I can help with?", { suggestions: ["Main menu", "Contact the Salon"] });
        return;
      } catch (err) {
        btn.disabled = false; btn.textContent = "Continue";
        addBot("Your enquiry could not be sent. You can still contact the salon using the options in your enquiry card.", { error: true });
      }
    }
    renderNotSent(card);
  }

  function renderNotSent(card) {
    const e = state.enquiry;
    const text = enquiryText(e);
    const subject = "Enquiry: " + serviceLabel(e.service);
    const status = h("p", { class: "hint", role: "status" });
    card.replaceChildren(h("div", { class: "form" },
      h("h3", { class: "card-title" }, "Your enquiry has not been sent yet"),
      h("p", null, "This chat can't book appointments or send messages to the salon on its own. To make your enquiry, send it through one of the salon's own channels:"),
      h("div", { class: "card-actions" },
        h("a", { class: "btn btn-solid", href: "mailto:" + BUSINESS.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text) }, "Email this enquiry"),
        h("button", { class: "btn btn-ghost", type: "button", onclick: () => copyText(text, status) }, "Copy enquiry text")),
      h("div", { class: "card-actions" },
        BUSINESS.locations.map((l) => h("a", { class: "btn btn-ghost", href: telHref(l.phone) }, "Call " + l.name))),
      h("p", { class: "link-row" }, ext(URLS.contact, "Use the contact form on the website")),
      status));
    addBot("Once the salon replies to your enquiry, they can confirm availability and any booking details.", { suggestions: ["Main menu", "Contact the Salon"] });
  }

  async function copyText(text, status) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied. You can paste it into a message or email.";
    } catch (err) {
      status.textContent = "Couldn't copy automatically. Please use the email button instead.";
    }
  }

  /* =========================================================
   * 11. OPEN / CLOSE / RESET / VIEWPORT
   * ========================================================= */

  function welcome() {
    addBot(
      "Welcome to Selina's!\n\nI'm here to help you explore our hair, beauty and aesthetic treatments, discover our training courses, and find the information you need.\n\nHow can I help you today?",
      { suggestions: MAIN_MENU });
  }

  // Keep the sheet inside the visible area when the Android keyboard opens.
  function syncViewport() {
    const vv = window.visualViewport;
    if (!state.open || !smallScreen() || !vv) {
      panel.style.removeProperty("height"); panel.style.removeProperty("top");
      return;
    }
    panel.style.height = vv.height + "px";
    panel.style.top = vv.offsetTop + "px";
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport);
    window.visualViewport.addEventListener("scroll", syncViewport);
  }
  window.addEventListener("resize", syncViewport);

  function open() {
    if (state.open) return;
    state.open = true;
    panel.inert = false;
    panel.classList.add("is-open");
    app.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    dot.hidden = true;
    tip.classList.remove("show");
    if (!state.started) { state.started = true; welcome(); }
    syncViewport();
    setTimeout(() => {
      if (window.matchMedia("(pointer: fine)").matches) input.focus(); // avoid popping the keyboard on phones
      else log.focus({ preventScroll: true });
    }, 60);
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    panel.classList.remove("is-open");
    app.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    panel.inert = true;
    syncViewport();
    launcher.focus({ preventScroll: true });
  }

  function reset() {
    if (state.controller) { state.aborted = true; state.controller.abort(); }
    state.busy = false; state.enquiry = null; state.lastChips = null;
    state.sessionId = newId();
    log.replaceChildren();
    input.value = ""; autosize(); syncComposer();
    welcome();
  }

  launcher.addEventListener("click", () => (state.open ? close() : open()));
  closeBtn.addEventListener("click", close);
  restartBtn.addEventListener("click", reset);
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  /* =========================================================
   * 12. MOUNT
   * ========================================================= */

  function mount() {
    document.body.append(host);
    // Gentle one-time hint, only while the chat has never been opened.
    setTimeout(() => { if (!state.started && revealed) { tip.classList.add("show"); setTimeout(() => tip.classList.remove("show"), 5000); } }, 4000);
  }
  // Only reveal once CSS is ready; fall back after 4s so a slow CDN doesn't hide the widget forever.
  setTimeout(() => { if (cssLink.sheet) reveal(); }, 4000);

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  window.SelinasChat = { open, close, toggle: () => (state.open ? close() : open()), reset, isDemoMode: !LIVE };
})();
