const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update Title to use gradient text
const oldTitle = `<h2 className="text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>`;
const newTitle = `<h2 className="text-5xl lg:text-6xl font-black mb-4 gradient-text tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>`;

// 2. Replace Role Cards to remove flex items-center so it aligns with flex-col
const oldPublic = `<div className={\`role-card \${userRole === 'Public' ? 'active' : ''}\`} onClick={() => setUserRole('Public')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><UserCircle2 size={20} /></div>
                  <div className="role-title text-base">{t('role_public')}</div>
                </div>
              </div>`;
const newPublic = `<div className={\`role-card \${userRole === 'Public' ? 'active' : ''}\`} onClick={() => setUserRole('Public')}>
                <div className="role-icon-wrapper"><UserCircle2 size={32} /></div>
                <div className="role-title">{t('role_public')}</div>
              </div>`;

const oldWorkingPlace = `<div className={\`role-card \${userRole === 'WorkingPlace' ? 'active' : ''}\`} onClick={() => setUserRole('WorkingPlace')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Activity size={20} /></div>
                  <div className="role-title text-base">{t('role_workplace')}</div>
                </div>
              </div>`;
const newWorkingPlace = `<div className={\`role-card \${userRole === 'WorkingPlace' ? 'active' : ''}\`} onClick={() => setUserRole('WorkingPlace')}>
                <div className="role-icon-wrapper"><Activity size={32} /></div>
                <div className="role-title">{t('role_workplace')}</div>
              </div>`;

const oldDivSec = `<div className={\`role-card \${userRole === 'DivSec' ? 'active' : ''}\`} onClick={() => setUserRole('DivSec')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><PieChart size={20} /></div>
                  <div className="role-title text-base">{t('role_divsec')}</div>
                </div>
              </div>`;
const newDivSec = `<div className={\`role-card \${userRole === 'DivSec' ? 'active' : ''}\`} onClick={() => setUserRole('DivSec')}>
                <div className="role-icon-wrapper"><PieChart size={32} /></div>
                <div className="role-title">{t('role_divsec')}</div>
              </div>`;

const oldHeadOffice = `<div className={\`role-card \${userRole === 'HeadOffice' ? 'active' : ''}\`} onClick={() => setUserRole('HeadOffice')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Shield size={20} /></div>
                  <div className="role-title text-base">{t('role_headoffice')}</div>
                </div>
              </div>`;
const newHeadOffice = `<div className={\`role-card \${userRole === 'HeadOffice' ? 'active' : ''}\`} onClick={() => setUserRole('HeadOffice')}>
                <div className="role-icon-wrapper"><Shield size={32} /></div>
                <div className="role-title">{t('role_headoffice')}</div>
              </div>`;

// Apply Replacements
jsx = jsx.replace(oldTitle, newTitle);
jsx = jsx.replace(oldPublic, newPublic);
jsx = jsx.replace(oldWorkingPlace, newWorkingPlace);
jsx = jsx.replace(oldDivSec, newDivSec);
jsx = jsx.replace(oldHeadOffice, newHeadOffice);

fs.writeFileSync('src/App.jsx', jsx, 'utf8');
console.log('Landing page markup updated');
