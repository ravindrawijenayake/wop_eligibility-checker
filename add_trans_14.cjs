const fs = require('fs');

const newKeys = {
  en: {
    "lbl_officer_number": "Officer / Soldier Service Number",
    "err_officer_number_required": "Officer/Soldier Number is mandatory for Military/Tri-Forces contributors.",
    "lbl_death_cert_no": "Death Certificate Number",
    "err_death_cert_required": "Death Certificate Number is required.",
    "lbl_marriage_registered": "Is this marriage formally registered?",
    "opt_registered": "Yes – Registered",
    "opt_unregistered": "No – Unregistered / Customary",
    "lbl_unregistered_info": "Unregistered / Customary Marriage – Additional Evidence Required",
    "msg_unregistered_rule": "An unregistered marriage may be considered valid for W&OP purposes ONLY IF: (a) there is no prior subsisting marriage, or (b) all prior marriages have been legally terminated. Sufficient evidence must be submitted to substantiate the marriage.",
    "lbl_unregistered_evidence_types": "Acceptable Evidence (select all that apply):",
    "opt_evidence_electoral": "Extract of Electoral Registry showing joint residence",
    "opt_evidence_birth_cert": "Birth Certificate(s) of children born to this marriage",
    "opt_evidence_affidavit": "Sworn Affidavit by the couple or witnesses",
    "opt_evidence_institution": "Confirmation letter from officiating institution (Church / Kovil / Mosque)",
    "opt_evidence_witnesses": "Affidavits from witnesses who participated in the marriage ceremony",
    "opt_evidence_custom_cert": "Customary Marriage Certificate (if any)",
    "lbl_unregistered_notes": "Additional Notes / Evidence Description",
    "msg_unregistered_dg_note": "⚠ Note: Unregistered marriages require Director General (DG) approval before W&OP benefits can be formally granted.",
    "lbl_cert_number_optional": "Certificate / Registration No. (if any)"
  },
  si: {
    "lbl_officer_number": "නිලධාරී / සෙබළ සේවා අංකය",
    "err_officer_number_required": "හමුදා / ත්‍රිවිධ හමුදා දායකයින් සඳහා නිලධාරී/සෙබළ අංකය අනිවාර්ය වේ.",
    "lbl_death_cert_no": "මරණ සහතිකය අංකය",
    "err_death_cert_required": "මරණ සහතිකය අංකය අවශ්‍ය වේ.",
    "lbl_marriage_registered": "මෙම විවාහය විධිමත් ලෙස ලියාපදිංචිද?",
    "opt_registered": "ඔව් – ලියාපදිංචි",
    "opt_unregistered": "නැත – ලියාපදිංචි නොවූ / සිරිත් විරිත් අනුව",
    "lbl_unregistered_info": "ලියාපදිංචි නොවූ / සිරිත් විරිත් අනුව සිදු කළ විවාහය – අතිරේක සාක්ෂ්‍ය අවශ්‍ය",
    "msg_unregistered_rule": "ලියාපදිංචි නොවූ විවාහයක් W&OP අරමුණු සඳහා වලංගු ලෙස සලකනු ලබන්නේ: (අ) පෙර ක්‍රියාත්මක විවාහයක් නොමැති නම්, හෝ (ආ) සියලුම පෙර විවාහ නීත්‍යානුකූලව අවසන් කර ඇත්නම් පමණි. විවාහය සනාථ කිරීමට ප්‍රමාණවත් සාක්ෂ්‍ය ඉදිරිපත් කළ යුතුය.",
    "lbl_unregistered_evidence_types": "පිළිගත හැකි සාක්ෂ්‍ය (අදාළ සියල්ල තෝරන්න):",
    "opt_evidence_electoral": "ඒකාබද්ධ වාසස්ථානය පෙන්වන ඡන්ද රෙජිස්ට්‍රි උපුටා ගැනීම",
    "opt_evidence_birth_cert": "මෙම විවාහයෙන් ලද දරුවන්ගේ උප්පැන්න සහතික",
    "opt_evidence_affidavit": "යුවළ හෝ සාක්ෂිකරුවන් විසින් දුන් ශකාව ලේඛනය",
    "opt_evidence_institution": "විවාහ සිදු කළ ආයතනයෙන් ලිපිය (පල්ලිය / කෝවිල / මස්ජිද්)",
    "opt_evidence_witnesses": "විවාහ උළෙලට සහභාගි වූ සාක්ෂිකරුවන්ගේ ශකාව ලේඛන",
    "opt_evidence_custom_cert": "සිරිත් විරිත් විවාහ සහතිකය (ඇත්නම්)",
    "lbl_unregistered_notes": "අතිරේක සටහන් / සාක්ෂ්‍ය විස්තරය",
    "msg_unregistered_dg_note": "⚠ සටහන: ලියාපදිංචි නොවූ විවාහ සඳහා W&OP ප්‍රතිලාභ ලබා දීමට පෙර අධ්‍යක්ෂ ජනරාල් (DG) අනුමැතිය අවශ්‍ය වේ.",
    "lbl_cert_number_optional": "සහතිකය / ලියාපදිංචි අංකය (ඇත්නම්)"
  },
  ta: {
    "lbl_officer_number": "அதிகாரி / சிப்பாய் சேவை எண்",
    "err_officer_number_required": "இராணுவம் / முப்படை பங்களிப்பாளர்களுக்கு அதிகாரி/சிப்பாய் எண் கட்டாயமாகும்.",
    "lbl_death_cert_no": "இறப்பு சான்றிதழ் எண்",
    "err_death_cert_required": "இறப்பு சான்றிதழ் எண் தேவை.",
    "lbl_marriage_registered": "இந்த திருமணம் முறையாக பதிவு செய்யப்பட்டுள்ளதா?",
    "opt_registered": "ஆம் – பதிவு செய்யப்பட்டது",
    "opt_unregistered": "இல்லை – பதிவு செய்யப்படாத / வழக்கான",
    "lbl_unregistered_info": "பதிவு செய்யப்படாத / வழக்கான திருமணம் – கூடுதல் சான்றுகள் தேவை",
    "msg_unregistered_rule": "பதிவு செய்யப்படாத திருமணம் W&OP நோக்கங்களுக்காக செல்லுபடியாகும் ONLY IF: (அ) முன்னர் நிலுவையிலுள்ள திருமணம் இல்லாத போது, அல்லது (ஆ) அனைத்து முந்தைய திருமணங்களும் சட்டரீதியாக முடிவடைந்த போது மட்டுமே. திருமணத்தை நிரூபிக்க போதுமான சான்றுகள் சமர்ப்பிக்கப்பட வேண்டும்.",
    "lbl_unregistered_evidence_types": "ஏற்றுக்கொள்ளக்கூடிய சான்றுகள் (பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்):",
    "opt_evidence_electoral": "கூட்டு வசிப்பிடம் காட்டும் வாக்காளர் பதிவேட்டின் சாரம்",
    "opt_evidence_birth_cert": "இந்த திருமணத்தில் பிறந்த குழந்தைகளின் பிறப்புச் சான்றிதழ்கள்",
    "opt_evidence_affidavit": "தம்பதியினர் அல்லது சாட்சிகளால் உறுதிமொழி பத்திரம்",
    "opt_evidence_institution": "நடத்திய நிறுவனத்தின் உறுதிப்படுத்தல் கடிதம் (தேவாலயம் / கோயில் / மசூதி)",
    "opt_evidence_witnesses": "திருமண விழாவில் கலந்துகொண்ட சாட்சிகளின் உறுதிமொழி பத்திரங்கள்",
    "opt_evidence_custom_cert": "வழக்கான திருமண சான்றிதழ் (ஏதேனும் இருந்தால்)",
    "lbl_unregistered_notes": "கூடுதல் குறிப்புகள் / சான்று விளக்கம்",
    "msg_unregistered_dg_note": "⚠ குறிப்பு: பதிவு செய்யப்படாத திருமணங்களுக்கு W&OP நன்மைகளை வழங்குவதற்கு முன் இயக்குனர் நாயகம் (DG) அனுமதி தேவை.",
    "lbl_cert_number_optional": "சான்றிதழ் / பதிவு எண் (ஏதேனும் இருந்தால்)"
  }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  let existing = {};
  if (fs.existsSync(file)) {
    existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const updated = { ...existing, ...newKeys[lang] };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
  console.log(`${lang}.json: +${Object.keys(newKeys[lang]).length} keys`);
});
