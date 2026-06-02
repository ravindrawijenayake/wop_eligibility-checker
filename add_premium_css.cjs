const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const additionalStyles = `
/* Premium Wizard Enhancements */
.wizard-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 20px rgba(2, 132, 199, 0.05) !important;
  padding: 3rem !important;
  max-width: 900px !important;
  margin: 2rem auto !important;
}

/* Stepper Bar */
.stepper-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 1rem;
}
.stepper-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 2rem;
  right: 2rem;
  height: 4px;
  background: #e2e8f0;
  transform: translateY(-50%);
  z-index: 0;
  border-radius: 4px;
}
.stepper-progress {
  position: absolute;
  top: 50%;
  left: 2rem;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #6366f1);
  transform: translateY(-50%);
  z-index: 0;
  transition: width 0.4s ease;
  border-radius: 4px;
}
.stepper-step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #64748b;
  z-index: 1;
  transition: all 0.3s ease;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.stepper-step.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2);
}
.stepper-step.completed {
  border-color: var(--primary);
  background: white;
  color: var(--primary);
}

/* Premium Pill Radios */
.pill-radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.pill-radio-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}
.pill-radio-label input[type="radio"] {
  display: none;
}
.pill-radio-label:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}
.pill-radio-label.selected {
  border-color: var(--primary);
  background: #eff6ff;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
}

/* Checkbox Toggle */
.modern-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}
.modern-checkbox:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #cbd5e1;
}
.modern-checkbox input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--primary);
  cursor: pointer;
}

/* Modern Form Label */
.label {
  font-family: 'Outfit', sans-serif !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  color: #334155 !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

/* Result Dashboard Card */
.result-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}
.result-header {
  padding: 2rem;
  text-align: center;
  color: white;
}
.result-header.eligible {
  background: linear-gradient(135deg, #10b981, #059669);
}
.result-header.ineligible {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}
.result-body {
  padding: 2rem;
  background: #f8fafc;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}
.detail-item:last-child {
  border-bottom: none;
}
.detail-label {
  color: #64748b;
  font-weight: 600;
}
.detail-value {
  color: #0f172a;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  text-align: right;
}
`;

if (!css.includes('.pill-radio-group')) {
  css += '\\n' + additionalStyles;
  fs.writeFileSync('src/index.css', css, 'utf8');
  console.log('Appended premium CSS styles to index.css');
} else {
  console.log('Premium styles already exist.');
}
