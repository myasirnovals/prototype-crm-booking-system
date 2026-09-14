import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';

// 1. TCM HOMECARE MOCK DATABASE & CATALOG
export let SERVICES = {
    'tcm-teleconsult-intro': {
        id: 'tcm-teleconsult-intro',
        name: 'Online TCM Teleconsultation (Intro Special)',
        type: 'consultation',
        price: 20,
        regularPrice: 50,
        duration: '15 Mins',
        badge: 'SPECIAL OFFER',
        description: 'Kick off your health journey with a certified physician via secure video call. Comprehensive lifestyle and symptom evaluation.',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
    },
    'tcm-laser-acupuncture': {
        id: 'tcm-laser-acupuncture',
        name: 'Painless Laser Acupuncture Therapy',
        type: 'acupuncture',
        price: 95,
        duration: '45 Mins',
        badge: 'NEEDLE-FREE',
        description: 'Modern low-level laser acupuncture providing completely painless comfort. Ideal for needle phobia, children, and elderly patients.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    'tcm-homecare-house-call': {
        id: 'tcm-homecare-house-call',
        name: 'Personalized TCM Homecare House Call Visit',
        type: 'therapeutic',
        price: 180,
        duration: '60 Mins',
        badge: 'HOME VISIT',
        description: 'Professional physician house visit across Singapore delivering personalized acupuncture, tuina, or herbal diagnosis in your home.',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    },
    'tcm-pain-relief-bundle': {
        id: 'tcm-pain-relief-bundle',
        name: 'Orthopedic Pain & Meridian Relief Bundle (5 Sessions)',
        type: 'packages',
        price: 450,
        regularPrice: 550,
        sessions: 5,
        duration: '60 Mins per session',
        badge: 'POPULAR COURSE',
        description: 'Targeted recovery regimen for chronic neck, shoulder, lower back pain, and sciatica with licensed TCM specialists.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    'acupuncture-session': {
        id: 'acupuncture-session',
        name: 'Acupuncture Meridian Therapy',
        type: 'acupuncture',
        price: 85,
        duration: '45 Mins',
        description: 'Targeted sterile acupuncture meridian therapy to unblock Qi stagnation, relieve chronic body pain, and harmonize organ systems.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    'cupping-gua-sha': {
        id: 'cupping-gua-sha',
        name: 'Fire Cupping & Gua Sha Detox',
        type: 'therapeutic',
        price: 68,
        duration: '45 Mins',
        badge: 'DETOX RITUAL',
        description: 'Authentic suction cups and jade scraping to release pathogenic dampness, stimulate blood flow, and relieve tension.',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
    }
};

export function getSharedData(type) {
    return [];
}

