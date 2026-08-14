const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const year = document.getElementById("year");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".section, .project-card, .skill-card").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(18px)";
  el.style.transition = "opacity .55s ease, transform .55s ease";
  observer.observe(el);
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".visible").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
});

const styleObserver = new MutationObserver(() => {
  document.querySelectorAll(".visible").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
});
styleObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
