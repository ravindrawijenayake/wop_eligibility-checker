const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const oldStepper = `<div className="step-indicator print-hide">
              {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className={\`step-dot \${checkerStep >= i - 1 ? 'active' : ''}\`}></div>)}
            </div>`;

const newStepper = `<div className="stepper-container print-hide">
              <div className="stepper-progress" style={{ width: \`\${(checkerStep / 6) * 100}%\` }}></div>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className={\`stepper-step \${checkerStep === i - 1 ? 'active' : ''} \${checkerStep > i - 1 ? 'completed' : ''}\`} title={\`Step \${i}\`}>
                  {checkerStep > i - 1 ? <CheckCircle size={20} /> : i}
                </div>
              ))}
            </div>`;

if (jsx.includes(oldStepper)) {
  jsx = jsx.replace(oldStepper, newStepper);
  fs.writeFileSync('src/App.jsx', jsx, 'utf8');
  console.log('Stepper updated.');
} else {
  console.log('Stepper not found.');
}
