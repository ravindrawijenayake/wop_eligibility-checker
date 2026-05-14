import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCircle2, ShieldCheck, Shield, ChevronRight, ChevronLeft, CalendarCheck, AlertTriangle, CheckCircle, XCircle, PieChart, Printer, Activity } from 'lucide-react';
import './App.css';
import bannerImg from './assets/WOP_banner.png';

// --- UTILITIES ---
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
    isMissingPerson: false, policeComplaintDate: '', diedDueToTerrorism: false,
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
  const calculateOverpayment = () => {
    if (!data.dod || !data.lastPensionPaymentDate) return 0;
    const dodDt = new Date(data.dod);
    const lppDt = new Date(data.lastPensionPaymentDate);
    // Standard Overpayment Month Difference Calculation
    const diffMonths = (lppDt.getFullYear() - dodDt.getFullYear()) * 12 + (lppDt.getMonth() - dodDt.getMonth());
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
          if (child.is_disabled && child.dis_before_26 && child.health_307 && child.med_board && child.med_board_date) {
            isEligibleDisabled = true;
            eligibilityText = 'Eligible Orphan (Under 26 + Valid Main Medical Board Cert)';
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
          } else {
            isEligibleDisabled = true;
            eligibilityText = 'Lifetime Disabled Pension Activated (Valid Medical Board Cert + Priority Care Nullified)';
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
    docs.push({ id: 'c_dc', label: `${contributorPrefix} Death Certificate [Original certified by Additional/District Registrar]`, required: true });
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
    <div className="animate-fade-in py-8 px-4">
      <div className="flex justify-center mb-6"><UserCircle2 size={64} className="text-primary" /></div>
      <h2 className="text-3xl font-bold mb-2 text-center">{t('app_title')}</h2>
      <p className="text-center text-muted mb-8 font-bold">{t('select_role')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button className={`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all ${userRole === 'Public' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}`} onClick={() => setUserRole('Public')}>
          {t('role_public')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_public_desc')}</span>
        </button>
        <button className={`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all ${userRole === 'WorkingPlace' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}`} onClick={() => setUserRole('WorkingPlace')}>
          {t('role_workplace')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_workplace_desc')}</span>
        </button>
        <button className={`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all ${userRole === 'DivSec' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}`} onClick={() => setUserRole('DivSec')}>
          {t('role_divsec')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_divsec_desc')}</span>
        </button>
        <button className={`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all ${userRole === 'HeadOffice' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}`} onClick={() => setUserRole('HeadOffice')}>
          {t('role_headoffice')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_headoffice_desc')}</span>
        </button>
      </div>

      {authMode === 'login' && (
        <div className="space-y-4 bg-surface-alt p-6 rounded-xl border border-subtle relative overflow-hidden">
          <h3 className="font-bold text-xl mb-4 text-primary">Authenticate Identity</h3>
          <div className="form-row"><label className="label">Verification ID / Username</label><input type="text" className="form-input" defaultValue={userRole === 'Public' ? 'Citizen-Token' : 'Admin-Sys'} /></div>
          <div className="form-row"><label className="label">Secure Password</label><input type="password" className="form-input" defaultValue="password" /></div>

          {userRole !== 'Public' && (
            <div className="form-row mt-2">
              <label className="label">Institution Verification Hash</label>
              <input type="text" className="form-input" placeholder="Institution Reg No. / Code" />
            </div>
          )}

          <button className="btn w-full mt-4 bg-primary text-white hover:opacity-90 transition-opacity" onClick={() => setViewState('checker')}>{t('btn_continue')}</button>
          <div className="flex justify-between mt-4 text-xs font-bold text-primary cursor-pointer hover:underline">
            <span onClick={() => setAuthMode('register')}>Request Agency Access</span>
            <span onClick={() => setAuthMode('forgot')}>Forgot Secure Credentials?</span>
          </div>
        </div>
      )}
      {authMode === 'register' && (
        <div className="space-y-4 bg-surface-alt p-6 rounded border border-subtle">
          <p className="font-bold text-center">Registration Framework Active</p>
          <button className="btn w-full mt-4" onClick={() => setAuthMode('login')}>Mock Register & Return</button>
        </div>
      )}
      {authMode === 'forgot' && (<div className="space-y-4 bg-surface-alt p-6 rounded"><button className="btn w-full mt-4" onClick={() => setAuthMode('login')}>Back to Login Terminal</button></div>)}
    </div>
  );

  const Part1A = () => {
    const handleNext = () => {
      let errs = {};
      if (!data.name) errs.p1name = 'Required';
      if (!data.nic) errs.p1nic = 'Required';
      if (!data.dob) errs.p1dob = 'Required';
      if (!data.isMissingPerson && !data.dod) errs.p1dod = 'Required';
      if (!data.isMissingPerson && data.dod && !data.deathCertNo) errs.p1deathCert = t('err_death_cert_required');
      if (data.isMissingPerson && !data.policeComplaintDate) errs.p1police = 'Required';
      if (data.serviceSector === 'Forces' && !data.officerNumber) errs.p1officerNo = t('err_officer_number_required');
      if (data.isPensioner && !data.dor) errs.p1dor = t('err_dor_required');

      if (Object.keys(errs).length > 0) {
        setFormErrors({ ...errs, global: t('err_global_format') });
        return;
      }

      const nicCheck = validateSLNIC(data.nic, data.dob, data.gender);
      if (!nicCheck.valid) { setFormErrors({ ...formErrors, p1nic: nicCheck.error, p1dob: "Format Mismatch", global: t('err_global_nic_format') + nicCheck.error }); return; }

      if (!data.isMissingPerson && data.dod && data.dob && new Date(data.dod) < new Date(data.dob)) { handleRejection([t('err_invalid_lifecycle')]); return; }

      // Statutory 65 Threshold Check for In-Service Demise
      if (!data.isPensioner && !data.isMissingPerson && data.dod && data.dob) {
        const ageAtDeath = computeAgeAtDate(data.dob, data.dod);
        if (ageAtDeath !== '' && ageAtDeath > 65) {
          handleRejection(t('err_statutory_65'));
          return;
        }
      }

      if (data.isMissingPerson && data.policeComplaintDate) {
        const complaintDate = new Date(data.policeComplaintDate);
        const now = new Date();
        const diffTime = Math.abs(now - complaintDate);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
        if (!data.isPensioner && diffMonths < 4) {
          handleRejection(t('err_missing_active_4m'));
          return;
        } else if (data.isPensioner && diffMonths < 12) {
          handleRejection(t('err_missing_retired_12m'));
          return;
        }
      }

      setFormErrors({}); setCheckerStep(1);
    };

    return (
      <div className="animate-fade-in">
        <div className="tag">{t('part1a_title')}</div>
        {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}

        <div className="flex gap-4 mb-6 pt-4 border-t border-subtle items-center">
          <label className="label mb-0">{t('lbl_deceased_status')}</label>
          <label className="flex gap-2"><input type="radio" checked={data.isPensioner} onChange={() => updateData('isPensioner', true)} /> {t('opt_pensioner')}</label>
          <label className="flex gap-2"><input type="radio" checked={!data.isPensioner} onChange={() => updateData('isPensioner', false)} /> {t('opt_before_retirement')}</label>

          <div className="ml-8 border-l border-subtle pl-6 flex items-center gap-2">
            <label className="label mb-0 text-amber font-bold">{t('lbl_is_missing')}</label>
            <input type="checkbox" checked={data.isMissingPerson} onChange={e => updateData('isMissingPerson', e.target.checked)} className="cursor-pointer min-w-[16px] min-h-[16px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="form-row col-span-2"><label className="label">{t('lbl_name_nic')}</label><input type="text" className={`form-input ${formErrors.p1name ? 'border-[2px] border-error text-error' : ''}`} value={data.name} onChange={e => { updateData('name', e.target.value); setFormErrors(p => ({ ...p, p1name: null })); }} /></div>
          <div className="form-row">
            <label className="label">{t('lbl_gender')}</label>
            <select className="form-input font-bold" value={data.gender} onChange={e => updateData('gender', e.target.value)}><option value="Male">{t('opt_male')}</option><option value="Female">{t('opt_female')}</option></select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-row"><label className="label">{t('lbl_dob')}</label><input type="date" min="1900-01-01" className={`form-input ${formErrors.p1dob ? 'border-[2px] border-error text-error' : ''}`} value={data.dob} onChange={e => { updateData('dob', e.target.value); setFormErrors(p => ({ ...p, p1dob: null })); }} />
            {formErrors.p1dob && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dob}</div>}
            {data.dob && !formErrors.p1dob && <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age')}: {computeDynamicAge(data.dob)}</span>}
          </div>
          <div className="form-row">
            <label className="label">{t('lbl_nic')}</label>
            <input type="text" className={`form-input ${formErrors.p1nic ? 'border-[2px] border-error text-error' : ''}`} value={data.nic} onChange={e => { updateData('nic', e.target.value); setFormErrors(p => ({ ...p, p1nic: null })); }} />
            {formErrors.p1nic && <div className="text-error text-xs font-bold mt-1">{formErrors.p1nic}</div>}
          </div>
          <div className="form-row">
            <label className="label">{data.isMissingPerson ? t('lbl_date_police') : t('lbl_dod')}</label>
            {!data.isMissingPerson ? (
              <>
                <input type="date" min="1900-01-01" className={`form-input ${formErrors.p1dod ? 'border-[2px] border-error text-error' : ''}`} value={data.dod} onChange={e => { updateData('dod', e.target.value); setFormErrors(p => ({ ...p, p1dod: null })); }} />
                {formErrors.p1dod && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dod}</div>}
              </>
            ) : (
              <>
                <input type="date" min="1900-01-01" className={`form-input ${formErrors.p1police ? 'border-[2px] border-error text-error' : ''}`} value={data.policeComplaintDate} onChange={e => { updateData('policeComplaintDate', e.target.value); setFormErrors(p => ({ ...p, p1police: null })); }} />
                {formErrors.p1police && <div className="text-error text-xs font-bold mt-1">{formErrors.p1police}</div>}
                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>
              </>
            )}
          </div>
          {data.isPensioner && (
            <div className="form-row animate-fade-in">
              <label className="label">{t('lbl_dor')}</label>
              <input type="date" min="1900-01-01" className={`form-input ${formErrors.p1dor ? 'border-[2px] border-error text-error' : ''}`} value={data.dor} onChange={e => { updateData('dor', e.target.value); setFormErrors(p => ({ ...p, p1dor: null })); }} />
              {formErrors.p1dor && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dor}</div>}
            </div>
          )}
          {!data.isMissingPerson && data.dod && (
            <div className="form-row animate-fade-in">
              <label className="label">{t('lbl_death_cert_no')}</label>
              <input type="text" className={`form-input ${formErrors.p1deathCert ? 'border-[2px] border-error text-error' : ''}`} value={data.deathCertNo} onChange={e => { updateData('deathCertNo', e.target.value); setFormErrors(p => ({ ...p, p1deathCert: null })); }} />
              {formErrors.p1deathCert && <div className="text-error text-xs font-bold mt-1">{formErrors.p1deathCert}</div>}
            </div>
          )}
        </div>

        <div className="button-group flex justify-end"><div></div><button className="btn" onClick={handleNext}>{t('btn_next_section_a')} <ChevronRight size={20} /></button></div>
      </div>
    );
  };

  const SectionA = () => {
    const is45 = isOver45Strict(data.dob, data.doa);

    return (
      <div className="animate-fade-in">
        <div className="tag">{t('section_a_title')}</div>
        {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}

        <div className="mb-6 p-4 bg-surface-alt border border-subtle rounded">
          <label className="label mb-2">{t('lbl_service_sector')}</label>
          <div className="flex gap-4 mb-4">
            <label className="cursor-pointer"><input type="radio" checked={data.serviceSector === 'Civil'} onChange={() => { updateData('serviceSector', 'Civil'); updateData('serviceCategory', ''); }} /> {t('opt_civil')}</label>
            <label className="cursor-pointer"><input type="radio" checked={data.serviceSector === 'Forces'} onChange={() => updateData('serviceSector', 'Forces')} /> {t('opt_forces')}</label>
          </div>
          {data.serviceSector === 'Forces' && (
            <div>
              <label className={`label mb-2 ${formErrors.svcCategory ? 'text-error font-bold' : 'text-primary'}`}>{t('lbl_service_category')} {formErrors.svcCategory && <span className="text-xs">— {formErrors.svcCategory}</span>}</label>
              <div className={`flex gap-4 p-2 rounded ${formErrors.svcCategory ? 'border-[2px] border-error bg-red-50' : ''}`}>
                <label className="cursor-pointer"><input type="radio" checked={data.serviceCategory === 'Regular Force'} onChange={() => { updateData('serviceCategory', 'Regular Force'); setFormErrors(p => ({ ...p, svcCategory: null })); }} /> {t('opt_regular_force')}</label>
                <label className="cursor-pointer"><input type="radio" checked={data.serviceCategory === 'Volunteer Force'} onChange={() => { updateData('serviceCategory', 'Volunteer Force'); setFormErrors(p => ({ ...p, svcCategory: null })); }} /> {t('opt_volunteer_force')}</label>
              </div>
              <div className="mt-4">
                {((data.serviceCategory === 'Regular Force' && data.doa && data.doa <= '1968-09-30') || 
                  (data.serviceCategory === 'Volunteer Force' && data.doa && data.doa <= (data.gender === 'Male' ? '1981-09-01' : '1983-08-01'))) && (
                  <div className="form-row">
                    <label className={`label font-bold ${formErrors.militaryConsentDate ? 'text-error' : 'text-amber'}`}>{t('lbl_military_consent_date')} {formErrors.militaryConsentDate && <span className="text-xs">— {formErrors.militaryConsentDate}</span>}</label>
                    <input type="date" className={`form-input ${formErrors.militaryConsentDate ? 'border-[2px] border-error text-error' : ''}`} value={data.militaryConsentDate} onChange={e => { updateData('militaryConsentDate', e.target.value); setFormErrors(p => ({ ...p, militaryConsentDate: null })); }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="form-row">
            <label className="label">{t('lbl_doa')}</label>
            <input type="date" min="1900-01-01" className={`form-input ${formErrors.doa ? 'border-[2px] border-error text-error' : ''}`} value={data.doa} onChange={e => { updateData('doa', e.target.value); setFormErrors(prev => ({ ...prev, doa: null, svcCategory: null, militaryConsentDate: null })); }} />
            {formErrors.doa && <div className="text-error text-xs font-bold mt-1">{formErrors.doa}</div>}
          </div>
          <div className="form-row"><label className="label">{t('lbl_is_45')}</label><input type="text" className="form-input font-bold text-primary bg-surface-alt" disabled value={is45 ? t('msg_yes') : t('msg_no')} /></div>
        </div>

        {is45 && (
          <div className="p-4 bg-amber-light border border-amber rounded mb-6">
            <label className="label text-amber font-bold">{t('msg_appointee_gt_45')}</label>
            <input type="date" min="1900-01-01" className="form-input mt-2" value={data.cabinetDate} onChange={e => updateData('cabinetDate', e.target.value)} />
            {!data.cabinetDate && <div className="text-xs font-bold text-amber mt-1">{t('msg_no_approval_invalid')}</div>}
          </div>
        )}

        <div className="mb-6 border-b border-subtle pb-4">
          <label className="label mb-2">{t('lbl_appt_permanent')}</label>
          <div className="flex gap-4">
            <label><input type="radio" checked={data.isPermanent} onChange={() => { updateData('isPermanent', true); updateData('isEligible', true); }} /> {t('opt_yes')}</label>
            <label><input type="radio" checked={data.isPermanent === false} onChange={() => updateData('isPermanent', false)} /> {t('opt_no_temp')}</label>
          </div>

          {data.isPermanent === false && !data.isPensioner && (
            <div className="mt-4 p-4 bg-amber-light border border-amber rounded animate-fade-in">
              <label className="label text-amber font-bold mb-2">{t('lbl_terrorist_exemption')}</label>
              <p className="text-sm font-bold text-amber mb-2">{t('msg_died_terrorist')}</p>
              <div className="flex gap-4">
                <label className="text-sm cursor-pointer"><input type="radio" checked={data.diedDueToTerrorism === true} onChange={() => updateData('diedDueToTerrorism', true)} /> {t('opt_yes')}</label>
                <label className="text-sm cursor-pointer"><input type="radio" checked={data.diedDueToTerrorism === false} onChange={() => updateData('diedDueToTerrorism', false)} /> {t('msg_no')}</label>
              </div>
            </div>
          )}
          {data.serviceSector === 'Forces' && data.isPensioner && (
            <div className="mt-4 p-4 bg-amber-light border border-amber rounded animate-fade-in">
              <label className="label text-amber font-bold mb-2">{t('lbl_retired_due_to_terrorism')}</label>
              <div className="flex gap-4">
                <label className="text-sm cursor-pointer"><input type="radio" checked={data.retiredDueToTerrorism === true} onChange={() => updateData('retiredDueToTerrorism', true)} /> {t('opt_yes')}</label>
                <label className="text-sm cursor-pointer"><input type="radio" checked={data.retiredDueToTerrorism === false} onChange={() => updateData('retiredDueToTerrorism', false)} /> {t('msg_no')}</label>
              </div>
            </div>
          )}
        </div>

        {data.serviceSector === 'Forces' && (
          <div className="mb-6 p-4 bg-surface-alt border border-subtle rounded animate-fade-in">
            <label className="label font-bold">{t('lbl_officer_number')} <span className="text-error">*</span></label>
            <input type="text" className={`form-input max-w-sm ${formErrors.p1officerNo ? 'border-[2px] border-error text-error' : ''}`} value={data.officerNumber} onChange={e => { updateData('officerNumber', e.target.value); setFormErrors(p => ({ ...p, p1officerNo: null })); }} />
            {formErrors.p1officerNo && <div className="text-error text-xs font-bold mt-1">{formErrors.p1officerNo}</div>}
          </div>
        )}

        {data.gender === 'Female' && (
          <div className="mb-6 p-4 bg-surface-alt border border-subtle rounded">
            <h4 className="font-bold text-primary mb-3">{t('lbl_female_validations')}</h4>
            <div className="mb-4">
              <label className="label">{t('lbl_appt_after_1983')}</label>
              <div className="flex gap-4">
                <label><input type="radio" checked={data.doa >= '1983-08-01'} readOnly /> {t('opt_yes_valid')}</label>
                <label><input type="radio" checked={data.doa && data.doa < '1983-08-01'} readOnly /> {t('msg_no')}</label>
              </div>
            </div>
            {data.doa && data.doa < '1983-08-01' && (
              <div className="space-y-4">
                <div className="form-row">
                  <label className={`label ${formErrors.femaleConsent ? 'text-error font-bold' : ''}`}>{t('lbl_consent_wop')} {formErrors.femaleConsent && <span className="text-xs">— {formErrors.femaleConsent}</span>}</label>
                  <select className={`form-input ${formErrors.femaleConsent ? 'border-[2px] border-error text-error' : ''}`} value={data.femaleConsent} onChange={e => {
                    if (e.target.value === 'No + Reluctant') handleRejection(t('err_female_reluctant'));
                    updateData('femaleConsent', e.target.value);
                    setFormErrors(p => ({ ...p, femaleConsent: null }));
                  }}>
                    <option value="">{t('opt_select')}</option>
                    <option value="Yes">{t('opt_yes')}</option>
                    <option value="Yes Before 2014">{t('opt_yes_before_2014')}</option>
                    <option value="Yes Evidence">{t('opt_yes_evidence')}</option>
                    <option value="No + Reluctant">{t('opt_no_reluctant')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="button-group">
          <button className="btn btn-secondary" onClick={() => setCheckerStep(0)}><ChevronLeft size={20} /> {t('btn_back')}</button>
          <button className="btn" onClick={() => {
            const errsA = {};
            if (!data.doa) errsA.doa = t('err_doa_required');
            if (data.serviceSector === 'Forces' && !data.serviceCategory) errsA.svcCategory = t('err_service_category_required');
            if (data.serviceSector === 'Forces' && !data.officerNumber) errsA.p1officerNo = t('err_officer_number_required');
            if (data.gender === 'Female' && data.serviceSector === 'Civil' && data.doa && data.doa < '1983-08-01' && (!data.femaleConsent || data.femaleConsent === '')) {
              errsA.femaleConsent = t('err_fill_female_consent');
            }
            // Military consent date validation
            if (data.serviceSector === 'Forces' && data.serviceCategory === 'Regular Force' && data.doa <= '1968-09-30') {
              if (!data.militaryConsentDate) errsA.militaryConsentDate = t('err_military_consent_missing');
              else if (data.militaryConsentDate > '2006-06-30') { setFormErrors(errsA); handleRejection(t('err_military_consent_late_regular')); return; }
            }
            if (data.serviceSector === 'Forces' && data.serviceCategory === 'Volunteer Force') {
              const cutoff = data.gender === 'Male' ? '1981-09-01' : '1983-08-01';
              if (data.doa <= cutoff) {
                if (!data.militaryConsentDate) errsA.militaryConsentDate = t('err_military_consent_missing');
                else if (data.militaryConsentDate > '2012-12-31') { setFormErrors(errsA); handleRejection(t('err_military_consent_late_volunteer')); return; }
              }
            }
            if (Object.keys(errsA).length > 0) { setFormErrors(prev => ({ ...prev, ...errsA, global: t('err_global_format') })); return; }
            if (data.dob && data.doa) {
              const ageAtAppt = computeAgeAtDate(data.dob, data.doa);
              if (ageAtAppt < 18) { handleRejection(t('err_under_18')); return; }
            }
            if (is45 && !data.cabinetDate) { handleRejection(t('err_no_cabinet_approval')); return; }
            if (data.isPermanent === false && !(data.diedDueToTerrorism && !data.isPensioner) && !(data.serviceSector === 'Forces' && data.isPensioner && data.retiredDueToTerrorism)) {
              handleRejection(t('err_not_permanent')); return;
            }
            setFormErrors({});
            setCheckerStep(2);
          }}>{t('btn_next_section_b')} <ChevronRight size={20} /></button>
        </div>
      </div>
    );
  };

  const SectionB_C = () => (
    <div className="animate-fade-in">
      <div className="tag">{t('section_b_c_title')}</div>
      {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}
      <h2 className="text-2xl font-bold mb-4">{t('lbl_reg_term')}</h2>

      <div className="p-4 bg-surface-alt border border-subtle rounded mb-6">
        <label className="label text-primary font-bold">{t('lbl_is_wop_reg')}</label>
        <div className="flex gap-4 items-center">
          <label><input type="radio" checked={data.registrationValid} onChange={() => { updateData('registrationValid', true); updateData('isEligible', true); }} /> {t('opt_yes')}</label>
          <label><input type="radio" checked={!data.registrationValid} onChange={() => handleRejection(t('err_not_reg_wop'))} /> {t('msg_no')}</label>
        </div>
        {data.registrationValid && (
          <div className="mt-3 form-row max-w-sm">
            <label className={formErrors.memberNumber ? 'label text-error font-bold' : 'label'}>{t('lbl_wop_no')}</label>
            <input type="text" className={`form-input ${formErrors.memberNumber ? 'border-[2px] border-error text-error' : ''}`} value={data.memberNumber} onChange={e => { updateData('memberNumber', e.target.value); setFormErrors(p => ({ ...p, memberNumber: null })); }} />
            {formErrors.memberNumber && <div className="text-error text-xs font-bold mt-1">{formErrors.memberNumber}</div>}
          </div>
        )}
      </div>

      <div className="mb-6 pb-4 border-b border-subtle">
        <label className="label font-bold text-primary mb-2">{t('lbl_contributions_recovered')}</label>
        <div className="flex gap-4 items-center">
          <label><input type="radio" checked={data.contributionRecovered} onChange={() => { updateData('contributionRecovered', true); updateData('isEligible', true); }} /> {t('opt_yes')}</label>
          <label><input type="radio" checked={!data.contributionRecovered} onChange={() => handleRejection(t('err_contributions_unrecovered'))} /> {t('msg_no')}</label>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">{t('lbl_sec_c_term')}</h2>

      {data.isPensioner ? (
        <div className="p-4 bg-surface-alt rounded mb-6 border border-subtle">
          <h4 className="font-bold text-primary mb-2">{t('lbl_pensioner_details')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-row"><label className="label">{t('lbl_retired_date')}</label><input type="date" className="form-input bg-gray-100" disabled value={data.dor} /></div>

            <div className="form-row">
              <label className="label">{t('lbl_pension_commenced')}</label>
              <div className="flex gap-4 mb-2">
                <label><input type="radio" checked={!data.pensionNotCommenced} onChange={() => updateData('pensionNotCommenced', false)} /> {t('opt_yes')}</label>
                <label><input type="radio" checked={data.pensionNotCommenced} onChange={() => { updateData('pensionNotCommenced', true); updateData('lastPensionPaymentDate', ''); }} /> {t('msg_no')}</label>
              </div>

              {!data.pensionNotCommenced && (
                <div className="animate-fade-in">
                  <label className="label">{t('lbl_last_pension_date')}</label>
                  <input type="date" min={data.dor || '1900-01-01'} className={`form-input ${formErrors.lastPensionDate ? 'border-[2px] border-error text-error' : (data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor ? 'border-[2px] border-error text-error' : 'border-primary')}`} value={data.lastPensionPaymentDate} onChange={e => updateData('lastPensionPaymentDate', e.target.value)} />
                  {(formErrors.lastPensionDate) && (
                    <div className="text-error text-xs font-bold mt-1">{formErrors.lastPensionDate}</div>
                  )}
                  {data.lastPensionPaymentDate && data.dor && data.lastPensionPaymentDate < data.dor && !formErrors.lastPensionDate && (
                    <div className="text-error text-xs font-bold mt-1">{t('err_last_pension_before_retirement')}</div>
                  )}
                  {overpaidMonths > 0 && (
                    <div className="mt-2 text-sm font-bold text-error">
                      An overpayment for {overpaidMonths} month{overpaidMonths > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
              {data.pensionNotCommenced && (
                <div className="mt-2 text-sm font-bold p-3 rounded bg-amber-light text-amber border border-amber animate-fade-in">
                  Statutory Warning: If payments had not commenced, the Last Working Place must submit a PD 03 application for Heirs' Payments. The W&OP (PD 04) application must be forwarded alongside PD 03.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in p-4 bg-surface-alt rounded mb-6 border border-subtle">
          <label className="label font-bold text-primary mb-2">{t('lbl_loss_of_pension')}</label>
          <div className="flex gap-4 mb-4">
            <label><input type="radio" checked={data.endedWithLossOfPension} onChange={() => updateData('endedWithLossOfPension', true)} /> {t('opt_yes')}</label>
            <label><input type="radio" checked={!data.endedWithLossOfPension} onChange={() => updateData('endedWithLossOfPension', false)} /> {t('msg_no')}</label>
          </div>

          {data.endedWithLossOfPension && (
            <div className="form-row border-t border-[rgba(0,0,0,0.1)] pt-4 mt-2">
              <label className={formErrors.lossOfPensionDate ? 'label text-error font-bold' : 'label'}>{t('lbl_loss_date')}</label>
              <input type="date" min="1900-01-01" className={`form-input mb-1 ${formErrors.lossOfPensionDate ? 'border-[2px] border-error text-error' : ''}`} value={data.lossOfPensionDate} onChange={e => { updateData('lossOfPensionDate', e.target.value); setFormErrors(p => ({ ...p, lossOfPensionDate: null })); }} />
              {formErrors.lossOfPensionDate && <div className="text-error text-xs font-bold mb-3">{formErrors.lossOfPensionDate}</div>}

              <label className={formErrors.lossOfPensionReason ? 'label text-error font-bold' : 'label'}>{t('lbl_loss_reason')}</label>
              <div className={`flex flex-col gap-2 mb-2 p-2 rounded ${formErrors.lossOfPensionReason ? 'border-[2px] border-error bg-red-50' : ''}`}>
                <label><input type="radio" checked={data.lossOfPensionReason === 'Abolished Post'} onChange={() => { updateData('lossOfPensionReason', 'Abolished Post'); setFormErrors(p => ({ ...p, lossOfPensionReason: null })); }} /> Retired due to close of institution or abolish Designation/Post</label>
                <label><input type="radio" checked={data.lossOfPensionReason === 'Other'} onChange={() => { updateData('lossOfPensionReason', 'Other'); setFormErrors(p => ({ ...p, lossOfPensionReason: null })); }} /> Other Reasons</label>
              </div>
              {formErrors.lossOfPensionReason && <div className="text-error text-xs font-bold mb-2">{formErrors.lossOfPensionReason}</div>}

              {data.lossOfPensionReason === 'Other' && data.lossOfPensionDate && (
                <div className="mt-2 text-sm font-bold p-3 rounded bg-amber-light text-amber border border-amber animate-fade-in">
                  Condition: 10 Years Minimum Service applied unless appointment date was prior to 1981.07.02. Marriages formalized strictly AFTER {data.lossOfPensionDate} will be invalidated.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hide Reckonable/Uncountable logic if explicitly a pensioner, because those are already figured out during initial pension calc */}
      {!data.isPensioner && (
        <div className="animate-fade-in">
          <div className="p-4 rounded border border-subtle mb-6">
            <h4 className="font-bold text-lg mb-2">{t('lbl_uncountable')}</h4>
            {data.uncountablePeriods.map((up, i) => (
              <div key={i} className="flex gap-4 mb-2 items-center">
                <input type="date" min="1900-01-01" className="form-input w-full" value={up.from} onChange={e => { let arr = [...data.uncountablePeriods]; arr[i].from = e.target.value; updateData('uncountablePeriods', arr) }} />
                <span>{t('lbl_to')}</span>
                <input type="date" min="1900-01-01" className="form-input w-full" value={up.to} onChange={e => { let arr = [...data.uncountablePeriods]; arr[i].to = e.target.value; updateData('uncountablePeriods', arr) }} />
              </div>
            ))}
            <button className="btn btn-secondary text-sm" onClick={() => updateData('uncountablePeriods', [...data.uncountablePeriods, { from: '', to: '' }])}>{t('btn_add_period')} +</button>
          </div>

          <div className="mb-4">
            <label className="label font-bold text-primary">{t('lbl_reckonable_calc')}</label>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" disabled className="form-input bg-surface-alt font-bold" value={data.reckonableYears} />
              <input type="number" disabled className="form-input bg-surface-alt font-bold" value={data.reckonableMonths} />
              <input type="number" disabled className="form-input bg-surface-alt font-bold" value={data.reckonableDays} />
            </div>
          </div>
        </div>
      )}

      <div className="button-group">
        <button className="btn btn-secondary" onClick={() => setCheckerStep(1)}><ChevronLeft size={20} /> {t('btn_back')}</button>
        <button className="btn" onClick={() => {
          const errsBC = {};
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
          if (Object.keys(errsBC).length > 0) { setFormErrors(prev => ({ ...prev, ...errsBC, global: t('err_global_format') })); return; }
          if (!data.isPensioner && data.endedWithLossOfPension && data.lossOfPensionReason === 'Other') {
            if (data.doa >= '1981-07-02') {
              if (data.reckonableYears < 10) {
                handleRejection("Statutory Application Voided: Contributor service terminated with loss of pension and did not complete the mandatory minimum 10 years of reckonable service.");
                return;
              }
            }
          }
          setCheckerStep(3);
        }}>{t('btn_next_section_d')} <ChevronRight size={20} /></button>
      </div>
    </div>
  );

  const renderMarriageBuilder = (title, countKey, arrKey, isApplicantMode = false) => {
    const handleCountChange = (e) => {
      const num = parseInt(e.target.value) || 0;
      updateData(countKey, num);
      let arr = [...data[arrKey]];
      if (arr.length < num) {
        for (let i = arr.length; i < num; i++) arr.push({
          date: '', cert: '', div: '',
          s_name: '', s_nic: '', s_alive: true, s_dod: '', s_div_date: '', s_dob: '',
          s_gov_emp: false, s_gov_reg_no: '', s_claiming_wop: false, s_wop_pen_no: '',
          s_pen_own: false, s_pen_own_no: '',
          isUnregistered: false, unreg_evidence: [], unreg_notes: '',
          childrenCount: 0, children: []
        });
      } else arr = arr.slice(0, num);
      updateData(arrKey, arr);
    };

    const updateMar = (i, field, val) => {
      let arr = [...data[arrKey]];
      if (!arr[i]) arr[i] = {
        date: '', cert: '', div: '', law: 'General', s_name: '', s_nic: '', s_alive: true, s_dod: '', s_div_date: '', s_dob: '',
        s_gov_emp: false, s_gov_reg_no: '', s_claiming_wop: false, s_wop_pen_no: '',
        s_pen_own: false, s_pen_own_no: '',
        isUnregistered: false, unreg_evidence: [], unreg_notes: '',
        childrenCount: 0, children: []
      };
      arr[i][field] = val;
      updateData(arrKey, arr);
    };

    if (data[arrKey].length === 0 && data[countKey] > 0) {
      let init = []; for (let n = 0; n < data[countKey]; n++) init.push({
        date: '', cert: '', div: '', law: 'General', s_name: '', s_nic: '', s_alive: true, s_dod: '', s_div_date: '', s_dob: '',
        s_gov_emp: false, s_gov_reg_no: '', s_claiming_wop: false, s_wop_pen_no: '',
        s_pen_own: false, s_pen_own_no: '',
        isUnregistered: false, unreg_evidence: [], unreg_notes: '',
        childrenCount: 0, children: []
      });
      setTimeout(() => updateData(arrKey, init), 0);
    }

    // Legacy identical block functionally overridden natively inline.

    return (
      <div className="animate-fade-in pb-8 mt-6">
        <div className="form-row max-w-sm mb-6 p-4 bg-surface-alt border border-subtle rounded">
          <label className="label text-primary font-bold">{t('lbl_num_marriages')}</label>
          <select className="form-input font-bold" value={data[countKey]} onChange={handleCountChange}>
            {isApplicantMode ? [1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>) : [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {data[arrKey].map((m, i) => {
          if (isApplicantMode && i === (data.app_contributor_marriage_index || 0)) {
            return (
              <div key={i} className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm text-center">
                <h3 className="font-bold text-xl text-blue-900 border-b border-blue-200 pb-2 mb-4">{t('lbl_marriage_record_contributor').replace('{n}', i + 1)}</h3>
                <p className="font-bold text-blue-800 mb-2">{t('msg_marriage_mapped_contributor')}</p>
                {data.contributorMarriagesCount > 1 ? (
                  <div className="mt-4 inline-block bg-[#ffffff] p-4 rounded shadow-sm border border-blue-200">
                    <label className="text-sm font-bold text-primary block mb-2">{t('lbl_specify_contributor')}</label>
                    <select className="form-input text-sm border-primary" value={data.app_link_contributor_index || 0} onChange={e => {
                      const linkIdx = parseInt(e.target.value);
                      updateData('app_link_contributor_index', linkIdx);
                      let arr = [...data.applicantMarriages];
                      if (data.contributorMarriages[linkIdx]) {
                        arr[i] = JSON.parse(JSON.stringify(data.contributorMarriages[linkIdx]));
                        updateData('applicantMarriages', arr);
                      }
                    }}>
                      {data.contributorMarriages.map((cm, cIdx) => (
                        <option key={cIdx} value={cIdx}>{t('opt_sync_marriage')} {cIdx + 1}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700 mt-2 font-bold">{t('msg_data_persistently_mapped')}</p>
                )}
              </div>
            );
          }

          return (
            <div key={i} className="mb-6 p-6 bg-[#ffffff] border border-subtle rounded-xl shadow-lg">
              <h3 className="font-bold text-xl text-primary border-b border-subtle pb-2 mb-4">{t('lbl_marriage_record_n')} {i + 1}</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="form-row m-0">
                  <label className="label">{t('lbl_marriage_law')}</label>
                  <select className="form-input" value={m.law || 'General'} onChange={e => updateMar(i, 'law', e.target.value)}>
                    <option value="General">{t('opt_general')}</option>
                    <option value="Kandyan">{t('opt_kandyan')}</option>
                    <option value="Muslim">{t('opt_muslim')}</option>
                  </select>
                </div>
                <div className="form-row m-0">
                  <label className="label">{t('lbl_marriage_date')}</label>
                  <input type="date" min="1900-01-01" className={`form-input ${formErrors[`${arrKey}_${i}_date`] ? 'border-[2px] border-error text-error' : ''}`} value={m.date || ''} onChange={e => { updateMar(i, 'date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_date`]: null })) }} />
                  {formErrors[`${arrKey}_${i}_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_date`]}</div>}
                </div>
                {/* Registration toggle */}
                <div className="form-row m-0">
                  <label className="label">{t('lbl_marriage_registered')}</label>
                  <select className="form-input" value={m.isUnregistered ? 'unregistered' : 'registered'} onChange={e => updateMar(i, 'isUnregistered', e.target.value === 'unregistered')}>
                    <option value="registered">{t('opt_registered')}</option>
                    <option value="unregistered">{t('opt_unregistered')}</option>
                  </select>
                </div>
                {!m.isUnregistered ? (
                  <div className="form-row m-0">
                    <label className="label">{t('lbl_cert_number')}</label>
                    <input type="text" className={`form-input ${formErrors[`${arrKey}_${i}_cert`] ? 'border-[2px] border-error text-error' : ''}`} value={m.cert || ''} onChange={e => { updateMar(i, 'cert', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_cert`]: null })) }} />
                    {formErrors[`${arrKey}_${i}_cert`] && <div className="text-error text-[10px] font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_cert`]}</div>}
                  </div>
                ) : (
                  <div className="form-row m-0">
                    <label className="label text-amber">{t('lbl_cert_number_optional')}</label>
                    <input type="text" className="form-input border-amber" value={m.cert || ''} onChange={e => updateMar(i, 'cert', e.target.value)} />
                  </div>
                )}
              </div>
              <div className="form-row m-0 mb-4">
                <label className="label">{t('lbl_reg_division')}</label><input type="text" className="form-input" value={m.div || ''} onChange={e => updateMar(i, 'div', e.target.value)} />
              </div>

              {/* Unregistered marriage evidence panel */}
              {m.isUnregistered && (
                <div className="mb-4 p-4 bg-amber-light border-2 border-amber rounded-xl animate-fade-in">
                  <h4 className="font-bold text-amber flex items-center gap-2 mb-2"><AlertTriangle size={18} /> {t('lbl_unregistered_info')}</h4>
                  <p className="text-sm font-bold text-amber mb-3" style={{whiteSpace:'pre-line'}}>{t('msg_unregistered_rule')}</p>
                  <div className="p-3 bg-red-50 border border-error rounded mb-3">
                    <p className="text-xs font-bold text-error">{t('msg_unregistered_dg_note')}</p>
                  </div>
                  <label className="label text-amber font-bold mb-2">{t('lbl_unregistered_evidence_types')}</label>
                  {[
                    ['electoral', t('opt_evidence_electoral')],
                    ['birth_cert', t('opt_evidence_birth_cert')],
                    ['affidavit', t('opt_evidence_affidavit')],
                    ['institution', t('opt_evidence_institution')],
                    ['witnesses', t('opt_evidence_witnesses')],
                    ['custom_cert', t('opt_evidence_custom_cert')]
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-2 mb-2 cursor-pointer text-sm font-bold text-[#92400e]">
                      <input type="checkbox" className="mt-0.5 min-w-[16px]" checked={(m.unreg_evidence || []).includes(key)}
                        onChange={e => {
                          const cur = m.unreg_evidence || [];
                          updateMar(i, 'unreg_evidence', e.target.checked ? [...cur, key] : cur.filter(x => x !== key));
                        }} />
                      {label}
                    </label>
                  ))}
                  <div className="form-row mt-3">
                    <label className="label text-amber">{t('lbl_unregistered_notes')}</label>
                    <textarea className="form-input min-h-[64px] text-sm" value={m.unreg_notes || ''} onChange={e => updateMar(i, 'unreg_notes', e.target.value)} />
                  </div>
                </div>
              )}

              {!isApplicantMode && data.dor && m.date && m.date > data.dor && (
                <div className="bg-amber-light text-amber border border-amber p-2 rounded text-sm font-bold mb-4">
                  {t('msg_warning_marriage_after_ret')} ({data.dor}).
                </div>
              )}

              <h4 className="font-bold text-lg mb-2 pt-4 border-t border-subtle">{t('lbl_spouse_civil_info')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-row">
                <label className={`label text-muted text-xs ${formErrors[`${arrKey}_${i}_s_name`] ? 'text-error font-bold' : ''}`}>{t('lbl_spouse_name')}</label>
                <input type="text" placeholder={t('lbl_spouse_name')} className={`form-input ${formErrors[`${arrKey}_${i}_s_name`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_name || ''} onChange={e => { updateMar(i, 's_name', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_name`]: null })); }} />
                {formErrors[`${arrKey}_${i}_s_name`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_name`]}</div>}
              </div>
                <div className="form-row">
                  <label className="label text-muted text-xs">{t('lbl_spouse_nic')}</label>
                  <input type="text" placeholder={t('lbl_spouse_nic')} className={`form-input ${formErrors[`${arrKey}_${i}_s_nic`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_nic || ''} onChange={e => { updateMar(i, 's_nic', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_nic`]: null })) }} />
                  {formErrors[`${arrKey}_${i}_s_nic`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_nic`]}</div>}
                </div>
                <div className="form-row"><label className="label text-muted text-xs">{t('lbl_spouse_dob')}</label><input type="date" min="1900-01-01" className={`form-input ${formErrors[`${arrKey}_${i}_s_dob`] ? 'border-[2px] border-error text-error' : ''}`} title={t('lbl_spouse_dob')} value={m.s_dob || ''} onChange={e => { updateMar(i, 's_dob', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_dob`]: null })); }} />
                  {m.s_dob && <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age')}: {computeDynamicAge(m.s_dob)}</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 border border-subtle p-3 rounded">
                <div>
                  <label className="label text-xs">{t('lbl_spouse_gov_emp')}</label>
                  <select className="form-input text-sm" value={m.s_gov_emp ? 'Yes' : 'No'} onChange={e => updateMar(i, 's_gov_emp', e.target.value === 'Yes')}><option value="No">{t('msg_no')}</option><option value="Yes">{t('opt_yes')}</option></select>
                  {m.s_gov_emp && <input type="text" placeholder={t('lbl_wop_reg_no')} className="form-input text-sm mt-2 border-primary" value={m.s_gov_reg_no || ''} onChange={e => updateMar(i, 's_gov_reg_no', e.target.value)} />}
                </div>
                <div>
                  <label className="label text-xs">{t('lbl_spouse_gov_pen')}</label>
                  <select className="form-input text-sm" value={m.s_pen_own ? 'Yes' : 'No'} onChange={e => updateMar(i, 's_pen_own', e.target.value === 'Yes')}><option value="No">{t('msg_no')}</option><option value="Yes">{t('opt_yes')}</option></select>
                  {m.s_pen_own && <input type="text" placeholder={t('lbl_spouse_pen_no')} className="form-input text-sm mt-2 border-primary" value={m.s_pen_own_no || ''} onChange={e => updateMar(i, 's_pen_own_no', e.target.value)} />}
                </div>
                <div>
                  <label className="label text-xs">{t('lbl_claiming_another_wop')}</label>
                  <select className="form-input text-sm" value={m.s_claiming_wop ? 'Yes' : 'No'} onChange={e => updateMar(i, 's_claiming_wop', e.target.value === 'Yes')}><option value="No">{t('msg_no')}</option><option value="Yes">{t('opt_yes')}</option></select>
                  {m.s_claiming_wop && <input type="text" placeholder={t('lbl_exist_wop_no')} className="form-input text-sm mt-2 border-primary" value={m.s_wop_pen_no || ''} onChange={e => updateMar(i, 's_wop_pen_no', e.target.value)} />}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4 bg-gray-50 p-4 border border-subtle rounded">
                <div className="form-row m-0">
                  <label className="label">{t('lbl_current_legal_status')}</label>
                  <select className="form-input" value={m.s_term || 'Active Legal Marriage'} onChange={e => {
                    let arr = [...data[arrKey]];
                    arr[i].s_term = e.target.value;
                    if (e.target.value === 'Ended: Demise of Spouse') arr[i].s_alive = false;
                    updateData(arrKey, arr);
                  }}>
                    <option value="Active Legal Marriage">{t('opt_active_legal')}</option>
                    <option value="Ended: Demise of Spouse">{t('opt_ended_demise')}</option>
                    <option value="Legally Divorced">{t('opt_legally_divorced')}</option>
                    <option value="Separated">{t('opt_separated')}</option>
                    <option value="Void">{t('opt_void')}</option>
                  </select>
                </div>

                {m.s_term === 'Legally Divorced' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-amber-50 border border-amber rounded animate-fade-in">
                    <div className="form-row m-0">
                      <label className="label text-[#b45309]">{t('lbl_decree_nisi')}</label>
                      <input type="date" min="1900-01-01" className={`form-input text-sm ${formErrors[`${arrKey}_${i}_s_nisi_date`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_nisi_date || ''} onChange={e => { updateMar(i, 's_nisi_date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_nisi_date`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_nisi_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_nisi_date`]}</div>}
                    </div>
                    <div className="form-row m-0">
                      <label className="label text-[#b45309]">{t('lbl_decree_absolute')}</label>
                      <input type="date" min="1900-01-01" className={`form-input text-sm ${formErrors[`${arrKey}_${i}_s_div_date`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_div_date || ''} onChange={e => { updateMar(i, 's_div_date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_div_date`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_div_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_div_date`]}</div>}
                    </div>
                  </div>
                )}

                {m.s_term === 'Separated' && (
                  <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded animate-fade-in">
                    <div className="form-row mb-2">
                      <label className="label text-indigo-900">{t('lbl_sep_date')}</label>
                      <input type="date" min="1900-01-01" className={`form-input text-sm max-w-sm ${formErrors[`${arrKey}_${i}_s_sep_date`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_sep_date || ''} onChange={e => { updateMar(i, 's_sep_date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_sep_date`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_sep_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_sep_date`]}</div>}
                    </div>
                    <p className="text-xs font-bold text-indigo-700">{t('msg_sep_warning')}</p>
                  </div>
                )}

                {m.s_term === 'Void' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-3 bg-red-50 border border-red-200 rounded animate-fade-in">
                    <div className="form-row m-0">
                      <label className="label text-red-900 leading-tight">{t('lbl_court_order_date')}</label>
                      <input type="date" min="1900-01-01" className={`form-input text-sm ${formErrors[`${arrKey}_${i}_s_void_date`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_void_date || ''} onChange={e => { updateMar(i, 's_void_date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_void_date`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_void_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_void_date`]}</div>}
                    </div>
                    <div className="form-row m-0">
                      <label className="label text-red-900 leading-tight">{t('lbl_court_name')}</label>
                      <input type="text" placeholder="e.g. District Court" className={`form-input text-sm ${formErrors[`${arrKey}_${i}_s_void_court`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_void_court || ''} onChange={e => { updateMar(i, 's_void_court', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_void_court`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_void_court`] && <div className="text-error text-[10px] font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_void_court`]}</div>}
                    </div>
                    <div className="form-row m-0">
                      <label className="label text-red-900 leading-tight">{t('lbl_case_number')}</label>
                      <input type="text" placeholder="Case Ref No." className={`form-input text-sm ${formErrors[`${arrKey}_${i}_s_void_case`] ? 'border-[2px] border-error text-error' : ''}`} value={m.s_void_case || ''} onChange={e => { updateMar(i, 's_void_case', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_void_case`]: null })) }} />
                      {formErrors[`${arrKey}_${i}_s_void_case`] && <div className="text-error text-[10px] font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_void_case`]}</div>}
                    </div>
                  </div>
                )}
              </div>

              {m.s_term !== 'Ended: Demise of Spouse' && (
                <div className="flex gap-4 mb-4 items-center bg-surface-alt p-2 rounded border border-subtle">
                  <label className="label mb-0 font-bold">{t('lbl_spouse_living')}</label>
                  <label className="flex gap-2 items-center text-sm cursor-pointer"><input type="radio" checked={m.s_alive === true} onChange={() => updateMar(i, 's_alive', true)} /> {t('opt_alive')}</label>
                  <label className="flex gap-2 items-center text-sm cursor-pointer"><input type="radio" checked={m.s_alive === false} onChange={() => updateMar(i, 's_alive', false)} /> {t('opt_deceased')}</label>
                </div>
              )}

              {m.s_alive && m.s_term === 'Active Legal Marriage' && data.dod && (
                <div className="mb-4 bg-surface-alt p-4 border border-subtle rounded animate-fade-in">
                  <label className="label font-bold">{t('lbl_has_remarried')}</label>
                  <div className="flex gap-4">
                    <label><input type="radio" checked={m.s_remarried === true} onChange={() => updateMar(i, 's_remarried', true)} /> {t('opt_yes')}</label>
                    <label><input type="radio" checked={m.s_remarried === false} onChange={() => updateMar(i, 's_remarried', false)} /> {t('msg_no')}</label>
                  </div>
                  {m.s_remarried && (
                    <div className="mt-2 form-row max-w-sm">
                      <label className="label">{t('lbl_remarriage_date')}</label>
                      <input type="date" min="1900-01-01" className={`form-input max-w-sm ${formErrors[`${arrKey}_${i}_s_rem_date`] ? 'border-[2px] border-error text-error' : 'border-amber'}`} value={m.s_remarriage_date || ''} onChange={e => { updateMar(i, 's_remarriage_date', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_rem_date`]: null })); }} />
                      {formErrors[`${arrKey}_${i}_s_rem_date`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_rem_date`]}</div>}

                      {m.s_remarriage_date && m.s_remarriage_date < '2010-08-17' && (
                        <div className="mt-3 p-3 bg-amber-light border border-amber rounded">
                          <label className="font-bold text-amber block mb-2">{t('lbl_apply_50_wop')}</label>
                          <div className="flex gap-4">
                            <label className="text-sm font-bold text-amber cursor-pointer"><input type="radio" checked={m.s_remarriage_applied_50 === true} onChange={() => updateMar(i, 's_remarriage_applied_50', true)} /> {t('opt_yes')}</label>
                            <label className="text-sm font-bold text-amber cursor-pointer"><input type="radio" checked={m.s_remarriage_applied_50 === false} onChange={() => updateMar(i, 's_remarriage_applied_50', false)} /> {t('msg_no')}</label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(!m.s_alive || m.s_term === 'Ended: Demise of Spouse') && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 border border-subtle bg-gray-50 rounded animate-fade-in">
                  <div className="form-row">
                    <label className="label font-bold text-[#334155]">{t('lbl_absolute_dod')}</label>
                    <input type="date" min="1900-01-01" className={`form-input border-[1px] border-amber ${formErrors[`${arrKey}_${i}_s_dod`] ? 'border-[2px] border-error' : ''}`} value={m.s_dod || ''} onChange={e => { updateMar(i, 's_dod', e.target.value); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_s_dod`]: null })) }} />
                    {formErrors[`${arrKey}_${i}_s_dod`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[`${arrKey}_${i}_s_dod`]}</div>}
                  </div>
                  <div className="form-row"><label className="label font-bold text-[#334155]">{t('lbl_death_cert_no')}</label><input type="text" className="form-input border-amber" /></div>
                </div>
              )}

              <div className="border-t border-subtle mt-6 pt-4 bg-surface-alt p-4 rounded mt-4">
                <h4 className="font-bold text-lg mb-2 text-primary">{t('lbl_children_tied')} {i + 1}</h4>
                <div className="form-row max-w-sm mb-4">
                  <label className="label">{t('lbl_no_children')}</label>
                  <select className="form-input" value={m.childrenCount || 0} onChange={(e) => {
                    const n = parseInt(e.target.value);
                    let cArr = m.children || [];
                    if (cArr.length < n) for (let j = cArr.length; j < n; j++) cArr.push({ name: '', gender: 'Male', dob: '', bc: '', nicChild: '', occ: 'School Student', dis: '', income: '' });
                    else cArr = cArr.slice(0, n);
                    updateMar(i, 'childrenCount', n); updateMar(i, 'children', cArr);
                  }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {m.children && m.children.length > 0 && (
                  <div className="space-y-4">
                    {m.children.map((child, j) => {
                      const cAge = computeDynamicAge(child.dob);
                      return (
                        <div key={j} className="bg-[#ffffff] p-4 rounded border border-subtle shadow-sm">
                          <h5 className="font-bold mb-2">{t('lbl_child_details').replace('{n}', j + 1)}</h5>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                            <input type="text" placeholder="Full Name" className="form-input text-sm" value={child.name} onChange={e => { let arr = [...m.children]; arr[j].name = e.target.value; updateMar(i, 'children', arr); }} />
                            <div>
                              <select className={`form-input text-sm ${formErrors[`${arrKey}_${i}_c_${j}_gender`] ? 'border-[2px] border-error text-error' : ''}`} value={child.gender} onChange={e => { let arr = [...m.children]; arr[j].gender = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_c_${j}_gender`]: null })); }}><option value="Male">Male</option><option value="Female">Female</option></select>
                              {formErrors[`${arrKey}_${i}_c_${j}_gender`] && <div className="text-error text-[10px] font-bold mt-0.5">{formErrors[`${arrKey}_${i}_c_${j}_gender`]}</div>}
                            </div>
                            <input type="text" placeholder="Birth Cert No" className="form-input text-sm" value={child.bc} onChange={e => { let arr = [...m.children]; arr[j].bc = e.target.value; updateMar(i, 'children', arr); }} />
                            <div>
                              <input type="date" min="1900-01-01" className={`form-input text-sm mb-1 ${formErrors[`${arrKey}_${i}_c_${j}_dob`] ? 'border-[2px] border-error text-error' : ''}`} value={child.dob} onChange={e => { let arr = [...m.children]; arr[j].dob = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_c_${j}_dob`]: null })); }} />
                              {formErrors[`${arrKey}_${i}_c_${j}_dob`] && <div className="text-error text-[10px] font-bold mt-0.5">{formErrors[`${arrKey}_${i}_c_${j}_dob`]}</div>}
                              {!formErrors[`${arrKey}_${i}_c_${j}_dob`] && <div className="text-xs text-primary font-bold">{t('lbl_auto_age').replace('{age}', cAge)}</div>}
                            </div>
                          </div>
                          {cAge !== '' && cAge >= 16 && (
                            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded flex gap-2 items-center flex-wrap">
                              <span className="text-sm font-bold text-blue-800">{t('msg_child_16_nic')}</span>
                              <input type="text" placeholder="Child NIC/SLNIC" className={`form-input text-sm w-48 border-blue-400 ${formErrors[`${arrKey}_${i}_c_${j}_nic`] ? 'border-[2px] border-red-700 text-error' : ''}`} value={child.nicChild} onChange={e => { let arr = [...m.children]; arr[j].nicChild = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [`${arrKey}_${i}_c_${j}_nic`]: null })) }} />
                              {formErrors[`${arrKey}_${i}_c_${j}_nic`] && <div className="text-red-700 w-full text-xs font-bold leading-tight ml-1">{formErrors[`${arrKey}_${i}_c_${j}_nic`]}</div>}
                            </div>
                          )}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            <select className="form-input text-sm" value={child.occ} onChange={e => { let arr = [...m.children]; arr[j].occ = e.target.value; updateMar(i, 'children', arr); }}>
                              <option>School Student</option><option>College/Univ Student</option><option>Unemployed</option><option>Govt. Job</option>
                              <option>Private/Semi Govt. Job</option><option>Informal Job</option>
                            </select>
                            <input type="text" placeholder="Disability (If Any)" className="form-input text-sm" value={child.dis} onChange={e => { let arr = [...m.children]; arr[j].dis = e.target.value; updateMar(i, 'children', arr); }} />
                            <input type="number" placeholder="Monthly Income" className="form-input text-sm" value={child.income} onChange={e => { let arr = [...m.children]; arr[j].income = e.target.value; updateMar(i, 'children', arr); }} />
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <label className="flex gap-2 items-center text-sm font-bold cursor-pointer text-primary">
                              <input type="checkbox" className="min-w-[16px] min-h-[16px]" checked={child.is_married || false} onChange={e => { let arr = [...m.children]; arr[j].is_married = e.target.checked; updateMar(i, 'children', arr); }} />
                              {t('lbl_child_is_married')}
                            </label>
                            {child.is_married && child.is_disabled && (
                              <span className="text-xs font-bold text-amber px-2 py-0.5 bg-amber-light border border-amber rounded animate-fade-in">{t('msg_child_married_disabled_review')}</span>
                            )}
                          </div>

                          <div className="mt-3 p-3 bg-gray-50 border border-subtle rounded animate-fade-in shadow-sm">
                            <label className="flex gap-2 text-sm font-bold text-[#334155] cursor-pointer"><input type="checkbox" className="min-w-[16px]" checked={child.is_disabled || false} onChange={e => { let arr = [...m.children]; arr[j].is_disabled = e.target.checked; updateMar(i, 'children', arr); }} /> {t('lbl_child_disabled')}</label>
                            {child.is_disabled && (
                              <div className="pl-6 space-y-2 mt-2 border-l-2 border-primary">
                                <label className="flex gap-2 text-sm cursor-pointer"><input type="checkbox" checked={child.dis_before_26 || false} onChange={e => { let arr = [...m.children]; arr[j].dis_before_26 = e.target.checked; updateMar(i, 'children', arr); }} /> {t('lbl_child_dis_before_26')}</label>
                                <label className="flex gap-2 text-sm cursor-pointer"><input type="checkbox" checked={child.health_307 || false} onChange={e => { let arr = [...m.children]; arr[j].health_307 = e.target.checked; updateMar(i, 'children', arr); }} /> {t('lbl_child_health_307')}</label>
                                {child.health_307 && (
                                  <div className="pl-6 space-y-2 mt-2 border-l-2 border-blue-400 animate-fade-in">
                                    <label className="flex gap-2 text-sm cursor-pointer"><input type="checkbox" checked={child.med_board || false} onChange={e => { let arr = [...m.children]; arr[j].med_board = e.target.checked; updateMar(i, 'children', arr); }} /> {t('lbl_child_med_board')}</label>
                                    {child.med_board && (
                                      <div className="form-row mt-2 max-w-sm animate-fade-in"><label className="label text-xs text-blue-900">{t('lbl_med_board_date')}</label><input type="date" min="1900-01-01" className="form-input text-xs border-blue-400" value={child.med_board_date || ''} onChange={e => { let arr = [...m.children]; arr[j].med_board_date = e.target.value; updateMar(i, 'children', arr); }} /></div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const SectionD = () => {
    const isDGApprovalNeeded = checkDGPensionApprovalNeeded();

    return (
      <div>
        <div className="tag">{t('section_d_title')}</div>
        {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}
        <h2 className="text-2xl font-bold mb-4">{t('lbl_contributor_civil_status')}</h2>

        {renderMarriageBuilder("Section D", "contributorMarriagesCount", "contributorMarriages")}

        {isDGApprovalNeeded && (
          <div className="p-4 bg-amber-light border border-amber rounded mb-6 mt-4">
            <h4 className="font-bold text-amber flex items-center gap-2"><AlertTriangle size={20} /> {t('lbl_dg_approval_needed')}</h4>
            <p className="text-amber mt-1 text-sm font-bold">{t('msg_dg_approval_needed')}</p>
          </div>
        )}

        <div className="button-group mt-0 border-none pt-0">
          <button className="btn btn-secondary" onClick={() => setCheckerStep(2)}><ChevronLeft size={20} /> {t('btn_back')}</button>
          <button className="btn" onClick={() => {
            if (data.contributorMarriagesCount === 0) {
              handleRejection(t('err_no_wop_benefit'));
              return;
            }
            let errs = {};
            let fatals = [];
            for (let i = 0; i < data.contributorMarriages.length; i++) {
              let m = data.contributorMarriages[i];
              const ageAtMarriage = m.date && data.dob ? computeAgeAtDate(data.dob, m.date) : '';
              const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
              // Required: marriage date
              if (!m.date) errs[`contributorMarriages_${i}_date`] = t('err_marriage_date_required');
              // Required: cert number if registered
              if (!m.isUnregistered && !m.cert) errs[`contributorMarriages_${i}_cert`] = t('err_cert_required');
              if (m.cert && !/^\d+$/.test(m.cert)) errs[`contributorMarriages_${i}_cert`] = t('err_numeric_required');
              // Required: spouse name
              if (!m.s_name) errs[`contributorMarriages_${i}_s_name`] = t('err_spouse_name_required');
              // Termination dates when applicable
              if (m.s_term === 'Legally Divorced') {
                if (!m.s_nisi_date) errs[`contributorMarriages_${i}_s_nisi_date`] = t('err_decree_nisi_required');
                if (!m.s_div_date) errs[`contributorMarriages_${i}_s_div_date`] = t('err_decree_absolute_required');
              }
              if (m.s_term === 'Separated' && !m.s_sep_date) errs[`contributorMarriages_${i}_s_sep_date`] = t('err_sep_date_required');
              if (m.s_term === 'Void') {
                if (!m.s_void_date) errs[`contributorMarriages_${i}_s_void_date`] = t('err_void_date_required');
                if (!m.s_void_court) errs[`contributorMarriages_${i}_s_void_court`] = t('err_void_court_required');
                if (!m.s_void_case) errs[`contributorMarriages_${i}_s_void_case`] = t('err_void_case_required');
              }
              if (m.s_remarried && !m.s_remarriage_date) errs[`contributorMarriages_${i}_s_rem_date`] = t('err_remarriage_date_required');
              if ((!m.s_alive || m.s_term === 'Ended: Demise of Spouse') && !m.s_dod) errs[`contributorMarriages_${i}_s_dod`] = t('err_spouse_dod_required');
              // Children DOB required
              (m.children || []).forEach((c, j) => {
                if (!c.dob) errs[`contributorMarriages_${i}_c_${j}_dob`] = t('err_child_dob_required');
              });
              if (data.dor && m.date && m.date > data.dor && !allowedPostRet) {
                fatals.push(`${t('lbl_marriage_record_n')} ${i + 1}: ${t('err_fatal_marriage_post_ret')}`);
              }
            }
            const linearCheck = validateLinearMarriages(data.contributorMarriages, data.dob, data.gender, 'contributorMarriages', data, t);
            if (!linearCheck.valid) {
              errs = { ...errs, ...linearCheck.errors };
            }
            if (linearCheck.rejections) {
              fatals = [...fatals, ...linearCheck.rejections];
            }

            if (fatals.length > 0) {
              handleRejection(fatals);
              return;
            }

            if (Object.keys(errs).length > 0) {
              setFormErrors({ ...formErrors, ...errs, global: t('err_format_red_fields') });
              return;
            }

            setFormErrors({});

            let linkIdx = data.app_link_contributor_index || 0;
            let conIdx = data.app_contributor_marriage_index || 0;
            let arr = [...data.applicantMarriages];
            if (data.contributorMarriages[linkIdx] && arr.length > conIdx) {
              arr[conIdx] = JSON.parse(JSON.stringify(data.contributorMarriages[linkIdx]));
              updateData('applicantMarriages', arr);
            }

            setCheckerStep(4);
          }}>{t('btn_next_section_e')} <ChevronRight size={20} /></button>
        </div>
      </div>
    );
  };

  const SectionE_F = () => (
    <div>
      <div className="tag">{t('section_e_title')}</div>
      {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}
      <h2 className="text-2xl font-bold mb-4">{t('lbl_applicant_civil_status')}</h2>

      {/* Auto-Sync Logical Block functionally subsumed universally natively below. */}

      {data.applicantMarriagesCount > 1 && !data.identicalApplicantMarriage && (
        <div className="mb-4 bg-surface-alt p-4 border border-subtle rounded animate-fade-in shadow-sm">
          <label className="font-bold text-primary block mb-3">{t('lbl_which_marriage_connects')}</label>
          <div className="flex gap-4 flex-wrap">
            {data.applicantMarriages.map((m, idx) => (
              <label key={idx} className="cursor-pointer flex items-center gap-2 font-bold text-sm bg-[#ffffff] py-1 px-3 rounded border border-subtle">
                <input type="radio" checked={data.app_contributor_marriage_index === idx} onChange={() => updateData('app_contributor_marriage_index', idx)} /> {t('lbl_marriage_idx')}{idx + 1}
              </label>
            ))}
          </div>
        </div>
      )}

      {renderMarriageBuilder("Section E", "applicantMarriagesCount", "applicantMarriages", true)}

      <div className="bg-[#ffffff] p-6 border border-subtle rounded-xl mt-6 shadow-sm mb-6">
        <h3 className="font-bold text-lg text-primary mb-2 border-b border-subtle pb-2">{t('lbl_applicant_post_demise_status')}</h3>
        <div className="flex items-center gap-4 mb-4">
          <label className="font-bold text-sm text-[#334155]">{t('lbl_applicant_engaged_another_marriage')}</label>
          <label className="cursor-pointer"><input type="radio" checked={data.a_remarried} onChange={() => updateData('a_remarried', true)} /> {t('opt_yes')}</label>
          <label className="cursor-pointer"><input type="radio" checked={!data.a_remarried} onChange={() => updateData('a_remarried', false)} /> {t('msg_no')}</label>
        </div>
        <div className="mt-6 pt-4 border-t border-subtle">
          <h4 className="font-bold text-[#334155] mb-4">{t('lbl_dependent_orphan_care')}</h4>
          {(() => {
            const validOrphans = extractOrphans();
            if (validOrphans.length === 0) return <div className="text-sm text-muted italic animate-fade-in">{t('msg_no_eligible_orphans')}</div>;
            return validOrphans.map(o => (
              <div key={o.childId} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3 p-3 bg-surface-alt rounded border border-subtle animate-fade-in">
                <span className="text-sm font-bold flex-1 text-primary">{o.name || t('lbl_unnamed_dependent')} <span className="text-xs font-normal text-muted">({t('lbl_marriage_idx')} {o.marriageIndex}) {o.isEligibleDisabled ? '[Disabled Flag]' : ''}</span></span>
                <label className="text-sm font-bold min-w-48 text-[#334155]">{t('lbl_maintained_by_applicant')}</label>
                <label className="cursor-pointer px-2 py-1"><input type="radio" checked={(data.orphan_care || {})[o.childId] !== false} onChange={() => { updateData('orphan_care', { ...(data.orphan_care || {}), [o.childId]: true }) }} /> {t('opt_yes')} <span className="text-[10px] ml-1 text-success">{t('msg_maintains_proxy')}</span></label>
                <label className="cursor-pointer px-2 py-1"><input type="radio" checked={(data.orphan_care || {})[o.childId] === false} onChange={() => { updateData('orphan_care', { ...(data.orphan_care || {}), [o.childId]: false }) }} /> {t('msg_no')} <span className="text-[10px] ml-1 text-amber">{t('msg_delegates_ownership')}</span></label>
              </div>
            ));
          })()}
        </div>
        {data.a_remarried && (
          <div className="form-row pt-2 pb-2">
            <label className="label">{t('lbl_remarriage_date')}</label>
            <input type="date" min="1900-01-01" className={`form-input max-w-sm ${formErrors.a_remarriage_date ? 'border-[2px] border-error text-error' : 'border-amber'}`} value={data.a_remarriage_date || ''} onChange={e => { updateData('a_remarriage_date', e.target.value); setFormErrors(p => ({ ...p, a_remarriage_date: null })); }} />
            {formErrors.a_remarriage_date && <div className="text-error text-xs font-bold mt-1">{formErrors.a_remarriage_date}</div>}
            <p className="text-amber text-xs font-bold mt-1 mb-2">{t('msg_warning_validating_remarriage')}</p>

            {data.a_remarriage_date && data.a_remarriage_date < '2010-08-17' && (
              <div className="mt-3 p-3 bg-amber-light border border-amber rounded">
                <label className="font-bold text-amber block mb-2">{t('lbl_apply_50_wop')}</label>
                <div className="flex gap-4">
                  <label className="text-sm font-bold text-amber cursor-pointer"><input type="radio" checked={data.a_remarriage_applied_50 === true} onChange={() => updateData('a_remarriage_applied_50', true)} /> {t('opt_yes')}</label>
                  <label className="text-sm font-bold text-amber cursor-pointer"><input type="radio" checked={data.a_remarriage_applied_50 === false} onChange={() => updateData('a_remarriage_applied_50', false)} /> {t('msg_no')}</label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="button-group mt-0 pt-0">
        <button className="btn btn-secondary" onClick={() => setCheckerStep(3)}><ChevronLeft size={20} /> {t('btn_back')}</button>
        <button className="btn" style={{ background: "var(--success)" }} onClick={() => {
          let errs = {};
          let fatals = [];
          for (let i = 0; i < data.applicantMarriages.length; i++) {
            const m = data.applicantMarriages[i];
            const ageAtMarriage = m.date && data.dob ? computeAgeAtDate(data.dob, m.date) : '';
            const allowedPostRet = data.serviceSector === 'Forces' && data.retiredDueToTerrorism && ageAtMarriage !== '' && ageAtMarriage < 55;
            const isContributorSlot = i === (data.app_contributor_marriage_index || 0);
            if (!isContributorSlot) {
              // Only validate non-contributor slots (contributor slot data comes from Section D)
              if (!m.date) errs[`applicantMarriages_${i}_date`] = t('err_marriage_date_required');
              if (!m.isUnregistered && !m.cert) errs[`applicantMarriages_${i}_cert`] = t('err_cert_required');
              if (!m.s_name) errs[`applicantMarriages_${i}_s_name`] = t('err_spouse_name_required');
              if (m.s_term === 'Legally Divorced') {
                if (!m.s_nisi_date) errs[`applicantMarriages_${i}_s_nisi_date`] = t('err_decree_nisi_required');
                if (!m.s_div_date) errs[`applicantMarriages_${i}_s_div_date`] = t('err_decree_absolute_required');
              }
              if (m.s_term === 'Separated' && !m.s_sep_date) errs[`applicantMarriages_${i}_s_sep_date`] = t('err_sep_date_required');
              if (m.s_term === 'Void') {
                if (!m.s_void_date) errs[`applicantMarriages_${i}_s_void_date`] = t('err_void_date_required');
                if (!m.s_void_court) errs[`applicantMarriages_${i}_s_void_court`] = t('err_void_court_required');
                if (!m.s_void_case) errs[`applicantMarriages_${i}_s_void_case`] = t('err_void_case_required');
              }
              if (m.s_remarried && !m.s_remarriage_date) errs[`applicantMarriages_${i}_s_rem_date`] = t('err_remarriage_date_required');
              if ((!m.s_alive || m.s_term === 'Ended: Demise of Spouse') && !m.s_dod) errs[`applicantMarriages_${i}_s_dod`] = t('err_spouse_dod_required');
            }
            if (m.cert && !/^\d+$/.test(m.cert)) errs[`applicantMarriages_${i}_cert`] = t('err_numeric_required');
            if (data.dor && m.date && m.date > data.dor && !allowedPostRet) {
              fatals.push(`${t('lbl_marriage_idx')} ${i + 1}: ${t('err_applicant_marriage_post_ret')}`);
            }
          }
          // Applicant remarriage date required if remarried
          if (data.a_remarried && !data.a_remarriage_date) errs.a_remarriage_date = t('err_remarriage_date_required');
          const linearCheck = validateLinearMarriages(data.applicantMarriages, null, null, 'applicantMarriages', data, t);
          if (!linearCheck.valid) {
            errs = { ...errs, ...linearCheck.errors };
          }
          if (linearCheck.rejections) {
            fatals = [...fatals, ...linearCheck.rejections];
          }
          if (data.a_remarried && data.a_remarriage_date && data.a_remarriage_date < '2010-08-17' && data.a_remarriage_applied_50 === false) {
            fatals.push(t('err_applicant_remarried_no_50'));
          }
          if (fatals.length > 0) {
            handleRejection(fatals);
            return;
          }

          if (Object.keys(errs).length > 0) {
            setFormErrors({ ...formErrors, ...errs, global: t('err_format_red_fields') });
            return;
          }

          // Track Remarriage / Divorce logic contextually
          const conIdx = data.app_contributor_marriage_index || 0;
          const conMar = data.applicantMarriages[conIdx];
          if (conMar && conMar.s_term === 'Legally Divorced') {
            handleRejection(t('err_divorced_from_contributor')); return;
          }
          if (data.applicantMarriages.length - 1 > conIdx) {
            updateData('a_remarried', true);
          } else if (data.applicantMarriages.length - 1 === conIdx) {
            updateData('a_remarried', false);
          }

          // Clear prior errors dynamically upon successful check
          setFormErrors({});
          updateData('isEligible', true);
          updateData('rejectionReasons', []);
          setCheckerStep(5); // Proceed to Section_Docs
        }}>{t('btn_proceed_docs')} <ChevronRight size={20} /></button>
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
                    <tr><td style={{ padding: '0.3rem', fontWeight: 600, width: '40%', color: '#475569' }}>{t('lbl_date_of_marriage')}</td><td style={{ padding: '0.3rem' }}>{formatDate(m.date) || t('msg_na')}</td></tr>
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
