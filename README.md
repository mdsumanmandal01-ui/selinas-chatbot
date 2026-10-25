# Selina's Beauty Assistant: chat widget frontend

A floating chat widget for **Selina's Hair, Beauty & Aesthetics** (https://selinashairandbeauty.co.uk/).
Plain HTML, CSS and JavaScript. No frameworks, no build step, no API keys.

> **Status: demo.** This was built without the business's approval, as a learning and sales demo.
> Do not install it on the real website until the owner agrees.

## Files

| File | Purpose |
|---|---|
| `widget.js` | The whole widget: UI, verified business data, demo mode, enquiry flow, backend client |
| `styles.css` | Widget styles. Loaded inside the widget's Shadow DOM, so it cannot affect the host site |
| `index.html` | A neutral test page that loads the widget (not the salon's site) |
| `README.md` | This file |

`widget.js` finds `styles.css` automatically if both files are in the same folder.

## Run it locally

You need a tiny web server, because browsers block some features on `file://` pages.

- **Laptop:** in the project folder run `python3 -m http.server 8080`, then open `http://localhost:8080`.
- **Android only:** skip local running and publish the files (next section), then open the link in Chrome.
  (Advanced option: install Termux, run the same Python command, open `http://localhost:8080`.)

## Publish the static files (free, phone-friendly)

GitHub Pages works from a phone browser:

1. Create a GitHub account and a new **public** repository, e.g. `selinas-chatbot`.
2. Use "Add file" then "Upload files" to upload `index.html`, `styles.css`, `widget.js`, `README.md`.
3. Repository **Settings**, then **Pages**, then deploy from the `main` branch, root folder.
4. After a minute your files live at `https://YOUR-USERNAME.github.io/selinas-chatbot/`.

Cloudflare Pages and Netlify also work. Keep `widget.js` and `styles.css` in the same folder.

## Configure the backend endpoint

The widget is in **demo mode** until it has a backend address. Three ways to set one (first found wins):

1. Script attribute: `data-api-url="https://YOUR-BACKEND.example/chat"`
2. Before the script: `<script>window.SelinasChatConfig = { apiUrl: "https://YOUR-BACKEND.example/chat" };</script>`
3. Edit `const API_URL = "YOUR_BACKEND_ENDPOINT";` at the top of `widget.js`

Optional: `data-enquiry-url` (or `enquiryUrl`) is an endpoint that receives the enquiry form as JSON.

**Never put an AI API key in any of these files.** Keys belong on the backend only.

### What the backend must accept and return

These are example shapes, not a working API. No backend exists yet.

```
POST /chat
{ "message": "What treatments do you offer?", "sessionId": "random-id" }

200 OK
{ "reply": "We offer a range of hair and beauty services.",
  "suggestions": ["Explore Hair Services", "View Beauty Treatments"] }
```

Backend checklist before going live:
- Keep the API key as a server secret.
- Allow only the salon's website origin (CORS), and rate-limit per visitor.
- Answer only from verified salon information, and never invent prices, availability or qualifications.
- Don't give medical advice or promise results.
- Return generic errors (no stack traces or internals).
- Don't log personal data longer than needed.

## Embed it on a website

Upload the files somewhere public, then give the site owner this one line to paste before `</body>`:

```html
<script src="https://YOUR-USERNAME.github.io/selinas-chatbot/widget.js" defer
        data-api-url="https://YOUR-BACKEND.example/chat"></script>
```

Leave out `data-api-url` to keep demo mode. If the site has a strict Content-Security-Policy, the owner must allow your script host and your backend.

Page controls (optional): `SelinasChat.open()`, `.close()`, `.toggle()`, `.reset()`.

## Test on Android Chrome

1. Open your published link in Chrome. Tap the round button, bottom-right.
2. Check the demo banner shows, and all 8 chips open cards or messages.
3. Tap each course and check the prices against the website's Courses page.
4. Run the enquiry flow. It must end with "Your enquiry has not been sent yet" and never say booked.
5. Open the keyboard in the message box: the input and send button must stay visible.
6. Scroll the page, rotate the phone, press the back gesture, turn on Android "Remove animations": all should behave.
7. Try a message with `<b>test</b>`: it must appear as plain text.
8. Turn on airplane mode in live mode: you should see a friendly error with "Try again".

## Features that work WITHOUT a backend

- Floating launcher, tooltip, notification dot, open/close, restart, Esc to close
- Welcome message, 8 quick-action chips, follow-up chips
- Service and course cards with links to the official pages
- Published course prices; "Price on consultation" for hair; "Contact us for pricing" otherwise
- Contact card: both locations, tap-to-call, directions, email, opening hours
- Enquiry flow with validation and review step, ending in email, copy-text, call or website-form options
- Keyword-based **demo replies**, clearly labelled as demo mode and not AI
- Responsive layout, keyboard-safe on mobile, reduced-motion support, accessible controls

## Features that REQUIRE a real backend (not built, not tested)

- Real AI answers to open questions
- Sending the enquiry straight to the salon (needs an enquiry endpoint)
- Appointment booking, availability, rescheduling, cancellations (needs the salon's booking or calendar system)
- Voice input and spoken replies
- Human handoff and multilingual replies

## Information accuracy

Business details and prices come from the official site, pages checked on 25 October 2026.
Verified: the homepage, Haircare, Beauty Services, Aesthetic Treatments, Courses and Contact pages.
Not verified: individual treatment pages (so no treatment prices are shown) and the per-location opening hours.

Notes:
- The Aesthetic Treatments page's canonical address is `/home/aesthetic-treatments/`, which the widget uses.
- The contact page body shows the email without its domain ending. The full address, `ask@selinashairandbeauty.co.uk`, appears in the site footer and is used here.
- Hair service prices exist on the Haircare page but were not readable when checked, so the widget says "Price on consultation", matching the page's note that prices depend on hair length and style.

Re-check the site before each client demo. Prices and pages change.

## Privacy and safety

- Messages and enquiry details stay in memory in the browser. Nothing is saved to cookies, localStorage or sessionStorage, and closing the tab clears them.
- The widget does not collect payment information, and asks users not to share health details.
- Visitor text is always rendered as plain text, never as HTML.
- External links open in a new tab with `rel="noopener noreferrer"`.
- Before live use with real visitors in the UK, the business needs a privacy notice covering the chatbot and any backend that processes messages (UK GDPR), and should tell visitors they are talking to a virtual assistant.
- The widget never claims an appointment is booked.

## Customise the look

Edit the `--sb-*` variables at the top of `styles.css` (colours, fonts, radii, shadows, spacing).
For a different client, update the `BUSINESS`, `SERVICES` and `CATEGORIES` blocks in `widget.js`.
