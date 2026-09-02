/**
 * ==========================================================================
 * SISTEM MANAJEMEN RESERVASI & CRM KLINIK TERPADU
 * Application JavaScript Engine (State Management, Triple-Constraint,
 * Dynamic Intake, Referral Bridging, Notifications & Clinic Operations)
 * ==========================================================================
 */

// --- INITIAL MOCK DATA STORAGE (Persisted in LocalStorage) ---
const DEFAULT_APP_DATA = {
  currentTenant: {
    id: 't-01',
    name: 'Klinik Terpadu Sehat Sentosa',
    brand: 'Sehat Sentosa Healthcare & TCM',
    logo: '🏥'
  },
  branches: [
    {
      id: 'br-01',
      name: 'Cabang Jakarta Pusat (Menteng)',
      city: 'Jakarta',
      address: 'Jl. Teuku Cik Ditiro No. 42, Menteng, Jakarta Pusat',
      phone: '+62 21 3901234',
      hours: '08:00 - 20:00 WIB',
      distance: '1.2 km',
      facilities: ['Poli Spesialis', 'TCM Akupunktur', 'Fisioterapi', 'Parkir VIP', 'Apotek']
    },
    {
      id: 'br-02',
      name: 'Cabang Jakarta Selatan (Pondok Indah)',
      city: 'Jakarta',
      address: 'Jl. Metro Pondok Indah Blok TB No. 18, Jakarta Selatan',
      phone: '+62 21 7505678',
      hours: '08:00 - 21:00 WIB',
      distance: '8.5 km',
      facilities: ['TCM & Akupunktur', 'Medical Spa Suite', 'Rehabilitasi Medik', 'Kafe Herbal']
    },
    {
      id: 'br-03',
      name: 'Cabang Surabaya (Gubeng)',
      city: 'Surabaya',
      address: 'Jl. Raya Gubeng No. 88, Surabaya, Jawa Timur',
      phone: '+62 31 5032111',
      hours: '08:00 - 19:00 WIB',
      distance: 'Antar Kota',
      facilities: ['Poli Umum & Spesialis', 'Fisioterapi', 'Bekam Medik']
    },
    {
      id: 'br-04',
      name: 'Cabang Singapore (Novena Medical Hub)',
      city: 'Singapore',
      address: '10 Sinaran Drive, #09-12 Novena Specialist Center, Singapore',
      phone: '+65 6789 0123',
      hours: '09:00 - 18:00 SGT',
      distance: 'Regional',
      facilities: ['TCM Pain Clinic', 'Acupuncture', 'Private Therapy Suites']
    }
  ],
  categories: [
    { id: 'all', name: 'Semua Layanan', icon: '✨' },
    { id: 'tcm', name: 'TCM & Akupunktur', icon: '☯️' },
    { id: 'physio', name: 'Fisioterapi & Rehab', icon: '🏃' },
    { id: 'spa', name: 'Spa Medis & Relaksasi', icon: '🌿' },
    { id: 'medical', name: 'Klinik Spesialis Medis', icon: '🩺' },
    { id: 'cupping', name: 'Bekam & Terapi Herbal', icon: '🍵' }
  ],
  services: [
    {
      id: 'srv-01',
      categoryId: 'tcm',
      name: 'Akupunktur Medis & Stimulasi Syaraf',
      intakeProfile: 'TCM_PHYSIO',
      duration: 45,
      buffer: 15,
      price: 275000,
      deposit: 50000,
      requiresRoom: 'Ruang Akupunktur',
      requiresEquipment: 'Electro-Acupuncture Device',
      description: 'Terapi tusuk jarum steril dipadu stimulasi elektro untuk meredakan nyeri syaraf kejepit, migrain, stroke rehabilitation, dan insomnia.',
      tags: ['Populer', 'Nyeri Kronis']
    },
    {
      id: 'srv-02',
      categoryId: 'physio',
      name: 'Fisioterapi Muskuloskeletal & Postur',
      intakeProfile: 'TCM_PHYSIO',
      duration: 60,
      buffer: 15,
      price: 320000,
      deposit: 50000,
      requiresRoom: 'Gym Rehab / Bed Fisioterapi',
      requiresEquipment: 'Ultrasound & TENS Therapy',
      description: 'Rehabilitasi cedera olahraga, sakit leher/bahu (Frozen Shoulder), nyeri pinggang (LBP), koreksi postur, dan penguatan otot dipandu fisioterapis berlisensi.',
      tags: ['Best Seller', 'Rehabilitasi']
    },
    {
      id: 'srv-03',
      categoryId: 'spa',
      name: 'Deep Tissue Therapeutic Massage & Aromaterapi',
      intakeProfile: 'SPA_WELLNESS',
      duration: 90,
      buffer: 20,
      price: 350000,
      deposit: 75000,
      requiresRoom: 'VIP Wellness Suite',
      requiresEquipment: 'Aromatherapy Diffuser & Hot Stone',
      description: 'Pijat relaksasi medik mendalam untuk mengurai ketegangan otot fascia, memperlancar sirkulasi darah dengan minyak esensial herbal organik.',
      tags: ['Relaksasi', 'Spa Premium']
    },
    {
      id: 'srv-04',
      categoryId: 'medical',
      name: 'Konsultasi Dokter Spesialis Penyakit Dalam (Sp.PD)',
      intakeProfile: 'MEDICAL_CLINIC',
      duration: 30,
      buffer: 10,
      price: 350000,
      deposit: 100000,
      requiresRoom: 'Ruang Poli Medis 1',
      requiresEquipment: 'Stetoskop & Pemeriksaan Diagnostik',
      description: 'Evaluasi menyeluruh penyakit metabolik, hipertensi, diabetes, gangguan lambung, dan penanganan rujukan faskes/BPJS/Asuransi.',
      tags: ['Medis', 'Rujukan Ready']
    },
    {
      id: 'srv-05',
      categoryId: 'cupping',
      name: 'Bekam Medis Steril & Detoksifikasi',
      intakeProfile: 'TCM_PHYSIO',
      duration: 45,
      buffer: 15,
      price: 200000,
      deposit: 50000,
      requiresRoom: 'Ruang Tindakan Steril',
      requiresEquipment: 'Paket Kop & Jarum Disposable',
      description: 'Terapi bekam kering/basah menggunakan perlengkapan sekali pakai (disposable) sesuai standar higienitas Kemenkes RI untuk membuang toksin.',
      tags: ['Detoks', 'Higienis']
    },
    {
      id: 'srv-06',
      categoryId: 'spa',
      name: 'Refleksi Titik Akupresur Kaki & Tangan',
      intakeProfile: 'SPA_WELLNESS',
      duration: 60,
      buffer: 15,
      price: 180000,
      deposit: 50000,
      requiresRoom: 'Lounge Refleksi',
      requiresEquipment: 'Foot Soak Herbal & Wooden Stick',
      description: 'Stimulasi titik zona refleksi organ tubuh pada telapak kaki untuk menyeimbangkan energi tubuh dan memulihkan stamina.',
      tags: ['Cepat Segar', 'Kebugaran']
    }
  ],
  practitioners: [
    {
      id: 'dr-01',
      name: 'dr. Budi Santoso, Sp.PD',
      role: 'Dokter Spesialis Penyakit Dalam',
      gender: 'MALE',
      rating: '4.9 (184 ulasan)',
      avatar: '👨‍⚕️',
      specialty: 'medical',
      branchIds: ['br-01', 'br-02'],
      days: ['Senin', 'Rabu', 'Jumat', 'Sabtu'],
      slotsMorning: ['09:00', '09:30', '10:00', '10:30', '11:00'],
      slotsAfternoon: ['14:00', '14:30', '15:00', '16:00', '16:30']
    },
    {
      id: 'dr-02',
      name: 'Sinse Huang Wei, B.Med (TCM)',
      role: 'Praktisi Akupunktur & TCM Bersertifikat',
      gender: 'MALE',
      rating: '5.0 (290 ulasan)',
      avatar: '👨‍⚕️',
      specialty: 'tcm',
      branchIds: ['br-01', 'br-02', 'br-04'],
      days: ['Senin', 'Selasa', 'Kamis', 'Jumat', 'Sabtu'],
      slotsMorning: ['08:30', '09:15', '10:00', '11:00'],
      slotsAfternoon: ['13:30', '14:30', '15:30', '16:30', '17:30', '18:30']
    },
    {
      id: 'dr-03',
      name: 'Siti Nurhaliza, S.Ft, Ftr',
      role: 'Fisioterapis Senior (Muskuloskeletal)',
      gender: 'FEMALE',
      rating: '4.9 (145 ulasan)',
      avatar: '👩‍⚕️',
      specialty: 'physio',
      branchIds: ['br-01', 'br-02', 'br-03'],
      days: ['Setiap Hari'],
      slotsMorning: ['08:00', '09:00', '10:00', '11:00'],
      slotsAfternoon: ['13:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
      id: 'dr-04',
      name: 'Ni Made Ayu Citra',
      role: 'Terapis Wellness & Aromaterapi',
      gender: 'FEMALE',
      rating: '4.8 (210 ulasan)',
      avatar: '👩',
      specialty: 'spa',
      branchIds: ['br-01', 'br-02'],
      days: ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      slotsMorning: ['09:00', '10:30'],
      slotsAfternoon: ['13:00', '14:30', '16:00', '17:30', '19:00']
    },
    {
      id: 'dr-05',
      name: 'Ust. Ahmad Fauzan, S.Pd.I, C.Ht',
      role: 'Praktisi Bekam Medik & Herbal',
      gender: 'MALE',
      rating: '4.9 (98 ulasan)',
      avatar: '👳‍♂️',
      specialty: 'cupping',
      branchIds: ['br-01', 'br-03'],
      days: ['Senin', 'Kamis', 'Sabtu', 'Minggu'],
      slotsMorning: ['08:30', '09:30', '10:30'],
      slotsAfternoon: ['14:00', '15:00', '16:00']
    }
  ],
  bookings: [
    {
      id: 'BK-20260901-0812',
      code: 'BK-20260901-0812',
      patientName: 'Rendra Pratama',
      patientPhone: '+62 812 3456 7890',
      patientEmail: 'rendra.pratama@example.com',
      patientType: 'REGULAR',
      branchId: 'br-01',
      branchName: 'Cabang Jakarta Pusat (Menteng)',
      serviceId: 'srv-01',
      serviceName: 'Akupunktur Medis & Stimulasi Syaraf',
      practitionerId: 'dr-02',
      practitionerName: 'Sinse Huang Wei, B.Med (TCM)',
      roomName: 'Ruang Akupunktur 1',
      appointmentDate: '2026-09-01',
      timeSlot: '09:15',
      duration: 45,
      status: 'CONFIRMED',
      paymentStatus: 'DEPOSIT_PAID',
      totalAmount: 275000,
      paidAmount: 50000,
      remainingAmount: 225000,
      channel: 'WHATSAPP',
      queueNo: 'A-01',
      painAreas: ['Leher & Bahu', 'Punggung Atas'],
      complaints: 'Kaku leher akibat terlalu lama bekerja di depan laptop.',
      createdAt: '2026-09-01T07:40:00.000Z'
    },
    {
      id: 'BK-20260901-0945',
      code: 'BK-20260901-0945',
      patientName: 'Jessica Tanujaya',
      patientPhone: '+62 818 9988 7766',
      patientEmail: 'jessica.tan@corp.sg',
      patientType: 'INSURANCE',
      branchId: 'br-01',
      branchName: 'Cabang Jakarta Pusat (Menteng)',
      serviceId: 'srv-04',
      serviceName: 'Konsultasi Dokter Spesialis Penyakit Dalam (Sp.PD)',
      practitionerId: 'dr-01',
      practitionerName: 'dr. Budi Santoso, Sp.PD',
      roomName: 'Ruang Poli Medis 1',
      appointmentDate: '2026-09-01',
      timeSlot: '10:00',
      duration: 30,
      status: 'CHECKED_IN',
      paymentStatus: 'FULLY_PAID',
      totalAmount: 350000,
      paidAmount: 350000,
      remainingAmount: 0,
      channel: 'WHATSAPP',
      queueNo: 'B-02',
      painAreas: ['Lambung / Perut'],
      complaints: 'Nyeri ulu hati kambuh sejak 3 hari.',
      referralData: {
        number: 'REF/MED/2026/0882',
        facility: 'Klinik Pratama Menteng Sehat',
        docUrl: 'https://storage.klinik.com/ephemeral/ref-0945.pdf',
        forwardStatus: 'SENT',
        forwardedAt: '2026-09-01 08:30 WIB'
      },
      createdAt: '2026-09-01T08:15:00.000Z'
    },
    {
      id: 'BK-20260901-1120',
      code: 'BK-20260901-1120',
      patientName: 'Bambang Soediro',
      patientPhone: '+62 813 1122 3344',
      patientEmail: 'bambang.s@domain.id',
      patientType: 'BPJS_REFERRAL',
      branchId: 'br-01',
      branchName: 'Cabang Jakarta Pusat (Menteng)',
      serviceId: 'srv-02',
      serviceName: 'Fisioterapi Muskuloskeletal & Postur',
      practitionerId: 'dr-03',
      practitionerName: 'Siti Nurhaliza, S.Ft, Ftr',
      roomName: 'Gym Rehab 1',
      appointmentDate: '2026-09-01',
      timeSlot: '11:00',
      duration: 60,
      status: 'IN_PROGRESS',
      paymentStatus: 'PAY_AT_CLINIC',
      totalAmount: 320000,
      paidAmount: 0,
      remainingAmount: 320000,
      channel: 'EMAIL',
      queueNo: 'C-01',
      painAreas: ['Pinggang / LBP', 'Lutut Kanan'],
      referralData: {
        number: 'BPJS-FAS-774921-2026',
        facility: 'Puskesmas Gambir 1',
        docUrl: 'https://storage.klinik.com/ephemeral/ref-1120.pdf',
        forwardStatus: 'SENT',
        forwardedAt: '2026-09-01 08:45 WIB'
      },
      createdAt: '2026-09-01T08:20:00.000Z'
    }
  ],
  referralsLog: [
    {
      id: 'ref-log-01',
      bookingCode: 'BK-20260901-0945',
      patientName: 'Jessica Tanujaya',
      refNo: 'REF/MED/2026/0882',
      fromFacility: 'Klinik Pratama Menteng Sehat',
      targetSIMRS: 'SIMRS-EMR-HQ (Endpoint: /api/v1/intake/referral)',
      status: 'SENT',
      httpCode: 200,
      ttlRemaining: '68 jam 40 menit (Ephemeral Auto-Delete)',
      payloadPreview: {
        booking_id: 'BK-20260901-0945',
        patient_name: 'Jessica Tanujaya',
        patient_type: 'INSURANCE',
        referral_doc: 'ephemeral://ref-0945.pdf (Encrypted AES-256)',
        appointment: '2026-09-01 10:00'
      }
    },
    {
      id: 'ref-log-02',
      bookingCode: 'BK-20260901-1120',
      patientName: 'Bambang Soediro',
      refNo: 'BPJS-FAS-774921-2026',
      fromFacility: 'Puskesmas Gambir 1',
      targetSIMRS: 'SIMRS-EMR-HQ (Endpoint: /api/v1/intake/referral)',
      status: 'SENT',
      httpCode: 200,
      ttlRemaining: '69 jam 10 menit (Ephemeral Auto-Delete)',
      payloadPreview: {
        booking_id: 'BK-20260901-1120',
        patient_name: 'Bambang Soediro',
        patient_type: 'BPJS_REFERRAL',
        referral_doc: 'ephemeral://ref-1120.pdf (Encrypted AES-256)',
        appointment: '2026-09-01 11:00'
      }
    }
  ],
  notificationsLog: [
    {
      id: 'notif-01',
      bookingCode: 'BK-20260901-0812',
      channel: 'WHATSAPP',
      recipient: '+62 812 3456 7890',
      type: 'BOOKING_CONFIRMATION',
      status: 'DELIVERED',
      sentAt: '01 Sep 2026 07:41 WIB',
      readStatus: 'READ (Double Blue Tick)',
      openRate: '98%'
    },
    {
      id: 'notif-02',
      bookingCode: 'BK-20260901-0812',
      channel: 'WHATSAPP',
      recipient: '+62 812 3456 7890',
      type: 'REMINDER_H24',
      status: 'DELIVERED',
      sentAt: '01 Sep 2026 08:00 WIB',
      readStatus: 'READ',
      openRate: '98%'
    },
    {
      id: 'notif-03',
      bookingCode: 'BK-20260901-1120',
      channel: 'EMAIL',
      recipient: 'bambang.s@domain.id',
      type: 'BOOKING_CONFIRMATION_ICS',
      status: 'SENT',
      sentAt: '01 Sep 2026 08:21 WIB',
      readStatus: 'OPENED (with .ics calendar attached)',
      openRate: '82%'
    }
  ],
  liveQueue: [
    { queueNo: 'A-01', name: 'Rendra Pratama', service: 'Akupunktur Medis', doc: 'Sinse Huang Wei', status: 'WAITING', room: 'Ruang Akupunktur 1' },
    { queueNo: 'B-02', name: 'Jessica Tanujaya', service: 'Poli Spesialis Sp.PD', doc: 'dr. Budi Santoso', status: 'CALLED', room: 'Ruang Poli Medis 1' },
    { queueNo: 'C-01', name: 'Bambang Soediro', service: 'Fisioterapi Postur', doc: 'Siti Nurhaliza', status: 'SERVING', room: 'Gym Rehab 1' }
  ]
};

// --- DATA ACCESS LAYER WITH LOCALSTORAGE ---
function getAppData() {
  const stored = localStorage.getItem('KLINIK_APP_DATA_V1');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse local storage data, fallback to default', e);
    }
  }
  localStorage.setItem('KLINIK_APP_DATA_V1', JSON.stringify(DEFAULT_APP_DATA));
  return DEFAULT_APP_DATA;
}

