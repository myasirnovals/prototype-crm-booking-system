/* ============================================
   PhysioCare - Guest Navbar Component
   Used for public-facing pages
   ============================================ */

const NavbarGuest = {
    /**
     * Render the guest navigation bar
     * @param {string} active - active link key
     */
    render(active = '') {
        const links = [
            { key: 'home',       label: t('nav.home'),        href: '#/' },
            { key: 'about',      label: t('nav.about'),       href: '#/about' },
            { key: 'services',   label: t('nav.services'),    href: '#/services' },
            { key: 'conditions', label: t('nav.conditions'),  href: '#/conditions' },
            { key: 'team',       label: t('nav.team'),        href: '#/team' },
            { key: 'articles',   label: t('nav.articles'),    href: '#/articles' },
        ];

        const navLinks = links.map(link => {
            const isActive = active === link.key;
            const activeClass = isActive
                ? 'text-primary font-bold border-b-2 border-primary pb-1'
                : 'text-on-surface-variant hover:text-primary';
            return `<a class="${activeClass} transition-colors duration-200 text-sm font-medium" href="${link.href}">${link.label}</a>`;
        }).join('');

        // Mobile nav links (full width)
        const mobileLinks = links.map(link => {
            const isActive = active === link.key;
            const activeClass = isActive
                ? 'text-primary font-bold bg-primary-fixed/20'
                : 'text-on-surface hover:bg-surface-muted';
            return `<a class="${activeClass} block px-4 py-3 rounded-xl text-base font-medium transition-all" href="${link.href}" onclick="NavbarGuest.closeMobile()">${link.label}</a>`;
        }).join('');

        // Language switcher
        const langBtn = `
        <button onclick="I18n.toggleLang()" class="flex items-center gap-1 px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all font-bold text-xs" title="${t('nav.switchLang')}">
            <span class="material-symbols-outlined text-[14px]">translate</span>
            ${t('lang.switch')}
        </button>`;

        const brandName = (window.currentTenant && window.currentTenant.name) ? window.currentTenant.name : 'PhysioCare';

        return `
        <!-- Guest Navbar -->
        <nav id="navbar-guest" class="sticky top-0 w-full z-50 bg-clinical-white/95 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
            <div class="flex justify-between items-center px-5 md:px-10 h-16 max-w-container-max mx-auto">
                <!-- Logo -->
                <a href="#/" class="flex items-center gap-2 flex-shrink-0">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-on-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                    </div>
                    <span class="font-headline-md text-headline-md font-extrabold text-primary tracking-tighter text-lg">${brandName}</span>
                </a>

                <!-- Desktop nav links -->
                <div class="hidden lg:flex items-center gap-7">
                    ${navLinks}
                </div>

                <!-- Right actions -->
                <div class="flex items-center gap-3">
                    <a href="../../pages/public/sign-in.html" class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-all px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-primary/40" title="Go to Cliniva Management Portal">
                        <span class="material-symbols-outlined text-[15px]">corporate_fare</span>
                        Cliniva Portal
                    </a>
                    ${langBtn}
                    <a href="#/booking" id="navbar-book-btn"
                       class="hidden sm:flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-button-text text-sm active:scale-95 transition-all shadow-md hover:shadow-lg hover:bg-primary-container">
                        <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                        ${t('nav.bookNow')}
                    </a>
                    <!-- Mobile hamburger -->
                    <button id="mobile-menu-btn" onclick="NavbarGuest.openMobile()"
                            class="lg:hidden text-primary p-2 rounded-lg hover:bg-surface-muted transition-all"
                            aria-label="Open menu">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </nav>

        <!-- Mobile Menu Overlay -->
        <div id="mobile-menu-overlay" class="hidden fixed inset-0 z-[200] bg-on-background/50 backdrop-blur-sm flex-col" onclick="NavbarGuest.closeMobile()">
            <div class="bg-clinical-white ml-auto h-full w-72 shadow-2xl p-6 flex flex-col gap-4" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <span class="material-symbols-outlined text-on-primary text-[16px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                        </div>
                        <span class="font-bold text-primary">${brandName}</span>
                    </div>
                    <button onclick="NavbarGuest.closeMobile()" class="p-2 rounded-full hover:bg-surface-muted text-on-surface-variant">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <!-- Links -->
                <nav class="flex flex-col gap-1">
                    ${mobileLinks}
                </nav>
                <!-- Book CTA -->
                <div class="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-2">
                    <a href="#/booking" onclick="NavbarGuest.closeMobile()"
                       class="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-button-text text-button-text w-full hover:bg-primary-container transition-all">
                        <span class="material-symbols-outlined text-[20px]">calendar_today</span>
                        ${t('nav.bookNow')}
                    </a>
                    <a href="../../pages/public/sign-in.html" class="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 py-2 hover:text-primary">
                        <span class="material-symbols-outlined text-[15px]">corporate_fare</span>
                        Cliniva Portal
                    </a>
                </div>
            </div>
        </div>
        `;
    },

    openMobile() {
        const el = document.getElementById('mobile-menu-overlay');
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('flex');
        }
        document.body.style.overflow = 'hidden';
    },

    closeMobile() {
        const el = document.getElementById('mobile-menu-overlay');
        if (el) {
            el.classList.remove('flex');
            el.classList.add('hidden');
        }
        document.body.style.overflow = '';
    },

    /**
     * Call after render to set up navbar scroll effect
     */
    initScrollEffect() {
        const navbar = document.getElementById('navbar-guest');
        if (!navbar) return;
        const handler = () => {
            if (window.scrollY > 20) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };
        window.addEventListener('scroll', handler, { passive: true });
        handler();
    }
};
