function getPath(filePath) {
  const path = window.location.pathname;


  if (path.includes('/page/')) {
    return '../' + filePath;
  }

  return filePath;
}

// Get current year for footer

document.getElementById('year').textContent = new Date().getFullYear();

// Navbar scroll effect

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

//  BACK TO HOME 

function goToHome() {

  const lang = typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('lang') || 'en';
  const indexPath = getPath('index.html');
  window.location.href = `${indexPath}?lang=${lang}`;
}

// Logo click

const logo = document.getElementById('logo');
if (logo) logo.addEventListener('click', goToHome);

// Navbar Home links (desktop & mobile)

document.querySelectorAll('.nav-home').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goToHome();
  });
});

// Mobile menu toggle

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mobileMenu.classList.toggle('active');
  });

  document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      menuToggle.classList.remove('open');
    });
  });
}

// LANG TRANSLATE

let currentLang = localStorage.getItem("lang");
const urlParams = new URLSearchParams(window.location.search);
const langFromUrl = urlParams.get('lang');

if (langFromUrl && (langFromUrl === 'en' || langFromUrl === 'ar')) {
  currentLang = langFromUrl;
  localStorage.setItem('lang', currentLang);
} else if (!currentLang) {
  const browserLang = navigator.language || navigator.userLanguage;
  currentLang = browserLang.startsWith("ar") ? "ar" : "en";
  localStorage.setItem("lang", currentLang);
}

if (!currentLang || (currentLang !== 'en' && currentLang !== 'ar')) {
  currentLang = 'en';
  localStorage.setItem("lang", currentLang);
}

// LANG USER

async function loadLanguage(lang) {
  try {
    const response = await fetch(getPath(`lang/${lang}.json`));
    const data = await response.json();

    document.querySelectorAll("[data-lang]").forEach((el) => {
      const key = el.getAttribute("data-lang");
      if (data[key]) el.textContent = data[key];
    });

    document.querySelectorAll("[data-lang-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-lang-placeholder");
      if (data[key]) el.placeholder = data[key];
    });

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    updateLangButtons(lang);
  } catch (error) {
    console.error("Error loading language file:", error);
  }
}

// UPDATE BUTTON

function updateLangButtons(lang) {
  const label = lang === "ar" ? "عربي" : "English";
  const btn = document.getElementById("langBtn");
  const btnMobile = document.getElementById("langBtnMobile");
  if (btn) btn.textContent = label;
  if (btnMobile) btnMobile.textContent = label;
}

// DROPDOWN

function setupLangDropdown(dropdown) {
  const btn = dropdown.querySelector(".lang-btn");
  const menu = dropdown.querySelector(".lang-menu");

  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".lang-dropdown").forEach((d) => d.classList.remove("active"));
    dropdown.classList.toggle("active");
  });

  menu.querySelectorAll("[data-lang-option]").forEach((item) => {
    item.addEventListener("click", (e) => {
      const selected = e.target.getAttribute("data-lang-option");
      localStorage.setItem("lang", selected);
      dropdown.classList.remove("active");

      currentLang = selected;

      loadLanguage(selected);
      fetchAndRenderBlogs(selected);
    });
  });
}

// CLOSE DROPDOWN

document.addEventListener("click", () => {
  document.querySelectorAll(".lang-dropdown").forEach((d) => d.classList.remove("active"));
});

document.querySelectorAll(".lang-dropdown").forEach(setupLangDropdown);

loadLanguage(currentLang);

// Reveal on scroll using IntersectionObserver

const reveals = document.querySelectorAll('.reveal');
const obsOptions = {
  root: null,
  rootMargin: "0px 0px -5% 0px",
  threshold: 0.15
};

const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, obsOptions);

reveals.forEach(el => revealObserver.observe(el));

// Scroll to top

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// * BLOG DATA & RENDER

const blogCardsContainer = document.getElementById('blogsGrid');
const blogDetailSection = document.getElementById('blogDetail');

