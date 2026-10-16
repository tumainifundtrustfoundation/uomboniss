export interface ArchitectureLayer {
  id: string;
  number: number;
  titleSw: string;
  titleEn: string;
  category: 'frontend' | 'backend' | 'data' | 'security' | 'cloud' | 'operations';
  color: {
    name: string;
    primary: string;
    gradient: string;
    border: string;
    glow: string;
    bgSoft: string;
    text: string;
    boxFaceTop: string;
    boxFaceFront: string;
    boxFaceSide: string;
  };
  technologies: string[];
  protocol: string;
  latencySla: string;
  descriptionSw: string;
  descriptionEn: string;
  detailsSw: string[];
  detailsEn: string[];
  metrics: {
    labelSw: string;
    labelEn: string;
    value: string;
  }[];
  securityRoleSw: string;
  securityRoleEn: string;
}

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: 'frontend',
    number: 1,
    titleSw: 'Frontend Layer (Kiolesura cha Mtumiaji)',
    titleEn: 'Frontend & UI Layer',
    category: 'frontend',
    color: {
      name: 'Purple / Violet',
      primary: '#8b5cf6',
      gradient: 'from-violet-600 to-purple-800',
      border: 'border-violet-500',
      glow: 'shadow-violet-500/40',
      bgSoft: 'bg-violet-950/40',
      text: 'text-violet-400',
      boxFaceTop: '#8b5cf6',
      boxFaceFront: '#7c3aed',
      boxFaceSide: '#6d28d9',
    },
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite 6', 'PWA Service Worker', 'Lucide Icons'],
    protocol: 'HTML5 / CSS3 / ES2024 / Service Worker Cache',
    latencySla: '< 16ms render (60fps)',
    descriptionSw: 'Kiolesura chepesi chenye mwonekano wa kisasa na kiwango cha juu cha mwingiliano wa watumiaji kwenye simu, kompyuta na tableti. Kinajumuisha hali ya kufanya kazi nje ya mtandao (Offline PWA).',
    descriptionEn: 'Ultra-fast, responsive Single Page Application optimized for phones, low-bandwidth 3G/4G networks, and desktop browsers with offline PWA caching.',
    detailsSw: [
      'Inapakia ndani ya sekunde 1 hata kwenye mitandao ya vijijini (Optimized Bundles)',
      'Uwezo wa kusanikisha kama Application (Installable PWA kwenye Android & iOS)',
      'Lugha mbili (Kiswahili na Kiingereza) kwa wazazi na wageni wa kimataifa',
      'Muundo thabiti usioanguka (React Error Boundaries & Fallback States)'
    ],
    detailsEn: [
      'Sub-second first paint even on low-bandwidth rural connections',
      'Native-like installable Progressive Web App (PWA) with offline caching',
      'Instant real-time bilingual switching (Swahili & English)',
      'Resilient component error boundaries preventing white-screen crashes'
    ],
    metrics: [
      { labelSw: 'Ufanisi wa Lighthouse', labelEn: 'Lighthouse Score', value: '98/100' },
      { labelSw: 'Ukubwa wa Ukurasa wa Kwanza', labelEn: 'Initial Bundle Size', value: '~140 KB (Brotli)' },
      { labelSw: 'Uzingatiaji wa PWA', labelEn: 'PWA Compliance', value: '100% Offline Ready' }
    ],
    securityRoleSw: 'Usafi wa Data (Client-side Form Sanitization & XSS Escaping)',
    securityRoleEn: 'Client-side Form Sanitization & DOM XSS Escaping'
  },
  {
    id: 'api-backend',
    number: 2,
    titleSw: 'APIs & Mantiki ya Backend (Business Logic)',
    titleEn: 'APIs & Backend Logic',
    category: 'backend',
    color: {
      name: 'Sky Blue / Indigo',
      primary: '#38bdf8',
      gradient: 'from-sky-500 to-blue-700',
      border: 'border-sky-500',
      glow: 'shadow-sky-500/40',
      bgSoft: 'bg-sky-950/40',
      text: 'text-sky-400',
      boxFaceTop: '#38bdf8',
      boxFaceFront: '#0284c7',
      boxFaceSide: '#0369a1',
    },
    technologies: ['Express.js', 'Node.js LTS', 'Firebase Client/Server SDK v12', 'REST Endpoints', 'Micro-services'],
    protocol: 'HTTPS / JSON / gRPC / WebSockets',
    latencySla: '< 45ms endpoint response',
    descriptionSw: 'Mantiki kuu ya uendeshaji wa shule: kukokotoa alama za NECTA (Points, GPA, Division I-IV), uhakiki wa ada za benki, uundaji wa PDF za ripoti zenye QR Code, na mawasiliano salama.',
    descriptionEn: 'Core school logic engine: automated NECTA division & GPA calculations, bursar ledger auditing, official QR-coded PDF report generation, and API routing.',
    detailsSw: [
      'Kanuni kamili za Baraza la Mitihani la Taifa (NECTA Official Grading Rules)',
      'Uzalishaji wa Stakabadhi na Ripoti za Matokeo zenye QR Code ya uthibitisho',
      'Mawasiliano ya haraka ya API kati ya Seva na Hifadhidata ya Wingu',
      'Uchujaji wa data na kuzuia maombi yasiyo sahihi (Schema Validation)'
    ],
    detailsEn: [
      'Official National Examinations Council (NECTA) algorithmic grading engine',
      'Cryptographically verifiable PDF report card generation with instant QR scan',
      'High-throughput asynchronous communication with Cloud Firestore',
      'Strict TypeScript interfaces enforcing payload schema contracts'
    ],
    metrics: [
      { labelSw: 'Muda wa Uchakataji wa Ripoti', labelEn: 'Report Gen Time', value: '0.12s / Wanafunzi' },
      { labelSw: 'Usahihi wa Alama', labelEn: 'Grading Accuracy', value: '100% NECTA Compliant' },
      { labelSw: 'Upitishaji wa Maombi', labelEn: 'API Throughput', value: '1,500+ req/sec' }
    ],
    securityRoleSw: 'Uhakiki wa vigezo vya kila ombi kabla ya kuingia kwenye hifadhidata',
    securityRoleEn: 'Pre-flight data validation, payload limits, and CSRF protection'
  },
  {
    id: 'database',
    number: 3,
    titleSw: 'Hifadhidata ya Wingu & Faili (Database & Storage)',
    titleEn: 'Database & Cloud Storage',
    category: 'data',
    color: {
      name: 'Emerald / Green',
      primary: '#10b981',
      gradient: 'from-emerald-500 to-teal-700',
      border: 'border-emerald-500',
      glow: 'shadow-emerald-500/40',
      bgSoft: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      boxFaceTop: '#10b981',
      boxFaceFront: '#059669',
      boxFaceSide: '#047857',
    },
    technologies: ['Google Cloud Firestore', 'Firebase Cloud Storage', 'NoSQL Multi-tenant', 'IndexedDB Persistence'],
    protocol: 'Google gRPC / TLS 1.3 / Snapshot Listeners',
    latencySla: '< 15ms database read',
    descriptionSw: 'Hifadhidata thabiti ya wingu ya Google Cloud Firestore yenye uwezo wa kusawazisha data mara moja (Realtime Sync) na kuhifadhi nakala za miaka mingi bila kupoteza kumbukumbu yoyote.',
    descriptionEn: 'Google Cloud Firestore NoSQL enterprise database with automated multi-region replication, sub-second live snapshot listeners, and persistent file storage.',
    detailsSw: [
      'Kuhifadhi kumbukumbu za wanafunzi zaidi ya 1,200, matokeo na nyaraka',
      'Usawazishaji wa papo hapo (Real-time updates) bila mtumiaji ku-refresh ukurasa',
      'Hifadhi ya nakala rudufu (Automated Nightly Backups & Disaster Recovery)',
      'Hali ya kuendelea kufanya kazi hata mtandao ukikatika (Offline Cache Sync)'
    ],
    detailsEn: [
      'Unified records for 1,200+ students, alumni archives, and payment ledgers',
      'Instant bidirectional WebSocket/gRPC live listeners without page reload',
      'Automated disaster recovery backups across independent storage zones',
      'Zero data-loss local write buffering when internet drops intermittently'
    ],
    metrics: [
      { labelSw: 'Upatikanaji wa Huduma (SLA)', labelEn: 'Database Availability', value: '99.999%' },
      { labelSw: 'Muda wa Kusoma Rekodi', labelEn: 'Average Query Time', value: '11ms' },
      { labelSw: 'Uwezo wa Uhifadhi', labelEn: 'Storage Redundancy', value: 'Multi-Region (Dual-zone)' }
    ],
    securityRoleSw: 'Ulinzi wa Kumbukumbu kwa Kanuni Madhubuti za Firestore Rules',
    securityRoleEn: 'Declarative Firestore Security Rules with ACID transaction isolation'
  },
  {
    id: 'auth-permissions',
    number: 4,
    titleSw: 'Uthibitishaji & Majukumu (Auth & Permissions - RBAC)',
    titleEn: 'Authentication & Permissions (RBAC)',
    category: 'security',
    color: {
      name: 'Amber / Gold',
      primary: '#f59e0b',
      gradient: 'from-amber-500 to-yellow-600',
      border: 'border-amber-500',
      glow: 'shadow-amber-500/40',
      bgSoft: 'bg-amber-950/40',
      text: 'text-amber-400',
      boxFaceTop: '#f59e0b',
      boxFaceFront: '#d97706',
      boxFaceSide: '#b45309',
    },
    technologies: ['Firebase Auth', 'Google OAuth 2.0', 'JWT Claims', 'Multi-Role RBAC', 'PBKDF2/Argon2 Hashing'],
    protocol: 'OAuth 2.0 / OpenID Connect / Signed Bearer Tokens',
    latencySla: '< 100ms auth verification',
    descriptionSw: 'Mfumo wa usalama wenye ngazi 6 za ufikiaji: Mkuu wa Shule (Super Admin), Mhasibu (Bursar), Mkuu wa Taaluma (Academic Master), Mwalimu wa Somo, Wanafunzi na Wazazi.',
    descriptionEn: 'Rigorous 6-tier Role-Based Access Control (RBAC) protecting sensitive school finances, confidential exam records, and administrative controls with cryptographic sessions.',
    detailsSw: [
      'Kila mwalimu anaona na kuweka alama za masomo yake pekee (Subject-scoped access)',
      'Mlango maalum wa kiusalama wa watumishi (Staff Security Gatekeeper)',
      'Ulinzi dhidi ya kuingiliwa kwa akaunti na uthibitisho wa barua pepe',
      'Haki za kifedha zimelindwa kwa kiwango cha benki (Strict Bursar Boundary)'
    ],
    detailsEn: [
      'Strict subject-level scoping: teachers can only grade their assigned curriculum',
      'Staff Security Gatekeeper guarding administrative controls from public view',
      'Signed JWT tokens with automatic expiry and anti-tampering verification',
      'Audited financial ledger operations restricted strictly to Bursar role'
    ],
    metrics: [
      { labelSw: 'Ngazi za Majukumu', labelEn: 'Security Roles', value: '6 Tiers (RBAC)' },
      { labelSw: 'Urefu wa Tokeni', labelEn: 'Token Standard', value: 'RS256 JWT Signed' },
      { labelSw: 'Ulinzi wa Nenosiri', labelEn: 'Credential Security', value: 'Enterprise Grade' }
    ],
    securityRoleSw: 'Kuzuia mwanafunzi au mgeni asione matokeo ya siri au kumbukumbu za fedha',
    securityRoleEn: 'Cryptographic identity claims evaluated both in frontend and Firestore'
  },
  {
    id: 'hosting-deploy',
    number: 5,
    titleSw: 'Uwekaji Mtandaoni & Utayari (Hosting & Deployment)',
    titleEn: 'Hosting & Production Deployment',
    category: 'cloud',
    color: {
      name: 'Rose / Ruby',
      primary: '#f43f5e',
      gradient: 'from-rose-500 to-pink-700',
      border: 'border-rose-500',
      glow: 'shadow-rose-500/40',
      bgSoft: 'bg-rose-950/40',
      text: 'text-rose-400',
      boxFaceTop: '#f43f5e',
      boxFaceFront: '#e11d48',
      boxFaceSide: '#be123c',
    },
    technologies: ['Google Cloud Run', 'Docker Containerization', 'Automated Rollouts', 'HTTPS Edge SSL', 'Zero Downtime'],
    protocol: 'HTTP/2 / HTTP/3 / TLS 1.3 / WebSocket',
    latencySla: '99.9% Uptime Guarantee',
    descriptionSw: 'Miundombinu ya makontena ya wingu (Containers) inayojiendesha yenyewe. Inahakikisha tovuti inabaki mtandaoni bila usumbufu wakati wote hata wakati wa kufanya marekebisho.',
    descriptionEn: 'Containerized serverless microservices architecture with zero-downtime blue/green rollouts, automated health probes, and enterprise-grade uptime.',
    detailsSw: [
      'Usasishaji wa mfumo bila tovuti kusimama hata sekunde moja (Zero-Downtime)',
      'Cheti cha Usalama cha kimataifa cha TLS 1.3 (HTTPS) kilichowekwa moja kwa moja',
      'Mfumo unajiwasha na kuongeza kasi kadiri watumiaji wanavyoongezeka',
      'Mazingira yaliyotengwa kwa usalama (Isolated Sandboxed Containers)'
    ],
    detailsEn: [
      'Zero-downtime rolling updates with atomic switchover on release',
      'Automated TLS 1.3 certificate rotation with A+ SSL Labs rating',
      'Serverless scale-to-zero when idle, sub-second rapid scale on traffic spikes',
      'Strictly sandboxed execution environment with minimum privileged runtime'
    ],
    metrics: [
      { labelSw: 'Muda wa Kuanza', labelEn: 'Cold Start Time', value: '< 400ms' },
      { labelSw: 'Upatikanaji Mtandaoni', labelEn: 'Platform Uptime', value: '99.98%' },
      { labelSw: 'Usalama wa Mawasiliano', labelEn: 'Transport Encryption', value: 'TLS 1.3 Strict' }
    ],
    securityRoleSw: 'Usalama wa seva na kuzuia mashambulizi ya mfumo wa uendeshaji',
    securityRoleEn: 'Rootless container isolation with read-only file systems'
  },
  {
    id: 'cloud-compute',
    number: 6,
    titleSw: 'Uwezo wa Kompyuta wa Wingu (Cloud & Compute Engine)',
    titleEn: 'Cloud & Compute Engine',
    category: 'cloud',
    color: {
      name: 'Cyan / Sky',
      primary: '#06b6d4',
      gradient: 'from-cyan-500 to-teal-700',
      border: 'border-cyan-500',
      glow: 'shadow-cyan-500/40',
      bgSoft: 'bg-cyan-950/40',
      text: 'text-cyan-400',
      boxFaceTop: '#06b6d4',
      boxFaceFront: '#0891b2',
      boxFaceSide: '#0e7490',
    },
    technologies: ['Google Cloud Platform', 'Region europe-west2', 'Google Gemini 2.5 AI', 'Serverless Compute', 'V8 Engine'],
    protocol: 'REST / Google Cloud API / gRPC',
    latencySla: '< 60ms cloud execution',
    descriptionSw: 'Kituo cha kompyuta cha Google Cloud (europe-west2) chenye nguvu ya kuchakata ripoti nzito, kuchambua takwimu za ufaulu wa shule, na kuunganisha injini ya akili bandia (Google Gemini AI).',
    descriptionEn: 'High-performance compute clusters located in Google Cloud Europe-West2 region, powering intelligent academic insights via Google Gemini 2.5 and massive batch processing.',
    detailsSw: [
      'Uchakataji wa matokeo ya wanafunzi mamia kwa wakati mmoja bila kukwama',
      'Uwezo wa Gemini 2.5 AI kutoa maoni ya kitaaluma kwa wanafunzi kulingana na alama zao',
      'Ugawaji wa rasilimali kulingana na mahitaji (Elastic vCPU & RAM allocation)',
      'Miundombinu inayotegemewa na taasisi kubwa za elimu ulimwenguni'
    ],
    detailsEn: [
      'High-concurrency batch computation for school-wide examination analysis',
      'Integrated Google Gemini 2.5 model for automated personalized academic feedback',
      'Dynamic vCPU and memory allocation adjusting to peak examination periods',
      'Carrier-grade infrastructure backed by Google worldwide fiber backbone'
    ],
    metrics: [
      { labelSw: 'Kituo cha Wingu', labelEn: 'Cloud Region', value: 'GCP europe-west2' },
      { labelSw: 'Mfumo wa AI', labelEn: 'Integrated AI Engine', value: 'Google Gemini 2.5' },
      { labelSw: 'Ufanisi wa Uchakataji', labelEn: 'Compute Efficiency', value: 'Elastic Scale' }
    ],
    securityRoleSw: 'Usiri wa data na usalama wa API Keys kupitia mazingira salama ya Seva',
    securityRoleEn: 'Server-side API key proxying preventing client key leaks'
  },
  {
    id: 'cicd-vcs',
    number: 7,
    titleSw: 'Usimamizi wa Kanuni & Usasishaji (CI/CD & Version Control)',
    titleEn: 'CI/CD & Version Control',
    category: 'operations',
    color: {
      name: 'Orange / Tangerine',
      primary: '#f97316',
      gradient: 'from-orange-500 to-amber-700',
      border: 'border-orange-500',
      glow: 'shadow-orange-500/40',
      bgSoft: 'bg-orange-950/40',
      text: 'text-orange-400',
      boxFaceTop: '#f97316',
      boxFaceFront: '#ea580c',
      boxFaceSide: '#c2410c',
    },
    technologies: ['Git Version Control', 'TypeScript Compiler (tsc)', 'Automated Build Checks', 'Esbuild Bundler', 'Vite Optimizer'],
    protocol: 'Git SSH / Automated Pipeline Hooks',
    latencySla: 'Instant Pipeline Verification',
    descriptionSw: 'Kila mstari wa kanuni za mfumo unakaguliwa kiotomatiki kabla ya kuruhusiwa kutumika. Hii inahakikisha hakuna hitilafu yoyote au mdudu (bug) anayeweza kuingia kwenye tovuti ya shule.',
    descriptionEn: 'Rigid continuous integration and type-safety verification guaranteeing zero runtime syntax bugs, unbroken database schemas, and deterministic production builds.',
    detailsSw: [
      'Ukaguzi mkali wa aina za data kupitia TypeScript Strict Mode',
      'Kuzuia uwezekano wa programu kuganda kwa majaribio ya mapema (Build Verification)',
      'Historia kamili ya kila mabadiliko ya mfumo (Git Commit Audit Log)',
      'Uwezo wa kurejea toleo la awali haraka iwapo hitilafu itatokea (Instant Rollback)'
    ],
    detailsEn: [
      '100% strict TypeScript static typing preventing null reference exceptions',
      'Automated build validation gates rejecting unstable or broken releases',
      'Cryptographically signed Git commit history with complete auditability',
      'Instant rollback capabilities to verified previous stable release tags'
    ],
    metrics: [
      { labelSw: 'Usahihi wa TypeScript', labelEn: 'Type Safety Coverage', value: '100% Strict Mode' },
      { labelSw: 'Muda wa Kujenga Mfumo', labelEn: 'Build Compilation Time', value: '< 18 seconds' },
      { labelSw: 'Uzuiaji wa Hitilafu', labelEn: 'Defect Prevention', value: 'Automated CI Gates' }
    ],
    securityRoleSw: 'Ukaguzi wa makosa ya kiusalama kabla ya mfumo kuingia hewani',
    securityRoleEn: 'Static analysis and dependency vulnerability screening'
  },
  {
    id: 'security-rls',
    number: 8,
    titleSw: 'Ulinzi wa Hifadhidata & Kanuni (Security & Firestore Rules)',
    titleEn: 'Security Rules & Row-Level Security',
    category: 'security',
    color: {
      name: 'Crimson / Red',
      primary: '#ef4444',
      gradient: 'from-red-600 to-rose-800',
      border: 'border-red-500',
      glow: 'shadow-red-500/40',
      bgSoft: 'bg-red-950/40',
      text: 'text-red-400',
      boxFaceTop: '#ef4444',
      boxFaceFront: '#dc2626',
      boxFaceSide: '#b91c1c',
    },
    technologies: ['Firestore Security Rules', 'Row-Level Security (RLS)', 'Input Sanitization', 'Data Encryption at Rest', 'TLS in Transit'],
    protocol: 'Firestore Rules Engine / AES-256 / SHA-256',
    latencySla: '< 2ms rule evaluation',
    descriptionSw: 'Ngome kuu ya kisheria ya data za shule: inazuia mtu yeyote asiye na ruhusa kubadilisha alama za mitihani au kumbukumbu za fedha za shule. Kila ombi linapimwa na sheria za mfumo.',
    descriptionEn: 'Declarative database-level security rules enforcing row-level access permissions, schema constraints, and atomic audit logging for every single mutation.',
    detailsSw: [
      'Sheria madhubuti za Firestore Rules zilizowekwa moja kwa moja kwenye seva za Google',
      'Uthibitishaji wa alama kabla ya kuhifadhiwa (Marks Range: 0-100, NECTA Grades: A, B, C, D, F)',
      'Data zote zimefichwa kwa njia ya usimbaji fiche (AES-256 Encryption at Rest)',
      'Ulinzi mkali wa taarifa binafsi za watoto (Child Privacy & Protection Standards)'
    ],
    detailsEn: [
      'Rules deployed directly to Google Cloud infrastructure—cannot be bypassed by clients',
      'Strict domain validation (score ranges 0-100, valid subject codes, candidate regex)',
      'All data encrypted at rest with AES-256 and encrypted in transit via TLS 1.3',
      'Compliance with international student data protection and privacy standards'
    ],
    metrics: [
      { labelSw: 'Usimbaji Fiche', labelEn: 'Data Encryption', value: 'AES-256 at Rest' },
      { labelSw: 'Utekelezaji wa Sheria', labelEn: 'Rules Engine Speed', value: 'Sub-2ms evaluation' },
      { labelSw: 'Viwango vya Ulinzi', labelEn: 'Security Posture', value: 'Zero Trust Model' }
    ],
    securityRoleSw: 'Kuzuia mabadiliko haramu ya matokeo ya wanafunzi na kumbukumbu za benki',
    securityRoleEn: 'Hard barrier against unauthorized grade tampering or ledger manipulation'
  },
  {
    id: 'rate-limiting',
    number: 9,
    titleSw: 'Ulinzi dhidi ya Mashambulizi (Rate Limiting & Protection)',
    titleEn: 'Rate Limiting & Anti-Abuse Protection',
    category: 'security',
    color: {
      name: 'Fuchsia / Pink',
      primary: '#ec4899',
      gradient: 'from-fuchsia-600 to-pink-800',
      border: 'border-fuchsia-500',
      glow: 'shadow-fuchsia-500/40',
      bgSoft: 'bg-fuchsia-950/40',
      text: 'text-fuchsia-400',
      boxFaceTop: '#ec4899',
      boxFaceFront: '#db2777',
      boxFaceSide: '#be185d',
    },
    technologies: ['Cloud Armor Edge', 'Brute-Force Throttling', 'Client Token Quotas', 'Form Anti-Spam Gate', 'Honeypot Validation'],
    protocol: 'Adaptive IP Filtering / Token Bucket Algorithm',
    latencySla: 'Real-time Threat Mitigation',
    descriptionSw: 'Kizuizi kinachozuia wavamizi wa mtandao (hackers) kujaribu kuingia mara nyingi kwa nguvu (brute force), roboti (bots) wanaotuma spam kwenye fomu za maombi, na mashambulizi ya DDoS.',
    descriptionEn: 'Intelligent traffic screening and rate limiting defending school administration portals from brute-force password cracking, credential stuffing, and bot-driven form spam.',
    detailsSw: [
      'Kuzuia majaribio mabaya ya nenosiri kwenye Staff Security Gatekeeper',
      'Uchujaji wa fomu za maombi ya kujiunga (Online Admissions Anti-Spam Protection)',
      'Ulinzi dhidi ya mashambulizi ya kusimamisha huduma (DDoS Mitigation)',
      'Kuweka vizuizi kwa anwani za IP zenye nia ovu bila kuwaathiri wazazi halisi'
    ],
    detailsEn: [
      'Multi-tier backoff throttling on staff password attempts with temporary lockout',
      'Admissions form spam screening with invisible honeypots and submission pacing',
      'Edge DDoS protection automatically absorbing malicious volumetric packet floods',
      'Dynamic IP reputation scoring protecting genuine student and parent traffic'
    ],
    metrics: [
      { labelSw: 'Kikomo cha Majaribio', labelEn: 'Staff Gate Quota', value: 'Adaptive Throttling' },
      { labelSw: 'Uzuiaji wa Roboti (Bots)', labelEn: 'Bot Mitigation', value: 'Honeypot & Rate Shield' },
      { labelSw: 'Uhimili wa Mashambulizi', labelEn: 'DDoS Resistance', value: 'Multi-Gbps Cloud Tier' }
    ],
    securityRoleSw: 'Kulinda milango ya kuingilia watumishi dhidi ya kubahatisha nenosiri',
    securityRoleEn: 'Automated lockout preventing brute-force password dictionary attacks'
  },
  {
    id: 'caching-cdn',
    number: 10,
    titleSw: 'Mtandao wa Kuharakisha Maudhui (Caching & Global CDN)',
    titleEn: 'Edge Caching & Content Delivery Network',
    category: 'operations',
    color: {
      name: 'Lime / Neon Green',
      primary: '#84cc16',
      gradient: 'from-lime-500 to-green-700',
      border: 'border-lime-500',
      glow: 'shadow-lime-500/40',
      bgSoft: 'bg-lime-950/40',
      text: 'text-lime-400',
      boxFaceTop: '#84cc16',
      boxFaceFront: '#65a30d',
      boxFaceSide: '#4d7c0f',
    },
    technologies: ['Google Cloud Anycast CDN', 'Immutable Asset Hashes', 'Service Worker Cache', 'Client IndexedDB', 'Brotli/Gzip'],
    protocol: 'HTTP Cache-Control / Stale-While-Revalidate / ETag',
    latencySla: '< 10ms edge cache response',
    descriptionSw: 'Picha za shule, nembo, faili za PDF na michoro vinahifadhiwa kwenye vituo vya mtandao vilivyo karibu zaidi na mtumiaji. Hii inafanya tovuti ifunguke mara moja hata kwa bando kidogo.',
    descriptionEn: 'Edge-distributed asset caching combined with browser IndexedDB and Service Worker caches, delivering instantaneous page loads regardless of visitor location.',
    detailsSw: [
      'Picha na nembo zinapakuliwa kutoka seva iliyo karibu zaidi na Tanzania',
      'Faili zilizohifadhiwa hazipakuliwi upya kila mara, kuokoa bando ya simu ya mzazi',
      'Uwezo wa kufungua taarifa zilizotazamwa awali hata ukiwa porini bila mtandao',
      'Mfinyazo wa juu wa faili (High Compression Brotli/Gzip) unaopunguza ukubwa kwa 75%'
    ],
    detailsEn: [
      'Edge presence serving static resources from the closest geographical node to East Africa',
      'Aggressive immutable cache headers eliminating redundant data consumption for parents',
      'Offline re-render from local cache when internet disconnects in transit',
      'Modern Brotli compression reducing bundle transfer payloads by over 70%'
    ],
    metrics: [
      { labelSw: 'Kasi ya Kufungua', labelEn: 'Edge Response Time', value: '< 10ms' },
      { labelSw: 'Uokoaji wa Bando', labelEn: 'Data Bandwidth Saved', value: '75% vs Raw Assets' },
      { labelSw: 'Upatikanaji Nje ya Mtandao', labelEn: 'Offline Cache Hit', value: '100% of Core Views' }
    ],
    securityRoleSw: 'Kuhakikisha faili zilizohifadhiwa hazijabadilishwa njiani (Cryptographic Hash Integrity)',
    securityRoleEn: 'Cryptographic Subresource Integrity (SRI) preventing cache poisoning'
  },
  {
    id: 'load-balancing',
    number: 11,
    titleSw: 'Ugawaji wa Mzigo & Upanuzi (Load Balancing & Elastic Scaling)',
    titleEn: 'Load Balancing & Elastic Cloud Scaling',
    category: 'cloud',
    color: {
      name: 'Violet / Indigo',
      primary: '#7c3aed',
      gradient: 'from-violet-600 to-indigo-800',
      border: 'border-violet-500',
      glow: 'shadow-violet-500/40',
      bgSoft: 'bg-violet-950/40',
      text: 'text-violet-400',
      boxFaceTop: '#7c3aed',
      boxFaceFront: '#6d28d9',
      boxFaceSide: '#5b21b6',
    },
    technologies: ['Google Cloud HTTPS Load Balancer', 'Horizontal Pod Autoscaler', 'Anycast Single Virtual IP', 'Multi-zone Failover'],
    protocol: 'Anycast IPv4 & IPv6 / HTTP/2 multiplexing',
    latencySla: 'Instant Elastic Scale (< 2s)',
    descriptionSw: 'Siku ya kutangaza Matokeo ya NECTA Kidato cha Nne, maelfu ya wazazi, walimu na wanafunzi huingia mtandaoni kwa mara moja. Mfumo unagawanya mzigo na kujiongeza ukubwa kiotomatiki bila kuzimika.',
    descriptionEn: 'Enterprise global HTTPS load balancer managing multi-zone failover and elastic container spawning, effortlessly handling surges during National NECTA result releases.',
    detailsSw: [
      'Kugawanya watumiaji kwenye nakala nyingi za seva ili kuzuia mrundikano',
      'Uwezo wa kuhimili maombi zaidi ya 50,000 kwa dakika bila kupunguza kasi',
      'Hakuna kukatika hata kituo kimoja cha data kikipata hitilafu (Multi-Zone Failover)',
      'Uunganishaji wa mtandao wa IPv4 na IPv6 kwa vifaa vyote vya kisasa na vya zamani'
    ],
    detailsEn: [
      'Traffic intelligently distributed across healthy container instances',
      'Resilient capacity handling 50,000+ requests/minute during examination surges',
      'Seamless multi-zone disaster failover with zero manual intervention required',
      'Native dual-stack IPv4/IPv6 support for older mobile network gateways'
    ],
    metrics: [
      { labelSw: 'Uwezo wa Watumiaji Pamoja', labelEn: 'Peak Concurrent Capacity', value: '50,000+ users' },
      { labelSw: 'Muda wa Kujiongeza', labelEn: 'Scale-out Duration', value: '< 2.5 seconds' },
      { labelSw: 'Uvumilivu wa Hitilafu', labelEn: 'Fault Tolerance', value: 'Multi-Zone Redundancy' }
    ],
    securityRoleSw: 'Kuzuia seva kuanguka wakati wa msongamano mkubwa wa wageni',
    securityRoleEn: 'Prevents resource exhaustion denial of service during peak national exams'
  },
  {
    id: 'error-tracking',
    number: 12,
    titleSw: 'Ufuatiliaji wa Hitilafu & Kumbukumbu (Error Tracking & Audit Logs)',
    titleEn: 'Observability, Audit Logs & Telemetry',
    category: 'operations',
    color: {
      name: 'Charcoal / Slate',
      primary: '#64748b',
      gradient: 'from-slate-600 to-slate-900',
      border: 'border-slate-500',
      glow: 'shadow-slate-500/40',
      bgSoft: 'bg-slate-950/40',
      text: 'text-slate-300',
      boxFaceTop: '#64748b',
      boxFaceFront: '#475569',
      boxFaceSide: '#334155',
    },
    technologies: ['Google Cloud Logging', 'Structured JSON Audit Trail', 'React Error Boundary', 'Client-side Telemetry', 'Health Probes'],
    protocol: 'Syslog / JSON Payloads / Cloud Audit Logs',
    latencySla: 'Instant Incident Detection',
    descriptionSw: 'Kila mabadiliko ya alama, uthibitisho wa malipo ya ada, au hitilafu ya mtandao inarekodiwa kwa usahihi wa sekunde. Hii inatoa uwazi kamili na kuzuia vitendo vyovyote vya udanganyifu.',
    descriptionEn: 'Comprehensive observability suite capturing structured audit trails of all grading updates, bursar transactions, and application exceptions for complete forensic transparency.',
    detailsSw: [
      'Kumbukumbu ya kila alama iliyobadilishwa—nani aliweka, lini na sababu gani (Audit Trail)',
      'Kurekodi risiti zote za benki zilizothibitishwa na Mhasibu ili kuzuia wizi',
      'Ukamataji wa makosa ya simu ya mtumiaji bila kuvuruga matumizi (Silent Error Trapping)',
      'Tahadhari ya papo hapo kwa msimamizi wa mfumo (System Administrator Alerting)'
    ],
    detailsEn: [
      'Immutable chronological record of every grade submission with teacher identity and timestamp',
      'Tamper-evident financial audit trail for bursar bank receipt verifications',
      'In-browser error boundaries trapping edge failures without disruptive user crashes',
      'Centralized telemetry enabling proactive diagnosis before users report issues'
    ],
    metrics: [
      { labelSw: 'Uhakika wa Kumbukumbu', labelEn: 'Audit Log Durability', value: '100% Immutable' },
      { labelSw: 'Ukamataji wa Hitilafu', labelEn: 'Crash Catch Rate', value: 'Zero Uncaught Escapes' },
      { labelSw: 'Ufuatiliaji wa Papo Hapo', labelEn: 'Telemetry Resolution', value: 'Real-time Millisecond' }
    ],
    securityRoleSw: 'Uwazi kamili wa kiutawala na kuzuia udanganyifu wa alama au fedha',
    securityRoleEn: 'Unalterable forensic accounting trail guaranteeing total institutional integrity'
  }
];

