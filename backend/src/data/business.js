/**
 * Selina's Hair, Beauty & Aesthetics — Structured Verified Knowledge Base (Stage 2).
 *
 * Every fact in this file carries:
 *   - status: "verified" | "unknown"
 *   - source: canonical URL where the fact was checked (or null if not found on site)
 *   - lastVerified: ISO date string (YYYY-MM-DD) when the page was checked
 *
 * RULE: Never invent or guess values. Anything not explicitly published on the
 * official website or confirmed in writing by the salon owner MUST keep
 * value: null and status: "unknown".
 *
 * SECURITY: All strings in this file are treated as untrusted data when building
 * the AI prompt, never as executable instructions.
 */

const SITE = "https://selinashairandbeauty.co.uk";

export const URLS = Object.freeze({
  home: `${SITE}/`,
  hair: `${SITE}/hair-services/`,
  beauty: `${SITE}/beauty-services/`,
  aesthetics: `${SITE}/home/aesthetic-treatments/`,
  courses: `${SITE}/home/aesthetic-courses/`,
  contact: `${SITE}/contact_us/`,
});

export const BUSINESS_DATA = Object.freeze({
  business: {
    name: {
      value: "Selina's Hair, Beauty & Aesthetics",
      status: "verified",
      source: URLS.home,
      lastVerified: "2026-10-27",
    },
    website: {
      value: URLS.home,
      status: "verified",
      source: URLS.home,
      lastVerified: "2026-10-27",
    },
    email: {
      value: "ask@selinashairandbeauty.co.uk",
      status: "verified",
      note: "The contact page body text has a typo ('ask@selinashairandbeauty'), while the site footer across all pages lists the full address 'ask@selinashairandbeauty.co.uk'.",
      source: URLS.contact,
      lastVerified: "2026-10-27",
    },
    contactPage: {
      value: URLS.contact,
      status: "verified",
      note: "Includes an enquiry form for a free consultation or course admission.",
      source: URLS.contact,
      lastVerified: "2026-10-27",
    },
    about: {
      value:
        "Salon established in Manchester with over 40 years of experience in the beauty and skin industry, offering hair, beauty, health and aesthetic treatments, plus CPD-accredited beauty training courses.",
      status: "verified",
      source: URLS.home,
      lastVerified: "2026-10-27",
    },
    generalOpeningHours: {
      value: "Monday to Sunday, 10am to 6pm",
      status: "verified",
      note: "Listed on the website contact page, which does not state whether these hours apply to both Manchester and Yorkshire.",
      source: URLS.contact,
      lastVerified: "2026-10-27",
    },
    policies: {
      resultsDisclaimer: {
        value: "Actual results may vary on an individual basis.",
        status: "verified",
        source: URLS.home,
        lastVerified: "2026-10-27",
      },
      depositsPolicy: {
        value: "All deposits are non-refundable.",
        status: "verified",
        source: URLS.home,
        lastVerified: "2026-10-27",
      },
      aestheticsConsultation: {
        value: "Complimentary consultation from the first visit for aesthetic treatments.",
        status: "verified",
        source: URLS.home,
        lastVerified: "2026-10-27",
      },
      hairConsultation: {
        value: "Every hair visit begins with a one-to-one consultation before cutting or colouring.",
        status: "verified",
        source: URLS.hair,
        lastVerified: "2026-10-25",
      },
      courseBookingRequirements: {
        value:
          "To enquire about or book a course via the website contact form, provide your address, contact phone number, course name, and any previous qualifications in the message box. A deposit holds the course date and the full balance is due 10 days before the course starts.",
        status: "verified",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
      howToBook: {
        value:
          "Customers can enquire or book by telephoning the relevant salon location (Manchester 0161 256 4299, Yorkshire 07739660079), emailing ask@selinashairandbeauty.co.uk, or submitting the form on the website contact page. The assistant cannot book appointments.",
        status: "verified",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
    },
  },

  locations: [
    {
      id: "manchester",
      name: "Manchester",
      address: "8 Kingsway, Burnage, Manchester, M19 2DD",
      phone: "0161 256 4299",
      status: "verified",
      source: URLS.contact,
      lastVerified: "2026-10-27",
      openingHours: {
        value: null,
        status: "unknown",
        note: "Website contact page lists Monday to Sunday, 10am to 6pm generally, without confirming branch-specific hours.",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
      servicesOffered: {
        value: "Hair services, beauty treatments, aesthetic treatments, and CPD-accredited training courses.",
        status: "verified",
        source: URLS.home,
        lastVerified: "2026-10-27",
      },
      parking: {
        value: null,
        status: "unknown",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
      accessibility: {
        value: null,
        status: "unknown",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
    },
    {
      id: "yorkshire",
      name: "Yorkshire (Dewsbury)",
      address: "116 Hillcrest Road, Savile Town, Dewsbury, WF12 9NX",
      phone: "07739660079",
      status: "verified",
      source: URLS.contact,
      lastVerified: "2026-10-27",
      openingHours: {
        value: null,
        status: "unknown",
        note: "Website contact page lists Monday to Sunday, 10am to 6pm generally, without confirming branch-specific hours.",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
      servicesOffered: {
        value: null,
        status: "unknown",
        note: "The website states only that some of the most popular aesthetic treatments are available at the Yorkshire location. Exact treatment list is unconfirmed.",
        source: URLS.home,
        lastVerified: "2026-10-27",
      },
      parking: {
        value: null,
        status: "unknown",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
      accessibility: {
        value: null,
        status: "unknown",
        source: URLS.contact,
        lastVerified: "2026-10-27",
      },
    },
  ],

  categories: [
    {
      id: "hair",
      name: "Hair Services",
      description:
        "Cut and finish, wash and style, full-head colour, highlights and tints, roots colour, ombre or balayage, and hair extensions. Every visit begins with a one-to-one consultation.",
      status: "verified",
      source: URLS.hair,
      lastVerified: "2026-10-25",
    },
    {
      id: "beauty",
      name: "Beauty Services",
      description:
        "Eyebrow shaping, lamination and tinting, eyelash treatments, waxing, facials, therapeutic massages, bespoke makeup, and hair removal.",
      status: "verified",
      source: URLS.beauty,
      lastVerified: "2026-10-25",
    },
    {
      id: "aesthetic",
      name: "Aesthetic Treatments",
      description:
        "Non-surgical face and body treatments carried out by qualified practitioners, with a complimentary consultation from your first visit.",
      status: "verified",
      source: URLS.aesthetics,
      lastVerified: "2026-10-25",
    },
    {
      id: "course",
      name: "CPD-Accredited Beauty Training Courses",
      description:
        "Accredited training courses taught by qualified tutors with practical sessions and assessments.",
      status: "verified",
      source: URLS.courses,
      lastVerified: "2026-10-25",
    },
  ],

  services: [
    {
      id: "haircare",
      category: "hair",
      name: "Haircare: cut, colour, style and extensions",
      description:
        "Cut and finish, wash and style, full-head colour, highlights, roots and ombre or balayage, plus hair extensions. Every visit starts with a one-to-one consultation.",
      status: "verified",
      source: URLS.hair,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: "Prices depend on hair length and style and are quoted by the salon at consultation.",
        source: URLS.hair,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: URLS.hair,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "eyebrows",
      category: "beauty",
      name: "Eyebrow shaping, lamination and tinting",
      description:
        "Full, natural or striking brows using threading, waxing, tinting and brow lamination techniques.",
      status: "verified",
      source: `${SITE}/eyebrow-shaping-lamination-tinting/`,
      lastVerified: "2026-10-27",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/eyebrow-shaping-lamination-tinting/`,
        lastVerified: "2026-10-27",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/eyebrow-shaping-lamination-tinting/`,
        lastVerified: "2026-10-27",
      },
      details: [],
    },
    {
      id: "eyelashes",
      category: "beauty",
      name: "Eyelash lift, tint and extensions",
      description: "A range of eyelash treatments carried out by qualified beauticians.",
      status: "verified",
      source: `${SITE}/eyelashes/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/eyelashes/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/eyelashes/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "waxing",
      category: "beauty",
      name: "Waxing",
      description: "From smaller areas such as eyebrows or underarms through to a full body wax.",
      status: "verified",
      source: `${SITE}/waxing/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/waxing/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/waxing/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "facials",
      category: "beauty",
      name: "Facials",
      description:
        "Relaxing facials that moisturise, soften, unclog pores, exfoliate, stimulate circulation and deep clean the skin.",
      status: "verified",
      source: `${SITE}/facials/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/facials/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/facials/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "massages",
      category: "beauty",
      name: "Massages",
      description:
        "Relaxing, therapeutic massages, including Swedish Deep Tissue and Indian Head and Shoulder, and more.",
      status: "verified",
      source: `${SITE}/massages/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/massages/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/massages/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "makeup",
      category: "beauty",
      name: "Makeup",
      description:
        "Bespoke make-up packages. Our make-up artists can also apply semi-permanent makeup.",
      status: "verified",
      source: `${SITE}/makeup-2/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/makeup-2/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/makeup-2/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "bb-glow",
      category: "aesthetic",
      name: "BB Glow",
      description:
        "A facial and rejuvenation technique aimed at smoother, firmer, brighter-looking skin.",
      status: "verified",
      source: `${SITE}/bb-glow/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/bb-glow/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/bb-glow/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "plasma",
      category: "aesthetic",
      name: "Plasma Treatment",
      description:
        "Plasma Pen 'fibroblasting': a non-surgical procedure used for wrinkle softening, eyelid tightening and more.",
      status: "verified",
      source: `${SITE}/plasma/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/plasma/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/plasma/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "mesotherapy",
      category: "aesthetic",
      name: "Mesotherapy",
      description: "A gentle digital skin needling option.",
      status: "verified",
      source: `${SITE}/meso-needling-therapy/`,
      lastVerified: "2026-10-27",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/meso-needling-therapy/`,
        lastVerified: "2026-10-27",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/meso-needling-therapy/`,
        lastVerified: "2026-10-27",
      },
      details: [],
    },
    {
      id: "rf-microneedling",
      category: "aesthetic",
      name: "RF Microneedling",
      description:
        "A gold-plated needle device that delivers radio-frequency deep into the dermal layers of the skin.",
      status: "verified",
      source: `${SITE}/rf-microneedling-therapy/`,
      lastVerified: "2026-10-27",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/rf-microneedling-therapy/`,
        lastVerified: "2026-10-27",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/rf-microneedling-therapy/`,
        lastVerified: "2026-10-27",
      },
      details: [],
    },
    {
      id: "profound",
      category: "aesthetic",
      name: "Profound",
      description: "A non-surgical option for facial wrinkles and the appearance of cellulite.",
      status: "verified",
      source: `${SITE}/profound1/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/profound1/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/profound1/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "exilis",
      category: "aesthetic",
      name: "Exilis Elite",
      description:
        "A non-surgical treatment used to tighten skin and reduce fat on the face or body.",
      status: "verified",
      source: `${SITE}/exilis-elite/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/exilis-elite/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/exilis-elite/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "hydrafacial",
      category: "aesthetic",
      name: "Hydrafacial",
      description:
        "Cleanses, exfoliates and removes impurities from the skin using specialist technology.",
      status: "verified",
      source: `${SITE}/hydrafacial/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/hydrafacial/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/hydrafacial/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "scalp-pigmentation",
      category: "aesthetic",
      name: "Scalp Pigmentation",
      description:
        "Micro pigmentation that replicates hair follicles as a hair loss solution.",
      status: "verified",
      source: `${SITE}/scalp-pigmentation/`,
      lastVerified: "2026-10-27",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/scalp-pigmentation/`,
        lastVerified: "2026-10-27",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/scalp-pigmentation/`,
        lastVerified: "2026-10-27",
      },
      details: [],
    },
    {
      id: "botox",
      category: "aesthetic",
      name: "Botox",
      description:
        "Botulinum toxin injections that relax facial muscles to smooth lines such as crow's feet and frown lines.",
      status: "verified",
      source: `${SITE}/botox/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/botox/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/botox/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "ipl",
      category: "aesthetic",
      name: "IPL Hair Removal",
      description: "Intense Pulsed Light hair removal.",
      status: "verified",
      source: `${SITE}/ipl-hair-removal/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/ipl-hair-removal/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/ipl-hair-removal/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "ice-laser",
      category: "aesthetic",
      name: "Ice Laser Hair Removal",
      description:
        "Uses the Soprano ICE Platinum device to gradually heat the dermis and prevent hair growth.",
      status: "verified",
      source: `${SITE}/ice-laser-hair-removal/`,
      lastVerified: "2026-10-25",
      price: {
        value: null,
        status: "unknown",
        note: null,
        source: `${SITE}/ice-laser-hair-removal/`,
        lastVerified: "2026-10-25",
      },
      duration: {
        value: null,
        status: "unknown",
        source: `${SITE}/ice-laser-hair-removal/`,
        lastVerified: "2026-10-25",
      },
      details: [],
    },
    {
      id: "course-spm",
      category: "course",
      name: "Semi Permanent Makeup course",
      description:
        "CPD accredited with employability certification. Book by the day or take the full course.",
      status: "verified",
      source: URLS.courses,
      lastVerified: "2026-10-25",
      price: {
        value: "From £995, or £3,995 for all areas",
        status: "verified",
        note: "A deposit holds your date and the full balance is due 10 days
