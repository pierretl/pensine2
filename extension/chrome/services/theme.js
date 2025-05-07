export function initThemeSwitcher(themeSelectElement) {
    if (!themeSelectElement) return;

    // Charger le thème enregistré et l'appliquer
    chrome.storage.local.get("theme", (result) => {
        const savedTheme = result.theme;

        if (savedTheme === "light" || savedTheme === "dark") {
            document.documentElement.setAttribute("data-theme", savedTheme);
            themeSelectElement.value = savedTheme;
        } else {
            document.documentElement.removeAttribute("data-theme");
            themeSelectElement.value = "system";
        }
    });

    // Écouter les changements de thème
    themeSelectElement.addEventListener("change", () => {
        const value = themeSelectElement.value;

        if (value === "light" || value === "dark") {
            document.documentElement.setAttribute("data-theme", value);
            chrome.storage.local.set({ theme: value });
        } else if (value === "system") {
            document.documentElement.removeAttribute("data-theme");
            chrome.storage.local.set({ theme: "system" });
        }
    });
}