export function syncServices() {
    const branchKey = window.currentBranchId || window.currentTenantId || 'default-tcm';
    const servicesKey = `tcm_branch_${branchKey}_services`;
    let adminSrvRaw = localStorage.getItem(servicesKey);
    if (!adminSrvRaw) {
        const defaultServices = [
          { id: 'tcm-teleconsult-intro', name: 'Online TCM Teleconsultation (Intro Special)', price: 20, regularPrice: 50, duration: 15, category: 'Consultation', desc: 'Kick off your health journey with a certified physician via secure video call. Comprehensive lifestyle and symptom evaluation.', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80', showOnHome: true, bestValue: true },
          { id: 'tcm-laser-acupuncture', name: 'Painless Laser Acupuncture Therapy', price: 95, duration: 45, category: 'Acupuncture', desc: 'Modern low-level laser acupuncture providing completely painless comfort. Ideal for needle phobia, children, and elderly patients.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'tcm-homecare-house-call', name: 'Personalized TCM Homecare House Call Visit', price: 180, duration: 60, category: 'Therapeutic', desc: 'Professional physician house visit across Singapore delivering personalized acupuncture, tuina, or herbal diagnosis in your home.', img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'tcm-pain-relief-bundle', name: 'Orthopedic Pain & Meridian Relief Bundle (5 Sessions)', price: 450, regularPrice: 550, duration: 60, category: 'Packages', desc: 'Targeted recovery regimen for chronic neck, shoulder, lower back pain, and sciatica with licensed TCM specialists.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'acupuncture-session', name: 'Acupuncture Meridian Therapy', price: 85, duration: 45, category: 'Acupuncture', desc: 'Targeted sterile acupuncture meridian therapy to unblock Qi stagnation, relieve chronic body pain, and harmonize organ systems.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'cupping-gua-sha', name: 'Fire Cupping & Gua Sha Detox', price: 68, duration: 45, category: 'Therapeutic', desc: 'Authentic suction cups and jade scraping to release pathogenic dampness, stimulate blood flow, and relieve tension.', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', showOnHome: false }
        ];
        localStorage.setItem(servicesKey, JSON.stringify(defaultServices));
        adminSrvRaw = JSON.stringify(defaultServices);
    }

    try {
        const list = JSON.parse(adminSrvRaw);
        const shared = getSharedData('services');
        const combinedList = list.concat(shared);

        const mapped = {};
        combinedList.forEach(s => {
            let type = 'acupuncture';
            const cat = (s.category || '').toLowerCase();
            if (cat.includes('package')) type = 'packages';
            else if (cat.includes('consult')) type = 'consultation';
            else if (cat.includes('tuina') || cat.includes('massage')) type = 'tuina';
            else if (cat.includes('therap') || cat.includes('cupping') || cat.includes('moxi')) type = 'therapeutic';

            let regularPrice = s.regularPrice ? parseFloat(s.regularPrice) : undefined;
            const sessionsCount = s.sessions || (type === 'packages' ? (s.id === 'tcm-pain-relief-bundle' ? 10 : 5) : undefined);
            if (!regularPrice && type === 'packages') {
                if (s.id === 'tcm-pain-relief-bundle') regularPrice = 980;
                else if (s.id === 'tcm-vitality-package') regularPrice = 490;
                else if (s.services && s.services.length > 0) {
                    let sum = 0;
                    s.services.forEach(subId => {
                        const base = list.find(x => x.id === subId);
                        if (base) sum += (parseFloat(base.price) || 0);
                    });
                    regularPrice = sum * (sessionsCount || 1);
                }
            }

            mapped[s.id] = {
                id: s.id,
                name: s.name,
                type: type,
                price: parseFloat(s.price) || 0,
                regularPrice: regularPrice,
                sessions: sessionsCount,
                services: s.services || [],
                duration: s.duration + ' Mins',
                description: s.desc || '',
                image: s.img || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
                showOnHome: s.showOnHome !== false,
                bestValue: s.bestValue === true
            };
        });
        SERVICES = mapped;
    } catch (e) {
        console.error('Failed to sync TCM services:', e);
    }
}

// Initial Sync
syncServices();

export let THERAPISTS = {};
export let PRACTITIONERS = THERAPISTS;

export function syncTherapists() {
    const branchKey = window.currentBranchId || window.currentTenantId || 'default-tcm';
    const staffKey = `tcm_branch_${branchKey}_staff`;
    let adminStaffRaw = localStorage.getItem(staffKey);
    if (!adminStaffRaw) {
        const defaultStaff = [
          { 
            id: 'stf-1', 
            name: 'Physician Thum', 
            specialization: 'Founder & Senior TCM Telehealth Physician', 
            tags: ['Laser Acupuncture', 'Telemedicine', 'Homecare Visit'], 
            rating: 5.0, 
            reviews: 210, 
            status: 'Active', 
            avatar: 'PT', 
            color: 'rgba(4,107,210,0.15)', 
            textColor: '#046bd2', 
            img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80' 
          },
          { 
            id: 'stf-2', 
            name: 'Physician Chen Wei Lin', 
            specialization: 'TCM Physician & Laser Acupuncturist', 
            tags: ['Laser Acupuncture', 'Pain Relief', 'Meridian Therapy'], 
            rating: 4.9, 
            reviews: 142, 
            status: 'Active', 
            avatar: 'CW', 
            color: 'rgba(0,168,107,0.15)', 
            textColor: '#00a86b', 
            img: 'https://images.unsplash.com/photo-1594824813689-534570ff22cb?auto=format&fit=crop&w=800&q=80' 
          },
          { 
            id: 'stf-3', 
            name: 'Physician Tan Mei Ling', 
            specialization: "TCM Herbalist & Women's Health", 
            tags: ['Herbal Remedies', 'Insomnia Therapy', 'Gua Sha & Cupping'], 
            rating: 4.9, 
            reviews: 118, 
            status: 'Active', 
            avatar: 'TM', 
            color: 'rgba(255,105,0,0.15)', 
            textColor: '#ff6900', 
            img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80' 
          }
        ];
        localStorage.setItem(staffKey, JSON.stringify(defaultStaff));
        adminStaffRaw = JSON.stringify(defaultStaff);
    }
    try {
        const list = JSON.parse(adminStaffRaw);
        const shared = getSharedData('staff');
        const combinedList = list.concat(shared);

        const mapped = {};
        combinedList.forEach(s => {
            let imgUrl = s.img;
            if (!imgUrl) {
                if (s.id === 'stf-1') imgUrl = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80';
                else if (s.id === 'stf-2') imgUrl = 'https://images.unsplash.com/photo-1594824813689-534570ff22cb?auto=format&fit=crop&w=800&q=80';
                else if (s.id === 'stf-3') imgUrl = 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80';
                else imgUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
            }
            mapped[s.id] = {
                id: s.id,
                name: s.name,
                role: s.specialization || 'TCM Physician',
                specialties: s.tags || [],
                rating: s.rating || 4.9,
                reviews: s.reviews || 95,
                experience: s.rating ? `★ ${s.rating} (${s.reviews || 95} reviews)` : '8 Years',
                experienceYears: s.id === 'stf-1' ? '12+ Years' : (s.id === 'stf-2' ? '10+ Years' : '15+ Years'),
                certifications: s.id === 'stf-1'
                    ? ['TCMPB Registered TCM Physician (Singapore)', 'Bachelor of TCM (Beijing University of Chinese Medicine)', 'Clinical Acupuncturist Specialist']
                    : (s.id === 'stf-2'
                        ? ['TCMPB Registered TCM Physician', 'Master of Clinical TCM (Nanjing University)', 'Certified Moxibustion Specialist']
                        : ['Senior TCM Tuina Specialist', 'Singapore TCM Practitioners Association Member', 'Musculoskeletal Rehabilitation Practitioner']),
                description: s.specialization ? `Registered TCM specialist in ${s.specialization}, committed to holistic pulse analysis and meridian healing.` : 'Dedicated TCM practitioner.',
                fullBio: s.id === 'stf-1'
                    ? 'Physician Chen has over 12 years of clinical TCM practice, graduating from Beijing University of Chinese Medicine. He specializes in pulse diagnosis, targeted meridian acupuncture, and chronic internal disharmony.'
                    : (s.id === 'stf-2'
                        ? "Physician Tan holds a Master's degree in Clinical TCM and specializes in personalized herbal prescriptions, women's vitality, cupping, and warm moxibustion therapy."
                        : 'Master Lim has over 15 years of orthopedic manipulative therapy experience, addressing persistent postural misalignment, shoulder stiffness, and sports injuries.'),
                image: imgUrl
            };
        });
        mapped['no-preference'] = {
            id: 'no-preference',
            name: 'No Preference (Next Available Physician)',
            role: 'Any Available Practitioner',
            specialties: [],
            experience: 'N/A',
            description: 'Let our clinic assign the best available TCM physician or tuina specialist for your selected appointment time.',
            image: ''
        };
        THERAPISTS = mapped;
        PRACTITIONERS = mapped;
    } catch (e) {
        console.error('Failed to sync TCM practitioners:', e);
    }
}

syncTherapists();

window.getSharedData = getSharedData;
window.syncServices = syncServices;
window.syncTherapists = syncTherapists;
