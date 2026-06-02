const fs = require('fs');

// 1. Update English translations
let enPath = './src/locales/en.json';
let enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
enContent['lbl_overall_legal_provision'] = "Overall Eligibility Legal Provision:";
enContent['msg_disclaimer_living'] = "Disclaimer: This portal is for actual incidents. If you are checking eligibility while living, it is at your own discretion. W&OP benefits only apply after the demise of the contributor. You may enter a preferred hypothetical date of death/missing, and use '0000' for the death certificate number.";
enContent['btn_print_rejection_report'] = "Print Rejection Report";
fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2), 'utf8');

// 2. Update Sinhala translations
let siPath = './src/locales/si.json';
let siContent = JSON.parse(fs.readFileSync(siPath, 'utf8'));
siContent['lbl_overall_legal_provision'] = "සමස්ත සුදුසුකම් නීති ප්‍රතිපාදනය:";
siContent['msg_disclaimer_living'] = "වියාචනය: මෙම ද්වාරය සත්‍ය සිදුවීම් සඳහා වේ. ජීවත්ව සිටින අයෙකු සුදුසුකම් පරීක්ෂා කරන්නේ නම්, එය ඔවුන්ගේම කැමැත්ත මත වන අතර ව.ක්ෂේ. ප්‍රතිලාභ හිමිවන්නේ දායකයාගේ අභාවයෙන් පසුව පමණි. ඔබට උපකල්පිත මරණ/අතුරුදන් වූ දිනයක් ඇතුළත් කළ හැකි අතර, මරණ සහතික අංකය ලෙස '0000' භාවිතා කළ හැක.";
siContent['btn_print_rejection_report'] = "ප්‍රතික්ෂේපිත වාර්තාව මුද්‍රණය කරන්න";
fs.writeFileSync(siPath, JSON.stringify(siContent, null, 2), 'utf8');

// 3. Update Tamil translations
let taPath = './src/locales/ta.json';
if (fs.existsSync(taPath)) {
  let taContent = JSON.parse(fs.readFileSync(taPath, 'utf8'));
  taContent['lbl_overall_legal_provision'] = "ஒட்டுமொத்த தகுதி சட்ட ஏற்பாடு:";
  taContent['msg_disclaimer_living'] = "மறுப்பு: இந்த போர்ட்டல் உண்மையான சம்பவங்களுக்கானது. உயிருடன் இருக்கும்போது தகுதியை சரிபார்த்தால், அது உங்கள் சொந்த விருப்பப்படி இருக்கும். வி&அ நன்மைகள் பங்களிப்பாளர் இறந்த பிறகே பொருந்தும். நீங்கள் விரும்பிய கற்பனையான இறப்பு/காணாமல் போன தேதியையும், இறப்பு சான்றிதழ் எண்ணாக '0000' ஐயும் உள்ளிடலாம்.";
  taContent['btn_print_rejection_report'] = "நிராகரிப்பு அறிக்கையை அச்சிடுக";
  fs.writeFileSync(taPath, JSON.stringify(taContent, null, 2), 'utf8');
}

// 4. Update App.jsx
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// Replacement 1: Age at marriage for Spouse
const search1 = `{m.s_dob && <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age')}: {computeDynamicAge(m.s_dob)}</span>}`;
const replace1 = `{m.s_dob && <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age')}: {computeDynamicAge(m.s_dob)}</span>}
                  {m.s_dob && m.date && <span className="inline-block mt-1 ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded">{t('lbl_age_at_marriage')}: {computeFullAge(m.s_dob, m.date)}</span>}`;
src = src.replace(search1, replace1);

// Replacement 2: Disclaimer below DOD
const search2 = `{formErrors.p1dod && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dod}</div>}
              </>`;
const replace2 = `{formErrors.p1dod && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dod}</div>}
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded shadow-sm leading-tight">{t('msg_disclaimer_living')}</div>
              </>`;
src = src.replace(search2, replace2);

// Replacement 3: Disclaimer below Missing Person Police Complaint Date
const search3 = `{t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}
                  </span>
                )}`;
const replace3 = `{t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}
                  </span>
                )}
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded shadow-sm leading-tight">{t('msg_disclaimer_living')}</div>`;
src = src.replace(search3, replace3);

// Replacement 4: Print Button in Rejection Screen
const search4 = `<button className="btn mt-8" style={{ background: 'var(--error)' }} onClick={() => resetApp()}>{t('btn_acknowledge_exit')}</button>
          </div>`;
const replace4 = `<button className="btn mt-8" style={{ background: 'var(--error)' }} onClick={() => resetApp()}>{t('btn_acknowledge_exit')}</button>
            <button className="btn mt-8 ml-4" style={{ background: '#334155', color: '#fff' }} onClick={() => handlePrint('rejection')}>{t('btn_print_rejection_report')}</button>
          </div>`;
src = src.replace(search4, replace4);

// Replacement 5: Add Printable Rejection Report section
const search5 = `{/* --- PRINT: ELIGIBILITY DETERMINATION REPORT ONLY --- */}`;
const replace5 = `{/* --- PRINT: REJECTION REPORT --- */}
          <div className={\`print-only \${printMode === 'rejection' ? 'print-active' : ''}\`}>
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

          {/* --- PRINT: ELIGIBILITY DETERMINATION REPORT ONLY --- */}`;
src = src.replace(search5, replace5);

// Replacement 6: Add Overall Eligibility Legal Provision to Print (Section F)
const search6 = `<p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')} | {t('lbl_ref')}{data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')}</p>
            </div>`;
const replace6 = `<p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('lbl_contributor')}: {data.name || t('msg_na')} | {t('lbl_nic')}: {data.nic || t('msg_na')} | {t('lbl_ref')}{data.memberNumber || t('msg_na')}{t('lbl_generated')}{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderLeft: '4px solid #7c3aed', borderRadius: '4px' }}>
              <strong style={{ color: '#1e293b', fontSize: '0.85rem' }}>{t('lbl_overall_legal_provision')}</strong>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>⚖ {getLegalRef(data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'forces_female_regular' : 'forces_male_regular') : (data.gender === 'Female' && data.doa >= '1983-08-01' ? 'female_civil_post1983' : data.gender === 'Male' ? 'male_civil_mandatory' : 'female_civil_pre1983_opt'), i18n.language)}</div>
            </div>`;
src = src.replace(search6, replace6);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('User requested updates applied to App.jsx and locales.');
