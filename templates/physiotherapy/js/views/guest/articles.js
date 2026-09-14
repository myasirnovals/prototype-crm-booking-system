/* ============================================
   PhysioCare - Guest Articles View
   ============================================ */

const GuestArticlesView = {
    articles: [
        { id: 'a1', titleT: 'articles.a1Title', categoryT: 'articles.catEducation', monthIndex: 9, year: 2024, mins: "8 min", excerptT: 'articles.a1Excerpt', icon: "spine" },
        { id: 'a2', titleT: 'articles.a2Title', categoryT: 'articles.catRehab', monthIndex: 8, year: 2024, mins: "10 min", excerptT: 'articles.a2Excerpt', icon: "neurology" },
        { id: 'a3', titleT: 'articles.a3Title', categoryT: 'articles.catSports', monthIndex: 8, year: 2024, mins: "6 min", excerptT: 'articles.a3Excerpt', icon: "sports_gymnastics" },
        { id: 'a4', titleT: 'articles.a4Title', categoryT: 'articles.catGeriatric', monthIndex: 7, year: 2024, mins: "7 min", excerptT: 'articles.a4Excerpt', icon: "elderly" },
        { id: 'a5', titleT: 'articles.a5Title', categoryT: 'articles.catHealth', monthIndex: 7, year: 2024, mins: "5 min", excerptT: 'articles.a5Excerpt', icon: "work" },
        { id: 'a6', titleT: 'articles.a6Title', categoryT: 'articles.catSports', monthIndex: 6, year: 2024, mins: "12 min", excerptT: 'articles.a6Excerpt', icon: "fitness_center" }
    ],

    renderCard(a) {
        return `
            <article class="article-card group bg-clinical-white rounded-[1.5rem] overflow-hidden border border-outline-variant/30 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" data-category="${t(a.categoryT).toLowerCase()}" data-title="${t(a.titleT).toLowerCase()}">
                <div class="h-48 bg-surface-container-low flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 to-secondary-fixed/20 group-hover:scale-105 transition-transform duration-500"></div>
                    <span class="material-symbols-outlined text-[80px] text-primary relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-500" style="font-variation-settings: 'FILL' 1;">${a.icon}</span>
                </div>
                <div class="p-6 flex flex-col h-[calc(100%-12rem)]">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="bg-secondary/10 text-secondary text-[11px] font-bold px-3 py-1 rounded-full border border-secondary/20">${t(a.categoryT)}</span>
                        <span class="text-xs font-medium text-on-surface-variant">${I18n.formatMonthYear(a.monthIndex, a.year)}</span>
                        <span class="text-xs font-medium text-on-surface-variant flex items-center gap-1 ml-auto"><span class="material-symbols-outlined text-[14px]">schedule</span>${a.mins}</span>
                    </div>
                    <h3 class="font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">${t(a.titleT)}</h3>
                    <p class="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3">${t(a.excerptT)}</p>
                    <div class="mt-auto pt-4 border-t border-outline-variant/30">
                        <a href="#/articles/${a.id}" onclick="event.preventDefault(); alert('Ini adalah prototipe. Konten detail artikel belum terhubung.');" class="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all w-max">
                            ${t('articles.read')} <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </article>
        `;
    },

    async render() {
        const cards = this.articles.map(a => this.renderCard(a)).join('');
        const categories = [...new Set(this.articles.map(a => t(a.categoryT)))];
        const filterButtons = `
            <button class="article-filter-btn active bg-primary text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md shadow-primary/20" data-filter="all">Semua</button>
            ${categories.map(c => `<button class="article-filter-btn bg-clinical-white text-on-surface border border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5 hover:text-primary px-5 py-2 rounded-full font-bold text-sm transition-all" data-filter="${c.toLowerCase()}">${c}</button>`).join('')}
        `;

        return `
        ${NavbarGuest.render('articles')}
        <main class="min-h-screen bg-background">
            <!-- Hero -->
            <section class="relative pt-32 pb-24 px-6 bg-surface-container-lowest overflow-hidden border-b border-outline-variant/20">
                <div class="absolute inset-0 opacity-20 pointer-events-none">
                    <div class="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply"></div>
                    <div class="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px] mix-blend-multiply"></div>
                </div>
                
                <div class="max-w-container-max mx-auto text-center relative z-10 flex flex-col items-center">
                    <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm mb-6 backdrop-blur-sm shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">menu_book</span>
                        ${t('articles.badge')}
                    </div>
                    <h1 class="font-headline-lg text-4xl md:text-6xl mb-6 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-on-surface via-primary to-secondary leading-tight pb-1">${t('articles.title')}</h1>
                    <p class="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
                        ${t('articles.sub')}
                    </p>
                    
                    <!-- Search Input -->
                    <div class="w-full max-w-2xl mx-auto relative group">
                        <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div class="relative bg-clinical-white p-2 rounded-2xl shadow-md border border-outline-variant/30 flex items-center">
                            <span class="material-symbols-outlined text-on-surface-variant ml-4 mr-2">search</span>
                            <input type="text" id="articleSearch" placeholder="Cari topik rehabilitasi, tips kesehatan..." class="w-full bg-transparent py-3 px-2 focus:outline-none text-on-surface font-medium placeholder:font-normal placeholder:text-on-surface-variant/60">
                        </div>
                    </div>
                    
                    <!-- Filters -->
                    <div class="flex flex-wrap justify-center gap-3 mt-8" id="articleFilters">
                        ${filterButtons}
                    </div>
                </div>
            </section>
            
            <!-- Articles Grid -->
            <section class="py-24 px-6 max-w-container-max mx-auto min-h-[50vh]">
                <div id="articlesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${cards}
                </div>
                
                <!-- Empty State -->
                <div id="articlesEmpty" class="hidden text-center py-20">
                    <div class="w-24 h-24 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="material-symbols-outlined text-[48px] text-on-surface-variant">search_off</span>
                    </div>
                    <h3 class="text-2xl font-bold text-on-surface mb-3">Tidak Ada Hasil Ditemukan</h3>
                    <p class="text-on-surface-variant text-lg">Coba gunakan kata kunci pencarian atau pilih filter kategori yang lain.</p>
                </div>
            </section>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        if (typeof NavbarGuest !== 'undefined' && typeof NavbarGuest.initScrollEffect === 'function') {
            NavbarGuest.initScrollEffect();
        }

        // Search & Filter Logic
        const searchInput = document.getElementById('articleSearch');
        const filterBtns = document.querySelectorAll('.article-filter-btn');
        const cards = document.querySelectorAll('.article-card');
        const emptyState = document.getElementById('articlesEmpty');
        let currentFilter = 'all';

        const filterArticles = () => {
            const query = searchInput.value.toLowerCase().trim();
            let visibleCount = 0;

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const title = card.getAttribute('data-title');
                
                const matchesFilter = currentFilter === 'all' || category === currentFilter;
                const matchesSearch = query === '' || title.includes(query) || category.includes(query);

                if (matchesFilter && matchesSearch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
            
            // Re-trigger ScrollReveal if it exists for visible elements
            if (typeof ScrollReveal !== 'undefined') {
                ScrollReveal().sync();
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', filterArticles);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                filterBtns.forEach(b => {
                    b.classList.remove('active', 'bg-primary', 'text-white', 'shadow-md', 'shadow-primary/20');
                    b.classList.add('bg-clinical-white', 'text-on-surface');
                });
                const target = e.currentTarget;
                target.classList.remove('bg-clinical-white', 'text-on-surface');
                target.classList.add('active', 'bg-primary', 'text-white', 'shadow-md', 'shadow-primary/20');
                
                currentFilter = target.getAttribute('data-filter');
                filterArticles();
            });
        });

        // Initialize ScrollReveal
        if (typeof ScrollReveal !== 'undefined') {
            const sr = ScrollReveal({
                distance: '30px',
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                mobile: true
            });

            sr.reveal('section.relative .max-w-container-max > *', { origin: 'bottom', interval: 100 });
            sr.reveal('.article-card', { origin: 'bottom', interval: 100, delay: 200 });
        }
    }
};
