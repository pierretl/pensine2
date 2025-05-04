import { dom } from './domElements.js';

export function initTabs() {
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', activateTab);
        tab.addEventListener('keydown', handleKeyDown);
    });
}

export function selectTab(id) {
    const tab = document.querySelector(`[aria-controls="${id}"]`);
    if (tab) {
        tab.click(); // Simule un clic pour activer l'onglet
    }
}

function activateTab(event) {
    const selectedTab = event.currentTarget;
    const targetPanelId = selectedTab.getAttribute('aria-controls');

    dom.tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
    });

    document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.classList.add('hide');
    });

    selectedTab.setAttribute('aria-selected', 'true');
    selectedTab.setAttribute('tabindex', '0');
    document.getElementById(targetPanelId).classList.remove('hide');
    selectedTab.focus();
}

function handleKeyDown(event) {
    const currentTab = event.currentTarget;
    const tabsArray = Array.from(dom.tabList.querySelectorAll('[role="tab"]'));
    const currentIndex = tabsArray.indexOf(currentTab);
    let newIndex;

    if (event.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % tabsArray.length;
    } else if (event.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
    } else {
        return; // Ne gère que les flèches
    }

    tabsArray[newIndex].focus();
    tabsArray[newIndex].click();
}


