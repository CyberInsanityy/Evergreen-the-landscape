(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  function setNav(open) {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle?.addEventListener("click", () => setNav(!navMenu.classList.contains("is-open")));
  navLinks.forEach((a) => a.addEventListener("click", () => setNav(false)));

  document.addEventListener("click", (e) => {
    if (!navMenu || !navToggle) return;
    const target = e.target;
    const clickedInside = navMenu.contains(target) || navToggle.contains(target);
    if (!clickedInside) setNav(false);
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });

  // Active nav link on scroll
  const sectionIds = ["services", "work", "pricing", "areas", "faq", "contact"];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const linkById = new Map(sectionIds.map((id) => [id, document.querySelector(`.nav-link[href="#${id}"]`)]));

  function setActive(id) {
    navLinks.forEach((l) => l.classList.remove("is-active"));
    const link = linkById.get(id);
    if (link) link.classList.add("is-active");
  }

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!prefersReduced && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-visible");
          obs.unobserve(en.target);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Services tabs (copy + image)
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const tabTitle = document.querySelector("[data-tab-title]");
  const tabCopy = document.querySelector("[data-tab-copy]");
  const tabList = document.querySelector("[data-tab-list]");
  const tabImg = document.querySelector("[data-tab-image]");

  const tabData = {
    mow: {
      title: "Mow + Edge",
      copy: "Premium mowing with crisp edging and a clean blow-off—built for curb appeal.",
      bullets: [
        "Even mow height + clean passes",
        "Edging on sidewalks/driveways/curbs",
        "Trim pass around obstacles",
        "Final blow-off (clean exit)",
      ],
      img: "https://images.unsplash.com/photo-1590820292118-e256c3ac2676?auto=format&fit=crop&fm=jpg&q=80&w=2400",
      alt: "Push mower on freshly cut grass",
    },
    trim: {
      title: "Trim + Detail",
      copy: "Fence lines, corners, obstacles—trimmed clean and finished sharp.",
      bullets: [
        "String trimming for precision",
        "Fence lines & tight spots",
        "Clean corners & perimeter pass",
        "Blow-off + final detail check",
      ],
      img: "https://images.unsplash.com/photo-1689728318937-17d24bc0a65c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
      alt: "Worker edging grass with string trimmer",
    },
    cleanup: {
      title: "Cleanups",
      copy: "Spring/fall cleanups that reset the yard: leaves, debris, edges, and haul-away.",
      bullets: [
        "Leaf pickup + debris removal",
        "Walk/driveway clearing",
        "Haul-away included (scope-based)",
        "Optional add-ons per request",
      ],
      img: "https://images.unsplash.com/photo-1754817644065-79c428e8065d?auto=format&fit=crop&fm=jpg&q=80&w=2400",
      alt: "Worker using a leaf blower for yard cleanup",
    },
    seasonal: {
      title: "Seasonal Reset",
      copy: "One-time visits for events or listing prep: reset cut, edge refresh, detail finish.",
      bullets: [
        "Detail mow + edge reset",
        "Heavy trim pass",
        "Cleanup + blow-off",
        "Schedule in advance for best times",
      ],
      img: "https://images.unsplash.com/photo-1690068023694-053da714f95f?auto=format&fit=crop&fm=jpg&q=80&w=2400",
      alt: "Close-up mower cutting grass",
    },
  };

  function renderTab(key) {
    const data = tabData[key];
    if (!data) return;

    tabButtons.forEach((b) => {
      const active = b.dataset.tab === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });

    if (tabTitle) tabTitle.textContent = data.title;
    if (tabCopy) tabCopy.textContent = data.copy;

    if (tabList) {
      tabList.innerHTML = "";
      data.bullets.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        tabList.appendChild(li);
      });
    }

    if (tabImg) {
      tabImg.setAttribute("src", data.img);
      tabImg.setAttribute("alt", data.alt);
    }
  }

  tabButtons.forEach((btn) => btn.addEventListener("click", () => renderTab(btn.dataset.tab)));

  // Testimonials slider
  const track = document.getElementById("testimonialTrack");
  const slides = Array.from(track?.querySelectorAll(".testimonial") || []);
  const prevBtn = document.getElementById("testPrev");
  const nextBtn = document.getElementById("testNext");
  const dotBtns = Array.from(document.querySelectorAll(".dot-btn"));

  let idx = 0;
  let timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) return;
    idx = (nextIndex + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    dotBtns.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  prevBtn?.addEventListener("click", () => showSlide(idx - 1));
  nextBtn?.addEventListener("click", () => showSlide(idx + 1));
  dotBtns.forEach((d) => d.addEventListener("click", () => showSlide(Number(d.dataset.index))));

  function startAuto() {
    if (prefersReduced) return;
    stopAuto();
    timer = window.setInterval(() => showSlide(idx + 1), 5500);
  }
  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  track?.addEventListener("mouseenter", stopAuto);
  track?.addEventListener("mouseleave", startAuto);
  startAuto();

  // FAQ accordion
  const faqButtons = Array.from(document.querySelectorAll(".faq-q"));
  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const item = btn.closest(".faq-item");
      const answer = item?.querySelector(".faq-a");
      const icon = btn.querySelector(".faq-icon");

      faqButtons.forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const otherItem = other.closest(".faq-item");
        const otherAnswer = otherItem?.querySelector(".faq-a");
        const otherIcon = other.querySelector(".faq-icon");
        if (otherAnswer) otherAnswer.hidden = true;
        if (otherIcon) otherIcon.textContent = "+";
      });

      btn.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.hidden = expanded;
      if (icon) icon.textContent = expanded ? "+" : "−";
    });
  });

  // Back to top
  const backToTop = document.getElementById("backToTop");
  const onScroll = () => {
    const show = window.scrollY > 600;
    backToTop?.classList.toggle("is-visible", show);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });
})();