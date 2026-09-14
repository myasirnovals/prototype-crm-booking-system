
// ==================== SAAS BILLING / SUBSCRIPTION ====================
function renderBillingTab() {
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');
    const nameEl = document.getElementById('sp-plan-name');
    const priceEl = document.getElementById('sp-plan-price');
    const btn = document.getElementById('btn-upgrade-saas');
    const icon = document.getElementById('sp-plan-icon');
    const desc = document.getElementById('billing-status-desc');

    if (sub.planId === 'plan-pro') {
        if (nameEl) nameEl.innerText = 'Pro SaaS';
        if (priceEl) priceEl.innerHTML = 'RM49<span class="text-slate-400 text-sm font-normal">/mo</span>';
        if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Active Pro Member';
            btn.className = 'w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-400/30';
            btn.onclick = () => showToast('You are already on the Pro plan.', 'info');
        }
        if (icon) {
            icon.className = 'w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/50';
            icon.querySelector('span').className = 'material-symbols-outlined text-primary text-3xl';
            icon.querySelector('span').innerText = 'auto_awesome';
        }
        if (desc) desc.innerText = 'You are currently on the Pro SaaS plan. Next billing cycle: 1st of next month.';
    }
}

window.upgradeSaaSPlan = function() {
    localStorage.setItem('nutriflow_specialist_sub', JSON.stringify({ planId: 'plan-pro' }));
    showToast('Upgraded to Pro SaaS! 0% Commissions and Unlimited AI Scribes unlocked.', 'success');
    renderBillingTab();
};

// Hook into navigateTo
const _oldAdminNav = window.navigateTo;
window.navigateTo = function(view) {
    if (_oldAdminNav) _oldAdminNav(view);
    if (view === 'admin-profile') setTimeout(renderBillingTab, 50);
};

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profile-billing-section')) renderBillingTab();
});

