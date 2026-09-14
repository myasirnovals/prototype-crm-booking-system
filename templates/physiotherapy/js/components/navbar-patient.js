/* ============================================
   PhysioCare - Patient Navbar Component
   Used for logged-in patient pages
   ============================================ */

const NavbarPatient = {
render(active = '', userName = 'James') {
        const links = [
            { key: 'dashboard', label: t('nav.dashboard'), href: '#/patient/dashboard' },
            { key: 'bookings', label: t('nav.myBookings'), href: '#/patient/booking-success' },
            { key: 'education', label: t('nav.education'), href: '#/articles' },
            { key: 'help', label: t('nav.help'), href: '#/contact' }
        ];

const navLinks = links.map(link => {
            const isActive = active === link.key;
            const activeClass = isActive
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant hover:text-primary';
            return `<a class="${activeClass} transition-colors font-body-md text-body-md" href="${link.href}">${link.label}</a>`;
        }).join('');

const langBtn = `
            <button onclick="I18n.toggleLang()" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all font-bold text-sm" title="${t('nav.switchLang')}">
                <span class="material-symbols-outlined text-[16px]">translate</span>
                ${t('lang.switch')}
            </button>
        `;

        return `
        <header class="w-full sticky top-0 z-50 bg-clinical-white dark:bg-inverse-surface shadow-[0_20px_20px_-5px_rgba(14,116,144,0.05)] transition-all duration-200 ease-in-out">
            <nav class="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
                <div class="flex items-center gap-stack-lg">
                    <a href="#/patient/dashboard" class="text-headline-md font-headline-md text-primary dark:text-primary-fixed tracking-tight">PhysioCare</a>
                    <div class="hidden md:flex gap-stack-md">
                        ${navLinks}
                    </div>
                </div>
<div class="flex items-center gap-stack-md">
                    ${langBtn}
<button class="p-2 text-on-surface-variant hover:bg-surface-muted rounded-full transition-all" aria-label="${t('nav.notifications')}">
                        <span class="material-symbols-outlined">notifications</span>
                    </button>
                    <button class="p-2 text-on-surface-variant hover:bg-surface-muted rounded-full transition-all" aria-label="${t('nav.settings')}">
                        <span class="material-symbols-outlined">settings</span>
                    </button>
                    <div class="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container">
                        <img class="w-full h-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWvAJAebR7qpGOrw_YRs9wKPxmUmsjN6jvM4rA-9W8NkuwBwnZJ8kULQBZfV9i2Yfk5f3xfq6n6656u6QZeDChRV0eW-3urnQ1uzCOcadZTkGoJMocGhzarbIdAdxPlkk8RhmzQe5NFKKYYYVZ9Yq5FnbLzWhYqn7cL0tyM0AMYgK6VhagbHiZHf5eZIMSsOTuTwGYhxq_g95m_RfYTd6_EArYdbXfMcqJQgDOdyxon1VCWc8hhEuYpw"/>
                    </div>
                    <button id="logout-btn" class="hidden md:block text-primary font-body-md text-body-md hover:underline ml-stack-sm">${t('nav.logout')}</button>
                </div>
            </nav>
        </header>
        <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-clinical-white border-t border-outline-variant flex justify-around items-center h-16 z-50">
            <a class="flex flex-col items-center gap-1 text-primary" href="#/patient/dashboard">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
                <span class="text-[10px] font-bold">${t('nav.homeSm')}</span>
            </a>
            <a class="flex flex-col items-center gap-1 text-on-surface-variant" href="#/patient/booking-success">
                <span class="material-symbols-outlined">calendar_month</span>
                <span class="text-[10px]">${t('nav.bookingsSm')}</span>
            </a>
            <a class="flex flex-col items-center gap-1 text-on-surface-variant" href="#/articles">
                <span class="material-symbols-outlined">menu_book</span>
                <span class="text-[10px]">${t('nav.librarySm')}</span>
            </a>
            <a class="flex flex-col items-center gap-1 text-on-surface-variant" href="#/contact">
                <span class="material-symbols-outlined">account_circle</span>
                <span class="text-[10px]">${t('nav.profileSm')}</span>
            </a>
        </nav>`;
    },

    init() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                User.logout();
                router.navigate('/login');
            });
        }
    }
};
