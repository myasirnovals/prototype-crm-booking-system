// Super Admin Control Center Logic

// ==================== STATE MANAGEMENT ====================
const state = {
    activeView: 'analytics',
    nutritionists: [],
    clients: [],
    appointments: [],
    selectedClientForAllocation: null,
    editingPatientId: null
};

let successTrendsChartInstance = null;
let growthChartInstance = null;
let goalsChartInstance = null;

// ==================== SESSION CHECK ====================
function checkSuperAdminSession() {
    if (localStorage.getItem('nutriflow_superadmin_logged') !== 'true') {
        window.location.href = './login.html';
    }
}

// ==================== STATE SYNC ====================
function loadState() {
    // 1. Load Nutritionists
    if (localStorage.getItem('nutriflow_nutritionists')) {
        state.nutritionists = JSON.parse(localStorage.getItem('nutriflow_nutritionists'));
    } else {
        state.nutritionists = [
            { id: 'exp-1', name: 'Dr. Hasan', email: 'hasan@nutriflow.com', specialty: 'Weight Management', status: 'active', avatar: 'DH' },
            { id: 'exp-2', name: 'Dr. Amanda', email: 'amanda@nutriflow.com', specialty: 'Sport Nutrition', status: 'active', avatar: 'DA' },
            { id: 'exp-3', name: 'Dr. Marcus Reid', email: 'm.reid@nutriflow.com', specialty: 'Therapeutic Diets', status: 'active', avatar: 'MR' },
            { id: 'exp-4', name: 'Dr. John Doe', email: 'john@nutriflow.com', specialty: 'Pediatric Nutrition', status: 'active', avatar: 'JD' }
        ];
        saveState();
    }

    // 2. Load Clients/Patients
    if (localStorage.getItem('nutriflow_clients')) {
        state.clients = JSON.parse(localStorage.getItem('nutriflow_clients'));
        // Ensure all clients have an id
        let dirty = false;
        state.clients.forEach(c => {
            if (!c.id) {
                c.id = `pat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                dirty = true;
            }
        });
        if (dirty) saveState();
    } else {
        state.clients = [
            { id: 'pat-1', name: 'Sarah Jenkins', email: 'sarah.j@email.com', goal: 'Weight Loss', compliance: 92, therapist: 'Dr. Hasan', avatar: 'SJ' },
            { id: 'pat-2', name: 'Marcus Reid', email: 'm.reid@email.com', goal: 'Muscle Gain', compliance: 78, therapist: 'Dr. Amanda', avatar: 'MR' },
            { id: 'pat-3', name: 'Elena Lopez', email: 'elena.l@email.com', goal: 'Maintenance', compliance: 95, therapist: 'Dr. Marcus Reid', avatar: 'EL' }
        ];
        saveState();
    }

    // 3. Load Appointments
    if (localStorage.getItem('nutriflow_appointments')) {
        state.appointments = JSON.parse(localStorage.getItem('nutriflow_appointments'));
    } else {
        state.appointments = [
            { id: 'apt-1', clientName: 'Sarah Jenkins', clientEmail: 'sarah.j@email.com', serviceTitle: 'Monthly Progress Review', price: 150, date: '2024-10-24', status: 'approved' },
            { id: 'apt-2', clientName: 'Sarah Jenkins', clientEmail: 'sarah.j@email.com', serviceTitle: 'Meal Plan Adjustment', price: 75, date: '2024-11-05', status: 'approved' },
            { id: 'apt-3', clientName: 'Michael Chang', clientEmail: 'm.chang@email.com', serviceTitle: 'Follow-up & Macros Review', price: 75, date: '2024-10-15', status: 'approved' }
        ];
        saveState();
    }
}

function saveState() {
    localStorage.setItem('nutriflow_nutritionists', JSON.stringify(state.nutritionists));
    localStorage.setItem('nutriflow_clients', JSON.stringify(state.clients));
    localStorage.setItem('nutriflow_appointments', JSON.stringify(state.appointments));
}

// ==================== VIEW ROUTING ====================
window.navigateToView = function(viewName) {
    state.activeView = viewName;

    const links = ['analytics', 'patients', 'nutritionists', 'services', 'subscriptions'];
    links.forEach(l => {
        const linkEl = document.getElementById(`link-${l}`);
        const viewEl = document.getElementById(`view-${l}`);
        if (linkEl) linkEl.classList.toggle('active', l === viewName);
        if (viewEl) viewEl.classList.toggle('hidden', l !== viewName);
    });

    if (viewName === 'analytics') renderAnalyticsCharts();
    else if (viewName === 'patients') renderPatientsTable();
    else if (viewName === 'nutritionists') renderNutritionistsTable();
    else if (viewName === 'services') renderServicesView();
    else if (viewName === 'subscriptions') renderSubscriptionsView();
};

// ==================== SUMMARY STATS ====================
function updateSummaryStats() {
    const totalClientsEl = document.getElementById('stat-total-clients');
    const totalExpertsEl = document.getElementById('stat-total-experts');
    const totalBookingsEl = document.getElementById('stat-total-bookings');
    const avgComplianceEl = document.getElementById('stat-avg-compliance');

    if (totalClientsEl) totalClientsEl.innerText = state.clients.length;
    if (totalExpertsEl) totalExpertsEl.innerText = state.nutritionists.length;
    if (totalBookingsEl) totalBookingsEl.innerText = state.appointments.length;

    if (avgComplianceEl && state.clients.length > 0) {
        const totalComp = state.clients.reduce((acc, c) => acc + (c.compliance || 0), 0);
        const avg = (totalComp / state.clients.length).toFixed(1);
        avgComplianceEl.innerText = `${avg}%`;
    } else if (avgComplianceEl) {
        avgComplianceEl.innerText = '—';
    }

    // Also update the practice metric cards inside the merged analytics view
    const reportTotal = document.getElementById('report-total-patients');
    const reportComp = document.getElementById('report-avg-compliance');
    const reportRevenue = document.getElementById('report-total-revenue');

    if (reportTotal) reportTotal.innerText = state.clients.length;
    if (reportComp) {
        if (state.clients.length > 0) {
            const totalComp = state.clients.reduce((acc, c) => acc + (c.compliance || 0), 0);
            reportComp.innerText = `${(totalComp / state.clients.length).toFixed(1)}%`;
        } else {
            reportComp.innerText = '—';
        }
    }

    if (reportRevenue) {
        const transactions = JSON.parse(localStorage.getItem('nutriflow_payment_transactions') || '[]');
        const paidTxSum = transactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + (t.amount || 0), 0);
        const paidAptsSum = state.appointments.filter(a => a.paymentStatus === 'paid').reduce((acc, a) => acc + (a.price || 0), 0);
        const totalRevenue = Math.max(paidTxSum + paidAptsSum, 2450);
        reportRevenue.innerText = `$${totalRevenue.toLocaleString()}.00`;
    }
}

// ==================== ANALYTICS & CHARTS ====================
function renderAnalyticsCharts() {
    const growthCtx = document.getElementById('chart-growth-bookings');
    if (growthCtx) {
        if (growthChartInstance) growthChartInstance.destroy();
        growthChartInstance = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [
                    {
                        label: 'Registered Patients',
                        data: [1, 2, 2, 3, 3, state.clients.length],
                        borderColor: '#006e2f',
                        backgroundColor: 'rgba(0, 110, 47, 0.07)',
                        fill: true, tension: 0.4, pointRadius: 4,
                        pointBackgroundColor: '#006e2f'
                    },
                    {
                        label: 'Appointments',
                        data: [2, 3, 4, 3, 5, state.appointments.length],
                        borderColor: '#006a61',
                        backgroundColor: 'rgba(0, 106, 97, 0.07)',
                        fill: true, tension: 0.4, pointRadius: 4,
                        pointBackgroundColor: '#006a61'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { font: { size: 11, weight: 'bold' } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    const goalsCtx = document.getElementById('chart-goals');
    if (goalsCtx) {
        if (goalsChartInstance) goalsChartInstance.destroy();
        let weightLoss = 0, muscleGain = 0, maintenance = 0, other = 0;
        state.clients.forEach(c => {
            if (c.goal === 'Weight Loss') weightLoss++;
            else if (c.goal === 'Muscle Gain') muscleGain++;
            else if (c.goal === 'Maintenance') maintenance++;
            else other++;
        });
        goalsChartInstance = new Chart(goalsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Other'],
                datasets: [{ data: [weightLoss, muscleGain, maintenance, other], backgroundColor: ['#006e2f', '#006a61', '#9d4300', '#5c7a5a'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 10, weight: 'bold' }, padding: 12 } } }
            }
        });
    }

    // Also render the compliance trends chart (part of merged analytics view)
    setTimeout(initAdminReportsCharts, 50);
}

// ==================== PATIENTS TABLE ====================
let filteredPatients = [];

function renderPatientsTable(data) {
    const tbody = document.getElementById('patients-table-body');
    if (!tbody) return;

    const patients = data || state.clients;
    filteredPatients = patients;

    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="px-6 py-12 text-center text-on-surface-variant">
                <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined text-4xl text-outline-variant">person_search</span>
                    <p class="text-xs">No patients found. Click "Add Patient" to add one.</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = patients.map(c => {
        const compColor = c.compliance >= 80 ? 'text-emerald-700 bg-emerald-50' : c.compliance >= 60 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
        const goalColors = {
            'Weight Loss': 'bg-blue-50 text-blue-700',
            'Muscle Gain': 'bg-purple-50 text-purple-700',
            'Maintenance': 'bg-teal-50 text-teal-700',
            'Therapeutic Diet': 'bg-orange-50 text-orange-700',
        };
        const goalColor = goalColors[c.goal] || 'bg-slate-100 text-slate-600';
        return `
            <tr class="hover:bg-surface-container-low transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0">${c.avatar || c.name?.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() || 'P'}</div>
                        <span class="font-semibold text-on-background text-xs">${c.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant text-xs">${c.email || '—'}</td>
                <td class="px-6 py-4"><span class="font-bold text-[10px] px-2.5 py-1 rounded-full ${goalColor}">${c.goal}</span></td>
                <td class="px-6 py-4">
                    ${c.therapist
                        ? `<span class="bg-primary/8 text-primary font-semibold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                                <span class="material-symbols-outlined text-[12px]">support_agent</span>${c.therapist}
                           </span>`
                        : `<span class="text-on-surface-variant text-xs italic">Not assigned</span>`}
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="font-bold text-xs px-2.5 py-1 rounded-full ${compColor}">${c.compliance ?? '—'}%</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="openEditPatientModal('${c.id}')" class="text-primary hover:bg-primary/10 font-bold text-[10px] flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                        </button>
                        <button onclick="deletePatient('${c.id}')" class="text-red-500 hover:bg-red-50 font-bold text-[10px] flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">delete</span> Delete
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

window.filterPatientsTable = function() {
    const q = document.getElementById('patient-search')?.value?.toLowerCase() || '';
    const filtered = state.clients.filter(c =>
        c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
    renderPatientsTable(filtered);
};

// ==================== PATIENT MODAL ====================
function populateSpecialistDropdown(selectId, selected = '') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = `<option value="">— Not Assigned —</option>` +
        state.nutritionists.map(n => `<option value="${n.name}" ${n.name === selected ? 'selected' : ''}>${n.name} (${n.specialty})</option>`).join('');
}

window.openAddPatientModal = function() {
    state.editingPatientId = null;
    document.getElementById('patient-modal-title').innerText = 'Add Patient';
    document.getElementById('patient-modal-id').value = '';
    document.getElementById('patient-modal-name').value = '';
    document.getElementById('patient-modal-email').value = '';
    document.getElementById('patient-modal-goal').value = 'Weight Loss';
    document.getElementById('patient-modal-compliance').value = '';
    populateSpecialistDropdown('patient-modal-therapist', '');
    const m = document.getElementById('patient-modal');
    m.classList.remove('hidden'); m.classList.add('flex');
};

window.openEditPatientModal = function(patientId) {
    const p = state.clients.find(c => c.id === patientId);
    if (!p) return;
    state.editingPatientId = patientId;
    document.getElementById('patient-modal-title').innerText = 'Edit Patient';
    document.getElementById('patient-modal-id').value = p.id;
    document.getElementById('patient-modal-name').value = p.name;
    document.getElementById('patient-modal-email').value = p.email || '';
    document.getElementById('patient-modal-goal').value = p.goal || 'Weight Loss';
    document.getElementById('patient-modal-compliance').value = p.compliance ?? '';
    populateSpecialistDropdown('patient-modal-therapist', p.therapist || '');
    const m = document.getElementById('patient-modal');
    m.classList.remove('hidden'); m.classList.add('flex');
};

window.closePatientModal = function() {
    const m = document.getElementById('patient-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
};

window.handleSavePatient = function(e) {
    e.preventDefault();
    const name = document.getElementById('patient-modal-name').value.trim();
    const email = document.getElementById('patient-modal-email').value.trim();
    const goal = document.getElementById('patient-modal-goal').value;
    const compliance = parseInt(document.getElementById('patient-modal-compliance').value) || 0;
    const therapist = document.getElementById('patient-modal-therapist').value;
    const avatar = name.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();

    if (state.editingPatientId) {
        // Edit existing
        const idx = state.clients.findIndex(c => c.id === state.editingPatientId);
        if (idx !== -1) {
            state.clients[idx] = { ...state.clients[idx], name, email, goal, compliance, therapist, avatar };
            showToast(`Patient "${name}" updated successfully!`, 'success');
        }
    } else {
        // Add new
        const newPatient = {
            id: `pat-${Date.now()}`,
            name, email, goal, compliance, therapist, avatar
        };
        state.clients.push(newPatient);
        showToast(`Patient "${name}" added successfully!`, 'success');
    }

    saveState();
    closePatientModal();
    renderPatientsTable();
    updateSummaryStats();
};

window.deletePatient = function(patientId) {
    const p = state.clients.find(c => c.id === patientId);
    if (!p) return;
    if (confirm(`Are you sure you want to remove patient "${p.name}"? This cannot be undone.`)) {
        state.clients = state.clients.filter(c => c.id !== patientId);
        saveState();
        renderPatientsTable();
        updateSummaryStats();
        showToast(`Patient "${p.name}" removed.`, 'info');
    }
};

// ==================== NUTRITIONISTS TABLE ====================
function renderNutritionistsTable() {
    const tbody = document.getElementById('nutritionists-table-body');
    if (!tbody) return;

    const allReviews = JSON.parse(localStorage.getItem('nutriflow_specialist_reviews') || '[]');

    tbody.innerHTML = state.nutritionists.map(n => {
        const clientCount = state.clients.filter(c => c.therapist === n.name).length;
        const statusColor = n.status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100';
        const dotColor = n.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400';
        
        const specReviews = allReviews.filter(r => r.specialist.toLowerCase() === n.name.toLowerCase());
        let ratingVal = '5.0';
        if (specReviews.length > 0) {
            const sum = specReviews.reduce((acc, r) => acc + r.rating, 0);
            ratingVal = (sum / specReviews.length).toFixed(1);
        }

        return `
            <tr class="hover:bg-surface-container-low transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">${n.avatar || 'N'}</div>
                        <div class="flex flex-col">
                            <span class="font-semibold text-on-background text-xs">${n.name}</span>
                            <div class="flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                                <span>★ ${ratingVal}</span>
                                <span class="text-on-surface-variant/70 font-normal">(${specReviews.length} reviews)</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant text-xs">${n.email}</td>
                <td class="px-6 py-4"><span class="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full text-[10px]">${n.specialty}</span></td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full ${statusColor}">
                        <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>${n.status.toUpperCase()}
                    </span>
                </td>
                <td class="px-6 py-4 text-center font-bold text-on-background text-xs">${clientCount}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="openEditNutritionistModal('${n.id}')" class="text-primary hover:bg-primary/10 font-bold text-[10px] flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">edit</span> Edit
                        </button>
                        <button onclick="deleteNutritionist('${n.id}')" class="text-red-500 hover:bg-red-50 font-bold text-[10px] flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">delete</span> Delete
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

window.openAddNutritionistModal = function() {
    document.getElementById('expert-name').value = '';
    document.getElementById('expert-email').value = '';
    document.getElementById('expert-specialty').value = 'Weight Management';
    document.getElementById('expert-status').value = 'active';
    const m = document.getElementById('add-nutritionist-modal');
    m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeAddNutritionistModal = function() {
    const m = document.getElementById('add-nutritionist-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
};

window.handleAddNutritionist = function(e) {
    e.preventDefault();
    const name = document.getElementById('expert-name').value.trim();
    const email = document.getElementById('expert-email').value.trim();
    const specialty = document.getElementById('expert-specialty').value;
    const status = document.getElementById('expert-status').value;
    const avatar = name.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();

    state.nutritionists.push({ id: `exp-${Date.now()}`, name, email, specialty, status, avatar });
    saveState();
    closeAddNutritionistModal();
    renderNutritionistsTable();
    updateSummaryStats();
    showToast(`Registered specialist "${name}" successfully!`, 'success');
};

window.openEditNutritionistModal = function(id) {
    const n = state.nutritionists.find(x => x.id === id);
    if (!n) return;
    document.getElementById('edit-expert-id').value = n.id;
    document.getElementById('edit-expert-name').value = n.name;
    document.getElementById('edit-expert-email').value = n.email;
    document.getElementById('edit-expert-specialty').value = n.specialty;
    document.getElementById('edit-expert-status').value = n.status;
    const m = document.getElementById('edit-nutritionist-modal');
    m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeEditNutritionistModal = function() {
    const m = document.getElementById('edit-nutritionist-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
};

window.handleEditNutritionist = function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-expert-id').value;
    const name = document.getElementById('edit-expert-name').value.trim();
    const email = document.getElementById('edit-expert-email').value.trim();
    const specialty = document.getElementById('edit-expert-specialty').value;
    const status = document.getElementById('edit-expert-status').value;
    const avatar = name.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();

    const idx = state.nutritionists.findIndex(n => n.id === id);
    if (idx !== -1) {
        state.nutritionists[idx] = { ...state.nutritionists[idx], name, email, specialty, status, avatar };
    }
    saveState();
    closeEditNutritionistModal();
    renderNutritionistsTable();
    showToast(`Specialist "${name}" updated successfully!`, 'success');
};

window.deleteNutritionist = function(id) {
    const n = state.nutritionists.find(x => x.id === id);
    if (!n) return;
    if (confirm(`Are you sure you want to remove specialist "${n.name}"?`)) {
        state.nutritionists = state.nutritionists.filter(x => x.id !== id);
        saveState();
        renderNutritionistsTable();
        updateSummaryStats();
        showToast(`Specialist "${n.name}" removed.`, 'info');
    }
};



window.openAllocationModal = function(clientName) {
    state.selectedClientForAllocation = clientName;
    document.getElementById('allocation-client-name').innerText = clientName;
    const currentClient = state.clients.find(c => c.name === clientName);
    const select = document.getElementById('allocation-expert-select');
    if (select) {
        select.innerHTML = `<option value="">— Not Assigned —</option>` +
            state.nutritionists.map(n => `<option value="${n.name}" ${n.name === currentClient?.therapist ? 'selected' : ''}>${n.name} (${n.specialty})</option>`).join('');
    }
    const m = document.getElementById('edit-allocation-modal');
    m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeEditAllocationModal = function() {
    const m = document.getElementById('edit-allocation-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
};

window.saveAllocationChange = function() {
    const expert = document.getElementById('allocation-expert-select').value;
    const client = state.clients.find(c => c.name === state.selectedClientForAllocation);
    if (client) {
        client.therapist = expert || null;
        saveState();
        closeEditAllocationModal();
        renderPatientsTable();
        showToast(`Assigned "${expert || 'none'}" to ${state.selectedClientForAllocation}!`, 'success');
    }
};

// ==================== TOASTS ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('admin-toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastText) return;
    toastText.innerText = message;
    if (type === 'success') {
        toastIcon.innerText = 'check_circle';
        toastIcon.className = 'material-symbols-outlined text-primary text-base';
    } else {
        toastIcon.innerText = 'info';
        toastIcon.className = 'material-symbols-outlined text-secondary text-base';
    }
    toastIcon.style.fontVariationSettings = "'FILL' 1";
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}

// ==================== LOGOUT ====================
window.handleSignOut = function() {
    localStorage.removeItem('nutriflow_superadmin_logged');
    window.location.href = './login.html';
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    checkSuperAdminSession();
    loadState();
    updateSummaryStats();
    navigateToView('analytics');
});

// ==================== REPORTS CHART ====================
function initAdminReportsCharts() {
    const ctxSuccess = document.getElementById('adminSuccessTrendsChartCanvas');
    if (!ctxSuccess) return;
    if (successTrendsChartInstance) successTrendsChartInstance.destroy();
    successTrendsChartInstance = new Chart(ctxSuccess, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Compliance Rate (%)',
                data: [55, 62, 60, 68, 75, 87],
                borderColor: '#006a61',
                backgroundColor: 'rgba(0, 106, 97, 0.07)',
                borderWidth: 2.5,
                pointBackgroundColor: '#006a61',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.35,
                fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#43493e', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#43493e', font: { size: 10 } } }
            }
        }
    });
}

// ==================== SERVICES & PROMO MANAGEMENT ====================

let serviceEditingId = null;
let promoEditingId = null;

function getDefaultServicesForSpecialist(name) {
    const defaults = {
        'Dr. Hasan': [
            { id: 'srv-hasan-1', title: 'Initial Nutrition Assessment', type: 'Online', duration: '60 min', price: 180, icon: 'medical_information' },
            { id: 'srv-hasan-2', 'title': 'Monthly Progress Review', type: 'Online', duration: '30 min', price: 150, icon: 'trending_down' },
            { id: 'srv-hasan-3', title: 'Personalized Meal Plan (4-Week)', type: 'Online', duration: '45 min', price: 220, icon: 'restaurant_menu' }
        ],
        'Dr. Amanda': [
            { id: 'srv-amanda-1', title: 'Sports Performance Nutrition', type: 'In-Person', duration: '60 min', price: 200, icon: 'fitness_center' },
            { id: 'srv-amanda-2', title: 'Muscle Gain Strategy Session', type: 'Online', duration: '45 min', price: 160, icon: 'sports' },
            { id: 'srv-amanda-3', title: 'Pre-Competition Nutrition Plan', type: 'Online', duration: '60 min', price: 240, icon: 'emoji_events' }
        ],
        'Dr. Marcus Reid': [
            { id: 'srv-marcus-1', title: 'Therapeutic Diet Consultation', type: 'In-Person', duration: '60 min', price: 190, icon: 'healing' },
            { id: 'srv-marcus-2', title: 'Medical Nutrition Therapy', type: 'Online', duration: '50 min', price: 175, icon: 'medication' }
        ],
        'Dr. John Doe': [
            { id: 'srv-john-1', title: 'Pediatric Nutrition Assessment', type: 'In-Person', duration: '60 min', price: 170, icon: 'child_care' },
            { id: 'srv-john-2', title: 'Child Growth Monitoring', type: 'Online', duration: '30 min', price: 130, icon: 'monitor_weight' }
        ]
    };
    return defaults[name] || [
        { id: `srv-${Date.now()}`, title: 'General Nutrition Consultation', type: 'Online', duration: '45 min', price: 150, icon: 'nutrition' }
    ];
}

function getServicesForSpecialist(name) {
    const key = `nutriflow_services_${name}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    const defaults = getDefaultServicesForSpecialist(name);
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
}

function saveServicesForSpecialist(name, services) {
    localStorage.setItem(`nutriflow_services_${name}`, JSON.stringify(services));
}

function getPromos() {
    const stored = localStorage.getItem('nutriflow_global_promos');
    if (stored) return JSON.parse(stored);
    const defaults = [
        { id: 'promo-1', code: 'WELCOME10', value: 10 },
        { id: 'promo-2', code: 'NUTRIFIT15', value: 15 },
        { id: 'promo-3', code: 'FIRSTSESS', value: 20 }
    ];
    localStorage.setItem('nutriflow_global_promos', JSON.stringify(defaults));
    return defaults;
}

function savePromos(promos) {
    localStorage.setItem('nutriflow_global_promos', JSON.stringify(promos));
}

function renderServicesView() {
    // Populate specialist dropdown
    const filter = document.getElementById('service-specialist-filter');
    if (filter) {
        filter.innerHTML = state.nutritionists.map(n => `<option value="${n.name}">${n.name} — ${n.specialty}</option>`).join('');
    }
    loadSpecialistServicesForOwner();
    renderPromosTable();
}

window.loadSpecialistServicesForOwner = function() {
    const filter = document.getElementById('service-specialist-filter');
    const selectedName = filter ? filter.value : (state.nutritionists[0]?.name || '');
    const services = getServicesForSpecialist(selectedName);
    const tbody = document.getElementById('owner-services-table-body');
    if (!tbody) return;

    if (services.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-xs text-on-surface-variant">No services found for this specialist.</td></tr>`;
        return;
    }

    tbody.innerHTML = services.map(srv => `
        <tr class="hover:bg-surface-container-low transition-colors">
            <td class="px-6 py-4 font-semibold text-on-background">${srv.title}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${srv.type === 'Online' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}">${srv.type}</span>
            </td>
            <td class="px-6 py-4 text-on-surface-variant">${srv.duration}</td>
            <td class="px-6 py-4 text-right font-bold text-primary">RM${srv.price}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openEditServiceModal('${selectedName}', '${srv.id}')" class="text-xs font-semibold text-primary hover:text-[#005321] flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">edit</span> Edit
                    </button>
                    <button onclick="deleteService('${selectedName}', '${srv.id}')" class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">delete</span> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

function renderPromosTable() {
    const promos = getPromos();
    const tbody = document.getElementById('owner-promos-table-body');
    if (!tbody) return;

    if (promos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-xs text-on-surface-variant">No promo codes yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = promos.map(p => `
        <tr class="hover:bg-surface-container-low transition-colors">
            <td class="px-6 py-4">
                <span class="font-mono font-bold text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-200">${p.code}</span>
            </td>
            <td class="px-6 py-4 font-bold text-primary">-RM${p.value}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openEditPromoModal('${p.id}')" class="text-xs font-semibold text-primary hover:text-[#005321] flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button onclick="deletePromo('${p.id}')" class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --- Service CRUD ---
window.openAddServiceModal = function() {
    serviceEditingId = null;
    const filter = document.getElementById('service-specialist-filter');
    document.getElementById('service-modal-title').innerText = `Add Service — ${filter?.value || ''}`;
    document.getElementById('service-modal-id').value = '';
    document.getElementById('service-modal-title-input').value = '';
    document.getElementById('service-modal-type').value = 'Online';
    document.getElementById('service-modal-duration').value = '';
    document.getElementById('service-modal-price').value = '';
    const modal = document.getElementById('service-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.openEditServiceModal = function(specialistName, serviceId) {
    const services = getServicesForSpecialist(specialistName);
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;
    serviceEditingId = serviceId;
    document.getElementById('service-modal-title').innerText = `Edit Service — ${specialistName}`;
    document.getElementById('service-modal-id').value = serviceId;
    document.getElementById('service-modal-title-input').value = srv.title;
    document.getElementById('service-modal-type').value = srv.type;
    document.getElementById('service-modal-duration').value = srv.duration;
    document.getElementById('service-modal-price').value = srv.price;
    const modal = document.getElementById('service-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.closeServiceModal = function() {
    const modal = document.getElementById('service-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
};

window.handleSaveService = function(e) {
    e.preventDefault();
    const filter = document.getElementById('service-specialist-filter');
    const specialistName = filter?.value || '';
    const services = getServicesForSpecialist(specialistName);
    const title = document.getElementById('service-modal-title-input').value.trim();
    const type = document.getElementById('service-modal-type').value;
    const duration = document.getElementById('service-modal-duration').value.trim();
    const price = parseInt(document.getElementById('service-modal-price').value);

    if (serviceEditingId) {
        const idx = services.findIndex(s => s.id === serviceEditingId);
        if (idx !== -1) services[idx] = { ...services[idx], title, type, duration, price };
    } else {
        services.push({ id: `srv-${Date.now()}`, title, type, duration, price, icon: 'nutrition' });
    }

    saveServicesForSpecialist(specialistName, services);
    closeServiceModal();
    loadSpecialistServicesForOwner();
    showToast(serviceEditingId ? 'Service updated successfully!' : 'New service added!', 'success');
};

window.deleteService = function(specialistName, serviceId) {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    let services = getServicesForSpecialist(specialistName);
    services = services.filter(s => s.id !== serviceId);
    saveServicesForSpecialist(specialistName, services);
    loadSpecialistServicesForOwner();
    showToast('Service deleted.', 'success');
};

// --- Promo CRUD ---
window.openAddPromoModal = function() {
    promoEditingId = null;
    document.getElementById('promo-modal-title').innerText = 'Add Promo Code';
    document.getElementById('promo-modal-id').value = '';
    document.getElementById('promo-modal-code').value = '';
    document.getElementById('promo-modal-value').value = '';
    const modal = document.getElementById('promo-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.openEditPromoModal = function(promoId) {
    const promos = getPromos();
    const promo = promos.find(p => p.id === promoId);
    if (!promo) return;
    promoEditingId = promoId;
    document.getElementById('promo-modal-title').innerText = 'Edit Promo Code';
    document.getElementById('promo-modal-id').value = promoId;
    document.getElementById('promo-modal-code').value = promo.code;
    document.getElementById('promo-modal-value').value = promo.value;
    const modal = document.getElementById('promo-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.closePromoModal = function() {
    const modal = document.getElementById('promo-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
};

window.handleSavePromo = function(e) {
    e.preventDefault();
    const promos = getPromos();
    const code = document.getElementById('promo-modal-code').value.trim().toUpperCase();
    const value = parseInt(document.getElementById('promo-modal-value').value);

    if (promoEditingId) {
        const idx = promos.findIndex(p => p.id === promoEditingId);
        if (idx !== -1) promos[idx] = { ...promos[idx], code, value };
    } else {
        if (promos.find(p => p.code === code)) {
            showToast('Promo code already exists!', 'error');
            return;
        }
        promos.push({ id: `promo-${Date.now()}`, code, value });
    }

    savePromos(promos);
    closePromoModal();
    renderPromosTable();
    showToast(promoEditingId ? 'Promo updated!' : `Promo code "${code}" added!`, 'success');
};

window.deletePromo = function(promoId) {
    if (!confirm('Delete this promo code?')) return;
    let promos = getPromos();
    promos = promos.filter(p => p.id !== promoId);
    savePromos(promos);
    renderPromosTable();
    showToast('Promo code deleted.', 'success');
};


// ==================== SUBSCRIPTIONS MANAGEMENT ====================

let planEditingId = null;

const CC_DEFAULT_PLANS = [
    { id: 'plan-free',    name: 'Basic EHR',    price: 0,  color: 'slate',   icon: 'badge',             description: 'Start your private practice with zero overhead.',          features: ['Standard EHR & Charting', 'Client Portal Access', 'Up to 3 Active Clients', 'Manual Insurance Billing'] },
    { id: 'plan-pro',     name: 'Pro SaaS',     price: 49, color: 'primary', icon: 'auto_awesome',      description: 'The ultimate tool for independent specialists.',           features: ['Unlimited Clients', 'AI ADIME Scribe (Unlimited)', '0% Aggregator Commission', 'Direct-to-Insurance Billing', 'Custom Branding'], recommended: true },
    { id: 'plan-clinic',  name: 'Clinic Team',  price: 149, color: 'amber',   icon: 'domain',            description: 'Scale your practice with multiple practitioners.',        features: ['Up to 5 Practitioners', 'Advanced Analytics', 'Multi-Specialist Routing', 'All Pro SaaS Features'] }
];

function ccGetSubscriptionPlans() {
    const stored = localStorage.getItem('nutriflow_subscription_plans');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('nutriflow_subscription_plans', JSON.stringify(CC_DEFAULT_PLANS));
    return CC_DEFAULT_PLANS;
}

function ccSaveSubscriptionPlans(plans) {
    localStorage.setItem('nutriflow_subscription_plans', JSON.stringify(plans));
}

function ccGetSubscriberCount(planId) {
    // Count clients subscribed to this plan
    const clients = JSON.parse(localStorage.getItem('nutriflow_clients') || '[]');
    const clientSub = localStorage.getItem('nutriflow_client_subscription');
    let count = 0;
    if (clientSub) {
        const sub = JSON.parse(clientSub);
        if (sub.planId === planId) count++;
    }
    return count;
}

function renderSubscriptionsView() {
    const plans = ccGetSubscriptionPlans();

    // Stats
    const totalSubs = plans.reduce((acc, p) => acc + ccGetSubscriberCount(p.id), 0);
    const mrr = plans.reduce((acc, p) => acc + (ccGetSubscriberCount(p.id) * p.price), 0);
    const mostPop = plans.reduce((a, b) => ccGetSubscriberCount(a.id) >= ccGetSubscriberCount(b.id) ? a : b);

    const statTotal = document.getElementById('sub-stat-total');
    const statMrr   = document.getElementById('sub-stat-mrr');
    const statPop   = document.getElementById('sub-stat-popular');
    const statPlans = document.getElementById('sub-stat-plans');

    if (statTotal) statTotal.innerText = totalSubs;
    if (statMrr)   statMrr.innerText   = 'RM' + mrr;
    if (statPop)   statPop.innerText   = mostPop ? mostPop.name : '—';
    if (statPlans) statPlans.innerText  = plans.length;

    // Table
    const tbody = document.getElementById('subscription-plans-tbody');
    if (!tbody) return;

    const colorBadge = { slate: 'bg-slate-100 text-slate-600', blue: 'bg-blue-100 text-blue-700', primary: 'bg-primary/10 text-primary', amber: 'bg-amber-100 text-amber-700' };

    tbody.innerHTML = plans.map(plan => {
        const subs = ccGetSubscriberCount(plan.id);
        const badge = colorBadge[plan.color] || colorBadge['slate'];
        const topFeatures = plan.features.slice(0, 2).join(', ') + (plan.features.length > 2 ? ' +' + (plan.features.length - 2) + ' more' : '');
        return `<tr class="hover:bg-surface-container-low transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${badge}">${plan.name}</span>
                    ${plan.recommended ? '<span class="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Popular</span>' : ''}
                </div>
            </td>
            <td class="px-6 py-4 font-bold text-primary">${plan.price === 0 ? 'Free' : 'RM' + plan.price + '/mo'}</td>
            <td class="px-6 py-4 text-on-surface-variant max-w-xs truncate">${topFeatures}</td>
            <td class="px-6 py-4 text-center">
                <span class="font-bold text-on-background">${subs}</span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openEditPlanModal('${plan.id}')" class="text-xs font-semibold text-primary hover:text-[#005321] flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">edit</span> Edit
                    </button>
                    <button onclick="deletePlan('${plan.id}')" class="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors">
                        <span class="material-symbols-outlined text-[15px]">delete</span> Delete
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

window.openAddPlanModal = function() {
    planEditingId = null;
    document.getElementById('plan-modal-title').innerText = 'Add Subscription Plan';
    document.getElementById('plan-modal-id').value = '';
    document.getElementById('plan-modal-name').value = '';
    document.getElementById('plan-modal-price').value = '';
    document.getElementById('plan-modal-color').value = 'primary';
    document.getElementById('plan-modal-desc').value = '';
    document.getElementById('plan-modal-features').value = '';
    const modal = document.getElementById('plan-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.openEditPlanModal = function(planId) {
    const plans = ccGetSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    planEditingId = planId;
    document.getElementById('plan-modal-title').innerText = 'Edit Plan: ' + plan.name;
    document.getElementById('plan-modal-id').value = planId;
    document.getElementById('plan-modal-name').value = plan.name;
    document.getElementById('plan-modal-price').value = plan.price;
    document.getElementById('plan-modal-color').value = plan.color;
    document.getElementById('plan-modal-desc').value = plan.description;
    document.getElementById('plan-modal-features').value = plan.features.join('\n');
    const modal = document.getElementById('plan-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.closePlanModal = function() {
    const modal = document.getElementById('plan-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
};

window.handleSavePlan = function(e) {
    e.preventDefault();
    const plans = ccGetSubscriptionPlans();
    const name  = document.getElementById('plan-modal-name').value.trim();
    const price = parseInt(document.getElementById('plan-modal-price').value);
    const color = document.getElementById('plan-modal-color').value;
    const desc  = document.getElementById('plan-modal-desc').value.trim();
    const features = document.getElementById('plan-modal-features').value
        .split('\n').map(f => f.trim()).filter(f => f.length > 0);

    if (planEditingId) {
        const idx = plans.findIndex(p => p.id === planEditingId);
        if (idx !== -1) plans[idx] = { ...plans[idx], name, price, color, description: desc, features };
    } else {
        plans.push({ id: 'plan-' + Date.now(), name, price, color, description: desc, features, icon: 'star' });
    }

    ccSaveSubscriptionPlans(plans);
    closePlanModal();
    renderSubscriptionsView();
    showToast(planEditingId ? 'Plan updated!' : 'New plan added!', 'success');
};

window.deletePlan = function(planId) {
    if (!confirm('Delete this subscription plan?')) return;
    let plans = ccGetSubscriptionPlans();
    plans = plans.filter(p => p.id !== planId);
    ccSaveSubscriptionPlans(plans);
    renderSubscriptionsView();
    showToast('Plan deleted.', 'success');
};