function saveAppData(data) {
  localStorage.setItem('KLINIK_APP_DATA_V1', JSON.stringify(data));
}

// Global App State for Booking Flow
const AppState = {
  currentStep: 1,
  selectedBranchId: 'br-01',
  selectedCategoryId: 'all',
  selectedServiceId: 'srv-01',
  selectedPractitionerId: 'dr-02',
  selectedDate: '2026-09-01',
  selectedSlot: '10:00',
  holdTimerSeconds: 600, // 10 minutes hold
  holdInterval: null,
  patientData: {
    name: '',
    phone: '',
    email: '',
    dob: '1992-05-14',
    gender: 'MALE',
    patientType: 'REGULAR', // REGULAR | INSURANCE | BPJS_REFERRAL
    refNumber: '',
    refFacility: '',
    refFileName: '',
    allergies: 'Tidak ada alergi obat',
    notes: '',
    selectedPainAreas: [],
    massagePressure: 'MEDIUM',
    aromaChoice: 'LAVENDER_EUCALYPTUS',
    preferredChannel: 'WHATSAPP', // WHATSAPP | EMAIL
    consentGiven: true
  },
  paymentData: {
    payType: 'DEPOSIT', // DEPOSIT | FULL | CLINIC
    method: 'QRIS', // QRIS | VA_BCA | VA_MANDIRI | PAYNOW
    voucherCode: '',
    discount: 0
  },
  latestBooking: null
};

