const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// PHASE 1A: Insert LEGAL_REFS object before validateSLNIC
// ============================================================
const LEGAL_REFS_CODE = `
// ============================================================
// STATUTORY LEGAL REFERENCE REGISTRY
// Each key maps to { en, si, ta } citation strings.
// Used by LegalBadge component throughout the UI and print.
// ============================================================
const LEGAL_REFS = {
  // --- CIVIL CONTRIBUTOR ---
  male_civil_mandatory: {
    en: 'Widows\' & Orphans\' Pension Fund Ordinance No. 1/1898',
    si: 'ක්ෂේ.ව. විශ්‍රාම වැටුප් අරමුදල් ආඥාපනත අංක 01/1898',
    ta: 'விதவை & அனாதை ஓய்வூதிய நிதி அவசரச் சட்டம் எண் 01/1898'
  },
  female_civil_post1983: {
    en: 'Widowers\' & Orphans\' Pension Act No. 24/1983, S.3(1)',
    si: 'ව.ක්ෂේ. & අනත්දරු විශ්‍රාම වැටුප් පනත අංක 24/1983, ධ.3(1)',
    ta: 'விதுரர் & அனாதை ஓய்வூதியச் சட்டம் எண் 24/1983, பிரிவு 3(1)'
  },
  female_civil_pre1983_opt: {
    en: 'Act No. 24/1983 S.3(1); Act No. 19/1985; Circular 03/2014 (opt-in deadline: 31 Dec 2014)',
    si: 'පනත 24/1983 ධ.3(1); පනත 19/1985; චක්‍රලේඛ 03/2014 (ඇතුළත් වීමේ අවසාන දිනය: 2014.12.31)',
    ta: 'சட்டம் 24/1983 பிரிவு 3(1); சட்டம் 19/1985; சுற்றறிக்கை 03/2014 (இணைவதற்கான இறுதி தேதி: 31 டிசம்பர் 2014)'
  },
  female_civil_pre1983_ineligible: {
    en: 'Pension Circular No. 03/2014 — opt-in deadline expired 31 Dec 2014',
    si: 'විශ්‍රාම වැටුප් චක්‍රලේඛ 03/2014 — ඇතුළත් වීමේ අවසාන දිනය 2014.12.31 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை எண் 03/2014 — இணைவதற்கான இறுதி தேதி 31 டிசம்பர் 2014 கடந்துவிட்டது'
  },
  non_pensionable_ineligible: {
    en: 'Ordinance No. 1/1898 — permanent & pensionable post is mandatory for eligibility',
    si: 'ආඥාපනත 01/1898 — සුදුසුකම් සඳහා ස්ථිර හා විශ්‍රාම-ලාභ නිලයක් අනිවාර්ය වේ',
    ta: 'அவசரச் சட்டம் 01/1898 — தகுதிக்கு நிரந்தரமான ஓய்வூதியம் பெறத்தகுந்த பதவி கட்டாயமாகும்'
  },
  under10yrs_no_pension: {
    en: 'Ordinance No. 1/1898 — contributions refundable; service ended without pension (<10 yrs)',
    si: 'ආඥාපනත 01/1898 — දායක මුදල් ආපසු ලබා ගත හැකිය; මාස 120 ට අඩු සේවා කාලයකින් විශ්‍රාමයකින් තොරව සේවය අවසන්',
    ta: 'அவசரச் சட்டம் 01/1898 — பங்களிப்புகள் திரும்பப் பெறலாம்; ஓய்வூதியமின்றி சேவை முடிந்தது (<10 ஆண்டுகள்)'
  },
  age_at_appointment_min18: {
    en: 'Ordinance No. 1/1898 — minimum age 18 at date of appointment',
    si: 'ආඥාපනත 01/1898 — පත්වීමේ දිනයේදී අවම වයස අවුරුදු 18 විය යුතුය',
    ta: 'அவசரச் சட்டம் 01/1898 — நியமன தேதியில் குறைந்தபட்ச வயது 18 ஆண்டுகள்'
  },
  age_65_in_service: {
    en: 'Ordinance No. 1/1898 — statutory upper age limit for in-service contributors',
    si: 'ආඥාපනත 01/1898 — සේවයේ සිටින දායකයින් සඳහා නීත්‍යානුකූල ඉහළ වයස් සීමාව',
    ta: 'அவசரச் சட்டம் 01/1898 — சேவையில் உள்ள பங்களிப்பாளர்களுக்கான சட்டரீதியான ஆகிய வயது வரம்பு'
  },
  // --- FORCES CONTRIBUTOR ---
  forces_male_regular: {
    en: 'W&O Pension Scheme (Armed Forces) Act No. 18/1970 — mandatory from 30 Sep 1968',
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) පනත 18/1970 — 1968.09.30 සිට අනිවාර්ය',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) சட்டம் எண் 18/1970 — 30 செப்டம்பர் 1968 முதல் கட்டாயம்'
  },
  forces_female_regular: {
    en: 'W&O Pension Scheme (Armed Forces) Act No. 60/1998',
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) පනත 60/1998',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) சட்டம் எண் 60/1998'
  },
  forces_volunteer_opt: {
    en: 'Pension Circular No. 10/2009; Circular No. 02/2012 (opt-in deadline: 31 Dec 2012)',
    si: 'විශ්‍රාම චක්‍රලේඛ 10/2009; චක්‍රලේඛ 02/2012 (ඇතුළත් වීමේ අවසාන දිනය: 2012.12.31)',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 10/2009; சுற்றறிக்கை 02/2012 (இணைவதற்கான இறுதி தேதி: 31 டிசம்பர் 2012)'
  },
  forces_pre1968_opt: {
    en: 'Pension Circular No. 03/2006 — opt-in deadline: 30 Jun 2006',
    si: 'විශ්‍රාම චක්‍රලේඛ 03/2006 — ඇතුළත් වීමේ අවසාන දිනය: 2006.06.30',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 03/2006 — இணைவதற்கான இறுதி தேதி: 30 ஜூன் 2006'
  },
  forces_regular_consent_late: {
    en: 'Pension Circular No. 03/2006 — opt-in deadline expired 30 Jun 2006',
    si: 'විශ්‍රාම චක්‍රලේඛ 03/2006 — ඇතුළත් වීමේ අවසාන දිනය 2006.06.30 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 03/2006 — இணைவதற்கான இறுதி தேதி 30 ஜூன் 2006 கடந்துவிட்டது'
  },
  forces_volunteer_consent_late: {
    en: 'Pension Circular No. 02/2012 — opt-in deadline expired 31 Dec 2012',
    si: 'විශ්‍රාම චක්‍රලේඛ 02/2012 — ඇතුළත් වීමේ අවසාන දිනය 2012.12.31 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 02/2012 — இணைவதற்கான இறுதி தேதி 31 டிசம்பர் 2012 கடந்துவிட்டது'
  },
  // --- SPOUSE ---
  marriage_1yr_male_civil: {
    en: 'Ordinance No. 1/1898, S.28 — marriage < 12 months, no children: widow ineligible',
    si: 'ආඥාපනත 01/1898, ධ.28 — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹුව සුදුකම් නොලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 28 — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதவை தகுதியற்றவர்'
  },
  marriage_1yr_female_civil: {
    en: 'Act No. 24/1983, S.11 — marriage < 12 months, no children: widower ineligible',
    si: 'පනත 24/1983, ධ.11 — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹු පුරුෂයා සුදුකම් නොලැබේ',
    ta: 'சட்டம் 24/1983, பிரிவு 11 — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதுரர் தகுதியற்றவர்'
  },
  marriage_1yr_male_forces: {
    en: 'W&O Pension Scheme (Armed Forces) Regulations 1970, Reg. 27(1)',
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) රෙගුලාසි 1970, රෙගු. 27(1)',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) விதிமுறைகள் 1970, விதி 27(1)'
  },
  marriage_1yr_female_forces: {
    en: 'Act No. 60/1998, S.26(1) — marriage < 12 months, no children: widower ineligible',
    si: 'පනත 60/1998, ධ.26(1) — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹු පුරුෂයා සුදුකම් නොලැබේ',
    ta: 'சட்டம் 60/1998, பிரிவு 26(1) — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதுரர் தகுதியற்றவர்'
  },
  post_retirement_marriage: {
    en: 'Act No. 24/1983, S.25 — spouse/children from post-contribution marriage ineligible',
    si: 'පනත 24/1983, ධ.25 — දායක ගෙවීම් අවසන් වීමෙන් පසු විවාහ වූ අය සුදුකම් නොලැබේ',
    ta: 'சட்டம் 24/1983, பிரிவு 25 — பங்களிப்பு நிறுத்தத்திற்கு பின் திருமணம் செய்தோர் தகுதியற்றவர்'
  },
  remarriage_50pct_male: {
    en: 'Amendment Act No. 08/2010 (replacing Ordinance No. 1/1898, S.34) — 50% on remarriage',
    si: 'සංශෝධන පනත 08/2010 (ආඥාපනත 01/1898, ධ.34 ප්‍රතිස්ථාපනය) — නැවත විවාහයේදී 50%',
    ta: 'திருத்தச் சட்டம் 08/2010 (அவசரச் சட்டம் 01/1898, பிரிவு 34 மாற்றீடு) — மறுமணத்தில் 50%'
  },
  remarriage_50pct_female: {
    en: 'Amendment Act No. 09/2010 (replacing Act No. 24/1983, S.18) — 50% on remarriage',
    si: 'සංශෝධන පනත 09/2010 (පනත 24/1983, ධ.18 ප්‍රතිස්ථාපනය) — නැවත විවාහයේදී 50%',
    ta: 'திருத்தச் சட்டம் 09/2010 (சட்டம் 24/1983, பிரிவு 18 மாற்றீடு) — மறுமணத்தில் 50%'
  },
  dg_discretion_marriage: {
    en: 'Act No. 18/1970, S.37; Act No. 60/1998, S.36 — DG has discretion to award pension',
    si: 'පනත 18/1970, ධ.37; පනත 60/1998, ධ.36 — DG හට විශ්‍රාමය ප්‍රදානය කිරීමේ අභිමතාධිකාරය ඇත',
    ta: 'சட்டம் 18/1970, பிரிவு 37; சட்டம் 60/1998, பிரிவு 36 — DG விருப்பப்படி ஓய்வூதியம் வழங்கலாம்'
  },
  // --- ORPHAN ---
  orphan_age_21: {
    en: 'Ordinance No. 1/1898, S.29 — orphan eligible until age 21 (general)',
    si: 'ආඥාපනත 01/1898, ධ.29 — අනත්දරුවා සාමාන්‍යයෙන් වයස 21 දක්වා සුදුකම් ලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29 — அனாதை பொதுவாக 21 வயது வரை தகுதியானவர்'
  },
  orphan_age_26_unemployed: {
    en: 'Pension Circular No. 13/2010, S.4.2; W&OP Circular No. 01/99 — extended to age 26 if unemployed',
    si: 'විශ්‍රාම චක්‍රලේඛ 13/2010, ධ.4.2; ව.ක්ෂේ. චක්‍රලේඛ 01/99 — රැකියා රහිත නම් වයස 26 දක්වා දිගු කෙරේ',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 13/2010, பிரிவு 4.2; வி.&அ. சுற்றறிக்கை 01/99 — வேலையில்லா நிலையில் 26 வயது வரை நீட்டிக்கப்படும்'
  },
  orphan_employment_ineligible: {
    en: 'Pension Circular No. 01/99, S.5 — orphan ineligible if employed (pensionable post, provident fund, foreign employment, or taxable income)',
    si: 'විශ්‍රාම චක්‍රලේඛ 01/99, ධ.5 — රැකියාවේ යෙදී ඇත්නම් (විශ්‍රාම-ලාභ රාජ්‍ය රැකියා, අර්ථ සාධක අරමුදල්, විදේශ රැකියා, හෝ ආදායම් බදු ගෙවන) අනත්දරුවා සුදුකම් නොලැබේ',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 01/99, பிரிவு 5 — வேலையில் இருந்தால் (ஓய்வூதியப் பதவி, வருங்கால வைப்பு நிதி, வெளிநாட்டு வேலை அல்லது வரிக்குட்பட்ட வருமானம்) அனாதை தகுதியற்றவர்'
  },
  orphan_adoption: {
    en: 'Ordinance No. 1/1898, S.33 (amended by Act No. 44/1981); Act No. 24/1983, S.17 — legally adopted children treated equally',
    si: 'ආඥාපනත 01/1898, ධ.33 (44/1981 ින් සංශෝධිත); පනත 24/1983, ධ.17 — නීත්‍යානුකූලව ෆිස් අනාතොල් දරුවන් සමාන ලෙස සලකනු ලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 33 (சட்டம் 44/1981 திருத்தம்); சட்டம் 24/1983, பிரிவு 17 — சட்டரீதியாக தத்தெடுக்கப்பட்ட குழந்தைகள் சமமாக நடத்தப்படுவர்'
  },
  disabled_orphan_lifelong: {
    en: 'Ordinance No. 1/1898, S.29A (inserted by Act No. 44/1981); Act No. 24/1983, S.7 — lifelong pension for permanently disabled orphans',
    si: 'ආඥාපනත 01/1898, ධ.29A (44/1981 ින් ඇතුළත් කෙරිණ); පනත 24/1983, ධ.7 — ස්ථිර ආබාධිත අනත්දරුවන් සඳහා ජීවිතකාල විශ්‍රාමය',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29A (சட்டம் 44/1981 மூலம் சேர்க்கப்பட்டது); சட்டம் 24/1983, பிரிவு 7 — நிரந்தர ஊனமுற்ற அனாதைகளுக்கு ஆயுள் ஓய்வூதியம்'
  },
  disabled_orphan_forces: {
    en: 'Ordinance No. 1/1898, S.29A; Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5',
    si: 'ආඥාපනත 01/1898, ධ.29A; 2011.08.15 දිනැති අතිවිශේෂ ගැසට් 1719/3, රෙගු. 5',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29A; 15 ஆகஸ்ட் 2011 அசாதாரண வர்த்தமானி எண் 1719/3, விதி 5'
  },
  disabled_orphan_ineligible: {
    en: 'Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5 — disabled orphan ineligible if imprisoned, residing abroad, or engaged in anti-social conduct',
    si: '2011.08.15 දිනැති අතිවිශේෂ ගැසට් 1719/3, රෙගු. 5 — සිරගත, විදේශගත, හෝ අසාමාජික ක්‍රියාවල නිරත නම් ආබාධිත අනත්දරු විශ්‍රාමය අහෝසි',
    ta: '15 ஆகஸ்ட் 2011 அசாதாரண வர்த்தமானி எண் 1719/3, விதி 5 — சிறையில் அடைக்கப்பட்டால், வெளிநாட்டில் வசித்தால் அல்லது சமூக விரோத நடவடிக்கைகளில் ஈடுபட்டால் ஊனமுற்ற அனாதை தகுதியிழப்பு'
  },
  missing_person_waiting: {
    en: 'W&O Pension Fund Ordinance No. 1/1898 — waiting period: 4 months (pensioner) / 12 months (in-service) from reference date',
    si: 'ආඥාපනත 01/1898 — රැඳීමේ කාලය: මාස 4 (විශ්‍රාමික) / මාස 12 (සේවයේ) යොමු දිනෙන්',
    ta: 'அவசரச் சட்டம் 01/1898 — காத்திருப்பு காலம்: 4 மாதம் (ஓய்வுபெற்றவர்) / 12 மாதம் (சேவையில் உள்ளவர்) குறிப்பு தேதியிலிருந்து'
  }
};

// Returns the citation string for the current UI language
const getLegalRef = (key, i18nLang) => {
  const langMap = { en: 'en', si: 'si', ta: 'ta' };
  const lang = langMap[i18nLang] || 'en';
  return LEGAL_REFS[key]?.[lang] || LEGAL_REFS[key]?.en || '';
};

`;

src = src.replace(
  `// --- UTILITIES ---`,
  `// --- UTILITIES ---` + LEGAL_REFS_CODE
);

// ============================================================
// PHASE 1B: Insert LegalBadge component after FormErrorBanner
// ============================================================
const LEGAL_BADGE_CODE = `
// Legal Citation Badge Component
const LegalBadge = ({ refKey, lang, className = '' }) => {
  const ref = LEGAL_REFS[refKey];
  if (!ref) return null;
  const langMap = { en: 'en', si: 'si', ta: 'ta' };
  const l = langMap[lang] || 'en';
  const citation = ref[l] || ref.en;
  return (
    <span className={\`inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-semibold rounded \${className}\`}>
      ⚖ {citation}
    </span>
  );
};

`;

src = src.replace(
  `const isOver45Strict`,
  LEGAL_BADGE_CODE + `const isOver45Strict`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Phase 1A+1B done: LEGAL_REFS + LegalBadge inserted.');
