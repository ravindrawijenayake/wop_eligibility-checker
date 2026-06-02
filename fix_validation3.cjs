const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// FIX 1: SectionB_C - Add missing required field validations
// (WOP member number, loss of pension date & reason, pensionNotCommenced state)
// ============================================================
src = src.replace(
`          const errsBC = {};
          if (data.isPensioner && !data.dor) errsBC.p1dor = t('err_dor_required');
          if (data.isPensioner && !data.pensionNotCommenced && !data.lastPensionPaymentDate) errsBC.lastPensionDate = t('err_last_pension_required');
          if (data.isPensioner && !data.pensionNotCommenced && data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor) errsBC.lastPensionDate = t('err_last_pension_before_retirement');
          if (Object.keys(errsBC).length > 0) { setFormErrors(prev => ({ ...prev, ...errsBC, global: t('err_global_format') })); return; }`,
`          const errsBC = {};
          // WOP registration
          if (data.registrationValid && !data.memberNumber) errsBC.memberNumber = t('err_member_number_required');
          // Pensioner checks
          if (data.isPensioner && !data.dor) errsBC.p1dor = t('err_dor_required');
          if (data.isPensioner && data.pensionNotCommenced === undefined) errsBC.pensionCommenced = t('err_pension_commenced_required');
          if (data.isPensioner && !data.pensionNotCommenced && !data.lastPensionPaymentDate) errsBC.lastPensionDate = t('err_last_pension_required');
          if (data.isPensioner && !data.pensionNotCommenced && data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor) errsBC.lastPensionDate = t('err_last_pension_before_retirement');
          // In-service (non-pensioner) checks
          if (!data.isPensioner && data.endedWithLossOfPension && !data.lossOfPensionDate) errsBC.lossOfPensionDate = t('err_loss_date_required');
          if (!data.isPensioner && data.endedWithLossOfPension && !data.lossOfPensionReason) errsBC.lossOfPensionReason = t('err_loss_reason_required');
          if (Object.keys(errsBC).length > 0) { setFormErrors(prev => ({ ...prev, ...errsBC, global: t('err_global_format') })); return; }`
);

// ============================================================
// FIX 2: Add red borders + inline errors to SectionB_C fields
// ============================================================

// Member number field
src = src.replace(
  `        {data.registrationValid && (
          <div className="mt-3 form-row max-w-sm"><label className="label">{t('lbl_wop_no')}</label><input type="text" className="form-input" value={data.memberNumber} onChange={e => updateData('memberNumber', e.target.value)} /></div>
        )}`,
  `        {data.registrationValid && (
          <div className="mt-3 form-row max-w-sm">
            <label className={formErrors.memberNumber ? 'label text-error font-bold' : 'label'}>{t('lbl_wop_no')}</label>
            <input type="text" className={\`form-input \${formErrors.memberNumber ? 'border-[2px] border-error text-error' : ''}\`} value={data.memberNumber} onChange={e => { updateData('memberNumber', e.target.value); setFormErrors(p => ({ ...p, memberNumber: null })); }} />
            {formErrors.memberNumber && <div className="text-error text-xs font-bold mt-1">{formErrors.memberNumber}</div>}
          </div>
        )}`
);

// Loss of pension date field - add red border
src = src.replace(
  `              <label className="label">{t('lbl_loss_date')}</label>
              <input type="date" min="1900-01-01" className="form-input mb-4" value={data.lossOfPensionDate} onChange={e => updateData('lossOfPensionDate', e.target.value)} />`,
  `              <label className={formErrors.lossOfPensionDate ? 'label text-error font-bold' : 'label'}>{t('lbl_loss_date')}</label>
              <input type="date" min="1900-01-01" className={\`form-input mb-1 \${formErrors.lossOfPensionDate ? 'border-[2px] border-error text-error' : ''}\`} value={data.lossOfPensionDate} onChange={e => { updateData('lossOfPensionDate', e.target.value); setFormErrors(p => ({ ...p, lossOfPensionDate: null })); }} />
              {formErrors.lossOfPensionDate && <div className="text-error text-xs font-bold mb-3">{formErrors.lossOfPensionDate}</div>}`
);

