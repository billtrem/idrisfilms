// Idris Films — nav + mobile accordions + testimonial carousel + video modal
(() => {
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => {
    document.documentElement.classList.add("js");

    // ------------------------------------------------------------
    // Fit one-line headings to their container width
    // ------------------------------------------------------------
    const fitLineText = () => {
      document.querySelectorAll("[data-fit-line]").forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;

        const maxSize = Number(el.dataset.fitMax || 104);
        const minSize = Number(el.dataset.fitMin || 10);

        el.style.whiteSpace = "nowrap";
        el.style.fontSize = `${maxSize}px`;

        const parentWidth = parent.clientWidth;
        const textWidth = el.scrollWidth;

        if (!parentWidth || !textWidth) return;

        const nextSize = Math.max(
          minSize,
          Math.min(maxSize, maxSize * (parentWidth / textWidth))
        );

        el.style.fontSize = `${nextSize}px`;
      });
    };

    fitLineText();
    window.addEventListener("resize", fitLineText);

    // ------------------------------------------------------------
    // Mobile nav
    // Safe to keep even if the one-page site has no nav.
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // Mobile accordions
    // Phone only in CSS. Desktop keeps all content visible.
    // Each accordion toggles independently so the page does not jump.
    // ------------------------------------------------------------
    const mobileAccordions = Array.from(document.querySelectorAll("[data-mobile-accordion]"));

    const closeAccordion = (accordion) => {
      const button = accordion.querySelector("[data-mobile-accordion-toggle]");
      accordion.classList.remove("is-open");
      if (button) button.setAttribute("aria-expanded", "false");
    };

    const openAccordion = (accordion) => {
      const button = accordion.querySelector("[data-mobile-accordion-toggle]");
      accordion.classList.add("is-open");
      if (button) button.setAttribute("aria-expanded", "true");
    };

    mobileAccordions.forEach((accordion) => {
      const button = accordion.querySelector("[data-mobile-accordion-toggle]");
      if (!button) return;

      closeAccordion(accordion);

      button.addEventListener("click", () => {
        const isOpen = accordion.classList.contains("is-open");

        if (isOpen) {
          closeAccordion(accordion);
        } else {
          openAccordion(accordion);
        }
      });
    });

    // ------------------------------------------------------------
    // Helpers for embedded videos
    // ------------------------------------------------------------
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

    const pauseIframe = (iframe) => {
      const src = iframe.getAttribute("src") || "";

      try {
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

        if (src.includes("player.vimeo.com/video/")) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              method: "pause",
            }),
            "*"
          );
        }
      } catch (err) {
        // Ignore iframe messaging errors
      }
    };

    const pauseSlideMedia = (slide) => {
      if (!slide) return;

      slide.querySelectorAll("video").forEach((video) => {
        try {
          video.pause();
        } catch (err) {
          // Ignore pause errors
        }
      });

      slide.querySelectorAll("iframe").forEach(pauseIframe);
    };

    const pauseInactiveSlides = (slides, activeIndex) => {
      slides.forEach((slide, i) => {
        if (i !== activeIndex) pauseSlideMedia(slide);
      });
    };

    // ------------------------------------------------------------
    // Testimonial carousel — infinite loop
    // ------------------------------------------------------------
    document.querySelectorAll("[data-testimonial-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-testimonial-track]");
      const prev = carousel.querySelector("[data-testimonial-prev]");
      const next = carousel.querySelector("[data-testimonial-next]");
      const slides = Array.from(carousel.querySelectorAll("[data-testimonial-slide]"));

      if (!track || !prev || !next || !slides.length) return;

      slides.forEach((slide) => {
        slide.querySelectorAll("iframe").forEach(enableYouTubeJsApi);
      });

      let index = 0;

      const go = (nextIndex) => {
        if (nextIndex < 0) {
          index = slides.length - 1;
        } else if (nextIndex >= slides.length) {
          index = 0;
        } else {
          index = nextIndex;
        }

        track.style.transform = `translateX(${-100 * index}%)`;
        track.style.transition = "transform 240ms ease";

        pauseInactiveSlides(slides, index);
      };

      prev.addEventListener("click", () => {
        go(index - 1);
      });

      next.addEventListener("click", () => {
        go(index + 1);
      });

      go(0);
    });

    // ------------------------------------------------------------
    // Video modal
    // Safe to keep even if most videos are now embedded directly.
    // ------------------------------------------------------------
    const modal = document.querySelector("[data-video-modal]");
    const modalIframe = document.querySelector("[data-modal-iframe]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const closeEls = document.querySelectorAll("[data-modal-close]");
    const openEls = document.querySelectorAll("[data-modal-open]");

    if (modal && modalIframe && modalTitle && openEls.length) {
      let lastFocusedElement = null;

      const getAutoplayUrl = (videoUrl) => {
        try {
          const url = new URL(videoUrl, window.location.origin);

          if (url.hostname.includes("youtube.com")) {
            url.searchParams.set("autoplay", "1");
            url.searchParams.set("enablejsapi", "1");
            url.searchParams.set("rel", "0");
          }

          if (url.hostname.includes("vimeo.com")) {
            url.searchParams.set("autoplay", "1");
          }

          return url.toString();
        } catch (err) {
          return videoUrl.includes("?")
            ? `${videoUrl}&autoplay=1`
            : `${videoUrl}?autoplay=1`;
        }
      };

      const openModal = ({ videoUrl, videoTitle }) => {
        if (!videoUrl) return;

        lastFocusedElement = document.activeElement;

        modalTitle.textContent = videoTitle || "Video";
        modalIframe.title = videoTitle || "Video";
        modalIframe.src = getAutoplayUrl(videoUrl);

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        const closeButton = modal.querySelector("[data-modal-close]");
        if (closeButton) closeButton.focus();
      };

      const closeModal = () => {
        modal.hidden = true;

        modalIframe.src = "";
        modalIframe.title = "";
        modalTitle.textContent = "Video";

        document.body.style.overflow = "";

        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
          lastFocusedElement.focus();
        }
      };

      openEls.forEach((el) => {
        el.addEventListener("click", () => {
          openModal({
            videoUrl: el.dataset.videoUrl,
            videoTitle: el.dataset.videoTitle,
          });
        });
      });

      closeEls.forEach((el) => {
        el.addEventListener("click", closeModal);
      });

      document.addEventListener("keydown", (event) => {
        if (modal.hidden) return;

        if (event.key === "Escape") {
          closeModal();
        }
      });
    }
  });
})();