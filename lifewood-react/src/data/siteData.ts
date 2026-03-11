/* ================================================================
   LIFEWOOD — Site-Wide Data Constants
   ================================================================ */

export interface StatItem {
  number: string;
  label: string;
  value: number;
  suffix: string;
  format?: boolean;
}

export interface PartnerLogo {
  src: string;
  alt: string;
}

export interface ServiceCard {
  type: string;
  mediaType: 'video' | 'image';
  src: string;
  label: string;
  title: string;
  desc: string;
  gridClass: string;
}

export interface CoreCapability {
  img: string;
  badge: string;
  title: string;
  desc: string;
}

export interface CoreValue {
  letter: string;
  title: string;
  desc: string;
  icon: string;
}

export interface CarouselStep {
  title: string;
  text: string;
  img: string;
}

export interface CarouselConfig {
  steps: CarouselStep[];
}

export interface HighlightItem {
  icon: string;
  title: string;
  desc: string;
}

export interface WwoPageData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  trustText: string;
  badges: { icon: string; label: string }[];
  carouselId: string;
  sectionTitle: string;
  highlightsTitle: string;
  highlights: HighlightItem[];
  ctaQuestion: string;
  ctaSubtext: string;
}

export interface PhilRow {
  layout: 'a' | 'b';
  heading: string;
  text: string;
  img: string;
  icon: string;
}

export interface Position {
  title: string;
  location: string;
  type: string;
  dept: string;
  value: string;
}

export interface SocialLink {
  href: string;
  icon: string;
  label: string;
}

export interface OfficeMarker {
  name: string;
  lat: number;
  lng: number;
  flag: string;
  code: string; // ISO 3166-1 alpha-2
}

/* ----------------------------------------------------------------
   STATS
   ---------------------------------------------------------------- */
export const stats: StatItem[] = [
  { number: '40+',     label: 'Global Delivery Centers',            value: 40,    suffix: '+' },
  { number: '30+',     label: 'Countries Across All Continents',     value: 30,    suffix: '+' },
  { number: '50+',     label: 'Language Capabilities and Dialects', value: 50,    suffix: '+' },
  { number: '56,000+', label: 'Global Online Resources',            value: 56000, suffix: '+', format: true },
];

/* ----------------------------------------------------------------
   PARTNER LOGOS
   ---------------------------------------------------------------- */
export const partners: PartnerLogo[] = [
  { src: '/pics website/google.jpeg', alt: 'Google' },
  { src: '/pics website/apple.jpeg', alt: 'Apple' },
  { src: '/pics website/microsoft.jpeg', alt: 'Microsoft' },
  { src: '/pics website/ancestry.jpeg', alt: 'Ancestry' },
  { src: '/pics website/fam search.jpeg', alt: 'FamilySearch' },
  { src: '/pics website/byu.jpeg', alt: 'BYU' },
  { src: '/pics website/moore.jpeg', alt: 'Moore' },
];

/* ----------------------------------------------------------------
   SERVICE CARDS (Home Page)
   ---------------------------------------------------------------- */
export const serviceCards: ServiceCard[] = [
  {
    type: 'audio',
    mediaType: 'video',
    src: '/ai services vids and pics/Sound Wave Animation.mp4',
    label: 'Audio',
    title: 'Audio Data Collection',
    desc: 'High-quality speech and audio capture across 50+ languages for transcription, sentiment analysis and voice AI training.',
    gridClass: 'card-audio',
  },
  {
    type: 'text',
    mediaType: 'image',
    src: '/ai services vids and pics/text.jpg',
    label: 'Text',
    title: 'Text & NLP',
    desc: 'Multilingual text annotation, labeling and curation for NLP models, chatbots and content classification.',
    gridClass: 'card-text',
  },
  {
    type: 'image',
    mediaType: 'image',
    src: '/ai services vids and pics/image.jpg',
    label: 'Image',
    title: 'Image Annotation',
    desc: 'Precise bounding-box, segmentation and tagging for computer vision and autonomous systems.',
    gridClass: 'card-image',
  },
  {
    type: 'video',
    mediaType: 'video',
    src: '/ai services vids and pics/Rainy City Night - Royalty Free Stock Footage.mp4',
    label: 'Video',
    title: 'Video Processing',
    desc: 'Frame-level annotation, object tracking and subtitle generation for video AI applications.',
    gridClass: 'card-video',
  },
];

/* ----------------------------------------------------------------
   AI DATA SERVICES — CORE CAPABILITIES
   ---------------------------------------------------------------- */
