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


  // 4b. Quick Scroll Up Button
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  function updateScrollTopButton() {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", updateScrollTopButton, { passive: true });
  updateScrollTopButton();

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
});
