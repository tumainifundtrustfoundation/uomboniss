/**
 * Server-Side Prerendering & Dynamic Meta Injection Engine
 * 
 * Injects semantic HTML, accurate Schema.org JSON-LD, BreadcrumbList,
 * OpenGraph, Twitter Cards, and canonical tags for search engine bots
 * (Googlebot, Bingbot, Yandex, DuckDuckGo, Yahoo) and human visitors.
 */

export interface PageSeoConfig {
  path: string;
  title: string;
  description: string;
  heading: string;
  subheading: string;
  breadcrumbs: { name: string; item: string }[];
  htmlContent: string;
  schemaType?: string;
  extraJsonLd?: object;
}

const CANONICAL_BASE = 'https://www.uomboniss.sc.tz';
const DEFAULT_IMAGE = `${CANONICAL_BASE}/uomboni_flyer_2026.jpg`;

export const PUBLIC_PAGES_SEO: Record<string, PageSeoConfig> = {
  '/': {
    path: '/',
    title: 'Uomboni Secondary School | Official Results & Academic Portal (NECTA S0486)',
    description: 'Tovuti Rasmi ya Shule ya Sekondari Uomboni (NECTA S0486), Marangu Magharibi, Moshi Vijijini, Kilimanjaro. Udahili, Matokeo ya NECTA, Maisha ya Bweni, Vilabu, Walimu, Picha, Malipo ya Ada na Portal ya Wanafunzi.',
    heading: 'Shule ya Sekondari Uomboni — NECTA Centre S0486',
    subheading: 'Marangu Magharibi, Moshi Vijijini, Kilimanjaro | Elimu ni Maisha — Tujendelee Sisi Wenyewe',
    breadcrumbs: [{ name: 'Nyumbani (Home)', item: `${CANONICAL_BASE}/` }],
    htmlContent: `
      <section class="seo-hero">
        <h1>Uomboni Secondary School — Tovuti Rasmi & Portal ya Shule (NECTA S0486)</h1>
        <p>Karibu katika tovuti rasmi ya <strong>Shule ya Sekondari Uomboni</strong> (NECTA Registration Centre <strong>S0486</strong>), iliyopo Marangu Magharibi, Wilaya ya Moshi Vijijini, Mkoa wa Kilimanjaro, Tanzania. Shule inamilikiwa na kuendeshwa chini ya <strong>Jimbo Katoliki la Moshi</strong>, ikitoa elimu bora ya Sekondari (Kidato cha Kwanza hadi cha Nne) kwa wanafunzi wa <strong>Kutwa na Bweni</strong> (Wavulana na Wasichana).</p>
      </section>
      <section class="seo-key-facts">
        <h2>Taarifa Muhimu za Shule (Quick Institutional Facts)</h2>
        <ul>
          <li><strong>Namba ya Usajili NECTA:</strong> S0486 (Kituo Rasmi cha Mitihani ya Taifa)</li>
          <li><strong>Mahali Shule Ilipo:</strong> Kijiji cha Uomboni, Kata ya Marangu Magharibi, Moshi Vijijini, Mkoani Kilimanjaro</li>
          <li><strong>Ngazi ya Masomo:</strong> Kidato cha I hadi cha IV (Ordinary Level Secondary Education)</li>
          <li><strong>Aina ya Shule:</strong> Bweni na Kutwa kwa Wavulana na Wasichana (Co-educational Boarding & Day)</li>
          <li><strong>Kaulimbiu / Motto:</strong> “ELIMU NI MAISHA” — Tujendelee Sisi Wenyewe</li>
          <li><strong>Mawasiliano:</strong> Simu: +255 782 558 127 / +255 754 532 949 | Barua Pepe: info@uomboniss.sc.tz</li>
        </ul>
      </section>
      <section class="seo-navigation-links">
        <h2>Kurasa za Umma Zinazopatikana (Public Sections)</h2>
        <nav>
          <ul>
            <li><a href="/about">Kuhusu Shule & Historia (About Uomboni)</a></li>
            <li><a href="/admissions">Nafasi za Kujiunga & Udahili (Admissions)</a></li>
            <li><a href="/admission-documents">Hati na Fomu za Kujiunga (Admission Documents & Joining Instructions)</a></li>
            <li><a href="/academics">Taaluma na Mitaala ya Masomo (Academics & Curriculum)</a></li>
            <li><a href="/facilities">Miundombinu na Mazingira ya Shule (Facilities & Laboratories)</a></li>
            <li><a href="/results">Matokeo ya Mitihani & NECTA (Official Examination Results)</a></li>
            <li><a href="/news">Habari Mpya & Matangazo (School News & Announcements)</a></li>
            <li><a href="/faq">Maswali Yanayoulizwa Mara kwa Mara (Frequently Asked Questions)</a></li>
            <li><a href="/contact">Mawasiliano & Ramani ya Shule (Contact & Location Map)</a></li>
          </ul>
        </nav>
      </section>
    `,
  },

  '/about': {
    path: '/about',
    title: 'Kuhusu Sisi & Historia ya Shule | Uomboni Secondary School (NECTA S0486)',
    description: 'Fahamu historia ya Shule ya Sekondari Uomboni tangu kuanzishwa kwake, maono, dhamira, wito wa shule na mazingira tulivu ya kujisomea yaliyoko Marangu Magharibi, Moshi Vijijini, Kilimanjaro.',
    heading: 'Kuhusu Shule ya Sekondari Uomboni (About Us)',
    subheading: 'Historia, Dira, Dhima na Malezi Bora ya Kimaadili Chini ya Jimbo Katoliki la Moshi',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Kuhusu Sisi', item: `${CANONICAL_BASE}/about` },
    ],
    htmlContent: `
      <article>
        <h1>Kuhusu Shule ya Sekondari Uomboni (NECTA S0486)</h1>
        <p><strong>Uomboni Secondary School</strong> ni shule iliyosajiliwa rasmi nchini Tanzania ikiwa na namba ya kituo cha NECTA <strong>S0486</strong>. Ipo katika mazingira ya asili na tulivu chini ya mteremko wa Mlima Kilimanjaro, Kata ya Marangu Magharibi, Wilaya ya Moshi Vijijini.</p>
        
        <h2>Dira Yetu (Our Vision)</h2>
        <p>Kuwa kitovu cha elimu bora na malezi kamili yanayomwezesha mwanafunzi kufaulu kitaaluma, kuwa na nidhamu ya hali ya juu, kujitegemea na kuwa raia mwema mwenye hofu ya Mungu na mchango chanya kwa Taifa.</p>
        
        <h2>Dhima Yetu (Our Mission)</h2>
        <p>Kutoa elimu jumuishi na stahiki inayozingatia mitaala ya kitaifa ya Tanzania (NECTA), kukuza vipaji vya sayansi, biashara, lugha na sanaa katika mazingira salama, yenye maadili imara ya Kikristo na walimu waliojitolea.</p>

        <h2>Malezi na Maadili (Discipline & Character Formation)</h2>
        <p>Shule inazingatia malezi thabiti ya kimaadili. Wanafunzi wa madhehebu yote wanakaribishwa na kuheshimiwa, huku msisitizo ukiwa kwenye bidii ya kazi, heshima, usafi, upendo na uwajibikaji.</p>
      </article>
    `,
  },

  '/admissions': {
    path: '/admissions',
    title: 'Udahili & Nafasi za Kujiunga 2026/2027 | Uomboni Secondary School',
    description: 'Nafasi za kujiunga na Kidato cha Kwanza (Form 1) na uhamisho wa Kidato cha Pili na Tatu (Form 2 & 3) zipo wazi. Shule ya Sekondari Uomboni, Marangu Moshi. Pakua fomu za kujiunga na maelezo ya ada.',
    heading: 'Nafasi za Masomo & Udahili 2026 / 2027',
    subheading: 'Kidato cha Kwanza (Form One) na Uhamisho (Transfers) — Bweni na Kutwa',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Udahili', item: `${CANONICAL_BASE}/admissions` },
    ],
    htmlContent: `
      <article>
        <h1>Udahili na Maombi ya Kujiunga na Shule ya Sekondari Uomboni</h1>
        <p>Nafasi za masomo kwa wavulana na wasichana (Bweni na Kutwa) zipo wazi kwa:</p>
        <ul>
          <li><strong>Kidato cha Kwanza (Form One Entry):</strong> Kwa wanafunzi waliohitimu Darasa la Saba (PSLE) wakiwa na ufaulu mzuri.</li>
          <li><strong>Uhamisho Kidato cha Pili na Tatu (Form 2 & 3 Transfers):</strong> Kwa wanafunzi wenye maendeleo mazuri ya kitaaluma na tabia njema kutoka shule zilizosajiliwa.</li>
        </ul>
        
        <h2>Vigezo na Nyaraka Zinazohitajika:</h2>
        <ol>
          <li>Cheti cha Kuzaliwa kutoka RITA (Original & Certified Copy).</li>
          <li>Nakala ya Matokeo ya Darasa la Saba (PSLE Result Slip) au ripoti ya maendeleo ya shule iliyotoka.</li>
          <li>Fomu ya Uchunguzi wa Afya (Medical Examination Form) iliyojazwa na mganga wa hospitali ya serikali.</li>
          <li>Picha 4 za pasipoti za hivi karibuni zenye mandhari ya bluu bahari (sky blue background).</li>
          <li>Hati ya makubaliano ya sheria na kanuni za shule iliyosainiwa na mzazi/mlezi.</li>
        </ol>

        <p><a href="/admission-documents">Bofya hapa kufungua ukurasa wa Hati za Udahili na kupakua fomu zote rasmi za kujiunga (PDF)</a>.</p>
      </article>
    `,
  },

  '/admission-documents': {
    path: '/admission-documents',
    title: 'Hati za Udahili & Fomu za Kujiunga 2027 (PDF) | Uomboni Secondary School',
    description: 'Pakua fomu rasmi za kujiunga na shule (Joining Instructions), fomu ya uchunguzi wa afya, kanuni za nidhamu, orodha ya vitu muhimu na fomu ya mzazi/mlezi ya Shule ya Sekondari Uomboni.',
    heading: 'Hati na Nyaraka Rasmi za Udahili (Admission Documents)',
    subheading: 'Pakua Fomu ya Kujiunga, Fomu ya Afya, Sheria za Shule na Orodha ya Vitu Muhimu',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Hati za Udahili', item: `${CANONICAL_BASE}/admission-documents` },
    ],
    htmlContent: `
      <article>
        <h1>Hati na Fomu Rasmi za Kujiunga na Shule ya Sekondari Uomboni (NECTA S0486)</h1>
        <p>Hati zifuatazo zinapatikana kwa ajili ya kupakuliwa moja kwa moja na wazazi, walezi na wanafunzi waliochaguliwa kujiunga na shule:</p>
        
        <div class="doc-list">
          <h3>1. Fomu Rasmi ya Maelekezo ya Kujiunga (Joining Instructions 2027)</h3>
          <p>Inaeleza tarehe ya kufunguliwa kwa shule, mchanganuo wa ada ya shule, malipo ya benki, mahitaji ya wanafunzi wa bweni na kutwa, na mwongozo wa usajili.</p>

          <h3>2. Fomu ya Uchunguzi wa Afya (Medical Examination Form)</h3>
          <p>Inayopaswa kujazwa na kugongwa mhuri na mganga mkuu katika hospitali au kituo cha afya cha serikali kabla ya kuripoti shuleni.</p>

          <h3>3. Sheria na Kanuni za Nidhamu ya Shule (School Rules & Regulations)</h3>
          <p>Mwongozo wa nidhamu, vitu vilivyopigwa marufuku (simu, hita, vifaa vya umeme), mavazi, na utaratibu wa wazazi kutembelea shule.</p>

          <h3>4. Orodha ya Vitu Muhimu vya Kuripoti Shuleni (Reporting Checklist)</h3>
          <p>Orodha kamili ya vifaa vya kitaaluma (madaftari, kalamu, geometric set), mahitaji ya mabweni (godoro, shuka, neti, ndoo, sanduku la bati), na sare rasmi za shule.</p>
        </div>
      </article>
    `,
  },

  '/academics': {
    path: '/academics',
    title: 'Taaluma & Mitaala ya NECTA (Kidato 1 - 4) | Uomboni Secondary School',
    description: 'Mitaala ya NECTA ya Sayansi, Biashara na Sanaa. Maabara za kisasa za Fizikia, Kemia na Baiolojia, Maktaba na maandalizi thabiti ya mitihani ya kitaifa CSEE Uomboni Secondary School.',
    heading: 'Idara ya Taaluma & Mitaala ya Masomo (Academics)',
    subheading: 'Sayansi, Biashara na Sanaa — Kituo Rasmi cha Mitihani NECTA S0486',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Taaluma', item: `${CANONICAL_BASE}/academics` },
    ],
    htmlContent: `
      <article>
        <h1>Taaluma na Mitaala ya Masomo — Uomboni Secondary School</h1>
        <p>Shule ya Sekondari Uomboni inatoa elimu inayofuata mtaala rasmi wa Taasisi ya Elimu Tanzania (TIE) na Baraza la Mitihani la Tanzania (NECTA) kwa Kidato cha Kwanza hadi cha Nne.</p>
        
        <h2>Masomo Yanayofundishwa:</h2>
        <ul>
          <li><strong>Masomo ya Sayansi:</strong> Physics (Fizikia), Chemistry (Kemia), Biology (Baiolojia), Basic Mathematics (Hisabati).</li>
          <li><strong>Masomo ya Lugha na Jamii:</strong> English Language, Kiswahili, Geography (Jiografia), History (Historia), Civics (Uraia).</li>
          <li><strong>Masomo ya Biashara:</strong> Commerce na Bookkeeping.</li>
          <li><strong>TEHAMA & Kompyuta:</strong> Mafunzo ya vitendo ya kompyuta na stadi za kidijitali kwa wanafunzi wote.</li>
        </ul>

        <h2>Maabara za Sayansi za Kisasa</h2>
        <p>Shule ina maabara tatu zilizojitegemea na zenye vifaa kamili: Maabara ya Fizikia, Maabara ya Kemia na Maabara ya Baiolojia, zinazowawezesha wanafunzi kufanya majaribio ya vitendo (practicals) kujiandaa vyema na mitihani ya kitaifa.</p>
      </article>
    `,
  },

  '/facilities': {
    path: '/facilities',
    title: 'Miundombinu na Mazingira ya Shule | Uomboni Secondary School',
    description: 'Mabweni salama, maabara za sayansi, maktaba kubwa, chumba cha kompyuta, viwanja vya mpira wa miguu na pete, na mazingira safi ya Marangu, Kilimanjaro.',
    heading: 'Miundombinu & Mazingira ya Shule (Facilities)',
    subheading: 'Mazingira Safi, Salama na Tulivu Chini ya Mlima Kilimanjaro',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Miundombinu', item: `${CANONICAL_BASE}/facilities` },
    ],
    htmlContent: `
      <article>
        <h1>Miundombinu na Mazingira ya Shule ya Sekondari Uomboni</h1>
        <p>Shule ya Sekondari Uomboni inajivunia miundombinu bora na salama inayowezesha ujifunzaji wenye tija:</p>
        <ul>
          <li><strong>Mabweni ya Kisasa:</strong> Mabweni tofauti ya wavulana na wasichana yenye ulinzi wa masaa 24, maji safi na usafi wa hali ya juu.</li>
          <li><strong>Maktaba ya Shule:</strong> Ina vitabu vya ziada na kiada kwa masomo yote ya sekondari.</li>
          <li><strong>Maabara za Sayansi:</strong> Zina vifaa stahiki vya kemikali na vifaa vya majaribio ya Fizikia na Baiolojia.</li>
          <li><strong>Chumba cha Kompyuta (ICT Lab):</strong> Kompyuta zilizounganishwa na mtandao kwa ajili ya mafunzo ya TEHAMA.</li>
          <li><strong>Viwanja vya Michezo:</strong> Uwanja wa mpira wa miguu (football), netball na mpira wa wavu (volleyball).</li>
          <li><strong>Bwalo la Chakula (Dining Hall):</strong> Chakula bora chenye lishe kinachoandaliwa katika mazingira ya usafi.</li>
        </ul>
      </article>
    `,
  },

  '/results': {
    path: '/results',
    title: 'Matokeo ya Mitihani & NECTA CSEE (S0486) | Uomboni Secondary School',
    description: 'Matokeo rasmi ya NECTA Kidato cha Nne (CSEE), mitihani ya Mock ya Mkoa na Wilaya, na mitihani ya ndani ya muhula ya Shule ya Sekondari Uomboni (NECTA S0486), Marangu Moshi.',
    heading: 'Matokeo ya Mitihani & Ufaulu wa NECTA (S0486)',
    subheading: 'Tathmini ya Ufaulu wa Kitaifa na Mitihani ya Ndani ya Shule',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Matokeo', item: `${CANONICAL_BASE}/results` },
    ],
    htmlContent: `
      <article>
        <h1>Matokeo Rasmi ya Mitihani — Shule ya Sekondari Uomboni (NECTA S0486)</h1>
        <p>Shule ya Sekondari Uomboni inatekeleza sera ya uwazi katika matokeo ya kitaaluma kwa wanafunzi, wazazi na wadau wa elimu:</p>
        
        <h2>Mitihani ya Kitaifa ya NECTA:</h2>
        <ul>
          <li><strong>CSEE (Certificate of Secondary Education Examination):</strong> Mitihani ya kuhitimu Kidato cha Nne chini ya Baraza la Mitihani la Tanzania (NECTA).</li>
          <li><strong>FTNA (Form Two National Assessment):</strong> Tathmini ya Kitaifa ya Kidato cha Pili.</li>
        </ul>

        <h2>Mitihani ya Ndani na Majaribio:</h2>
        <p>Wanafunzi hufanya mitihani ya kila mwezi (Monthly Tests), Mitihani ya Muhula (Terminal Exams) na Mitihani ya Maandalizi ya Mkoa na Kanda (Regional Mock Exams) kupima utayari wao kabla ya mitihani ya mwisho.</p>
      </article>
    `,
  },

  '/news': {
    path: '/news',
    title: 'Habari Mpya & Matangazo ya Shule | Uomboni Secondary School',
    description: 'Habari za hivi karibuni, matangazo ya shule, kalenda ya mihula ya masomo, mahafali na shughuli za kijamii za Shule ya Sekondari Uomboni, Marangu Kilimanjaro.',
    heading: 'Habari, Matukio na Matangazo ya Shule',
    subheading: 'Taarifa Rasmi za Shule ya Sekondari Uomboni (NECTA S0486)',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Habari', item: `${CANONICAL_BASE}/news` },
    ],
    htmlContent: `
      <article>
        <h1>Habari Mpya na Matangazo — Uomboni Secondary School</h1>
        <p>Pata taarifa rasmi, matangazo ya muhula, na habari za maendeleo ya shule yetu:</p>
        <ul>
          <li><strong>Tangazo la Udahili wa Wanafunzi Wapya:</strong> Dirisha la maombi ya Kidato cha Kwanza na uhamisho wa Kidato cha 2 & 3 linaendelea.</li>
          <li><strong>Tarehe za Kuripoti Shuleni:</strong> Muhula mpya unafunguliwa rasmi mwezi Januari. Wanafunzi wote wanatakiwa kuripoti wakiwa na fomu zilizokamilika.</li>
          <li><strong>Mikutano ya Wazazi na Walezi:</strong> Ushirikiano na wazazi unaendelea kupitia mikutano ya mara kwa mara na siku rasmi za kutembelea wanafunzi (Visiting Days).</li>
        </ul>
      </article>
    `,
  },

  '/faq': {
    path: '/faq',
    title: 'Maswali Yanayoulizwa Mara kwa Mara (FAQ) | Uomboni Secondary School',
    description: 'Majibu ya papo hapo kuhusu udahili wa wanafunzi, muundo wa ada ya shule, akaunti za benki (CRDB, NMB, Mkombozi), ratiba ya kila siku na sheria za bweni Uomboni Secondary.',
    heading: 'Maswali Yanayoulizwa Mara kwa Mara (FAQ)',
    subheading: 'Majibu Kuhusu Udahili, Ada, Ratiba na Maisha ya Shule',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Maswali (FAQ)', item: `${CANONICAL_BASE}/faq` },
    ],
    htmlContent: `
      <article>
        <h1>Maswali Yanayoulizwa Mara kwa Mara (FAQ) — Uomboni Secondary School</h1>
        
        <h2>1. Maswali Kuhusu Udahili (Admissions FAQ)</h2>
        <dl>
          <dt><strong>Swali: Ni vigezo gani vinavyohitajika kujiunga na Kidato cha Kwanza?</strong></dt>
          <dd>Jibu: Mwanafunzi anapaswa kuwa amefaulu mtihani wa Darasa la Saba (PSLE), awe na cheti cha kuzaliwa (RITA), nakala ya matokeo ya NECTA, fomu ya afya iliyopigwa mhuri na daktari wa serikali, na picha 4 za pasipoti.</dd>
          
          <dt><strong>Swali: Je, mnapokea wanafunzi wa uhamisho wa Kidato cha Pili na Tatu?</strong></dt>
          <dd>Jibu: Ndiyo, nafasi za uhamisho zipo wazi kwa wanafunzi wenye tabia njema na maendeleo mazuri ya kitaaluma kutoka shule zilizosajiliwa.</dd>
        </dl>

        <h2>2. Maswali Kuhusu Ada na Malipo (School Fees FAQ)</h2>
        <dl>
          <dt><strong>Swali: Ada inalipwaje na ni akaunti zipi rasmi za benki?</strong></dt>
          <dd>Jibu: Ada inaweza kulipwa kwa awamu nne au mbili kupitia akaunti rasmi za Shule ya Sekondari Uomboni katika benki za CRDB, NMB, au Mkombozi. Malipo ya pesa mkononi (cash) hayaruhusiwi.</dd>
        </dl>

        <h2>3. Maswali Kuhusu Ratiba na Nidhamu (Daily Routine & Discipline FAQ)</h2>
        <dl>
          <dt><strong>Swali: Je, simu za mkononi zinaruhusiwa shuleni?</strong></dt>
          <dd>Jibu: HAPANA KABISA. Simu za mkononi na vifaa vya kielektroniki vimepigwa marufuku vikali. Mawasiliano yote hufanyika kupitia ofisi ya shule.</dd>
        </dl>
      </article>
    `,
  },

  '/contact': {
    path: '/contact',
    title: 'Mawasiliano & Ofisi za Utawala | Uomboni Secondary School, Marangu Moshi',
    description: 'Wasiliana na Shule ya Sekondari Uomboni: Simu +255 782 558 127 / +255 754 532 949, Barua pepe: info@uomboniss.sc.tz, S.L.P 361 Marangu, Moshi Vijijini, Kilimanjaro.',
    heading: 'Mawasiliano na Ofisi za Utawala (Contact Us)',
    subheading: 'Wasiliana Nasi Moja kwa Moja au Tembelea Shule Yetu Marangu',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Mawasiliano', item: `${CANONICAL_BASE}/contact` },
    ],
    htmlContent: `
      <article>
        <h1>Mawasiliano ya Shule ya Sekondari Uomboni</h1>
        <p>Tupo tayari kukuhudumia na kukupa taarifa sahihi kuhusu udahili, maendeleo ya mwanafunzi na huduma za shule:</p>
        
        <h2>Ofisi ya Mkuu wa Shule & Utawala:</h2>
        <ul>
          <li><strong>Anwani ya Posta:</strong> Shule ya Sekondari Uomboni, S.L.P 361 Marangu, Moshi, Kilimanjaro, Tanzania.</li>
          <li><strong>Simu Rasmi za Shule:</strong> <a href="tel:+255782558127">+255 782 558 127</a> / <a href="tel:+255754532949">+255 754 532 949</a></li>
          <li><strong>Barua Pepe:</strong> <a href="mailto:info@uomboniss.sc.tz">info@uomboniss.sc.tz</a></li>
          <li><strong>Tovuti Rasmi:</strong> <a href="https://www.uomboniss.sc.tz/">https://www.uomboniss.sc.tz/</a></li>
          <li><strong>Masaa ya Kazi:</strong> Jumatatu hadi Ijumaa: Saa 2:00 Asubuhi – 10:00 Jioni (Ofisi ya Shule)</li>
        </ul>
      </article>
    `,
  },

  '/location': {
    path: '/location',
    title: 'Mahali Shule Ilipo & Ramani (Directions) | Uomboni Secondary School',
    description: 'Elekea Shule ya Sekondari Uomboni: Kijiji cha Uomboni, Kata ya Marangu Magharibi, Moshi Vijijini, Mkoani Kilimanjaro. Mwongozo wa njia kutoka Moshi mjini hadi shuleni.',
    heading: 'Mahali Shule Ilipo & Mwongozo wa Njia (Location & Directions)',
    subheading: 'Kijiji cha Uomboni, Marangu Magharibi, Moshi Vijijini, Kilimanjaro',
    breadcrumbs: [
      { name: 'Nyumbani', item: `${CANONICAL_BASE}/` },
      { name: 'Mahali Ilipo', item: `${CANONICAL_BASE}/location` },
    ],
    htmlContent: `
      <article>
        <h1>Mahali Shule ya Sekondari Uomboni Ilipo na Jinsi ya Kufika</h1>
        <p><strong>Uomboni Secondary School</strong> ipo Kaskazini mwa Tanzania katika Wilaya ya Moshi Vijijini, Mkoa wa Kilimanjaro.</p>
        
        <h2>Mwongozo wa Kufika Shuleni Kutoka Moshi Mjini:</h2>
        <ol>
          <li>Kutoka Moshi Mjini, panda gari linaloelekea Marangu (Barabara kuu ya Moshi - Himo - Marangu).</li>
          <li>Ukifika Marangu Mtoni au Marangu Magharibi, fuata njia inayoelekea Kijiji cha Uomboni.</li>
          <li>Shule ipo umbali mfupi kutoka kituo kikuu cha kijiji, ikiwa na bango rasmi linalotambulisha <strong>Uomboni Secondary School — NECTA S0486</strong>.</li>
        </ol>
        <p><strong>Kuratibu za Kijiografia (GPS Coordinates):</strong> Latitudo: -3.2842° S, Longitudo: 37.5218° E.</p>
      </article>
    `,
  },
};

