import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';

// 1. MOCK DATABASE
export let SERVICES = {
    // Packages / Bundles
    'radiance-bundle': {
        id: 'radiance-bundle',
        name: 'Radiance Facial Bundle',
        type: 'packages',
        price: 850,
        regularPrice: 950,
        sessions: 10,
        duration: '60 Mins per session',
        description: "Commit to your skin's health with our 10-session package. Regular treatments yield lasting, radiant results. Enjoy significant savings when booking this comprehensive care package.",
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    'aromatherapy-bundle': {
        id: 'aromatherapy-bundle',
        name: 'Aromatherapy Massage Package (10 Sessions)',
        type: 'packages',
        price: 1000,
        regularPrice: 1200,
        sessions: 10,
        badge: 'PACKAGE DEAL',
        duration: '60 / 90 Mins per session',
        description: 'Pre-purchase 10 sessions of our signature Aromatherapy Massage and save. Valid for 12 months.',
        image: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg'
    },
    'half-day-spa-package': {
        id: 'half-day-spa-package',
        name: 'Half-Day Spa Package',
        type: 'packages',
        price: 250,
        regularPrice: 300,
        sessions: 1,
        duration: '3 Hours',
        description: 'Enjoy a combination of aromatherapy massage, facial, and body scrub for 3 full hours of ultimate relaxation.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    'aromatherapy-massage': {
        id: 'aromatherapy-massage',
        name: 'Aromatherapy Massage',
        type: 'massage',
        price: 120,
        duration: '60 / 90 Mins',
        description: 'Deep relaxation massage using selected essential oils that soothe the nervous system and relieve muscle tension. A holistic experience.',
        image: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg'
    },
    'deep-tissue': {
        id: 'deep-tissue',
        name: 'Serenity Signature Deep Tissue',
        type: 'signature',
        price: 150,
        duration: '90 Mins',
        description: 'Intensive treatment focusing on deep muscle layers to restore the body from chronic fatigue.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    },
    'radiance-organic-facial': {
        id: 'radiance-organic-facial',
        name: 'Facial Rejuvenation',
        type: 'facial',
        price: 95,
        duration: '60 Mins',
        description: 'Brightening facial treatment with organic plant extracts.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    // Signature
    'hot-stone': {
        id: 'hot-stone',
        name: 'Hot Stone Therapy',
        type: 'signature',
        price: 165,
        duration: '90 Mins',
        description: 'Basalt stones are heated and placed on key energy points to melt away tension and restore vital energy flow.',
        badge: 'RESTORATIVE',
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
    },
    'signature-soul': {
        id: 'signature-soul',
        name: 'Signature Soul Massage',
        type: 'signature',
        price: 190,
        duration: '120 Mins',
        description: "A personalized fusion of Swedish, Shiatsu, and Reflexology techniques tailored to your body's specific needs.",
        badge: 'BESPOKE',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    // Facial
    'illuminating-peel': {
        id: 'illuminating-peel',
        name: 'Illuminating Peel',
        type: 'facial',
        price: 95,
        duration: '45 Mins',
        description: 'Fruit enzymes to brighten and smooth dull skin.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    },
    'pure-hydration': {
        id: 'pure-hydration',
        name: 'Pure Hydration',
        type: 'facial',
        price: 120,
        duration: '60 Mins',
        description: 'Moisture-locking facial with hyaluronic acid.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    // Body / Scrubs
    'sea-salt-glow': {
        id: 'sea-salt-glow',
        name: 'Sea Salt Glow',
        type: 'body',
        price: 110,
        duration: '60 Mins',
        description: 'Exfoliating ritual for silky smooth skin.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    },
    'herbal-detox': {
        id: 'herbal-detox',
        name: 'Herbal Detox Wrap',
        type: 'body',
        price: 150,
        duration: '75 Mins',
        description: 'Warm wrap infused with mountain herbs.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    'detox-body-scrub': {
        id: 'detox-body-scrub',
        name: 'Detox Body Scrub',
        type: 'body',
        price: 85,
        duration: '60 Mins',
        description: 'Thorough exfoliation for soft, radiant skin.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    }
};

export function getSharedData(type) {
    const currentTId = window.currentTenantId || 'serenity';
    const tenants = JSON.parse(localStorage.getItem('spa_tenants')) || DEFAULT_TENANTS;
    let sharedItems = [];
    
    Object.keys(tenants).forEach(tId => {
        if (tId === currentTId) return;
        const t = tenants[tId];
        if (t.sharing && Array.isArray(t.sharing.sharedWith) && t.sharing.sharedWith.includes(currentTId)) {
            if (Array.isArray(t.sharing.sharedTypes) && t.sharing.sharedTypes.includes(type)) {
                const storageKey = `${tId}_admin_${type}`;
                const rawData = localStorage.getItem(storageKey);
                if (rawData) {
                    try {
                        const items = JSON.parse(rawData);
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                item.originalId = item.id;
                                item.id = `${tId}_${item.id}`;
                                item.isShared = true;
                                item.sharedFromId = tId;
                                item.sharedFromName = t.name;
                            });
                            sharedItems = sharedItems.concat(items);
                        }
                    } catch (e) {
                        console.error(`Failed to parse shared data for ${tId} type ${type}`, e);
                    }
                }
            }
        }
    });
    return sharedItems;
}

export function syncServices() {
    const servicesKey = `${window.currentTenantId}_admin_services`;
    let adminSrvRaw = localStorage.getItem(servicesKey);
    if (!adminSrvRaw) {
        const defaultServices = [
          { id: 'radiance-bundle', name: 'Radiance Facial Bundle', price: 850, regularPrice: 950, duration: 60, category: 'Packages', desc: "Commit to your skin's health with our 10-session package. Regular treatments yield lasting, radiant results. Enjoy significant savings when booking this comprehensive care package.", img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true, bestValue: true },
          { id: 'aromatherapy-bundle', name: 'Aromatherapy Massage Package (10 Sessions)', price: 1000, regularPrice: 1200, duration: 60, category: 'Packages', desc: 'Pre-purchase 10 sessions of our signature Aromatherapy Massage and save. Valid for 12 months.', img: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg', showOnHome: false },
          { id: 'half-day-spa-package', name: 'Half-Day Spa Package', price: 250, regularPrice: 300, duration: 180, category: 'Packages', desc: 'Enjoy a combination of aromatherapy massage, facial, and body scrub for 3 full hours of ultimate relaxation.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'aromatherapy-massage', name: 'Aromatherapy Massage', price: 120, duration: 60, category: 'Massage', desc: 'Deep relaxation massage using selected essential oils that soothe the nervous system and relieve muscle tension. A holistic experience.', img: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg', showOnHome: true },
          { id: 'deep-tissue', name: 'Serenity Signature Deep Tissue', price: 150, duration: 90, category: 'Therapeutic', desc: 'Intensive treatment focusing on deep muscle layers to restore the body from chronic fatigue.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'radiance-organic-facial', name: 'Facial Rejuvenation', price: 95, duration: 60, category: 'Skincare', desc: 'Brightening facial treatment with organic plant extracts.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
          { id: 'hot-stone', name: 'Hot Stone Therapy', price: 165, duration: 90, category: 'Signature', desc: 'Basalt stones are heated and placed on key energy points to melt away tension and restore vital energy flow.', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'signature-soul', name: 'Signature Soul Massage', price: 190, duration: 120, category: 'Signature', desc: "A personalized fusion of Swedish, Shiatsu, and Reflexology techniques tailored to your body's specific needs.", img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'illuminating-peel', name: 'Illuminating Peel', price: 95, duration: 45, category: 'Skincare', desc: 'Fruit enzymes to brighten and smooth dull skin.', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'pure-hydration', name: 'Pure Hydration', price: 120, duration: 60, category: 'Skincare', desc: 'Deep hydration facial restoring radiance.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: false },
          { id: 'detox-body-scrub', name: 'Body Scrub', price: 85, duration: 30, category: 'Body', desc: 'Exfoliating treatment with natural sea salts.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80', showOnHome: true }
        ];
        localStorage.setItem(servicesKey, JSON.stringify(defaultServices));
        adminSrvRaw = JSON.stringify(defaultServices);
    }

    try {
        const list = JSON.parse(adminSrvRaw);
        let hasChanges = false;
        const updatedImages = {
            'radiance-bundle': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
            'aromatherapy-bundle': 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg',
            'half-day-spa-package': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
            'aromatherapy-massage': 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg',
            'deep-tissue': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
            'radiance-organic-facial': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
            'hot-stone': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
            'signature-soul': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
            'illuminating-peel': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
            'pure-hydration': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
            'detox-body-scrub': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
            'sea-salt-glow': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
            'herbal-detox': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
        };
        list.forEach(s => {
            if (updatedImages[s.id] && s.img !== updatedImages[s.id]) {
                s.img = updatedImages[s.id];
                hasChanges = true;
            }
        });
        if (hasChanges) {
            localStorage.setItem(servicesKey, JSON.stringify(list));
        }

        const shared = getSharedData('services');
        const combinedList = list.concat(shared);

        const mapped = {};
        combinedList.forEach(s => {
            let type = 'massage';
            const cat = (s.category || '').toLowerCase();
            if (cat.includes('package')) type = 'packages';
            else if (cat.includes('skincare') || cat.includes('facial')) type = 'facial';
            else if (cat.includes('signature')) type = 'signature';
            else if (cat.includes('body')) type = 'body';

            let regularPrice = s.regularPrice ? parseFloat(s.regularPrice) : undefined;
            const sessionsCount = s.sessions || (type === 'packages' ? (s.id === 'radiance-bundle' || s.id === 'aromatherapy-bundle' ? 10 : 1) : undefined);
            if (!regularPrice && type === 'packages') {
                if (s.id === 'radiance-bundle') regularPrice = 950;
                else if (s.id === 'aromatherapy-bundle') regularPrice = 1200;
                else if (s.id === 'half-day-spa-package') regularPrice = 300;
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
                image: s.img || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
                showOnHome: s.showOnHome !== false,
                bestValue: s.bestValue === true
            };
        });
        SERVICES = mapped;
    } catch (e) {
        console.error('Failed to sync services:', e);
    }
}

// Initial Sync
syncServices();

export let THERAPISTS = {};

export function syncTherapists() {
    let adminStaffRaw = localStorage.getItem(`${window.currentTenantId}_admin_staff`);
    if (!adminStaffRaw) {
        const defaultStaff = [
          { id: 'stf-1', name: 'Siti Rahmawati', specialization: 'Deep Tissue', tags: ['Deep Tissue', 'Aromatherapy'], rating: 4.9, reviews: 120, status: 'Active', avatar: 'SR', color: 'rgba(105,122,86,0.25)', textColor: '#3c4c2b', img: '' },
          { id: 'stf-2', name: 'Budi Santoso', specialization: 'Master Healer', tags: ['Shiatsu', 'Reflexology'], rating: 4.8, reviews: 85, status: 'Active', avatar: 'BS', color: '#dde4e3', textColor: '#45483f', img: '' },
          { id: 'stf-3', name: 'Dewi Lestari', specialization: 'Therapist', tags: ['Swedish', 'Hot Stone'], rating: 4.7, reviews: 63, status: 'Active', avatar: 'ER', color: '#d6e9bd', textColor: '#111f05', img: '' }
        ];
        localStorage.setItem(`${window.currentTenantId}_admin_staff`, JSON.stringify(defaultStaff));
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
                if (s.id === 'stf-1') imgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyGpGMCc0s6-2cZr0NlDqaewuY-I9V_tOS8-XEbzthk_cjPBnUWtYTnWzH3nKaivNuirBu4tNgHsUWKNNS3g4Besm6fNOCnSOYNA5tE5lQiFyryHkMi17UVHZdVUe3pfIxNL1UexF0lWLCBJsFj_lt_rWfPnZvDwLKQg8NwJMX4UPtJHqxLiIu_HrCIKlIQPC4NU6MarRT2m6ZaUUWttG4qHgDH3pnGLTZxeUXRhC2t6y0a38c1Y2aA';
                else if (s.id === 'stf-2') imgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8rPIO2PgwyFK2XCcQXkgTD6GAp5gbUF-guUlH71qrNTwYFVRyW4Vlw6hb0xaXK8ekXQOPDwNEQk2qXu5JHlWXRxVkRWK06tsze7nh_Yuc_u6Xz90sFEzgvTCibstYc54kUpAoQaDNOhw_UkE2kSrS3rME23700F9kiWckGzjgTvH8I1Fo6RNLOH2UyHMo_lWG1bwOg9cPeqnKqhsCt1HhTKzPhmLaCQbhLlZQLeMKZUqPtdiTq09CQ';
                else if (s.id === 'stf-3') imgUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOfHRSxF7gO4ZMGWydi-40kKfg1gL4Y_-Xz8bg5YOyx_LSEkF_YNrKWzjpmp-jWQiM-tEk1TOA-dX9FEOLMRlEenjjhIz34pmjziG6iNnMqcIUmYRaw_9QGEPOgJYvAChYgrUydIlTZMSQMQqi92VbsMiZLUTSDL5UG3YW2pYsK_3WGp4nLcWrw2vAMj0Ym-oGMytaCLwwJJGGqP5ySgcmTwYAfCMBqq8-Xml_EXoIvEido8IrpObQWw';
                else imgUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
            }
            mapped[s.id] = {
                id: s.id,
                name: s.name,
                role: s.specialization || 'Therapist',
                specialties: s.tags || [],
                rating: s.rating || 4.9,
                reviews: s.reviews || 95,
                experience: s.rating ? `★ ${s.rating} (${s.reviews || 85} reviews)` : '5 Years',
                experienceYears: s.id === 'stf-1' ? '8+ Years' : (s.id === 'stf-2' ? '10+ Years' : '6+ Years'),
                certifications: s.id === 'stf-1'
                    ? ['CISP International Master', 'Deep Tissue & Sports Massage Diploma', 'Organic Aromatherapy Certified']
                    : (s.id === 'stf-2'
                        ? ['Shiatsu Master Healer', 'Reflexology Practitioner Diploma', 'Thai Traditional Massage']
                        : ['Swedish Therapeutic Diploma', 'Volcanic Hot Stone Certified', 'Lymphatic Drainage Specialist']),
                description: s.specialization ? `Expert in ${s.specialization} and dedicated to providing a deeply relaxing and therapeutic wellness session.` : 'Dedicated wellness practitioner.',
                fullBio: s.id === 'stf-1'
                    ? 'Siti is a master practitioner with over 8 years of dedicated experience in deep muscle therapy and sensory healing. Trained at the renowned Bali Spa Institute, her intuitive touch effectively targets chronic stiffness and stress points.'
                    : (s.id === 'stf-2'
                        ? 'Budi specializes in oriental pressure-point therapies including Shiatsu and holistic Reflexology. With 10+ years of practice, he helps clients restore vital energy flow and relieve nerve tension.'
                        : 'Dewi combines soft rhythmic Swedish strokes with heated volcanic stones to deliver a comforting, deeply rejuvenating experience aimed at calming the mind and softening rigid muscles.'),
                image: imgUrl
            };
        });
        mapped['no-preference'] = {
            id: 'no-preference',
            name: 'No Preference',
            role: 'Any Available',
            specialties: [],
            experience: 'N/A',
            description: 'Let us assign the best available therapist for your selected time and service to ensure a seamless reservation.',
            image: ''
        };
        THERAPISTS = mapped;
    } catch (e) {
        console.error('Failed to sync therapists:', e);
    }
}

syncTherapists();

window.getSharedData = getSharedData;
window.syncServices = syncServices;
window.syncTherapists = syncTherapists;
