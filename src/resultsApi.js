const RESULTS_API_URL = import.meta.env?.VITE_RESULTS_API_URL?.replace(/\/$/, "");
const APP_VERSION = "20ps-emi-professor-game@1";

export function isResultsEnabled() {
  return Boolean(RESULTS_API_URL);
}

export async function submitGameResult(result) {
  if (!isResultsEnabled()) {
    return { ok: false, skipped: true, reason: "Results API is not configured." };
  }

  const response = await fetch(`${RESULTS_API_URL}/api/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: result.mode,
      score: result.score,
      total: result.total,
      duration_seconds: result.duration_seconds,
      answers: result.answers || [],
      level_breakdown: result.level_breakdown || {},
      app_version: APP_VERSION,
      user_context: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
    }),
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new Error(message);
  }

  return { ok: true };
}

export async function fetchResultsSummary(adminToken) {
  if (!isResultsEnabled()) {
    throw new Error("Results API is not configured.");
  }

  const response = await fetch(`${RESULTS_API_URL}/api/results/summary?limit=100`, {
    headers: adminToken
      ? { Authorization: `Bearer ${adminToken}` }
      : {},
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error.error || error.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

export async function downloadResultsCsv(adminToken) {
  if (!isResultsEnabled()) {
    throw new Error("Results API is not configured.");
  }

  const response = await fetch(`${RESULTS_API_URL}/api/results.csv`, {
    headers: adminToken
      ? { Authorization: `Bearer ${adminToken}` }
      : {},
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error.error || error.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `20ps-results-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
