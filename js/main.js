document.addEventListener('DOMContentLoaded', () => {
  // 1. Мобильное меню
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // 2. Навигация между "страницами" (SPA)
  const navLinks = document.querySelectorAll('.nav-link');
  const actionButtons = document.querySelectorAll('[data-target]');
  const sections = document.querySelectorAll('.page-section');

  function showSection(targetId) {
    sections.forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.classList.add('active');

    // Обновляем активный класс в хедере
    navLinks.forEach(link => {
      if (link.dataset.target === targetId) link.classList.add('active');
      else link.classList.remove('active');
    });

    // Закрываем мобильное меню
    if (navList && navList.classList.contains('open')) {
      navList.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.target);
    });
  });

  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!btn.classList.contains('disabled') && !btn.hasAttribute('disabled')) {
        showSection(btn.dataset.target);
      }
    });
  });

  // 3. Логика вкладок (Tabs) - Вертикальное меню
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-content');

  if (tabs.length && panels.length) {
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(index));
      
      tab.addEventListener('keydown', (e) => {
        let newIndex;
        if (e.key === 'ArrowDown') newIndex = (index + 1) % tabs.length;
        else if (e.key === 'ArrowUp') newIndex = (index - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') newIndex = 0;
        else if (e.key === 'End') newIndex = tabs.length - 1;
        else return;
        
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(newIndex);
      });
    });

    function activateTab(index) {
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });
      panels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('hidden', '');
      });

      tabs[index].setAttribute('aria-selected', 'true');
      tabs[index].setAttribute('tabindex', '0');
      panels[index].classList.add('active');
      panels[index].removeAttribute('hidden');
    }
  }
});