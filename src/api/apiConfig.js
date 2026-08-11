// Western wear backend (OOTDiffusion pipeline) — already connected.
export const API_URL = "https://swerve-wow-control.ngrok-free.dev";

// Eastern wear backend (CatVTON pipeline) — CONNECTED. Confirmed working
// against the real Swagger docs at <this URL>/docs on 2026-08-11.
// Note: free ngrok URLs change every time the Colab notebook restarts —
// if this stops working, get the new URL from whoever's running it.
export const EASTERN_API_URL = "https://exact-equity-equinox.ngrok-free.dev";

// Change this from 15000 to 5000 to cut down wait times
export const POLL_INTERVAL_MS = 5000;

export const MAX_POLL_ATTEMPTS = 60; // Increased attempts to accommodate faster polling