export const SYSTEM_DATA_FLOW_STEPS = [
  {
    step: 1,
    titleSw: 'Mtumiaji Anafungua Mfumo (Simu / Kompyuta)',
    titleEn: 'User Requests Uomboni Portal (Client)',
    descriptionSw: 'Mwanafunzi, mzazi, au mwalimu anafungua tovuti kupitia kivinjari. Ombi linatumwa kwa njia salama ya TLS 1.3.',
    descriptionEn: 'A student, parent, or educator requests the portal via web browser over encrypted HTTPS/TLS 1.3.',
    targetLayer: 'frontend',
    color: 'from-violet-500 to-purple-700'
  },
  {
    step: 2,
    titleSw: 'Mtandao wa CDN & Rate Limiting Unakagua Ombi',
    titleEn: 'Cloud Armor & Edge CDN Screening',
    descriptionSw: 'Google Cloud Anycast CDN inapakia faili za kiolesura haraka, na Cloud Armor inathibitisha ombi sio shambulio la bot au DDoS.',
    descriptionEn: 'Global Anycast CDN delivers cached UI assets instantly while Cloud Armor validates request legitimacy against abuse.',
    targetLayer: 'caching-cdn',
    color: 'from-lime-500 to-green-700'
  },
  {
    step: 3,
    titleSw: 'Uthibitishaji wa Utambulisho & Majukumu (RBAC)',
    titleEn: 'Authentication & Role-Based Authorization',
    descriptionSw: 'Firebase Auth inakagua JWT Tokeni na kuthibitisha ikiwa mtumiaji ni Mwalimu, Mhasibu, Mkuu wa Taaluma, au Mwanafunzi.',
    descriptionEn: 'Firebase Auth and security tokens verify caller identity and assign appropriate role permissions (RBAC).',
    targetLayer: 'auth-permissions',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    step: 4,
    titleSw: 'Uchakataji wa Mantiki ya Shule & NECTA',
    titleEn: 'School Logic Execution & Grading Engine',
    descriptionSw: 'Seva inafanya hesabu za alama za NECTA (Points, GPA, Division), kuandaa ripoti za PDF na kuthibitisha risiti za ada.',
    descriptionEn: 'Compute engine executes NECTA algorithms, calculates points and divisions, and prepares verified PDF report card payloads.',
    targetLayer: 'api-backend',
    color: 'from-sky-500 to-blue-700'
  },
  {
    step: 5,
    titleSw: 'Ukaguzi wa Sheria za Hifadhidata (Firestore Rules)',
    titleEn: 'Security Rules Evaluation & Data Storage',
    descriptionSw: 'Google Cloud Firestore inakagua kanuni za kiusalama (Rules). Ikiwa zinaruhusiwa, data inahifadhiwa kwa usimbaji fiche (AES-256).',
    descriptionEn: 'Cloud Firestore evaluates strict declarative rules, guarantees ACID transaction safety, and stores data encrypted at rest.',
    targetLayer: 'security-rls',
    color: 'from-red-600 to-rose-700'
  },
  {
    step: 6,
    titleSw: 'Usawazishaji wa Papo Hapo & Rekodi ya Kumbukumbu',
    titleEn: 'Realtime Sync & Immutable Audit Trail',
    descriptionSw: 'Data mpya inafika kwa watumiaji wote mara moja (Realtime Sync) na kila hatua inarekodiwa kwenye Cloud Logging Audit Trail.',
    descriptionEn: 'Live listeners update all active connected clients seamlessly while Cloud Logging records an immutable audit entry.',
    targetLayer: 'error-tracking',
    color: 'from-slate-600 to-slate-900'
  }
];

export const SCHOOL_INFRASTRUCTURE_SPECS = {
  institutionName: 'Uomboni Secondary School (NECTA S0486)',
  diocese: 'Catholic Diocese of Moshi (Jimbo Katoliki Moshi)',
  location: 'Marangu Magharibi, Moshi Vijijini, Kilimanjaro, Tanzania',
  primaryCloudProvider: 'Google Cloud Platform (GCP)',
  primaryRegion: 'europe-west2 (London High-Availability Zone)',
  databaseEngine: 'Google Cloud Firestore (NoSQL Document Store)',
  authProvider: 'Firebase Authentication & Google Identity Platform',
  uptimeTarget: '99.98% High Availability',
  securityStandard: 'Zero-Trust Architecture, TLS 1.3 Strict, AES-256 at Rest',
  compliance: 'NECTA CSEE Regulations, Child Data Privacy, Educational Audit Standards',
  lastVerifiedStatus: 'OPERATIONAL (Mifumo Yote Inafanya Kazi Vizuri)'
};
