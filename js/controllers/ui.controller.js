/**
 * Cliniva — UI Controller
 * SOLID: Single Responsibility for Global UI Interactions, Navbar & Toasts
 */

import { navbarService } from "../services/navbar.service.js";

export class UIController {
  constructor() {
    this.navbar = document.getElementById("navbar");
    this.mobileToggle = document.getElementById("mobileToggle");
    this.toastContainer = this.getOrCreateToastContainer();
  }

  init() {
    this.setupNavbarScroll();
    this.setupMobileMenu();
    this.setupTabNavigation();
    navbarService.sync();
  }

  setupNavbarScroll() {
    if (!this.navbar) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        this.navbar.classList.add("scrolled");
      } else {
        this.navbar.classList.remove("scrolled");
      }
    });
  }

  setupMobileMenu() {
    if (!this.mobileToggle) return;

    // Create drawer DOM if not present
    let drawer = document.querySelector(".mobile-nav-drawer");
    let backdrop = document.querySelector(".drawer-backdrop");

    if (!drawer) {
      backdrop = document.createElement("div");
      backdrop.className = "drawer-backdrop";
      document.body.appendChild(backdrop);

      drawer = document.createElement("aside");
      drawer.className = "mobile-nav-drawer";
      drawer.innerHTML = `
        <div class="drawer-head">
          <div class="logo"><span class="logo-mark">✦</span> Cliniva</div>
          <button class="btn btn-sm btn-soft close-drawer" style="padding:4px 10px;">✕</button>
        </div>
        <div class="drawer-links">
          <a href="#features">Features</a>
          <a href="#app">Katalog Layanan</a>
          <a href="#markets">Cabang &amp; Regional</a>
          <a href="demo.html">Demo</a>
          <hr style="border:0;border-top:1px solid var(--line);margin:12px 0;">
          <div class="drawer-auth-slot">
            ${navbarService.getMobileDrawerAuthLinks()}
          </div>
        </div>
      `;
      document.body.appendChild(drawer);

      const closeBtn = drawer.querySelector(".close-drawer");
      const close = () => {
        drawer.classList.remove("open");
        backdrop.classList.remove("active");
      };

      closeBtn.addEventListener("click", close);
      backdrop.addEventListener("click", close);
      drawer.querySelectorAll(".drawer-links a").forEach((link) => {
        link.addEventListener("click", close);
      });
    }

    this.mobileToggle.addEventListener("click", () => {
      drawer.classList.toggle("open");
      backdrop.classList.toggle("active");
    });
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const screens = document.querySelectorAll(".screen");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tab;

        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        screens.forEach((screen) => {
          screen.classList.remove("active");
          if (screen.id === target) {
            screen.classList.add("active");
          }
        });
      });
    });
  }

  getOrCreateToastContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  showToast(message, icon = "ℹ️", duration = 3500) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}
