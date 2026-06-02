const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// Fix 1: All bare 'border-error text-error' (without border-[2px]) in form-input className conditions
// Pattern: border-error text-error (not preceded by border-[2px] )
src = src.replace(/(?<!border-\[2px\] )border-error text-error/g, 'border-[2px] border-error text-error');

// Fix 2: SectionD hardcoded English global error
src = src.replace(
  `setFormErrors({ ...formErrors, ...errs, global: "Format Error: Please review the RED bordered fields to resolve structural errors before submitting." });`,
  `setFormErrors({ ...formErrors, ...errs, global: t('err_format_red_fields') });`
);

// Fix 3: SectionB_C next button - add proper field-level validation before proceeding
// Find the SectionB_C Next button and add validation for missing required fields
src = src.replace(
  `        <button className="btn" onClick={() => {\n          if (!data.isPensioner && data.endedWithLossOfPension && data.lossOfPensionReason === 'Other') {`,
  `        <button className="btn" onClick={() => {\n          const errsBC = {};\n          if (data.isPensioner && !data.dor) errsBC.p1dor = t('err_dor_required');\n          if (data.isPensioner && !data.pensionNotCommenced && !data.lastPensionPaymentDate) errsBC.lastPensionDate = t('err_last_pension_required');\n          if (data.isPensioner && !data.pensionNotCommenced && data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor) errsBC.lastPensionDate = t('err_last_pension_before_retirement');\n          if (Object.keys(errsBC).length > 0) { setFormErrors(prev => ({ ...prev, ...errsBC, global: t('err_global_format') })); return; }\n          if (!data.isPensioner && data.endedWithLossOfPension && data.lossOfPensionReason === 'Other') {`
);

// Fix 4: Add lastPensionDate field-level error display in SectionB_C
src = src.replace(
  `                  {data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor && (
                    <div className="text-error text-xs font-bold mt-1">{t('err_last_pension_before_retirement')}</div>
                  )}`,
  `                  {(formErrors.lastPensionDate) && (
                    <div className="text-error text-xs font-bold mt-1">{formErrors.lastPensionDate}</div>
                  )}
                  {data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor && !formErrors.lastPensionDate && (
                    <div className="text-error text-xs font-bold mt-1">{t('err_last_pension_before_retirement')}</div>
                  )}`
);

// Fix 5: Add red border to lastPensionPaymentDate input when lastPensionDate error
src = src.replace(
  'className={`form-input border-primary ${data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor ? \'border-[2px] border-error text-error\' : \'\'}`}',
  'className={`form-input ${formErrors.lastPensionDate ? \'border-[2px] border-error text-error\' : (data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor ? \'border-[2px] border-error text-error\' : \'border-primary\')}`}'
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');

// Count fixes
const fixes = (src.match(/border-\[2px\] border-error/g) || []).length;
console.log(`Done. Total border-[2px] border-error occurrences: ${fixes}`);