// --- CORE UTILITIES ---
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function showToast(message, icon = '✅') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toastContainer';
  div.className = 'toast-container';
  document.body.appendChild(div);
  return div;
}

// Generate simple visual QR Code pattern via SVG
function generateQRCodeSVG(text, size = 150) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background:#fff; padding:6px; border-radius:8px;">
      <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4"/>
      <rect x="9" y="9" width="18" height="18" fill="#fff" rx="2"/>
      <rect x="13" y="13" width="10" height="10" fill="#0d9488" rx="1"/>
      
      <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4"/>
      <rect x="73" y="9" width="18" height="18" fill="#fff" rx="2"/>
      <rect x="77" y="13" width="10" height="10" fill="#0d9488" rx="1"/>
      
      <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4"/>
      <rect x="9" y="73" width="18" height="18" fill="#fff" rx="2"/>
      <rect x="13" y="77" width="10" height="10" fill="#0d9488" rx="1"/>
      
      <!-- Random stylized data modules for realistic mockup -->
      <rect x="36" y="8" width="6" height="6" fill="#0f172a"/>
      <rect x="46" y="8" width="8" height="6" fill="#0f172a"/>
      <rect x="58" y="12" width="6" height="6" fill="#0d9488"/>
      <rect x="36" y="20" width="12" height="6" fill="#0f172a"/>
      <rect x="52" y="20" width="8" height="6" fill="#0d9488"/>
      
      <rect x="8" y="38" width="6" height="10" fill="#0f172a"/>
      <rect x="20" y="38" width="8" height="6" fill="#0d9488"/>
      <rect x="36" y="36" width="28" height="28" fill="#0f172a" rx="3"/>
      <rect x="42" y="42" width="16" height="16" fill="#fff" rx="2"/>
      <rect x="46" y="46" width="8" height="8" fill="#0d9488"/>
      
      <rect x="72" y="38" width="8" height="6" fill="#0f172a"/>
      <rect x="84" y="38" width="8" height="12" fill="#0d9488"/>
      <rect x="72" y="52" width="18" height="6" fill="#0f172a"/>
      
      <rect x="36" y="72" width="10" height="6" fill="#0f172a"/>
      <rect x="50" y="72" width="6" height="8" fill="#0d9488"/>
      <rect x="60" y="72" width="8" height="6" fill="#0f172a"/>
      <rect x="72" y="70" width="20" height="6" fill="#0f172a"/>
      <rect x="72" y="82" width="8" height="10" fill="#0d9488"/>
      <rect x="84" y="84" width="8" height="8" fill="#0f172a"/>
    </svg>
  `;
}

// Audio Chime synthesizer for Clinic Queue
function playClinicChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Ding-Dong pleasant 2-tone chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.25); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.2);
  } catch (e) {
    console.log('Audio chime not supported or permission blocked', e);
  }
}

// --- DOM INITIALIZATION & EVENT BINDINGS ---
document.addEventListener('DOMContentLoaded', () => {
  initPatientBookingApp();
  initAdminDashboardApp();
});

// ==========================================================================
// 1. PATIENT BOOKING WIZARD ENGINE
// ==========================================================================
function initPatientBookingApp() {
  const wizardContainer = document.getElementById('bookingWizard');
  if (!wizardContainer) return; // Not on patient booking page

  renderBranches();
  renderCategoryPills();
  renderServices();
  renderPractitioners();
  renderDateRibbon();
  renderTimeSlots();
  setupDynamicIntakeListeners();
  setupWizardButtons();
  setupHoldTimer();
}

// Step 1: Render Branches
function renderBranches() {
  const grid = document.getElementById('branchGrid');
  if (!grid) return;
  const data = getAppData();

  grid.innerHTML = data.branches.map(b => `
    <div class="branch-card ${b.id === AppState.selectedBranchId ? 'selected' : ''}" onclick="selectBranch('${b.id}')">
      <div class="branch-header">
        <h3 class="branch-name">${b.name}</h3>
        <span class="branch-badge-status">Buka</span>
      </div>
      <p class="branch-address">📍 ${b.address}</p>
      <div class="branch-meta">
        <span>🕒 ${b.hours}</span>
        <span>🚗 ${b.distance}</span>
      </div>
      <div style="margin-top:0.6rem; display:flex; gap:0.3rem; flex-wrap:wrap;">
        ${b.facilities.slice(0, 3).map(f => `<span class="badge-tag">${f}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

window.selectBranch = function(branchId) {
  AppState.selectedBranchId = branchId;
  renderBranches();
  renderPractitioners();
  renderTimeSlots();
  showToast('Cabang berhasil dipilih');
};

// Step 1: Render Category Pills & Services
function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  if (!container) return;
  const data = getAppData();

  container.innerHTML = data.categories.map(c => `
    <button type="button" class="cat-pill ${c.id === AppState.selectedCategoryId ? 'active' : ''}" onclick="selectCategory('${c.id}')">
      ${c.icon} ${c.name}
    </button>
  `).join('');
}

window.selectCategory = function(catId) {
  AppState.selectedCategoryId = catId;
  renderCategoryPills();
  renderServices();
};

function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  const data = getAppData();

  const filtered = AppState.selectedCategoryId === 'all'
    ? data.services
    : data.services.filter(s => s.categoryId === AppState.selectedCategoryId);

  grid.innerHTML = filtered.map(s => `
    <div class="service-card ${s.id === AppState.selectedServiceId ? 'selected' : ''}" onclick="selectService('${s.id}')">
      <div>
        <div class="service-top">
          <h4 class="service-title">${s.name}</h4>
          <span class="service-intake-badge">${s.intakeProfile.replace('_', ' ')}</span>
        </div>
        <p class="service-desc">${s.description}</p>
        <div class="service-badges">
          <span class="badge-tag">⏱️ ${s.duration} Menit</span>
          <span class="badge-tag badge-buffer">🛡️ Buffer Sterilisasi ${s.buffer}m</span>
          <span class="badge-tag">🏠 ${s.requiresRoom}</span>
        </div>
      </div>
      <div class="service-bottom">
        <div>
          <div class="service-price">${formatRupiah(s.price)}</div>
          <div class="service-deposit">Min. Deposit: ${formatRupiah(s.deposit)}</div>
        </div>
        <button type="button" class="btn btn-sm ${s.id === AppState.selectedServiceId ? 'btn-primary' : 'btn-secondary'}">
          ${s.id === AppState.selectedServiceId ? 'Dipilih ✓' : 'Pilih Layanan'}
        </button>
      </div>
    </div>
  `).join('');
}

window.selectService = function(serviceId) {
  AppState.selectedServiceId = serviceId;
  renderServices();
  updateIntakeFormProfile();
  renderTimeSlots();
  showToast('Layanan dipilih');
};

// Step 2: Render Practitioners
function renderPractitioners() {
  const list = document.getElementById('practitionersList');
  if (!list) return;
  const data = getAppData();

  // Filter practitioners that serve the current branch
  const available = data.practitioners.filter(p => p.branchIds.includes(AppState.selectedBranchId));

  list.innerHTML = available.map(p => `
    <div class="practitioner-card ${p.id === AppState.selectedPractitionerId ? 'selected' : ''}" onclick="selectPractitioner('${p.id}')">
      <div class="practitioner-avatar">${p.avatar}</div>
      <div class="practitioner-info">
        <div class="practitioner-name">${p.name}</div>
        <div class="practitioner-role">${p.role}</div>
        <div class="practitioner-rating">⭐ ${p.rating}</div>
      </div>
    </div>
  `).join('');
}

window.selectPractitioner = function(docId) {
  AppState.selectedPractitionerId = docId;
  renderPractitioners();
  renderTimeSlots();
  showToast('Praktisi dipilih');
};

// Step 2: Date Ribbon
function renderDateRibbon() {
  const ribbon = document.getElementById('dateRibbon');
  if (!ribbon) return;

  const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  // Generate next 14 days starting from 2026-09-01
  const dates = [];
  const baseDate = new Date('2026-09-01T08:00:00');
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({
      dateStr: dateStr,
      dayName: days[d.getDay()],
      dayNum: d.getDate(),
      monthName: months[d.getMonth()]
    });
  }

  ribbon.innerHTML = dates.map(d => `
    <div class="date-pill ${d.dateStr === AppState.selectedDate ? 'selected' : ''}" onclick="selectDate('${d.dateStr}')">
      <span class="date-day">${d.dayName}</span>
      <span class="date-num">${d.dayNum}</span>
      <span class="date-month">${d.monthName}</span>
    </div>
  `).join('');
}

window.selectDate = function(dateStr) {
  AppState.selectedDate = dateStr;
  renderDateRibbon();
  renderTimeSlots();
  showToast(`Tanggal diubah ke ${dateStr}`);
};

// Step 2: Triple-Constraint Slot Calculation Engine
function renderTimeSlots() {
  const morningContainer = document.getElementById('morningSlots');
  const afternoonContainer = document.getElementById('afternoonSlots');
  if (!morningContainer || !afternoonContainer) return;

  const data = getAppData();
  const currentService = data.services.find(s => s.id === AppState.selectedServiceId);
  const currentPractitioner = data.practitioners.find(p => p.id === AppState.selectedPractitionerId);

  // Triple constraint simulation: check existing bookings for practitioner + room conflict
  const existingForDate = data.bookings.filter(b => 
    b.appointmentDate === AppState.selectedDate && 
    b.practitionerId === AppState.selectedPractitionerId &&
    b.status !== 'CANCELLED'
  );
  const bookedSlots = existingForDate.map(b => b.timeSlot);

  // Default time matrix
  const morningTimes = currentPractitioner ? currentPractitioner.slotsMorning : ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
  const afternoonTimes = currentPractitioner ? currentPractitioner.slotsAfternoon : ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  morningContainer.innerHTML = morningTimes.map(time => createSlotButtonHTML(time, bookedSlots)).join('');
  afternoonContainer.innerHTML = afternoonTimes.map(time => createSlotButtonHTML(time, bookedSlots)).join('');
}

function createSlotButtonHTML(time, bookedSlots) {
  const isBooked = bookedSlots.includes(time);
  const isSelected = AppState.selectedSlot === time;
  const isHeld = time === '14:30'; // Simulated temporary hold from another concurrent user

  if (isBooked) {
    return `
      <div class="slot-btn disabled" title="Slot telah terisi (Triple-Constraint: Praktisi/Ruang Penuh)">
        <span class="slot-time">${time}</span>
        <span class="slot-status">Terisi ✗</span>
      </div>
    `;
  }

  if (isHeld) {
    return `
      <div class="slot-btn held" title="Sedang di-hold pasien lain (Sisa 4m 20s)">
        <span class="slot-time">${time}</span>
        <span class="slot-status">🔒 Hold 4m</span>
      </div>
    `;
  }

  return `
    <div class="slot-btn ${isSelected ? 'selected' : ''}" onclick="selectSlot('${time}')">
      <span class="slot-time">${time}</span>
      <span class="slot-status">Tersedia ✓</span>
    </div>
  `;
}

window.selectSlot = function(time) {
  AppState.selectedSlot = time;
  renderTimeSlots();
  resetHoldTimer();
  showToast(`Slot pukul ${time} dikunci sementara (Hold 10 menit)`);
};

// Slot Hold 10-minute Timer
function setupHoldTimer() {
  resetHoldTimer();
}

function resetHoldTimer() {
  clearInterval(AppState.holdInterval);
  AppState.holdTimerSeconds = 600;
  updateHoldTimerDisplay();

  AppState.holdInterval = setInterval(() => {
    AppState.holdTimerSeconds--;
    if (AppState.holdTimerSeconds <= 0) {
      clearInterval(AppState.holdInterval);
      showToast('⚠️ Sesi hold slot 10 menit telah berakhir. Slot dilepaskan.', '⚠️');
    }
    updateHoldTimerDisplay();
  }, 1000);
}

function updateHoldTimerDisplay() {
  const el = document.getElementById('holdTimerDisplay');
  if (!el) return;
  const mins = Math.floor(AppState.holdTimerSeconds / 60);
  const secs = AppState.holdTimerSeconds % 60;
  el.textContent = `⏱️ Slot Hold: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Step 3: Dynamic Intake Form & Referral Bridging
function updateIntakeFormProfile() {
  const data = getAppData();
  const service = data.services.find(s => s.id === AppState.selectedServiceId);
  if (!service) return;

  const profile = service.intakeProfile;
  const spaSection = document.getElementById('intakeSpaSection');
  const painSection = document.getElementById('intakePainSection');
  const medicalSection = document.getElementById('intakeMedicalSection');

  if (spaSection) spaSection.style.display = profile === 'SPA_WELLNESS' ? 'block' : 'none';
  if (painSection) painSection.style.display = (profile === 'TCM_PHYSIO' || profile === 'SPA_WELLNESS') ? 'block' : 'none';
  if (medicalSection) medicalSection.style.display = profile === 'MEDICAL_CLINIC' ? 'block' : 'none';
}

function setupDynamicIntakeListeners() {
  // Patient Type Cards
  document.querySelectorAll('.ptype-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.ptype-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const ptype = card.getAttribute('data-type');
      AppState.patientData.patientType = ptype;

      const referralBox = document.getElementById('referralBox');
      if (referralBox) {
        referralBox.style.display = (ptype === 'BPJS_REFERRAL' || ptype === 'INSURANCE') ? 'block' : 'none';
      }
    });
  });

  // Body Pain Area Buttons
  document.querySelectorAll('.pain-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const area = btn.getAttribute('data-area');
      if (btn.classList.contains('selected')) {
        AppState.patientData.selectedPainAreas.push(area);
      } else {
        AppState.patientData.selectedPainAreas = AppState.patientData.selectedPainAreas.filter(a => a !== area);
      }
    });
  });

  // Channel Selection Cards
  document.querySelectorAll('.channel-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      AppState.patientData.preferredChannel = card.getAttribute('data-channel');
    });
  });

  // File Upload Dropzone Mockup
  const dropzone = document.getElementById('refFileDropzone');
  const fileInput = document.getElementById('refFileInput');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        AppState.patientData.refFileName = file.name;
        dropzone.innerHTML = `
          <div style="color:var(--primary-700); font-weight:700;">
            📄 Dokumen Terpilih: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)
            <div style="font-size:0.78rem; color:var(--success-600); margin-top:0.3rem;">✓ Siap diteruskan via API Bridging ke SIMRS (Ephemeral Proxy Max 72 Jam)</div>
          </div>
        `;
        showToast('Dokumen rujukan berhasil diunggah');
      }
    });
  }
}

