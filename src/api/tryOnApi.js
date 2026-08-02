// ============================================================
// TRY-ON API HELPERS
// ============================================================

import { API_URL, POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from "./apiConfig";

// This header bypasses the free ngrok warning page so CORS doesn't fail!
const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

export async function urlToFile(path, filename) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Could not load image at ${path} (status ${response.status})`,
    );
  }
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

export async function submitOutfitJob({ modelFile, shirtFile, trouserFile }) {
  const formData = new FormData();
  formData.append("model_image", modelFile);
  formData.append("shirt_image", shirtFile);
  formData.append("trouser_image", trouserFile);

  const response = await fetch(`${API_URL}/tryon/outfit`, {
    method: "POST",
    headers: NGROK_HEADERS, // Added Ngrok bypass header
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`/tryon/outfit failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.job_id) {
    throw new Error("Backend did not return a job_id");
  }
  return data.job_id;
}

export async function submitCoatJob({ previousJobId, coatFile }) {
  const formData = new FormData();
  formData.append("job_id", previousJobId);
  formData.append("coat_image", coatFile);

  const response = await fetch(`${API_URL}/tryon/coat`, {
    method: "POST",
    headers: NGROK_HEADERS, // Added Ngrok bypass header
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`/tryon/coat failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.job_id) {
    throw new Error("Backend did not return a job_id for the coat job");
  }
  return data.job_id;
}

export function pollForResult(jobId, onStageUpdate) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts += 1;

      if (attempts > MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        reject(new Error("Timed out waiting for backend result."));
        return;
      }

      try {
        const res = await fetch(`${API_URL}/result/${jobId}`, {
          method: "GET",
          headers: NGROK_HEADERS, // Added Ngrok bypass header
        });

        if (!res.ok) {
          clearInterval(interval);
          reject(
            new Error(`/result/${jobId} failed with status ${res.status}`),
          );
          return;
        }

        const data = await res.json();

        if (data.stage && onStageUpdate) {
          onStageUpdate(data.stage);
        }

        if (data.status === "done") {
          clearInterval(interval);
          console.log("🎉 JOB DONE! Backend returned:", data);

          // WE FOUND IT! The screenshot confirms the key is "final_saved_as"
          const finalFilename = data.final_saved_as;

          if (finalFilename) {
            // Map it to "final_as" because that is what AppClaude2.jsx expects
            data.final_as = finalFilename;
            resolve(data);
          } else {
            reject(new Error("Backend did not return 'final_saved_as'."));
          }
        } else if (data.status === "error") {
          clearInterval(interval);
          reject(new Error(data.error || "Backend reported an error"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, POLL_INTERVAL_MS);
  });
}

export function base64ToImageSrc(base64String) {
  return `data:image/jpeg;base64,${base64String}`;
}

export function getDownloadUrl(filename) {
  // Now that we have the exact filename, we can safely just fetch it via URL!
  return `${API_URL}/download/${filename}`;
}
