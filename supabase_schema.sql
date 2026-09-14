-- ==============================================================================
-- TERRA MATRIX SUPABASE DATABASE SCHEMA & INITIAL SEED SCRIPT
-- Run this complete SQL script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE 'trainings' TABLE
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Geospatial Intelligence',
    date TEXT NOT NULL,
    duration TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Online', -- 'Online', 'In-Person', 'Hybrid'
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming' | 'completed'
    image TEXT DEFAULT '/images/about/geospatial.svg',
    highlights TEXT[] DEFAULT '{}',
    attendees TEXT,
    link TEXT DEFAULT '/contact',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE 'projects' TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    paragraph TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '/images/project/Project-01.png',
    author_name TEXT NOT NULL DEFAULT 'Terra Matrix',
    author_image TEXT NOT NULL DEFAULT '/images/favicon.png',
    author_designation TEXT NOT NULL DEFAULT 'Engineering Team',
    tags TEXT[] DEFAULT '{"Infrastructure"}',
    publish_date TEXT NOT NULL DEFAULT '2026',
    href TEXT NOT NULL DEFAULT '/project-details/groundwater-forecast',
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE 'conferences' TABLE
CREATE TABLE IF NOT EXISTS public.conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL DEFAULT 'Bhubaneswar / Online',
    date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technical Symposium',
    image TEXT DEFAULT '/images/about/innovation.svg',
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming' | 'completed'
    registration_link TEXT DEFAULT '/contact',
    highlights TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE 'teams' TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    designation TEXT NOT NULL,
    domain TEXT,
    category_group TEXT DEFAULT 'Core Team',
    image TEXT NOT NULL DEFAULT '/images/team/member-01.png',
    summary TEXT,
    bio TEXT,
    expertise TEXT[] DEFAULT '{}',
    experience TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    software_skills TEXT[] DEFAULT '{}',
    education TEXT[] DEFAULT '{}',
    contact_number TEXT,
    email TEXT,
    linkedin TEXT,
    twitter TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure existing tables have all rich columns
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS category_group TEXT DEFAULT 'Core Team';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS expertise TEXT[] DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS experience TEXT[] DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS software_skills TEXT[] DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS education TEXT[] DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS email TEXT;

-- Payment support columns for trainings and conferences
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS price TEXT DEFAULT 'Free';
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT 'terramatrix@upi';
ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS qr_image TEXT DEFAULT '';

ALTER TABLE public.conferences ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.conferences ADD COLUMN IF NOT EXISTS price TEXT DEFAULT 'Free';
ALTER TABLE public.conferences ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT 'terramatrix@upi';
ALTER TABLE public.conferences ADD COLUMN IF NOT EXISTS qr_image TEXT DEFAULT '';

-- 6. CREATE 'registrations' TABLE (Inquiries, Training Registrations, Corporate Batches, Conference Submissions)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'public_training', -- 'corporate_training' | 'public_training' | 'module_request' | 'conference' | 'consultation' | 'support_ticket' | 'newsletter'
    target_item_title TEXT,                       -- e.g. 'Advanced GIS & Remote Sensing'
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    organization TEXT,                           -- College / University / Enterprise / Dept
    designation TEXT,                            -- Faculty / Student / Senior Engineer / Lead
    batch_size TEXT,                             -- e.g. '30-50 Attendees'
    preferred_mode TEXT DEFAULT 'Online',        -- 'Online' | 'In-Person' | 'Hybrid'
    preferred_date TEXT,
    message TEXT,
    transaction_id TEXT,                         -- UTR / Transaction ID entered by user if paid
    is_verified BOOLEAN DEFAULT false,           -- Approved / Verified by admin (Tick mark)
    payment_status TEXT DEFAULT 'free',          -- 'free' | 'pending_verification' | 'verified' | 'rejected'
    price_paid TEXT,
    calendar_synced BOOLEAN DEFAULT false,
    google_sheet_synced BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'new',          -- 'new' | 'contacted' | 'proposal_sent' | 'enrolled' | 'closed'
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure existing registrations table has new transaction and verification columns
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS price_paid TEXT;

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES FOR REGISTRATIONS
DROP POLICY IF EXISTS "Public Insert Registrations" ON public.registrations;
CREATE POLICY "Public Insert Registrations" ON public.registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Registrations" ON public.registrations;
CREATE POLICY "Admin Full Access Registrations" ON public.registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. RLS POLICIES FOR PUBLIC READ ACCESS
DROP POLICY IF EXISTS "Public Read Trainings" ON public.trainings;
CREATE POLICY "Public Read Trainings" ON public.trainings FOR SELECT USING (true);


DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Conferences" ON public.conferences;
CREATE POLICY "Public Read Conferences" ON public.conferences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Teams" ON public.teams;
CREATE POLICY "Public Read Teams" ON public.teams FOR SELECT USING (true);

