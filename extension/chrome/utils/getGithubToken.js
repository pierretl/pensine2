export async function getGithubToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("githubToken", (result) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve(result.githubToken);
        });
    });
}