window.openSaaSUpgradeModal = function() {
    const modal = document.getElementById('saas-upgrade-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderSaaSPlansGrid();
};

window.closeSaaSUpgradeModal = function() {
    const modal = document.getElementById('saas-upgrade-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

function renderSaaSPlansGrid() {
    const grid = document.getElementById('saas-plans-grid');
    if (!grid) return;
    
    // Read B2B SaaS plans set by Control Center
    const plans = JSON.parse(localStorage.getItem('nutriflow_subscription_plans') || '[]');
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');

    const PLAN_STYLES = {
        'slate':   { badge: 'bg-slate-100 text-slate-600',    card: 'border-slate-200',           btn: 'bg-slate-800 hover:bg-slate-700 text-white',  icon: 'text-slate-500',   iconBg: 'bg-slate-500/20' },
        'blue':    { badge: 'bg-blue-100 text-blue-700',      card: 'border-blue-200',             btn: 'bg-blue-600 hover:bg-blue-500 text-white',    icon: 'text-blue-500',    iconBg: 'bg-blue-500/20' },
        'primary': { badge: 'bg-primary/10 text-primary',     card: 'border-primary ring-2 ring-primary/30', btn: 'bg-primary hover:bg-[#005321] text-white', icon: 'text-primary', iconBg: 'bg-primary/20' },
        'amber':   { badge: 'bg-amber-100 text-amber-700',    card: 'border-amber-300',            btn: 'bg-amber-500 hover:bg-amber-400 text-white',  icon: 'text-amber-500',   iconBg: 'bg-amber-400/20' }
    };

    grid.innerHTML = plans.map(plan => {
        const style = PLAN_STYLES[plan.color] || PLAN_STYLES['slate'];
        const isActive = plan.id === sub.planId;
        const isRec = plan.recommended;
        
        const featList = plan.features.map(f => 
            `<li class="flex items-start gap-1.5 text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-emerald-500 text-[14px] mt-px" style="font-variation-settings:'FILL' 1">check_circle</span>${f}</li>`
        ).join('');

        const btnLabel = isActive ? '✓ Current SaaS Plan' : (plan.price === 0 ? 'Switch to Free' : `Upgrade to ${plan.name} — RM${plan.price}/mo`);
        const btnClass = isActive 
            ? 'w-full font-bold text-xs py-2.5 rounded-xl bg-emerald-500 text-white cursor-default' 
            : `w-full font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${style.btn}`;

        return `<div class="relative flex flex-col rounded-2xl border-2 p-5 gap-4 ${style.card}${isActive ? ' shadow-lg' : ''}">
            ${isRec ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">Most Popular</div>' : ''}
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}">
                    <span class="material-symbols-outlined text-xl ${style.icon}" style="font-variation-settings:'FILL' 1">${plan.icon}</span>
                </div>
                <div>
                    <h4 class="font-black text-on-surface text-base">${plan.name}</h4>
                    <p class="text-[11px] text-on-surface-variant">${plan.price === 0 ? 'Free forever' : 'RM' + plan.price + '/mo'}</p>
                </div>
            </div>
            <p class="text-xs text-on-surface-variant">${plan.description}</p>
            <ul class="flex flex-col gap-1.5 flex-grow">${featList}</ul>
            <button onclick="confirmSaaSUpgrade('${plan.id}')" class="${btnClass}">${btnLabel}</button>
        </div>`;
    }).join('');
}

window.confirmSaaSUpgrade = function(planId) {
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');
    if (sub.planId === planId) {
        showToast('You are already on this plan.', 'info');
        return;
    }
    
    localStorage.setItem('nutriflow_specialist_sub', JSON.stringify({ planId: planId }));
    closeSaaSUpgradeModal();
    renderBillingTab();
    showToast('SaaS Subscription updated successfully! 🚀', 'success');
};

// OVERWRITE renderBillingTab to be dynamic
function renderBillingTab() {
    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');
    const plans = JSON.parse(localStorage.getItem('nutriflow_subscription_plans') || '[]');
    
    // Default fallback to Basic EHR if no plans found
    let activePlan = { id: 'plan-free', name: 'Basic EHR', price: 0, color: 'slate', icon: 'badge' };
    if (plans.length > 0) {
        const found = plans.find(p => p.id === sub.planId);
        if (found) activePlan = found;
    }

    const nameEl = document.getElementById('sp-plan-name');
    const priceEl = document.getElementById('sp-plan-price');
    const btn = document.getElementById('btn-upgrade-saas');
    const icon = document.getElementById('sp-plan-icon');
    const desc = document.getElementById('billing-status-desc');

    if (nameEl) nameEl.innerText = activePlan.name;
    if (priceEl) priceEl.innerHTML = `RM${activePlan.price}<span class="text-slate-400 text-sm font-normal">/mo</span>`;
    if (desc) desc.innerText = `You are currently on the ${activePlan.name} plan. Next billing cycle: 1st of next month.`;

    if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">rocket_launch</span> Change SaaS Plan';
        btn.className = 'w-full sm:w-auto bg-primary hover:bg-[#005321] text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-primary-container/30';
        btn.onclick = openSaaSUpgradeModal;
    }

    if (icon) {
        const iconBgs = { 'slate': 'bg-slate-700/50 border-slate-600', 'blue': 'bg-blue-500/20 border-blue-500/50', 'primary': 'bg-primary/20 border-primary/50', 'amber': 'bg-amber-500/20 border-amber-500/50' };
        const iconColors = { 'slate': 'text-white', 'blue': 'text-blue-400', 'primary': 'text-primary', 'amber': 'text-amber-400' };
        
        icon.className = `w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${iconBgs[activePlan.color] || iconBgs['slate']}`;
        icon.querySelector('span').className = `material-symbols-outlined text-3xl ${iconColors[activePlan.color] || iconColors['slate']}`;
        icon.querySelector('span').innerText = activePlan.icon || 'badge';
    }
}

// OVERWRITE renderSaaSPlansGrid to include a fallback
window.renderSaaSPlansGrid = function() {
    const grid = document.getElementById('saas-plans-grid');
    if (!grid) return;
    
    // Read B2B SaaS plans set by Control Center
    let plans = JSON.parse(localStorage.getItem('nutriflow_subscription_plans') || '[]');
    
    // FALLBACK if plans are empty (Control Center hasn't been visited yet)
    if (!plans || plans.length === 0) {
        plans = [
            { id: 'plan-free',    name: 'Basic EHR',    price: 0,  color: 'slate',   icon: 'badge',             description: 'Start your private practice with zero overhead.',          features: ['Standard EHR & Charting', 'Client Portal Access', 'Up to 3 Active Clients', 'Manual Insurance Billing'] },
            { id: 'plan-pro',     name: 'Pro SaaS',     price: 49, color: 'primary', icon: 'auto_awesome',      description: 'The ultimate tool for independent specialists.',           features: ['Unlimited Clients', 'AI ADIME Scribe (Unlimited)', '0% Aggregator Commission', 'Direct-to-Insurance Billing', 'Custom Branding'], recommended: true },
            { id: 'plan-clinic',  name: 'Clinic Team',  price: 149, color: 'amber',   icon: 'domain',            description: 'Scale your practice with multiple practitioners.',        features: ['Up to 5 Practitioners', 'Advanced Analytics', 'Multi-Specialist Routing', 'All Pro SaaS Features'] }
        ];
        localStorage.setItem('nutriflow_subscription_plans', JSON.stringify(plans));
    }

    const sub = JSON.parse(localStorage.getItem('nutriflow_specialist_sub') || '{"planId":"plan-free"}');

    const PLAN_STYLES = {
        'slate':   { badge: 'bg-slate-100 text-slate-600',    card: 'border-slate-200',           btn: 'bg-slate-800 hover:bg-slate-700 text-white',  icon: 'text-slate-500',   iconBg: 'bg-slate-500/20' },
        'blue':    { badge: 'bg-blue-100 text-blue-700',      card: 'border-blue-200',             btn: 'bg-blue-600 hover:bg-blue-500 text-white',    icon: 'text-blue-500',    iconBg: 'bg-blue-500/20' },
        'primary': { badge: 'bg-primary/10 text-primary',     card: 'border-primary ring-2 ring-primary/30', btn: 'bg-primary hover:bg-[#005321] text-white', icon: 'text-primary', iconBg: 'bg-primary/20' },
        'amber':   { badge: 'bg-amber-100 text-amber-700',    card: 'border-amber-300',            btn: 'bg-amber-500 hover:bg-amber-400 text-white',  icon: 'text-amber-500',   iconBg: 'bg-amber-400/20' }
    };

    grid.innerHTML = plans.map(plan => {
        const style = PLAN_STYLES[plan.color] || PLAN_STYLES['slate'];
        const isActive = plan.id === sub.planId;
        const isRec = plan.recommended;
        
        const featList = plan.features.map(f => 
            `<li class="flex items-start gap-1.5 text-[11px] text-on-surface-variant"><span class="material-symbols-outlined text-emerald-500 text-[14px] mt-px" style="font-variation-settings:'FILL' 1">check_circle</span>${f}</li>`
        ).join('');

        const btnLabel = isActive ? '✓ Current SaaS Plan' : (plan.price === 0 ? 'Switch to Free' : `Upgrade to ${plan.name} — RM${plan.price}/mo`);
        const btnClass = isActive 
            ? 'w-full font-bold text-xs py-2.5 rounded-xl bg-emerald-500 text-white cursor-default' 
            : `w-full font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${style.btn}`;

        return `<div class="relative flex flex-col rounded-2xl border-2 p-5 gap-4 ${style.card}${isActive ? ' shadow-lg' : ''}">
            ${isRec ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">Most Popular</div>' : ''}
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}">
                    <span class="material-symbols-outlined text-xl ${style.icon}" style="font-variation-settings:'FILL' 1">${plan.icon}</span>
                </div>
                <div>
                    <h4 class="font-black text-on-surface text-base">${plan.name}</h4>
                    <p class="text-[11px] text-on-surface-variant">${plan.price === 0 ? 'Free forever' : 'RM' + plan.price + '/mo'}</p>
                </div>
            </div>
            <p class="text-xs text-on-surface-variant">${plan.description}</p>
            <ul class="flex flex-col gap-1.5 flex-grow">${featList}</ul>
            <button onclick="confirmSaaSUpgrade('${plan.id}')" class="${btnClass}">${btnLabel}</button>
        </div>`;
    }).join('');
}
