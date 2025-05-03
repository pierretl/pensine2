import { extractPageInfo } from '../utils/extractPageInfo.js';

export async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}
  
export async function getPageInfo(tabId) {
    const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractPageInfo
    });
    return result.result;
}
  
export async function getScreenshot() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            resolve(dataUrl);
        });
    });
}