// Loss reason radio group - add red highlight
src = src.replace(
  `              <label className="label">{t('lbl_loss_reason')}</label>
              <div className="flex flex-col gap-2 mb-2">
                <label><input type="radio" checked={data.lossOfPensionReason === 'Abolished Post'} onChange={() => updateData('lossOfPensionReason', 'Abolished Post')} /> Retired due to close of institution or abolish Designation/Post</label>
                <label><input type="radio" checked={data.lossOfPensionReason === 'Other'} onChange={() => updateData('lossOfPensionReason', 'Other')} /> Other Reasons</label>
              </div>`,
  `              <label className={formErrors.lossOfPensionReason ? 'label text-error font-bold' : 'label'}>{t('lbl_loss_reason')}</label>
              <div className={\`flex flex-col gap-2 mb-2 p-2 rounded \${formErrors.lossOfPensionReason ? 'border-[2px] border-error bg-red-50' : ''}\`}>
                <label><input type="radio" checked={data.lossOfPensionReason === 'Abolished Post'} onChange={() => { updateData('lossOfPensionReason', 'Abolished Post'); setFormErrors(p => ({ ...p, lossOfPensionReason: null })); }} /> Retired due to close of institution or abolish Designation/Post</label>
                <label><input type="radio" checked={data.lossOfPensionReason === 'Other'} onChange={() => { updateData('lossOfPensionReason', 'Other'); setFormErrors(p => ({ ...p, lossOfPensionReason: null })); }} /> Other Reasons</label>
              </div>
              {formErrors.lossOfPensionReason && <div className="text-error text-xs font-bold mb-2">{formErrors.lossOfPensionReason}</div>}`
);

// ============================================================
// FIX 3: SectionD - validate marriage date & cert required per marriage
// ============================================================
src = src.replace(
`            let errs = {};
            let fatals = [];
            for (let i = 0; i < data.contributorMarriages.length; i++) {
              let m = data.contributorMarriages[i];
              const ageAtMarriage = m.date && data.dob ? computeAgeAtDate(data.dob, m.date) : '';
              const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
              if (data.dor && m.date && m.date > data.dor && !allowedPostRet) {
                fatals.push(\`\${t('lbl_marriage_record_n')} \${i + 1}: \${t('err_fatal_marriage_post_ret')}\`);
              }
              if (m.cert && !/^\\d+$/.test(m.cert)) {
                errs[\`contributorMarriages_\${i}_cert\`] = t('err_numeric_required');
              }
            }`,
`            let errs = {};
            let fatals = [];
            for (let i = 0; i < data.contributorMarriages.length; i++) {
              let m = data.contributorMarriages[i];
              const ageAtMarriage = m.date && data.dob ? computeAgeAtDate(data.dob, m.date) : '';
              const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
              // Required: marriage date
              if (!m.date) errs[\`contributorMarriages_\${i}_date\`] = t('err_marriage_date_required');
              // Required: cert number if registered
              if (!m.isUnregistered && !m.cert) errs[\`contributorMarriages_\${i}_cert\`] = t('err_cert_required');
              if (m.cert && !/^\\d+$/.test(m.cert)) errs[\`contributorMarriages_\${i}_cert\`] = t('err_numeric_required');
              // Required: spouse name
              if (!m.s_name) errs[\`contributorMarriages_\${i}_s_name\`] = t('err_spouse_name_required');
              // Termination dates when applicable
              if (m.s_term === 'Legally Divorced') {
                if (!m.s_nisi_date) errs[\`contributorMarriages_\${i}_s_nisi_date\`] = t('err_decree_nisi_required');
                if (!m.s_div_date) errs[\`contributorMarriages_\${i}_s_div_date\`] = t('err_decree_absolute_required');
              }
              if (m.s_term === 'Separated' && !m.s_sep_date) errs[\`contributorMarriages_\${i}_s_sep_date\`] = t('err_sep_date_required');
              if (m.s_term === 'Void') {
                if (!m.s_void_date) errs[\`contributorMarriages_\${i}_s_void_date\`] = t('err_void_date_required');
                if (!m.s_void_court) errs[\`contributorMarriages_\${i}_s_void_court\`] = t('err_void_court_required');
                if (!m.s_void_case) errs[\`contributorMarriages_\${i}_s_void_case\`] = t('err_void_case_required');
              }
              if (m.s_remarried && !m.s_remarriage_date) errs[\`contributorMarriages_\${i}_s_rem_date\`] = t('err_remarriage_date_required');
              if ((!m.s_alive || m.s_term === 'Ended: Demise of Spouse') && !m.s_dod) errs[\`contributorMarriages_\${i}_s_dod\`] = t('err_spouse_dod_required');
              // Children DOB required
              (m.children || []).forEach((c, j) => {
                if (!c.dob) errs[\`contributorMarriages_\${i}_c_\${j}_dob\`] = t('err_child_dob_required');
              });
              if (data.dor && m.date && m.date > data.dor && !allowedPostRet) {
                fatals.push(\`\${t('lbl_marriage_record_n')} \${i + 1}: \${t('err_fatal_marriage_post_ret')}\`);
              }
            }`
);