// Step 4: Summary & Checkout Calculation
function updateCheckoutSummary() {
  const data = getAppData();
  const service = data.services.find(s => s.id === AppState.selectedServiceId);
  const practitioner = data.practitioners.find(p => p.id === AppState.selectedPractitionerId);
  const branch = data.branches.find(b => b.id === AppState.selectedBranchId);

  if (!service) return;

  const total = service.price;
  const deposit = service.deposit;
  let toPay = total;

  if (AppState.paymentData.payType === 'DEPOSIT') {
    toPay = deposit;
  } else if (AppState.paymentData.payType === 'CLINIC') {
    toPay = 0;
  }

  // Populate UI labels
  const branchEl = document.getElementById('sumBranch');
  const serviceEl = document.getElementById('sumService');
  const docEl = document.getElementById('sumDoc');
  const dateSlotEl = document.getElementById('sumDateSlot');
  const patientTypeEl = document.getElementById('sumPatientType');
  const totalPriceEl = document.getElementById('sumTotalPrice');
  const toPayEl = document.getElementById('sumToPay');
  const qrisAmountEl = document.getElementById('qrisAmount');

  if (branchEl) branchEl.textContent = branch ? branch.name : '-';
  if (serviceEl) serviceEl.textContent = service.name;
  if (docEl) docEl.textContent = practitioner ? practitioner.name : '-';
  if (dateSlotEl) dateSlotEl.textContent = `${AppState.selectedDate} pukul ${AppState.selectedSlot} WIB`;
  if (patientTypeEl) patientTypeEl.textContent = AppState.patientData.patientType.replace('_', ' ');
  if (totalPriceEl) totalPriceEl.textContent = formatRupiah(total);
  if (toPayEl) toPayEl.textContent = formatRupiah(toPay);
  if (qrisAmountEl) qrisAmountEl.textContent = formatRupiah(toPay > 0 ? toPay : total);
}