export const coreCapabilities: CoreCapability[] = [
  {
    img: '/ai initiatives/data validation.png',
    badge: 'Core Service',
    title: 'Data Validation',
    desc: 'We create data that is consistent, accurate, and complete — preventing data loss or errors in transfer, code, or configuration.',
  },
  {
    img: '/ai initiatives/data collection.png',
    badge: 'Scalable',
    title: 'Data Collection',
    desc: 'Multi-modal data collection across text, audio, image, and video — with advanced workflows for categorization, labeling, transcription, and sentiment analysis.',
  },
  {
    img: '/ai initiatives/data acquisiton.png',
    badge: 'End-to-End',
    title: 'Data Acquisition',
    desc: 'End-to-end data acquisition solutions — capturing, processing, and managing large-scale, diverse datasets.',
  },
  {
    img: '/ai initiatives/data curation.png',
    badge: 'Precision',
    title: 'Data Curation',
    desc: 'We sift, select, and index data to ensure reliability, accessibility, and ease of classification.',
  },
];

/* ----------------------------------------------------------------
   ABOUT — CORE VALUES
   ---------------------------------------------------------------- */
export const coreValues: CoreValue[] = [
  { letter: 'D', title: 'Diversity', desc: 'We celebrate differences in belief, philosophy and ways of life. Our diversity is our greatest strength.', icon: 'fas fa-globe-americas' },
  { letter: 'C', title: 'Caring', desc: 'We care for every person deeply and equally. We build teams that uplift communities.', icon: 'fas fa-heart' },
  { letter: 'I', title: 'Innovation', desc: 'Innovation is at the heart of all we do. We continuously push the boundaries of what AI can achieve.', icon: 'fas fa-lightbulb' },
  { letter: 'I', title: 'Integrity', desc: 'We are dedicated to act ethically and sustainably in every partnership and project.', icon: 'fas fa-shield-alt' },
];

/* ----------------------------------------------------------------
   CAROUSEL DATA (What We Offer — Types A-D)
   ---------------------------------------------------------------- */
export const carouselData: Record<string, CarouselConfig> = {
  typeA: {
    steps: [
      { title: 'Objective', text: 'Scan document for preservation, extract data and structure into database.', img: '/type a pic/for objective image.png' },
      { title: 'Key Features', text: 'Features include Auto Crop, Auto De-skew, Blur Detection, Foreign Object Detection, and AI Data Extraction.', img: '/type a pic/for key features image.png' },
      { title: 'Results', text: 'Accurate and precise data through validation and quality assurance — delivering enterprise-grade accuracy at scale.', img: '/type a pic/for result image.png' },
    ],
  },
  typeB: {
    steps: [
      { title: 'Target', text: 'Capture and transcribe recordings from native speakers from 23 different countries, across various accents and dialects.', img: '/type b pic/for the objective image.png' },
      { title: 'Solutions', text: '30,000+ native speaking human resources from more than 30 countries were mobilized, with dedicated QA pipelines.', img: '/type b pic/for the solution image.png' },
      { title: 'Results', text: '5 months to complete the voice collection and annotation of 25,400 valid hours of speech data.', img: '/type b pic/for the result image.png' },
    ],
  },
  typeC: {
    steps: [
      { title: 'Target', text: 'Annotate vehicles, pedestrians, and road objects with 2D & 3D techniques for autonomous driving AI.', img: '/type c pic/for objective image.png' },
      { title: 'Solutions', text: 'Dedicated Process Engineering team for analysis and optimization, with multi-layer quality control.', img: '/type c pic/for solutions image.png' },
      { title: 'Results', text: 'Achieved 25% production in Month 1 with 95% accuracy, ramping to full capacity by Month 3.', img: '/type c pic/for result image.png' },
    ],
  },
  typeD: {
    steps: [
      { title: 'Story-Driven Content', text: 'Our motivation is to express the personality of your brand through compelling AI-generated storytelling.', img: '/type d pic and vid/Gemini_Generated_Image_35iz4e35iz4e35iz.png' },
      { title: 'Cinematic AI Production', text: 'We use advanced film, video and editing techniques powered by generative AI for stunning visual content.', img: '/type d pic and vid/Gemini_Generated_Image_9vpwfh9vpwfh9vpw.png' },
      { title: 'Global Localization', text: 'We can quickly adjust the culture and language of AI-generated content for worldwide distribution.', img: '/type d pic and vid/Gemini_Generated_Image_9w16sn9w16sn9w16 (1).png' },
    ],
  },
};

/* ----------------------------------------------------------------
   WHAT WE OFFER — PAGE CONFIGS
   ---------------------------------------------------------------- */
