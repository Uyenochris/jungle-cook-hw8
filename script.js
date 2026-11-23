// Hamburger navigation for laptop/tablet/phone.
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-menu');
if (menuButton && menu) {
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  document.addEventListener('click', event => { if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false); });
}

let noticeTimeout;
window.showNotice = (message, type = 'info') => {
  const notice = document.getElementById('notice');
  if (!notice) return;
  notice.textContent = message;
  notice.className = 'notice' + (type === 'error' ? ' is-error' : type === 'success' ? ' is-success' : '');
  notice.hidden = false;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { notice.hidden = true; }, 6000);
};

// Keep success messages visible after moving to another page.
try {
  const message = sessionStorage.getItem('jungle-cook-message');
  if (message) {
    sessionStorage.removeItem('jungle-cook-message');
    window.showNotice(message, 'success');
  }
} catch {}
