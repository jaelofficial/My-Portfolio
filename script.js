// Jael Dede Amoo - Portfolio Interactive & Parallax Engine

document.addEventListener("DOMContentLoaded", () => {
  // 1. Dynamic Copyright Year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Light / Dark Theme Management
  const themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
      const label = isDark ? "Switch to light mode" : "Switch to dark mode";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
    }
  }

  const savedTheme = localStorage.getItem("portfolio-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ? savedTheme : prefersDark ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem("portfolio-theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  // 3. Mobile Hamburger Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const siteNav = document.getElementById("site-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  function toggleMobileMenu(forceClose = false) {
    if (!mobileMenuBtn || !siteNav) return;
    const shouldOpen = forceClose ? false : !mobileMenuBtn.classList.contains("is-active");

    mobileMenuBtn.classList.toggle("is-active", shouldOpen);
    siteNav.classList.toggle("mobile-open", shouldOpen);
    mobileMenuBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close mobile drawer when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleMobileMenu(true);
    });
  });

  // Close mobile drawer when tapping outside
  document.addEventListener("click", (e) => {
    if (siteNav && siteNav.classList.contains("mobile-open")) {
      if (!siteNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        toggleMobileMenu(true);
      }
    }
  });

  // 4. Parallax Scroll Physics Engine (Mobile & Desktop)
  const progressBar = document.getElementById("scroll-progress");
  const siteHeader = document.getElementById("site-header");
  const heroImage = document.getElementById("hero-portrait");
  const heroImageWrap = document.getElementById("hero-image-wrap");
  const heroSection = document.getElementById("home");
  const decoNumbers = document.querySelectorAll(".deco-number");

  function handleParallaxScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const isMobile = window.innerWidth <= 860;

    // A. Update global scroll progress bar
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // B. Header state on scroll
    if (siteHeader) {
      if (scrollTop > 24) {
        siteHeader.classList.add("scrolled");
      } else {
        siteHeader.classList.remove("scrolled");
      }
    }

    // C. Parallax scroll physics
    if (isMobile) {
      // Mobile-specific parallax variables
      if (scrollTop < window.innerHeight * 1.6) {
        const mobileHeroY = scrollTop * 0.35;
        document.documentElement.style.setProperty("--mobile-hero-y", `${mobileHeroY}px`);
      }
      const mobileDecoY = scrollTop * 0.16;
      document.documentElement.style.setProperty("--mobile-deco-y", `${mobileDecoY}px`);
    } else {
      // Desktop parallax physics
      if (heroImage && scrollTop < window.innerHeight * 1.3) {
        const heroParallax = scrollTop * 0.24;
        heroImage.style.transform = `translateY(${heroParallax}px)`;
      }

      // Parallax for watermark section numbers
      decoNumbers.forEach((deco) => {
        const section = deco.closest(".full-section");
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.14;
            deco.style.setProperty("--scroll-offset", `${offset}px`);
          }
        }
      });
    }
  }

  window.addEventListener("scroll", handleParallaxScroll, { passive: true });
  window.addEventListener("resize", handleParallaxScroll, { passive: true });
  handleParallaxScroll(); // Initial run

  // 5. Robust Section-by-Section Reveal Engine (Mobile + Desktop)
  const fullSections = document.querySelectorAll(".full-section");
  const navDots = document.querySelectorAll(".nav-dot");
  const revealElements = document.querySelectorAll(".reveal-on-scroll");

  // Hero section is always visible on arrival
  if (heroSection) {
    heroSection.classList.add("is-visible");
    const heroInner = heroSection.querySelector(".reveal-on-scroll");
    if (heroInner) heroInner.classList.add("is-visible");
  }

  // Use forgiving observer settings so mobile tall sections trigger reliably
  const isMobileInitial = window.innerWidth <= 860;
  const sectionObserverOptions = {
    root: null,
    rootMargin: isMobileInitial ? "0px 0px -40px 0px" : "-10% 0px -10% 0px",
    threshold: isMobileInitial ? 0.05 : 0.12,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        // Reveal all inner elements
        const inners = entry.target.querySelectorAll(".reveal-on-scroll, .reveal-item");
        inners.forEach((el) => el.classList.add("is-visible"));

        // Update active navigation indicators
        const currentId = entry.target.getAttribute("id");
        if (currentId) {
          // Update side/bottom dots
          navDots.forEach((dot) => {
            const dotSection = dot.getAttribute("data-section");
            if (dotSection === currentId) {
              dot.classList.add("active");
            } else {
              dot.classList.remove("active");
            }
          });

          // Update header navigation links
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (href === `#${currentId}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      }
    });
  }, sectionObserverOptions);

  fullSections.forEach((sec) => sectionObserver.observe(sec));

  // Also directly observe any standalone reveal elements
  const elementObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { rootMargin: "0px 0px -30px 0px", threshold: 0.05 }
  );

  revealElements.forEach((el) => elementObserver.observe(el));

  // Fallback: Verify elements already in initial viewport are visible
  setTimeout(() => {
    fullSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        sec.classList.add("is-visible");
        const inners = sec.querySelectorAll(".reveal-on-scroll, .reveal-item");
        inners.forEach((el) => el.classList.add("is-visible"));
      }
    });
  }, 100);

  // 6. Desktop-Only 3D Tilt Physics (Disabled on Touch Devices for Performance)
  const tiltCards = document.querySelectorAll(".tilt-card");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((cardY - centerY) / centerY) * -5.5;
        const rotateY = ((cardX - centerX) / centerX) * 5.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      });
    });

    // Hero Mouse Parallax (Desktop)
    const heroWrap = document.querySelector(".hero-section");
    if (heroWrap) {
      heroWrap.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (clientY / window.innerHeight - 0.5) * 2;

        const orb1 = document.querySelector(".orb-1");
        const orb2 = document.querySelector(".orb-2");
        if (orb1) orb1.style.transform = `translate(${xPercent * 16}px, ${yPercent * 16}px)`;
        if (orb2) orb2.style.transform = `translate(${xPercent * -18}px, ${yPercent * -18}px)`;

        if (heroImage) {
          heroImage.style.transform = `translate(${xPercent * -10}px, ${yPercent * -8}px)`;
        }
      });

      heroWrap.addEventListener("mouseleave", () => {
        if (heroImage) heroImage.style.transform = "translate(0, 0)";
      });
    }
  }

  // 7. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // 8. Floating Social FAB Menu Toggle
  const socialFab = document.getElementById("social-fab");
  const floatingSocials = document.getElementById("floating-socials");

  if (socialFab && floatingSocials) {
    socialFab.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = floatingSocials.classList.toggle("is-open");
      socialFab.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close social FAB when clicking outside
    document.addEventListener("click", (e) => {
      if (floatingSocials.classList.contains("is-open")) {
        if (!floatingSocials.contains(e.target)) {
          floatingSocials.classList.remove("is-open");
          socialFab.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  // 9. Interactive Certificates Carousel Engine
  function initCertCarousel() {
    const viewport = document.getElementById("cert-carousel-viewport");
    const track = document.getElementById("cert-carousel-track");
    const allSlides = Array.from(document.querySelectorAll(".cert-slide"));
    const prevBtn = document.getElementById("cert-carousel-prev");
    const nextBtn = document.getElementById("cert-carousel-next");
    const playBtn = document.getElementById("cert-carousel-play");
    const currentCounter = document.getElementById("carousel-current");
    const totalCounter = document.getElementById("carousel-total");
    const dotsContainer = document.getElementById("cert-carousel-dots");
    const filterBtns = document.querySelectorAll(".cert-filter-btn");

    if (!viewport || !track || allSlides.length === 0) return;

    let activeFilter = "all";
    let visibleSlides = [...allSlides];
    let currentIndex = 0;
    let isPlaying = true;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 5000;

    function padZero(num) {
      return String(num).padStart(2, "0");
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      visibleSlides.forEach((slide, idx) => {
        const dot = document.createElement("button");
        dot.className = `carousel-dot${idx === currentIndex ? " is-active" : ""}`;
        dot.type = "button";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Go to certificate slide ${idx + 1}`);
        dot.addEventListener("click", () => {
          goToSlide(idx);
          restartAutoplay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateSlidePosition(smooth = true) {
      if (visibleSlides.length === 0) return;
      if (!smooth) {
        track.style.transition = "none";
      } else {
        track.style.transition = "transform 0.55s cubic-bezier(0.2, 0.9, 0.3, 1)";
      }

      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update active class on slides
      allSlides.forEach((s) => s.classList.remove("is-active"));
      if (visibleSlides[currentIndex]) {
        visibleSlides[currentIndex].classList.add("is-active");
      }

      // Update counter
      if (currentCounter) currentCounter.textContent = padZero(currentIndex + 1);
      if (totalCounter) totalCounter.textContent = padZero(visibleSlides.length);

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((dot, idx) => {
          dot.classList.toggle("is-active", idx === currentIndex);
          dot.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
        });
      }
    }

    function goToSlide(newIndex, smooth = true) {
      if (visibleSlides.length === 0) return;
      if (newIndex < 0) {
        currentIndex = visibleSlides.length - 1;
      } else if (newIndex >= visibleSlides.length) {
        currentIndex = 0;
      } else {
        currentIndex = newIndex;
      }
      updateSlidePosition(smooth);
    }

    function applyFilter(category) {
      activeFilter = category;
      visibleSlides = [];

      allSlides.forEach((slide) => {
        const slideCat = slide.getAttribute("data-category");
        if (category === "all" || slideCat === category) {
          slide.classList.remove("is-filtered-out");
          visibleSlides.push(slide);
        } else {
          slide.classList.add("is-filtered-out");
        }
      });

      filterBtns.forEach((btn) => {
        const isSelected = btn.getAttribute("data-filter") === category;
        btn.classList.toggle("is-active", isSelected);
      });

      currentIndex = 0;
      buildDots();
      updateSlidePosition(false);
      restartAutoplay();
    }

    // Filter Button Clicks
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-filter");
        if (cat) applyFilter(cat);
      });
    });

    // Arrow Nav Clicks
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentIndex - 1);
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentIndex + 1);
        restartAutoplay();
      });
    }

    // Autoplay Controls
    function startAutoplay() {
      clearInterval(autoplayTimer);
      if (!isPlaying || visibleSlides.length <= 1) return;
      autoplayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isPlaying = !isPlaying;
        playBtn.classList.toggle("is-playing", isPlaying);
        playBtn.setAttribute("aria-label", isPlaying ? "Pause autoplay" : "Start autoplay");
        playBtn.setAttribute("title", isPlaying ? "Pause autoplay" : "Start autoplay");
        if (isPlaying) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      });
    }

    // Pause on Hover
    viewport.addEventListener("mouseenter", () => {
      if (isPlaying) stopAutoplay();
    });

    viewport.addEventListener("mouseleave", () => {
      if (isPlaying) startAutoplay();
    });

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    viewport.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        isSwiping = true;
        stopAutoplay();
      }
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (isSwiping && e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewport.addEventListener("touchend", () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Ensure horizontal swipe is dominant and above threshold
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
      if (isPlaying) startAutoplay();
    }, { passive: true });

    // Keyboard Arrow Navigation
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(currentIndex - 1);
        restartAutoplay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(currentIndex + 1);
        restartAutoplay();
      }
    });

    // Initial setup
    buildDots();
    updateSlidePosition(false);
    startAutoplay();

    // Export helpers for Lightbox sync
    window._certCarousel = {
      getCurrentSlide: () => visibleSlides[currentIndex],
      getVisibleSlides: () => visibleSlides,
      goToIndex: (idx) => goToSlide(idx),
      getCurrentIndex: () => currentIndex,
    };
  }

  // 10. Certificate Lightbox Modal Engine
  function initCertLightbox() {
    const lightbox = document.getElementById("cert-lightbox");
    if (!lightbox) return;

    const overlay = document.getElementById("lightbox-overlay");
    const closeBtn = document.getElementById("lightbox-close-btn");
    const prevBtn = document.getElementById("lightbox-prev-btn");
    const nextBtn = document.getElementById("lightbox-next-btn");
    const img = document.getElementById("lightbox-img");
    const spinner = document.getElementById("lightbox-spinner");
    const title = document.getElementById("lightbox-title");
    const desc = document.getElementById("lightbox-desc");
    const badge = document.getElementById("lightbox-badge");
    const subBadge = document.getElementById("lightbox-sub-badge");
    const issuer = document.getElementById("lightbox-issuer");
    const date = document.getElementById("lightbox-date");
    const idCode = document.getElementById("lightbox-id");
    const fullLink = document.getElementById("lightbox-full-link");

    let currentLightboxIdx = 0;

    function openModalWithSlide(slide) {
      if (!slide) return;

      const visibleList = window._certCarousel ? window._certCarousel.getVisibleSlides() : Array.from(document.querySelectorAll(".cert-slide:not(.is-filtered-out)"));
      currentLightboxIdx = visibleList.indexOf(slide);
      if (currentLightboxIdx < 0) currentLightboxIdx = 0;

      populateModal(slide);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function populateModal(slide) {
      if (!slide) return;

      const fullSrc = slide.getAttribute("data-full") || "";
      const slideTitle = slide.getAttribute("data-title") || "Certificate";
      const slideIssuer = slide.getAttribute("data-issuer") || "(ISC)²";
      const slideBadge = slide.getAttribute("data-badge") || "Certified";
      const slideSubBadge = slide.getAttribute("data-subbadge") || "Accredited";
      const slideDate = slide.getAttribute("data-date") || "2026";
      const slideId = slide.getAttribute("data-id") || "";
      const slideDesc = slide.getAttribute("data-desc") || "";

      if (title) title.textContent = slideTitle;
      if (desc) desc.textContent = slideDesc;
      if (badge) badge.textContent = slideBadge;
      if (subBadge) subBadge.textContent = slideSubBadge;
      if (issuer) issuer.textContent = slideIssuer;
      if (date) date.textContent = slideDate;
      if (idCode) idCode.textContent = slideId;
      if (fullLink) fullLink.href = fullSrc;

      if (img) {
        if (spinner) spinner.classList.add("is-loading");
        img.style.opacity = "0";

        const temp = new Image();
        temp.onload = () => {
          img.src = fullSrc;
          img.alt = slideTitle;
          img.style.opacity = "1";
          if (spinner) spinner.classList.remove("is-loading");
        };
        temp.onerror = () => {
          img.src = fullSrc;
          img.alt = slideTitle;
          img.style.opacity = "1";
          if (spinner) spinner.classList.remove("is-loading");
        };
        temp.src = fullSrc;
      }
    }

    function closeModal() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (img) img.src = "";
    }

    function lightboxNavigate(step) {
      const visibleList = window._certCarousel ? window._certCarousel.getVisibleSlides() : Array.from(document.querySelectorAll(".cert-slide:not(.is-filtered-out)"));
      if (visibleList.length === 0) return;
      currentLightboxIdx = (currentLightboxIdx + step + visibleList.length) % visibleList.length;
      const targetSlide = visibleList[currentLightboxIdx];
      populateModal(targetSlide);
      if (window._certCarousel && window._certCarousel.goToIndex) {
        window._certCarousel.goToIndex(currentLightboxIdx);
      }
    }

    // Attach open handlers to all triggers
    document.querySelectorAll(".cert-open-trigger, .cert-open-btn").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const slide = trigger.closest(".cert-slide");
        if (slide) openModalWithSlide(slide);
      });
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const slide = trigger.closest(".cert-slide");
          if (slide) openModalWithSlide(slide);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    if (prevBtn) prevBtn.addEventListener("click", () => lightboxNavigate(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => lightboxNavigate(1));

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowLeft") lightboxNavigate(-1);
      else if (e.key === "ArrowRight") lightboxNavigate(1);
    });
  }

  // Initialize Certificate Systems
  initCertCarousel();
  initCertLightbox();
});