export const wwoPages: WwoPageData[] = [
  {
    id: 'type-a',
    title: 'Type A',
    subtitle: 'Data Servicing',
    description: 'Lifewood delivers scalable document processing, data extraction and quality assurance for enterprise AI pipelines.',
    trustText: 'We provide global Data Engineering Services to enable AI Solutions',
    badges: [
      { icon: 'fas fa-file-alt', label: 'Document Capture' },
      { icon: 'fas fa-language', label: 'Multi-Language' },
      { icon: 'fas fa-check-double', label: 'Quality Assurance' },
      { icon: 'fas fa-database', label: 'Data Extraction' },
    ],
    carouselId: 'typeA',
    sectionTitle: 'How We Deliver',
    highlightsTitle: 'Key Use Cases',
    highlights: [
      { icon: 'fas fa-archive', title: 'Document Digitization', desc: 'High-volume scanning and OCR for archival, legal, and historical records.' },
      { icon: 'fas fa-search', title: 'Data Extraction', desc: 'Structured data extraction from forms, receipts, contracts, and handwritten documents.' },
      { icon: 'fas fa-shield-alt', title: 'Quality Validation', desc: 'Multi-layer QA with automated and manual checks for enterprise-grade accuracy.' },
    ],
    ctaQuestion: 'Need scalable data servicing?',
    ctaSubtext: 'Partner with Lifewood for high-volume document processing and data extraction.',
  },
  {
    id: 'type-b',
    title: 'Type B',
    subtitle: 'Horizontal LLM Data',
    description: 'Large-scale multilingual voice and text data collection for training the next generation of language models.',
    trustText: 'AI Data Project — Audio',
    badges: [
      { icon: 'fas fa-microphone', label: 'Voice Collection' },
      { icon: 'fas fa-globe', label: '30+ Countries' },
      { icon: 'fas fa-users', label: '30,000+ Speakers' },
      { icon: 'fas fa-clock', label: '25,400+ Hours' },
    ],
    carouselId: 'typeB',
    sectionTitle: 'Our Process',
    highlightsTitle: 'Key Highlights',
    highlights: [
      { icon: 'fas fa-microphone-alt', title: 'Native Speakers', desc: 'Recordings from 30,000+ native speakers across 23+ countries and dozens of dialects.' },
      { icon: 'fas fa-cogs', title: 'Scalable Pipeline', desc: 'Automated transcription, alignment, and quality pipelines processing thousands of hours.' },
      { icon: 'fas fa-chart-line', title: 'Proven Results', desc: '25,400+ validated hours delivered in 5 months with enterprise-grade accuracy.' },
    ],
    ctaQuestion: 'Ready for large-scale LLM data?',
    ctaSubtext: 'Lifewood mobilizes global talent for multilingual voice and text datasets.',
  },
  {
    id: 'type-c',
    title: 'Type C',
    subtitle: 'Vertical LLM Data',
    description: 'Specialized annotation for autonomous driving, medical AI, and other vertical domains requiring extreme precision.',
    trustText: 'The Leading AI Company in Autonomous Vehicle Development',
    badges: [
      { icon: 'fas fa-car', label: 'Autonomous Driving' },
      { icon: 'fas fa-brain', label: 'Enterprise LLM' },
      { icon: 'fas fa-bullseye', label: '99% Accuracy' },
      { icon: 'fas fa-cubes', label: '2D/3D/4D Data' },
    ],
    carouselId: 'typeC',
    sectionTitle: 'Our Approach',
    highlightsTitle: 'Industry Applications',
    highlights: [
      { icon: 'fas fa-car-side', title: 'Autonomous Driving', desc: '2D/3D/4D annotation of vehicles, pedestrians, road signs, and lane markings.' },
      { icon: 'fas fa-heartbeat', title: 'Medical AI', desc: 'Clinical-grade annotation for radiology, pathology, and medical NLP.' },
      { icon: 'fas fa-industry', title: 'Industrial IoT', desc: 'Sensor fusion annotation for robotics, manufacturing QA, and predictive maintenance.' },
    ],
    ctaQuestion: 'Need vertical-specific AI data?',
    ctaSubtext: 'Lifewood delivers domain-expert annotation with industry-leading accuracy.',
  },
  {
    id: 'type-d',
    title: 'Type D',
    subtitle: 'AIGC',
    description: 'AI-generated content services including video production, localization, and creative storytelling at global scale.',
    trustText: 'AI Generated Content',
    badges: [
      { icon: 'fas fa-video', label: 'Video Production' },
      { icon: 'fas fa-language', label: 'Multiple Languages' },
      { icon: 'fas fa-globe-americas', label: '100+ Countries' },
      { icon: 'fas fa-robot', label: 'Generative AI' },
    ],
    carouselId: 'typeD',
    sectionTitle: 'Our Creative Process',
    highlightsTitle: 'What We Create',
    highlights: [
      { icon: 'fas fa-film', title: 'Cinematic Content', desc: 'AI-powered video production with professional-grade storytelling and visual effects.' },
      { icon: 'fas fa-globe', title: 'Global Localization', desc: 'Rapid cultural and language adaptation of content for worldwide distribution.' },
      { icon: 'fas fa-magic', title: 'Generative AI', desc: 'Leveraging cutting-edge AI for scalable, on-brand creative content.' },
    ],
    ctaQuestion: 'Ready for AI-generated content?',
    ctaSubtext: 'Lifewood creates compelling, localized AI content for global audiences.',
  },
];

