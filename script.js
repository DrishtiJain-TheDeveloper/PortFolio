// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .skill-card, .project-card, .cert-card, .hackathon-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
});

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let shootingStars = [];
let orbs = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// --- Regular Particles ---
class Particle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = initial ? Math.random() * canvas.width : (Math.random() > 0.5 ? 0 : canvas.width);
    this.y = initial ? Math.random() * canvas.height : Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.8;
    this.baseSize = this.size;
    this.speedX = (Math.random() - 0.5) * 0.7;
    this.speedY = (Math.random() - 0.5) * 0.7;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.baseOpacity = this.opacity;
    const r = Math.random();
    if (r < 0.5) this.color = '124,58,237';
    else if (r < 0.8) this.color = '6,182,212';
    else this.color = '168,85,247';
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += this.pulseSpeed;
    this.opacity = this.baseOpacity + Math.sin(this.pulse) * 0.2;
    this.size = this.baseSize + Math.sin(this.pulse) * 0.4;

    // Mouse repulsion
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 2.5;
      this.y += (dy / dist) * force * 2.5;
    }

    if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${Math.min(this.opacity, 1)})`;
    ctx.fill();
    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    grad.addColorStop(0, `rgba(${this.color},${this.opacity * 0.3})`);
    grad.addColorStop(1, `rgba(${this.color},0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// --- Shooting Stars ---
class ShootingStar {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 0.5;
    this.len = Math.random() * 120 + 60;
    this.speed = Math.random() * 8 + 5;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    this.opacity = 0;
    this.fadeIn = true;
    this.life = 0;
    this.maxLife = Math.random() * 60 + 40;
    this.color = Math.random() > 0.5 ? '168,85,247' : '6,182,212';
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life++;
    if (this.life < 10) this.opacity = this.life / 10;
    else if (this.life > this.maxLife - 10) this.opacity = (this.maxLife - this.life) / 10;
    else this.opacity = 1;
    if (this.life >= this.maxLife || this.x > canvas.width + 50 || this.y > canvas.height + 50) this.reset();
  }
  draw() {
    const tailX = this.x - Math.cos(this.angle) * this.len;
    const tailY = this.y - Math.sin(this.angle) * this.len;
    const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
    grad.addColorStop(0, `rgba(${this.color},0)`);
    grad.addColorStop(1, `rgba(${this.color},${this.opacity * 0.9})`);
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Head glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}

// --- Floating Orbs ---
class Orb {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 80 + 40;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.06 + 0.03;
    const r = Math.random();
    this.color = r < 0.4 ? '124,58,237' : r < 0.7 ? '6,182,212' : '168,85,247';
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY;
    this.pulse += 0.008;
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = canvas.height + this.radius;
    if (this.y > canvas.height + this.radius) this.y = -this.radius;
  }
  draw() {
    const op = this.opacity + Math.sin(this.pulse) * 0.02;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, `rgba(${this.color},${op * 3})`);
    grad.addColorStop(0.4, `rgba(${this.color},${op})`);
    grad.addColorStop(1, `rgba(${this.color},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// --- Connections ---
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        const alpha = (1 - dist / 160) * 0.35;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = (1 - dist / 160) * 1.2;
        ctx.stroke();
      }
    }
    // Mouse connections
    const mdx = particles[i].x - mouse.x;
    const mdy = particles[i].y - mouse.y;
    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mdist < 180) {
      const alpha = (1 - mdist / 180) * 0.6;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
      ctx.lineWidth = (1 - mdist / 180) * 1.5;
      ctx.stroke();
    }
  }
}

// Init
for (let i = 0; i < 160; i++) particles.push(new Particle());
for (let i = 0; i < 4; i++) shootingStars.push(new ShootingStar());
for (let i = 0; i < 6; i++) orbs.push(new Orb());

// Stagger shooting stars
shootingStars.forEach((s, i) => { s.life = Math.floor((s.maxLife / 4) * i); });

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  orbs.forEach(o => { o.update(); o.draw(); });
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  shootingStars.forEach(s => { s.update(); s.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
  spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
  });
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop, height = sec.offsetHeight;
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
  });
}

// ===== TYPED ROLE =====
const roles = ['Full Stack Developer', 'Problem Solver', 'CS Student', 'Open Source Contributor', 'History Enthusiast', 'YouTuber'];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typedRole');

function typeRole() {
  const current = roles[roleIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) { deleting = true; setTimeout(typeRole, 1800); return; }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
  }
  setTimeout(typeRole, deleting ? 60 : 100);
}
typeRole();

// ===== CODE WINDOW ANIMATION =====
const codeLines = [
  '<span class="c-keyword">const</span> <span class="c-var">developer</span> = <span class="c-bracket">{</span>',
  '  <span class="c-prop">name</span>: <span class="c-string">"Your Name"</span>,',
  '  <span class="c-prop">role</span>: <span class="c-string">"CS Student"</span>,',
  '  <span class="c-prop">skills</span>: <span class="c-bracket">[</span><span class="c-string">"Python"</span>, <span class="c-string">"React"</span><span class="c-bracket">]</span>,',
  '  <span class="c-prop">passions</span>: <span class="c-bracket">[</span>',
  '    <span class="c-string">"Coding"</span>, <span class="c-string">"History"</span>,',
  '    <span class="c-string">"Egyptian Culture"</span>',
  '  <span class="c-bracket">]</span>,',
  '  <span class="c-prop">youtube</span>: <span class="c-string">"@yourhandle"</span>,',
  '  <span class="c-prop">openToWork</span>: <span class="c-keyword">true</span>',
  '<span class="c-bracket">}</span>',
  '',
  '<span class="c-comment">// Ready for placement!</span>',
];

const codeEl = document.getElementById('codeContent');
let lineIdx = 0;

function renderCodeLine() {
  if (lineIdx >= codeLines.length) return;
  const span = document.createElement('span');
  span.className = 'code-line';
  span.innerHTML = codeLines[lineIdx] || '&nbsp;';
  codeEl.appendChild(span);
  lineIdx++;
  setTimeout(renderCodeLine, 120);
}
setTimeout(renderCodeLine, 600);

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .cert-card, .hackathon-card, .os-card, .timeline-item, .yt-video-card, .skill-card, .interest-card, .interest-main-card, .edu-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(num => {
        const target = parseInt(num.dataset.target);
        let count = 0;
        const step = Math.ceil(target / 30);
        const interval = setInterval(() => {
          count = Math.min(count + step, target);
          num.textContent = count + '+';
          if (count >= target) clearInterval(interval);
        }, 50);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const aboutSection = document.getElementById('about');
if (aboutSection) counterObserver.observe(aboutSection);

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      });
    }
  });
}, { threshold: 0.3 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);

// ===== SKILL TABS =====
document.querySelectorAll('.skill-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) {
      panel.classList.add('active');
      panel.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 100);
      });
    }
  });
});

// ===== PROJECT FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
      if (show) {
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      }
    });
  });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.form-submit');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
    btn.disabled = false;
    document.getElementById('formSuccess').classList.add('show');
    this.reset();
    setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 4000);
  }, 1500);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== FADE IN ANIMATION =====
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style);

// ===== HERO PARALLAX =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero-content');
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.15}px)`;
    hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
  }
});
