document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (!body.classList.contains('page')) body.classList.add('page');
  // Enter animation
  requestAnimationFrame(() => body.classList.add('ready'));

  // Intercept internal links for smooth leaving
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const isExternal = /^https?:\/\//i.test(href) || href.startsWith('mailto:');
    if (isExternal || a.target) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      body.classList.remove('ready');
      body.classList.add('leaving');
      setTimeout(() => { window.location.href = href; }, 350);
    });
  });
});