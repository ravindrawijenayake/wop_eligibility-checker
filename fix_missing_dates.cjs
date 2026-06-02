const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// FIX 1: Add foreignMinistryDate to initial state
// ============================================================
src = src.replace(
  `isMissingPerson: false, policeComplaintDate: '', missingLocation: '', diedDueToTerrorism: false,`,
  `isMissingPerson: false, policeComplaintDate: '', missingLocation: '', foreignMinistryDate: '', diedDueToTerrorism: false,`
);

// ============================================================
// FIX 2: Swap waiting period months (pensioner=4, in-service=12)
// and use the correct reference date
// ============================================================
src = src.replace(
  `      if (data.isMissingPerson && data.policeComplaintDate) {
        const complaintDate = new Date(data.policeComplaintDate);
        const now = new Date();
        const diffTime = Math.abs(now - complaintDate);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
        if (!data.isPensioner && diffMonths < 4) {
          handleRejection(t('err_missing_active_4m'));
          return;
        } else if (data.isPensioner && diffMonths < 12) {
          handleRejection(t('err_missing_retired_12m'));`,
  `      if (data.isMissingPerson && data.policeComplaintDate) {
        // For abroad: use foreignMinistryDate if provided, else policeComplaintDate
        const refDateStr = (data.missingLocation === 'Abroad' && data.foreignMinistryDate)
          ? data.foreignMinistryDate
          : data.policeComplaintDate;
        const refDate = new Date(refDateStr);
        const now = new Date();
        const diffTime = Math.abs(now - refDate);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
        // Pensioner: 4 months minimum; In-service (before retirement): 12 months minimum
        if (data.isPensioner && diffMonths < 4) {
          handleRejection(t('err_missing_retired_4m'));
          return;
        } else if (!data.isPensioner && diffMonths < 12) {
          handleRejection(t('err_missing_active_12m'));`
);

// ============================================================
// FIX 3: Update overpayment calculator to use foreignMinistryDate when abroad
// ============================================================
src = src.replace(
  `  // --- OVERPAYMENT CALCULATOR ---
  // For deceased pensioners: overpayment = months between dod and lastPensionPaymentDate
  // For missing pensioners: overpayment = months between policeComplaintDate and lastPensionPaymentDate
  const calculateOverpayment = () => {
    if (!data.lastPensionPaymentDate) return 0;
    const refDate = data.isMissingPerson ? data.policeComplaintDate : data.dod;
    if (!refDate) return 0;
    const refDt = new Date(refDate);
    const lppDt = new Date(data.lastPensionPaymentDate);
    // Overpayment = pension paid after the reference event date
    const diffMonths = (lppDt.getFullYear() - refDt.getFullYear()) * 12 + (lppDt.getMonth() - refDt.getMonth());
    return diffMonths > 0 ? diffMonths : 0;
  };`,
  `  // --- OVERPAYMENT CALCULATOR ---
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
  };`
);

// ============================================================
// FIX 4: Add Foreign Ministry date field in the Abroad guidance block (Part1A)
// ============================================================
src = src.replace(
  `                  {data.missingLocation === 'Abroad' && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-bold animate-fade-in">
                      {t('msg_missing_abroad_doc_note')}
                    </div>
                  )}`,
  `                  {data.missingLocation === 'Abroad' && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded animate-fade-in">
                      <p className="text-xs text-blue-900 font-bold mb-2">{t('msg_missing_abroad_doc_note')}</p>
                      <label className={formErrors.foreignMinistryDate ? 'label text-error font-bold text-xs mb-1' : 'label text-xs mb-1'}>{t('lbl_foreign_ministry_date')}</label>
                      <input type="date" min="1900-01-01" className={\`form-input \${formErrors.foreignMinistryDate ? 'border-[2px] border-error text-error' : 'border-primary'}\`} value={data.foreignMinistryDate || ''} onChange={e => { updateData('foreignMinistryDate', e.target.value); setFormErrors(p => ({ ...p, foreignMinistryDate: null })); }} />
                      {formErrors.foreignMinistryDate && <div className="text-error text-xs font-bold mt-1">{formErrors.foreignMinistryDate}</div>}
                      {data.foreignMinistryDate && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber text-white text-xs font-bold rounded">
                          {t('lbl_time_since_complaint')}: {computeFullAge(data.foreignMinistryDate, new Date().toISOString().slice(0, 10))}
                        </span>
                      )}
                      <p className="text-[10px] text-blue-700 mt-1">{t('msg_foreign_ministry_date_note')}</p>
                    </div>
                  )}`
);

// ============================================================
// FIX 5: Validate foreignMinistryDate required when abroad
// Add after missingLocation validation in Part1A handleNext
// ============================================================
src = src.replace(
  `      if (data.isMissingPerson && !data.missingLocation) errs.missingLocation = t('err_missing_location_required');`,
  `      if (data.isMissingPerson && !data.missingLocation) errs.missingLocation = t('err_missing_location_required');
      if (data.isMissingPerson && data.missingLocation === 'Abroad' && !data.foreignMinistryDate) errs.foreignMinistryDate = t('err_foreign_ministry_date_required');`
);

// ============================================================
// FIX 6: Show foreignMinistryDate in the print summary
// Add after the police complaint date row (line ~2232)
// ============================================================
src = src.replace(
  `                   <td style={{ padding: '0.5rem' }}>
                     {data.isMissingPerson
                       ? <>{formatDate(data.policeComplaintDate) || t('msg_na')}{data.policeComplaintDate ? <span style={{ marginLeft: '0.5rem', background: '#b45309', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}</span> : ''}</>
                       : formatDate(data.dod)}
                   </td>`,
  `                   <td style={{ padding: '0.5rem' }}>
                     {data.isMissingPerson
                       ? <>{formatDate(data.policeComplaintDate) || t('msg_na')}{data.policeComplaintDate ? <span style={{ marginLeft: '0.5rem', background: '#b45309', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}</span> : ''}</>
                       : formatDate(data.dod)}
                   </td>`
  + `
                 {data.isMissingPerson && data.missingLocation && (
                   <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                     <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_missing_location')}</td>
                     <td style={{ padding: '0.5rem' }}>{data.missingLocation === 'Abroad' ? t('opt_missing_abroad') : t('opt_missing_sri_lanka')}</td>
                   </tr>
                 )}
                 {data.isMissingPerson && data.missingLocation === 'Abroad' && data.foreignMinistryDate && (
                   <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                     <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>{t('lbl_foreign_ministry_date')}</td>
                     <td style={{ padding: '0.5rem' }}>{formatDate(data.foreignMinistryDate)}{<span style={{ marginLeft: '0.5rem', background: '#b45309', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{t('lbl_time_since_complaint')}: {computeFullAge(data.foreignMinistryDate, new Date().toISOString().slice(0, 10))}</span>}</td>
                   </tr>
                 )}`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done.');
