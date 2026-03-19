(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Change once → all CTAs update
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdmXHlMex9SUUpQITVMjZeb9j-Y8ChOg0WTPqafue_t11FhrQ/viewform";

  const tabData = {
    mow: {
      title: "Mow + Edge",
      copy: "Premium mowing with crisp edging and a clean blow-off—built for curb appeal.",
      bullets: [
        "Even mow height + clean passes",
        "Edges on sidewalks/driveways/curbs",
        "Trim around obstacles",
        "Final blow-off (clean exit)"
      ],
      img: "https://cdn.jsdelivr.net/gh/CyberInsanityy/Evergeeeen2@main/assets/IMG_0022.jpeg",
      alt: "Mowing service"
    },
    trim: {
      title: "Trim + Detail",
      copy: "Fence lines, corners, obstacles—trimmed clean and finished sharp.",
      bullets: [
        "Precision trimming around obstacles",
        "Tight corners + perimeter detail",
        "Hard lines cleaned up",
        "Final blow-off + finish check"
      ],
      img: "https://cdn.jsdelivr.net/gh/CyberInsanityy/Evergeeeen2@main/assets/IMG_0023.jpeg",
      alt: "Detail trimming"
    },
    cleanup: {
      title: "Cleanups",
      copy: "Seasonal resets: debris, leaves, and a finished look—fast and thorough.",
      bullets: [
        "Debris pickup + tidy reset",
        "Drive/walk clearing",
        "Edge refresh available",
        "Haul-away scope-based"
      ],
      img: "https://cdn.jsdelivr.net/gh/CyberInsanityy/Evergeeeen2@main/assets/IMG_0024.jpeg",
      alt: "Cleanup work"
    }
  };

  function buildFormUrl(plan) {
    if (!plan) return FORM_URL;
    const joiner = FORM_URL.includes("?") ? "&" : "?";
    return `${FORM_URL}${joiner}plan=${encodeURIComponent(plan)}`;
  }

  document.querySelectorAll(".js-form-link").forEach((a) => {
    const plan = a.getAttribute("data-plan");
    a.href = buildFormUrl(plan);
    a.target = "_blank";
    a.rel = "noopener";
  });

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
  }
  navToggle?.addEventListener("click", () => setNav(!navMenu.classList.contains("is-open")));
  navLinks.forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!navMenu || !navToggle) return;
    if (!navMenu.contains(t) && !navToggle.contains(t)) setNav(false);
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

  // Active link + reveal
  const sectionIds = ["services", "pricing", "reviews", "faq", "contact"];
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
        const visible = entries.filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));

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
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Tabs
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const tabTitle = document.querySelector("[data-tab-title]");
  const tabCopy = document.querySelector("[data-tab-copy]");
  const tabList = document.querySelector("[data-tab-list]");
  const tabImg = document.querySelector("[data-tab-image]");

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
      tabImg.src = data.img;
      tabImg.alt = data.alt;
    }
  }

  tabButtons.forEach((btn) => btn.addEventListener("click", () => renderTab(btn.dataset.tab)));

  // Testimonials
  const track = document.getElementById("testimonialTrack");
  const slides = Array.from(track?.querySelectorAll(".testimonial") || []);
  const prevBtn = document.getElementById("testPrev");
  const nextBtn = document.getElementById("testNext");
  const dots = Array.from(document.querySelectorAll(".dot-btn"));
  let idx = 0;
  let timer = null;

  function show(i) {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === idx));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === idx));
  }
  prevBtn?.addEventListener("click", () => show(idx - 1));
  nextBtn?.addEventListener("click", () => show(idx + 1));
  dots.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.index))));

  function startAuto() {
    if (prefersReduced) return;
    stopAuto();
    timer = window.setInterval(() => show(idx + 1), 5500);
  }
  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }
  track?.addEventListener("mouseenter", stopAuto);
  track?.addEventListener("mouseleave", startAuto);
  startAuto();

  // FAQ
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const item = btn.closest(".faq-item");
      const answer = item?.querySelector(".faq-a");
      const icon = btn.querySelector(".faq-icon");

      document.querySelectorAll(".faq-q").forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const otherAnswer = other.closest(".faq-item")?.querySelector(".faq-a");
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
  const onScroll = () => backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));
})();
