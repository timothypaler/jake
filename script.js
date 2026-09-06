const progress = document.querySelector('.page-progress span');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const portraitWrap = document.querySelector('.dual-portrait');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('.lightbox-stage p');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.transform = `scaleX(${ratio})`;

  if (portraitWrap && !reduceMotion && window.scrollY < window.innerHeight * 1.15) {
    const amount = Math.min(window.scrollY, 700);
    portraitWrap.style.setProperty('--front-y', `${amount * 0.035}px`);
    portraitWrap.style.setProperty('--back-y', `${amount * -0.045}px`);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuButton?.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img')?.alt || '';
    lightboxCaption.textContent = button.dataset.caption || '';
    lightbox.showModal();
  });
});

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox?.open) lightbox.close();
});

const filterButtons = document.querySelectorAll('[data-filter]');
const atlasItems = document.querySelectorAll('.atlas-item');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const filter = button.dataset.filter;
    atlasItems.forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.category !== filter;
    });
  });
});

const video = document.querySelector('.video-frame video');
if (video && !reduceMotion) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.6 });
  videoObserver.observe(video);
}

const musicPlayer = document.querySelector('.music-player');
const backgroundMusic = document.querySelector('#background-music');
const musicToggle = document.querySelector('.music-toggle');
const musicIcon = document.querySelector('.music-icon');
const musicVolume = document.querySelector('#music-volume');
const musicVolumeOutput = document.querySelector('.volume-control output');

if (backgroundMusic && musicToggle && musicIcon && musicVolume && musicVolumeOutput) {
  backgroundMusic.volume = 0.5;

  const setPlayerState = (playing) => {
    musicIcon.textContent = playing ? 'Ⅱ' : '▶';
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} Fall Out Boy - My Songs Know What You Did In The Dark`);
    musicPlayer?.classList.toggle('needs-play', !playing);
  };

  const tryAutoplay = () => {
    backgroundMusic.play()
      .then(() => setPlayerState(true))
      .catch(() => setPlayerState(false));
  };

  musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => setPlayerState(true)).catch(() => setPlayerState(false));
    } else {
      backgroundMusic.pause();
      setPlayerState(false);
    }
  });

  musicVolume.addEventListener('input', () => {
    const volume = Number(musicVolume.value);
    backgroundMusic.volume = volume / 100;
    musicVolumeOutput.value = `${volume}%`;
    musicVolumeOutput.textContent = `${volume}%`;
  });

  const unlockAudio = () => {
    if (backgroundMusic.paused) tryAutoplay();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  backgroundMusic.addEventListener('play', () => setPlayerState(true));
  backgroundMusic.addEventListener('pause', () => setPlayerState(false));
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  tryAutoplay();
}