-- 8. RLS POLICIES FOR AUTHENTICATED ADMIN FULL ACCESS (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admin Insert Trainings" ON public.trainings;
CREATE POLICY "Admin Insert Trainings" ON public.trainings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Update Trainings" ON public.trainings;
CREATE POLICY "Admin Update Trainings" ON public.trainings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Delete Trainings" ON public.trainings;
CREATE POLICY "Admin Delete Trainings" ON public.trainings FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin Insert Projects" ON public.projects;
CREATE POLICY "Admin Insert Projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Update Projects" ON public.projects;
CREATE POLICY "Admin Update Projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Delete Projects" ON public.projects;
CREATE POLICY "Admin Delete Projects" ON public.projects FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin Insert Conferences" ON public.conferences;
CREATE POLICY "Admin Insert Conferences" ON public.conferences FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Update Conferences" ON public.conferences;
CREATE POLICY "Admin Update Conferences" ON public.conferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Delete Conferences" ON public.conferences;
CREATE POLICY "Admin Delete Conferences" ON public.conferences FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin Insert Teams" ON public.teams;
CREATE POLICY "Admin Insert Teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Update Teams" ON public.teams;
CREATE POLICY "Admin Update Teams" ON public.teams FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Delete Teams" ON public.teams;
CREATE POLICY "Admin Delete Teams" ON public.teams FOR DELETE TO authenticated USING (true);

-- 9. CREATE STORAGE BUCKET FOR MEDIA UPLOADS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
CREATE POLICY "Public Read Media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Upload Media" ON storage.objects;
CREATE POLICY "Admin Upload Media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Update Media" ON storage.objects;
CREATE POLICY "Admin Update Media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Delete Media" ON storage.objects;
CREATE POLICY "Admin Delete Media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');


-- 10. SEED INITIAL DATA FOR TRAININGS
DELETE FROM public.trainings;
INSERT INTO public.trainings (title, description, category, date, duration, mode, status, image, highlights, attendees, link)
VALUES

(
  'Advanced GIS & Remote Sensing for Infrastructure Planning',
  'A comprehensive, hands-on workshop covering spatial data modeling, satellite imagery analysis, raster analytics, and urban infrastructure mapping with QGIS & ArcGIS.',
  'Geospatial Intelligence',
  'Upcoming (Batch Starting Soon)',
  '4 Weeks (Weekend Sessions)',
  'Hybrid',
  'upcoming',
  '/images/about/geospatial.svg',
  ARRAY['Satellite Imagery Processing & LULC Analysis', 'Digital Elevation Models (DEM) & Topography', 'Spatial Network & Route Optimization', 'Industry-standard Certificate of Completion'],
  NULL,
  '/contact'
),
(
  'AI & Machine Learning for Hydrological & Groundwater Modeling',
  'Learn predictive machine learning techniques applied to hydrological datasets, flood inundation mapping, and groundwater level forecasting.',
  'AI & Data Science',
  'Upcoming (Registrations Open)',
  '3 Weeks (Live Interactive)',
  'Online',
  'upcoming',
  '/images/about/ai-analytics.svg',
  ARRAY['Python for Spatial Data & Hydrology', 'Time-Series Forecasting with Machine Learning', 'Groundwater Flow Simulation Integration', 'Real-World Watershed Case Studies'],
  NULL,
  '/contact'
),
(
  'Drone Photogrammetry & LiDAR Point Cloud Processing',
  'Practical training on UAV flight planning, RTK/PPK GNSS processing, orthomosaic creation, and high-density 3D LiDAR point cloud classification.',
  'Surveying & UAV',
  'Upcoming (Limited Seats)',
  '2 Weeks (Intensive)',
  'In-Person',
  'upcoming',
  '/images/about/innovation.svg',
  ARRAY['Flight Planning & Ground Control Points (GCPs)', 'Orthomosaic & Contour Generation', 'LiDAR Feature Extraction & Volumetric Analysis', 'Field Demo & Software Walkthrough'],
  NULL,
  '/contact'
),
(
  'Mastering Civil 3D for Highway & Geometric Road Design',
  'Industry-oriented training on alignment creation, profile design, corridor modeling, cross-sections, and quantity estimation following IRC guidelines.',
  'Civil Engineering',
  'Completed (November 2025)',
  '4 Weeks',
  'Online',
  'completed',
  '/images/about/civil-infra.svg',
  ARRAY['Horizontal & Vertical Alignment Design', 'Corridor Modeling & Earthwork Quantities', 'Intersection & Roundabout Layouts', 'IRC Standards & DPR Documentation'],
  '65+ Engineers & Students Trained',
  '/contact'
),
(
  'Introduction to Open-Source Geospatial Big Data with Python',
  'A fast-paced program covering GeoPandas, Rasterio, GDAL, and Google Earth Engine (GEE) for processing large-scale spatial environmental datasets.',
  'Geospatial & Coding',
  'Completed (August 2025)',
  '2 Weeks',
  'Online',
  'completed',
  '/images/about/geospatial.svg',
  ARRAY['Vector & Raster Processing in Python', 'Google Earth Engine API Workflows', 'Automated Map Generation & Web Dashboards', 'Hands-on Coding Notebooks Provided'],
  '90+ Participants Certified',
  '/contact'
),
(
  'Groundwater Exploration & Geophysical Survey Techniques',
  'Focused module on Electrical Resistivity Tomography (ERT), Vertical Electrical Sounding (VES), and geochemical assessment for water resource management.',
  'Water Resources',
  'Completed (May 2025)',
  '3 Weeks',
  'In-Person',
  'completed',
  '/images/project/Project-01.png',
  ARRAY['VES & 2D ERT Data Acquisition', 'Aquifer Delineation & Recharge Zones', 'Water Quality Testing & Contamination Mapping', 'Practical Field Case Studies'],
  '45+ Professionals Trained',
  '/contact'
);

-- 11. SEED INITIAL DATA FOR PROJECTS
DELETE FROM public.projects;
INSERT INTO public.projects (title, paragraph, image, author_name, author_image, author_designation, tags, publish_date, href)
VALUES
(
  'Integrated Geospatial & AI-Driven Groundwater Forecasting',
  'A multi-sensor predictive framework utilizing satellite radar, GRACE datasets, and machine learning models for high-resolution aquifer recharge forecasting.',
  '/images/project/Project-01.png',
  'Terra Matrix',
  '/images/favicon.png',
  'Research & Analytics Team',
  ARRAY['Groundwater', 'AI Modeling'],
  '2026',
  '/project-details/groundwater-forecast'
),
(
  'Urban Corridor Road Alignment & Geometric Optimization',
  'Comprehensive 3D alignment design, digital terrain modeling, and cut-fill optimization for an upcoming smart-city arterial expressway.',
  '/images/project/Project-02.jpg',
  'Terra Matrix',
  '/images/favicon.png',
  'Civil Infra Division',
  ARRAY['Civil Infra', 'Highways'],
  '2025',
  '/project'
),
(
  'High-Precision Drone LiDAR Topographic Survey for Mining',
  'Centimeter-level UAV photogrammetry and LiDAR point cloud terrain mapping for quarry volume calculations and safety slope stability monitoring.',
  '/images/project/Project-03.jpg',
  'Terra Matrix',
  '/images/favicon.png',
  'Geospatial Division',
  ARRAY['Drone Survey', 'LiDAR'],
  '2025',
  '/project'
);

-- 12. SEED INITIAL DATA FOR CONFERENCES
DELETE FROM public.conferences;
INSERT INTO public.conferences (title, description, venue, date, category, image, status, registration_link, highlights)
VALUES
(
  'National Symposium on AI Applications in Civil & Geospatial Infrastructure 2026',
  'A flagship conference bringing together leading academicians, industry experts, and government stakeholders to discuss emerging AI paradigms in smart infrastructure.',
  'Bhubaneswar / Hybrid',
  'November 14-15, 2026',
  'National Conference',
  '/images/about/innovation.svg',
  'upcoming',
  '/contact',
  ARRAY['Keynotes by AI & Civil Engineering Pioneers', 'Peer-Reviewed Paper Presentations', 'Industry Tech Demonstrations & Networking', 'Proceedings Published with ISBN / DOI Indexing']
),
(
  'International Workshop on Remote Sensing for Water Resource Resilience',
  'An interactive symposium on climate adaptation, hydrological modeling, and satellite data analytics for water security.',
  'Online Virtual Summit',
  'December 05, 2026',
  'International Workshop',
  '/images/about/geospatial.svg',
  'upcoming',
  '/contact',
  ARRAY['Global Case Studies from 10+ Countries', 'Hands-on Technical Demonstration', 'Policy & Governance Panel Discussions']
);

-- 13. SEED INITIAL DATA FOR TEAMS (ALL 18 COMPLETE IN-DEPTH PROFILES)
DELETE FROM public.teams;
INSERT INTO public.teams (
  name, role, designation, domain, category_group,
  image, summary, bio, expertise, experience,
  achievements, software_skills, education, contact_number, email, order_index
)
VALUES

(
  'Dr. Sovan Sankalp', 'Water Resources Engineer', 'Water Resources Engineer', 'Hydrology, GIS & AI/ML', 'Core Team',
  '/images/team/Dr. Sovan Sankalp.jpeg', 'Experienced water resources engineer, researcher, and academic specializing in hydrological analysis, groundwater systems, urban flood modelling, and geospatial intelligence, with strong integration of GIS, remote sensing, and AI/ML techniques.', 'Experienced water resources engineer, researcher, and academic specializing in hydrological analysis, groundwater systems, urban flood modelling, and geospatial intelligence, with strong integration of GIS, remote sensing, and AI/ML techniques.', ARRAY['Hydrological Analysis & Modelling', 'Groundwater Hydrology & Assessment', 'Urban Flood Analysis & Risk Mapping', 'Remote Sensing & GIS Applications', 'AI/ML-based Time Series Forecasting', 'Spatial & Temporal Drought Monitoring', 'Urban Climate & Impervious Surface Analysis'], ARRAY['10+ years of research, teaching, and project experience in Water Resources Engineering', 'Urban flood susceptibility mapping and MCDM-based risk analysis', 'Groundwater variability and hydro-climatic extreme assessment', 'Government- and policy-oriented research on climate resilience and sustainability', 'Organizer and resource person for international conferences, FDPs, GIS Day events, and workshops'],
  ARRAY['20+ SCI/Scopus/ESCI indexed journal publications', 'Published book chapters with Elsevier on AI/ML applications in hydrology and climate analysis', 'Developed deep learning–based drought, soil moisture, and groundwater forecasting frameworks', 'Reviewer for SCI & Scopus indexed journals', 'Published three patents in geospatial intelligence, agriculture ICT, and thermal regulation systems'], ARRAY['HEC-RAS', 'HEC-HMS', 'CCHE-2D', 'CES', 'ArcGIS Pro', 'ENVI', 'ERDAS IMAGINE', 'Google Earth Engine', 'Python (Jupyter Notebook)', 'R', 'MATLAB', 'SPSS', 'AutoCAD'], ARRAY['Ph.D. – Civil Engineering (Water Resources Engineering), NIT Rourkela', 'M.Tech – Civil Engineering (Water Resources Engineering), NIT Rourkela', 'B.Tech – Civil Engineering, SOA University, Odisha'], '+91-7008038833', 'sankalpsovan9@gmail.com', 1
),
(
  'Dr. Asit Kumar Dandapat', 'Research Scientist', 'Research Scientist', 'Hydrology & Civil Engineering', 'Core Team',
  '/images/team/Dr. Asit Kumar Dandapat.jpeg', 'Research Scientist with 3+ years of experience in hydrology, groundwater modelling, GIS–RS, and climate impact assessment, with strong contributions to drought and flood modelling, soil erosion analysis, and sustainable water management studies.', 'Research Scientist with 3+ years of experience in hydrology, groundwater modelling, GIS–RS, and climate impact assessment, with strong contributions to drought and flood modelling, soil erosion analysis, and sustainable water management studies.', ARRAY['Hydrology & Groundwater Modelling', 'GIS & Remote Sensing Applications', 'Drought & Flood Susceptibility Analysis', 'Soil Erosion & RUSLE Modelling', 'Climate Change Impact Assessment', 'MCDA-based Decision Support Systems'], ARRAY['Research Scientist at ICAR-IIWM, working on GIS-based hydrology, groundwater modelling, and climate-resilient agriculture studies', 'Field investigations and decision-support map generation for drought and flood assessments', 'Civil Engineer involved in site execution, quality control, and supervision of infrastructure projects', 'Assistant Professor teaching Civil Engineering subjects and guiding academic projects', 'Watershed development and natural resource management under government programmes'],
  ARRAY['10+ SCI/Scopus indexed research publications', 'GATE qualified in 2019, 2021, 2023, 2024, and 2025', 'Best Poster Award – ESRI Conference 2025', 'Best Poster Award – ICAR-IIWM Climate-Smart Agriculture 2024', 'Recognized for GIS-based climate-smart agriculture and SDG-focused modelling studies'], ARRAY['ArcGIS Pro', 'QGIS', 'Google Earth Engine', 'R Studio', 'Python', 'MODFLOW (GMS/WMS)', 'ERDAS Imagine', 'SNAP', 'OriginPro', 'MS Office'], ARRAY['Ph.D. – Civil Engineering (Water Resources), CUTM (2021–2025)', 'M.Tech – Water Resources Engineering, NIT Rourkela (87.30%)', 'B.Tech – Civil Engineering, BPUT'], '+91-8658003717', 'asit80t@gmail.com', 2
),
(
  'Dr. Arpan Pradhan', 'Water Resources Engineer', 'Water Resources Engineer', 'Fluvial Hydraulics & River Engineering', 'Core Team',
  '/images/team/Dr. Arpan Pradhan.jpeg', 'Experienced civil engineer and academic specializing in fluvial hydraulics, river engineering, and urban flood management, integrating experimental studies, numerical modelling, and geospatial analysis for sustainable water resources solutions.', 'Experienced civil engineer and academic specializing in fluvial hydraulics, river engineering, and urban flood management, integrating experimental studies, numerical modelling, and geospatial analysis for sustainable water resources solutions.', ARRAY['Fluvial & Open Channel Hydraulics', 'River Modelling & Stream Gauging', 'Urban Flooding & Drainage Analysis', 'Experimental & Numerical Hydraulics', 'Remote Sensing & GIS Applications', 'Sustainable Water Resources Engineering'], ARRAY['10+ years of research and teaching experience in Water Resources Engineering', 'PhD research on stage–discharge modelling of meandering compound channels', 'Field expertise in river hydraulics and stream gauging trained by IAHR–WMO–IAHS (France)', 'Contributor to government- and industry-oriented research on flood risk and hydraulic sustainability', 'Organizer and resource person for FDPs, conferences, and national workshops'],
  ARRAY['15+ SCI/Scopus indexed journal publications', 'Design Patent granted (2024) for Manual Washing Machine', 'Patent on disease vulnerability and combat mapping using geospatial techniques', 'Patent on sustainable bricks using iron-ore tailings and waste foundry sand', 'Active professional memberships in ASCE, IAHR, IAHS, IEI, and ISRS'], ARRAY['HEC-RAS', 'MIKE FLOOD', 'MIKE BASIN', 'ANSYS Fluent', 'OpenFOAM', 'ArcGIS', 'QGIS', 'MATLAB', 'SPSS', 'GeneXPro', 'AutoCAD', 'LaTeX'], ARRAY['Ph.D. – Civil Engineering, National Institute of Technology Rourkela', 'M.Tech – Water Resources Engineering, National Institute of Technology Rourkela', 'B.Tech – Civil Engineering, Biju Patnaik University of Technology, Odisha'], '+91-9439291900', 'arpan.pradhan@christuniversity.in', 3
),
(
  'Aloka Prasad Mishra', 'Law Professional Advisor', 'Law Professional Advisor', 'Legal Affairs, HR & Institutional Governance', 'Law Professional Advisors',
  '/images/team/Aloka Prasad Mishra.jpg', 'Qualified law professional with strong academic grounding in law and management, specializing in labor and industrial relations, institutional compliance, HR governance, and industry–academia coordination, supporting ethical decision-making and organizational effectiveness.', 'Qualified law professional with strong academic grounding in law and management, specializing in labor and industrial relations, institutional compliance, HR governance, and industry–academia coordination, supporting ethical decision-making and organizational effectiveness.', ARRAY['Labor Laws & Industrial Relations', 'Employment Compliance & Advisory', 'Legal Documentation & Case Interpretation', 'Dispute Resolution & Advisory Support', 'Institutional Governance & Compliance', 'Industry–Academia Coordination'], ARRAY['Advisory support in labor and industrial relations matters', 'Institutional compliance and governance support', 'Training, mentoring, and academic administration roles', 'Stakeholder coordination between academia and industry', 'Legal documentation, regulatory reporting, and policy support'],
  ARRAY['Recognized for ethical decision-making and governance-oriented advisory', 'Active contributor to institutional compliance and HR policy frameworks', 'Mentoring-driven leadership in academic and administrative environments'], ARRAY['MS Office', 'Documentation & Compliance Systems', 'HR Information Systems (HRIS)', 'Legal Research & Case Management Tools'], ARRAY['Bachelor of Laws (LLB) – Labor & Industrial Relations, Madhusudan Law University', 'MBA – HR & Finance'], NULL, NULL, 4
),
(
  'Chiranjeeb Kumar Sahoo', 'Full-Stack Software Engineer', 'Full-Stack Software Engineer', 'IoT Systems, Data & Business Analytics', 'Core Team',
  '/images/team/Chiranjeeb Kumar Sahoo.jpeg', 'Product-driven full-stack software engineer with hands-on experience in MERN stack development, IoT system integration, and data-driven analytics. Proven ability to design and deliver scalable, real-world solutions through freelance projects, industry internships, and leadership roles within the Google Developer Groups ecosystem, combining strong engineering execution with analytical and business-oriented thinking.', 'Product-driven full-stack software engineer with hands-on experience in MERN stack development, IoT system integration, and data-driven analytics. Proven ability to design and deliver scalable, real-world solutions through freelance projects, industry internships, and leadership roles within the Google Developer Groups ecosystem, combining strong engineering execution with analytical and business-oriented thinking.', ARRAY['Full-Stack Web Development (MERN Stack)', 'Mobile Application Development (React Native)', 'IoT Systems & Device-to-Cloud Integration', 'RESTful API Design & Backend Services', 'Data Analytics & Visualization', 'Business & KPI Analytics', 'Database Design & Optimization', 'Scalable System Architecture', 'Technical Leadership & Mentorship'], ARRAY['1.5+ years of professional experience as a Freelance Full-Stack Software Developer', 'Designed and delivered end-to-end web and mobile applications using MERN stack and React Native', '6+ months of industry internship experience contributing to live production systems', 'Hands-on exposure to software development lifecycles, debugging, and collaborative engineering workflows', 'GDG Sub-Lead (2024) and GDG Lead (2025), leading developer communities and technical initiatives'],
  ARRAY['Winner of 5+ national-level hackathons', 'Recognized for innovation, rapid prototyping, and problem-solving capabilities', 'Leadership roles as Google Developer Groups (GDG) Sub-Lead (2024) and Lead (2025)', 'Successful delivery of multiple freelance and real-world software projects'], ARRAY['JavaScript', 'Python', 'React', 'React Native', 'Node.js', 'Express.js', 'MongoDB', 'FastAPI', 'REST APIs', 'Git', 'GitHub', 'Pandas (Exposure)', 'NumPy (Exposure)', 'Data Visualization Tools', 'Cloud & CI/CD Tools (Exposure)'], ARRAY['B.Tech – Computer Science & Engineering, Gandhi Institute for Education and Technology (GIET), Bhubaneswar (2023–2027)'], '+91-6371850005', 'chiranjeeb.dev@gmail.com', 5
),
(
  'Er. A Ramakrushna Sarab', 'Agricultural Engineer', 'Agricultural Engineer', 'Remote Sensing, GIS & Agricultural Systems', 'Remote Sensing Experts',
  '/images/team/Er. A RAMAKRUSHNA SARAB.jpeg', 'Agricultural engineer with interdisciplinary expertise in Remote Sensing and GIS applied to agricultural and water resource systems. Actively involved in geospatial analysis for crop monitoring, watershed management, and climate variability studies, with strong capability in integrating satellite-derived data with field observations to support precision agriculture, sustainable resource planning, and evidence-based agricultural management.', 'Agricultural engineer with interdisciplinary expertise in Remote Sensing and GIS applied to agricultural and water resource systems. Actively involved in geospatial analysis for crop monitoring, watershed management, and climate variability studies, with strong capability in integrating satellite-derived data with field observations to support precision agriculture, sustainable resource planning, and evidence-based agricultural management.', ARRAY['Hydrological Trend Analysis & Modelling', 'Sustainable Water & Agricultural Management', 'Geospatial Technology (Remote Sensing & GIS)', 'Watershed Management', 'Evaluation of Soil & Water Conservation Structures', 'Natural Resource Management', 'Precision Agriculture Applications'], ARRAY['GIS expert for REWARD–Hydrology Project funded by DSC-WD and the World Bank', 'Technical contributor in evaluation of a major irrigation project funded by CWC Consultancy', 'Hands-on experience in geospatial analysis for land and water resource management'],
  ARRAY['Applied geospatial technologies to large-scale hydrology and irrigation projects', 'Contributed to data-driven decision-making for sustainable water resource planning', 'Field-integrated GIS analysis supporting agricultural and environmental studies'], ARRAY['QGIS (Quantum GIS)', 'ArcMap', 'ArcGIS Pro', 'Google Earth Pro', 'C Programming', 'AutoCAD', 'R Studio', 'MODFLOW-NWT', 'ModelMuse'], ARRAY['B.Tech – Agricultural Engineering, College of Agricultural Engineering & Technology (CAET), OUAT, Odisha'], '+91-7873845858', 'aramakrushna.00@gmail.com', 6
),
(
  'Er. Neha Choudhari', 'Structural Design Engineer', 'Structural Design Engineer', 'Structural Engineering & High-Rise Design', 'Structural Design Engineers',
  '/images/team/Er. Neha Choudhari.jpeg', 'Performance-focused structural design engineer with 12+ years of experience in structural analysis, design, and detailing of high-rise structures, reinforced concrete (RC), and steel structures compliant with international and Indian standards.', 'Performance-focused structural design engineer with 12+ years of experience in structural analysis, design, and detailing of high-rise structures, reinforced concrete (RC), and steel structures compliant with international and Indian standards.', ARRAY['Structural Analysis & Design of RC & Steel Structures', 'High-Rise Building Detailing (up to 36 floors)', 'Foot over Bridge (FOB) Designing', 'Structural Retrofitting & Repair', 'Offshore Skids & Industrial Shed Modelling', 'Site Quality Coordination & Inspection'], ARRAY['Freelancer Structural Design Engineer (2019–Present) designing multiplexes, apartments, school strengthening, and industrial sheds across Maharashtra and Telangana', 'Structural Design Engineer at SR Consultant, Aurangabad (2021–2022) designing Foot over Bridges and R&D buildings', 'Assistant Professor at Vidya Jyothi Institute of Technology, Hyderabad (2018)', 'Structural Engineer at My Home Constructions Pvt. Ltd., Hyderabad (2013–2018) designing residential high-rises up to 36 floors', 'Trainee Structural Engineer at Sumatec Inc., Aurangabad (2012–2013) analyzing offshore skids and Essar proof checking'],
  ARRAY['Designed and analyzed landmark residential high-rises including My Home Bhooja (36 floors), My Home Avatar (30 floors), and My Home Krishe (25 floors)', 'Assisted in the structural design elements of the Statue of Equality project in Shamshabad, Hyderabad', 'Completed research publication on Shear in Flexural Members under IS 456-2000 and ACI 318-08 at SV University', 'Chartered Engineer (India) and Member of the Institution of Engineers (MIE)'], ARRAY['ETABS', 'STAAD Pro', 'SAFE', 'AutoCAD', 'SAP2000', 'MATLAB', 'MS Office'], ARRAY['M.E. – Structural Engineering, Government College of Engineering, Aurangabad', 'B.E. – Civil Engineering, Marathwada Institute of Technology (MIT), Aurangabad'], '+91-9985044056', 'nehaac22@gmail.com', 7
),
(
  'Siddhant Mishra', 'Applied AI & Machine Learning Engineer', 'Applied AI & Machine Learning Engineer', 'Machine Learning, Data Engineering & Decision Support Systems', 'Core Team',
  '/images/team/Er. Siddhant Mishra.jpeg', 'Applied Machine Learning professional with hands-on experience in building, training, and integrating data-driven models into real-world research and enterprise systems. Strong background in machine learning, statistical analysis, and data engineering, with practical exposure to ensemble methods, deep learning architectures, and end-to-end ML pipelines for decision support, fraud detection, and language- and vision-based applications.', 'Applied Machine Learning professional with hands-on experience in building, training, and integrating data-driven models into real-world research and enterprise systems. Strong background in machine learning, statistical analysis, and data engineering, with practical exposure to ensemble methods, deep learning architectures, and end-to-end ML pipelines for decision support, fraud detection, and language- and vision-based applications.', ARRAY['Applied Machine Learning & Statistical Modelling', 'End-to-End ML Pipelines & Model Deployment', 'Decision Support Systems', 'Fraud Detection & Risk Analytics', 'Data Engineering & ETL Frameworks', 'Ensemble Learning (XGBoost, LightGBM, CatBoost)', 'Deep Learning (CNNs, Autoencoders)', 'Language & Vision-Based AI Systems'], ARRAY['Project Associate at AHRC, IIT Bhubaneswar contributing to irrigation decision support systems using data-driven modelling', 'Developed and trained machine learning models for agricultural and water resource planning applications', 'Worked on Odia Handwritten Text Recognition (HTR) pipelines including dataset preparation and model experimentation', 'Designed and maintained research frameworks integrating FastAPI (Python) and Next.js', 'Analyst / Data Engineer at Accenture designing cloud-based data warehousing solutions using Azure Databricks and Snowflake', 'Built metadata-driven ETL frameworks and implemented fraud detection models for insurance analytics', 'Associate Software Engineer / Data Analyst at MITS focusing on predictive analytics, SQL-based data modelling, and dashboards'],
  ARRAY['Pinnacle Award recipient at Accenture for performance excellence', 'Microsoft Certified – Azure Data Fundamentals (DP-900)', 'Developed production-ready fraud detection and decision support systems', 'Contributed to multiple research projects involving optimization algorithms and intelligent systems'], ARRAY['Python', 'PySpark', 'Pandas', 'NumPy', 'SQL', 'Azure', 'Snowflake', 'FastAPI', 'Next.js', 'Git', 'Azure DevOps'], ARRAY['B.Tech – Odisha University of Technology and Research (Formerly CET), CGPA: 9.21', 'Post Graduate Diploma – Applied Statistics'], '+91-8058067473', 'siddhant mishra23@outlook.com', 8
),
(
  'Sarita Kumari Pattanaik', 'Business Intelligence & Analytics Advisor', 'Business Intelligence & Analytics Advisor', 'Business Intelligence, Data Analytics & Reporting', 'IT Advisors',
  '/images/team/Er. Sarita Kumari Pattanaik.jpeg', 'Experienced IT professional with 13+ years of experience working with leading MNCs, delivering data-driven solutions across retail, manufacturing, and finance domains. Proven expertise in BI analytics, reporting, and data visualization, supporting business decision-making through scalable analytics solutions. Hands-on experience working with global clients and cross-functional teams across international markets.', 'Experienced IT professional with 13+ years of experience working with leading MNCs, delivering data-driven solutions across retail, manufacturing, and finance domains. Proven expertise in BI analytics, reporting, and data visualization, supporting business decision-making through scalable analytics solutions. Hands-on experience working with global clients and cross-functional teams across international markets.', ARRAY['Business Intelligence & Analytics Solutions', 'Data Reporting & Dashboard Development', 'Retail, Manufacturing & Finance Analytics', 'Enterprise Data Analysis & Insights Generation', 'Client Delivery & Stakeholder Collaboration', 'Data Visualization & BI Tools', 'Cross-functional Team Collaboration'], ARRAY['13+ years of IT experience with leading MNCs', 'Delivered analytics solutions for retail customers across Singapore and the USA', 'Worked with global clients across international markets', 'Developed and maintained BI reporting solutions for retail, manufacturing, and finance domains', 'Collaborated with cross-functional teams to support business decision-making'],
  ARRAY['Microsoft Certified Power BI Professional', 'Successfully delivered analytics solutions for retail customers across Singapore and the USA', '13+ years of consistent delivery in data-driven solutions'], ARRAY['Power BI', 'MySQL', 'Oracle Database', 'Strategy One', 'BI Reporting Tools'], ARRAY['Engineering Graduate (Er. prefix)'], NULL, NULL, 9
),
(
  'Aurosish Mohanty', 'Structural Design Engineer', 'Structural Design Engineer', 'Structural Engineering, Design & Construction', 'Structural Design Engineers',
  '/images/team/Er. Aurosish Mohanty.jpeg', 'Result-oriented Structural Engineer with over 4 years of professional experience in structural design, construction, and project execution across industrial, infrastructure, and building projects. Experienced in handling government and private sector projects, coordinating with multidisciplinary teams, and delivering optimized structural solutions. Proven expertise in proof checking, structural vetting, strengthening and retrofitting works, and handling both domestic and international clients.', 'Result-oriented Structural Engineer with over 4 years of professional experience in structural design, construction, and project execution across industrial, infrastructure, and building projects. Experienced in handling government and private sector projects, coordinating with multidisciplinary teams, and delivering optimized structural solutions. Proven expertise in proof checking, structural vetting, strengthening and retrofitting works, and handling both domestic and international clients.', ARRAY['Structural Design of RCC & Steel Structures', 'Industrial, Commercial & Infrastructure Projects', 'Structural Proof Checking & Vetting Coordination', 'Retrofitting & Strengthening of Structures', 'Water Retaining Structures (ETP, PSTP, SPS & UG Tanks)', 'Steel Shed, Truss & Industrial Structural Design', 'Client Coordination & Project Execution', 'Multidisciplinary Team Coordination'], ARRAY['4+ years of professional experience in structural design and construction', 'Structural design for industrial platforms, pipe supports, sheds, and plant structures', 'Multistoried hospital and institutional building projects', 'Design of underground tanks, drainage, and infrastructure structures', 'Bridge components including abutments, retaining walls, and protection works', 'Design and detailing of industrial and infrastructure facilities across multiple sectors', 'Handled government and private sector projects', 'Coordinated with domestic and international clients'],
  ARRAY['Successfully delivered structural solutions across industrial, infrastructure, and building projects', 'Expertise in handling complex retrofitting and strengthening projects', 'Proven track record in multidisciplinary team coordination and project execution'], ARRAY['STAAD Pro', 'ETABS', 'SAFE', 'SAP2000', 'STRAP', 'AutoCAD', 'DraftSight', 'MS Excel', 'MS PowerPoint'], ARRAY['B.Tech in Civil Engineering (Er. prefix)'], NULL, NULL, 10
),
(
  'Nikhil Patra', 'Senior AI Engineer', 'Senior AI Engineer', 'Artificial Intelligence, Data Engineering & Cloud Solutions', 'IT Advisors',
  '/images/team/Nikhil Patra.jpg', 'Senior AI Engineer at SAP with extensive experience in Document AI and Data Engineering within SAP’s AI organization. Spearheading data initiatives and leading engineering teams to build scalable data pipelines, knowledge graphs, and cloud-based machine learning solutions. Experienced in AI-driven document processing, Retrieval-Augmented Generation (RAG), data lakes, and automation using AWS and SAP BTP. Strong background in full-stack development, research, and agile project management with expertise in delivering enterprise-grade AI solutions.', 'Senior AI Engineer at SAP with extensive experience in Document AI and Data Engineering within SAP’s AI organization. Spearheading data initiatives and leading engineering teams to build scalable data pipelines, knowledge graphs, and cloud-based machine learning solutions. Experienced in AI-driven document processing, Retrieval-Augmented Generation (RAG), data lakes, and automation using AWS and SAP BTP. Strong background in full-stack development, research, and agile project management with expertise in delivering enterprise-grade AI solutions.', ARRAY['Document AI & Machine Learning Solutions', 'Data Engineering & Automated Data Pipelines', 'Knowledge Graphs & RAG Implementation', 'Cloud Platforms (AWS, SAP BTP, AI Core)', 'Full Stack Application Development', 'Agile Methodologies, Scrum & TDD', 'Project & Vendor Management', 'Semantic Web & Data-Centric Systems'], ARRAY['11+ years of experience at SAP across AI development, data engineering, and software engineering roles', 'Design and implementation of cloud-based ML document processing solutions', 'Leadership of Data Engineering team managing annotation and data acquisition projects', 'Development of knowledge graphs integrating heterogeneous data sources', 'Experience in microservices-based payroll applications on HANA Cloud Platform', 'Research experience in cyber defense, semantic data quality, and image processing', 'Enterprise application development in HCM Recruiting and Payroll systems', 'Experience working with banking, healthcare, and enterprise AI domains'],
  ARRAY['Led key AI data initiatives within SAP’s AI organization', 'Built scalable data lakes and automated high-quality training data pipelines', 'Successfully delivered AI-powered cloud solutions for enterprise applications', 'Experience as Mindfulness Ambassador and Search Inside Yourself Trainer at SAP'], ARRAY['Python', 'Java', 'JavaScript', 'C++', 'AWS', 'SAP BTP', 'AI Core', 'Metaflow', 'UI5', 'HANA Cloud Platform'], ARRAY['M.Sc. in Computer Science – University of Bonn', 'B.Tech in Computer Science and Engineering – Vellore Institute of Technology'], NULL, NULL, 11
),
(
  'Dr. Aniket Bhalkikar', 'Structural Engineering & Seismic Safety Specialist', 'Structural Engineering & Seismic Safety Specialist', 'Structural Engineering, Seismic Risk & Safety Assessment', 'Structural Design Engineers',
  '/images/team/Aniket Bhalkikar.jpg', 'Doctoral researcher and academic specializing in computer-aided structural design, rapid visual survey (RVS) methods, seismic safety assessment, and structural health monitoring (SHM) using experimental and machine learning tools.', 'Doctoral researcher and academic specializing in computer-aided structural design, rapid visual survey (RVS) methods, seismic safety assessment, and structural health monitoring (SHM) using experimental and machine learning tools.', ARRAY['Seismic Safety Assessment & Retrofitting', 'Rapid Visual Survey (RVS) Methods', 'Structural Health Monitoring (SHM)', 'Earthquake Disaster Risk Indexing (EDRI)', 'Soil-Structure Interaction Analysis', 'Application of AI & ML in Structural Engineering'], ARRAY['Assistant Professor in Civil Engineering and Architecture at CHRIST University, Bengaluru (2022–Present)', 'Research Assistant / Doctoral Researcher at EERC, IIIT Hyderabad (2014–2021) contributing to NDMA risk indexing projects', 'Consultancy lead for South-Western Railway ROB health monitoring and structural retention projects', 'Trainee Engineer at HCC Ltd. on underground cavern construction (2010)'],
  ARRAY['Developed NDMA''s Earthquake Disaster Risk Indexing (EDRI) for 50 towns and 1 district', 'Co-authored national primer on Rapid Visual Screening (RVS) for earthquake safety in India', '7+ peer-reviewed journal publications (Elsevier, Springer, Lecture Notes in Civil Engineering)', '8+ international conference publications (WCEE Chile/Japan/Italy, SEC, ICCMS)', 'Ph.D. in Civil Engineering from IIIT Hyderabad (2022)'], ARRAY['SAP2000', 'ETABS', 'AutoCAD', 'QGIS', 'MATLAB', 'Python', 'Excel VBA & APIs'], ARRAY['Ph.D. – Civil Engineering, IIIT Hyderabad (2014–2022, CGPA: 8.25)', 'M.Tech – Computer Aided Structural Engineering, IIIT Hyderabad (2012–2014, CGPA: 8.11)', 'B.E. – Civil Engineering, Marathwada Institute of Technology (2007–2011, 66.53%)'], '+91-9985004656', 'aniketnnb@gmail.com', 12
),
(
  'Er. Abhishek Samanta', 'Civil Engineering & Infrastructure Solutions Contractor', 'Civil Engineering & Infrastructure Solutions Contractor', 'Civil Construction & Infrastructure Projects', 'Civil Engineering Consultants',
  '/images/team/Abhishek Samanta.jpg', 'Registered ''A'' Class PWD Civil Engineer Contractor with a proven track record of delivering structurally sound government infrastructure, road works, bridge canals, and major RCC structures across Odisha.', 'Registered ''A'' Class PWD Civil Engineer Contractor with a proven track record of delivering structurally sound government infrastructure, road works, bridge canals, and major RCC structures across Odisha.', ARRAY['RCC Building & Commercial Construction', 'Road Construction (RCC / WMM / GSB)', 'Bridges & Canal Structural Works', 'Minor Irrigation Infrastructure', 'Government PWD Compliance & Operations', 'Civil Site Supervision & Labor Management'], ARRAY['Proprietor and ''A'' Class PWD Contractor managing and executing civic infrastructure projects across Odisha', 'Contractor lead for minor irrigation structures, bridges, roads, and government residential complex construction', 'Industrial contractor for RCC roads (Suguna Foods) and commercial campus works (MIT College)'],
  ARRAY['Successfully executed major Gunduraposi MIP Embankment Road for the Department of Water Resources, Odisha', 'Constructed Drugs Inspector Office & Residence complex for PWD Dhenkanal Division', 'Completed the 60-bed capacity Attendant Rest Shed at District Headquarters Hospital, Dhenkanal (2025)', 'Constructed major bridge at RD 142/575 km on Gandia Branch Canal'], ARRAY['AutoCAD', 'Project Estimation & Costing', 'Site Management Tools', 'Office Productivity Tools'], ARRAY['Graduate in Civil Engineering (Er. prefix)'], '+91-9439730802', 'abhisheksam91@gmail.com', 13
),
(
  'Er. Sumit Pattanayak', 'Associated Contractor – Civil & Infrastructure', 'Associated Contractor – Civil & Infrastructure', 'Civil Engineering & PWD Infrastructure Projects', 'Civil Engineering Consultants',
  '/images/team/Sumit Pattanayak.jpg', 'Highly experienced Civil Engineer and Class ‘A’ Registered Government Contractor specializing in large-scale institutional, healthcare, residential, commercial, and structural infrastructure projects with over a decade of hands-on technical execution, cost control, and project administration.', 'Highly experienced Civil Engineer and Class ‘A’ Registered Government Contractor specializing in large-scale institutional, healthcare, residential, commercial, and structural infrastructure projects with over a decade of hands-on technical execution, cost control, and project administration.', ARRAY['RCC Framed Structure Execution', 'Structural Detailing & Site Supervision', 'Government Tender Works (PWD / EPC Mode)', 'BOQ Preparation & Rate Analysis', 'Healthcare & Hospital Infrastructure', 'Educational & Institutional Buildings'], ARRAY['Associated Class ‘A’ Civil Contractor executing high-value public and private sector projects across Odisha', 'Construction lead for 600-bed hospital project (Sason) and multiple 200-bed hospital blocks (Barbil, Angul)', 'Commercial structure manager for G+3 IT building (Infocity) and Gram Vikas office complex'],
  ARRAY['Successfully registered as Class ‘A’ Civil Contractor with Engineer-in-Chief (Civil), Odisha', 'Executed G+4, 600-Bed Hospital complex for Samaleswari Educational Trust, Sason, Sambalpur', 'Constructed G+12 Residential Apartment project in Chandrasekharpur, Bhubaneswar', 'Managed structural infrastructure for Sri Sri University academic blocks, Cuttack'], ARRAY['AutoCAD', 'Project Cost Estimation & BOQ', 'Site Execution Management', 'Project Scheduling Tools'], ARRAY['Graduate in Civil Engineering (Er. prefix)'], NULL, NULL, 14
),
(
  'Dr. Ketan Kumar Nandi', 'Fluvial Hydrodynamics & River Modeler Consultant', 'Fluvial Hydrodynamics & River Modeler Consultant', 'Water Resources, River Hydrodynamics & GIS', 'Remote Sensing Experts',
  '/images/team/Ketan Kumar Nandi.jpg', 'Research scientist and academic with extensive experience in river hydrodynamics, river corridor management, underwater robotics application in water resources engineering, and advanced remote sensing cloud computing analyses (Google Earth Engine) for river basin management.', 'Research scientist and academic with extensive experience in river hydrodynamics, river corridor management, underwater robotics application in water resources engineering, and advanced remote sensing cloud computing analyses (Google Earth Engine) for river basin management.', ARRAY['River Hydrodynamics & Corridor Management', 'Fluvial Modeling (HEC-RAS, FLOW-3D, ANSYS)', 'Remote Sensing & GIS (ArcGIS, QGIS, Google Earth Engine)', 'Braided River Morphological Assessment', 'Real-Time Dam Safety Monitoring Systems', 'Underwater Robotics in Water Engineering'], ARRAY['Assistant Professor in Civil Engineering at SR University, Warangal (2025–Present)', 'Post-Doctoral Fellow in Underwater Exploration Technologies at IIT Guwahati (2023–2025)', 'Co-Principal Investigator in a ₹90 lakh dam safety monitoring project funded by TIH-IIT Guwahati', 'River Modeler for cascading river interventions (NMHS) and Manas-Sankosh-Teesta-Ganga river linking project (NWDA)'],
  ARRAY['Awarded Best Presentation Award (HYDRO2020) by Indian Society of Hydraulics', 'Published 9+ peer-reviewed journal papers (Journal of Hydrology, Advances in Water Resources, Ecohydrology)', 'Participated in Jal Shakti Ministry''s Brahmaputra Amantran Abhiyan national river expedition', 'Completed Ph.D. in Civil Engineering (Water Resources) from IIT Guwahati (2023)'], ARRAY['FLOW-3D', 'ANSYS', 'HEC-RAS', 'MATLAB', 'C++', 'ArcGIS', 'QGIS', 'Google Earth Engine'], ARRAY['Ph.D. – Civil Engineering (Water Resources), IIT Guwahati (2018–2023)', 'M.Tech – Civil Engineering (Water Resources), VSSUT Burla (2013–2015)', 'B.Tech – Civil Engineering, Orissa Engineering College (2008–2012)'], '+91-8763077733', 'ketannandi@gmail.com', 15
),
(
  'Dr. Anindita Nath', 'Remote Sensing & Geospatial Analyst Consultant', 'Remote Sensing & Geospatial Analyst Consultant', 'Remote Sensing, GIS & Coastal Hazards', 'Remote Sensing Experts',
  '/images/team/Anindita Nath.jpg', 'Doctoral researcher and academic with over 8 years of research and teaching experience in Geo-Environmental Hazards (landslides, coastal erosion), climate change, and AI-enabled geospatial techniques.', 'Doctoral researcher and academic with over 8 years of research and teaching experience in Geo-Environmental Hazards (landslides, coastal erosion), climate change, and AI-enabled geospatial techniques.', ARRAY['Coastal Hazards & Shoreline Shifting (DSAS)', 'Remote Sensing & GIS (ArcGIS, QGIS, GEE)', 'Geo-AI & Land-Use Monitoring/Modeling', 'Integrated Coastal Zone Management (ICZM)', 'Environmental Vulnerability & Risk Mapping'], ARRAY['Former Researcher at Jadavpur University, Kolkata, specializing in coastal erosion and threats', 'PhD Co-Supervisor collaborating with the University of Petroleum & Energy Studies (UPES), Dehradun', 'Teaching Faculty in the Department of Geography at Bankim Sardar College, West Bengal (6+ years)'],
  ARRAY['Published 15+ peer-reviewed articles and 9 book chapters (Elsevier, Springer, Taylor & Francis)', 'Editor of Springer book ''Assessment of Geo-Environmental hazards using AI enabled Geospatial Techniques''', 'Active reviewer for reputed journals (Natural Hazards Research, GeoJournal, Spatial Information Research)', 'Ph.D. in Science (Faculty of Interdisciplinary Studies, Law and Management), Jadavpur University'], ARRAY['ArcGIS', 'QGIS', 'ERDAS IMAGINE', 'DSAS (Digital Shoreline Analysis System)', 'Google Earth'], ARRAY['Ph.D. – Science, Jadavpur University (2016–2021)', 'P.G. Diploma – Applied Remote Sensing & GIS, Jadavpur University (2013–2015)', 'M.Sc. – Geography & Environment Management, Vidyasagar University (2010–2012)', 'B.Sc. – Geography (Honours), University of Calcutta (2007–2010)'], '+91-8013623429', 'aninditan286@gmail.com', 16
),
(
  'Dr. M. Uma Maheswar Rao', 'GIS Analyst, SCRUM Master & Water Resources Specialist', 'GIS Analyst, SCRUM Master & Water Resources Specialist', 'GIS, Remote Sensing & Digital Twin Technology', 'Remote Sensing Experts',
  '/images/team/M Uma Maheswar Rao.jpg', 'Doctoral researcher, academic, and Certified ScrumMaster (CSM) specializing in integrating GIS and Remote Sensing for environmental, urban, and hydrology engineering. Experienced in managing digital twins (Hyderabad 3D twin project) and academic engineering instruction.', 'Doctoral researcher, academic, and Certified ScrumMaster (CSM) specializing in integrating GIS and Remote Sensing for environmental, urban, and hydrology engineering. Experienced in managing digital twins (Hyderabad 3D twin project) and academic engineering instruction.', ARRAY['GIS Analysis & Spatial Modeling (ArcGIS)', 'Remote Sensing & Hydrology Engineering', '3D Digital Twin Modeling & Smart Cities', 'Urban & Environmental Planning', 'Agile Coordination & Scrum Framework'], ARRAY['GIS Analyst & SCRUM Master at IIT Hyderabad, working on the HMDA 3D Digital Twin project (2025–Present)', 'Guest Faculty at NIT Hamirpur and PMEC Berhampur teaching civil engineering and GIS (2024–2025)', 'Technical Consultant for GIZ GmbH supporting environmental and infrastructure projects (2022–2023)', 'Researcher in Hydrology and Water Resources at NIT Rourkela (2019–2023)'],
  ARRAY['Earned Ph.D. in Hydrology and Water Resources Engineering from NIT Rourkela (2024)', 'Certified ScrumMaster (CSM) for managing multidisciplinary technology and spatial teams', 'Deployed spatial data models for the Hyderabad 3D Digital Twin project'], ARRAY['ArcGIS Desktop', 'AutoCAD', 'Microsoft Office', 'Scrum/Agile Frameworks'], ARRAY['Ph.D. – Hydrology and Water Resources Engineering, NIT Rourkela (2019–2024)', 'M.Tech – Water Resources Engineering, VSSUT Burla (2015–2017)', 'B.Tech – Civil Engineering, Centurion University (2011–2015)'], NULL, NULL, 17
),
(
  'Sobhan Jachuck', 'Director of Engineering', 'Director of Engineering', 'Engineering Leadership, Tech Architecture & Distributed Systems', 'IT Advisors',
  '/images/team/Sobhan Jachuck.jpg', 'Strategic and results-driven Engineering Leader with 14 years of experience in building distributed systems and 6 years of leading high-performance engineering teams. Proven track record of scaling systems 10x, reducing annual infrastructure costs by $500K, and driving large-scale GenAI/RAG automation.', 'Strategic and results-driven Engineering Leader with 14 years of experience in building distributed systems and 6 years of leading high-performance engineering teams. Proven track record of scaling systems 10x, reducing annual infrastructure costs by $500K, and driving large-scale GenAI/RAG automation.', ARRAY['Distributed Systems & Cloud-Native Architecture', 'Engineering Leadership & Mentoring', 'Cloud Cost Optimization & Management', 'GenAI, RAG & MCP Integration', 'Agile Methodologies & SOC2 Compliance', 'Third-Party Interoperability & Integration'], ARRAY['Director of Engineering at Elevate K12 (2023–Present): Scaled org 3x, led 30 engineers across 4 teams, boosted classroom engagement by 30%, and reduced cloud costs by $500K/year.', 'Engineering Manager at Zepto (2022–2023): Led 11 engineers on core customer experience, driving a 15% increase in AOV through catalog and campaign features.', 'Co-Founder at RALLIB (2021–2022): Co-founded digital publishing platform, launched MVP on Android, and established partnerships with regional publishers.', 'Engineering Manager at Myntra (2019–2021): Led 12 engineers, built crawl platform scraping 5M pages/day, and cut operational costs by 20%.', 'Senior Software Engineer at Treebo Hotels (2017–2019): Built B2B products from scratch, improving sales by 15% and optimizing API latency by 30%.', 'Senior Software Engineer at TiVo (2013–2017): Contributed as an individual contributor to multiple data scraping, analysis, and knowledge graph projects.', 'Software Engineer at Hewlett Packard Global Soft (2011–2013): Worked on conversion of legacy COBOL applications to XML-based web services.'],
  ARRAY['Achieved $500K (25%) annual cloud infrastructure savings at Elevate K12', 'Scaled crawl platform at Myntra by 10X to process 5 million pages daily', 'Co-founded regional digital publishing platform RALLIB and successfully launched Android MVP', 'Automated 40% of manual operational workflows using GenAI, RAG, and MCP', 'Led end-to-end engineering strategy to achieve SOC2 compliance for enterprise expansion'], ARRAY['Python', 'Java', 'C# .Net', 'Angular', 'React', 'Flutter', 'SQL / NoSQL', 'CI/CD & IaC', 'Agentic RAG / MCP', 'AWS & Cloud Security'], ARRAY['M.Tech – Computer Science, Indian Institute of Technology Kharagpur (2009–2011)', 'B.Tech – Information Technology, Biju Patnaik University of Technology, Bhubaneswar (2004–2008)'], '+91-7795535175', 'sobhanjachuck@gmail.com', 18
);
