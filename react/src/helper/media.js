// Lightweight helper for image URL detection across the app
// Usage: import { isImageUrl } from "../helper/media.js";

/**
 * Returns true if the provided URL string appears to reference an image.
 * - Strips query params for extension checks
 * - Supports common image extensions
 * - Safe against non-string input
 * @param {string} url
 * @returns {boolean}
 */
export const isImageUrl = (url) => {
  try {
    const path = String(url).split('?')[0].toLowerCase();
    return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(path);
  } catch {
    return false;
  }
};

