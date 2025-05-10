export let cachedScreenshotDataUrl = null;

export function setCachedScreenshotDataUrl(dataUrl) {
    cachedScreenshotDataUrl = dataUrl;
}

export function getCachedScreenshotDataUrl() {
    return cachedScreenshotDataUrl;
}
