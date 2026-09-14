import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';

// 1. TCM MOCK DATABASE & CATALOG
export let SERVICES = {
    'tcm-pain-relief-bundle': {
        id: 'tcm-pain-relief-bundle',
        name: 'Orthopedic Tuina & Pain Relief Bundle (10 Sessions)',
        type: 'packages',
        price: 880,
        regularPrice: 980,
        sessions: 10,
        duration: '60 Mins per session',
        badge: 'PACKAGE DEAL',
        description: 'Structured pain recovery regimen for chronic neck, shoulder, lower back pain, and sciatica with licensed TCM specialists.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    'tcm-vitality-package': {
        id: 'tcm-vitality-package',
        name: 'Complete TCM Meridian Vitality Package (5 Sessions)',
        type: 'packages',
        price: 420,
        regularPrice: 490,
        sessions: 5,
        duration: '60 Mins per session',
        badge: 'POPULAR COURSE',
        description: 'Comprehensive holistic course combining physician consultation, targeted acupuncture, and meridian tuina bodywork for enduring vitality.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
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
    'tcm-herbal-consultation': {
        id: 'tcm-herbal-consultation',
        name: 'TCM Pulse & Herbal Consultation',
        type: 'consultation',
        price: 60,
        duration: '30 Mins',
        description: 'Comprehensive pulse examination, tongue analysis, and personalized herbal medication prescription by a certified TCM physician.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    'tcm-tuina-therapy': {
        id: 'tcm-tuina-therapy',
        name: 'Therapeutic TCM Tuina Bodywork',
        type: 'tuina',
        price: 98,
        duration: '60 Mins',
        description: 'Traditional Chinese medical bodywork addressing musculoskeletal ailments, joint stiffness, and deep structural alignment.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    },
    'cupping-gua-sha': {
        id: 'cupping-gua-sha',
        name: 'Fire Cupping & Gua Sha Detox',
        type: 'therapeutic',
        price: 68,
        duration: '45 Mins',
        badge: 'DETOX RITUAL',
        description: 'Authentic glass cup fire suction combined with jade scraping to release pathogenic dampness and stimulate healthy blood microcirculation.',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
    },
    'moxibustion-therapy': {
        id: 'moxibustion-therapy',
        name: 'Warm Herbal Moxibustion Ritual',
        type: 'therapeutic',
        price: 78,
        duration: '45 Mins',
        description: 'Application of burning aged mugwort herb above acupuncture meridians to warm the channels, dispel cold, and revitalize energy.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
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
          { id: 'tcm-pain-relief-bundle', name: 'Orthopedic Tuina & Pain Relief Bundle (10 Sessions)', price: 880, regularPrice: 980, duration: 60, category: 'Packages', desc: 'Structured pain recovery regimen for chronic neck, shoulder, lower back pain, and sciatica with licensed TCM specialists.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: true, bestValue: true },
          { id: 'tcm-vitality-package', name: 'Complete TCM Meridian Vitality Package (5 Sessions)', price: 420, regularPrice: 490, duration: 60, category: 'Packages', desc: 'Comprehensive holistic course combining physician consultation, targeted acupuncture, and meridian tuina bodywork for enduring vitality.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'acupuncture-session', name: 'Acupuncture Meridian Therapy', price: 85, duration: 45, category: 'Acupuncture', desc: 'Targeted sterile acupuncture meridian therapy to unblock Qi stagnation, relieve chronic body pain, and harmonize organ systems.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'tcm-herbal-consultation', name: 'TCM Pulse & Herbal Consultation', price: 60, duration: 30, category: 'Consultation', desc: 'Comprehensive pulse examination, tongue analysis, and personalized herbal medication prescription by a certified TCM physician.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'tcm-tuina-therapy', name: 'Therapeutic TCM Tuina Bodywork', price: 98, duration: 60, category: 'Tuina', desc: 'Traditional Chinese medical bodywork addressing musculoskeletal ailments, joint stiffness, and deep structural alignment.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'cupping-gua-sha', name: 'Fire Cupping & Gua Sha Detox', price: 68, duration: 45, category: 'Therapeutic', desc: 'Authentic glass cup fire suction combined with jade scraping to release pathogenic dampness and stimulate healthy blood microcirculation.', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'moxibustion-therapy', name: 'Warm Herbal Moxibustion Ritual', price: 78, duration: 45, category: 'Therapeutic', desc: 'Application of burning aged mugwort herb above acupuncture meridians to warm the channels, dispel cold, and revitalize energy.', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', showOnHome: false }
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
            name: 'Physician Chen Wei Lin', 
            specialization: 'TCM Physician & Acupuncturist', 
            tags: ['Acupuncture', 'Internal Medicine', 'Meridian Therapy'], 
            rating: 4.9, 
            reviews: 142, 
            status: 'Active', 
            avatar: 'CW', 
            color: 'rgba(22,78,63,0.2)', 
            textColor: '#164e3f', 
            img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80' 
          },
          { 
            id: 'stf-2', 
            name: 'Physician Tan Mei Ling', 
            specialization: "TCM Herbalist & Women's Health", 
            tags: ['Herbal Medicine', 'Gua Sha & Cupping', 'Moxibustion'], 
            rating: 4.9, 
            reviews: 118, 
            status: 'Active', 
            avatar: 'TM', 
            color: 'rgba(200,157,83,0.2)', 
            textColor: '#8c6521', 
            img: 'https://images.unsplash.com/photo-1594824813689-534570ff22cb?auto=format&fit=crop&w=800&q=80' 
          },
          { 
            id: 'stf-3', 
            name: 'Master Lim Keng Hock', 
            specialization: 'Senior TCM Tuina & Orthopedics', 
            tags: ['Orthopedic Tuina', 'Pain Relief', 'Spinal Alignment'], 
            rating: 4.8, 
            reviews: 96, 
            status: 'Active', 
            avatar: 'LK', 
            color: '#e5e0d8', 
            textColor: '#40382e', 
            img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80' 
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
