// Idris Films — mobile nav + carousel
(() => {
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => {
    // Mobile nav
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");

    if (toggle && panel) {
      const open = () => {
        toggle.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        panel.setAttribute("data-open", "true");
      };

      const close = () => {
        toggle.setAttribute("aria-expanded", "false");
        panel.removeAttribute("data-open");
        panel.hidden = true;
      };

      const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        isOpen() ? close() : open();
      });

      document.addEventListener("click", (e) => {
        if (!isOpen()) return;
        if (panel.contains(e.target) || toggle.contains(e.target)) return;
        close();
      });

      document.addEventListener("keydown", (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") close();
      });

      panel.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => close());
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 980 && isOpen()) close();
      });
    }

    // Carousel
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
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
      };

      const go = (i) => {
        index = Math.max(0, Math.min(slides.length - 1, i));
        track.style.transform = `translateX(${-100 * index}%)`;
        track.style.transition = "transform 240ms ease";
        setButtons();
      };

      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));

      go(0);
    });
  });
})();