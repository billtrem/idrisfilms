// Idris Films — mobile nav dropdown + year helper + commissions carousel
(() => {
  // Year (safe even if server already renders it)
  const yearEl = document.getElementById("year");
  if (yearEl && !yearEl.textContent.trim()) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile nav
  const toggle =
    document.querySelector("[data-nav-toggle]") ||
    document.querySelector(".nav-toggle");

  const panel =
    document.querySelector("[data-nav-panel]") ||
    document.getElementById("nav-panel");

  if (toggle && panel) {
    const openPanel = () => {
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    };

    const closePanel = () => {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    };

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      if (isOpen()) closePanel();
      else openPanel();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      closePanel();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") closePanel();
    });

    // Close after tapping a link
    panel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closePanel());
    });
  }

  // =========================
  // Commissions carousel
  // =========================
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  if (!track || !prev || !next) return;

  const slides = Array.from(track.querySelectorAll("[data-carousel-slide]"));
  if (!slides.length) return;

  let index = 0;

  const setButtons = () => {
    prev.disabled = index <= 0;
    next.disabled = index >= slides.length - 1;
    prev.style.opacity = prev.disabled ? "0.35" : "1";
    next.style.opacity = next.disabled ? "0.35" : "1";
  };

  const go = (i) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    track.style.transition = "transform 240ms ease";
    track.style.transform = `translateX(${-100 * index}%)`;
    setButtons();
  };

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  // Keyboard support when focused inside carousel
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  go(0);
})();