window.selectPayType = function(type) {
  AppState.paymentData.payType = type;
  document.querySelectorAll('.paytype-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-paytype') === type);
  });
  updateCheckoutSummary();
};

window.selectPayMethod = function(method) {
  AppState.paymentData.method = method;
  document.querySelectorAll('.payment-method-card').forEach(c => {
    c.classList.toggle('selected', c.getAttribute('data-method') === method);
  });
};

// Wizard Step Navigation
function setupWizardButtons() {
  const btnNext = document.getElementById('btnWizardNext');
  const btnPrev = document.getElementById('btnWizardPrev');

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (AppState.currentStep === 4) {
          processBookingSubmission();
        } else {
          goToStep(AppState.currentStep + 1);
        }
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (AppState.currentStep > 1) {
        goToStep(AppState.currentStep - 1);
      }
    });
  }

  // Allow clicking on stepper header items
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'));
      if (step < AppState.currentStep) {
        goToStep(step);
      }
    });
  });
}

function validateCurrentStep() {
  if (AppState.currentStep === 1) {
    if (!AppState.selectedBranchId || !AppState.selectedServiceId) {
      showToast('Pilih cabang dan layanan terlebih dahulu', '⚠️');
      return false;
    }
  } else if (AppState.currentStep === 2) {
    if (!AppState.selectedPractitionerId || !AppState.selectedSlot) {
      showToast('Pilih praktisi dan slot waktu yang tersedia', '⚠️');
      return false;
    }
  } else if (AppState.currentStep === 3) {
    const nameInput = document.getElementById('inputPatientName');
    const phoneInput = document.getElementById('inputPatientPhone');
    const consentCheck = document.getElementById('checkConsent');

    if (nameInput && !nameInput.value.trim()) {
      showToast('Harap isi nama lengkap pasien', '⚠️');
      nameInput.focus();
      return false;
    }
    if (phoneInput && !phoneInput.value.trim()) {
      showToast('Harap isi nomor WhatsApp / telepon', '⚠️');
      phoneInput.focus();
      return false;
    }
    if (consentCheck && !consentCheck.checked) {
      showToast('Centang persetujuan privasi data (UU PDP / PDPA)', '⚠️');
      return false;
    }

    // Save fields to state
    AppState.patientData.name = nameInput ? nameInput.value.trim() : 'Pasien';
    AppState.patientData.phone = phoneInput ? phoneInput.value.trim() : '+62 812 0000';
    const emailInput = document.getElementById('inputPatientEmail');
    if (emailInput) AppState.patientData.email = emailInput.value.trim();

    const refNumInput = document.getElementById('inputRefNumber');
    const refFacInput = document.getElementById('inputRefFacility');
    if (refNumInput) AppState.patientData.refNumber = refNumInput.value.trim();
    if (refFacInput) AppState.patientData.refFacility = refFacInput.value.trim();

    updateCheckoutSummary();
  }
  return true;
}

function goToStep(stepNumber) {
  AppState.currentStep = stepNumber;

  // Update Stepper Header
  document.querySelectorAll('.step-item').forEach(item => {
    const s = parseInt(item.getAttribute('data-step'));
    item.classList.toggle('active', s === stepNumber);
    item.classList.toggle('completed', s < stepNumber);
  });

  // Update Step Panes
  document.querySelectorAll('.step-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  const currentPane = document.getElementById(`stepPane${stepNumber}`);
  if (currentPane) currentPane.classList.add('active');

  // Update Navigation Buttons
  const btnPrev = document.getElementById('btnWizardPrev');
  const btnNext = document.getElementById('btnWizardNext');

  if (btnPrev) btnPrev.style.visibility = stepNumber === 1 || stepNumber === 5 ? 'hidden' : 'visible';
  if (btnNext) {
    if (stepNumber === 4) {
      btnNext.textContent = 'Konfirmasi & Bayar 💳';
      btnNext.classList.remove('btn-primary');
      btnNext.classList.add('btn-primary');
    } else if (stepNumber === 5) {
      btnNext.style.display = 'none';
      if (btnPrev) btnPrev.style.display = 'none';
    } else {
      btnNext.textContent = 'Lanjut ke Langkah Berikutnya →';
      btnNext.style.display = 'inline-flex';
    }
  }

  window.scrollTo({ top: 120, behavior: 'smooth' });
}

// Step 5: Process Final Booking Submission
function processBookingSubmission() {
  const data = getAppData();
  const service = data.services.find(s => s.id === AppState.selectedServiceId);
  const practitioner = data.practitioners.find(p => p.id === AppState.selectedPractitionerId);
  const branch = data.branches.find(b => b.id === AppState.selectedBranchId);

  const bookingCode = `BK-${AppState.selectedDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const queueNo = `${service.categoryId.toUpperCase().slice(0, 1)}-0${data.bookings.length + 1}`;

  const paid = AppState.paymentData.payType === 'FULL' ? service.price : (AppState.paymentData.payType === 'DEPOSIT' ? service.deposit : 0);
  const remaining = service.price - paid;

  const newBooking = {
    id: bookingCode,
    code: bookingCode,
    patientName: AppState.patientData.name || 'Pasien Mandiri',
    patientPhone: AppState.patientData.phone,
    patientEmail: AppState.patientData.email || 'patient@example.com',
    patientType: AppState.patientData.patientType,
    branchId: branch.id,
    branchName: branch.name,
    serviceId: service.id,
    serviceName: service.name,
    practitionerId: practitioner.id,
    practitionerName: practitioner.name,
    roomName: service.requiresRoom,
    appointmentDate: AppState.selectedDate,
    timeSlot: AppState.selectedSlot,
    duration: service.duration,
    status: 'CONFIRMED',
    paymentStatus: paid >= service.price ? 'FULLY_PAID' : (paid > 0 ? 'DEPOSIT_PAID' : 'PAY_AT_CLINIC'),
    totalAmount: service.price,
    paidAmount: paid,
    remainingAmount: remaining,
    channel: AppState.patientData.preferredChannel,
    queueNo: queueNo,
    painAreas: AppState.patientData.selectedPainAreas,
    complaints: AppState.patientData.notes || 'Keluhan awal tersimpan di intake form.',
    createdAt: new Date().toISOString()
  };

  // If referral, add referral metadata and log to referral forwarder hub
  if (AppState.patientData.patientType !== 'REGULAR') {
    newBooking.referralData = {
      number: AppState.patientData.refNumber || 'REF-2026-AUTO',
      facility: AppState.patientData.refFacility || 'Faskes Rujukan Terdaftar',
      docUrl: `https://storage.klinik.com/ephemeral/${bookingCode}.pdf`,
      forwardStatus: 'SENT',
      forwardedAt: new Date().toLocaleTimeString('id-ID') + ' WIB'
    };

    data.referralsLog.unshift({
      id: `ref-log-${Date.now()}`,
      bookingCode: bookingCode,
      patientName: newBooking.patientName,
      refNo: newBooking.referralData.number,
      fromFacility: newBooking.referralData.facility,
      targetSIMRS: 'SIMRS-EMR-HQ (Endpoint: /api/v1/intake/referral)',
      status: 'SENT',
      httpCode: 200,
      ttlRemaining: '71 jam 59 menit (Ephemeral Auto-Delete)',
      payloadPreview: {
        booking_id: bookingCode,
        patient_name: newBooking.patientName,
        patient_type: newBooking.patientType,
        referral_doc: `ephemeral://${bookingCode}.pdf (Encrypted AES-256)`,
        appointment: `${newBooking.appointmentDate} ${newBooking.timeSlot}`
      }
    });
  }

  // Add Notification Log
  data.notificationsLog.unshift({
    id: `notif-${Date.now()}`,
    bookingCode: bookingCode,
    channel: AppState.patientData.preferredChannel,
    recipient: AppState.patientData.preferredChannel === 'WHATSAPP' ? AppState.patientData.phone : AppState.patientData.email,
    type: 'BOOKING_CONFIRMATION',
    status: 'DELIVERED',
    sentAt: 'Baru saja',
    readStatus: 'READ',
    openRate: AppState.patientData.preferredChannel === 'WHATSAPP' ? '98%' : '82%'
  });

  // Add to Live Queue
  data.liveQueue.push({
    queueNo: queueNo,
    name: newBooking.patientName,
    service: newBooking.serviceName,
    doc: newBooking.practitionerName,
    status: 'WAITING',
    room: newBooking.roomName
  });

  // Save to database
  data.bookings.unshift(newBooking);
  saveAppData(data);
  AppState.latestBooking = newBooking;

  // Render Step 5 Digital Ticket
  renderDigitalTicket(newBooking);
  goToStep(5);
  showToast('🎉 Reservasi berhasil dikonfirmasi!');
  playClinicChime();
}

