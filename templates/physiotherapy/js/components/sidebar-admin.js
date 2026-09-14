/* ============================================
   PhysioCare - Admin Sidebar Component
   ============================================ */

const SidebarAdmin = {
render(active = '') {
        const items = [
            { key: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard', href: '#/admin/dashboard' },
            { key: 'therapists', label: t('admin.therapists'), icon: 'groups', href: '#/admin/therapists' },
            { key: 'patients', label: t('admin.patientRecords'), icon: 'medical_information', href: '#/admin/patients' },
            { key: 'branches', label: t('admin.branchManagement'), icon: 'account_tree', href: '#/admin/branches' },
            { key: 'settings', label: t('admin.settings'), icon: 'settings', href: '#/admin/dashboard' }
        ];

        const navItems = items.map(item => {
            const isActive = active === item.key;
            const cls = isActive
                ? 'flex items-center gap-3 px-4 py-3 bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-lg font-button-text text-button-text active:scale-95 transition-transform'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant font-button-text text-button-text hover:bg-surface-container-high dark:hover:bg-tertiary-container transition-colors duration-200';
            return `<a class="${cls}" href="${item.href}">
                <span class="material-symbols-outlined" data-icon="${item.icon}">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');

        return `
        <aside class="h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-inverse-surface shadow-sm z-50 flex flex-col p-4 gap-2">
            <div class="mb-8 px-2 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-clinical-white">
                    <span class="material-symbols-outlined" data-icon="medical_services">medical_services</span>
                </div>
                <div>
<h1 class="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary leading-tight">PhysioAdmin Pro</h1>
                    <p class="font-label-sm text-label-sm text-on-surface-variant">${t('admin.cityCentralBranch')}</p>
                </div>
            </div>
            <nav class="flex-1 space-y-1">
                ${navItems}
            </nav>
            <div class="mt-auto border-t border-outline-variant pt-4 space-y-1">
                <a href="#/booking" class="w-full mb-4 bg-primary text-clinical-white py-3 rounded-lg font-button-text text-button-text flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <span class="material-symbols-outlined" data-icon="add">add</span>
                    ${t('admin.newAppointment')}
                </a>
                <a class="flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-surface-variant font-button-text text-button-text hover:bg-surface-container-high transition-colors" href="#/contact">
                    <span class="material-symbols-outlined" data-icon="help">help</span>
                    <span>${t('admin.support')}</span>
                </a>
                <a id="admin-logout" class="flex items-center gap-3 px-4 py-2 text-on-surface-variant dark:text-surface-variant font-button-text text-button-text hover:bg-surface-container-high transition-colors text-emergency-red cursor-pointer" href="#/admin/login">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span>
                    <span>${t('admin.logout')}</span>
                </a>
            </div>
        </aside>`;
    }
};