/* ----------------------------------------------------------------
   PHILANTHROPY ROWS
   ---------------------------------------------------------------- */
export const philRows: PhilRow[] = [
  {
    layout: 'a',
    heading: 'Partnership',
    text: 'In partnership with our philanthropic partners, Lifewood has expanded operations in South Africa, Nigeria, Republic of the Congo, Democratic Republic of the Congo, and Madagascar — creating meaningful employment and skills development.',
    img: '/philantropy and impact/partnership pic.png',
    icon: 'fas fa-handshake',
  },
  {
    layout: 'b',
    heading: 'Application',
    text: 'This requires the application of our methods and experience for the development of people in under resourced economies. We invest in training, infrastructure, and long-term community growth.',
    img: '/philantropy and impact/application.png',
    icon: 'fas fa-cogs',
  },
  {
    layout: 'a',
    heading: 'Expanding',
    text: 'We are expanding access to training, establishing equitable wage structures and career and leadership progression for the communities we serve.',
    img: '/philantropy and impact/expanding.png',
    icon: 'fas fa-expand-arrows-alt',
  },
];

/* ----------------------------------------------------------------
   CAREERS — POSITIONS
   ---------------------------------------------------------------- */
export const positions: Position[] = [
  { title: 'Casual Video Models (Video Data Collection)', location: 'Remote (Global)', type: 'Part-time / Contract', dept: 'Data Collection', value: 'casual-video-models' },
  { title: 'Moderator & Voice Participants (Voice Data Collection)', location: 'Remote', type: 'Part-time / Contract', dept: 'Data Collection', value: 'moderator-voice' },
  { title: 'Data Annotator (iPhone User)', location: 'Remote', type: 'Full-time / Part-time', dept: 'Data Operations', value: 'data-annotator-iphone' },
  { title: 'Image Data Collector (Capturing Text-Rich Items)', location: 'Remote (Global)', type: 'Contract', dept: 'Data Collection', value: 'image-collector-text' },
  { title: 'Data Curation (Genealogy Project)', location: 'Remote', type: 'Full-time', dept: 'Data Operations', value: 'data-curation-genealogy' },
  { title: 'Voice Recording Participants (Short Sentences Recording)', location: 'Remote (Global)', type: 'Contract', dept: 'Audio Collection', value: 'voice-short-sentences' },
  { title: 'Text Data Collector (Gemini User)', location: 'Remote', type: 'Part-time / Contract', dept: 'Data Collection', value: 'text-collector-gemini' },
  { title: 'Voice Recording Participants (FaceTime Audio Recording Session)', location: 'Remote', type: 'Contract', dept: 'Audio Collection', value: 'voice-facetime' },
  { title: 'Image Data Collector (Capturing Home Dishes and Menu)', location: 'Remote (Global)', type: 'Contract', dept: 'Data Collection', value: 'image-collector-dishes' },
  { title: 'AI Video Creator/Editor', location: 'Remote / Hybrid', type: 'Full-time', dept: 'Creative / AIGC', value: 'ai-video-creator' },
  { title: 'Genealogy Project Team Leader', location: 'Remote / Hybrid', type: 'Full-time', dept: 'Operations', value: 'genealogy-team-lead' },
  { title: 'Data Scraper/Crawler (Int\'l Text)', location: 'Remote', type: 'Full-time / Contract', dept: 'Engineering', value: 'data-scraper' },
  { title: 'Social Media Content Marketing', location: 'Remote / Hybrid', type: 'Full-time', dept: 'Marketing', value: 'social-media-marketing' },
  { title: 'Admin Accounting', location: 'Hybrid', type: 'Full-time', dept: 'Finance', value: 'admin-accounting' },
  { title: 'HR/Admin Assistant', location: 'Hybrid', type: 'Full-time', dept: 'Human Resources', value: 'hr-admin-assistant' },
  { title: 'Intern (Applicable to PH Only)', location: 'Philippines Only', type: 'Internship', dept: 'All Departments', value: 'intern-ph' },
];

