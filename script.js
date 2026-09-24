/* ============================================================
   MEKKE'NİN TARİHÎ ÖNEMİ — Araştırma Sitesi Betiği
   Sade görevler: mobil menü, smooth scroll, aktif menü bağlantısı
   ve isteğe bağlı hafif ortaya çıkma animasyonu.
   Sunum/slayt mantığı yoktur.
   ============================================================ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1) MOBİL MENÜ AÇ / KAPA
     ------------------------------------------------------------ */
  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* Menü bağlantısına tıklanınca menüyü kapat (mobil) */
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* Menü dışına tıklanınca kapat */
  document.addEventListener("click", function (event) {
    if (!navMenu || !navToggle) return;
    if (!navMenu.classList.contains("is-open")) return;
    if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  /* Escape ile kapat */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  /* ------------------------------------------------------------
     2) AKTİF MENÜ BAĞLANTISI
     Menüdeki bölümleri izleyip görünür olanı vurgular.
     ------------------------------------------------------------ */
  var watchIds = navLinks
    .map(function (link) {
      var hash = link.getAttribute("href") || "";
      return hash.charAt(0) === "#" ? hash.slice(1) : "";
    })
    .filter(Boolean);

  var watchSections = watchIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var matches = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", matches);
      if (matches) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ------------------------------------------------------------
     3) HAFİF ORTAYA ÇIKMA ANİMASYONU (isteğe bağlı)
     Gerekli sınıflar çalışma anında eklenir; böylece JS
     yüklenmezse içerik her zaman görünür kalır.
     ------------------------------------------------------------ */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var selectors = [
      ".section__title",
      ".section__eyebrow",
      ".lead",
      ".article-block",
      ".figure",
      ".feature-card",
      ".toc li",
      ".bibliography li"
    ];

    var revealTargets = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        revealTargets.push(el);
      });
    });

    if (!revealTargets.length) return;

    docEl.classList.add("has-reveal");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------
     4) AKTİF BÖLÜM İZLEYİCİSİ
     ------------------------------------------------------------ */
  if (watchSections.length && "IntersectionObserver" in window) {
    var activeObserver = new IntersectionObserver(
      function (entries) {
        // Görünür alanda en çok yer kaplayan bölümü seç
        var best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (best) setActiveLink(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    watchSections.forEach(function (section) {
      activeObserver.observe(section);
    });
  } else {
    setActiveLink(watchIds[0]);
  }

  /* ------------------------------------------------------------
     5) BAŞLAT
     ------------------------------------------------------------ */
  initReveal();
})();