const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// PHASE 4: Orphan eligibility text citations + result screen + print
// ============================================================

// 4A: Orphan eligibilityText — append legal ref key to each eligibility text
// These are used in the result beneficiary table
src = src.replace(
  `          eligibilityText = 'Eligible Orphan (Under 26, Unemployed)';`,
  `          eligibilityText = 'Eligible Orphan (Under 26, Unemployed)';
          eligibilityText += ' [REF:orphan_age_26_unemployed]';`
);

src = src.replace(
  `            eligibilityText = 'Eligible Orphan (Under 26 + Valid Main Medical Board Cert)';`,
  `            eligibilityText = 'Eligible Orphan (Under 26 + Valid Main Medical Board Cert)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';`
);

src = src.replace(
  `            eligibilityText = 'Disabled Pension Deferred (Active primary spouse maintains care capability)';`,
  `            eligibilityText = 'Disabled Pension Deferred (Active primary spouse maintains care capability)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';`
);

src = src.replace(
  `            eligibilityText = 'Lifetime Disabled Pension Activated (Valid Medical Board Cert + Priority Care Nullified)';`,
  `            eligibilityText = 'Lifetime Disabled Pension Activated (Valid Medical Board Cert + Priority Care Nullified)';
            eligibilityText += ' [REF:disabled_orphan_lifelong]';`
);

// 4B: Remarriage 50% share — add citation to the beneficiary result card
// Find the remarried spouse share display in SectionF result
src = src.replace(
  `const showSpouseInTable = !spouseLostPrimary || (activeSpouseRemarried && !hasAnyOrphans);`,
  `const showSpouseInTable = !spouseLostPrimary || (activeSpouseRemarried && !hasAnyOrphans);
      // Remarriage legal ref key depends on contributor gender
      const remarriageLegalRef = data.gender === 'Female' ? 'remarriage_50pct_male' : 'remarriage_50pct_female';`
);

// 4C: Update the orphan eligibility display in result to strip [REF:key] and show LegalBadge
// Find where eligibilityText is rendered in the result beneficiary table
src = src.replace(
  `{o.eligibilityText}`,
  `{o.eligibilityText.replace(/ \[REF:[^\]]+\]/g, '')}
                          {(() => { const m = o.eligibilityText.match(/\[REF:([^\]]+)\]/); return m ? <LegalBadge key="orphan-ref" refKey={m[1]} lang={i18n.language} className="ml-1" /> : null; })()}`
);

// 4D: Add citation to remarriage 50% row in beneficiary table
src = src.replace(
  `{activeSpouseRemarried && <span className="text-xs text-amber font-bold ml-2">{t('msg_remarriage_note')}</span>}`,
  `{activeSpouseRemarried && <><span className="text-xs text-amber font-bold ml-2">{t('msg_remarriage_note')}</span><LegalBadge refKey={remarriageLegalRef} lang={i18n.language} className="ml-1" /></>}`
);

// 4E: Print summary — add legal ref column to contributor table (DOA row)
src = src.replace(
  `                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_doa')}</td>
                   <td style={{ padding: '0.5rem' }}>{formatDate(data.doa)}{data.dob && data.doa ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span> : ''}</td>
                 </tr>`,
  `                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_doa')}</td>
                   <td style={{ padding: '0.5rem' }}>
                     {formatDate(data.doa)}{data.dob && data.doa ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span> : ''}
                     <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px' }}>⚖ {getLegalRef(data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'forces_female_regular' : 'forces_male_regular') : (data.gender === 'Female' && data.doa >= '1983-08-01' ? 'female_civil_post1983' : data.gender === 'Male' ? 'male_civil_mandatory' : 'female_civil_pre1983_opt'), i18n.language)}</div>
                   </td>
                 </tr>`
);

// 4F: Print summary — add legal ref below marriage date in marriage table
src = src.replace(
  `                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, width: '40%', color: '#475569' }}>{t('lbl_date_of_marriage')}</td><td style={{ padding: '0.3rem' }}>{formatDate(m.date) || t('msg_na')}{data.dob && m.date ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>{t('lbl_age_at_marriage')}: {computeFullAge(data.dob, m.date)}</span> : ''}</td></tr>`,
  `                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, width: '40%', color: '#475569' }}>{t('lbl_date_of_marriage')}</td><td style={{ padding: '0.3rem' }}>
                      {formatDate(m.date) || t('msg_na')}{data.dob && m.date ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>{t('lbl_age_at_marriage')}: {computeFullAge(data.dob, m.date)}</span> : ''}
                      <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '1px' }}>⚖ {getLegalRef(data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'marriage_1yr_female_forces' : 'marriage_1yr_male_forces') : (data.gender === 'Female' ? 'marriage_1yr_female_civil' : 'marriage_1yr_male_civil'), i18n.language)}</div>
                    </td></tr>`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Phase 4 done: orphan refs, result screen, print citations.');
