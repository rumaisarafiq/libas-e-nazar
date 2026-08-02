# Libas-e-Nazar — AI-Assisted Pose-Aware Virtual Garment Preview System

Frontend for a Final Year Project: an AI-assisted virtual try-on system for
men's Eastern and Western clothing. Built with React (Vite) and Tailwind CSS,
now connected to a real FastAPI backend (via `src/api/apiConfig.js` and
`src/api/tryOnApi.js`).

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Backend connection

`src/api/apiConfig.js` points at your backend:

```js
export const API_URL = "https://swerve-wow-control.ngrok-free.dev";
export const POLL_INTERVAL_MS = 5000;
export const MAX_POLL_ATTEMPTS = 60;
```

Update `API_URL` whenever your ngrok tunnel (or real server URL) changes —
free ngrok URLs rotate every time you restart the tunnel.

`src/api/tryOnApi.js` implements the actual calls:

- `urlToFile(path, filename)` — turns a local asset path (e.g. a garment image
  under `public/clothes/`) into a `File`, so it can be uploaded as
  `multipart/form-data`.
- `submitOutfitJob({ modelFile, shirtFile, trouserFile })` → `POST /tryon/outfit`,
  returns a `job_id`.
- `submitCoatJob({ previousJobId, coatFile })` → `POST /tryon/coat`, layers a
  coat on top of a previous result, returns a new `job_id`.
- `pollForResult(jobId, onStageUpdate)` → polls `GET /result/:jobId` every
  `POLL_INTERVAL_MS` until the backend reports `status: "done"` (or `"error"`),
  calling `onStageUpdate(stage)` on every poll so the UI can show live progress.
- `getDownloadUrl(filename)` → builds the `GET /download/:filename` URL used
  directly as the result `<img src>`.

## How the Try-On flow uses the backend

In `src/pages/TryOn.jsx`, clicking **Try On**:

1. Converts the current model photo + selected garment(s) into `File` objects
   with `urlToFile`.
2. Calls `submitOutfitJob` to kick off generation.
3. Polls with `pollForResult`, showing the backend's live `stage` text in the
   loading screen.
4. On success, builds the result image URL with `getDownloadUrl` and shows it
   in `ResultScreen`.

**Western wear**: sends the selected top as `shirt_image` and the selected
bottom as `trouser_image`. If you only pick one, the other silently falls
back to a default (white shirt / black trousers) — nothing is auto-selected
or shown as "chosen" until you actually pick it.

**Eastern wear**: the single selected garment (kurta, sherwani, etc.) is sent
as `shirt_image`. Since the backend requires a `trouser_image` on every
request, a default pair of trousers is attached silently behind the scenes —
Eastern wear has no separate bottom category to choose from.

**Coat step**: once a result comes back, `ResultScreen` shows a row of coat
options (Suit Coats / Coats & Jackets / Waistcoats for Western, Prince Coat /
Waistcoat for Eastern). Picking one calls `submitCoatJob` with the previous
`job_id`, polls again, and swaps in the new layered result.

⚠️ This code was written and build-tested against your provided
`apiConfig.js` / `tryOnApi.js`, but it could **not** be tested live against
your ngrok server from this sandbox (that domain isn't reachable from here).
Test the full flow against your running backend and let me know if the
response shape differs from what's expected (`job_id`, `stage`, `status`,
`final_saved_as`, `error`) — the polling/response handling lives entirely in
`src/api/tryOnApi.js` if it needs adjusting.

## Project structure

```
public/
  clothes/
    eastern/kurta/, shalwar-kameez/, kurta-pajama/, sherwani/, prince-coat/, waistcoat/
    western/shirts/, polo-shirts/, suit-coats/, western-coats/, waistcoats/, pants/, corduroy-pants/
  models/               Base model photos, named by size (xs1.png, s1.png, m1.png, l1.png, xl1.png, etc.)
src/
  api/
    apiConfig.js          Backend URL + polling config
    tryOnApi.js            Real backend calls (see above)
  context/
    ThemeContext.jsx       Dark mode state, persisted to localStorage
    WardrobeContext.jsx    Eastern / Western selection, shared across app
  data/
    garments.js            Garment catalogue (categories + image paths + names) + coat/top/bottom helpers
    models.js               Size -> model image variants used by Model Preview
  components/
    Navbar.jsx
    Hero.jsx                Hover-cycling showcase (sherwani / shirt / trousers / full look)
    Footer.jsx
    DarkModeToggle.jsx
    Loading.jsx             Shows live backend stage text while polling
    CategorySidebar.jsx     Left panel on the Try-On page
    GarmentGallery.jsx      Center panel on the Try-On page
    ModelPreview.jsx        Right panel: preview, size selector, actions
    ResultScreen.jsx        Before/after comparison + coat layering step
    PlaceholderArt.jsx      Stand-in visuals shown only if an image path is missing
  pages/
    Home.jsx
    TryOn.jsx               Wires the full outfit + coat backend flow
    About.jsx
    Contact.jsx
  App.jsx
  main.jsx
```

## Garment images

Every garment in `src/data/garments.js` points at a real image under
`public/clothes/`. To add more, drop an image into the matching category
folder and add an entry:

```js
kurta: [
  { id: 'kurta-13', name: 'Wine Kurta', image: '/clothes/eastern/kurta/kurta13.png' },
  ...
],
```

## Model images

`src/data/models.js` maps each size (XS, S, M, L, XL) to one or more model
photos. Selecting a size shows that size's first model photo; **Change
Model** cycles through the other variants for the same size.

## Notes

- Dark mode preference is remembered via `localStorage`.
- Eastern/Western selection lives in `WardrobeContext` so it stays in sync
  between the navbar toggle and the Try-On page.
- If a try-on request fails (server down, wrong ngrok URL, CORS, timeout),
  the page shows an error card with a "Try Again" button rather than getting
  stuck on the loading screen.
