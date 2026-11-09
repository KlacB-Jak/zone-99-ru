"use strict";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupTabs();
  setupRoleSearch();
  setCurrentYear();
});

/**
 * Переключает мобильную навигацию и синхронизирует состояние с aria-expanded.
 */
function setupMobileNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");

  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);

    const label = toggle.querySelector(".sr-only");
    if (label) {
      label.textContent = isExpanded ? "Открыть меню" : "Закрыть меню";
    }
  });

  // При переходе на широкий экран закрываем раскрытое мобильное меню.
  window.matchMedia("(min-width: 681px)").addEventListener("change", (event) => {
    if (!event.matches) return;
    toggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  });
}

/**
 * Доступные вкладки: активация кликом и навигация стрелками, Home и End.
 */
function setupTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabSet) => {
    const tabs = Array.from(tabSet.querySelectorAll('[role="tab"]'));

    function activateTab(tab, moveFocus = false) {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        item.classList.toggle("is-active", selected);

        const panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });

      if (moveFocus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;
          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = tabs.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });
  });
}

/**
 * Фильтрует строки реестра без перезагрузки страницы.
 */
function setupRoleSearch() {
  const input = document.querySelector("#role-search");
  const list = document.querySelector("#role-list");
  if (!input || !list) return;

  const rows = Array.from(list.querySelectorAll("[data-role]"));
  const visibleCount = document.querySelector("#visible-count");
  const totalCount = document.querySelector("#role-count");
  const emptyState = document.querySelector("#roles-empty");

  if (totalCount) totalCount.textContent = formatCount(rows.length);

  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase("ru");
    let count = 0;

    rows.forEach((row) => {
      const searchableText = `${row.textContent} ${row.dataset.search || ""}`
        .toLocaleLowerCase("ru");
      const matches = searchableText.includes(query);

      row.hidden = !matches;
      if (matches) count += 1;
    });

    if (visibleCount) visibleCount.textContent = formatCount(count);
    if (emptyState) emptyState.hidden = count !== 0;
  });
}

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function setCurrentYear() {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
}