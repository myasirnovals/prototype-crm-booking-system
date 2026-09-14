/**
 * Router — SPA router sederhana untuk area Client Portal.
 *
 * Fitur:
 * - Menampilkan/menyembunyikan section `.view-section` berdasarkan viewId
 * - Menjaga active state pada nav link (desktop & mobile)
 * - Guest preview mode (program invite link tanpa login)
 * - Route protection: view yang butuh login akan redirect ke login.html
 * - Pemicu render per view (callback registry) yang didaftarkan Controller
 *
 * SRS acuan: FR-AUTH-09 (proteksi route), FR-PROG-06 (preview terbatas), NFR-05 (usability).
 */
export class Router {
  constructor() {
    this.currentView = null;
    this.previousView = null;
    this.isGuestPreview = false;
    this.guestProgramId = null;
    this._renderers = new Map(); // viewId -> () => void
    this._protectedViews = new Set(); // viewId yang butuh login
  }

  /**
   * Daftarkan callback renderer untuk sebuah view.
   * @param {string} viewId
   * @param {Function} renderer
   */
  register(viewId, renderer) {
    this._renderers.set(viewId, renderer);
  }

  /**
   * Tandai view sebagai protected (butuh login).
   * @param {string} viewId
   */
  protect(viewId) {
    this._protectedViews.add(viewId);
  }

  /**
   * Inisialisasi router — baca guest preview & daftarkan renderers default.
   */
  init() {
    this.detectGuestPreview();
    return this;
  }

  /** Alias dari go() — API nyaman untuk Controller & inline onclick. */
  navigate(viewId) {
    return this.go(viewId);
  }

  /** Kembalikan viewId sebelumnya (untuk tombol back di Help/Privacy). */
  getPreviousView() {
    return this.previousView;
  }

  /**
   * Baca mode guest preview dari URL (?preview=true&programId=xxx&client=xxx).
   */
  detectGuestPreview() {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview') === 'true';
    const programId = params.get('programId');
    const client = params.get('client') || 'Guest User';
    if (preview && (programId || client)) {
      this.isGuestPreview = true;
      this.guestProgramId = programId;
      localStorage.setItem('nutriflow_client_logged_name', client);
      return true;
    }
    this.isGuestPreview = false;
    this.guestProgramId = null;
    return false;
  }

  /**
   * Navigasi ke sebuah view.
   * @param {string} viewId
   */
  go(viewId) {
    if (this.isGuestPreview && viewId !== 'meal-plans') {
      // Guest hanya bisa melihat preview program.
      const openModal = window.openRegistrationModal;
      if (typeof openModal === 'function') openModal();
      return;
    }

    if (this._protectedViews.has(viewId) && !this._isLoggedIn()) {
      window.location.href = './login.html';
      return;
    }

    if (this.currentView && this.currentView !== viewId) {
      this.previousView = this.currentView;
    }
    this.currentView = viewId;

    // Sembunyikan semua view section
    document.querySelectorAll('.view-section').forEach((sec) => sec.classList.add('hidden'));
    const activeSec = document.getElementById(`view-${viewId}`);
    if (activeSec) activeSec.classList.remove('hidden');

    // Update nav link active state (desktop)
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.className = 'nav-link h-full flex items-center text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors px-3 cursor-pointer';
    });
    const activeLink = document.getElementById(`link-${viewId}`);
    if (activeLink) {
      activeLink.className = 'nav-link h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md px-3 cursor-pointer';
    }

    // Update mobile nav active state
    document.querySelectorAll('.mobile-nav-link').forEach((link) => link.classList.remove('active'));
    const mobileLink = document.getElementById(`mobile-link-${viewId}`);
    if (mobileLink) mobileLink.classList.add('active');

    // Toggle navbar avatar & logout per view
    this._syncNavbarUi(viewId);

    // Jalankan renderer
    const renderer = this._renderers.get(viewId);
    if (renderer) {
      try {
        renderer();
      } catch (err) {
        console.error(`[Router] renderer gagal untuk "${viewId}":`, err);
      }
    }

    // Layout khusus untuk chat (fullscreen) & book-wizard
    this._applyViewLayout(viewId);

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /** Kembali ke view sebelumnya atau home. */
  back() {
    if (this.previousView) {
      this.go(this.previousView);
    } else {
      this.go('dashboard');
    }
  }

  /** Kembali ke home (dipakai dari halaman bantuan/privacy). */
  home() {
    this.go('dashboard');
  }

  _isLoggedIn() {
    return localStorage.getItem('nutriflow_client_logged') === 'true' || this.isGuestPreview;
  }

  _syncNavbarUi(viewId) {
    const avatarEl = document.getElementById('navbar-profile-avatar');
    const logoutBtnEl = document.getElementById('navbar-logout-btn');
    if (!avatarEl || !logoutBtnEl) return;

    if (viewId === 'profile') {
      avatarEl.classList.add('hidden');
      logoutBtnEl.className = 'flex border border-[#ba1a1a]/30 hover:bg-red-55 text-[#ba1a1a] px-3 py-1.5 rounded-full font-bold text-xs transition-all items-center gap-1 cursor-pointer';
    } else {
      avatarEl.classList.remove('hidden');
      logoutBtnEl.className = 'hidden md:flex border border-[#ba1a1a]/30 hover:bg-red-55 text-[#ba1a1a] px-3 py-1.5 rounded-full font-bold text-xs transition-all items-center gap-1 cursor-pointer';
    }
  }

  _applyViewLayout(viewId) {
    const footerEl = document.querySelector('footer');
    const navbarEl = document.getElementById('client-navbar');
    const mobileNavEl = document.getElementById('mobile-bottom-nav');
    const mainContainerEl = document.getElementById('client-main-container');

    if (!mainContainerEl) return;

    const isChat = viewId === 'chat' || viewId === 'food-chat';
    const isBooking = viewId === 'book-wizard';

    document.documentElement.classList.toggle('overflow-hidden', isChat);
    document.body.classList.toggle('overflow-hidden', isChat);

    if (footerEl) footerEl.classList.toggle('hidden', isChat || isBooking);
    if (navbarEl) navbarEl.classList.toggle('hidden', isChat);
    if (mobileNavEl) mobileNavEl.classList.toggle('hidden', isChat || isBooking);

    if (isChat) {
      mainContainerEl.className = 'flex-grow w-full relative flex flex-col p-0 m-0 max-w-full';
      const section = document.getElementById(viewId);
      if (section) {
        section.className = 'view-section flex flex-col fixed inset-0 z-40 bg-surface w-full p-0 m-0 h-full';
        const chatWindow = section.querySelector('.flex-col');
        if (chatWindow) {
          chatWindow.classList.remove('rounded-2xl', 'border', 'shadow-sm');
          chatWindow.classList.add('border-0', 'rounded-none');
        }
      }
    } else if (isBooking) {
      mainContainerEl.className = 'flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg relative';
    } else {
      document.documentElement.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
      mainContainerEl.className = 'flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg relative';

      // Reset chat section styles
      ['view-chat', 'view-food-chat'].forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          section.className = 'view-section hidden flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] w-full';
          const chatWindow = section.querySelector('.flex-col');
          if (chatWindow) {
            chatWindow.classList.add('rounded-2xl', 'border', 'shadow-sm');
            chatWindow.classList.remove('border-0', 'rounded-none');
          }
        }
      });
    }
  }
}

export const router = new Router();

