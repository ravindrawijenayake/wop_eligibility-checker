const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// FIX 1: Show time elapsed below police complaint date (Part1A form)
// ============================================================
src = src.replace(
`                <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1police ? 'border-[2px] border-error text-error' : ''}\`} value={data.policeComplaintDate} onChange={e => { updateData('policeComplaintDate', e.target.value); setFormErrors(p => ({ ...p, p1police: null })); }} />
                {formErrors.p1police && <div className="text-error text-xs font-bold mt-1">{formErrors.p1police}</div>}
                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>`,
`                <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1police ? 'border-[2px] border-error text-error' : ''}\`} value={data.policeComplaintDate} onChange={e => { updateData('policeComplaintDate', e.target.value); setFormErrors(p => ({ ...p, p1police: null })); }} />
                {formErrors.p1police && <div className="text-error text-xs font-bold mt-1">{formErrors.p1police}</div>}
                {data.policeComplaintDate && !formErrors.p1police && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber text-white text-xs font-bold rounded">
                    {t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}
                  </span>
                )}
                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>`
);

// ============================================================
// FIX 2: Print summary — add age at DOB (current age)
// ============================================================
src = src.replace(
`                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dob')}</td>
                   <td style={{ padding: '0.5rem' }}>{formatDate(data.dob)}</td>
                 </tr>`,
`                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dob')}</td>
                   <td style={{ padding: '0.5rem' }}>{formatDate(data.dob)}{data.dob ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_age')}: {computeDynamicAge(data.dob)} yrs</span> : ''}</td>
                 </tr>`
);

// ============================================================
// FIX 3: Print summary — add time elapsed after police complaint date row
// (the DOD row for missing persons shows the complaint date)
// Replace the combined DOD/police row to show elapsed time
// ============================================================
src = src.replace(
`                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dod')}</td>
                   <td style={{ padding: '0.5rem' }}>{data.isMissingPerson ? t('msg_missing_person_police').replace('{date}', formatDate(data.policeComplaintDate) || t('msg_na')) : formatDate(data.dod)}</td>
                 </tr>`,
`                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{data.isMissingPerson ? t('lbl_date_police') : t('lbl_dod')}</td>
                   <td style={{ padding: '0.5rem' }}>
                     {data.isMissingPerson
                       ? <>{formatDate(data.policeComplaintDate) || t('msg_na')}{data.policeComplaintDate ? <span style={{ marginLeft: '0.5rem', background: '#b45309', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}</span> : ''}</>
                       : formatDate(data.dod)}
                   </td>
                 </tr>`
);

// ============================================================
// FIX 4: Print summary — add age at appointment after DOA row
// ============================================================
src = src.replace(
`                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_doa')}</td>
                   <td style={{ padding: '0.5rem' }}>{formatDate(data.doa)}</td>
                 </tr>`,
`                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                   <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_doa')}</td>
                   <td style={{ padding: '0.5rem' }}>{formatDate(data.doa)}{data.dob && data.doa ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span> : ''}</td>
                 </tr>`
);

// ============================================================
// FIX 5: Print summary — add age at retirement after DOR row
// ============================================================
src = src.replace(
`                 {data.isPensioner && (
                   <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                     <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dor')}</td>
                     <td style={{ padding: '0.5rem' }}>{formatDate(data.dor)}</td>
                   </tr>
                 )}`,
`                 {data.isPensioner && (
                   <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                     <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_dor')}</td>
                     <td style={{ padding: '0.5rem' }}>{formatDate(data.dor)}{data.dob && data.dor ? <span style={{ marginLeft: '0.5rem', background: '#1e3a5f', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_age_at_retirement')}: {computeFullAge(data.dob, data.dor)}</span> : ''}</td>
                   </tr>
                 )}`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done.');
