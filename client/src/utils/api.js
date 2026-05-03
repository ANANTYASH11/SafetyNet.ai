const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

export const API_URL = `${API_BASE}/api`;
