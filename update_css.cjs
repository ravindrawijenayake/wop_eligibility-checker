const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Replace :root variables
const rootRegex = /:root\s*\{[^}]+\}/;
const newRoot = `:root {
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --bg-main: #f0fdfa;
  --bg-gradient-start: #0f172a;
  --bg-gradient-end: #1e293b;
  --surface: rgba(255, 255, 255, 0.95);
  --surface-alt: #f1f5f9;
  --surface-border: rgba(255, 255, 255, 0.2);
  --surface-hover: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #475569;
  --error: #ef4444;
  --success: #10b981;
  --amber: #d97706;
  --amber-light: #fef3c7;
  --radius-lg: 24px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-main: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(2, 132, 199, 0.2);
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.4);
}`;
css = css.replace(rootRegex, newRoot);

// Replace body styling
const bodyRegex = /body\s*\{[^}]+\}/;
const newBody = `body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-gradient-end);
  background-image: 
    radial-gradient(at 0% 0%, rgba(2, 132, 199, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
    linear-gradient(135deg, #f8fafc, #e2e8f0);
  background-attachment: fixed;
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  -webkit-font-smoothing: antialiased;
}`;
css = css.replace(bodyRegex, newBody);

// Improve .wizard-card
const wizardCardRegex = /\.wizard-card\s*\{[^}]+\}/;
const newWizardCard = `.wizard-card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-main);
  padding: 3rem;
  position: relative;
  overflow: hidden;
}`;
css = css.replace(wizardCardRegex, newWizardCard);

// Improve .btn styles
const btnRegex = /\.btn\s*\{[^}]+\}/;
const newBtn = `.btn {
  background: linear-gradient(135deg, var(--primary), #026ca3);
  color: #fff;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.3px;
}`;
css = css.replace(btnRegex, newBtn);

const btnHoverRegex = /\.btn:hover:not\(:disabled\)\s*\{[^}]+\}/;
const newBtnHover = `.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover), #025785);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
}`;
css = css.replace(btnHoverRegex, newBtnHover);

// Update headings to use Outfit font
const newClasses = `
h1, h2, h3, h4, h5, h6, .login-logo, .tag {
  font-family: 'Outfit', system-ui, sans-serif;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-main);
  border-radius: var(--radius-lg);
}

.role-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(2, 132, 199, 0.2);
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(2, 132, 199, 0.3);
}

.role-card.active {
  background: #f0f9ff;
  border: 2px solid var(--primary);
  box-shadow: var(--shadow-glow);
}

.role-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
}

.role-card:hover .role-icon-wrapper {
  background: #e0f2fe;
  color: var(--primary);
}

.role-card.active .role-icon-wrapper {
  background: var(--primary);
  color: #fff;
}

.role-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.role-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

/* Premium form inputs */
.form-input {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  transition: all 0.3s ease !important;
  border-radius: var(--radius-md) !important;
}

.form-input:focus {
  background: #fff !important;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15) !important;
  transform: translateY(-1px);
}
`;

css = css + '\\n' + newClasses;

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('index.css updated');