function renderDigitalTicket(b) {
  const container = document.getElementById('digitalTicketContainer');
  if (!container) return;

  const qrSvg = generateQRCodeSVG(b.code, 160);

  container.innerHTML = `
    <div class="digital-ticket">
      <div class="ticket-header">
        <div class="ticket-brand">E-TIKET RESERVASI RESMI</div>
        <div class="ticket-code">${b.code}</div>
        <span class="ticket-status-pill">✓ TERKONFIRMASI</span>
      </div>
      <div class="ticket-body">
        <div class="ticket-row">
          <span class="ticket-label">Nama Pasien:</span>
          <span class="ticket-val">${b.patientName}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Nomor Antrean:</span>
          <span class="ticket-val" style="color:var(--primary-600); font-size:1.15rem; font-weight:800;">${b.queueNo}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Cabang Klinik:</span>
          <span class="ticket-val">${b.branchName}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Layanan / Terapi:</span>
          <span class="ticket-val">${b.serviceName}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Praktisi / Dokter:</span>
          <span class="ticket-val">${b.practitionerName}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Jadwal Janji Temu:</span>
          <span class="ticket-val" style="color:var(--primary-800);">${b.appointmentDate} • Pukul ${b.timeSlot} WIB</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Ruangan:</span>
          <span class="ticket-val">${b.roomName}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Status Pembayaran:</span>
          <span class="ticket-val" style="color:var(--success-600);">${b.paymentStatus.replace('_', ' ')} (Sisa: ${formatRupiah(b.remainingAmount)})</span>
        </div>

        <div class="ticket-divider-perforated">
          <div class="ticket-dashed-line"></div>
        </div>

        <div class="ticket-qr-section">
          <div class="qr-canvas-box">${qrSvg}</div>
          <div style="font-size:0.78rem; color:var(--slate-500); text-align:center;">
            Tunjukkan kode QR ini ke mesin check-in mandiri atau resepsionis saat tiba di klinik.
          </div>
          <div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap; justify-content:center;">
            <button type="button" class="btn btn-sm btn-primary" onclick="downloadICS('${b.code}')">📅 Tambah ke Kalender (.ics)</button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.print()">🖨️ Cetak Tiket</button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="openRescheduleModal('${b.code}')">🔄 Ubah Jadwal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Simulation Card -->
    <div class="notification-sim-card">
      <div class="wa-sim-header">
        <span>💬 WhatsApp Official Verified</span>
        <span style="margin-left:auto; font-size:0.75rem; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:12px;">Aktif</span>
      </div>
      <div class="wa-sim-body">
        <div class="wa-bubble">
          <strong>Halo ${b.patientName}! 👋</strong><br>
          Reservasi Anda di <strong>${b.branchName}</strong> telah BERHASIL.<br><br>
          📋 <strong>Detail Jadwal:</strong><br>
          • No Booking: <code>${b.code}</code><br>
          • Antrean: <strong>${b.queueNo}</strong><br>
          • Layanan: ${b.serviceName}<br>
          • Praktisi: ${b.practitionerName}<br>
          • Waktu: ${b.appointmentDate} @ ${b.timeSlot} WIB<br><br>
          📍 <em>Harap hadir 15 menit lebih awal untuk persiapan sterilisasi & intake.</em>
          
          <div class="wa-bubble-actions">
            <button type="button" class="wa-action-btn" onclick="showToast('Konfirmasi kehadiran terkirim via WA Bot ✓')">✅ Konfirmasi Hadir</button>
            <button type="button" class="wa-action-btn" onclick="openRescheduleModal('${b.code}')">🔄 Reschedule / Ganti Jam</button>
            <button type="button" class="wa-action-btn" onclick="showToast('Membuka rute Google Maps menuju klinik 🚗')">📍 Buka Google Maps</button>
          </div>
        </div>

        <div style="background:white; padding:0.85rem; border-radius:12px; font-size:0.78rem; border:1px solid #d1d7db;">
          <div style="font-weight:700; color:#008069; margin-bottom:0.25rem;">⏰ Sistem Pengingat Bertahap (Anti No-Show)</div>
          <div>• Reminder 1: Dikirim H-24 Jam (Besok pukul 08:00 WIB)</div>
          <div>• Reminder 2: Dikirim H-3 Jam (Hari-H sebelum keberangkatan)</div>
          <div style="margin-top:0.35rem; color:var(--slate-500); font-style:italic;">Memangkas rasio no-show hingga 42% secara otomatis.</div>
        </div>
      </div>
    </div>
  `;
}

