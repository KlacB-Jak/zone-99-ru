document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const loadingScreen = document.getElementById('loading-screen');
    const loaderFill = document.querySelector('.loader-fill');
    const loaderPercent = document.querySelector('.loader-percent');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.getElementById('navigation');
    const rolesList = document.getElementById('roles-list');
    const searchInput = document.getElementById('search-input');
    const bgMusic = document.getElementById('bg-music');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    let isNavigating = false;
    let audioStarted = false;

    function startAudio() {
        if (audioStarted || !bgMusic) return;
        bgMusic.volume = volumeSlider ? volumeSlider.value / 100 : 0.3;
        bgMusic.play().then(() => {
            audioStarted = true;
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
            document.removeEventListener('touchstart', startAudio);
        }).catch(() => {
            console.log('Audio playback requires user interaction.');
        });
    }

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
    document.addEventListener('touchstart', startAudio);

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (volumeValue) volumeValue.textContent = val + '%';
            if (bgMusic) bgMusic.volume = val / 100;
        });
    }

    function createRoleElement(role) {
        const item = document.createElement('div');
        item.className = 'role-item';

        const header = document.createElement('div');
        header.className = 'role-item-header';

        const main = document.createElement('div');
        main.className = 'role-item-main';

        const title = document.createElement('span');
        title.className = 'role-item-title';
        title.textContent = role.title;

        const status = document.createElement('span');
        status.className = `role-item-status${role.status === 'Занята' ? ' occupied' : ''}`;
        status.textContent = role.status;

        const toggle = document.createElement('span');
        toggle.className = 'role-item-toggle';
        toggle.textContent = '›';

        main.appendChild(title);
        main.appendChild(status);
        header.appendChild(main);
        header.appendChild(toggle);

        const body = document.createElement('div');
        body.className = 'role-item-body';

        const grid = document.createElement('div');
        grid.className = 'role-detail-grid';

        const fields = [
            { label: 'Уровень доступа', value: role.access, accent: true },
            { label: 'Класс персонала', value: role.class, accent: true }
        ];

        if (role.department) {
            fields.push({ label: 'Отдел', value: role.department, full: true });
        }

        fields.push({ label: 'Знания', value: role.knowledge, full: true, text: true });
        fields.push({ label: 'Требования', value: role.requirements, full: true, text: true });

        fields.forEach(field => {
            const detailItem = document.createElement('div');
            detailItem.className = `role-detail-item${field.full ? ' full' : ''}`;

            const label = document.createElement('div');
            label.className = 'role-detail-label';
            label.textContent = field.label;

            const value = document.createElement('div');
            value.className = `role-detail-value${field.accent ? ' accent' : ''}${field.text ? ' role-detail-text' : ''}`;
            value.textContent = field.value;

            detailItem.appendChild(label);
            detailItem.appendChild(value);
            grid.appendChild(detailItem);
        });

        body.appendChild(grid);

        header.addEventListener('click', () => {
            item.classList.toggle('open');
        });

        item.appendChild(header);
        item.appendChild(body);

        return item;
    }

    function createGroupElement(group) {
        const groupEl = document.createElement('div');
        groupEl.className = 'role-group open';

        const header = document.createElement('div');
        header.className = 'role-group-header';

        const title = document.createElement('span');
        title.className = 'group-title';
        title.textContent = group.groupTitle;

        const toggle = document.createElement('span');
        toggle.className = 'group-toggle';
        toggle.textContent = '›';

        header.appendChild(title);
        header.appendChild(toggle);

        const body = document.createElement('div');
        body.className = 'role-group-body';

        group.roles.forEach(role => {
            body.appendChild(createRoleElement(role));
        });

        header.addEventListener('click', () => {
            groupEl.classList.toggle('open');
        });

        groupEl.appendChild(header);
        groupEl.appendChild(body);

        return groupEl;
    }

    function renderRoles(filterText = '') {
        if (!rolesList) return;
        rolesList.innerHTML = '';
        
        const normalized = filterText.trim().toLowerCase();
        let totalMatches = 0;

        rolesData.forEach(group => {
            const filteredRoles = group.roles.filter(role => {
                if (!normalized) return true;
                return role.title.toLowerCase().includes(normalized) || 
                       group.groupTitle.toLowerCase().includes(normalized) ||
                       (role.department && role.department.toLowerCase().includes(normalized));
            });

            if (filteredRoles.length > 0) {
                totalMatches += filteredRoles.length;
                const groupClone = {
                    ...group,
                    roles: filteredRoles
                };
                const groupEl = createGroupElement(groupClone);
                
                if (normalized) {
                    groupEl.classList.add('open');
                }
                
                rolesList.appendChild(groupEl);
            }
        });

        if (totalMatches === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'padding: 3rem; text-align: center; border: 1px dashed var(--accent-dim); color: var(--text-dim); font-family: var(--font-mono); letter-spacing: 2px;';
            empty.textContent = '[ СОВПАДЕНИЙ НЕ НАЙДЕНО ]';
            rolesList.appendChild(empty);
        }
    }

    function navigateTo(pageId) {
        if (!loadingScreen || isNavigating) return;
        
        const targetPage = document.getElementById(`page-${pageId}`);
        if (!targetPage) return;

        isNavigating = true;
        loadingScreen.classList.remove('hidden');
        loaderFill.style.width = '0%';
        loaderPercent.textContent = '0%';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30 + 10;
            if (progress > 100) progress = 100;
            
            loaderFill.style.width = progress + '%';
            loaderPercent.textContent = Math.floor(progress) + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                setTimeout(() => {
                    pages.forEach(p => p.classList.remove('active'));
                    targetPage.classList.add('active');
                    
                    navItems.forEach(item => {
                        item.classList.toggle('active', item.dataset.page === pageId);
                    });

                    if (pageId === 'roles' && searchInput) {
                        renderRoles(searchInput.value);
                    }

                    loadingScreen.classList.add('hidden');
                    isNavigating = false;
                }, 200);
            }
        }, 30);
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.dataset.page;
            
            if (pageId && !isNavigating) {
                if (navigation) navigation.classList.remove('active');
                if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
                navigateTo(pageId);
            }
        });
    });

    if (mobileToggle && navigation) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = navigation.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', String(expanded));
        });

        document.addEventListener('click', (e) => {
            if (navigation.classList.contains('active') && 
                !navigation.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                navigation.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderRoles(e.target.value);
        });
    }

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.tab;
            if (!targetId) return;

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    renderRoles();
});