document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.portfolio');
  const links = Array.from(document.querySelectorAll('.side-menu a'));
  const sections = Array.from(container.querySelectorAll('.panel'));

  let activeId = null;

  const setActive = (id) => {
    if (activeId === id) return;
    activeId = id;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  };

  // Click handler: highlight immediately and scroll inside container smoothly
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = container.querySelector('#' + id);
      if (!target) return;
      setActive(id);
      // Compute scroll offset relative to the container (accounts for padding)
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scrollTop = container.scrollTop + (targetRect.top - containerRect.top - 100);
      // Disable scroll-driven active updates while programmatic smooth scrolling occurs
      const distance = Math.abs(scrollTop - container.scrollTop);
      const estimatedDuration = Math.min(900, Math.max(320, Math.round(distance * 0.5)));
      isProgrammaticScroll = true;
      clearTimeout(programmaticScrollTimer);
      programmaticScrollTimer = setTimeout(() => { isProgrammaticScroll = false; }, estimatedDuration + 80);
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    });
  });

  // Smooth, low-jitter scroll handler using container center
  let ticking = false;
  let isProgrammaticScroll = false;
  let programmaticScrollTimer = null;
  const onScroll = () => {
    if (ticking) return;
    if (isProgrammaticScroll) return; // ignore scroll events triggered by our smooth scroll
    ticking = true;
    requestAnimationFrame(() => {
        // Use viewport coordinates to compute the element closest to the container center
        const containerRect = container.getBoundingClientRect();
        const containerCenterY = containerRect.top + container.clientHeight / 2;
        let nearest = null;
        let minDist = Infinity;
        sections.forEach(s => {
          const r = s.getBoundingClientRect();
          const midY = r.top + r.height / 2;
          const dist = Math.abs(midY - containerCenterY);
          if (dist < minDist) { minDist = dist; nearest = s; }
        });
        if (nearest) setActive(nearest.id);
      ticking = false;
    });
  };

  container.addEventListener('scroll', onScroll, { passive: true });

  // Initial highlight
  if (sections.length) setActive(sections[0].id);

  // Cursor-following light effect (rAF-throttled)
  // (function(){
  //   let pending = false;
  //   let lastEvt = null;

  //   function applyCoords(e){
  //     const w = window.innerWidth;
  //     const h = window.innerHeight;
  //     let x, y;
  //     if (e.touches && e.touches[0]) {
  //       x = e.touches[0].clientX;
  //       y = e.touches[0].clientY;
  //     } else {
  //       x = e.clientX;
  //       y = e.clientY;
  //     }
  //     const px = (x / w) * 100;
  //     const py = (y / h) * 100;
  //     document.documentElement.style.setProperty('--mx', px + '%');
  //     document.documentElement.style.setProperty('--my', py + '%');
  //     document.documentElement.style.setProperty('--light-opacity', '0.2');
  //   }

  //   function schedule(){
  //     if (pending) return;
  //     pending = true;
  //     requestAnimationFrame(() => {
  //       if (lastEvt) applyCoords(lastEvt);
  //       pending = false;
  //     });
  //   }

  //   window.addEventListener('pointermove', (e) => { lastEvt = e; schedule(); }, {passive:true});
  //   window.addEventListener('touchmove', (e) => { lastEvt = e; schedule(); }, {passive:true});
  //   window.addEventListener('pointerleave', () => { document.documentElement.style.setProperty('--light-opacity','0'); });
  //   window.addEventListener('blur', () => { document.documentElement.style.setProperty('--light-opacity','0'); });
  //   window.addEventListener('pointerdown', (e)=>{ lastEvt = e; schedule(); });
  // })();

  // Tech logo popovers
  const techLogos = Array.from(document.querySelectorAll('.tech-logo'));

  const closePopover = () => {
    const existingOverlay = document.querySelector('.tech-overlay');
    if (existingOverlay) existingOverlay.remove();
    const existingPopover = document.querySelector('.tech-popover');
    if (existingPopover) existingPopover.remove();
    document.removeEventListener('keydown', onKeyDown);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closePopover();
  };

  const openPopover = (logoEl) => {
    closePopover();
    const desc = logoEl.getAttribute('data-desc') || logoEl.alt || '';
    const overlay = document.createElement('div');
    overlay.className = 'tech-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopover();
    });

    const pop = document.createElement('div');
    pop.className = 'tech-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close';
    closeBtn.innerText = '×';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', closePopover);
    pop.appendChild(closeBtn);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '10px';
    const logoClone = logoEl.cloneNode(true);
    logoClone.removeAttribute('data-desc');
    logoClone.removeAttribute('tabindex');
    logoClone.style.width = '60px';
    logoClone.style.height = '60px';
    logoClone.style.margin = '0 0 20px 0';
    header.appendChild(logoClone);
    const title = document.createElement('div');
    title.innerHTML = '<strong style="display:block;margin-bottom:6px">' + (logoEl.alt || '') + '</strong>';
    pop.appendChild(header);

    const content = document.createElement('div');
    content.className = 'content';
    content.style.marginTop = '8px';
    content.innerText = desc;
    pop.appendChild(content);

    overlay.appendChild(pop);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKeyDown);

    // Positioning for desktop, mobile bottom sheet
    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    if (isMobile) {
      pop.classList.add('mobile');
      overlay.style.alignItems = 'flex-end';
      // no extra positioning needed; bottom sheet fills width via CSS
    } else {
      overlay.style.alignItems = 'flex-start';
      // position pop next to logo
      const rect = logoEl.getBoundingClientRect();
      const popRect = pop.getBoundingClientRect();
      // default place to the right
      let left = rect.right + 12;
      let top = rect.top;
      // if not enough space on right, place on left
      if (left + 320 > window.innerWidth) {
        left = rect.left - 12 - 320;
      }
      // ensure top within viewport
      if (top + popRect.height > window.innerHeight) top = window.innerHeight - popRect.height - 12;
      if (top < 12) top = 12;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.style.position = 'fixed';
    }
    // focus close for accessibility
    closeBtn.focus();
  };

  techLogos.forEach(logo => {
    logo.addEventListener('click', () => openPopover(logo));
    logo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopover(logo); } });
  });
});