/**
 * Injects prerendered SEO metadata, canonical link, breadcrumbs, and semantic HTML into index.html
 */
export function injectPrerenderedSeo(rawHtml: string, reqPath: string): string {
  // Normalize path
  const normalizedPath = reqPath.split('?')[0].split('#')[0] || '/';
  const cleanPath = normalizedPath.endsWith('/') && normalizedPath.length > 1
    ? normalizedPath.slice(0, -1)
    : normalizedPath;

  const pageConfig = PUBLIC_PAGES_SEO[cleanPath] || PUBLIC_PAGES_SEO['/'];
  const canonicalUrl = `${CANONICAL_BASE}${cleanPath === '/' ? '/' : cleanPath}`;

  // 1. Build BreadcrumbList Schema.org structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pageConfig.breadcrumbs.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      item: b.item,
    })),
  };

  let rendered = rawHtml;

  // Replace Title
  rendered = rendered.replace(
    /<title>.*?<\/title>/i,
    `<title>${pageConfig.title}</title>`
  );

  // Replace Meta Description
  rendered = rendered.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${pageConfig.description}" />`
  );

  // Replace Canonical Link
  rendered = rendered.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace OpenGraph & Twitter tags
  rendered = rendered.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${pageConfig.title}" />`
  );
  rendered = rendered.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${pageConfig.description}" />`
  );
  rendered = rendered.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  rendered = rendered.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${pageConfig.title}" />`
  );
  rendered = rendered.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${pageConfig.description}" />`
  );
  rendered = rendered.replace(
    /<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );

  // Inject Breadcrumb JSON-LD before </head>
  const breadcrumbScript = `\n    <!-- Page Breadcrumb Schema.org -->\n    <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbSchema, null, 2)}\n    </script>\n  `;
  rendered = rendered.replace('</head>', `${breadcrumbScript}</head>`);

  // Inject prerendered semantic crawler HTML inside <div id="root"></div>
  // When React mounts, hydrate/createRoot replaces this transparently.
  const prerenderedBody = `
    <!-- Prerendered Semantic HTML for Search Engine Crawlers & Accessibility -->
    <main id="seo-prerendered-content" class="sr-only sm:not-sr-only static-seo-container" style="display:none;" data-prerendered-path="${cleanPath}">
      <article>
        <header>
          <p class="school-affiliation">Catholic Diocese of Moshi (NECTA S0486)</p>
          <h2>${pageConfig.heading}</h2>
          <p><em>${pageConfig.subheading}</em></p>
        </header>
        ${pageConfig.htmlContent}
      </article>
    </main>
    <noscript>
      <div style="padding:2rem;font-family:sans-serif;max-width:800px;margin:auto;">
        <h1>${pageConfig.heading}</h1>
        <p>${pageConfig.subheading}</p>
        ${pageConfig.htmlContent}
      </div>
    </noscript>
  `;

  rendered = rendered.replace(
    '<div id="root"></div>',
    `<div id="root">${prerenderedBody}</div>`
  );

  return rendered;
}