/* ----------------------------------------------------------------
   CAREERS — PERKS
   ---------------------------------------------------------------- */
export const perks = [
  { icon: 'fas fa-globe-americas', label: 'Remote & Global' },
  { icon: 'fas fa-clock', label: 'Flexible Hours' },
  { icon: 'fas fa-graduation-cap', label: 'Learning Budget' },
  { icon: 'fas fa-heartbeat', label: 'Health & Wellness' },
  { icon: 'fas fa-rocket', label: 'Career Growth' },
];

/* ----------------------------------------------------------------
   SOCIAL LINKS
   ---------------------------------------------------------------- */
export const socialLinks: SocialLink[] = [
  { href: 'https://www.linkedin.com/company/lifewood-data-technology-ltd.', icon: 'fab fa-linkedin', label: 'LinkedIn' },
  { href: 'https://www.facebook.com/LifewoodPH', icon: 'fab fa-facebook', label: 'Facebook' },
  { href: 'https://www.instagram.com/lifewood_official/?hl=af', icon: 'fab fa-instagram', label: 'Instagram' },
  { href: 'https://www.youtube.com/@LifewoodDataTechnology', icon: 'fab fa-youtube', label: 'Youtube' },
];

/* ----------------------------------------------------------------
   MARQUEE ITEMS
   ---------------------------------------------------------------- */
export const marqueeForward = [
  'AI Data Solutions', 'Machine Learning', 'Data Annotation', 'Global Scale',
  'Innovation', '30+ Countries', 'AIGC Services', 'Data Collection',
];

export const marqueeReverse = [
  'Computer Vision', 'NLP Solutions', 'Data Labeling', 'LLM Training',
  'Quality Assurance', '56,788 Resources',
];

/* ----------------------------------------------------------------
   OFFICE LOCATIONS (for Leaflet map)
   ---------------------------------------------------------------- */
export const officeLocations: OfficeMarker[] = [
  { name: 'United States',  lat: 39.8283,  lng: -98.5795,  flag: '🇺🇸', code: 'us' },
  { name: 'Brazil',         lat: -14.7500, lng: -51.9253,  flag: '🇧🇷', code: 'br' },
  { name: 'South Africa',   lat: -29.6100, lng: 24.8832,   flag: '🇿🇦', code: 'za' },
  { name: 'Madagascar',     lat: -19.5,    lng: 46.5,      flag: '🇲🇬', code: 'mg' },
  { name: 'Nigeria',        lat: 9.0820,   lng: 8.6753,    flag: '🇳🇬', code: 'ng' },
  { name: 'UAE',            lat: 23.4241,  lng: 53.8478,   flag: '🇦🇪', code: 'ae' },
  { name: 'Germany',        lat: 51.165,   lng: 10.451,    flag: '🇩🇪', code: 'de' },
  { name: 'United Kingdom', lat: 54.8,     lng: -3,        flag: '🇬🇧', code: 'gb' },
  { name: 'Finland',        lat: 64,       lng: 26,        flag: '🇫🇮', code: 'fi' },
  { name: 'India',          lat: 23,       lng: 78.5,      flag: '🇮🇳', code: 'in' },
  { name: 'Bangladesh',     lat: 23.685,   lng: 90.3563,   flag: '🇧🇩', code: 'bd' },
  { name: 'China',          lat: 39.8,     lng: 105,       flag: '🇨🇳', code: 'cn' },
  { name: 'Hong Kong',      lat: 22.3193,  lng: 114.1694,  flag: '🇭🇰', code: 'hk' },
  { name: 'Thailand',       lat: 15,       lng: 101,       flag: '🇹🇭', code: 'th' },
  { name: 'Vietnam',        lat: 16,       lng: 106,       flag: '🇻🇳', code: 'vn' },
  { name: 'Malaysia',       lat: 4,        lng: 102,       flag: '🇲🇾', code: 'my' },
  { name: 'Indonesia',      lat: -0.789,   lng: 113.921,   flag: '🇮🇩', code: 'id' },
  { name: 'Philippines',    lat: 10.3157,  lng: 123.8854,  flag: '🇵🇭', code: 'ph' },
  { name: 'Australia',      lat: -25.2744, lng: 133.7751,  flag: '🇦🇺', code: 'au' },
  { name: 'Japan',          lat: 36.8,     lng: 138,       flag: '🇯🇵', code: 'jp' },
];
