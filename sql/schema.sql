-- ============================================================================
-- 🏥 CLINIVA PLATFORM — SUPABASE POSTGRESQL SCHEMA & INITIAL SEED DATA
-- Version: 1.0 (Relational Data Model + RLS + Realtime Publication)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'SUPER_ADMIN',
        'OWNER',
        'BRANCH_ADMIN',
        'PRACTITIONER',
        'USER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE queue_status_enum AS ENUM (
        'WAITING',
        'READY',
        'CHECKED-IN',
        'IN_CONSULT',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM (
        'CONFIRMED',
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'RESCHEDULED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. TABLES DEFINITION
-- ============================================================================

-- A. CLINIC BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_code TEXT NOT NULL DEFAULT 'sg',
    region TEXT NOT NULL DEFAULT 'Singapore',
    country TEXT NOT NULL DEFAULT 'Singapore',
    currency TEXT NOT NULL DEFAULT 'SGD',
    address TEXT NOT NULL,
    phone TEXT,
    hours TEXT,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. USER PROFILES TABLE (Mirrors RBAC actors)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Can store Auth UUID or custom usr-* ID
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'USER',
    title TEXT,
    specialty TEXT,
    room TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    branch_name TEXT,
    region TEXT DEFAULT 'sg',
    avatar TEXT DEFAULT '👤',
    active_booking_code TEXT,
    queue_number TEXT,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. SERVICES CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL DEFAULT 'wellness', -- wellness, physio, nutrition, tcm
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price_sgd NUMERIC(10,2) NOT NULL DEFAULT 120.00,
    price_myr NUMERIC(10,2) NOT NULL DEFAULT 260.00,
    deposit_sgd NUMERIC(10,2) NOT NULL DEFAULT 30.00,
    deposit_myr NUMERIC(10,2) NOT NULL DEFAULT 60.00,
    description TEXT,
    requires_equipment TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. PRACTITIONERS TABLE
CREATE TABLE IF NOT EXISTS public.practitioners (
    id TEXT PRIMARY KEY,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT,
    template_id TEXT NOT NULL DEFAULT 'wellness',
    room TEXT,
    avatar TEXT DEFAULT '🧑‍⚕️',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. BOOKINGS / RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    patient_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    patient_email TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    branch_name TEXT NOT NULL,
    branch_address TEXT,
    service_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    practitioner_id TEXT REFERENCES public.practitioners(id) ON DELETE SET NULL,
    practitioner_name TEXT NOT NULL,
    schedule_date TEXT NOT NULL, -- Format: YYYY-MM-DD or Display String
    schedule_slot TEXT NOT NULL, -- Format: 10:30 SGT
    room TEXT,
    deposit_paid TEXT,
    payment_status TEXT DEFAULT 'DEPOSIT_PAID',
    status booking_status_enum NOT NULL DEFAULT 'CONFIRMED',
    template_type TEXT NOT NULL DEFAULT 'wellness',
    chief_complaint TEXT,
    pain_scale TEXT,
    intake_data TEXT,
    intake_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. LIVE QUEUE TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.queue_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_number TEXT NOT NULL, -- e.g. A-01, B-02
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    service_name TEXT NOT NULL,
    practitioner_name TEXT,
    room TEXT,
    status queue_status_enum NOT NULL DEFAULT 'WAITING',
    status_badge TEXT NOT NULL DEFAULT 'WAITING',
    badge_color TEXT DEFAULT '#b45309',
    badge_bg TEXT DEFAULT '#fef3c7',
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. CLINICAL TREATMENT NOTES TABLE (Doctor notes & pain map)
CREATE TABLE IF NOT EXISTS public.treatment_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    practitioner_id TEXT,
    patient_name TEXT NOT NULL,
    complaint TEXT,
    pain_scale TEXT,
    duration TEXT,
    notes TEXT,
    pain_markers JSONB, -- Array of clicked pain points
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(code);
CREATE INDEX IF NOT EXISTS idx_bookings_branch ON public.bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_branch_status ON public.queue_tickets(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_created ON public.queue_tickets(created_at);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anon Key Read Access for master catalog (branches, services, practitioners)
CREATE POLICY "Public read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read practitioners" ON public.practitioners FOR SELECT USING (true);

-- Profiles: Allow read and insert/update for demo & self-service
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

-- Bookings: Allow create booking publicly & read by code
CREATE POLICY "Public bookings create" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings select" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public bookings update" ON public.bookings FOR UPDATE USING (true);

-- Queue Tickets: Allow read, insert and update (for live front desk & doctor call)
CREATE POLICY "Public queue select" ON public.queue_tickets FOR SELECT USING (true);
CREATE POLICY "Public queue insert" ON public.queue_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public queue update" ON public.queue_tickets FOR UPDATE USING (true);

-- Treatment Notes: Allow read & insert
CREATE POLICY "Public notes select" ON public.treatment_notes FOR SELECT USING (true);
CREATE POLICY "Public notes insert" ON public.treatment_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public notes update" ON public.treatment_notes FOR UPDATE USING (true);

-- Audit logs
CREATE POLICY "Public audit select" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public audit insert" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- ============================================================================
-- Enables WebSocket broadcast on queue changes and bookings
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tickets;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 7. INITIAL SEED DATA
-- ============================================================================

-- Branches
INSERT INTO public.branches (id, name, region_code, region, country, currency, address, phone, hours, lat, lng)
VALUES
('sg-orchard', 'Orchard Wellness & Luxury Spa', 'sg', 'Singapore', 'Singapore', 'SGD', '290 Orchard Road, Paragon Medical #14-02, Singapore 238859', '+65 6738 1234', 'Mon - Sat (08:30 - 20:00 SGT)', 1.3039, 103.8358),
('sg-jurong', 'Jurong East Integrative Care Hub', 'sg', 'Singapore', 'Singapore', 'SGD', '3 Gateway Drive, Westgate Medical #08-11, Singapore 608532', '+65 6789 5566', 'Mon - Sun (09:00 - 21:00 SGT)', 1.3331, 103.7436),
('my-klcc', 'KLCC Wellness & Aesthetic Pavilion', 'my', 'Kuala Lumpur', 'Malaysia', 'MYR', 'Suite 18-03, Menara Maxis, Kuala Lumpur City Centre, 50088 KL', '+60 3 2181 8899', 'Mon - Sat (09:00 - 19:30 MYT)', 3.1578, 101.7123)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- Initial Profiles (Demo Credentials)
INSERT INTO public.profiles (id, email, phone, name, role, title, specialty, room, branch_id, branch_name, region, avatar)
VALUES
('usr-superadmin-01', 'superadmin@cliniva.com', '+65 9000 1111', 'Dr. Hendra Wijaya', 'SUPER_ADMIN', 'Chief Medical Officer & Super Admin', NULL, NULL, NULL, NULL, 'sg', '👑'),
('usr-owner-dennis', 'dennis@cliniva.com', '+65 8999 7788', 'Dennis Pratama', 'OWNER', 'Clinic Owner', NULL, NULL, NULL, 'Cliniva Orchard HQ', 'sg', '💼'),
('usr-branchadmin-01', 'reception@orchardclinic.sg', '+65 9222 3333', 'Siti Rahmah', 'BRANCH_ADMIN', 'Lead Branch Admin & Front Desk', NULL, NULL, 'sg-orchard', 'Orchard Wellness & Luxury Spa', 'sg', '🏪'),
('usr-branchadmin-02', 'manager@orchardclinic.sg', '+65 9333 4444', 'Rachel Tan', 'BRANCH_ADMIN', 'Branch Operations Admin', NULL, NULL, 'sg-orchard', 'Orchard Wellness & Luxury Spa', 'sg', '🏢'),
('usr-practitioner-01', 'dr.lim@orchardclinic.sg', '+65 9111 2222', 'Dr. Lim Wei Han', 'PRACTITIONER', 'Senior Physiotherapist', 'Sports Rehabilitation & Spine', 'Room A2 (Physio Suite)', 'sg-orchard', 'Orchard Wellness & Luxury Spa', 'sg', '🧑‍⚕️'),
('usr-patient-01', 'amanda@tan.sg', '+65 8123 4567', 'Amanda Tan', 'USER', 'Registered Patient', NULL, NULL, 'sg-orchard', 'Orchard Wellness & Luxury Spa', 'sg', '👤')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- Services Catalog
INSERT INTO public.services (id, template_id, code, name, category, duration_minutes, price_sgd, price_myr, deposit_sgd, deposit_myr, description, requires_equipment)
VALUES
('srv-wellness-01', 'wellness', 'W-01', 'Balinese Herbal Signature Massage', 'Body Therapy', 75, 130.00, 280.00, 35.00, 70.00, 'Signature deep-tissue pressure with organic Indonesian botanical essential oils', 'Standard Treatment Bed'),
('srv-wellness-02', 'wellness', 'W-02', 'Hydrotherapy Jacuzzi & Salt Scrub', 'Hydrotherapy', 90, 160.00, 350.00, 40.00, 80.00, 'Detoxifying magnesium soak combined with Himalayan pink salt body polish', 'Hydrotherapy Jacuzzi Tub'),
('srv-physio-01', 'physio', 'P-01', 'Targeted Spine Decompression Session', 'Spine Rehab', 60, 150.00, 320.00, 40.00, 80.00, 'Non-surgical computerized spinal decompression for disc herniation and sciatica', 'Spinal Decompression Table'),
('srv-physio-02', 'physio', 'P-02', 'Extracorporeal Shockwave Therapy (ESWT)', 'Sports Rehab', 45, 140.00, 300.00, 35.00, 75.00, 'Acoustic wave therapy targeting chronic plantar fasciitis, tendinopathy, and calcification', 'Shockwave Therapy Unit'),
('srv-tcm-01', 'tcm', 'TCM-01', 'Clinical Acupuncture & Meridian Balancing', 'TCM Care', 60, 110.00, 240.00, 30.00, 60.00, 'Sterile single-use micro-needle placement along traditional meridians to balance Qi flow', 'Standard Treatment Bed')
ON CONFLICT (id) DO NOTHING;

-- Practitioners
INSERT INTO public.practitioners (id, profile_id, branch_id, name, title, specialty, template_id, room, avatar)
VALUES
('dr-lim-wei-han', 'usr-practitioner-01', 'sg-orchard', 'Dr. Lim Wei Han', 'Senior Physiotherapist', 'Sports Rehabilitation & Spine', 'physio', 'Room A2 (Physio Suite)', '🧑‍⚕️'),
('physician-huang-wei', NULL, 'sg-orchard', 'Physician Huang Wei', 'TCM Senior Physician', 'Meridian Therapy & Acupuncture', 'tcm', 'Consultation Suite 01', '👨‍⚕️'),
('therapist-sarah-jenkins', NULL, 'sg-orchard', 'Therapist Sarah Jenkins', 'Master Aesthetician & Body Worker', 'Deep Tissue & Hot Stone', 'wellness', 'VIP Aromatherapy Suite', '👩‍⚕️')
ON CONFLICT (id) DO NOTHING;

-- Initial Demo Live Queue (Orchard Branch)
INSERT INTO public.queue_tickets (queue_number, branch_id, patient_name, patient_phone, service_name, practitioner_name, room, status, status_badge, badge_color, badge_bg)
VALUES
('A-01', 'sg-orchard', 'Rendra Pratama', '+65 9123 4567', 'Clinical Acupuncture · Physician Huang Wei', 'Physician Huang Wei', 'Consultation Suite 01', 'READY', 'READY', '#0f766e', '#f0fdfa'),
('B-02', 'sg-orchard', 'Amanda Tan', '+65 8123 4567', 'Physiotherapy & Spine · Dr. Lim', 'Dr. Lim Wei Han', 'Room A2 (Physio Suite)', 'WAITING', 'WAITING', '#b45309', '#fef3c7'),
('C-03', 'sg-orchard', 'Jason Lee', '+65 9345 6789', 'Wellness Spa Aromatherapy · Therapist Sarah', 'Therapist Sarah Jenkins', 'VIP Aromatherapy Suite', 'CHECKED-IN', 'CHECKED-IN', '#0369a1', '#e0f2fe');
