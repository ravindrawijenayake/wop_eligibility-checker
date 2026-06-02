const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const landingStyles = `
/* --- Landing Page Premium Refinements --- */

/* Animated Mesh Gradient Background */
.mesh-bg {
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
}

.mesh-bg::before,
.mesh-bg::after {
  content: '';
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  filter: blur(120px);
  z-index: -1;
  animation: float 20s infinite alternate ease-in-out;
}

.mesh-bg::before {
  top: -200px;
  left: -200px;
  background: rgba(14, 165, 233, 0.3); /* sky-500 */
}

.mesh-bg::after {
  bottom: -200px;
  right: -200px;
  background: rgba(99, 102, 241, 0.25); /* indigo-500 */
  animation-delay: -10s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(100px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-50px, 100px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

/* Gradient Text Title */
.gradient-text {
  background: linear-gradient(135deg, #0f172a 0%, #4338ca 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Premium Glass Role Cards */
.role-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 1rem !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
  padding: 1.25rem !important;
  cursor: pointer !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
}

.role-card:hover {
  transform: translateY(-8px) scale(1.02) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), inset 0 0 0 2px rgba(14, 165, 233, 0.3) !important;
}

.role-card.active {
  background: rgba(255, 255, 255, 1) !important;
  border-color: var(--primary) !important;
  box-shadow: 0 20px 40px -10px rgba(2, 132, 199, 0.2), inset 0 0 0 2px var(--primary) !important;
}

.role-icon-wrapper {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe) !important;
  color: var(--primary) !important;
  padding: 1rem !important;
  border-radius: 50% !important;
  margin-bottom: 0.75rem !important;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.1) !important;
  transition: all 0.3s ease !important;
}

.role-card:hover .role-icon-wrapper {
  background: var(--primary) !important;
  color: white !important;
  transform: scale(1.1) rotate(5deg) !important;
}
.role-card.active .role-icon-wrapper {
  background: var(--primary) !important;
  color: white !important;
}

.role-title {
  font-weight: 700 !important;
  color: #1e293b !important;
  font-family: 'Outfit', sans-serif !important;
  font-size: 1.1rem !important;
}
`;

if (!css.includes('.mesh-bg')) {
  css += '\n' + landingStyles;
  fs.writeFileSync('src/index.css', css, 'utf8');
  console.log('Appended mesh gradient styles');
} else {
  console.log('Mesh gradient styles already exist');
}
