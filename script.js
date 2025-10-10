// Cute Passcode Gate with animated background

const PASSWORD = '0314';

document.addEventListener('DOMContentLoaded', () => {
  createHearts(26);
  // Background images disabled: keep mint gradient with hearts only
  initPolaroidSlider();

  const message = document.querySelector('.message');
  const dots = Array.from(document.querySelectorAll('.dot'));
  const keypad = document.querySelector('.keypad');
  let buffer = '';

  function updateDots(len) {
    dots.forEach((d, i) => d.classList.toggle('filled', i < len));
  }

  function validate() {
    if (buffer === PASSWORD) {
      message.textContent = 'Access granted 💚';
      document.getElementById('gate').classList.add('granted');
      localStorage.setItem('access_granted', 'true');
      setTimeout(() => {
        fetch('welcome.html', { method: 'HEAD' })
          .then((resp) => {
            if (resp.ok) {
              document.body.classList.remove('ready');
              document.body.classList.add('leaving');
              setTimeout(() => { window.location.href = 'welcome.html'; }, 350);
            }
          })
          .catch(() => {});
      }, 900);
    } else {
      message.textContent = 'Oops, that passcode isn’t right.';
      document.getElementById('gate').classList.remove('granted');
      shake(document.querySelector('.card'));
      buffer = '';
      updateDots(0);
    }
  }

  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const digit = btn.getAttribute('data-key');
    const action = btn.getAttribute('data-action');
    if (action === 'backspace') {
      buffer = buffer.slice(0, -1);
      updateDots(buffer.length);
      return;
    }
    if (digit && buffer.length < 4) {
      buffer += digit;
      updateDots(buffer.length);
      if (buffer.length === 4) validate();
    }
  });

  // Optional keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      if (buffer.length < 4) {
        buffer += e.key;
        updateDots(buffer.length);
        if (buffer.length === 4) validate();
      }
    } else if (e.key === 'Backspace') {
      buffer = buffer.slice(0, -1);
      updateDots(buffer.length);
    }
  });
});

// initSlideshow disabled

// initDomeGallery disabled

// CSS Polaroid slider using images/solo
function initPolaroidSlider() {
  fetchSoloImages().then((urls) => {
    if (!urls || urls.length === 0) return;
    // Use all images in the 'us' collection
    const count = urls.length;
    // Desired gap between flips (seconds). Adjust to 1 or 2 if preferred.
    const gapSec = 1.5;
    // Keep one-at-a-time: movement window is 20% of duration, set duration = 5 * gap
    const durSec = gapSec * 5; // ensures movement ~ gap
    document.documentElement.style.setProperty('--n', count);
    document.documentElement.style.setProperty('--d', `${durSec}s`);
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.className = 'polaroid-image';
      img.src = urls[i];
      img.alt = 'Our memory';
      img.loading = 'lazy';
      img.style.setProperty('--i', i);
      const rot = (Math.random() * 10 - 5).toFixed(2);
      img.style.setProperty('--r', `${rot}deg`);
      // Stagger so first card starts on top, then one-by-one with gapSec spacing
      const delaySec = -(0.8 * durSec) - (i * gapSec);
      img.style.animationDelay = `${delaySec}s, ${delaySec}s`;
      const gate = document.getElementById('gate');
      let container = document.getElementById('polaroid-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'polaroid-container';
        container.className = 'polaroid-container';
        gate.appendChild(container);
      }
      container.appendChild(img);
    }
  });
}

function fetchSoloImages() {
  return fetch('images-manifest.json')
    .then((res) => res.json())
    .then((m) => Array.isArray(m.us) ? m.us : [])
    .catch(() => []);
}

function fetchImagesFromDirectory() {
  return fetch('images-manifest.json')
    .then((res) => res.json())
    .then((m) => {
      const collections = [m.us, m.coupons];
      return collections.filter(Array.isArray).flat();
    })
    .catch(() => []);
}

function startCrossfade(container, intervalMs) {
  const slides = Array.from(container.querySelectorAll('.slide'));
  if (slides.length === 0) return;
  let idx = 0;
  slides.forEach((s, i) => s.classList.toggle('active', i === 0));
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, Math.max(3000, intervalMs || 5000));
}

function createHearts(count = 20) {
  const layer = document.getElementById('hearts-layer');
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    const size = 16 + Math.random() * 18; // 16–34px
    h.style.setProperty('--size', `${size}px`);
    h.style.left = `${Math.random() * vw}px`;
    h.style.top = `${60 + Math.random() * 30}vh`;
    h.style.opacity = `${0.55 + Math.random() * 0.35}`;
    h.style.setProperty('--dur', `${8 + Math.random() * 8}s`);
    layer.appendChild(h);
  }
}

function shake(el) {
  if (!el) return;
  const anim = el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 300, easing: 'ease-in-out' }
  );
  anim.onfinish = () => (el.style.transform = '');
}