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

    // Add JS API support to YouTube embeds so pause commands work
    const enableYouTubeJsApi = (iframe) => {
      try {
        const src = iframe.getAttribute("src");
        if (!src || !src.includes("youtube.com/embed/")) return;

        const url = new URL(src, window.location.origin);

        if (url.searchParams.get("enablejsapi") !== "1") {
          url.searchParams.set("enablejsapi", "1");
          iframe.src = url.toString();
        }
      } catch (err) {
        // Ignore invalid iframe URLs
      }
    };

    // Pause video / iframe media inside a single slide
    const pauseSlideMedia = (slide) => {
      if (!slide) return;

      // Pause native HTML5 videos
      slide.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
        } catch (err) {
          // Ignore pause errors
        }
      });

      // Pause embedded iframe players
      slide.querySelectorAll("iframe").forEach((iframe) => {
        const src = iframe.getAttribute("src") || "";

        try {
          // YouTube
          if (src.includes("youtube.com/embed/")) {
            iframe.contentWindow?.postMessage(
              JSON.stringify({
                event: "command",
                func: "pauseVideo",
                args: [],
              }),
              "*"
            );
          }

          // Vimeo
          if (src.includes("player.vimeo.com/video/")) {
            iframe.contentWindow?.postMessage(
              JSON.stringify({
                method: "pause",
              }),
              "*"
            );
          }
        } catch (err) {
          // Ignore messaging errors
        }
      });
    };

    // Pause all media in all slides except the active one
    const pauseInactiveSlides = (slides, activeIndex) => {
      slides.forEach((slide, i) => {
        if (i !== activeIndex) {
          pauseSlideMedia(slide);
        }
      });
    };

    // Carousel
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-carousel-track]");
      const prev = carousel.querySelector("[data-carousel-prev]");
      const next = carousel.querySelector("[data-carousel-next]");
      if (!track || !prev || !next) return;

      const slides = Array.from(track.querySelectorAll("[data-carousel-slide]"));
      if (!slides.length) return;

      // Make YouTube embeds controllable
      slides.forEach((slide) => {
        slide.querySelectorAll("iframe").forEach(enableYouTubeJsApi);
      });

      let index = 0;

      const setButtons = () => {
        prev.disabled = index <= 0;
        next.disabled = index >= slides.length - 1;
      };

      const go = (i) => {
        index = Math.max(0, Math.min(slides.length - 1, i));

        track.style.transform = `translateX(${-100 * index}%)`;
        track.style.transition = "transform 240ms ease";

        // Stop everything except the visible slide
        pauseInactiveSlides(slides, index);

        setButtons();
      };

      prev.addEventListener("click", () => go(index - 1));
      next.addEventListener("click", () => go(index + 1));

      go(0);
    });
  });
})();