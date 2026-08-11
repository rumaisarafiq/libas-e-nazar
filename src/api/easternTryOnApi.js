// ============================================================
// EASTERN TRY-ON API HELPERS (CatVTON pipeline)
// ============================================================
// Confirmed against the real Swagger docs at
// https://exact-equity-equinox.ngrok-free.dev/docs — this is NOT a
// guess like the earlier version of this file. Key difference from the
// Western/OOTDiffusion client: this API is synchronous. POST /try-on
// returns the finished result directly in the same response — no
// job_id, no polling loop.

import { EASTERN_API_URL } from "./apiConfig";

const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

export function isEasternBackendConfigured() {
  return Boolean(EASTERN_API_URL);
}

// Real reachability check using the actual GET /health endpoint. Returns
// a boolean rather than throwing, so callers can use this for a quiet
// "is it actually up right now" check without a try/catch at the call
// site.
export async function checkEasternHealth() {
  if (!EASTERN_API_URL) return false;
  try {
    const res = await fetch(`${EASTERN_API_URL}/health`, {
      method: "GET",
      headers: NGROK_HEADERS,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// personFile/clothFile are required. The rest are optional tuning
// parameters the API accepts (mask_type, num_inference_steps,
// guidance_scale, height, width) — omitted from the request entirely
// when not provided, letting the backend use its own defaults.
export async function submitEasternTryOn({
  personFile,
  clothFile,
  maskType,
  numInferenceSteps,
  guidanceScale,
  height,
  width,
}) {
  if (!EASTERN_API_URL) {
    throw new Error("EASTERN_API_URL is not configured yet — see apiConfig.js");
  }

  const formData = new FormData();
  formData.append("person_file", personFile);
  formData.append("cloth_file", clothFile);
  if (maskType != null) formData.append("mask_type", maskType);
  if (numInferenceSteps != null)
    formData.append("num_inference_steps", numInferenceSteps);
  if (guidanceScale != null) formData.append("guidance_scale", guidanceScale);
  if (height != null) formData.append("height", height);
  if (width != null) formData.append("width", width);

  const response = await fetch(`${EASTERN_API_URL}/try-on`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Eastern try-on request failed with status ${response.status}`,
    );
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Eastern backend reported a failure");
  }
  if (!data.result_image) {
    throw new Error("Eastern backend did not return a result_image");
  }
  return data.result_image; // base64 string, no data: prefix
}

export function easternResultToImageSrc(base64String) {
  return `data:image/jpeg;base64,${base64String}`;
}
