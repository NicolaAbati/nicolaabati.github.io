function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

let scrollToTop = document.querySelector("#scroll-to-top");
scrollToTop.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".portfolio");
  const links = Array.from(document.querySelectorAll(".side-menu a"));
  const sections = Array.from(container.querySelectorAll(".panel"));

  let activeId = null;

  const setActive = (id) => {
    if (activeId === id) return;
    activeId = id;
    links.forEach((l) =>
      l.classList.toggle("active", l.getAttribute("href") === "#" + id),
    );
  };

  const OFFSET = 400; // distanza dal top viewport che decide la sezione attiva
  let isProgrammaticScroll = false;

  const onScroll = () => {
    if (isProgrammaticScroll) return;

    const scrollPos = window.scrollY + OFFSET;

    let current = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        current = section;
      }
    });

    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      current = sections[sections.length - 1];
    }

    setActive(current.id);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener(
    "scroll",
    () => {
      // distanza scrollata dall'inizio
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const showAfter = 300; // mostra il bottone dopo 300px di scroll

      if (scrollTop > showAfter) {
        scrollToTop.style.opacity = "1";
      } else {
        scrollToTop.style.opacity = "0";
      }
    },
    { passive: true },
  );

  // Initial highlight
  if (sections.length && !isMobile()) setActive(sections[0].id);

  // Tech logo popovers
  const techLogos = Array.from(document.querySelectorAll(".tech-logo"));

  const closePopover = () => {
    const existingOverlay = document.querySelector(".tech-overlay");
    if (existingOverlay) existingOverlay.remove();
    const existingPopover = document.querySelector(".tech-popover");
    if (existingPopover) existingPopover.remove();
    document.removeEventListener("keydown", onKeyDown);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") closePopover();
  };

  const openPopover = (logoEl) => {
    closePopover();
    const desc = logoEl.getAttribute("data-desc") || logoEl.alt || "";
    const overlay = document.createElement("div");
    overlay.className = "tech-overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePopover();
    });

    const pop = document.createElement("div");
    pop.className = "tech-popover";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-modal", "true");

    const closeBtn = document.createElement("button");
    closeBtn.className = "close";
    closeBtn.innerText = "×";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", closePopover);
    pop.appendChild(closeBtn);

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "10px";
    const logoClone = logoEl.cloneNode(true);
    logoClone.removeAttribute("data-desc");
    logoClone.removeAttribute("tabindex");
    logoClone.style.width = "60px";
    logoClone.style.height = "60px";
    logoClone.style.margin = "0 0 20px 0";
    header.appendChild(logoClone);
    const title = document.createElement("div");
    title.innerHTML =
      '<strong style="display:block;margin-bottom:6px">' +
      (logoEl.alt || "") +
      "</strong>";
    pop.appendChild(header);

    const content = document.createElement("div");
    content.className = "content";
    content.style.marginTop = "8px";
    content.innerText = desc;
    pop.appendChild(content);

    overlay.appendChild(pop);
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);

    // Positioning for desktop, mobile bottom sheet
    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    if (isMobile) {
      // Center popover on small screens instead of bottom sheet
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      pop.style.position = "fixed";
      pop.style.left = "50%";
      pop.style.top = "50%";
      pop.style.transform = "translate(-50%, -50%)";
      pop.style.maxWidth = "92%";
      pop.style.width = "70%";
      // ensure mobile-specific class doesn't force bottom-sheet styles
      pop.classList.remove("mobile");
    } else {
      overlay.style.alignItems = "flex-start";
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
      if (top + popRect.height > window.innerHeight)
        top = window.innerHeight - popRect.height - 12;
      if (top < 12) top = 12;
      pop.style.left = left + "px";
      pop.style.top = top + "px";
      pop.style.position = "fixed";
    }
    // focus close for accessibility
    closeBtn.focus();
  };

  techLogos.forEach((logo) => {
    logo.addEventListener("click", () => openPopover(logo));
    logo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopover(logo);
      }
    });
  });
});
