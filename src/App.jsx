import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle2, ShieldCheck, Shield, ChevronRight, ChevronLeft, CalendarCheck, AlertTriangle, CheckCircle, XCircle, PieChart, Printer, Activity } from 'lucide-react';
import './App.css';
import bannerImg from './assets/WOP_banner.png';

// --- UTILITIES ---
// ============================================================
// STATUTORY LEGAL REFERENCE REGISTRY
// Each key maps to { en, si, ta } citation strings.
// Used by LegalBadge component throughout the UI and print.
// ============================================================
const LEGAL_REFS = {
  // --- CIVIL CONTRIBUTOR ---
  male_civil_mandatory: {
    en: "Widows' & Orphans' Pension Fund Ordinance No. 1/1898",
    si: 'ක්ෂේ.ව. විශ්‍රාම වැටුප් අරමුදල් ආඥාපනත අංක 01/1898',
    ta: 'விதவை & அனாதை ஓய்வூதிய நிதி அவசரச் சட்டம் எண் 01/1898'
  },
  female_civil_post1983: {
    en: "Widowers' & Orphans' Pension Act No. 24/1983, S.3(1)",
    si: 'ව.ක්ෂේ. & අනත්දරු විශ්‍රාම වැටුප් පනත අංක 24/1983, ධ.3(1)',
    ta: 'விதுரர் & அனாதை ஓய்வூதியச் சட்டம் எண் 24/1983, பிரிவு 3(1)'
  },
  female_civil_pre1983_opt: {
    en: "Act No. 24/1983 S.3(1); Act No. 19/1985; Circular 03/2014 (opt-in deadline: 31 Dec 2014)",
    si: 'පනත 24/1983 ධ.3(1); පනත 19/1985; චක්‍රලේඛ 03/2014 (ඇතුළත් වීමේ අවසාන දිනය: 2014.12.31)',
    ta: 'சட்டம் 24/1983 பிரிவு 3(1); சட்டம் 19/1985; சுற்றறிக்கை 03/2014 (இணைவதற்கான இறுதி தேதி: 31 டிசம்பர் 2014)'
  },
  female_civil_pre1983_ineligible: {
    en: "Pension Circular No. 03/2014 — opt-in deadline expired 31 Dec 2014",
    si: 'විශ්‍රාම වැටුප් චක්‍රලේඛ 03/2014 — ඇතුළත් වීමේ අවසාන දිනය 2014.12.31 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை எண் 03/2014 — இணைவதற்கான இறுதி தேதி 31 டிசம்பர் 2014 கடந்துவிட்டது'
  },
  non_pensionable_ineligible: {
    en: "Ordinance No. 1/1898 — permanent & pensionable post is mandatory for eligibility",
    si: 'ආඥාපනත 01/1898 — සුදුසුකම් සඳහා ස්ථිර හා විශ්‍රාම-ලාභ නිලයක් අනිවාර්ය වේ',
    ta: 'அவசரச் சட்டம் 01/1898 — தகுதிக்கு நிரந்தரமான ஓய்வூதியம் பெறத்தகுந்த பதவி கட்டாயமாகும்'
  },
  under10yrs_no_pension: {
    en: "Ordinance No. 1/1898 — contributions refundable; service ended without pension (<10 yrs)",
    si: 'ආඥාපනත 01/1898 — දායක මුදල් ආපසු ලබා ගත හැකිය; මාස 120 ට අඩු සේවා කාලයකින් විශ්‍රාමයකින් තොරව සේවය අවසන්',
    ta: 'அவசரச் சட்டம் 01/1898 — பங்களிப்புகள் திரும்பப் பெறலாம்; ஓய்வூதியமின்றி சேவை முடிந்தது (<10 ஆண்டுகள்)'
  },
  age_at_appointment_min18: {
    en: "Ordinance No. 1/1898 — minimum age 18 at date of appointment",
    si: 'ආඥාපනත 01/1898 — පත්වීමේ දිනයේදී අවම වයස අවුරුදු 18 විය යුතුය',
    ta: 'அவசரச் சட்டம் 01/1898 — நியமன தேதியில் குறைந்தபட்ச வயது 18 ஆண்டுகள்'
  },
  age_65_in_service: {
    en: "Ordinance No. 1/1898 — statutory upper age limit for in-service contributors",
    si: 'ආඥාපනත 01/1898 — සේවයේ සිටින දායකයින් සඳහා නීත්‍යානුකූල ඉහළ වයස් සීමාව',
    ta: 'அவசரச் சட்டம் 01/1898 — சேவையில் உள்ள பங்களிப்பாளர்களுக்கான சட்டரீதியான ஆகிய வயது வரம்பு'
  },
  // --- FORCES CONTRIBUTOR ---
  forces_male_regular: {
    en: "W&O Pension Scheme (Armed Forces) Act No. 18/1970 — mandatory from 30 Sep 1968",
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) පනත 18/1970 — 1968.09.30 සිට අනිවාර්ය',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) சட்டம் எண் 18/1970 — 30 செப்டம்பர் 1968 முதல் கட்டாயம்'
  },
  forces_female_regular: {
    en: "W&O Pension Scheme (Armed Forces) Act No. 60/1998",
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) පනත 60/1998',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) சட்டம் எண் 60/1998'
  },
  forces_volunteer_opt: {
    en: "Pension Circular No. 10/2009; Circular No. 02/2012 (opt-in deadline: 31 Dec 2012)",
    si: 'විශ්‍රාම චක්‍රලේඛ 10/2009; චක්‍රලේඛ 02/2012 (ඇතුළත් වීමේ අවසාන දිනය: 2012.12.31)',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 10/2009; சுற்றறிக்கை 02/2012 (இணைவதற்கான இறுதி தேதி: 31 டிசம்பர் 2012)'
  },
  forces_pre1968_opt: {
    en: "Pension Circular No. 03/2006 — opt-in deadline: 30 Jun 2006",
    si: 'විශ්‍රාම චක්‍රලේඛ 03/2006 — ඇතුළත් වීමේ අවසාන දිනය: 2006.06.30',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 03/2006 — இணைவதற்கான இறுதி தேதி: 30 ஜூன் 2006'
  },
  forces_regular_consent_late: {
    en: "Pension Circular No. 03/2006 — opt-in deadline expired 30 Jun 2006",
    si: 'විශ්‍රාම චක්‍රලේඛ 03/2006 — ඇතුළත් වීමේ අවසාන දිනය 2006.06.30 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 03/2006 — இணைவதற்கான இறுதி தேதி 30 ஜூன் 2006 கடந்துவிட்டது'
  },
  forces_volunteer_consent_late: {
    en: "Pension Circular No. 02/2012 — opt-in deadline expired 31 Dec 2012",
    si: 'විශ්‍රාම චක්‍රලේඛ 02/2012 — ඇතුළත් වීමේ අවසාන දිනය 2012.12.31 ගෙවී ඇත',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 02/2012 — இணைவதற்கான இறுதி தேதி 31 டிசம்பர் 2012 கடந்துவிட்டது'
  },
  // --- SPOUSE ---
  marriage_1yr_male_civil: {
    en: "Ordinance No. 1/1898, S.28 — marriage < 12 months, no children: widow ineligible",
    si: 'ආඥාපනත 01/1898, ධ.28 — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹුව සුදුකම් නොලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 28 — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதவை தகுதியற்றவர்'
  },
  marriage_1yr_female_civil: {
    en: "Act No. 24/1983, S.11 — marriage < 12 months, no children: widower ineligible",
    si: 'පනත 24/1983, ධ.11 — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹු පුරුෂයා සුදුකම් නොලැබේ',
    ta: 'சட்டம் 24/1983, பிரிவு 11 — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதுரர் தகுதியற்றவர்'
  },
  marriage_1yr_male_forces: {
    en: "W&O Pension Scheme (Armed Forces) Regulations 1970, Reg. 27(1)",
    si: 'ව.ක්ෂේ. විශ්‍රාම ක්‍රමය (සන්නද්ධ හමුදා) රෙගුලාසි 1970, රෙගු. 27(1)',
    ta: 'வி.&அ. ஓய்வூதியத் திட்டம் (ஆயுத படை) விதிமுறைகள் 1970, விதி 27(1)'
  },
  marriage_1yr_female_forces: {
    en: "Act No. 60/1998, S.26(1) — marriage < 12 months, no children: widower ineligible",
    si: 'පනත 60/1998, ධ.26(1) — විවාහය මාස 12 ට අඩු, දරුවන් නොමැති: වැන්දඹු පුරුෂයා සුදුකම් නොලැබේ',
    ta: 'சட்டம் 60/1998, பிரிவு 26(1) — திருமணம் < 12 மாதம், பிள்ளைகள் இல்லை: விதுரர் தகுதியற்றவர்'
  },
  post_retirement_marriage: {
    en: "Act No. 24/1983, S.25 — spouse/children from post-contribution marriage ineligible",
    si: 'පනත 24/1983, ධ.25 — දායක ගෙවීම් අවසන් වීමෙන් පසු විවාහ වූ අය සුදුකම් නොලැබේ',
    ta: 'சட்டம் 24/1983, பிரிவு 25 — பங்களிப்பு நிறுத்தத்திற்கு பின் திருமணம் செய்தோர் தகுதியற்றவர்'
  },
  remarriage_50pct_male: {
    en: "Amendment Act No. 08/2010 (replacing Ordinance No. 1/1898, S.34) — 50% on remarriage",
    si: 'සංශෝධන පනත 08/2010 (ආඥාපනත 01/1898, ධ.34 ප්‍රතිස්ථාපනය) — නැවත විවාහයේදී 50%',
    ta: 'திருத்தச் சட்டம் 08/2010 (அவசரச் சட்டம் 01/1898, பிரிவு 34 மாற்றீடு) — மறுமணத்தில் 50%'
  },
  remarriage_50pct_female: {
    en: "Amendment Act No. 09/2010 (replacing Act No. 24/1983, S.18) — 50% on remarriage",
    si: 'සංශෝධන පනත 09/2010 (පනත 24/1983, ධ.18 ප්‍රතිස්ථාපනය) — නැවත විවාහයේදී 50%',
    ta: 'திருத்தச் சட்டம் 09/2010 (சட்டம் 24/1983, பிரிவு 18 மாற்றீடு) — மறுமணத்தில் 50%'
  },
  dg_discretion_marriage: {
    en: "Act No. 18/1970, S.37; Act No. 60/1998, S.36 — DG has discretion to award pension",
    si: 'පනත 18/1970, ධ.37; පනත 60/1998, ධ.36 — DG හට විශ්‍රාමය ප්‍රදානය කිරීමේ අභිමතාධිකාරය ඇත',
    ta: 'சட்டம் 18/1970, பிரிவு 37; சட்டம் 60/1998, பிரிவு 36 — DG விருப்பப்படி ஓய்வூதியம் வழங்கலாம்'
  },
  // --- ORPHAN ---
  orphan_age_21: {
    en: "Ordinance No. 1/1898, S.29 — orphan eligible until age 21 (general)",
    si: 'ආඥාපනත 01/1898, ධ.29 — අනත්දරුවා සාමාන්‍යයෙන් වයස 21 දක්වා සුදුකම් ලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29 — அனாதை பொதுவாக 21 வயது வரை தகுதியானவர்'
  },
  orphan_age_26_unemployed: {
    en: "Pension Circular No. 13/2010, S.4.2; W&OP Circular No. 01/99 — extended to age 26 if unemployed",
    si: 'විශ්‍රාම චක්‍රලේඛ 13/2010, ධ.4.2; ව.ක්ෂේ. චක්‍රලේඛ 01/99 — රැකියා රහිත නම් වයස 26 දක්වා දිගු කෙරේ',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 13/2010, பிரிவு 4.2; வி.&அ. சுற்றறிக்கை 01/99 — வேலையில்லா நிலையில் 26 வயது வரை நீட்டிக்கப்படும்'
  },
  orphan_employment_ineligible: {
    en: "Pension Circular No. 01/99, S.5 — orphan ineligible if employed (pensionable post, provident fund, foreign employment, or taxable income)",
    si: 'විශ්‍රාම චක්‍රලේඛ 01/99, ධ.5 — රැකියාවේ යෙදී ඇත්නම් (විශ්‍රාම-ලාභ රාජ්‍ය රැකියා, අර්ථ සාධක අරමුදල්, විදේශ රැකියා, හෝ ආදායම් බදු ගෙවන) අනත්දරුවා සුදුකම් නොලැබේ',
    ta: 'ஓய்வூதியச் சுற்றறிக்கை 01/99, பிரிவு 5 — வேலையில் இருந்தால் (ஓய்வூதியப் பதவி, வருங்கால வைப்பு நிதி, வெளிநாட்டு வேலை அல்லது வரிக்குட்பட்ட வருமானம்) அனாதை தகுதியற்றவர்'
  },
  orphan_adoption: {
    en: "Ordinance No. 1/1898, S.33 (amended by Act No. 44/1981); Act No. 24/1983, S.17 — legally adopted children treated equally",
    si: 'ආඥාපනත 01/1898, ධ.33 (44/1981 ින් සංශෝධිත); පනත 24/1983, ධ.17 — නීත්‍යානුකූලව ෆිස් අනාතොල් දරුවන් සමාන ලෙස සලකනු ලැබේ',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 33 (சட்டம் 44/1981 திருத்தம்); சட்டம் 24/1983, பிரிவு 17 — சட்டரீதியாக தத்தெடுக்கப்பட்ட குழந்தைகள் சமமாக நடத்தப்படுவர்'
  },
  disabled_orphan_lifelong: {
    en: "Ordinance No. 1/1898, S.29A (inserted by Act No. 44/1981); Act No. 24/1983, S.7 — lifelong pension for permanently disabled orphans",
    si: 'ආඥාපනත 01/1898, ධ.29A (44/1981 ින් ඇතුළත් කෙරිණ); පනත 24/1983, ධ.7 — ස්ථිර ආබාධිත අනත්දරුවන් සඳහා ජීවිතකාල විශ්‍රාමය',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29A (சட்டம் 44/1981 மூலம் சேர்க்கப்பட்டது); சட்டம் 24/1983, பிரிவு 7 — நிரந்தர ஊனமுற்ற அனாதைகளுக்கு ஆயுள் ஓய்வூதியம்'
  },
  disabled_orphan_forces: {
    en: "Ordinance No. 1/1898, S.29A; Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5",
    si: 'ආඥාපනත 01/1898, ධ.29A; 2011.08.15 දිනැති අතිවිශේෂ ගැසට් 1719/3, රෙගු. 5',
    ta: 'அவசரச் சட்டம் 01/1898, பிரிவு 29A; 15 ஆகஸ்ட் 2011 அசாதாரண வர்த்தமானி எண் 1719/3, விதி 5'
  },
  disabled_orphan_ineligible: {
    en: "Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5 — disabled orphan ineligible if imprisoned, residing abroad, or engaged in anti-social conduct",
    si: '2011.08.15 දිනැති අතිවිශේෂ ගැසට් 1719/3, රෙගු. 5 — සිරගත, විදේශගත, හෝ අසාමාජික ක්‍රියාවල නිරත නම් ආබාධිත අනත්දරු විශ්‍රාමය අහෝසි',
    ta: '15 ஆகஸ்ட் 2011 அசாதாரண வர்த்தமானி எண் 1719/3, விதி 5 — சிறையில் அடைக்கப்பட்டால், வெளிநாட்டில் வசித்தால் அல்லது சமூக விரோத நடவடிக்கைகளில் ஈடுபட்டால் ஊனமுற்ற அனாதை தகுதியிழப்பு'
  },
  missing_person_waiting: {
    en: "W&O Pension Fund Ordinance No. 1/1898 — waiting period: 4 months (pensioner) / 12 months (in-service) from reference date",
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


const validateSLNIC = (nic, dobStr, gender) => {
  if (!nic || !dobStr || !gender) return { valid: false, error: "Ensure NIC, DOB, and Gender are filled to validate." };
  const oldRegex = /^[0-9]{9}[vVxX]$/;
  const newRegex = /^[0-9]{12}$/;
  if (!oldRegex.test(nic) && !newRegex.test(nic)) return { valid: false, error: "Invalid NIC Format (Requires 9 digits+V/X or 12 digits)." };

  let birthYear, dayOfYear;
  if (nic.length === 10) {
    birthYear = parseInt("19" + nic.substring(0, 2));
    dayOfYear = parseInt(nic.substring(2, 5));
  } else {
    birthYear = parseInt(nic.substring(0, 4));
    dayOfYear = parseInt(nic.substring(4, 7));
  }
  const isFemale = dayOfYear > 500;
  if (isFemale) dayOfYear -= 500;
  if (dayOfYear < 1 || dayOfYear > 366) return { valid: false, error: "Invalid days value in NIC string." };

  if ((isFemale && gender !== 'Female') || (!isFemale && gender !== 'Male')) return { valid: false, error: `NIC mismatch: Identified as ${isFemale ? 'Female' : 'Male'} but form says ${gender}.` };

  const dob = new Date(dobStr);
  if (dob.getFullYear() !== birthYear) return { valid: false, error: `NIC mismatch: NIC Year (${birthYear}) does not match DOB Year (${dob.getFullYear()}).` };

  return { valid: true };
};

const FormErrorBanner = ({ error }) => {
  if (!error) return null;
  return (
    <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 shadow-sm animate-fade-in flex items-start gap-3">
      <AlertTriangle size={24} className="shrink-0 text-red-600 mt-0.5" />
      <div>
        <h4 className="font-bold text-red-900 leading-tight mb-1">Validation Block Triggered</h4>
        <p className="text-sm opacity-90 font-medium">{error}</p>
      </div>
    </div>
  );
};


// Legal Citation Badge Component
const LegalBadge = ({ refKey, lang, className = '' }) => {
  const ref = LEGAL_REFS[refKey];
  if (!ref) return null;
  const langMap = { en: 'en', si: 'si', ta: 'ta' };
  const l = langMap[lang] || 'en';
  const citation = ref[l] || ref.en;
  return (
    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-semibold rounded ${className}`}>
      ⚖ {citation}
    </span>
  );
};

const isOver45Strict = (dobStr, targetStr) => {
  if (!dobStr || !targetStr) return false;
  const threshold = new Date(dobStr);
  threshold.setFullYear(threshold.getFullYear() + 45);
  return new Date(targetStr) > threshold;
};

// Computes exact age dynamically from DOB to NOW
const computeDynamicAge = (dobStr) => {
  if (!dobStr) return '';
  const dob = new Date(dobStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Computes exact age dynamically from DOB to a specific Target Date
const computeAgeAtDate = (dobStr, targetDateStr) => {
  if (!dobStr || !targetDateStr) return '';
  const dob = new Date(dobStr);
  const target = new Date(targetDateStr);
  let age = target.getFullYear() - dob.getFullYear();
  if (target.getMonth() < dob.getMonth() || (target.getMonth() === dob.getMonth() && target.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Returns a human-readable Y/M/D age string between two dates
const computeFullAge = (dobStr, targetDateStr) => {
  if (!dobStr || !targetDateStr) return '';
  const d1 = new Date(dobStr);
  const d2 = new Date(targetDateStr);
  if (d2 < d1) return '';
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();
  if (days < 0) { months--; const prev = new Date(d2.getFullYear(), d2.getMonth(), 0); days += prev.getDate(); }
  if (months < 0) { years--; months += 12; }
  const parts = [];
  if (years > 0) parts.push(`${years} yr${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mo`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  return parts.join(' ');
};

const validateLinearMarriages = (marriages, contributorDobStr, contributorGender, prefixKey, globalData = {}, t = (s) => s) => {
  const contributorDob = contributorDobStr ? new Date(contributorDobStr) : null;
  let errors = {};
  let rejections = [];
  let isValid = true;

  const pushError = (key, msg) => {
    errors[`${prefixKey}_${key}`] = msg;
    isValid = false;
  };
  const pushRejection = (msg) => {
    rejections.push(msg);
    isValid = false;
  };

  for (let i = 0; i < marriages.length; i++) {
    const cur = marriages[i];

    if (cur.date && contributorDob) {
      const mDate = new Date(cur.date);
      if (mDate < contributorDob) pushRejection(`Marriage ${i + 1}: Cannot logically occur before Contributor's Birth Date.`);
      else {
        const ageAtMarriage = computeAgeAtDate(contributorDobStr, cur.date);
        if (cur.date >= '1995-10-18' && ageAtMarriage !== '' && ageAtMarriage < 18) {
          pushRejection(`Marriage ${i + 1}: Statutorily ineligible due to age under 18 years at marriage.`);
        }
      }
    }

    if (globalData.endedWithLossOfPension && globalData.lossOfPensionReason === 'Other' && globalData.lossOfPensionDate && cur.date) {
      if (new Date(cur.date) > new Date(globalData.lossOfPensionDate)) {
        pushRejection(`Marriage ${i + 1}: Eligibility Denied. Marriage occurred after the Contributor's service was terminated with loss of pension.`);
      }
    }

    if (globalData.endedWithLossOfPension && globalData.lossOfPensionReason === 'Abolished Post' && cur.date && contributorDobStr) {
      const ageAtMarriage = computeAgeAtDate(contributorDobStr, cur.date);
      if (ageAtMarriage !== '' && ageAtMarriage >= 55) {
        pushRejection(`Marriage ${i + 1}: Eligibility Denied. Contributor married after reaching 55 years of age under 'Abolished Post' termination rules.`);
      }
    }

    if (cur.s_alive && cur.s_term === 'Active Legal Marriage' && cur.s_remarried && cur.s_remarriage_date) {
      if (cur.s_remarriage_date < '2010-08-17' && cur.s_remarriage_applied_50 === false) {
        pushRejection(`Marriage ${i + 1}: Eligibility Denied. The widow(er) remarried prior to 2010.08.17 but failed to statutorily apply for the 50% pension before the deadline of 2014.12.31.`);
      }
    }

    const isTerminated = ['Legally Divorced', 'Demise of Spouse', 'Void', 'Separated'].includes(cur.s_term) || cur.s_alive === false;

    if (cur.s_nic && cur.s_dob && !isTerminated) {
      const presumedSpouseGender = contributorGender === 'Male' ? 'Female' : 'Male';
      const nicCheck = validateSLNIC(cur.s_nic, cur.s_dob, presumedSpouseGender);
      if (!nicCheck.valid) {
        pushError(`${i}_s_nic`, `${nicCheck.error}`);
        pushError(`${i}_s_dob`, `Format mismatch`);
      }
    }

    if (cur.children && cur.children.length > 0) {
      for (let j = 0; j < cur.children.length; j++) {
        const child = cur.children[j];

        if (child.dob && globalData.dod) {
          const cDob = new Date(child.dob);
          const dod = new Date(globalData.dod);
          if (contributorGender === 'Female' && cDob > dod) {
            pushError(`${i}_c_${j}_dob`, t('err_child_dob_after_dod'));
          } else if (contributorGender === 'Male') {
            const maxDob = new Date(dod);
            maxDob.setDate(maxDob.getDate() + 300);
            if (cDob > maxDob) {
              pushError(`${i}_c_${j}_dob`, t('err_child_dob_after_dod_male'));
            }
          }
        }

        if (child.nicChild && child.dob && child.gender) {
          const cNICCheck = validateSLNIC(child.nicChild, child.dob, child.gender);
          if (!cNICCheck.valid) {
            pushError(`${i}_c_${j}_nic`, `${cNICCheck.error}`);
            pushError(`${i}_c_${j}_dob`, `Format mismatch`);
            pushError(`${i}_c_${j}_gender`, `Format mismatch`);
          }
        }
      }
    }
  }

  for (let i = 0; i < marriages.length - 1; i++) {
    const cur = marriages[i];
    const nxt = marriages[i + 1];

    if (!cur.date || !nxt.date) continue; // Skip if empty dates

    if (new Date(nxt.date) <= new Date(cur.date)) {
      pushRejection(`Marriage ${i + 2}: Chronologically invalid overlap against Marriage ${i + 1}.`);
    }

    if (cur.s_term === 'Legally Divorced') {
      if (!cur.s_nisi_date || !cur.s_div_date) {
        if (!cur.s_nisi_date) pushError(`${i}_s_nisi_date`, `Decree Nisi Required.`);
        if (!cur.s_div_date) pushError(`${i}_s_div_date`, `Decree Absolute Required.`);
      } else {
        const nextDate = new Date(nxt.date);
        const nisiDate = new Date(cur.s_nisi_date);
        const absDate = new Date(cur.s_div_date);

        const diffDays = Math.ceil(Math.abs(absDate - nisiDate) / (1000 * 60 * 60 * 24));
        if (absDate < nisiDate) pushRejection(`Marriage ${i + 1}: Decree Absolute cannot precede Decree Nisi.`);
        else if (diffDays < 90) pushRejection(`Marriage ${i + 1}: Decree Absolute structurally invalid. Did not fulfill the mandatory 90-day statutory interval following Decree Nisi.`);

        if (nextDate <= nisiDate) pushRejection(`Marriage ${i + 2}: Illegal Date. Occurred prior to previous marriage's Nisi declaration.`);
        else if (nextDate > nisiDate && nextDate <= absDate) pushRejection(`Marriage ${i + 2}: Illegal Date. Occurred between Nisi and Absolute formalization.`);
      }
    } else if (cur.s_term === 'Demise of Spouse' || cur.s_alive === false) {
      if (!cur.s_dod) pushError(`${i}_s_dod`, `Death Date Missing.`);
      else if (new Date(nxt.date) <= new Date(cur.s_dod)) pushRejection(`Marriage ${i + 2}: Illegal overlap. Occurred before previous Spouse's death.`);
    } else if (cur.s_term === 'Separated') {
      if (!cur.s_sep_date) pushError(`${i}_s_sep_date`, `Date of Separation is intrinsically required.`);
      pushRejection(`Marriage ${i + 2}: Previous marriage was mapped Separated. Without formal legal divorce dissolution, Bigamy structurally restricts subsequent formalization.`);
    } else if (cur.s_term === 'Void') {
      if (!cur.s_void_date || !cur.s_void_court || !cur.s_void_case) {
        if (!cur.s_void_date) pushError(`${i}_s_void_date`, `Court Order Date is intrinsically required.`);
        if (!cur.s_void_court) pushError(`${i}_s_void_court`, `Valid Court Name is natively required.`);
        if (!cur.s_void_case) pushError(`${i}_s_void_case`, `Case Number string natively required.`);
      } else {
        if (new Date(nxt.date) <= new Date(cur.s_void_date)) {
          pushRejection(`Marriage ${i + 2}: Illegal overlap. Marriage Occurred prior to the Court Order Void of previous marital tie.`);
        }
      }
    } else {
      pushRejection(`Marriage ${i + 2}: Inherently void. Previous marriage lacks formal recorded dissolution.`);
    }
  }
  return { valid: isValid, errors, rejections };
}

function App() {
  const { t, i18n } = useTranslation();
  const [userRole, setUserRole] = useState('Public'); // Roles: Public, DivSec, WorkingPlace, HeadOffice
  const [viewState, setViewState] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [checkerStep, setCheckerStep] = useState(0);
  const [printMode, setPrintMode] = useState(null); // null | 'docs' | 'info' | 'output'

  const handlePrint = (mode) => {
    setPrintMode(mode);
  };

  useEffect(() => {
    if (printMode) {
      // Wait for next frame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
          setPrintMode(null);
        });
      });
    }
  }, [printMode]);

  const [formErrors, setFormErrors] = useState({});

  const [data, setData] = useState({
    isPensioner: true, name: '', gender: 'Male', nic: '', dob: '', dod: '', dor: '',
    doa: '', cabinetDate: '', isPermanent: true, femaleConsent: '',
    isMissingPerson: false, policeComplaintDate: '', missingLocation: '', foreignMinistryDate: '', diedDueToTerrorism: false,
    memberNumber: '', registrationValid: true, contributionRecovered: true,
    lastPensionPaymentDate: '', pensionNotCommenced: false,
    endedWithLossOfPension: false, lossOfPensionDate: '', lossOfPensionReason: '',
    uncountablePeriods: [],
    reckonableYears: '', reckonableMonths: '', reckonableDays: '',
    serviceSector: 'Civil', serviceCategory: '', militaryConsentDate: '', retiredDueToTerrorism: false,
    officerNumber: '', deathCertNo: '',
    contributorMarriagesCount: 1, contributorMarriages: [],
    identicalApplicantMarriage: false, app_contributor_marriage_index: 0,
    applicantMarriagesCount: 1, applicantMarriages: [],
    a_remarried: false, a_remarriage_date: '', // REMARRIAGE LOGIC
    isEligible: true, rejectionReasons: [],
    docsAvailability: {}, affidavitProvided: false
  });

  const updateData = (field, val) => setData(prev => ({ ...prev, [field]: val }));

  const wopTitle = data.gender === 'Female' ? "Widowers' and Orphans' Pension" : "Widows' and Orphans' Pension";

  // Format dates as DD/MM/YYYY for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Provided';
    const parts = String(dateStr).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleRejection = (reasons) => {
    const fatalsObj = Array.isArray(reasons) ? reasons : [reasons];
    updateData('isEligible', false);
    updateData('rejectionReasons', fatalsObj);
    setCheckerStep(7); // Instantly transition to Final Report (Section F)
  };

  const resetApp = () => {
    setData(prev => ({ ...prev, isEligible: true, rejectionReasons: [] }));
    setViewState('auth'); setAuthMode('login'); setCheckerStep(0);
  };

  // --- RECKONABLE SERVICE AUTOMATIC CALCULATION ---
  useEffect(() => {
    if (!data.doa) return;
    let endTarget = data.dod;
    if (data.isPensioner && data.dor) endTarget = data.dor;
    else if (!data.isPensioner && data.endedWithLossOfPension && data.lossOfPensionDate) endTarget = data.lossOfPensionDate;

    if (!endTarget) return;

    let totalDays = Math.floor((new Date(endTarget) - new Date(data.doa)) / 86400000);
    if (totalDays < 0) return;

    data.uncountablePeriods.forEach(u => {
      if (u.from && u.to) {
        let uDays = Math.floor((new Date(u.to) - new Date(u.from)) / 86400000);
        if (uDays > 0) totalDays -= uDays;
      }
    });

    if (totalDays < 0) totalDays = 0;
    const yrs = Math.floor(totalDays / 365);
    const mos = Math.floor((totalDays % 365) / 30);
    const dys = totalDays - (yrs * 365) - (mos * 30);

    updateData('reckonableYears', yrs); updateData('reckonableMonths', mos); updateData('reckonableDays', dys);
  }, [data.doa, data.dor, data.dod, data.uncountablePeriods, data.isPensioner, data.lossOfPensionDate, data.endedWithLossOfPension]);

  // --- OVERPAYMENT CALCULATOR ---
  // For deceased pensioners: overpayment = months between dod and lastPensionPaymentDate
  // For missing pensioners in Sri Lanka: from policeComplaintDate
  // For missing pensioners abroad: from foreignMinistryDate (if provided) else policeComplaintDate
  const calculateOverpayment = () => {
    if (!data.lastPensionPaymentDate) return 0;
    let refDate;
    if (data.isMissingPerson) {
      refDate = (data.missingLocation === 'Abroad' && data.foreignMinistryDate)
        ? data.foreignMinistryDate
        : data.policeComplaintDate;
    } else {
      refDate = data.dod;
    }
    if (!refDate) return 0;
    const refDt = new Date(refDate);
    const lppDt = new Date(data.lastPensionPaymentDate);
    // Overpayment = pension paid after the reference event date
    const diffMonths = (lppDt.getFullYear() - refDt.getFullYear()) * 12 + (lppDt.getMonth() - refDt.getMonth());
    return diffMonths > 0 ? diffMonths : 0;
  };
  const overpaidMonths = calculateOverpayment();

  // Check if there is any marriage that is < 1 yr with NO children
  const checkDGPensionApprovalNeeded = () => {
    if (!data.dod) return false;
    const dodDt = new Date(data.dod);

    for (let m of data.contributorMarriages) {
      if (m.s_term === 'Separated') return true;
      if (!m.date) continue;
      const mDate = new Date(m.date);
      const diffTime = Math.abs(dodDt - mDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Strict 1 year = 365 days
      if (diffDays < 365) {
        if (!m.children || m.children.length === 0) {
          return true; // Requires DG Approval
        }
      }
    }
    return false;
  };

  // Extract Orphans globally
  const extractOrphans = () => {
    const orphans = [];
    const totalMarriages = data.contributorMarriages.length;
    data.contributorMarriages.forEach((m, mIndex) => {
      const isLastMarriage = mIndex === totalMarriages - 1;
      (m.children || []).forEach((child, cIndex) => {
        if (!child.dob) return;
        const childId = `${mIndex}_${cIndex}`;
        const currentAge = computeDynamicAge(child.dob);
        const unemployedStatuses = ['Unemployed', 'School Student', 'College/Univ Student', 'Informal Job'];

        // Marriage does NOT affect regular orphan eligibility (statutory rule)
        let isEligibleNormal = currentAge !== '' && currentAge < 26 && unemployedStatuses.includes(child.occ);

        let isEligibleDisabled = false;
        let isDeferred = false;
        let eligibilityText = '';

        if (isEligibleNormal) {
          eligibilityText = 'Eligible Orphan (Under 26, Unemployed)';
          eligibilityText += ' [REF:orphan_age_26_unemployed]';
          if (child.is_disabled && child.dis_before_26 && child.health_307 && child.med_board && child.med_board_date) {
            isEligibleDisabled = true;
            eligibilityText = 'Eligible Orphan (Under 26 + Valid Main Medical Board Cert)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';
          }
        } else if (child.is_disabled && child.dis_before_26 && child.health_307 && child.med_board && child.med_board_date) {
          // Lifetime Activation / Deferral logic
          // Deferral ONLY applies when the disabled child is from the LAST (current) marriage
          // and that marriage's spouse is still alive and caring. A prior-marriage disabled
          // orphan is NEVER deferred by a later marriage's spouse.
          const lastContributorMarriage = data.contributorMarriages[totalMarriages - 1];
          const spouseOfSameMarriage = isLastMarriage
            ? (lastContributorMarriage?.s_alive !== false && lastContributorMarriage?.s_term !== 'Demise of Spouse')
            : false; // prior-marriage children are never deferred by a different spouse
          const widowRemarried = data.a_remarried === true;
          const abandonedCare = data.orphan_care && data.orphan_care[childId] === false;

          if (spouseOfSameMarriage && !widowRemarried && !abandonedCare) {
            // Deferred — include in list so card shows, but NOT as an active pensioner
            isDeferred = true;
            eligibilityText = 'Disabled Pension Deferred (Active primary spouse maintains care capability)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';
          } else {
            isEligibleDisabled = true;
            eligibilityText = 'Lifetime Disabled Pension Activated (Valid Medical Board Cert + Priority Care Nullified)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';
          }
        }

        // Include in list if: normal eligible, OR disabled active, OR disabled deferred (for UI card)
        if (isEligibleNormal || isEligibleDisabled || isDeferred) {
          orphans.push({ ...child, marriageIndex: mIndex + 1, isEligibleDisabled, isDeferred, eligibilityText, childId });
        }
      });
    });
    return orphans;
  };

  // --- DYNAMIC DOCUMENT REQUIREMENTS ENGINE ---
  const computeRequiredDocs = () => {
    const docs = [];
    const contributorPrefix = `Contributor (${data.name || 'Unnamed'})`;

    // Base Contributor Docs
    docs.push({ id: 'c_bc', label: `${contributorPrefix} Birth Certificate [Original certified by Additional/District Registrar]`, required: true });
    docs.push({ id: 'c_nic', label: `${contributorPrefix} NIC/SLNIC [Certified Copy]`, required: true });
    if (data.isMissingPerson) {
      if (data.missingLocation === 'Sri Lanka') {
        docs.push({ id: 'c_police_complaint', label: `${contributorPrefix} Certified Copy of Police Complaint (from the relevant Police Station) regarding the disappearance`, required: true });
      } else if (data.missingLocation === 'Abroad') {
        docs.push({ id: 'c_consular_letter', label: `${contributorPrefix} Confirmation Letter from the Consular Division, Ministry of Foreign Affairs (Sri Lanka) confirming the disappearance`, required: true });
      }
    } else {
      docs.push({ id: 'c_dc', label: `${contributorPrefix} Death Certificate [Original certified by Additional/District Registrar]`, required: true });
    }
    docs.push({ id: 'c_apt', label: `${contributorPrefix} Appointment Letter (From Civil Pension File)`, required: true });

    if (data.isPensioner) {
      docs.push({ id: 'c_pen_award', label: `${contributorPrefix} Award of Pension (From Civil Pension File)`, required: true });
      docs.push({ id: 'c_pen_pay', label: `${contributorPrefix} Last Pension Payment Date Proof (From Pension Payment Database / Civil Pension File)`, required: true });
    }
    if (data.gender === 'Female' && data.doa < '1983-08-01') {
      docs.push({ id: 'c_female_cons', label: `${contributorPrefix} Consent to contribute to W&OP while in Service (Consent Letter/Proof Document)`, required: true });
    }
    if (isOver45Strict(data.dob, data.doa)) {
      docs.push({ id: 'c_cab_app', label: `${contributorPrefix} Cabinet/Special Approval Letter for Age > 45`, required: true });
    }
    if (data.registrationValid) {
      docs.push({ id: 'c_wop_card', label: `${contributorPrefix} W&OP Membership Card / Award of Pension detailing Member Number`, required: true });
    }

    const processMarriage = (m, mIdx, prefixTitle) => {
      if (!m) return;
      const prefix = `${prefixTitle} ${mIdx + 1}`;

      if (m.date || m.cert) docs.push({ id: `mc_${prefixTitle}_${mIdx}`, label: `${prefix}: Marriage Certificate [Original certified by Additional/District Registrar]`, required: true });

      if (m.s_name || m.s_nic) {
        docs.push({ id: `sp_nic_${prefixTitle}_${mIdx}`, label: `${prefix} Spouse (${m.s_name || 'Unnamed'}) NIC/SLNIC [Certified Copy]`, required: true });

        const bcRequired = prefixTitle !== "Applicant's Prior Marriage" && (mIdx === data.contributorMarriages.length - 1);
        docs.push({ id: `sp_bc_${prefixTitle}_${mIdx}`, label: `${prefix} Spouse (${m.s_name || 'Unnamed'}) Birth Certificate ${!bcRequired ? '(If Available / Conditional)' : '[Original certified by Additional/District Registrar]'}`, required: bcRequired });

        if (m.s_gov_emp || m.s_pen_own) {
          docs.push({ id: `sp_dec_${prefixTitle}_${mIdx}`, label: `${prefix} Spouse's Pension/Employment Declaration`, required: true });
        }
      }

      if (m.s_term === 'Legally Divorced') {
        docs.push({ id: `div_nisi_${prefixTitle}_${mIdx}`, label: `${prefix} Decree Nisi (Conditional Order) of the Divorce [Certified copy from Court]`, required: true });
        docs.push({ id: `div_abs_${prefixTitle}_${mIdx}`, label: `${prefix} Absolute Order (Final Order) of the Divorce [Certified copy from Court]`, required: true });
      }

      if (m.children && m.children.length > 0) {
        m.children.forEach((child, cIdx) => {
          if (child.name || child.dob) {
            docs.push({ id: `cld_bc_${prefixTitle}_${mIdx}_${cIdx}`, label: `${prefix} Child ${cIdx + 1} (${child.name || 'Unnamed'}) Birth Certificate [Original certified by Additional/District Registrar]`, required: true });
            const cAge = computeDynamicAge(child.dob);
            if (cAge !== '' && cAge >= 16) {
              docs.push({ id: `cld_nic_${prefixTitle}_${mIdx}_${cIdx}`, label: `${prefix} Child ${cIdx + 1} (${child.name || 'Unnamed'}) NIC/SLNIC [Certified Copy]`, required: true });
            }
          }
        });
      }
    };

    data.contributorMarriages.forEach((m, idx) => processMarriage(m, idx, 'Marriage'));

    if (!data.identicalApplicantMarriage) {
      data.applicantMarriages.forEach((m, idx) => {
        // Exclude processing if it's the 1st marriage and they only have 1 (since it's implicitly mapped to the Contributor's last)
        // But actually, we only check this if they explicitly gave us prior applicant histories
        if (data.applicantMarriagesCount === 1) return;
        processMarriage(m, idx, "Applicant's Prior Marriage");
      });
    }

    // GUARDIANSHIP AND DISABILITY SWEEP
    let needsGuardian = false;
    let hasDisabledOrphan = false;

    const orphansForDocs = extractOrphans();
    orphansForDocs.forEach(o => {
      const oAge = computeDynamicAge(o.dob);
      if ((oAge !== '' && oAge < 18) || o.is_disabled || o.isEligibleDisabled) needsGuardian = true;
      if (o.is_disabled || o.isEligibleDisabled) hasDisabledOrphan = true;
    });

    if (needsGuardian) {
      docs.push({ id: 'guard_gn', label: 'Guardianship Protocol: Grama Niladhari Verification Report for Guardian Appointment', required: true });
      docs.push({ id: 'guard_cons', label: 'Guardianship Protocol: Consent Letter of Guardian & Relationship Proofs (or Approved Orphanage Agreement)', required: true });
      docs.push({ id: 'guard_agree', label: 'Guardianship Protocol: Divisional Secretary (on behalf of Director General of Pensions) Formal Handover Agreement. It subsequently warns that exact banking routes will be forcibly remapped to the Guardian\'s jurisdiction.', required: true });
    }
    if (hasDisabledOrphan) {
      docs.push({ id: 'guard_hlt307', label: 'Disabled Orphan Protocol: Initial Medical Report Health 307 from Government Hospital', required: true });
      docs.push({ id: 'doc_gn_disabled_report', label: t('doc_gn_disabled_report'), required: true });
    }

    docs.push({ id: 'doc_bank_account', label: t('doc_bank_account'), required: true });
    docs.push({ id: 'doc_gn_residency', label: t('doc_gn_residency'), required: true });

    if (data.contributorMarriages.length > 1) {
      docs.push({ id: 'doc_widow_7', label: t('doc_widow_7'), required: true });
    }

    return docs;
  };

      const AuthView = () => (
    <div className="animate-fade-in glass-panel p-8 lg:p-12 w-full max-w-7xl mx-auto my-8 lg:my-16" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left Side Description */}
        <div className="w-full lg:w-1/2 text-left">
          <div className="inline-flex justify-center items-center p-4 bg-indigo-50 rounded-full mb-6" style={{boxShadow: '0 0 20px rgba(2, 132, 199, 0.15)'}}>
            <ShieldCheck size={56} className="text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>
          <p className="text-xl text-primary font-bold mb-6">{t('app_subtitle')}</p>
          <p className="text-base text-gray-700 leading-relaxed font-medium">
            Welcome to the Widows’ and Orphans’ Pensions (W&OP) Eligibility Checker, an intuitive and user-friendly digital platform designed to help public sector employees and their families seamlessly determine their qualification for survivor benefits. By entering a few key details regarding service history and familial status, this tool securely evaluates your information against official regulatory guidelines to provide instant, clear guidance on your status. Streamlining what was once a complex manual process, this interactive checker ensures transparent, accurate, and accessible information, empowering you to navigate your pension benefits with absolute confidence.
          </p>
        </div>

        {/* Right Side Roles & Login */}
        <div className="w-full lg:w-1/2">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>{t('select_role')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`role-card ${userRole === 'Public' ? 'active' : ''}`} onClick={() => setUserRole('Public')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><UserCircle2 size={20} /></div>
                  <div className="role-title text-base">{t('role_public')}</div>
                </div>
              </div>
              <div className={`role-card ${userRole === 'WorkingPlace' ? 'active' : ''}`} onClick={() => setUserRole('WorkingPlace')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Activity size={20} /></div>
                  <div className="role-title text-base">{t('role_workplace')}</div>
                </div>
              </div>
              <div className={`role-card ${userRole === 'DivSec' ? 'active' : ''}`} onClick={() => setUserRole('DivSec')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><PieChart size={20} /></div>
                  <div className="role-title text-base">{t('role_divsec')}</div>
                </div>
              </div>
              <div className={`role-card ${userRole === 'HeadOffice' ? 'active' : ''}`} onClick={() => setUserRole('HeadOffice')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Shield size={20} /></div>
                  <div className="role-title text-base">{t('role_headoffice')}</div>
                </div>
              </div>
            </div>
          </div>

          {authMode === 'login' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden" style={{boxShadow: '0 10px 25px rgba(0,0,0,0.08)'}}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              
              {userRole === 'Public' ? (
                <div className="py-2">
                  <h3 className="font-extrabold text-2xl mb-3 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>General Public Access</h3>
                  <p className="text-sm text-muted font-medium mb-8">You are accessing the portal as a member of the General Public. No formal authentication is required for basic eligibility checking.</p>
                  
                  <button className="btn w-full py-4 text-lg shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={24}/></button>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-center text-gray-500 font-medium">
                    Note: Formal application submissions still require physical document verification at your relevant Divisional Secretariat or Last Working Place.
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-extrabold text-2xl mb-6 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>Authenticate Identity</h3>
                  
                  <div className="form-row mb-5">
                    <label className="label font-bold text-gray-700 mb-2">Verification ID / Username</label>
                    <input type="text" className="form-input bg-white" defaultValue="Admin-Sys" />
                  </div>
                  
                  <div className="form-row mb-5">
                    <label className="label font-bold text-gray-700 mb-2">Secure Password</label>
                    <input type="password" className="form-input bg-white" defaultValue="password" />
                  </div>

                  <div className="form-row mb-6 mt-2">
                    <label className="label font-bold text-gray-700 mb-2">Institution Verification Hash</label>
                    <input type="text" className="form-input bg-white" placeholder="Institution Reg No. / Code" />
                  </div>

                  <button className="btn w-full py-3 text-lg mt-2 shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={20}/></button>
                  
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 text-sm font-semibold text-primary">
                    <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('register')}>Request Access</span>
                    <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('forgot')}>Forgot Credentials?</span>
                  </div>
                </>
              )}
            </div>
          )}

          {authMode === 'register' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Request Access</h3>
              <p className="text-sm text-muted font-medium mb-6">Official government agency request form. Validation takes 2-3 business days.</p>
              <div className="form-row mb-6"><label className="label font-bold mb-2">Official Email</label><input type="email" className="form-input bg-white" placeholder="name@gov.lk" /></div>
              <button className="btn w-full" onClick={() => setAuthMode('login')}>Submit Request</button>
              <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Reset Credentials</h3>
              <p className="text-sm text-muted font-medium mb-6">A secure reset link will be dispatched to your registered institutional email.</p>
              <div className="form-row mb-6"><label className="label font-bold mb-2">Verification ID / Official Email</label><input type="text" className="form-input bg-white" /></div>
              <button className="btn w-full" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
              <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SectionF_DisabledOps = () => {
    const validOrphans = extractOrphans();
    const disabledOrphans = validOrphans.filter(o => o.isEligibleDisabled);

    if (disabledOrphans.length === 0) {
      return (
        <div className="animate-fade-in text-center p-8 bg-surface-alt rounded border border-subtle">
          <h2 className="text-xl font-bold text-primary mb-2">{t('section_f_disabled_title')}</h2>
          <p className="text-sm text-muted font-bold mb-6">{t('msg_no_disabled_orphans')}</p>
          <div className="button-group justify-center border-none mt-0 pt-4">
            <button className="btn btn-secondary" onClick={() => setCheckerStep(4)}><ChevronLeft size={20} /> {t('btn_back')}</button>
            <button className="btn" onClick={() => { setFormErrors({}); setCheckerStep(6); }}>{t('btn_proceed_docs')} <ChevronRight size={20} /></button>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        <div className="tag">{t('section_f_disabled_eval_title')}</div>
        <h2 className="text-2xl font-bold mb-4">{t('lbl_disabled_eval')}</h2>
        <p className="text-sm font-bold text-muted mb-6">{t('msg_disabled_statutory_mandates')}</p>

        {disabledOrphans.map(o => (
          <div key={o.childId} className="bg-[#ffffff] p-6 rounded border border-subtle mb-4 shadow-sm animate-fade-in">
            <h3 className="font-bold text-primary text-lg border-b border-subtle pb-2 mb-4">{o.name || t('lbl_unnamed_dependent')} <span className="text-xs font-normal text-muted">({t('lbl_marriage_idx')} {o.marriageIndex})</span></h3>

            <div className="flex flex-col gap-3">
              <label className="font-bold text-sm text-[#334155]">{t('lbl_disabled_possess_income')}</label>
              <div className="flex gap-4">
                <label className="cursor-pointer"><input type="radio" checked={(data.orphan_finances || {})[o.childId]?.hasAssets === true} onChange={() => {
                  const cur = data.orphan_finances || {};
                  updateData('orphan_finances', { ...cur, [o.childId]: { ...cur[o.childId], hasAssets: true } });
                }} /> {t('opt_yes')}</label>
                <label className="cursor-pointer"><input type="radio" checked={(data.orphan_finances || {})[o.childId]?.hasAssets === false} onChange={() => {
                  const cur = data.orphan_finances || {};
                  updateData('orphan_finances', { ...cur, [o.childId]: { ...cur[o.childId], hasAssets: false } });
                }} /> {t('msg_no')}</label>
              </div>

              {(data.orphan_finances || {})[o.childId]?.hasAssets && (
                <div className="mt-4 p-4 border border-amber bg-amber-light rounded animate-fade-in">
                  <label className="label font-bold text-amber">{t('lbl_provide_absolute_details')}</label>
                  <textarea className="form-input w-full mt-2 min-h-24 border-amber focus:border-amber" value={(data.orphan_finances || {})[o.childId]?.details || ''} onChange={(e) => {
                    const cur = data.orphan_finances || {};
                    updateData('orphan_finances', { ...cur, [o.childId]: { ...cur[o.childId], details: e.target.value } });
                  }} placeholder={t('ph_list_specific_assets')} />
                  <p className="text-amber text-xs font-bold mt-2">{t('msg_warning_independent_assets')}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="button-group mt-6 pt-6 border-t border-subtle">
          <button className="btn btn-secondary" onClick={() => setCheckerStep(4)}><ChevronLeft size={20} /> {t('btn_back')}</button>
          <button className="btn" onClick={() => {
            // Validation logic
            const fins = data.orphan_finances || {};
            let missingDetails = false;
            disabledOrphans.forEach(o => {
              if (fins[o.childId]?.hasAssets && (!fins[o.childId]?.details || fins[o.childId]?.details.trim() === '')) {
                missingDetails = true;
              }
            });
            if (missingDetails) {
              setFormErrors({ global: t('err_financial_dec_required') });
              return;
            }
            setFormErrors({});
            setCheckerStep(6);
          }}>{t('btn_proceed_docs')} <ChevronRight size={20} /></button>
        </div>
      </div>
    );
  };

  const Section_Docs = () => {
    const requiredDocs = computeRequiredDocs();

    return (
      <div className="animate-fade-in">
        <div className="tag">{t('section_docs_title')}</div>
        <h2 className="text-2xl font-bold mb-4">{t('lbl_mandatory_docs')}</h2>
        <p className="text-muted text-sm mb-6">{t('msg_docs_desc')}</p>

        <div className="bg-[#ffffff] border border-subtle rounded p-6 shadow-sm mb-6">
          <h3 className="font-bold text-primary mb-4 border-b border-subtle pb-2">{t('lbl_dynamic_docs')}</h3>
          <div className="space-y-3">
            {requiredDocs.map(doc => (
              <label key={doc.id} className="flex gap-3 items-center p-3 border border-subtle rounded cursor-pointer hover:bg-surface-alt transition-colors">
                <input type="checkbox" className="min-w-[20px] min-h-[20px]" checked={!!data.docsAvailability[doc.id]} onChange={e => {
                  updateData('docsAvailability', { ...data.docsAvailability, [doc.id]: e.target.checked })
                }} />
                <span className="font-bold text-[#334155]">{doc.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-subtle rounded p-6 shadow-sm mb-6">
          <h3 className="font-bold text-primary mb-2">{t('lbl_discrepancy_affidavits')}</h3>
          <p className="text-sm text-muted mb-4">{t('msg_discrepancy_desc')}</p>
          <label className="flex gap-3 items-center p-4 border border-primary bg-sky-50 rounded cursor-pointer transition-colors">
            <input type="checkbox" className="min-w-[20px] min-h-[20px]" checked={data.affidavitProvided} onChange={e => {
              updateData('affidavitProvided', e.target.checked);
            }} />
            <span className="font-bold text-primary">{t('lbl_affidavit_provided')}</span>
          </label>
        </div>

        <div className="button-group mt-0 pt-0">
          <button className="btn btn-secondary" onClick={() => setCheckerStep(5)}><ChevronLeft size={20} /> {t('btn_back')}</button>
          <button className="btn" style={{ background: "var(--success)" }} onClick={() => setCheckerStep(7)}>{t('btn_calc_final_eligibility')} <ChevronRight size={20} /></button>
        </div>
      </div>
    );
  };

  const SectionF = () => {
    try {
      // Structural Rejection Report Generation
      if (!data.isEligible && data.rejectionReasons.length > 0) {
        return (
          <div className="animate-fade-in text-center py-8 px-6 bg-surface-alt border border-error rounded-xl shadow-lg">
            <XCircle size={64} className="text-error mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-error mb-2">{t('section_f_ineligibility_title')}</h2>
            <p className="text-muted text-lg mb-8">{t('msg_ineligibility_desc')}</p>

            <div className="bg-[#ffffff] p-6 rounded border border-error text-left max-w-lg mx-auto">
              <h3 className="font-bold text-lg border-b border-subtle pb-2 mb-4 text-error">{t('lbl_failure_identifiers')}</h3>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-[#991b1b] font-bold">
                {data.rejectionReasons.map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
              <div className="mt-6 pt-4 border-t border-subtle text-sm text-muted">
                <p>{t('lbl_contributor')}: {data.name || t('msg_not_captured')}</p>
                <p>{t('lbl_nic')}: {data.nic || t('msg_not_captured')}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted font-bold">{t('msg_rejection_trigger_info')}</p>
            <button className="btn mt-4 bg-surface-alt text-primary border-primary hover:bg-gray-100 mr-4" onClick={() => { updateData('isEligible', true); setCheckerStep(0); }}>{t('btn_back_correct_inputs')}</button>
            <button className="btn mt-8" style={{ background: 'var(--error)' }} onClick={() => resetApp()}>{t('btn_acknowledge_exit')}</button>
            <button className="btn mt-8 ml-4" style={{ background: '#334155', color: '#fff' }} onClick={() => handlePrint('rejection')}>{t('btn_print_rejection_report')}</button>
          </div>
        );
      }

      // Structural Eligible Report Generation
      const applicantSpouseRecord = data.contributorMarriages[data.contributorMarriages.length - 1];

      const orphansList = extractOrphans();

      // Pension Division Logic
      const applicantMarriageIndex = data.contributorMarriages.length; // Assume Final Lawful Applicant

      // --- STATUTORY CONDITION FLAGS ---
      const activeSpouseDemised = applicantSpouseRecord?.s_alive === false || applicantSpouseRecord?.s_term === 'Ended: Demise of Spouse';
      const activeSpouseRemarried = data.a_remarried === true || applicantSpouseRecord?.s_remarried === true;
      // Exclude deferred orphans from pension distribution counts — they are not active pensioners
      const activeOrphansList = orphansList.filter(o => !o.isDeferred);
      const biologicalOrphans = activeOrphansList.filter(o => o.marriageIndex === applicantMarriageIndex);
      const abandonedBiologicalOrphans = biologicalOrphans.some(o => data.orphan_care && data.orphan_care[o.childId] === false);

      const priorOrphans = activeOrphansList.filter(o => o.marriageIndex !== applicantMarriageIndex);
      const hasPriorOrphans = priorOrphans.length > 0;
      const hasAnyOrphans = activeOrphansList.length > 0;

      // --- STATUTORY DISTRIBUTION MATRIX ---
      // The spouse loses primary beneficiary status when deceased, remarried, or abandoned orphans
      const spouseLostPrimary = activeSpouseDemised || activeSpouseRemarried || abandonedBiologicalOrphans;

      // Which orphans appear in the beneficiary report?
      // When spouse is active (alive + not remarried + not abandoned): ONLY prior marriage orphans appear
      // When spouse loses primary: ALL active orphans from ALL marriages appear
      const ActiveOrphansToDisplay = spouseLostPrimary ? activeOrphansList : priorOrphans;

      // SCENARIO A: Spouse deceased, no orphans → 0% (no beneficiary)
      // SCENARIO B: Spouse deceased, orphans exist → 100% to orphans, no reversion
      // SCENARIO C: Spouse remarried, orphans exist → 100% to orphans, reversion at 50% when orphans expire
      // SCENARIO D: Spouse remarried, NO orphans → 50% to remarried spouse
      // SCENARIO E: Spouse abandoned orphans → 100% to orphans, reversion at 100% when orphans expire
      // SCENARIO F: Spouse alive, not remarried, prior orphans → 50% spouse + 50% prior orphans
      // SCENARIO G: Spouse alive, not remarried, no prior orphans → 100% to spouse

      // Should the spouse row appear in the beneficiary table?
      const showSpouseInTable = !spouseLostPrimary || (activeSpouseRemarried && !hasAnyOrphans);
      // Remarriage legal ref key depends on contributor gender
      const remarriageLegalRef = data.gender === 'Female' ? 'remarriage_50pct_male' : 'remarriage_50pct_female';
      // What share does the spouse get?
      const spouseShare = (() => {
        if (activeSpouseDemised) return 0; // deceased gets nothing
        if (activeSpouseRemarried && hasAnyOrphans) return 0; // orphans take priority
        if (activeSpouseRemarried && !hasAnyOrphans) return 50; // remarriage penalty, no orphans to redirect to
        if (abandonedBiologicalOrphans && hasAnyOrphans) return 0; // orphans take priority
        if (hasPriorOrphans) return 50; // 50/50 split with prior orphans
        return 100; // full entitlement
      })();
      // What pool do orphans share from?
      const orphanPool = (() => {
        if (spouseLostPrimary && hasAnyOrphans) return 100; // all goes to orphans
        if (hasPriorOrphans) return 50; // 50/50 split
        return 0; // no orphan pool
      })();
      // What type of distribution is this?
      const distScenario = (() => {
        if (activeSpouseDemised && !hasAnyOrphans) return 'NO_BENEFICIARY';
        if (activeSpouseDemised && hasAnyOrphans) return 'ORPHANS_100_NO_REVERT';
        if (activeSpouseRemarried && hasAnyOrphans) return 'ORPHANS_100_REVERT_50';
        if (activeSpouseRemarried && !hasAnyOrphans) return 'REMARRIED_SPOUSE_50';
        if (abandonedBiologicalOrphans && hasAnyOrphans) return 'ORPHANS_100_REVERT_100';
        if (hasPriorOrphans) return 'SPLIT_50_50';
        return 'SPOUSE_100';
      })();

      const requiredDocs = computeRequiredDocs();
      const missingDocs = requiredDocs.filter(d => !data.docsAvailability[d.id]);

      // DG Pension Approval Verification Logic
      let requiresDGApproval = false;
      let dgApprovalReasons = [];

      if (data.isMissingPerson) {
        requiresDGApproval = true;
        dgApprovalReasons.push(t('msg_dg_approval_missing_person'));
      }

      // Use unified day-based DG check (avoids year-rounding errors with computeAgeAtDate)
      for (let i = 0; i < data.contributorMarriages.length; i++) {
        const m = data.contributorMarriages[i];
        if (m.date && data.dod && !data.isMissingPerson) {
          const mDate = new Date(m.date);
          const dodDate = new Date(data.dod);
          const diffDays = Math.ceil(Math.abs(dodDate - mDate) / (1000 * 60 * 60 * 24));
          if (diffDays < 365 && (!m.children || m.children.length === 0)) {
            requiresDGApproval = true;
            dgApprovalReasons.push(t('msg_dg_approval_marriage_duration').replace('{index}', i + 1));
          }
        }
      }

      // Add DG approval reason if a disabled orphan is married (livelihood capacity concern)
      orphansList.filter(o => o.isEligibleDisabled && o.is_married).forEach(o => {
        requiresDGApproval = true;
        dgApprovalReasons.push(`Disabled Orphan ${o.name || o.childId}: Married — Livelihood capacity must be independently assessed by the Director General.`);
      });

      // Orphan with independent financial assets
      Object.keys(data.orphan_finances || {}).forEach(k => {
        if (data.orphan_finances[k]?.hasAssets) {
          requiresDGApproval = true;
          dgApprovalReasons.push(t('msg_dg_approval_financial_alert').replace('{id}', k));
        }
      });

      // Role-Based Authorization Bounds
      let finalActionText = t('btn_finish_return_dashboard');
      let authWarning = null;
      let submitAllowed = true;
      let deathGratuityWarning = null;

      if (!data.isPensioner && !data.isMissingPerson && data.isPermanent === true) {
        if (data.reckonableYears >= 5) {
          deathGratuityWarning = t('msg_death_gratuity_warning_gt5');
        } else {
          deathGratuityWarning = t('msg_death_gratuity_warning_lt5');
        }
      }

      if (userRole === 'Public') {
        authWarning = { type: 'info', msg: t('msg_auth_warning_public') };
        submitAllowed = false;
      } else if (userRole === 'DivSec' && !data.isPensioner) {
        authWarning = { type: 'error', msg: t('msg_auth_warning_divsec_not_pensioner') };
        submitAllowed = false;
      } else if (userRole === 'WorkingPlace' && data.isPensioner && !data.pensionNotCommenced) {
        authWarning = { type: 'error', msg: t('msg_auth_warning_workingplace_pensioner') };
        submitAllowed = false;
      } else if (data.isPensioner && data.pensionNotCommenced) {
        if (userRole === 'DivSec') {
          authWarning = { type: 'error', msg: t('msg_auth_warning_divsec_pension_not_commenced') };
          submitAllowed = false;
        } else if (userRole === 'WorkingPlace') {
          authWarning = { type: 'info', msg: t('msg_auth_warning_workingplace_pension_not_commenced') };
        }
      } else if (userRole === 'HeadOffice') {
        authWarning = { type: 'success', msg: t('msg_auth_warning_headoffice') };
        finalActionText = t('btn_authorize_internal_application');
      } else {
        finalActionText = t('btn_formally_submit_application');
      }

      return (
        <>
          <div className={`animate-fade-in py-8 px-6 bg-surface-alt border border-success rounded-xl shadow-lg ${printMode && printMode !== 'output' ? 'print-hide' : ''}`}>
            <div className={`text-center mb-6 ${printMode === 'output' ? 'print-hide' : ''}`}>
            <CheckCircle size={64} className="text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-success mb-2">{t('section_f_eligibility_title').replace('{wopTitle}', wopTitle)}</h2>
            <p className="text-muted text-lg">{t('msg_validations_completed')}</p>
          </div>

          <div className="bg-[#ffffff] p-6 rounded border border-subtle mx-auto w-full">

            {deathGratuityWarning && (
              <div className="mb-6 p-4 border border-blue-500 bg-blue-50 rounded animate-fade-in shadow-sm print-hide">
                <h3 className="text-blue-800 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={20} /> {t('lbl_active_service_routing')}</h3>
                <p className="text-sm font-bold text-blue-900">{deathGratuityWarning}</p>
              </div>
            )}

            {/* Payload Distribution Matrix */}
            <div className="mb-6 border border-subtle rounded overflow-hidden shadow-sm animate-fade-in">
              <div className="bg-surface-alt p-3 border-b border-subtle">
                <h3 className="font-bold text-primary flex items-center gap-2"><PieChart size={18} /> {t('lbl_payload_matrix')}</h3>
              </div>
              <div className="p-4 bg-[#ffffff]">
                {distScenario === 'NO_BENEFICIARY' && (
                  <div className="flex justify-between items-center p-3 border border-error rounded bg-red-50 mb-2">
                    <div>
                      <h4 className="font-bold text-error">{t('msg_0_allocation')}</h4>
                      <p className="text-xs text-muted font-bold mt-1">{t('msg_no_eligible_desc')}</p>
                    </div>
                    <div className="text-2xl font-black text-error">0%</div>
                  </div>
                )}
                {(distScenario === 'ORPHANS_100_NO_REVERT' || distScenario === 'ORPHANS_100_REVERT_50' || distScenario === 'ORPHANS_100_REVERT_100') && (
                  <div className="flex justify-between items-center p-3 border border-subtle rounded bg-green-50 mb-2">
                    <div>
                      <h4 className="font-bold text-success">{t('msg_100_allocation')} {ActiveOrphansToDisplay.length === 1 ? t('msg_sole_orphan') : t('msg_eligible_orphans')}</h4>
                      <p className="text-xs text-muted font-bold mt-1">{activeSpouseDemised ? t('msg_primary_deceased') : activeSpouseRemarried ? t('msg_primary_remarried') : t('msg_primary_abandoned')} {ActiveOrphansToDisplay.length === 1 ? t('msg_total_routes_sole') : `${t('msg_total_routes_multiple')} (${(100 / ActiveOrphansToDisplay.length).toFixed(1)}% ${t('msg_each', 'each')}).`}</p>
                      {distScenario === 'ORPHANS_100_REVERT_50' && <p className="text-xs text-success font-bold mt-1">{t('msg_note_revert_50')}</p>}
                      {distScenario === 'ORPHANS_100_REVERT_100' && <p className="text-xs text-success font-bold mt-1">{t('msg_note_revert_100')}</p>}
                    </div>
                    <div className="text-2xl font-black text-success">100%</div>
                  </div>
                )}
                {distScenario === 'REMARRIED_SPOUSE_50' && (
                  <div className="flex justify-between items-center p-3 border border-amber rounded bg-amber-light mb-2">
                    <div>
                      <h4 className="font-bold text-amber">{t('msg_50_allocation_remarried')}</h4>
                      <p className="text-xs text-muted font-bold mt-1">{t('msg_remarried_desc')}</p>
                    </div>
                    <div className="text-2xl font-black text-amber">50%</div>
                  </div>
                )}
                {distScenario === 'SPLIT_50_50' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border border-subtle rounded bg-blue-50">
                      <div>
                        <h4 className="font-bold text-blue-800">{t('msg_50_allocation_spouse')}</h4>
                        <p className="text-xs text-muted font-bold mt-1">{t('msg_spouse_50_desc')}</p>
                      </div>
                      <div className="text-xl font-black text-blue-800">50%</div>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-subtle rounded bg-indigo-50">
                      <div>
                        <h4 className="font-bold text-indigo-800">{t('msg_50_allocation_prior_orphans')}</h4>
                        <p className="text-xs text-muted font-bold mt-1">{t('msg_prior_orphans_desc')}</p>
                      </div>
                      <div className="text-xl font-black text-indigo-800">50%</div>
                    </div>
                  </div>
                )}
                {distScenario === 'SPOUSE_100' && (
                  <div className="flex justify-between items-center p-3 border border-subtle rounded bg-blue-50 mb-2">
                    <div>
                      <h4 className="font-bold text-blue-800">{t('msg_100_allocation_spouse')}</h4>
                      <p className="text-xs text-muted font-bold mt-1">{t('msg_spouse_100_desc')}</p>
                    </div>
                    <div className="text-2xl font-black text-blue-800">100%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Disabled orphan cards — active AND deferred */}
            {orphansList.filter(o => o.isEligibleDisabled || o.isDeferred).map(o => {
              const isDeferred = o.isDeferred;
              // Temporary hold: disabled orphan age >=26, other active orphans still under 26
              const disabledOrphanAge = computeDynamicAge(o.dob);
              const hasMultipleOrphans = !isDeferred && disabledOrphanAge >= 26 && activeOrphansList.some(other => other.childId !== o.childId && computeDynamicAge(other.dob) < 26);
              return (
              <div key={o.childId} className="mb-6 p-4 border border-indigo-200 bg-indigo-50 rounded animate-fade-in shadow-sm">
                <h3 className="text-indigo-800 font-bold flex items-center gap-2 mb-2"><Activity size={20} /> {t('lbl_disabled_pension_auth')} {o.name || t('lbl_unnamed_dependent')}</h3>
                <p className="text-sm font-bold text-indigo-900" style={{whiteSpace: 'pre-line'}}>
                  {isDeferred ? t('msg_disabled_deferred').replace('{date}', o.med_board_date || 'Pending') : t('msg_disabled_commencement').replace('{date}', o.med_board_date || 'Pending')}
                </p>
                {hasMultipleOrphans && (
                  <div className="mt-4 p-3 bg-white border border-indigo-200 rounded shadow-sm">
                    <h4 className="font-bold text-indigo-900 text-sm mb-1">{t('lbl_temporary_hold_rule')}</h4>
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">{t('msg_temporary_hold_desc')}</p>
                  </div>
                )}
              </div>
            )})}

            {requiresDGApproval && (
              <div className="mb-6 p-4 border border-amber bg-amber-light rounded animate-fade-in shadow-sm">
                <h3 className="text-amber font-bold flex items-center gap-2 mb-2"><AlertTriangle size={20} /> {t('lbl_dg_approval_req')}</h3>
                <p className="text-sm font-bold text-amber">{t('msg_dg_approval_conditions')}</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm font-bold text-[#b45309]">
                  {dgApprovalReasons.map((r, idx) => <li key={idx}>{r}</li>)}
                </ul>
              </div>
            )}

            {missingDocs.length > 0 && (
              <div className="mb-6 p-4 border border-amber bg-amber-light rounded">
                <h3 className="text-amber font-bold flex items-center gap-2 mb-2"><AlertTriangle size={20} /> {t('lbl_missing_docs_alert')}</h3>
                <p className="text-sm font-bold text-amber">{t('msg_missing_docs_desc')}</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm font-bold text-[#b45309]">
                  {missingDocs.map(d => <li key={d.id}>{d.label}</li>)}
                </ul>
                {data.affidavitProvided && <p className="text-sm font-bold text-primary mt-3 flex items-center gap-1"><CheckCircle size={16} /> {t('msg_affidavit_supplied')}</p>}
              </div>
            )}

            {authWarning && (
              <div className={`mb-6 p-4 border rounded font-bold text-sm ${authWarning.type === 'error' ? 'border-error bg-red-50 text-error' : authWarning.type === 'info' ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-success bg-green-50 text-success'}`}>
                <div className="flex items-start gap-2">
                  <Shield size={20} className="mt-0.5 shrink-0" />
                  <p>{authWarning.msg}</p>
                </div>
              </div>
            )}

            {overpaidMonths > 0 && (
              <div className="mb-6 p-4 border-2 border-error bg-red-50 rounded-lg">
                <h4 className="font-bold text-error flex items-center gap-2 mb-1"><AlertTriangle size={18} /> {t('lbl_overpayment_summary')}</h4>
                <p className="text-sm font-bold text-error">{t('msg_overpayment_months').replace('{n}', '').replace('{months}', overpaidMonths)}: <span className="text-2xl">{overpaidMonths}</span> {overpaidMonths > 1 ? t('lbl_months') : t('lbl_month')}</p>
                <p className="text-xs text-error mt-1">{t('msg_overpayment_recovery_note')}</p>
              </div>
            )}

            <h3 className="font-bold text-xl border-b gap-2 pb-2 mb-4">{t('lbl_statutory_beneficiary_report')}</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-alt font-bold text-sm text-[#475569] border-b border-subtle">
                    <th className="p-3">{t('th_beneficiary_class')}</th>
                    <th className="p-3">{t('th_name')}</th>
                    <th className="p-3 bg-[#f8fafc]">{t('th_allocated_share')}</th>
                    <th className="p-3">{t('th_reference_logic')}</th>
                  </tr>
                </thead>
                <tbody>
                  {showSpouseInTable && (
                    <tr className="border-b border-subtle">
                      <td className="p-3 font-bold text-primary">
                        {distScenario === 'REMARRIED_SPOUSE_50' ? t('lbl_widow_remarried') : t('lbl_widow')}
                        {data.a_remarried && distScenario !== 'REMARRIED_SPOUSE_50' && <span className="text-amber ml-2 block text-xs">{t('msg_remarriage_logged')}</span>}
                      </td>
                      <td className="p-3 font-bold">{applicantSpouseRecord?.s_name || t('lbl_validated_primary_spouse')}</td>
                      <td className="p-3 font-bold bg-[#f8fafc]">
                        {spouseShare === 100 && <span className="text-success">{spouseShare}% {t('msg_primary')}</span>}
                        {spouseShare === 50 && <span className="text-[#0ea5e9]">{spouseShare}% {distScenario === 'REMARRIED_SPOUSE_50' ? t('msg_remarriage_penalty') : t('msg_distributed')}</span>}
                      </td>
                      <td className="p-3 text-sm text-muted">{t('lbl_nic')} {applicantSpouseRecord?.s_nic || 'XXXXX-XXXX'} <br /> {t('lbl_date_eligible')} {(() => { try { if (!data.dod) return 'N/A'; const d = new Date(data.dod); if (isNaN(d.getTime())) return t('lbl_invalid_date'); return new Date(d.getTime() + 86400000).toISOString().split('T')[0]; } catch (e) { return t('lbl_invalid_date'); } })()}</td>
                    </tr>
                  )}
                  {ActiveOrphansToDisplay.length === 0 ? (
                    distScenario === 'NO_BENEFICIARY' ? (
                      <tr><td colSpan="4" className="p-3 text-center text-error font-bold border-b border-subtle">{t('msg_no_beneficiaries_identified')}</td></tr>
                    ) : (
                      distScenario === 'SPOUSE_100' || distScenario === 'REMARRIED_SPOUSE_50' ? null : (
                        <tr><td colSpan="4" className="p-3 text-center text-sm text-muted font-bold">{t('msg_no_prior_orphans')}</td></tr>
                      )
                    )
                  ) : (
                    ActiveOrphansToDisplay.map((orphan, idx) => {
                      const oAge = computeDynamicAge(orphan.dob);
                      const needsGuard = (oAge !== '' && oAge < 18) || orphan.isEligibleDisabled;
                      const perOrphanShare = ActiveOrphansToDisplay.length === 1 ? orphanPool : (orphanPool / ActiveOrphansToDisplay.length);
                      return (
                        <tr key={idx} className="border-b border-subtle bg-[#f8fafc]">
                          <td className="p-3 font-bold text-amber">
                            {orphan.marriageIndex === applicantMarriageIndex ? t('lbl_orphan') : t('lbl_prior_orphan')}
                            {orphan.isEligibleDisabled && <span className="block text-xs text-primary mt-1">{t('msg_lifetime_disabled')}</span>}
                            {needsGuard && <span className="block text-xs text-[#b45309] mt-1">{t('msg_guardian_intercepted')}</span>}
                          </td>
                          <td className="p-3 font-bold">{orphan.name || `${t('lbl_unnamed_child')} ${idx + 1}`}</td>
                          <td className="p-3 font-bold text-[#0ea5e9] bg-[#f1f5f9]">
                            {ActiveOrphansToDisplay.length === 1 ? `${orphanPool}% ${t('msg_sole_beneficiary')}` : `${perOrphanShare.toFixed(1)}% ${t('msg_of_pool').replace('{pool}', orphanPool)}`}
                          </td>
                          <td className="p-3 text-sm text-muted">
                            {t('lbl_from_marriage')} {orphan.marriageIndex} <br />
                            {t('lbl_age')} {oAge} | {t('lbl_status')} {orphan.occ}
                            {orphan.nicChild && <span> | {t('lbl_nic')}: {orphan.nicChild}</span>}
                            {orphan.isEligibleDisabled && orphan.med_board_date && <span className="block text-xs mt-1 text-primary">{t('lbl_panel_validated')} {orphan.med_board_date}</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="print-hide" style={{ marginTop: '2rem' }}>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <button className="btn bg-[#334155] border-none text-[#ffffff] text-sm" onClick={() => handlePrint('info')}>{t('btn_print_app_summary')}</button>
              <button className="btn bg-[#334155] border-none text-[#ffffff] text-sm" onClick={() => handlePrint('docs')}>{t('btn_print_docs_list')}</button>
              <button className="btn bg-[#0284c7] border-none text-[#ffffff] text-sm" onClick={() => handlePrint('output')}>{t('btn_print_eligibility_report')}</button>
              <button className="btn bg-[#7c3aed] border-none text-[#ffffff] text-sm" onClick={() => handlePrint('eligibility')}>{t('btn_print_eligibility_determination')}</button>
            </div>
            <div className="flex justify-center gap-4">
              <button className="btn btn-secondary border border-subtle text-primary" onClick={() => resetApp()}>{t('btn_return_dashboard')}</button>
              <button className={`btn ${submitAllowed ? 'bg-primary border-none shadow-sm text-[#ffffff]' : 'bg-gray-300 border-none text-muted cursor-not-allowed opacity-50'}`} disabled={!submitAllowed}>{finalActionText}</button>
            </div>
          </div>
          </div>

          {/* ===== PRINTABLE SECTIONS (Hidden on screen, conditionally visible on print) ===== */}

          {/* --- PRINT: APPLICATION SUMMARY (Entered Info) --- */}
          <div className={`print-only ${printMode === 'info' ? 'print-active' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px double #0284c7' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>{t('lbl_wop_system')}</h1>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>{t('lbl_wop_pensions_division')}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' }}>{t('lbl_app_summary')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_ref')}{data.nic || t('msg_na')} / {data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB')}</p>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, borderBottom: '2px solid #0284c7', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0284c7' }}>{t('lbl_section_a_summary')}</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, width: '40%', color: '#475569' }}>{t('lbl_benefit_type')}</td>
                  <td style={{ padding: '0.5rem' }}>{wopTitle}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_contributor_name')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.name || t('msg_not_provided')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_nic')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.nic || t('msg_not_provided')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_gender')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.gender === 'Male' ? t('opt_male') : t('opt_female')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dob')}</td>
                  <td style={{ padding: '0.5rem' }}>{formatDate(data.dob)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dod')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.isMissingPerson ? t('msg_missing_person_police').replace('{date}', formatDate(data.policeComplaintDate) || t('msg_na')) : formatDate(data.dod)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_service_status_death')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.isPensioner ? t('msg_deceased_pensioner') : t('msg_deceased_in_service')}</td>
                </tr>
                {data.isPensioner && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dor')}</td>
                    <td style={{ padding: '0.5rem' }}>{formatDate(data.dor)}</td>
                  </tr>
                )}
                {data.isPensioner && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_pension_commenced')}</td>
                    <td style={{ padding: '0.5rem' }}>{data.pensionNotCommenced ? t('msg_no') : t('opt_yes')}</td>
                  </tr>
                )}
                {!data.pensionNotCommenced && data.lastPensionPaymentDate && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_last_pension_date')}</td>
                    <td style={{ padding: '0.5rem' }}>{formatDate(data.lastPensionPaymentDate)}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_doa')}</td>
                  <td style={{ padding: '0.5rem' }}>{formatDate(data.doa)}</td>
                </tr>
                {data.cabinetDate && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_cabinet_date')}</td>
                    <td style={{ padding: '0.5rem' }}>{formatDate(data.cabinetDate)}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_permanent_confirmed')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.isPermanent ? t('opt_yes') : t('msg_no')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_reckonable_service')}</td>
                  <td style={{ padding: '0.5rem' }}>{t('msg_years_months_days').replace('{y}', data.reckonableYears || 0).replace('{m}', data.reckonableMonths || 0).replace('{d}', data.reckonableDays || 0)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_wop_member_number')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.memberNumber || t('msg_not_provided')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_registration_valid')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.registrationValid ? t('opt_yes') : t('msg_no')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_contributions_recovered')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.contributionRecovered ? t('opt_yes') : t('msg_no')}</td>
                </tr>
                {data.endedWithLossOfPension && (
                  <>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_loss_of_pension_date')}</td>
                      <td style={{ padding: '0.5rem' }}>{formatDate(data.lossOfPensionDate) || t('msg_not_specified')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_loss_of_pension_reason')}</td>
                      <td style={{ padding: '0.5rem' }}>{data.lossOfPensionReason || t('msg_not_specified')}</td>
                    </tr>
                  </>
                )}
                {data.diedDueToTerrorism && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_died_due_to_terrorism')}</td>
                    <td style={{ padding: '0.5rem' }}>{t('opt_yes')}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_no_contributor_marriages')}</td>
                  <td style={{ padding: '0.5rem' }}>{data.contributorMarriages.length}</td>
                </tr>
              </tbody>
            </table>

            {/* Marriage & Dependants Summary */}
            {data.contributorMarriages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', fontSize: '0.82rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>{t('lbl_marriage_idx')}{i + 1}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, width: '40%', color: '#475569' }}>{t('lbl_date_of_marriage')}</td><td style={{ padding: '0.3rem' }}>
                      {formatDate(m.date) || t('msg_na')}{data.dob && m.date ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>{t('lbl_age_at_marriage')}: {computeFullAge(data.dob, m.date)}</span> : ''}
                      <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '1px' }}>⚖ {getLegalRef(data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'marriage_1yr_female_forces' : 'marriage_1yr_male_forces') : (data.gender === 'Female' ? 'marriage_1yr_female_civil' : 'marriage_1yr_male_civil'), i18n.language)}</div>
                    </td></tr>
                    <tr style={{ background: '#f8fafc' }}><td style={{ padding: '0.3rem', fontWeight: 600, color: '#475569' }}>{t('lbl_spouse_name')}</td><td style={{ padding: '0.3rem' }}>{m.s_name || t('msg_na')}</td></tr>
                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, color: '#475569' }}>{t('lbl_spouse_nic')}</td><td style={{ padding: '0.3rem' }}>{m.s_nic || t('msg_na')}</td></tr>
                    <tr style={{ background: '#f8fafc' }}><td style={{ padding: '0.3rem', fontWeight: 600, color: '#475569' }}>{t('lbl_spouse_alive')}</td><td style={{ padding: '0.3rem' }}>{m.s_alive === true ? t('opt_yes') : m.s_alive === false ? t('msg_no') : t('msg_na')}</td></tr>
                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, color: '#475569' }}>{t('lbl_termination')}</td><td style={{ padding: '0.3rem' }}>{m.s_term || t('msg_na')}</td></tr>
                  </tbody>
                </table>
                {(m.children && m.children.length > 0) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>{t('lbl_children_from_marriage')}</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead><tr style={{ borderBottom: '1px solid #cbd5e1', fontWeight: 700, color: '#475569' }}><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_name')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_dob')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('lbl_nic')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_occupation')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_disabled')}</th></tr></thead>
                      <tbody>
                        {m.children.map((c, ci) => (
                          <tr key={ci} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.3rem' }}>{c.name || t('msg_na')}</td>
                            <td style={{ padding: '0.3rem' }}>{formatDate(c.dob) || t('msg_na')}</td>
                            <td style={{ padding: '0.3rem' }}>{c.nicChild || t('msg_na')}</td>
                            <td style={{ padding: '0.3rem' }}>{c.occ || t('msg_na')}</td>
                            <td style={{ padding: '0.3rem' }}>{c.is_disabled ? t('opt_yes') : t('msg_no')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Applicant (Widow/Widower) Details */}
            <h3 style={{ fontWeight: 700, color: '#0284c7', marginBottom: '0.5rem', marginTop: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', fontSize: '0.95rem' }}>{t('lbl_applicant_details')}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '0.4rem', fontWeight: 700, width: '40%', color: '#475569' }}>{t('lbl_applicant_remarried')}</td>
                  <td style={{ padding: '0.4rem', fontWeight: 600 }}>{data.a_remarried ? `${t('opt_yes')} (${formatDate(data.a_remarriage_date) || t('msg_date_na')})` : t('msg_no')}</td>
                </tr>
                {data.a_remarried && data.a_remarriage_applied_50 !== undefined && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <td style={{ padding: '0.4rem', fontWeight: 700, color: '#475569' }}>{t('lbl_applied_50_before_2014')}</td>
                    <td style={{ padding: '0.4rem' }}>{data.a_remarriage_applied_50 ? t('opt_yes') : t('msg_no')}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Uncountable Service Periods */}
            {data.uncountablePeriods && data.uncountablePeriods.length > 0 && data.uncountablePeriods.some(u => u.from && u.to) && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>{t('lbl_uncountable_service_periods')}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead><tr style={{ borderBottom: '1px solid #cbd5e1', fontWeight: 700, color: '#475569' }}><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_from')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_to')}</th><th style={{ padding: '0.3rem', textAlign: 'left' }}>{t('th_reason')}</th></tr></thead>
                  <tbody>
                    {data.uncountablePeriods.filter(u => u.from && u.to).map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.3rem' }}>{formatDate(u.from)}</td>
                        <td style={{ padding: '0.3rem' }}>{formatDate(u.to)}</td>
                        <td style={{ padding: '0.3rem' }}>{u.reason || t('msg_not_specified')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(data.gender === 'Female' && data.femaleConsent) && (
              <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('lbl_female_contributor_consent')}{data.femaleConsent}</p>
            )}
            {data.pensionNotCommenced && (
              <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', color: '#d97706' }}>{t('msg_pension_not_commenced_note')}</p>
            )}
            {overpaidMonths > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', border: '2px solid #dc2626', borderRadius: '6px', background: '#fef2f2' }}>
                <p style={{ fontWeight: 800, color: '#dc2626', marginBottom: '0.25rem', fontSize: '0.9rem' }}>⚠ {t('lbl_overpayment_summary')}</p>
                <p style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.85rem' }}>{t('msg_overpayment_months').replace('{n}', '').replace('{months}', overpaidMonths)}: {overpaidMonths} {overpaidMonths > 1 ? 'Months' : 'Month'}</p>
                <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.25rem' }}>{t('msg_overpayment_recovery_note')}</p>
              </div>
            )}
          </div>

          {/* --- PRINT: DOCUMENTS LIST --- */}
          <div className={`print-only ${printMode === 'docs' ? 'print-active' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px double #0284c7' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>{t('lbl_wop_system')}</h1>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>{t('lbl_wop_pensions_division')}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' }}>{t('lbl_required_docs_checklist')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')} | {t('lbl_ref')}{data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderLeft: '4px solid #7c3aed', borderRadius: '4px' }}>
              <strong style={{ color: '#1e293b', fontSize: '0.85rem' }}>{t('lbl_overall_legal_provision')}</strong>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>⚖ {getLegalRef(data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'forces_female_regular' : 'forces_male_regular') : (data.gender === 'Female' && data.doa >= '1983-08-01' ? 'female_civil_post1983' : data.gender === 'Male' ? 'male_civil_mandatory' : 'female_civil_pre1983_opt'), i18n.language)}</div>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, borderBottom: '2px solid #0284c7', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0284c7' }}>{t('lbl_required_docs_checklist')}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #0284c7', fontWeight: 700, color: '#0284c7' }}>
                  <th style={{ padding: '0.4rem', textAlign: 'left', width: '5%' }}>#</th>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>{t('lbl_document')}</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center', width: '15%' }}>{t('lbl_verified')}</th>
                </tr>
              </thead>
              <tbody>
                {requiredDocs.map((doc, i) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '0.4rem', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '0.4rem' }}>{doc.label}</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: data.docsAvailability[doc.id] ? '#10b981' : '#ef4444' }}>{data.docsAvailability[doc.id] ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.affidavitProvided && <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', marginBottom: '1rem' }}>{t('lbl_discrepancy_affidavits_validated')}</p>}
            {missingDocs.length > 0 && (
              <div style={{ padding: '0.75rem', border: '1px solid #ef4444', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <p style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>{t('lbl_missing_documents_count').replace('{count}', missingDocs.length)}</p>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {missingDocs.map(d => <li key={d.id} style={{ color: '#991b1b' }}>{d.label}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* --- PRINT: ELIGIBILITY OUTPUT --- */}
          <div className={`print-only ${printMode === 'output' ? 'print-active' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px double #0284c7' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>{t('lbl_wop_system')}</h1>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>{t('lbl_wop_pensions_division')}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' }}>{t('lbl_eligibility_determination_report')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')} | {t('lbl_ref')}{data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, borderBottom: '2px solid #0284c7', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0284c7' }}>{t('lbl_eligibility_determination_report')}</h2>
            <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.75rem' }}>{t('msg_report_auto_generated')}</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{t('lbl_generated').substring(3)}{new Date().toLocaleDateString('en-GB')}{t('lbl_role')}{userRole}{t('lbl_benefit')}{wopTitle}</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')}{t('lbl_member_no')}{data.memberNumber || t('msg_na')}</p>

            {/* Distribution Summary */}
            <div style={{ border: '2px solid #0284c7', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#0284c7', marginBottom: '0.5rem', fontSize: '1rem' }}>{t('lbl_pension_distribution_determination')}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.4rem', fontWeight: 700, width: '40%', color: '#475569' }}>{t('lbl_distribution_scenario')}</td>
                    <td style={{ padding: '0.4rem', fontWeight: 700 }}>{
                      distScenario === 'SPOUSE_100' ? t('msg_100_to_widow') :
                        distScenario === 'SPLIT_50_50' ? t('msg_50_50_split_spouse_prior_orphans') :
                          distScenario === 'REMARRIED_SPOUSE_50' ? t('msg_50_remarried_widow') :
                            distScenario === 'ORPHANS_100_REVERT_50' ? t('msg_100_orphans_revert_50') :
                              distScenario === 'ORPHANS_100_NO_REVERT' ? t('msg_100_orphans_no_revert') :
                                distScenario === 'ORPHANS_100_REVERT_100' ? t('msg_100_orphans_revert_100') :
                                  t('msg_no_eligible_beneficiaries')
                    }</td>
                  </tr>
                  {showSpouseInTable && (
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f0f9ff' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 700, color: '#475569' }}>{t('lbl_widow_entitlement')}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 700 }}>{applicantSpouseRecord?.s_name || t('lbl_primary_spouse')} — {spouseShare}%</td>
                    </tr>
                  )}
                  {ActiveOrphansToDisplay.length > 0 && ActiveOrphansToDisplay.map((o, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #cbd5e1', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 600, color: '#475569' }}>{o.marriageIndex === applicantMarriageIndex ? t('lbl_orphan') : t('lbl_prior_orphan')}{o.isEligibleDisabled ? t('msg_orphan_disabled') : ''}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 700 }}>{o.name || t('msg_unnamed')} — {ActiveOrphansToDisplay.length === 1 ? orphanPool : (orphanPool / ActiveOrphansToDisplay.length).toFixed(1)}% | {t('lbl_age')} {computeDynamicAge(o.dob)} | {o.occ}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Applicant Remarriage & Care Status */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f0f9ff' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 700, width: '40%', color: '#0284c7' }}>{t('lbl_applicant_remarried')}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{data.a_remarried ? `${t('opt_yes')} (${formatDate(data.a_remarriage_date) || t('msg_date_na')})` : t('msg_no')}</td>
                </tr>
                {data.isMissingPerson && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_missing_person_declaration')}</td>
                    <td style={{ padding: '0.5rem' }}>{t('lbl_police_complaint')}{data.policeComplaintDate || t('msg_na')}</td>
                  </tr>
                )}
                {requiresDGApproval && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fef3c7' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#d97706' }}>{t('lbl_dg_approval_required')}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600, color: '#d97706' }}>{dgApprovalReasons.join('; ')}</td>
                  </tr>
                )}
                {deathGratuityWarning && (
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_death_gratuity_pd05')}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.8rem' }}>{deathGratuityWarning}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Signature Blocks */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ width: '45%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700 }}>{t('lbl_applicant_signature')}</p>
                <p style={{ color: '#475569' }}>{t('lbl_date_line')}</p>
              </div>
              <div style={{ width: '45%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700 }}>{t('lbl_authorized_officer')}</p>
                <p style={{ color: '#475569' }}>{t('lbl_stamp_date')}</p>
              </div>
            </div>
          </div>

          {/* --- PRINT: REJECTION REPORT --- */}
          <div className={`print-only ${printMode === 'rejection' ? 'print-active' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px double #e11d48' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e11d48', margin: 0 }}>{t('lbl_wop_system')}</h1>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>{t('lbl_wop_pensions_division')}</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#9f1239', margin: '0.25rem 0' }}>{t('section_f_ineligibility_title')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB')}</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.5rem' }}><strong>{t('lbl_contributor')}:</strong> {data.name || t('msg_not_provided')}</p>
              <p style={{ fontSize: '0.9rem', color: '#334155' }}><strong>{t('lbl_nic')}:</strong> {data.nic || t('msg_not_provided')}</p>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e11d48', marginBottom: '1rem', borderBottom: '1px solid #e11d48', paddingBottom: '0.5rem' }}>{t('lbl_failure_identifiers')}</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#9f1239', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {(data.rejectionReasons || []).map((r, idx) => <li key={idx} style={{ marginBottom: '0.75rem' }}>{r}</li>)}
            </ul>
          </div>

          {/* --- PRINT: ELIGIBILITY DETERMINATION REPORT ONLY --- */}
          <div className={`print-only ${printMode === 'eligibility' ? 'print-active' : ''}`}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '3px double #7c3aed' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed', margin: 0 }}>{t('lbl_wop_system')}</h1>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: '0.25rem 0' }}>{t('lbl_wop_pensions_division')}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' }}>{t('btn_print_eligibility_determination')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')} | {t('lbl_ref')}{data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Beneficiary Table */}
            <div style={{ border: '2px solid #7c3aed', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: '#7c3aed', marginBottom: '0.5rem', fontSize: '1rem' }}>{t('lbl_statutory_beneficiary_report')}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #7c3aed', fontWeight: 700 }}>
                    <th style={{ padding: '0.4rem', textAlign: 'left' }}>{t('th_beneficiary_class')}</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left' }}>{t('th_name')}</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left' }}>{t('th_allocated_share')}</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left' }}>{t('th_reference_logic')}</th>
                  </tr>
                </thead>
                <tbody>
                  {showSpouseInTable && (
                    <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f5f3ff' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 700 }}>{distScenario === 'REMARRIED_SPOUSE_50' ? t('lbl_widow_remarried') : t('lbl_widow')}</td>
                      <td style={{ padding: '0.4rem' }}>{applicantSpouseRecord?.s_name || t('lbl_validated_primary_spouse')}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 700, color: '#7c3aed' }}>{spouseShare}%</td>
                      <td style={{ padding: '0.4rem', fontSize: '0.78rem' }}>{distScenario}</td>
                    </tr>
                  )}
                  {ActiveOrphansToDisplay.map((o, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #cbd5e1', background: i % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 600 }}>{o.marriageIndex === applicantMarriageIndex ? t('lbl_orphan') : t('lbl_prior_orphan')}{o.isEligibleDisabled ? ' ★' : ''}</td>
                      <td style={{ padding: '0.4rem' }}>{o.name || t('msg_unnamed')}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 700, color: '#7c3aed' }}>{ActiveOrphansToDisplay.length === 1 ? orphanPool : (orphanPool / ActiveOrphansToDisplay.length).toFixed(1)}%</td>
                      <td style={{ padding: '0.4rem', fontSize: '0.78rem' }}>{t('lbl_age')}: {computeDynamicAge(o.dob)} | {o.occ}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disabled Orphan Note */}
            {orphansList.filter(o => o.isEligibleDisabled).map((o, i) => (
              <div key={i} style={{ padding: '0.75rem', border: '1px solid #4f46e5', borderRadius: '6px', marginBottom: '1rem', background: '#eef2ff' }}>
                <p style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.85rem' }}>★ {t('lbl_disabled_pension_auth')}: {o.name || t('lbl_unnamed_dependent')}</p>
                <p style={{ fontSize: '0.78rem', color: '#3730a3', marginTop: '0.25rem' }}>{t('lbl_temporary_hold_rule')}</p>
              </div>
            ))}

            {/* Overpayment */}
            {overpaidMonths > 0 && (
              <div style={{ padding: '0.75rem', border: '2px solid #dc2626', borderRadius: '6px', marginBottom: '1rem', background: '#fef2f2' }}>
                <p style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.9rem' }}>⚠ {t('lbl_overpayment_summary')}: {overpaidMonths} {overpaidMonths > 1 ? 'Months' : 'Month'}</p>
                <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.25rem' }}>{t('msg_overpayment_recovery_note')}</p>
              </div>
            )}

            {/* Signature Blocks */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ width: '45%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700 }}>{t('lbl_applicant_signature')}</p>
                <p style={{ color: '#475569' }}>{t('lbl_date_line')}</p>
              </div>
              <div style={{ width: '45%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700 }}>{t('lbl_authorized_officer')}</p>
                <p style={{ color: '#475569' }}>{t('lbl_stamp_date')}</p>
              </div>
            </div>
          </div>

          {/* ===== END PRINTABLE SECTIONS ===== */}
        </>
      );
    } catch (err) {
      return <div className="p-8 bg-red-50 text-red-900 border border-red-500 rounded"><h1 className="text-2xl font-bold mb-4">CRASH TRACE DETECTED:</h1><pre className="whitespace-pre-wrap">{err.toString()}\n{err.stack}</pre></div>;
    }
  };

  const checkerRenderer = [Part1A, SectionA, SectionB_C, SectionD, SectionE_F, SectionF_DisabledOps, Section_Docs, SectionF];

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="flex justify-end p-4 print-hide">
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="p-2 border border-subtle rounded-md font-bold text-sm bg-[#ffffff] text-[#334155] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
        {viewState === 'auth' ? (
          <div className="wizard-card max-w-md mx-auto mt-12"><AuthView /></div>
        ) : (
          <div className="wizard-card shadow-lg">
            <div className="step-indicator print-hide">
              {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className={`step-dot ${checkerStep >= i - 1 ? 'active' : ''}`}></div>)}
            </div>
            <FormErrorBanner error={formErrors.global} />
            {checkerRenderer[checkerStep]()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