// Download .ics Calendar File
window.downloadICS = function(bookingCode) {
  const data = getAppData();
  const b = data.bookings.find(x => x.code === bookingCode);
  if (!b) return;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Klinik Terpadu//Booking System//ID
BEGIN:VEVENT
UID:${b.code}@klinik.com
DTSTAMP:20260901T080000Z
DTSTART:${b.appointmentDate.replace(/-/g, '')}T${b.timeSlot.replace(':', '')}00
SUMMARY:Janji Temu: ${b.serviceName} - ${b.practitionerName}
DESCRIPTION:Kode Booking: ${b.code}\\nAntrean: ${b.queueNo}\\nLokasi: ${b.branchName}
LOCATION:${b.branchName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `JanjiTemu-${b.code}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File kalender (.ics) berhasil diunduh');
};

// Reschedule Modal
window.openRescheduleModal = function(bookingCode) {
  const modal = document.getElementById('rescheduleModal') || createRescheduleModal();
  modal.classList.add('active');
  modal.setAttribute('data-booking-code', bookingCode);
};

function createRescheduleModal() {
  const overlay = document.createElement('div');
  overlay.id = 'rescheduleModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">🔄 Ubah Jadwal Kunjungan (Reschedule)</h3>
        <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.88rem; color:var(--slate-600); margin-bottom:1.25rem;">
          Sesuai kebijakan klinik, pasien dapat mengubah jadwal tanpa biaya tambahan hingga H-4 jam sebelum sesi berlangsung.
        </p>
        <div class="form-group">
          <label class="form-label">Pilih Tanggal Baru:</label>
          <input type="date" class="form-control" id="reschedDate" value="2026-09-02">
        </div>
        <div class="form-group">
          <label class="form-label">Pilih Slot Jam Baru:</label>
          <select class="form-control" id="reschedSlot">
            <option value="09:30">09:30 WIB (Tersedia ✓)</option>
            <option value="11:00">11:00 WIB (Tersedia ✓)</option>
            <option value="14:00">14:00 WIB (Tersedia ✓)</option>
            <option value="16:30">16:30 WIB (Tersedia ✓)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">Batal</button>
        <button type="button" class="btn btn-primary" onclick="confirmReschedule()">Simpan Perubahan Jadwal</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

window.confirmReschedule = function() {
  const modal = document.getElementById('rescheduleModal');
  const bookingCode = modal.getAttribute('data-booking-code');
  const newDate = document.getElementById('reschedDate').value;
  const newSlot = document.getElementById('reschedSlot').value;

  const data = getAppData();
  const b = data.bookings.find(x => x.code === bookingCode);
  if (b) {
    b.appointmentDate = newDate;
    b.timeSlot = newSlot;
    b.status = 'RESCHEDULED';
    saveAppData(data);
    modal.classList.remove('active');
    showToast(`Jadwal berhasil dipindahkan ke ${newDate} pukul ${newSlot}`);
    if (AppState.latestBooking && AppState.latestBooking.code === bookingCode) {
      renderDigitalTicket(b);
    }
  }
};

// ==========================================================================
// 2. CLINIC OPERATIONS DASHBOARD (ADMIN, DOCTOR, RECEPTIONIST)
// ==========================================================================
function initAdminDashboardApp() {
  const adminContainer = document.getElementById('adminDashboard');
  if (!adminContainer) return; // Not on admin page

  renderAdminKPIs();
  renderMasterCalendar();
  renderReferralHubTable();
  renderNotificationsLog();
  renderLiveQueueBoard();
  setupAdminNavigation();
}

function renderAdminKPIs() {
  const container = document.getElementById('adminKpiGrid');
  if (!container) return;
  const data = getAppData();

  const totalToday = data.bookings.filter(b => b.appointmentDate === '2026-09-01').length;
  const checkedIn = data.bookings.filter(b => b.status === 'CHECKED_IN' || b.status === 'IN_PROGRESS').length;
  const referralsCount = data.referralsLog.length;

  container.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-title">Total Pasien Hari Ini</div>
      <div class="kpi-val">${totalToday + 12}</div>
      <div class="kpi-trend trend-up">▲ +18% vs minggu lalu</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Tingkat Okupansi Slot</div>
      <div class="kpi-val">87.5%</div>
      <div class="kpi-trend trend-up">▲ 42/48 Slot Terisi</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Penurunan No-Show Rate</div>
      <div class="kpi-val">3.2%</div>
      <div class="kpi-trend trend-down">▼ -42% berkat Reminder WA</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Rujukan Aktif (Ephemeral)</div>
      <div class="kpi-val">${referralsCount}</div>
      <div class="kpi-trend trend-up">✓ Terhubung ke SIMRS</div>
    </div>
  `;
}

// Master Calendar Timeline Grid
function renderMasterCalendar() {
  const container = document.getElementById('masterCalendarTimeline');
  if (!container) return;
  const data = getAppData();

  const times = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const doctors = data.practitioners.filter(p => p.branchIds.includes('br-01'));

  let tableHtml = `
    <table class="cal-timeline-table">
      <thead>
        <tr>
          <th style="width:90px;">Jam Slot</th>
          ${doctors.map(d => `<th>${d.name}<div style="font-size:0.7rem; font-weight:400; color:var(--slate-500);">${d.role}</div></th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  times.forEach(time => {
    tableHtml += `<tr><td style="font-weight:700; font-size:0.85rem; background:var(--slate-50);">${time}</td>`;
    doctors.forEach(doc => {
      // Find booking matching doctor, date, and time
      const b = data.bookings.find(x => x.practitionerId === doc.id && x.timeSlot === time);
      if (b) {
        let chipClass = 'chip-confirmed';
        if (b.status === 'CHECKED_IN') chipClass = 'chip-checkedin';
        if (b.status === 'IN_PROGRESS') chipClass = 'chip-inprogress';
        if (b.status === 'PENDING_PAYMENT') chipClass = 'chip-pending';
        if (b.status === 'NO_SHOW') chipClass = 'chip-noshow';

        tableHtml += `
          <td>
            <div class="booking-chip ${chipClass}" onclick="openBookingDetailModal('${b.code}')">
              <div style="font-size:0.82rem; font-weight:800;">${b.queueNo} • ${b.patientName}</div>
              <div style="font-size:0.72rem; opacity:0.9;">${b.serviceName.slice(0, 24)}...</div>
              <div style="font-size:0.68rem; margin-top:2px;">📍 ${b.roomName}</div>
            </div>
          </td>
        `;
      } else {
        tableHtml += `<td style="color:var(--slate-300); font-size:0.75rem; vertical-align:middle;">— Kosong —</td>`;
      }
    });
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table>`;
  container.innerHTML = tableHtml;
}

// Live Queue Board
function renderLiveQueueBoard() {
  const container = document.getElementById('liveQueueBoard');
  if (!container) return;
  const data = getAppData();

  const waiting = data.liveQueue.filter(q => q.status === 'WAITING');
  const called = data.liveQueue.filter(q => q.status === 'CALLED');
  const serving = data.liveQueue.filter(q => q.status === 'SERVING');

  container.innerHTML = `
    <div class="queue-column">
      <div class="queue-col-header">
        <span class="queue-col-title">🕒 Ruang Tunggu (${waiting.length})</span>
        <button type="button" class="btn btn-sm btn-primary" onclick="callNextQueue()">📢 Panggil Berikutnya</button>
      </div>
      ${waiting.map(q => `
        <div class="queue-item-card">
          <div class="queue-item-top">
            <span class="queue-number">${q.queueNo}</span>
            <span class="badge-status status-pending">Menunggu</span>
          </div>
          <div style="font-weight:700; font-size:0.95rem;">${q.name}</div>
          <div style="font-size:0.8rem; color:var(--slate-600);">${q.service}</div>
          <div style="font-size:0.75rem; color:var(--slate-500); margin-top:4px;">👨‍⚕️ ${q.doc} • 🏠 ${q.room}</div>
        </div>
      `).join('')}
    </div>

    <div class="queue-column" style="border-top:3px solid var(--accent-500);">
      <div class="queue-col-header">
        <span class="queue-col-title">📢 Dipanggil (${called.length})</span>
      </div>
      ${called.map(q => `
        <div class="queue-item-card" style="background:var(--accent-50); border-color:var(--accent-500);">
          <div class="queue-item-top">
            <span class="queue-number" style="color:var(--accent-700);">${q.queueNo}</span>
            <span class="badge-status status-sent">Menuju Ruangan</span>
          </div>
          <div style="font-weight:700; font-size:0.95rem;">${q.name}</div>
          <div style="font-size:0.8rem; color:var(--slate-600);">${q.service}</div>
          <div style="display:flex; gap:0.4rem; margin-top:0.5rem;">
            <button type="button" class="btn btn-sm btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="setQueueStatus('${q.queueNo}', 'SERVING')">Mulai Terapi</button>
            <button type="button" class="btn btn-sm btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="playClinicChime()">Re-Call 🔊</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="queue-column" style="border-top:3px solid var(--success-500);">
      <div class="queue-col-header">
        <span class="queue-col-title">🩺 Sedang Dilayani (${serving.length})</span>
      </div>
      ${serving.map(q => `
        <div class="queue-item-card" style="background:var(--success-50); border-color:var(--success-500);">
          <div class="queue-item-top">
            <span class="queue-number" style="color:var(--success-600);">${q.queueNo}</span>
            <span class="badge-status status-sent">Sedang Terapi</span>
          </div>
          <div style="font-weight:700; font-size:0.95rem;">${q.name}</div>
          <div style="font-size:0.8rem; color:var(--slate-600);">${q.service} • ${q.room}</div>
          <button type="button" class="btn btn-sm btn-accent" style="margin-top:0.5rem; width:100%;" onclick="finishQueue('${q.queueNo}')">Selesai & Kasir POS 🏁</button>
        </div>
      `).join('')}
    </div>
  `;
}

window.callNextQueue = function() {
  const data = getAppData();
  const waitingIndex = data.liveQueue.findIndex(q => q.status === 'WAITING');
  if (waitingIndex !== -1) {
    data.liveQueue[waitingIndex].status = 'CALLED';
    saveAppData(data);
    renderLiveQueueBoard();
    playClinicChime();
    showToast(`📢 Panggilan antrean: ${data.liveQueue[waitingIndex].queueNo} atas nama ${data.liveQueue[waitingIndex].name}`);
  } else {
    showToast('Tidak ada antrean yang menunggu saat ini');
  }
};

window.setQueueStatus = function(queueNo, newStatus) {
  const data = getAppData();
  const q = data.liveQueue.find(x => x.queueNo === queueNo);
  if (q) {
    q.status = newStatus;
    saveAppData(data);
    renderLiveQueueBoard();
    showToast(`Status antrean ${queueNo} diubah menjadi ${newStatus}`);
  }
};

window.finishQueue = function(queueNo) {
  const data = getAppData();
  data.liveQueue = data.liveQueue.filter(x => x.queueNo !== queueNo);
  saveAppData(data);
  renderLiveQueueBoard();
  showToast(`Sesi antrean ${queueNo} selesai! Membuka Kasir POS...`);
  openPOSModal(queueNo);
};

// Referral Bridging Hub Monitor
function renderReferralHubTable() {
  const tbody = document.getElementById('referralHubTableBody');
  if (!tbody) return;
  const data = getAppData();

  tbody.innerHTML = data.referralsLog.map(r => `
    <tr>
      <td><strong>${r.bookingCode}</strong></td>
      <td>${r.patientName}</td>
      <td><code>${r.refNo}</code></td>
      <td>${r.fromFacility}</td>
      <td><span class="badge-status status-sent">✓ ${r.status} (${r.httpCode})</span></td>
      <td style="font-size:0.78rem; color:var(--warning-600); font-weight:700;">⏱️ ${r.ttlRemaining}</td>
      <td>
        <button type="button" class="btn btn-sm btn-secondary" onclick="inspectWebhookPayload('${r.id}')">🔍 Inspect Payload</button>
      </td>
    </tr>
  `).join('');
}

window.inspectWebhookPayload = function(logId) {
  const data = getAppData();
  const log = data.referralsLog.find(l => l.id === logId);
  if (!log) return;

  const modal = document.getElementById('payloadModal') || createPayloadModal();
  modal.classList.add('active');
  document.getElementById('payloadJsonViewer').textContent = JSON.stringify(log.payloadPreview, null, 2);
};

function createPayloadModal() {
  const overlay = document.createElement('div');
  overlay.id = 'payloadModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">🔌 SIMRS Webhook Forwarder Payload</h3>
        <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--slate-900); color:#38bdf8; padding:1rem; border-radius:8px; font-family:monospace; font-size:0.85rem; overflow-x:auto;">
          <pre id="payloadJsonViewer"></pre>
        </div>
        <div style="margin-top:1rem; font-size:0.8rem; color:var(--slate-600);">
          🔒 <strong>Kebijakan Ephemeral Retention:</strong> Dokumen rujukan di-enkripsi dengan AES-256 dan otomatis terhapus dari storage setelah berhasil di-bridge ke SIMRS klinik mitra (Max 72 Jam).
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="this.closest('.modal-overlay').classList.remove('active')">Tutup</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Notification Center Logs
function renderNotificationsLog() {
  const tbody = document.getElementById('notifLogTableBody');
  if (!tbody) return;
  const data = getAppData();

  tbody.innerHTML = data.notificationsLog.map(n => `
    <tr>
      <td><strong>${n.bookingCode}</strong></td>
      <td>
        <span class="badge-tag" style="background:${n.channel === 'WHATSAPP' ? '#dcfce7' : '#e0f2fe'}; color:${n.channel === 'WHATSAPP' ? '#15803d' : '#0369a1'}; font-weight:700;">
          ${n.channel === 'WHATSAPP' ? '💬 WhatsApp' : '✉️ Email'}
        </span>
      </td>
      <td>${n.recipient}</td>
      <td>${n.type}</td>
      <td><span class="badge-status status-sent">✓ ${n.status}</span></td>
      <td>${n.readStatus}</td>
      <td>${n.sentAt}</td>
    </tr>
  `).join('');
}

// POS Cashier Modal
function openPOSModal(queueNo) {
  const modal = document.getElementById('posModal') || createPOSModal();
  modal.classList.add('active');
}

function createPOSModal() {
  const overlay = document.createElement('div');
  overlay.id = 'posModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">💳 Kasir POS - Pelunasan Tagihan Kunjungan</h3>
        <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="summary-card" style="margin-bottom:1rem;">
          <div class="summary-row"><span>Total Tarif Layanan:</span><span>Rp 275.000</span></div>
          <div class="summary-row"><span>Deposit Telah Dibayar (Online):</span><span style="color:var(--success-600);">- Rp 50.000</span></div>
          <div class="summary-row total"><span>Sisa Pelunasan:</span><span style="color:var(--primary-700);">Rp 225.000</span></div>
        </div>
        <div class="form-group">
          <label class="form-label">Metode Pembayaran:</label>
          <select class="form-control" id="posPayMethod">
            <option value="TUNAI">Tunai / Cash</option>
            <option value="QRIS">QRIS Statis / Dinamis</option>
            <option value="EDC_BCA">Debit / Kartu Kredit EDC BCA</option>
            <option value="EDC_MANDIRI">Debit EDC Mandiri</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">Batal</button>
        <button type="button" class="btn btn-primary" onclick="finishPOSPayment()">Cetak Struk & Selesaikan Transaksi 🧾</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

window.finishPOSPayment = function() {
  const modal = document.getElementById('posModal');
  if (modal) modal.classList.remove('active');
  showToast('✅ Transaksi lunas! E-Receipt dikirimkan otomatis ke WhatsApp pasien.');
};

// Walk-in Quick Booking Dispatcher (for front desk staff)
window.openWalkInModal = function() {
  const modal = document.getElementById('walkInModal') || createWalkInModal();
  modal.classList.add('active');
};

function createWalkInModal() {
  const overlay = document.createElement('div');
  overlay.id = 'walkInModal';
  overlay.className = 'modal-overlay';
  const data = getAppData();

  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">⚡ Quick Walk-in & Phone Dispatcher</h3>
        <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Cari Pasien Terdaftar / Input Baru:</label>
          <input type="text" class="form-control" id="walkInName" placeholder="Ketik nama atau nomor HP..." value="Ahmad Dahlan">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp:</label>
            <input type="text" class="form-control" id="walkInPhone" value="+62 812 7788 9900">
          </div>
          <div class="form-group">
            <label class="form-label">Pilih Layanan:</label>
            <select class="form-control" id="walkInService">
              ${data.services.map(s => `<option value="${s.id}">${s.name} (${formatRupiah(s.price)})</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Pilih Praktisi:</label>
            <select class="form-control" id="walkInDoc">
              ${data.practitioners.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Pilih Jam Praktik:</label>
            <select class="form-control" id="walkInSlot">
              <option value="09:30">09:30 WIB (Tersedia ✓)</option>
              <option value="10:00">10:00 WIB (Tersedia ✓)</option>
              <option value="11:30">11:30 WIB (Tersedia ✓)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">Batal</button>
        <button type="button" class="btn btn-primary" onclick="submitWalkInBooking()">Input & Cetak Tiket Cepat</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

window.submitWalkInBooking = function() {
  const name = document.getElementById('walkInName').value;
  const phone = document.getElementById('walkInPhone').value;
  const serviceId = document.getElementById('walkInService').value;
  const docId = document.getElementById('walkInDoc').value;
  const slot = document.getElementById('walkInSlot').value;

  const data = getAppData();
  const service = data.services.find(s => s.id === serviceId);
  const doc = data.practitioners.find(p => p.id === docId);

  const code = `BK-WLK-${Date.now().toString().slice(-6)}`;
  const queueNo = `W-0${data.liveQueue.length + 1}`;

  const booking = {
    id: code,
    code: code,
    patientName: name,
    patientPhone: phone,
    patientEmail: 'walkin@klinik.id',
    patientType: 'REGULAR',
    branchId: 'br-01',
    branchName: 'Cabang Jakarta Pusat (Menteng)',
    serviceId: service.id,
    serviceName: service.name,
    practitionerId: doc.id,
    practitionerName: doc.name,
    roomName: service.requiresRoom,
    appointmentDate: '2026-09-01',
    timeSlot: slot,
    duration: service.duration,
    status: 'CONFIRMED',
    paymentStatus: 'PAY_AT_CLINIC',
    totalAmount: service.price,
    paidAmount: 0,
    remainingAmount: service.price,
    channel: 'WHATSAPP',
    queueNo: queueNo,
    createdAt: new Date().toISOString()
  };

  data.bookings.unshift(booking);
  data.liveQueue.push({
    queueNo: queueNo,
    name: name,
    service: service.name,
    doc: doc.name,
    status: 'WAITING',
    room: service.requiresRoom
  });

  saveAppData(data);
  const modal = document.getElementById('walkInModal');
  if (modal) modal.classList.remove('active');

  renderMasterCalendar();
  renderLiveQueueBoard();
  renderAdminKPIs();
  showToast(`⚡ Pasien walk-in ${name} berhasil didaftarkan (No Antrean: ${queueNo})`);
};

// Admin Navigation
function setupAdminNavigation() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const target = item.getAttribute('data-target');
      document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.style.display = pane.id === target ? 'block' : 'none';
      });
    });
  });
}
