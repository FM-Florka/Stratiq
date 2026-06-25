/**
 * Stratiq API client — fetch wrapper for the FastAPI backend.
 * Used in Server Components (server-side fetch, no-store).
 */

const BASE_URL =
  (typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) || "http://localhost:8000";

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = `API ${res.status}`;
    try {
      const err = await res.json();
      if (err.detail) detail = err.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

/** POST /api/py/analyze — maximum data collection + fully-AI report. */
export async function analyzeAccount(username, maxPosts = 105) {
  return request("/api/py/analyze", { username, max_posts: maxPosts });
}

/**
 * POST /api/py/competitors — category-based competitor discovery + AI comparison.
 * Pass the main account's category, top hashtags, and metrics so the backend
 * can find true niche peers (never by username).
 */
export async function fetchCompetitors({
  category,
  topHashtags = [],
  username,
  followers = 0,
  userMetrics = {},
  userTopVideos = [],
  topN = 3,
}) {
  return request("/api/py/competitors", {
    category,
    top_hashtags: topHashtags,
    username,
    followers,
    user_metrics: userMetrics,
    user_top_videos: userTopVideos,
    top_n: topN,
  });
}

/** POST /api/py/trending — category-scoped trending videos + AI explanation. */
export async function fetchTrending({ category, topHashtags = [], userStyle = "" }) {
  return request("/api/py/trending", {
    category,
    top_hashtags: topHashtags,
    user_style: userStyle,
  });
}

/** POST /api/py/caption — generate caption variants. */
export async function generateCaption(product, videoType = "general", tone = "friendly") {
  return request("/api/py/caption", { product, video_type: videoType, tone });
}

/** POST /api/py/ideas — generate content ideas. */
export async function generateIdeas(niche, topVideos = [], engagementRate = 0) {
  return request("/api/py/ideas", {
    niche,
    top_videos: topVideos,
    engagement_rate: engagementRate,
  });
}