async function fetchAndRenderBlogs(lang) {
  try {
    const res = await fetch(getPath('blog.json'));
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const blogs = await res.json();

    if (blogCardsContainer) renderBlogCards(blogs, lang);
    if (blogDetailSection) renderBlogDetails(blogs, lang);

    if (blogCardsContainer || blogDetailSection) {
      setTimeout(() => loadLanguage(lang), 150);
    }
  } catch (error) {
    console.error("Error loading blog data:", error);
    const currentLang = localStorage.getItem("lang") || "en";

    if (blogCardsContainer) {
      blogCardsContainer.innerHTML = `<p class="error-message" data-lang="blog_error_load_posts">Failed to load blog posts. Please try again later.</p>`;
    }
    if (blogDetailSection) {
      blogDetailSection.innerHTML = `<p class="error-message" data-lang="blog_error_load">Failed to load blog details. Please try again later.</p>`;
    }
    setTimeout(() => loadLanguage(currentLang), 150);
  }
}

function renderBlogCards(blogs, lang) {
  if (!blogCardsContainer || !blogs) return;
  blogCardsContainer.innerHTML = '';
  blogs.forEach(blog => {
    const title = lang === 'ar' && blog.title_ar ? blog.title_ar : blog.title_en;
    blogCardsContainer.innerHTML += `
<div class="blog-card">
<a href="./blogdetails.html?id=${blog.id}">
<img src="${getPath(blog.image)}" alt="${title}">
<h4>${title}</h4>
<p class="date">${blog.date}</p>
</a>
</div>
`;
  });
}

function renderBlogDetails(blogs, lang) {
  if (!blogDetailSection || !blogs) return;
  const params = new URLSearchParams(window.location.search);
  const blogId = parseInt(params.get('id'), 10);
  const blog = blogs.find(b => b.id === blogId);

  if (blog) {
    const currentLang = localStorage.getItem("lang") || "en";
    const title = currentLang === 'ar' && blog.title_ar ? blog.title_ar : blog.title_en;
    const content = currentLang === 'ar' && blog.content_ar ? blog.content_ar : blog.content_en;

    blogDetailSection.innerHTML = `
<div class="blog-detail-card">
    <div class="blog-image-wrapper">
      <img src="${getPath(blog.image)}" alt="${title}" class="blog-image">
    </div>

    <div class="blog-content-wrapper">
      <p class="blog-date">${blog.date}</p>
      <h2 class="blog-title">${title}</h2>
      <div class="blog-content">${content}</div>
      <a href="blog.html" class="back-btn" data-lang="blog_back">← العودة إلى المدونة</a>
    </div>
  </div>
`;
    setTimeout(() => loadLanguage(currentLang), 50);
  } else {
    const currentLang = localStorage.getItem("lang") || "en";
    blogDetailSection.innerHTML = `<p class="error-message" data-lang="blog_error_not_found">Blog post not found.</p>`;
    setTimeout(() => loadLanguage(currentLang), 50);
  }
}

// Initial fetch

fetchAndRenderBlogs(currentLang);

// DARK MOOD 

const themeToggles = document.querySelectorAll("#theme-toggle");
const currentTheme = localStorage.getItem("theme");

function updateThemeUI(isDark, btn) {
  btn.classList.toggle('active', isDark);
  btn.setAttribute('aria-pressed', String(!!isDark));
  btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

if (currentTheme === "dark") {
  document.body.classList.add("dark-mode");
}

themeToggles.forEach(btn => {
  const isDark = document.body.classList.contains('dark-mode');
  updateThemeUI(isDark, btn);
  btn.setAttribute('role', 'button');
});

const overlay = document.getElementById("theme-overlay");
const icon = overlay.querySelector(".theme-icon");

themeToggles.forEach(btn => {
  btn.addEventListener("click", () => {
    const isCurrentlyDark = document.body.classList.contains("dark-mode");

    icon.className = `theme-icon fas ${isCurrentlyDark ? 'fa-sun' : 'fa-moon'}`;

    overlay.classList.add("active");

    setTimeout(() => {
      document.body.classList.toggle("dark-mode");

      const isDarkNow = document.body.classList.contains("dark-mode");
      themeToggles.forEach(t => updateThemeUI(isDarkNow, t));
      localStorage.setItem("theme", isDarkNow ? "dark" : "light");
    }, 150);

    setTimeout(() => {
      overlay.classList.remove("active");
    }, 800);
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});
 


