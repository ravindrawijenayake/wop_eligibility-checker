const fs = require('fs');
const keys = {
  en: {
    "err_member_number_required": "WOP registration number is required.",
    "err_pension_commenced_required": "Please indicate whether pension payments have commenced.",
    "err_loss_date_required": "Loss of pension date is required.",
    "err_loss_reason_required": "Please select the reason for loss of pension.",
    "err_marriage_date_required": "Marriage date is required.",
    "err_cert_required": "Marriage certificate number is required.",
    "err_spouse_name_required": "Spouse full name is required.",
    "err_decree_nisi_required": "Decree Nisi date is required.",
    "err_decree_absolute_required": "Decree Absolute date is required.",
    "err_sep_date_required": "Date of separation is required.",
    "err_void_date_required": "Court order date is required.",
    "err_void_court_required": "Court name is required.",
    "err_void_case_required": "Case number is required.",
    "err_remarriage_date_required": "Remarriage date is required.",
    "err_spouse_dod_required": "Date of death of spouse is required.",
    "err_child_dob_required": "Child date of birth is required."
  },
  si: {
    "err_member_number_required": "WOP ලියාපදිංචි අංකය අවශ්‍ය වේ.",
    "err_pension_commenced_required": "විශ්‍රාම ගෙවීම් ආරම්භ වී ඇත්දැයි සඳහන් කරන්න.",
    "err_loss_date_required": "විශ්‍රාම නැතිවූ දිනය අවශ්‍ය වේ.",
    "err_loss_reason_required": "විශ්‍රාම නැතිවීමේ හේතුව තෝරන්න.",
    "err_marriage_date_required": "විවාහ දිනය අවශ්‍ය වේ.",
    "err_cert_required": "විවාහ සහතික අංකය අවශ්‍ය වේ.",
    "err_spouse_name_required": "කලත්‍රයාගේ සම්පූර්ණ නම අවශ්‍ය වේ.",
    "err_decree_nisi_required": "Decree Nisi දිනය අවශ්‍ය වේ.",
    "err_decree_absolute_required": "Decree Absolute දිනය අවශ්‍ය වේ.",
    "err_sep_date_required": "වෙන්වීමේ දිනය අවශ්‍ය වේ.",
    "err_void_date_required": "අධිකරණ නියෝග දිනය අවශ්‍ය වේ.",
    "err_void_court_required": "අධිකරණ නාමය අවශ්‍ය වේ.",
    "err_void_case_required": "නඩු අංකය අවශ්‍ය වේ.",
    "err_remarriage_date_required": "නැවත විවාහ දිනය අවශ්‍ය වේ.",
    "err_spouse_dod_required": "කලත්‍රයාගේ මරණ දිනය අවශ්‍ය වේ.",
    "err_child_dob_required": "දරුවාගේ උපන් දිනය අවශ්‍ය වේ."
  },
  ta: {
    "err_member_number_required": "WOP பதிவு எண் தேவை.",
    "err_pension_commenced_required": "ஓய்வூதிய கொடுப்பனவு தொடங்கியதா என்பதை குறிப்பிடவும்.",
    "err_loss_date_required": "ஓய்வூதிய இழப்பு தேதி தேவை.",
    "err_loss_reason_required": "ஓய்வூதிய இழப்பிற்கான காரணத்தை தேர்ந்தெடுக்கவும்.",
    "err_marriage_date_required": "திருமண தேதி தேவை.",
    "err_cert_required": "திருமண சான்றிதழ் எண் தேவை.",
    "err_spouse_name_required": "வாழ்க்கைத்துணையின் முழு பெயர் தேவை.",
    "err_decree_nisi_required": "Decree Nisi தேதி தேவை.",
    "err_decree_absolute_required": "Decree Absolute தேதி தேவை.",
    "err_sep_date_required": "பிரிவு தேதி தேவை.",
    "err_void_date_required": "நீதிமன்ற ஆணை தேதி தேவை.",
    "err_void_court_required": "நீதிமன்றத்தின் பெயர் தேவை.",
    "err_void_case_required": "வழக்கு எண் தேவை.",
    "err_remarriage_date_required": "மறு திருமண தேதி தேவை.",
    "err_spouse_dod_required": "வாழ்க்கைத்துணையின் மரண தேதி தேவை.",
    "err_child_dob_required": "குழந்தையின் பிறந்த தேதி தேவை."
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