// ============================================================
// FIX 4: SectionE - same required field validation for applicant marriages  
// ============================================================
src = src.replace(
`          let errs = {};
          let fatals = [];
          for (let i = 0; i < data.applicantMarriages.length; i++) {
            const ageAtMarriage = data.applicantMarriages[i].date && data.dob ? computeAgeAtDate(data.dob, data.applicantMarriages[i].date) : '';
            const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
            if (data.dor && data.applicantMarriages[i].date > data.dor && !allowedPostRet) {
              fatals.push(\`\${t('lbl_marriage_idx')} \${i + 1}: \${t('err_applicant_marriage_post_ret')}\`);
            }
            if (data.applicantMarriages[i].cert && !/^\\d+$/.test(data.applicantMarriages[i].cert)) {
              errs[\`applicantMarriages_\${i}_cert\`] = t('err_numeric_required');
            }
          }`,
`          let errs = {};
          let fatals = [];
          for (let i = 0; i < data.applicantMarriages.length; i++) {
            const m = data.applicantMarriages[i];
            const ageAtMarriage = m.date && data.dob ? computeAgeAtDate(data.dob, m.date) : '';
            const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
            const isContributorSlot = i === (data.app_contributor_marriage_index || 0);
            if (!isContributorSlot) {
              // Only validate non-contributor slots (contributor slot data comes from Section D)
              if (!m.date) errs[\`applicantMarriages_\${i}_date\`] = t('err_marriage_date_required');
              if (!m.isUnregistered && !m.cert) errs[\`applicantMarriages_\${i}_cert\`] = t('err_cert_required');
              if (!m.s_name) errs[\`applicantMarriages_\${i}_s_name\`] = t('err_spouse_name_required');
              if (m.s_term === 'Legally Divorced') {
                if (!m.s_nisi_date) errs[\`applicantMarriages_\${i}_s_nisi_date\`] = t('err_decree_nisi_required');
                if (!m.s_div_date) errs[\`applicantMarriages_\${i}_s_div_date\`] = t('err_decree_absolute_required');
              }
              if (m.s_term === 'Separated' && !m.s_sep_date) errs[\`applicantMarriages_\${i}_s_sep_date\`] = t('err_sep_date_required');
              if (m.s_term === 'Void') {
                if (!m.s_void_date) errs[\`applicantMarriages_\${i}_s_void_date\`] = t('err_void_date_required');
                if (!m.s_void_court) errs[\`applicantMarriages_\${i}_s_void_court\`] = t('err_void_court_required');
                if (!m.s_void_case) errs[\`applicantMarriages_\${i}_s_void_case\`] = t('err_void_case_required');
              }
              if (m.s_remarried && !m.s_remarriage_date) errs[\`applicantMarriages_\${i}_s_rem_date\`] = t('err_remarriage_date_required');
              if ((!m.s_alive || m.s_term === 'Ended: Demise of Spouse') && !m.s_dod) errs[\`applicantMarriages_\${i}_s_dod\`] = t('err_spouse_dod_required');
            }
            if (m.cert && !/^\\d+$/.test(m.cert)) errs[\`applicantMarriages_\${i}_cert\`] = t('err_numeric_required');
            if (data.dor && m.date && m.date > data.dor && !allowedPostRet) {
              fatals.push(\`\${t('lbl_marriage_idx')} \${i + 1}: \${t('err_applicant_marriage_post_ret')}\`);
            }
          }
          // Applicant remarriage date required if remarried
          if (data.a_remarried && !data.a_remarriage_date) errs.a_remarriage_date = t('err_remarriage_date_required');`
);

// ============================================================
// FIX 5: Add red border + error to spouse name field in marriage builder
// ============================================================
// The spouse name input currently has no error state
src = src.replace(
  `              <div className="form-row"><label className="label text-muted text-xs">{t('lbl_spouse_name')}</label><input type="text" placeholder={t('lbl_spouse_name')} className="form-input" value={m.s_name || ''} onChange={e => updateMar(i, 's_name', e.target.value)} /></div>`,
  `              <div className="form-row">
                <label className={\`label text-muted text-xs \${formErrors[\`\${arrKey}_\${i}_s_name\`] ? 'text-error font-bold' : ''}\`}>{t('lbl_spouse_name')}</label>
                <input type="text" placeholder={t('lbl_spouse_name')} className={\`form-input \${formErrors[\`\${arrKey}_\${i}_s_name\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.s_name || ''} onChange={e => { updateMar(i, 's_name', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_s_name\`]: null })); }} />
                {formErrors[\`\${arrKey}_\${i}_s_name\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_s_name\`]}</div>}
              </div>`
);

// ============================================================
// FIX 6: Add red border to applicant remarriage date
// ============================================================
src = src.replace(
  `            <input type="date" min="1900-01-01" className="form-input border-amber max-w-sm" value={data.a_remarriage_date || ''} onChange={e => updateData('a_remarriage_date', e.target.value)} />`,
  `            <input type="date" min="1900-01-01" className={\`form-input max-w-sm \${formErrors.a_remarriage_date ? 'border-[2px] border-error text-error' : 'border-amber'}\`} value={data.a_remarriage_date || ''} onChange={e => { updateData('a_remarriage_date', e.target.value); setFormErrors(p => ({ ...p, a_remarriage_date: null })); }} />
            {formErrors.a_remarriage_date && <div className="text-error text-xs font-bold mt-1">{formErrors.a_remarriage_date}</div>}`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done — comprehensive required field validation added to all sections.');
