document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    const overlay = document.querySelector('.overlay'); // Used ONLY for FILTER sidebar now

    // --- Display Date & Time (Year Removed) ---
    function displayDateTime() {
        const dateElement = document.getElementById('current-date');
        const timeElement = document.getElementById('current-time');
        if (!dateElement || !timeElement) return;
        const now = new Date();
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        try {
            const weekday = now.toLocaleDateString('fa-IR', { weekday: 'long' });
            const day = now.toLocaleDateString('fa-IR', { day: 'numeric' });
            const month = now.toLocaleDateString('fa-IR', { month: 'long' });
            dateElement.textContent = `${weekday}، ${day} ${month}`;
            timeElement.textContent = now.toLocaleTimeString('fa-IR', timeOptions);
        } catch (e) { console.error("Error formatting date/time for fa-IR:", e); /* Handle error */ }
    }
    if (document.getElementById('current-date')) { displayDateTime(); }


    // --- Focus Trapping Function ---
    function trapFocus(element) {
        if (!element) return;
        const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="search"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];
        const KEYCODE_TAB = 9;

        const handleKeyDown = function(e) {
            const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);
            if (!isTabPressed) return;
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        };
        element.addEventListener('keydown', handleKeyDown);
        const observer = new MutationObserver(mutations => {
             mutations.forEach(mutation => {
                 if (mutation.attributeName === 'class' && element.classList.contains('is-open') && firstFocusableEl) {
                    setTimeout(() => firstFocusableEl.focus(), 50);
                 }
             });
         });
         observer.observe(element, { attributes: true });
         return handleKeyDown;
    }

    // --- Mobile Menu Toggle (Overlay Style) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenuOverlay = document.getElementById('primary-menu-container');
    const closeMenuButton = mobileMenuOverlay ? mobileMenuOverlay.querySelector('.close-menu-btn') : null;
    let mobileMenuFocusHandler = null;

    if (menuToggle && mobileMenuOverlay && closeMenuButton) {
        function openMobileMenu() {
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.classList.add('is-active');
            mobileMenuOverlay.classList.add('is-open');
            body.classList.add('no-scroll');
            mobileMenuFocusHandler = trapFocus(mobileMenuOverlay);
        }

        function closeMobileMenu() {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('is-active');
            mobileMenuOverlay.classList.remove('is-open');
            const filterSidebar = document.getElementById('members-filter-sidebar');
            if (!filterSidebar || !filterSidebar.classList.contains('is-open')) {
               body.classList.remove('no-scroll');
            }
            if (mobileMenuFocusHandler) {
                 mobileMenuOverlay.removeEventListener('keydown', mobileMenuFocusHandler);
                 mobileMenuFocusHandler = null;
            }
            menuToggle.focus();
        }

        menuToggle.addEventListener('click', openMobileMenu);
        closeMenuButton.addEventListener('click', closeMobileMenu);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('is-open')) { closeMobileMenu(); } });
        const menuLinks = mobileMenuOverlay.querySelectorAll('a');
        menuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    }

    // --- Mobile Filter Sidebar Toggle ---
    const filterToggleButton = document.querySelector('.filter-toggle-btn');
    const filterSidebar = document.getElementById('members-filter-sidebar');
    const closeFilterBtn = filterSidebar ? filterSidebar.querySelector('.close-filter-btn') : null; // Renamed variable
    let filterSidebarFocusHandler = null;

    if (filterToggleButton && filterSidebar && closeFilterBtn && overlay) { // Use renamed variable
        filterToggleButton.addEventListener('click', function() {
            const isOpen = filterSidebar.classList.contains('is-open');
            this.setAttribute('aria-expanded', !isOpen);
            filterSidebar.classList.add('is-open');
            overlay.classList.add('is-active');
            body.classList.add('no-scroll');
            filterSidebarFocusHandler = trapFocus(filterSidebar);
        });

        function closeFilterSidebar() {
            if (filterSidebar.classList.contains('is-open')) {
                filterToggleButton.setAttribute('aria-expanded', 'false');
                filterSidebar.classList.remove('is-open');
                overlay.classList.remove('is-active');
                if (!mobileMenuOverlay || !mobileMenuOverlay.classList.contains('is-open')) {
                    body.classList.remove('no-scroll');
                }
                 if (filterSidebarFocusHandler) {
                     filterSidebar.removeEventListener('keydown', filterSidebarFocusHandler);
                     filterSidebarFocusHandler = null;
                 }
                filterToggleButton.focus();
            }
        }
        closeFilterBtn.addEventListener('click', closeFilterSidebar); // Use renamed variable
        overlay.addEventListener('click', closeFilterSidebar);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && filterSidebar.classList.contains('is-open')) { closeFilterSidebar(); } });
    }


    // --- Members Page Filtering and Sorting ---
    // (No changes needed in the logic itself)
    const memberListContainer = document.getElementById('member-list');
    if (memberListContainer && document.querySelector('.page-members')) {
        const sidebarSearchInput = document.getElementById('sidebar-member-search');
        const mobileSearchInput = document.getElementById('mobile-member-search');
        const categoryFilter = document.getElementById('filter-category');
        const experienceFilter = document.getElementById('filter-experience');
        const ratingFilter = document.getElementById('filter-rating');
        const sortBy = document.getElementById('sort-by');
        const applyButton = document.getElementById('apply-filters');
        const noResultsMessage = document.getElementById('no-results');
        function syncSearchInputs(source, target) { if(source && target) target.value = source.value; }
        if (sidebarSearchInput && mobileSearchInput) {
            sidebarSearchInput.addEventListener('input', () => syncSearchInputs(sidebarSearchInput, mobileSearchInput));
            mobileSearchInput.addEventListener('input', () => syncSearchInputs(mobileSearchInput, sidebarSearchInput));
             function handleEnter(e) { if (e.key === 'Enter') { e.preventDefault(); filterAndSortMembers(); } }
             mobileSearchInput.addEventListener('keypress', handleEnter);
             sidebarSearchInput.addEventListener('keypress', handleEnter);
        }
        const allMemberCards = Array.from(memberListContainer.querySelectorAll('.member-card'));
        const allMembersData = allMemberCards.map(card => ({ element: card, name: card.dataset.name || '', category: card.dataset.category || '', experience: card.dataset.experience || '', rating: parseFloat(card.dataset.rating || 0) }));
        function displayMembers(membersToDisplay) { memberListContainer.innerHTML = ''; noResultsMessage.style.display = membersToDisplay.length === 0 ? 'block' : 'none'; membersToDisplay.forEach(memberData => memberListContainer.appendChild(memberData.element)); }
        function filterAndSortMembers() {
            const searchTerm = sidebarSearchInput ? sidebarSearchInput.value.toLowerCase().trim() : '';
            const selectedCategory = categoryFilter.value; const selectedExperience = experienceFilter.value; const selectedMinRating = parseFloat(ratingFilter.value || 0); const sortOption = sortBy.value;
            let filteredMembers = allMembersData.filter(member => { const nameMatch = member.name.toLowerCase().includes(searchTerm); const categoryMatch = !selectedCategory || member.category === selectedCategory; const experienceMatch = !selectedExperience || member.experience === selectedExperience; const ratingMatch = !selectedMinRating || member.rating >= selectedMinRating; return nameMatch && categoryMatch && experienceMatch && ratingMatch; });
            const experienceOrder = { "1-5": 1, "5-10": 2, "10+": 3 };
            filteredMembers.sort((a, b) => { switch (sortOption) { case 'name-asc': return a.name.localeCompare(b.name, 'fa'); case 'name-desc': return b.name.localeCompare(a.name, 'fa'); case 'rating-desc': return b.rating - a.rating; case 'rating-asc': return a.rating - b.rating; case 'experience-desc': return (experienceOrder[b.experience] || 0) - (experienceOrder[a.experience] || 0); case 'experience-asc': return (experienceOrder[a.experience] || 0) - (experienceOrder[b.experience] || 0); default: return 0; } });
            displayMembers(filteredMembers);
             if (window.innerWidth < 992 && filterSidebar && filterSidebar.classList.contains('is-open')) { closeFilterSidebar(); }
        }
        if (applyButton) { applyButton.addEventListener('click', filterAndSortMembers); }
        [categoryFilter, experienceFilter, ratingFilter, sortBy].forEach(control => { if(control) control.addEventListener('change', filterAndSortMembers); });
        if(sidebarSearchInput) sidebarSearchInput.addEventListener('blur', filterAndSortMembers);
        if(mobileSearchInput) mobileSearchInput.addEventListener('blur', filterAndSortMembers);
        filterAndSortMembers();
    }

}); // End DOMContentLoaded