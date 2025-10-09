// Cute Passcode Gate with animated background

const PASSWORD = '0314';

document.addEventListener('DOMContentLoaded', () => {
  createHearts(26);
  // Background images disabled: keep mint gradient with hearts only
  initStackGallery();

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

// Right-side square stack gallery using images/solo
function initStackGallery() {
  const container = document.getElementById('stack-gallery');
  if (!container) return;
  // Make it interactive and accessible
  container.setAttribute('role', 'button');
  container.setAttribute('aria-label', 'Next photo');
  container.setAttribute('title', 'Click to skip to next photo');
  container.tabIndex = 0;
  fetchSoloImages().then((urls) => {
    if (!urls || urls.length === 0) return;

    // Use all available images from images/us with no cap
    const MAX = urls.length;
    const visible = Math.min(6, MAX);
    const cards = [];

    // Helper to randomize slight rotation/offset for layered look
    const randomize = (el, depth) => {
      const angle = (Math.random() * 8 - 4); // -4..4 deg
      const shiftX = (Math.random() * 10 - 5); // small x offset
      const shiftY = (Math.random() * 10 - 5);
      const scale = 1 - depth * 0.015;
      el.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${angle}deg) scale(${scale})`;
      el.style.zIndex = String(depth + 1);
      el.style.opacity = depth === visible - 1 ? '1' : '0.96';
      el.style.filter = depth < visible - 1 ? 'brightness(0.96) contrast(0.98)' : 'none';
    };

    // Create initial stack
    for (let i = 0; i < visible; i++) {
      const card = document.createElement('div');
      card.className = 'stack-card';
      card.style.backgroundImage = `url('${urls[i % MAX]}')`;
      randomize(card, i);
      container.appendChild(card);
      cards.push(card);
      // Initial load animation with staggered opacity
      card.animate(
        [ { opacity: 0 }, { opacity: 1 } ],
        { duration: 700, delay: i * 120, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' }
      );
    }

    let idx = visible;
    let isAnimating = false;
    const next = () => {
      if (isAnimating) return;
      const url = urls[idx++ % MAX];
      const top = cards.shift(); // reuse the oldest element for the new top
      top.style.backgroundImage = `url('${url}')`;
      top.style.zIndex = String(visible + 2);

      // Entrance animation to the top of the stack
      isAnimating = true;
      const anim = top.animate(
        [
          { transform: 'translate(28px, -32px) rotate(8deg) scale(0.94)', opacity: 0 },
          { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1 }
        ],
        { duration: 800, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      // Final slight settle
      const settleAngle = (Math.random() * 6 - 3);
      top.style.transform = `translate(0px, 0px) rotate(${settleAngle}deg) scale(1)`;
      top.style.opacity = '1';
      top.style.filter = 'none';

      // Push current others one depth down and re-randomize
      cards.forEach((c, i) => randomize(c, i));
      cards.push(top);
      anim.onfinish = () => { isAnimating = false; };
    };

    // Smooth scheduling with resettable timer
    const INTERVAL = 2200;
    let timerId = 0;
    const schedule = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => { next(); schedule(); }, INTERVAL);
    };
    schedule();

    // Click/keyboard to skip
    const trigger = () => { next(); schedule(); };
    container.addEventListener('click', trigger);
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault(); trigger();
      }
    });
  });
}

function fetchSoloImages() {
  const path = 'images/us/';
  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return fetch(path)
    .then((res) => res.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const anchors = Array.from(doc.querySelectorAll('a'));
      return anchors
        .map((a) => a.getAttribute('href'))
        .filter((h) => !!h && exts.some((ext) => h.toLowerCase().endsWith(ext)))
        .map((f) => `${path}${f}`);
    })
    .catch(() => []);
}

function fetchImagesFromDirectory() {
  const paths = ['images/', 'images/dashboard/', 'images/solo/', 'images/us/'];
  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fetchFrom = (path) =>
    fetch(path)
      .then((res) => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const anchors = Array.from(doc.querySelectorAll('a'));
        const files = anchors
          .map((a) => a.getAttribute('href'))
          .filter((h) => !!h && exts.some((ext) => h.toLowerCase().endsWith(ext)))
          .map((f) => `${path}${f}`);
        return files;
      })
      .catch(() => []);
  return Promise.all(paths.map(fetchFrom)).then((lists) => lists.flat());
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