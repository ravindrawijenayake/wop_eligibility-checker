const fs = require('fs');

const sec9_en = {
  "msg_disabled_deferred": "Medical board decision validated on {date}. Pension eligibility and payments will formally commence ONLY upon the demise, remarriage, or legal abandonment by the surviving primary spouse.",
  "err_child_dob_after_dod": "Child DOB cannot be logically after the Contributor's Date of Death.",
  "err_child_dob_after_dod_male": "Child DOB cannot be logically after 300 days of the Contributor's Date of Death.",
  "doc_bank_account": "Certified copy/copies of all eligible individuals/nominated a guardian (if any) personal individual savings bank account",
  "doc_gn_residency": "Grama Niladhari Residency Report (DS4)",
  "doc_gn_disabled_report": "Grama Niladhari's report on eligible individual's employment, income and income sources / properties (only for disabled orphans), Civil Status",
  "doc_widow_7": "If prior marriage's information cannot be retrieved: 'Widow 7' declaration (Divisional Secretariat or Pension Dept. Website)"
};

const sec9_si = {
  "msg_disabled_deferred": "වෛද්‍ය මණ්ඩල තීරණය {date} දින සත්‍යාපනය කර ඇත. විශ්‍රාම වැටුප් සුදුසුකම් සහ ගෙවීම් විධිමත්ව ආරම්භ වන්නේ ජීවතුන් අතර සිටින ප්‍රාථමික සහකරු මිය ගිය විට, නැවත විවාහ වූ විට හෝ නීත්‍යානුකූලව අතහැර දැමූ විට පමණි.",
  "err_child_dob_after_dod": "දරුවාගේ උපන් දිනය දායකයාගේ මියගිය දිනයට පසුව විය නොහැක.",
  "err_child_dob_after_dod_male": "දරුවාගේ උපන් දිනය දායකයාගේ මියගිය දින සිට දින 300 කට පසුව විය නොහැක.",
  "doc_bank_account": "සියලුම සුදුසුකම් ලත් පුද්ගලයින්ගේ/නම් කළ භාරකරුවෙකුගේ (ඇත්නම්) පුද්ගලික ඉතුරුම් බැංකු ගිණුමේ සහතික කළ පිටපත/පිටපත්",
  "doc_gn_residency": "ග්‍රාම නිලධාරී පදිංචි සහතිකය (DS4)",
  "doc_gn_disabled_report": "සුදුසුකම් ලත් පුද්ගලයාගේ රැකියාව, ආදායම සහ ආදායම් මාර්ග / දේපළ පිළිබඳ ග්‍රාම නිලධාරී වාර්තාව (ආබාධිත අනාථයන් සඳහා පමණි), සිවිල් තත්ත්වය",
  "doc_widow_7": "පෙර විවාහයේ තොරතුරු ලබාගත නොහැකි නම්: 'වැන්දඹු 7' ප්‍රකාශය (ප්‍රාදේශීය ලේකම් කාර්යාලයෙන් හෝ විශ්‍රාම වැටුප් දෙපාර්තමේන්තු වෙබ් අඩවියෙන්)"
};

const sec9_ta = {
  "msg_disabled_deferred": "மருத்துவ சபை முடிவு {date} அன்று சரிபார்க்கப்பட்டது. உயிர்வாழும் முதன்மை துணைவியின் மரணம், மறுமணம் அல்லது சட்டப்பூர்வமாக கைவிடப்பட்ட பின்னரே ஓய்வூதியத் தகுதி மற்றும் கொடுப்பனவுகள் முறைப்படி தொடங்கும்.",
  "err_child_dob_after_dod": "குழந்தையின் பிறந்த தேதி பங்களிப்பாளரின் இறந்த தேதிக்கு பின்னால் இருக்க முடியாது.",
  "err_child_dob_after_dod_male": "குழந்தையின் பிறந்த தேதி பங்களிப்பாளரின் இறந்த தேதியிலிருந்து 300 நாட்களுக்குப் பின்னால் இருக்க முடியாது.",
  "doc_bank_account": "தகுதியான அனைத்து தனிநபர்கள் / நியமிக்கப்பட்ட காப்பாளரின் (யாராவது இருந்தால்) தனிப்பட்ட சேமிப்பு வங்கி கணக்கின் சான்றளிக்கப்பட்ட நகல்/நகல்கள்",
  "doc_gn_residency": "கிராம நிலதாரி வதிவிட அறிக்கை (DS4)",
  "doc_gn_disabled_report": "தகுதியான நபரின் வேலைவாய்ப்பு, வருமானம் மற்றும் வருமான ஆதாரங்கள் / சொத்துக்கள் பற்றிய கிராம நிலதாரி அறிக்கை (முடக்கப்பட்ட அனாதைகளுக்கு மட்டும்), சிவில் நிலை",
  "doc_widow_7": "முந்தைய திருமணத்தின் தகவலைப் பெற முடியாவிட்டால்: 'விதவை 7' அறிவிப்பு (பிரதேச செயலகம் அல்லது ஓய்வூதியத் திணைக்கள இணையதளம்)"
};

const newData = {
  en: { ...sec9_en },
  si: { ...sec9_si },
  ta: { ...sec9_ta }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  let existing = {};
  if(fs.existsSync(file)) {
      existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const updated = { ...existing, ...newData[lang] };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
});
