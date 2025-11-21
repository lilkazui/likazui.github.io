(function () {
  // ######################################################################
  // ########################### SABİT DEĞİŞKENLER ########################
  // ######################################################################
  const USERS_KEY = 'bio_users_v9'; // Yeni versiyon anahtarı
  const LOGGED_IN_KEY = 'bio_logged_in_user_v9';
  const ADMIN_LOGGED_IN_KEY = 'bio_admin_logged_in_v9';
  const ADMIN_PASSWORD = '123456E';
  const PRICE = 0.10;
  const COOLDOWN_MS = 1500;
  const DEFAULT_MIN_WITHDRAWAL = 60.00;

  // Yeni: günlük limitler (normal kullanıcılar için) - defaults, overridable via settings
  const DEFAULT_DAILY_CLICK_LIMIT = 100;         // günlük maksimum tıklama (normal)
  const DEFAULT_DAILY_EARNINGS_LIMIT = 20.00;    // günlük maksimum kazanılabilir tutar ($) (normal)

  // storage key for global settings
  const SETTINGS_KEY = 'bio_settings_v9';

  // Genel Görünüm Alanları
  const appView = document.getElementById('appView');
  const mainContent = document.getElementById('mainContent');
  const authView = document.getElementById('authView');
  const adminPanelView = document.getElementById('adminPanelView');
  const adminLoginLink = document.getElementById('adminLoginLink');
  const adminAuthView = document.getElementById('adminAuthView');

  // Admin Panel Elemanları
  const adminUsernameInput = document.getElementById('adminUsername');
  const adminAmountInput = document.getElementById('adminAmount');
  const adminAddBtn = document.getElementById('adminAddBtn');
  const adminTakeBtn = document.getElementById('adminTakeBtn');
  const adminBanBtn = document.getElementById('adminBanBtn');
  const adminPremiumBtn = document.getElementById('adminPremiumBtn');
  const adminMakeModBtn = document.getElementById('adminMakeModBtn');
  const userListBody = document.getElementById('userListBody');
  const adminMessage = document.getElementById('adminMessage');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminAuthMessage = document.getElementById('adminAuthMessage');
  const requestsBody = document.getElementById('requestsBody');

  // Settings elements
  const settingDailyClick = document.getElementById('settingDailyClick');
  const settingDailyEarn = document.getElementById('settingDailyEarn');
  const settingMinWithdraw = document.getElementById('settingMinWithdraw');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  // Maintenance elements
  const maintenanceReasonInput = document.getElementById('maintenanceReasonInput');
  const enableMaintenanceBtn = document.getElementById('enableMaintenanceBtn');
  const disableMaintenanceBtn = document.getElementById('disableMaintenanceBtn');
  const maintenanceStatusText = document.getElementById('maintenanceStatusText');
  const maintenanceBanner = document.getElementById('maintenanceBanner');
  const maintenanceReasonText = document.getElementById('maintenanceReasonText');
  const maintenanceSinceText = document.getElementById('maintenanceSinceText');
  const closeMaintBannerBtn = document.getElementById('closeMaintBannerBtn');

  // Coupons elements (yeni elemanlar dahil)
  const couponCodeInput = document.getElementById('couponCodeInput');
  const couponPercentInput = document.getElementById('couponPercentInput');
  const couponUsesInput = document.getElementById('couponUsesInput');
  const createCouponBtn = document.getElementById('createCouponBtn');
  const couponList = document.getElementById('couponList');

  // Yeni coupon inputlar
  const couponTypeInput = document.getElementById('couponTypeInput');
  const couponMultiplierInput = document.getElementById('couponMultiplierInput');
  const couponDurationInput = document.getElementById('couponDurationInput'); // seconds

  // Announcement elements (yeni)
  const announceTitleInput = document.getElementById('announceTitleInput');
  const announceMsgInput = document.getElementById('announceMsgInput');
  const announceExpiresInput = document.getElementById('announceExpiresInput');
  const announceStickyInput = document.getElementById('announceStickyInput');
  const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
  const adminAnnouncementList = document.getElementById('adminAnnouncementList');

  const announcementBanner = document.getElementById('announcementBanner');
  const announcementTitleText = document.getElementById('announcementTitleText');
  const announcementMsgText = document.getElementById('announcementMsgText');
  const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');

  // Leaderboard
  const leaderboardList = document.getElementById('leaderboardList');

  // Kullanıcı Arayüzü Elemanları (Mevcutlar)
  const clickCountEl = document.getElementById('clickCount');
  const moneyEl = document.getElementById('moneyEarned');
  const clickBtn = document.getElementById('clickBtn');
  const cooldownText = document.getElementById('cooldownText');
  const displayName = document.getElementById('displayName');
  const avatar = document.getElementById('avatar');
  const statusDesc = document.getElementById('statusDesc');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutUsername = document.getElementById('logoutUsername');
  const clickFill = document.getElementById('clickFill');
  const earnFill = document.getElementById('earnFill');
  const clickRemainText = document.getElementById('clickRemainText');
  const earnRemainText = document.getElementById('earnRemainText');
  const limitBadge = document.getElementById('limitBadge');
  const profilePremiumBadge = document.getElementById('profilePremiumBadge');
  const activeCouponArea = document.getElementById('activeCouponArea');

  // Auth Elemanları
  const authTitle = document.getElementById('authTitle');
  const authForm = document.getElementById('authForm');
  const authUsernameInput = document.getElementById('authUsername');
  const authPasswordInput = document.getElementById('authPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authMessage = document.getElementById('authMessage');
  const switchText = document.getElementById('switchText');

  // Diğer Elemanlar (Form/Çekim)
  const successOverlay = document.getElementById('successOverlay');
  const successDetails = document.getElementById('successDetails');
  const withdrawBtn = document.getElementById('withdrawBtn');
  const bankSelect = document.getElementById('bankSelect');
  const ibanInput = document.getElementById('ibanInput');
  const ibanInvalid = document.getElementById('ibanInvalid');
  const clearIbanBtn = document.getElementById('clearIban');
  const firstNameInput = document.getElementById('firstname');
  const lastNameInput = document.getElementById('lastname');
  const toastContainer = document.getElementById('toastContainer');

  // coupon / user apply
  const couponInput = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponInfo = document.getElementById('couponInfo');
  const minWithdrawalText = document.getElementById('minWithdrawalText');

  let authMode = 'login';
  let isCooldown = false;
  let maintBannerHidden = false;

  // ######################################################################
  // ########################### VERİ YÖNETİMİ ############################
  // ######################################################################

  function getUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      const obj = stored ? JSON.parse(stored) : {};
      // migrate older users to include necessary fields and proper types
      Object.keys(obj).forEach(k => {
        const u = obj[k] || {};
        if (typeof u.role !== 'string') u.role = 'user';
        if (!Array.isArray(u.withdrawalRequests)) u.withdrawalRequests = [];
        // normalize numeric fields to numbers to avoid string comparisons bugs
        u.balance = typeof u.balance === 'number' ? u.balance : (u.balance ? parseFloat(String(u.balance).replace(/[^\d.-]/g,'')) || 0 : 0);
        u.clicks = typeof u.clicks === 'number' ? u.clicks : (u.clicks ? parseInt(u.clicks,10) || 0 : 0);
        u.dailyClicks = typeof u.dailyClicks === 'number' ? u.dailyClicks : (u.dailyClicks ? parseInt(u.dailyClicks,10) || 0 : 0);
        u.dailyEarnings = typeof u.dailyEarnings === 'number' ? u.dailyEarnings : (u.dailyEarnings ? parseFloat(u.dailyEarnings) || 0 : 0);
        if (!u.dailyDate) u.dailyDate = todayDateKey();
        if (typeof u.premium !== 'boolean') u.premium = !!u.premium;
        if (typeof u.isBanned !== 'boolean') u.isBanned = !!u.isBanned;
        if (typeof u.appliedCoupon !== 'string') u.appliedCoupon = u.appliedCoupon ? String(u.appliedCoupon) : '';
        // NEW: migration for activeCoupon stored as object or missing
        if (!u.activeCoupon) u.activeCoupon = null;
        obj[k] = u;
      });
      return obj;
    } catch (e) {
      console.error("Kullanıcı verisi yüklenirken hata oluştu:", e);
      return {};
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Kullanıcı verisi kaydedilirken hata oluştu:", e);
    }
  }

  function getLoggedInUser() {
    const username = localStorage.getItem(LOGGED_IN_KEY);
    if (!username) return null;
    const users = getUsers();
    return users[username] || null;
  }

  function setLoggedInUser(user) {
      localStorage.setItem(LOGGED_IN_KEY, user ? user.username : '');
  }

  // Settings management
  function getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) {
        const defaults = {
          dailyClickLimit: DEFAULT_DAILY_CLICK_LIMIT,
          dailyEarningsLimit: DEFAULT_DAILY_EARNINGS_LIMIT,
          minWithdrawalAmount: DEFAULT_MIN_WITHDRAWAL,
          coupons: [], // { code, percent, uses: null or number, createdAt, type, multiplier, durationSeconds }
          maintenance: { enabled: false, reason: '', since: null },
          announcements: [] // { id, title, message, createdAt, expiresAt|null, sticky:bool, visible:bool }
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
        return defaults;
      }
      // migrate minimal fields if missing
      if (typeof parsed.dailyClickLimit !== 'number') parsed.dailyClickLimit = DEFAULT_DAILY_CLICK_LIMIT;
      if (typeof parsed.dailyEarningsLimit !== 'number') parsed.dailyEarningsLimit = DEFAULT_DAILY_EARNINGS_LIMIT;
      if (typeof parsed.minWithdrawalAmount !== 'number') parsed.minWithdrawalAmount = DEFAULT_MIN_WITHDRAWAL;
      if (!Array.isArray(parsed.coupons)) parsed.coupons = [];
      if (!parsed.maintenance) parsed.maintenance = { enabled: false, reason: '', since: null };
      if (!Array.isArray(parsed.announcements)) parsed.announcements = [];
      return parsed;
    } catch (e) {
      console.error("Ayarlar yüklenirken hata:", e);
      return {
        dailyClickLimit: DEFAULT_DAILY_CLICK_LIMIT,
        dailyEarningsLimit: DEFAULT_DAILY_EARNINGS_LIMIT,
        minWithdrawalAmount: DEFAULT_MIN_WITHDRAWAL,
        coupons: [],
        maintenance: { enabled: false, reason: '', since: null },
        announcements: []
      };
    }
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch (e) {
      console.error("Ayarlar kaydedilirken hata:", e);
    }
  }

  function getMinWithdrawalAmount() {
    const s = getSettings();
    return typeof s.minWithdrawalAmount === 'number' ? s.minWithdrawalAmount : DEFAULT_MIN_WITHDRAWAL;
  }

  function getDefaultDailyClickLimit() {
    return getSettings().dailyClickLimit || DEFAULT_DAILY_CLICK_LIMIT;
  }
  function getDefaultDailyEarningsLimit() {
    return getSettings().dailyEarningsLimit || DEFAULT_DAILY_EARNINGS_LIMIT;
  }

  function isMaintenanceActive() {
    const s = getSettings();
    return !!(s.maintenance && s.maintenance.enabled);
  }
  function getMaintenanceInfo() {
    const s = getSettings();
    return s.maintenance || { enabled: false, reason: '', since: null };
  }

  // ######################################################################
  // ########################### GÖRÜNÜM YÖNETİMİ #########################
  // ######################################################################

  function showView(view) {
    mainContent.style.display = view === 'app' ? 'grid' : 'none';
    authView.style.display = view === 'auth' ? 'block' : 'none';
    adminPanelView.style.display = view === 'admin' ? 'flex' : 'none';
    appView.style.display = view === 'app' || view === 'auth' ? 'block' : 'none';

    if (view === 'auth') {
        authUsernameInput.value = '';
        authPasswordInput.value = '';
        showMessage(authMessage, '', false);
    }
    renderMaintenanceBanner();
    renderAnnouncementsInApp(); // refresh announcements whenever view may change
  }

  function updateMaintenanceUI() {
    const info = getMaintenanceInfo();
    maintenanceStatusText.textContent = info.enabled ? `Bakım etkinleştirildi. Sebep: ${info.reason || '(belirtilmemiş)'} — Başlangıç: ${info.since}` : 'Bakım kapalı.';
    maintenanceReasonInput.value = info.reason || '';
    renderMaintenanceBanner();
  }

  function renderMaintenanceBanner() {
    const info = getMaintenanceInfo();
    if (info.enabled && !maintBannerHidden) {
      maintenanceReasonText.textContent = info.reason || 'Planlı bakım';
      maintenanceSinceText.textContent = info.since ? `Başladı: ${new Date(info.since).toLocaleString()}` : '';
      maintenanceBanner.style.display = 'flex';
    } else {
      maintenanceBanner.style.display = 'none';
    }
  }

  closeMaintBannerBtn && closeMaintBannerBtn.addEventListener('click', () => {
    maintBannerHidden = true;
    maintenanceBanner.style.display = 'none';
  });

  function checkAdminStatus() {
      const isAdmin = localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true';
      if (isAdmin) {
          adminLoginLink.textContent = 'ADMİN ÇIKIŞ YAP';
          adminLoginLink.classList.add('admin-logged-in');
      } else {
          adminLoginLink.textContent = 'YÖNETİCİ PANELİ';
          adminLoginLink.classList.remove('admin-logged-in');
      }
      return isAdmin;
  }

  function navigate() {
    if (checkAdminStatus()) {
      renderAdminPanel();
      showView('admin');
      return;
    }

    const user = getLoggedInUser();
    if (user) {
      // ensure daily fields are present and reset if needed
      ensureDailyFields(user);
      ensureUserFields(user);
      resetDailyIfNeeded(user);
      showView('app');
      // Kullanıcıya özel verileri yükle
      firstNameInput.value = user.firstname || '';
      lastNameInput.value = user.lastname || '';
      bankSelect.value = user.bank || '';
      ibanInput.value = prettyIban(user.iban || '');
      couponInput.value = user.appliedCoupon || '';
      renderApp(user);
      render();
    } else {
      showView('auth');
    }
  }

  // ######################################################################
  // ########################### GENEL YARDIMCILAR ########################
  // ######################################################################

  function showMessage(el, text, isSuccess) {
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
    el.className = 'message ' + (isSuccess ? 'success' : 'error');
    if (el.id === 'adminMessage') {
        el.style.background = isSuccess ? 'rgba(0, 255, 140, 0.06)' : 'rgba(255, 64, 128, 0.06)';
        el.style.color = isSuccess ? 'var(--accent-success)' : 'var(--accent-danger)';
        el.style.padding = '10px';
        el.style.borderRadius = '8px';
    }
    if (el.id === 'authMessage') {
        el.style.background = isSuccess ? 'rgba(0, 255, 140, 0.06)' : 'rgba(255, 64, 128, 0.06)';
        el.style.color = isSuccess ? 'var(--accent-success)' : 'var(--accent-danger)';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';
        el.style.fontWeight = '600';
    }
  }

  function showToast(message, isSuccess = true, timeout = 3800) {
    const t = document.createElement('div');
    t.className = 'toast ' + (isSuccess ? 'success' : 'error');
    t.innerHTML = `<div style="font-size:1.2rem">${isSuccess ? '✅' : '⚠️'}</div><div style="flex:1">${message}</div>`;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .25s, transform .25s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 300);
    }, timeout);
  }

  function formatMoney(n){
    return '$' + Number(n || 0).toFixed(2);
  }

  function pulse(el){
    if (!el || !el.animate) return;
    el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.07)', opacity: 0.95 },
      { transform: 'scale(1)' }
    ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  // ######################################################################
  // ########################### KULLANICI GİRİŞ/KAYIT ####################
  // ######################################################################

  async function hashPassword(password) {
    if (!password) return '';
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  window.switchAuthMode = () => {
    authMode = authMode === 'login' ? 'register' : 'login';
    authTitle.textContent = authMode === 'login' ? 'Kullanıcı Girişi' : 'Yeni Hesap Oluştur';
    authSubmitBtn.textContent = authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
    authSubmitBtn.className = authMode === 'login' ? 'cta-login' : 'cta-register';
    switchText.innerHTML = authMode === 'login'
      ? 'Hesabınız yok mu? <button type="button" onclick="window.switchAuthMode()">Kayıt Ol</button>'
      : 'Zaten hesabınız var mı? <button type="button" onclick="window.switchAuthMode()">Giriş Yap</button>';
    showMessage(authMessage, '', false);
  };

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = authUsernameInput.value.trim();
    const password = authPasswordInput.value.trim();

    if (username.length < 3 || password.length < 6) {
      showMessage(authMessage, 'Kullanıcı adı (min 3) ve şifre (min 6) karakter olmalıdır.', false);
      return;
    }

    if (authMode === 'register') {
      await registerUser(username, password);
    } else {
      await loginUser(username, password);
    }
  });

  async function registerUser(username, password) {
    let users = getUsers();
    if (users[username]) {
      showMessage(authMessage, 'Bu kullanıcı adı zaten alınmış.', false);
      return;
    }

    const pwdHash = await hashPassword(password);

    users[username] = {
      username: username,
      passwordHash: pwdHash, // hashed password
      balance: 0.00,
      clicks: 0,
      isBanned: false,
      firstname: '', lastname: '', bank: '', iban: '',
      withdrawalRequests: [], // yeni alan
      // günlük limit alanları
      dailyDate: todayDateKey(),
      dailyClicks: 0,
      dailyEarnings: 0,
      // premium alanı
      premium: false,
      premiumSince: null,
      // role
      role: 'user',
      // applied coupon by user (withdrawal-bonus style)
      appliedCoupon: '',
      // active coupon: for time-limited click bonuses: { code, type, multiplier, expiresAt }
      activeCoupon: null
    };
    saveUsers(users);
    showMessage(authMessage, 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', true);
    switchAuthMode();
  }

  async function loginUser(username, password) {
    const users = getUsers();
    const user = users[username];

    if (!user) {
      showMessage(authMessage, 'Kullanıcı adı veya şifre yanlış.', false);
      return;
    }

    // Eğer kullanıcı yasaklıysa engelle
    if (user.isBanned) {
      showMessage(authMessage, 'Hesabınız yasaklanmıştır. Erişim engellendi.', false);
      return;
    }

    // İki modlu doğrulama: hash var mı kontrol et. Yoksa eski (plain) ile kontrol et ve upgrade et.
    if (user.passwordHash) {
      const providedHash = await hashPassword(password);
      if (providedHash !== user.passwordHash) {
        showMessage(authMessage, 'Kullanıcı adı veya şifre yanlış.', false);
        return;
      }
    } else if (user.password) {
      // eski uyumluluk: düz metin şifre varsa kontrol et
      if (user.password !== password) {
        showMessage(authMessage, 'Kullanıcı adı veya şifre yanlış.', false);
        return;
      }
      // başarıysa upgrade: hash'i kaydet ve düz metni sil
      user.passwordHash = await hashPassword(password);
      delete user.password;
      users[username] = user;
      saveUsers(users);
    } else {
      // herhangi bir şifre bilgisi yoksa hayır
      showMessage(authMessage, 'Hatalı giriş bilgileri.', false);
      return;
    }

    // ensure daily fields
    ensureDailyFields(user);
    ensureUserFields(user);
    saveUsers(users);

    setLoggedInUser(user);
    showToast('Giriş başarılı', true);
    navigate();
  }

  window.logout = () => {
      setLoggedInUser(null);
      // Tüm yerel form alanlarını temizle
      firstNameInput.value = '';
      lastNameInput.value = '';
      bankSelect.value = '';
      ibanInput.value = '';
      couponInput.value = '';
      showIbanError('');
      navigate();
  };

  // Bağla logout butonunu (önceden eksikti)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.logout();
    });
  }

  // ######################################################################
  // ########################### ADMİN GİRİŞ/PANEL ########################
  // ######################################################################

  adminLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (checkAdminStatus()) {
          window.logoutAdmin();
      } else {
          // Giriş modalını göster
          adminAuthView.style.display = 'flex';
          adminPasswordInput.value = '';
          showMessage(adminAuthMessage, '', false);
      }
  });

  window.closeAdminAuth = () => {
      adminAuthView.style.display = 'none';
  };

  window.handleAdminLogin = () => {
      const password = adminPasswordInput.value.trim();
      if (password === ADMIN_PASSWORD) {
          localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
          closeAdminAuth();
          navigate();
      } else {
          showMessage(adminAuthMessage, 'Hatalı Yönetici Şifresi.', false);
      }
  };

  window.logoutAdmin = () => {
      localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
      navigate();
  };

  // Admin Panel İşlemleri

  function renderAdminPanel() {
      const users = getUsers();
      let html = '';
      const userArray = Object.values(users);

      if (userArray.length === 0) {
           userListBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Kayıtlı kullanıcı bulunamadı.</td></tr>';
      } else {
        userArray.sort((a, b) => b.balance - a.balance);

        userArray.forEach(user => {
            const statusText = user.isBanned
                ? `<span style="color: var(--accent-danger); font-weight: 600;">Yasaklı</span>`
                : `<span style="color: var(--accent-success); font-weight: 600;">Aktif</span>`;
            const premiumText = user.premium ? `<span style="color:#08121a; background:#FFD400; padding:4px 8px; border-radius:6px; font-weight:700;">PREMIUM</span>` : `<span style="color:var(--text-muted);">-</span>`;
            const roleText = `<strong>${user.role || 'user'}</strong>`;
            html += `
                <tr>
                    <td>${user.username}</td>
                    <td><strong style="color: var(--accent-success);">${formatMoney(user.balance)}</strong></td>
                    <td>${user.clicks}</td>
                    <td>${statusText}</td>
                    <td>${premiumText}</td>
                    <td>${roleText}</td>
                    <td class="action-cell">
                        <button onclick="window.adminAction('${user.username}', 'add', 10.00)" class="add-btn" title="Bakiyeye $10.00 Ekle" style="background: var(--accent-success); color: var(--bg-deep);">+10</button>
                        <button onclick="window.adminAction('${user.username}', 'take', 0)" class="take-btn" title="Bakiyeyi Sıfırla" style="background: var(--accent-primary); color: white;">Sıfırla</button>
                        <button onclick="window.adminAction('${user.username}', 'banToggle', 0)" class="ban-btn" title="${user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}" style="background: var(--accent-danger); color: white;">${user.isBanned ? 'UNBAN' : 'BAN'}</button>
                        <button onclick="window.adminAction('${user.username}', 'togglePremium', 0)" class="premium-btn" title="${user.premium ? 'Premium Kaldır' : 'Premium Ver'}" style="background:linear-gradient(90deg,#FFD400,#FF9A00); color:#08121a; margin-left:6px; border-radius:8px; padding:6px 8px;">${user.premium ? 'KALDIR' : 'VER'}</button>
                        <button onclick="window.adminAction('${user.username}', 'toggleMod', 0)" class="mod-btn" title="Moderator Yap/Kaldır" style="background:#9a59ff; color:white; margin-left:6px; border-radius:8px; padding:6px 8px;">MOD</button>
                    </td>
                </tr>
            `;
        });
        userListBody.innerHTML = html;
      }

      renderRequestsTable();
      renderCouponsList();
      renderAdminAnnouncements(); // admin duyuruları göster
      renderLeaderboard();
      // populate settings fields
      const s = getSettings();
      settingDailyClick.value = s.dailyClickLimit;
      settingDailyEarn.value = s.dailyEarningsLimit;
      settingMinWithdraw.value = s.minWithdrawalAmount;
      updateMaintenanceUI();
      showMessage(adminMessage, '', false);
  }

  // Admin Kontrol Butonları
  adminAddBtn.addEventListener('click', () => { window.adminAction(adminUsernameInput.value, 'addCustom', parseFloat(adminAmountInput.value) || 0); });
  adminTakeBtn.addEventListener('click', () => { window.adminAction(adminUsernameInput.value, 'takeCustom', parseFloat(adminAmountInput.value) || 0); });
  adminBanBtn.addEventListener('click', () => { window.adminAction(adminUsernameInput.value, 'banToggle', 0); });
  adminPremiumBtn.addEventListener('click', () => { window.adminAction(adminUsernameInput.value, 'togglePremium', 0); });
  adminMakeModBtn && adminMakeModBtn.addEventListener('click', () => { window.adminAction(adminUsernameInput.value, 'toggleMod', 0); });

  window.adminAction = (username, actionType, amountOrId) => {
      let users = getUsers();
      const user = users[username];

      if (!user) {
          showMessage(adminMessage, `Hata: ${username} adlı kullanıcı bulunamadı.`, false);
          return;
      }

      amountOrId = parseFloat(amountOrId) || 0;
      let message = '';

      switch (actionType) {
          case 'add':
          case 'addCustom':
              user.balance += amountOrId;
              message = `${username} hesabına ${formatMoney(amountOrId)} başarıyla eklendi. Yeni bakiye: ${formatMoney(user.balance)}`;
              break;
          case 'take':
              user.balance = 0.00;
              message = `${username} hesabının bakiyesi başarıyla sıfırlandı.`;
              break;
          case 'takeCustom':
              user.balance = Math.max(0, user.balance - amountOrId);
              message = `${username} hesabından ${formatMoney(amountOrId)} başarıyla çekildi. Yeni bakiye: ${formatMoney(user.balance)}`;
              break;
          case 'banToggle':
              user.isBanned = !user.isBanned;
              message = user.isBanned
                  ? `${username} başarıyla YASAKLANDI.`
                  : `${username} yasağı başarıyla kaldırıldı.`;
              break;
          case 'togglePremium':
              user.premium = !user.premium;
              user.premiumSince = user.premium ? new Date().toISOString() : null;
              message = user.premium ? `${username} artık PREMIUM (Sınırsız).` : `${username} premium'dan çıkarıldı.`;
              break;
          case 'toggleMod':
              user.role = user.role === 'moderator' ? 'user' : 'moderator';
              message = `${username} rolü ${user.role} olarak ayarlandı.`;
              break;
          default: return;
      }

      saveUsers(users);
      renderAdminPanel();

      // Eğer güncellenen kullanıcı giriş yapmışsa, ana uygulamayı da güncelle
      if (localStorage.getItem(LOGGED_IN_KEY) === username) {
           setLoggedInUser(user);
           renderApp(user);
           render();
      }

      showMessage(adminMessage, message, true);
      showToast(message, true, 2500);
  };


  // ######################################################################
  // ########################### ANA UYGULAMA LOGİĞİ ######################
  // ######################################################################

  function ensureUserFields(user) {
    // ensure role, appliedCoupon exist
    if (!user) return;
    if (typeof user.role !== 'string') user.role = 'user';
    if (typeof user.appliedCoupon !== 'string') user.appliedCoupon = '';
    if (!user.withdrawalRequests) user.withdrawalRequests = [];
    if (typeof user.activeCoupon === 'undefined') user.activeCoupon = null;
  }

  function renderApp(user) {
      // Kullanıcı Adı ve Avatarı Ayarla
      displayName.textContent = user.username;
      logoutUsername.textContent = user.username;
      const initials = user.username.substring(0, 2).toUpperCase() || 'US';
      avatar.textContent = initials;

      // Ad Soyad varsa Profil Adını Güncelle
      if (user.firstname || user.lastname) {
          displayName.textContent = user.firstname + (user.firstname && user.lastname ? ' ' : '') + user.lastname;
          const initial1 = user.firstname ? user.firstname[0].toUpperCase() : '';
          const initial2 = user.lastname ? user.lastname[0].toUpperCase() : '';
          avatar.textContent = (initial1 + initial2) || initials;
      }

      // Ban Durumunu Kontrol Et
      if (user.isBanned) {
          statusDesc.innerHTML = `<strong style="color: var(--accent-danger);">Yasaklı Hesap.</strong> Tıklama ve çekim işlemleri kapalıdır.`;
          clickBtn.setAttribute('data-banned', 'true');
          clickBtn.disabled = true;
          withdrawBtn.disabled = true;
      } else {
          statusDesc.innerHTML = 'Giriş Başarılı. Yeni bir tıklama yapmaya hazırsınız.';
          clickBtn.setAttribute('data-banned', 'false');
      }

      // show limit badge based on user's limits
      const limits = getUserLimits(user);
      if (limits.isUnlimited) {
        limitBadge.textContent = `Günlük Limit: SINIRSIZ (PREMIUM)`;
      } else {
        limitBadge.textContent = `Günlük Limit: ${limits.clickLimit} tıklama / ${formatMoney(limits.earnLimit)}`;
      }
      // premium badge in profile
      if (user.premium) {
        profilePremiumBadge.style.display = 'inline-block';
      } else {
        profilePremiumBadge.style.display = 'none';
      }

      // show applied coupon info (withdrawal style)
      if (user.appliedCoupon) {
        const coupon = findCoupon(user.appliedCoupon);
        couponInfo.textContent = coupon ? `Uygulanan kupon: ${coupon.code} (+${coupon.percent}%)` : 'Uygulanan kupon geçersiz.';
      } else {
        couponInfo.textContent = '';
      }

      // active coupon (click bonus) display
      renderActiveCoupon(user);

      // min withdrawal text
      minWithdrawalText.textContent = formatMoney(getMinWithdrawalAmount());

      // maintenance banner state
      renderMaintenanceBanner();
  }

  function renderActiveCoupon(user) {
    // Show active coupon (time-limited)
    const now = Date.now();
    let html = '';
    if (user.activeCoupon && user.activeCoupon.expiresAt && user.activeCoupon.expiresAt > now) {
      const remainingMs = user.activeCoupon.expiresAt - now;
      const secs = Math.ceil(remainingMs/1000);
      html = `<div class="coupon-active-badge">Aktif Kupon: ${user.activeCoupon.code} — ${user.activeCoupon.multiplier}x (${secs}s kaldı)</div>`;
    } else {
      html = '';
    }
    activeCouponArea.innerHTML = html;
  }

  function calculateMoney(user) {
      return Number(user.balance || 0);
  }

  function getUserLimits(user) {
    // Eğer premium ise sınırsız (Infinity) ve isUnlimited=true döndür
    if (user && user.premium) {
      return {
        clickLimit: Infinity,
        earnLimit: Infinity,
        isUnlimited: true
      };
    }
    // normal kullanıcı - read from settings
    return {
      clickLimit: getDefaultDailyClickLimit(),
      earnLimit: getDefaultDailyEarningsLimit(),
      isUnlimited: false
    };
  }

  // now returns reasons array to be able to show helpful feedback
  function checkWithdrawalEligibility(user) {
      const currentMoney = calculateMoney(user);
      const reasons = [];
      const settings = getSettings();
      const maintenance = !!(settings.maintenance && settings.maintenance.enabled);

      if (maintenance) reasons.push('Sunucu bakımdadır.');
      if (user.isBanned) reasons.push('Hesabınız yasaklı.');
      if (!user.bank || String(user.bank).trim() === '') reasons.push('Banka seçimi yapılmamış.');
      if (!user.iban || !validateIban(user.iban)) reasons.push('Geçerli bir IBAN girilmemiş.');
      if (currentMoney < getMinWithdrawalAmount()) reasons.push(`Minimum çekim tutarına ulaşılamadı (${formatMoney(getMinWithdrawalAmount())}).`);

      const eligible = reasons.length === 0;
      return { eligible, currentMoney, reasons, maintenance };
  }

  function updateWithdrawalButton(user){
      const res = checkWithdrawalEligibility(user);
      const eligible = res.eligible;
      const currentMoney = res.currentMoney;
      const reasons = res.reasons || [];
      const maintenance = res.maintenance;

      if (eligible) {
        withdrawBtn.textContent = formatMoney(currentMoney) + ' Çekim Talep Et';
        withdrawBtn.disabled = false;
        withdrawBtn.title = 'Çekim yap';
      } else {
        // show most important reason on button text
        let reasonText = maintenance ? 'Bakım: Çekim Kapalı' : (reasons[0] || 'Çekim şartları sağlanmadı');
        withdrawBtn.textContent = reasonText;
        withdrawBtn.disabled = true;
        withdrawBtn.title = reasons.join(' • ');
      }

      withdrawBtn.style.background = eligible ? 'var(--accent-success)' : 'var(--bg-card)';
      withdrawBtn.style.color = eligible ? 'var(--bg-deep)' : 'var(--text-muted)';
      withdrawBtn.style.border = eligible ? 'none' : '1px solid var(--border-soft)';
      withdrawBtn.style.boxShadow = eligible ? '0 6px 20px rgba(0, 255, 140, 0.25)' : 'none';

  }


  function render(){
    const user = getLoggedInUser();
    if (!user) return;

    const currentMoney = calculateMoney(user);

    clickCountEl.textContent = user.clicks;
    moneyEl.textContent = formatMoney(currentMoney);

    updateWithdrawalButton(user);

    // Günlük ilerlemeyi göster (kullanıcıya özel limitlerle)
    const dailyClicks = user.dailyClicks || 0;
    const dailyEarn = user.dailyEarnings || 0;
    const limits = getUserLimits(user);

    if (limits.isUnlimited) {
      // Premium: gösterimleri "Sınırsız" yap
      clickFill.style.width = '100%';
      earnFill.style.width = '100%';
      clickRemainText.textContent = 'Sınırsız';
      earnRemainText.textContent = 'Sınırsız';
      // renkleri premium için daha parlak göster
      clickFill.style.background = 'linear-gradient(90deg, #FFD400, #FF9A00)';
      earnFill.style.background = 'linear-gradient(90deg, #FFD400, #FF9A00)';
    } else {
      const clickPct = Math.min(100, Math.round((dailyClicks / limits.clickLimit) * 100));
      const earnPct = Math.min(100, Math.round((dailyEarn / limits.earnLimit) * 100));
      clickFill.style.width = clickPct + '%';
      earnFill.style.width = earnPct + '%';
      clickFill.style.background = '';
      earnFill.style.background = '';
      clickRemainText.textContent = `${dailyClicks}/${limits.clickLimit}`;
      earnRemainText.textContent = `${formatMoney(dailyEarn)} / ${formatMoney(limits.earnLimit)}`;
    }

    if (!user.isBanned) {
        // Eğer limit sınırsızsa comparisons false olur (Infinity ile) ve tıklama engellenmez
        const maintenance = isMaintenanceActive();
        // check also active coupon expiry and clear if expired
        clearExpiredUserCoupon(user);
        clickBtn.disabled = isCooldown || maintenance || ( !limits.isUnlimited && (user.dailyClicks >= limits.clickLimit || user.dailyEarnings >= limits.earnLimit) );
        if (maintenance) {
          clickBtn.setAttribute('aria-disabled', 'true');
          clickBtn.setAttribute('data-maintenance', 'true');
        } else {
          clickBtn.removeAttribute('data-maintenance');
          if (!limits.isUnlimited && (user.dailyClicks >= limits.clickLimit || user.dailyEarnings >= limits.earnLimit)) {
            clickBtn.setAttribute('aria-disabled', 'true');
          } else {
            clickBtn.removeAttribute('aria-disabled');
          }
        }
    }
    renderApp(user); // update coupon UI
  }

  clickBtn.addEventListener('click', () => {
    const user = getLoggedInUser();
    if (!user || user.isBanned || isCooldown) return;

    if (isMaintenanceActive()) {
      showToast('Sunucu bakımdadır. Tıklama işlemleri geçici olarak kapalı.', false, 3500);
      return;
    }

    // Ensure daily fields
    ensureDailyFields(user);
    resetDailyIfNeeded(user);

    const limits = getUserLimits(user);

    // compute multiplier from active coupon
    clearExpiredUserCoupon(user); // ensure expired removed
    const active = user.activeCoupon;
    const multiplier = (active && active.multiplier && active.expiresAt && active.expiresAt > Date.now()) ? Number(active.multiplier) : 1;

    // limit kontrolü (premium ise limits.isUnlimited==true ve bu kontroller atlanır)
    if (!limits.isUnlimited && (user.dailyClicks || 0) >= limits.clickLimit) {
      showToast('Günlük tıklama limitinize ulaştınız.', false, 3500);
      render(); return;
    }
    // check earnings with multiplier
    if (!limits.isUnlimited && (((user.dailyEarnings || 0) + (PRICE * multiplier)) > limits.earnLimit)) {
      showToast('Günlük kazanç limitinize ulaşmak üzeresiniz. Bu tıklama eklenemez.', false, 3500);
      render(); return;
    }

    let users = getUsers();
    // apply multiplier: add integer clicks and multiplied earnings
    const addClicks = Math.max(1, Math.floor(multiplier));
    const addMoney = PRICE * multiplier;

    users[user.username].clicks += addClicks;
    users[user.username].balance += addMoney;
    // günlük sayaçları arttır
    users[user.username].dailyClicks = (users[user.username].dailyClicks || 0) + addClicks;
    users[user.username].dailyEarnings = (users[user.username].dailyEarnings || 0) + addMoney;

    // If active coupon is "one-shot" (optional), you might want to clear it after first use.
    // Current behavior: time-limited coupon remains active until expires.
    saveUsers(users);
    setLoggedInUser(users[user.username]);

    render();
    pulse(clickCountEl);
    pulse(moneyEl);

    isCooldown = true;
    clickBtn.disabled = true;
    clickBtn.setAttribute('aria-pressed', 'true');
    document.getElementById('clickBtnText').textContent = 'İŞLENİYOR...';
    cooldownText.style.display = 'inline';

    let timer = COOLDOWN_MS;
    const interval = setInterval(() => {
      timer -= 100;
      cooldownText.textContent = `(${Math.ceil(timer/1000)}s)`;
      if (timer <= 0) {
        clearInterval(interval);
        isCooldown = false;
        if (!user.isBanned) clickBtn.disabled = false;
        clickBtn.setAttribute('aria-pressed', 'false');
        document.getElementById('clickBtnText').textContent = 'TIKLA VE KAZAN';
        cooldownText.style.display = 'none';
      }
    }, 100);
  });

  // ######################################################################
  // ########################### ÇEKİM (WITHDRAWAL REQUESTS) ##############
  // ######################################################################

  // Yardımcı: benzersiz id oluştur
  function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2,8);
  }

  withdrawBtn.addEventListener('click', () => {
      const user = getLoggedInUser();
      if (!user) return;

      // Recompute eligibility with reasons
      const { eligible, currentMoney, reasons, maintenance } = checkWithdrawalEligibility(user);

      if (!eligible) {
        // Show helpful error message (all reasons)
        const msg = (reasons && reasons.length) ? reasons.join(' • ') : (maintenance ? 'Sunucu bakımdadır.' : 'Çekim yapılamıyor.');
        showToast(msg, false, 5000);
        return;
      }

      // Proceed to create withdrawal request
      let users = getUsers();
      const storedIban = prettyIban(user.iban || '');
      const selectedBank = user.bank || '';
      const originalBalance = Number(users[user.username].balance) || 0;
      let amt = originalBalance;
      let appliedCouponCode = user.appliedCoupon || '';
      let appliedCoupon = appliedCouponCode ? findCoupon(appliedCouponCode) : null;
      let bonus = 0;

      if (appliedCoupon && isCouponValid(appliedCoupon)) {
        bonus = appliedCoupon.percent || 0;
        // decrement uses if present
        if (typeof appliedCoupon.uses === 'number' && appliedCoupon.uses > 0) {
          appliedCoupon.uses = appliedCoupon.uses - 1;
          // save update to settings
          const s = getSettings();
          const idx = s.coupons.findIndex(c => c.code === appliedCoupon.code);
          if (idx >= 0) {
            s.coupons[idx] = appliedCoupon;
            saveSettings(s);
          }
        }
        // apply bonus percentage
        amt = parseFloat((originalBalance * (1 + (bonus/100))).toFixed(2));
      } else {
        appliedCouponCode = '';
      }

      // create request
      const req = {
        id: generateId('wr_'),
        username: user.username,
        amount: amt,
        bank: selectedBank,
        iban: normalizeIban(user.iban || ''),
        createdAt: new Date().toISOString(),
        status: 'pending',
        originalBalance: originalBalance,
        couponApplied: appliedCouponCode,
        couponBonusPercent: bonus
      };

      if (!users[user.username].withdrawalRequests) users[user.username].withdrawalRequests = [];
      users[user.username].withdrawalRequests.push(req);

      // kullanıcı anında bakiyesini kaybeder
      users[user.username].balance = 0.00;

      // clear applied coupon from user after use
      users[user.username].appliedCoupon = '';

      saveUsers(users);
      setLoggedInUser(users[user.username]);

      render();

      // Animasyon ve detay göster
      successDetails.innerHTML = `
          <p style="margin-bottom: 10px;">Çekim Tutarı: <strong style="color: var(--accent-success);">${formatMoney(amt)}</strong></p>
          ${bonus ? `<p style="margin-bottom: 10px; color:var(--text-muted)">Kupon Bonus: <strong>+${bonus}%</strong></p>` : ''}
          <p style="margin-bottom: 10px;">Banka: <strong>${selectedBank}</strong></p>
          <p style="margin-bottom: 20px;">IBAN: <strong>${storedIban}</strong></p>
          <p style="margin-bottom: 6px; color:var(--text-muted); font-size:0.9rem;">Talep ID: <strong>${req.id}</strong></p>
      `;

      successOverlay.style.display = 'flex';
      showToast('Çekim talebi oluşturuldu. Admin onayı bekleniyor.', true, 3500);
      renderAdminPanel();
  });

  window.closeSuccessOverlay = () => {
      successOverlay.style.display = 'none';
  };

  // Admin: talepleri renderle ve işlemleri bağla
  function renderRequestsTable() {
    const users = getUsers();
    let rows = '';
    const allRequests = [];
    Object.values(users).forEach(u => {
      if (Array.isArray(u.withdrawalRequests)) {
        u.withdrawalRequests.forEach(r => allRequests.push(r));
      }
    });
    if (allRequests.length === 0) {
      requestsBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">Kayıtlı çekim talebi yok.</td></tr>';
      return;
    }
    // en yeni önce
    allRequests.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    allRequests.forEach(r => {
      rows += `
        <tr>
          <td>${r.id}</td>
          <td>${r.username}</td>
          <td><strong style="color:var(--accent-success)">${formatMoney(r.amount)}</strong>${r.couponApplied ? ` <small style="color:var(--text-muted)">(${r.couponApplied} +${r.couponBonusPercent}%)</small>` : ''}</td>
          <td>${r.bank} / ${prettyIban(r.iban)}</td>
          <td>${new Date(r.createdAt).toLocaleString()}</td>
          <td>${r.status === 'pending' ? '<strong style="color:orange">Pending</strong>' : (r.status === 'approved' ? '<strong style="color:var(--accent-success)">Approved</strong>' : '<strong style="color:var(--accent-danger)">Rejected</strong>')}</td>
          <td>
            ${r.status === 'pending' ? `<button onclick="window.handleRequestAction('${r.id}', 'approve')" style="background:var(--accent-success); color:#021122; border-radius:8px; padding:6px 8px;">Onayla</button>
            <button onclick="window.handleRequestAction('${r.id}', 'reject')" style="background:var(--accent-danger); color:white; border-radius:8px; padding:6px 8px; margin-left:6px;">Reddet</button>` : `<button onclick="window.handleRequestAction('${r.id}', 'remove')" style="background:rgba(255,255,255,0.03); color:var(--text-muted); border-radius:8px; padding:6px 8px;">Kaldır</button>`}
          </td>
        </tr>
      `;
    });
    requestsBody.innerHTML = rows;
  }

  // Admin bir talebi işleyecek
  window.handleRequestAction = (reqId, action) => {
    const users = getUsers();
    let found = false;
    Object.keys(users).forEach(username => {
      const u = users[username];
      if (!Array.isArray(u.withdrawalRequests)) return;
      u.withdrawalRequests = u.withdrawalRequests.map(r => {
        if (r.id !== reqId) return r;
        found = true;
        if (action === 'approve') {
          r.status = 'approved';
          // bakiye zaten 0 (çünkü kullanıcı çektiğinde sıfırlanmış), burada sadece kayıt tutuluyor
        } else if (action === 'reject') {
          r.status = 'rejected';
          // reddedilirse orijinal bakiye geri konur
          u.balance = (r.originalBalance || 0);
        } else if (action === 'remove') {
          // silme: işaretle ve sonra filtrele (yok saymak için status=removed)
          r.status = 'removed';
        }
        return r;
      });
      // filtreleme: removed ise array'den temizle
      u.withdrawalRequests = u.withdrawalRequests.filter(rr => rr.status !== 'removed');
      users[username] = u;
    });
    if (!found) {
      showMessage(adminMessage, 'Talep bulunamadı: ' + reqId, false);
      return;
    }
    saveUsers(users);
    renderAdminPanel();
    showToast(`Talep ${action} işlemi yapıldı.`, true, 2500);
  };

  // ######################################################################
  // ########################### KİŞİSEL VERİ YÖNETİMİ ####################
  // ######################################################################

  function saveUserSpecificData(key, value) {
      const user = getLoggedInUser();
      if (!user) return;

      let users = getUsers();
      if (!users[user.username]) return;

      users[user.username][key] = value;
      saveUsers(users);

      setLoggedInUser(users[user.username]);

      if (key === 'bank' || key === 'iban' || key === 'appliedCoupon' || key === 'activeCoupon') {
          updateWithdrawalButton(users[user.username]);
          renderAdminPanel();
      }
  }

  firstNameInput.addEventListener('input', (e) => {
    saveUserSpecificData('firstname', e.target.value.trim());
    renderApp(getLoggedInUser());
  });
  lastNameInput.addEventListener('input', (e) => {
    saveUserSpecificData('lastname', e.target.value.trim());
    renderApp(getLoggedInUser());
  });

  bankSelect.addEventListener('change', (e) => {
      saveUserSpecificData('bank', e.target.value);
  });

  // IBAN: format ve güçlü doğrulama (mod-97)
  const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/i;
  const TR_IBAN_REGEX = /^TR\d{24}$/i;

  function normalizeIban(raw){ return raw ? raw.replace(/\s+/g, '').toUpperCase() : ''; }
  function prettyIban(raw){
    const s = normalizeIban(raw);
    if (s.length === 0) return '';
    let formatted = s.match(/.{1,4}/g).join(' ');
    return formatted.trim();
  }

  // IBAN mod-97 kontrolü
  function ibanMod97(iban) {
    const rearranged = iban.slice(4) + iban.slice(0,4);
    let expanded = '';
    for (let i=0;i<rearranged.length;i++){
      const ch = rearranged[i];
      if (ch >= 'A' && ch <= 'Z') {
        expanded += (ch.charCodeAt(0) - 55).toString();
      } else {
        expanded += ch;
      }
    }
    let remainder = 0;
    let str = expanded;
    while (str.length) {
      const piece = (remainder.toString() + str.slice(0, 9));
      remainder = parseInt(piece, 10) % 97;
      str = str.slice(9);
    }
    return remainder === 1;
  }

  function validateIban(raw){
    const n = normalizeIban(raw);
    if (!n) return false;
    if (n.startsWith('TR')) {
        if (!TR_IBAN_REGEX.test(n)) return false;
        if (n.length !== 26) return false;
        try { return ibanMod97(n); } catch(e) { return false; }
    }
    if (!IBAN_REGEX.test(n) || n.length < 15 || n.length > 34) return false;
    try { return ibanMod97(n); } catch(e) { return false; }
  }

  function showIbanError(msg){
    if(!msg){ ibanInvalid.style.display = 'none'; ibanInvalid.textContent = ''; return; }
    ibanInvalid.style.display = 'block';
    ibanInvalid.textContent = msg;
  }

  ibanInput.addEventListener('input', (e) => {
    const before = e.target.value;
    const formatted = prettyIban(before);
    e.target.value = formatted;

    const raw = normalizeIban(formatted);

    saveUserSpecificData('iban', raw);

    if(raw.length === 0){
      showIbanError('');
    } else {
      if(raw.startsWith('TR') && raw.length < 26){
           showIbanError('TR IBAN için 26 karakter bekleniyor.');
      } else if (raw.length > 34) {
           showIbanError('IBAN çok uzun görünüyor.');
      } else if(validateIban(raw)){
        showIbanError('');
      } else {
        showIbanError('Geçersiz IBAN (checksum veya format hatası).');
      }
    }
    try { ibanInput.selectionStart = ibanInput.selectionEnd = ibanInput.value.length; } catch(err){}
  });

  clearIbanBtn.addEventListener('click', () => {
    ibanInput.value = '';
    saveUserSpecificData('iban', '');
    showIbanError('');
    ibanInput.focus();
  });

  // ######################################################################
  // ########################### KUPON / PROMO KODLARI (GÜNCELLEME) ######
  // ######################################################################

  function findCoupon(code) {
    if (!code) return null;
    const s = getSettings();
    return s.coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
  }

  function isCouponValid(coupon) {
    if (!coupon) return false;
    if (coupon.uses !== null && typeof coupon.uses === 'number' && coupon.uses <= 0) return false;
    // possible future: expiry date check
    return true;
  }

  applyCouponBtn.addEventListener('click', () => {
    const user = getLoggedInUser();
    if (!user) return;
    const code = couponInput.value.trim();
    if (!code) {
      showToast('Kupon kodu girin.', false); return;
    }
    const coupon = findCoupon(code);
    if (!coupon) {
      showToast('Geçersiz kupon.', false); return;
    }
    if (!isCouponValid(coupon)) {
      showToast('Kupon artık geçerli değil (kullanım sayısı dolmuş).', false); return;
    }

    // Two coupon types:
    // - balance: as before, applied to withdrawal (user.appliedCoupon)
    // - click_bonus: time-limited multiplier applied to clicks/earnings (user.activeCoupon)
    if (coupon.type === 'click_bonus') {
      // Apply a time-limited click multiplier
      const durationSec = Number(coupon.durationSeconds) || 60;
      const multiplier = Number(coupon.multiplier) || 2;
      const expiresAt = Date.now() + durationSec * 1000;

      // decrement uses count at application time (reserve the coupon for this user)
      if (typeof coupon.uses === 'number' && coupon.uses > 0) {
        coupon.uses = coupon.uses - 1;
        const s = getSettings();
        const idx = s.coupons.findIndex(c => c.code === coupon.code);
        if (idx >= 0) { s.coupons[idx] = coupon; saveSettings(s); }
      }

      saveUserSpecificData('activeCoupon', { code: coupon.code, type: coupon.type, multiplier: multiplier, expiresAt: expiresAt });
      // show UI
      renderApp(getLoggedInUser());
      showToast(`Kupon uygulandı: ${coupon.code} — ${multiplier}x tıklama ${durationSec}s boyunca.`, true);
      couponInput.value = '';
      return;
    }

    // Default: balance coupon (withdrawal)
    // assign to user
    saveUserSpecificData('appliedCoupon', coupon.code);
    // decrement uses only when coupon is actually consumed on withdrawal (existing flow),
    // but if you prefer to reserve uses upon apply, uncomment the block below.
    showToast(`Kupon ${coupon.code} uygulandı. +${coupon.percent}% bonus (çekimde).`, true);
  });

  // Admin coupon creation
  createCouponBtn.addEventListener('click', () => {
    const code = (couponCodeInput.value || '').trim();
    const percent = parseFloat(couponPercentInput.value) || 0;
    const uses = couponUsesInput.value ? parseInt(couponUsesInput.value, 10) : null;
    const type = (couponTypeInput.value || 'balance');
    const multiplier = couponMultiplierInput.value ? parseFloat(couponMultiplierInput.value) : 1;
    const durationSeconds = couponDurationInput.value ? parseInt(couponDurationInput.value, 10) : null;

    if (!code) {
      showToast('Kupon kodu girin.', false); return;
    }
    if (type === 'balance' && percent <= 0) {
      showToast('Bakiye bonusu için % değeri girin.', false); return;
    }
    if (type === 'click_bonus' && (!multiplier || multiplier <= 1 || !durationSeconds || durationSeconds <= 0)) {
      showToast('Tıklama bonusu için geçerli çarpan (>1) ve süre girin.', false); return;
    }

    const s = getSettings();
    if (s.coupons.find(c => c.code.toUpperCase() === code.toUpperCase())) {
      showToast('Aynı kod zaten mevcut.', false); return;
    }
    const cobj = {
      code: code.toUpperCase(),
      percent: percent,
      uses: uses === null ? null : uses,
      createdAt: new Date().toISOString(),
      type: type, // 'balance' veya 'click_bonus'
      multiplier: type === 'click_bonus' ? Number(multiplier) : 1,
      durationSeconds: type === 'click_bonus' ? Number(durationSeconds) : null
    };
    s.coupons.push(cobj);
    saveSettings(s);
    couponCodeInput.value = '';
    couponPercentInput.value = '';
    couponUsesInput.value = '';
    couponMultiplierInput.value = '2';
    couponDurationInput.value = '60';
    renderCouponsList();
    showToast(`Kupon ${cobj.code} oluşturuldu.`, true);
  });

  function renderCouponsList() {
    const s = getSettings();
    if (!s.coupons || s.coupons.length === 0) {
      couponList.innerHTML = '<div style="color:var(--text-muted)">Kupon yok.</div>';
      return;
    }
    let out = '<ul style="padding-left:18px; margin:0;">';
    s.coupons.forEach((c, idx) => {
      let info = '';
      if (c.type === 'balance') {
        info = `+${c.percent}% (çekim)`;
      } else if (c.type === 'click_bonus') {
        info = `${c.multiplier}x tıklama — ${c.durationSeconds || 0}s`;
      }
      out += `<li style="margin-bottom:6px;">${c.code} — ${info} ${c.uses!==null?`— Kalan kullanım: ${c.uses}`:''} <button onclick="window.removeCoupon('${c.code}')" style="margin-left:8px; padding:6px; border-radius:6px; background:rgba(255,255,255,0.03); color:var(--text-muted); border:none;">Kaldır</button></li>`;
    });
    out += '</ul>';
    couponList.innerHTML = out;
  }

  window.removeCoupon = (code) => {
    const s = getSettings();
    s.coupons = s.coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    saveSettings(s);
    renderCouponsList();
    showToast(`${code} kuponu kaldırıldı.`, true);
  };

  // ######################################################################
  // ########################### DUYURU PANOSU İŞLEMLERİ ##################
  // ######################################################################

  function getAnnouncements() {
    const s = getSettings();
    return Array.isArray(s.announcements) ? s.announcements : [];
  }

  function saveAnnouncements(arr) {
    const s = getSettings();
    s.announcements = arr;
    saveSettings(s);
  }

  function createAnnouncement(title, message, durationSeconds, sticky) {
    if (!title || !message) return { ok:false, msg:'Başlık ve mesaj gerekli.' };
    const id = generateId('ann_');
    const createdAt = new Date().toISOString();
    const expiresAt = durationSeconds && durationSeconds > 0 ? Date.now() + durationSeconds*1000 : null;
    const ann = { id, title: title.trim(), message: message.trim(), createdAt, expiresAt, sticky: !!sticky, visible: true };
    const anns = getAnnouncements();
    anns.unshift(ann); // newest first
    saveAnnouncements(anns);
    return { ok:true, ann };
  }

  function removeAnnouncementById(id) {
    let anns = getAnnouncements();
    anns = anns.filter(a => a.id !== id);
    saveAnnouncements(anns);
  }

  function toggleAnnouncementVisibility(id) {
    const anns = getAnnouncements();
    const idx = anns.findIndex(a => a.id === id);
    if (idx === -1) return;
    anns[idx].visible = !anns[idx].visible;
    saveAnnouncements(anns);
  }

  function renderAdminAnnouncements() {
    const anns = getAnnouncements();
    if (!anns || anns.length === 0) {
      adminAnnouncementList.innerHTML = '<div style="color:var(--text-muted)">Henüz duyuru yok.</div>';
      return;
    }
    let out = '<ul style="padding-left:18px; margin:0;">';
    anns.forEach(a => {
      const expiresText = a.expiresAt ? ` — Son: ${new Date(a.expiresAt).toLocaleString()}` : '';
      out += `<li style="margin-bottom:8px;"><strong>${a.title}</strong> ${a.sticky?'<span style="background:var(--accent-primary); color:#021122; padding:2px 6px; border-radius:6px; margin-left:6px;">STICKY</span>':''}<br><span style="color:var(--text-muted); font-size:0.92rem;">${a.message}</span><br><small style="color:var(--text-muted)">${new Date(a.createdAt).toLocaleString()}${expiresText}</small><br><div style="margin-top:6px;"><button onclick="window.adminToggleAnnouncement('${a.id}')" style="padding:6px; border-radius:6px; background:${a.visible? 'var(--accent-danger)' : 'var(--accent-success)'}; color:#021122; border:none;">${a.visible? 'Gizle' : 'Yayımla'}</button> <button onclick="window.adminRemoveAnnouncement('${a.id}')" style="padding:6px; border-radius:6px; background:rgba(255,255,255,0.03); color:var(--text-muted); border:none; margin-left:6px;">Kaldır</button></div></li>`;
    });
    out += '</ul>';
    adminAnnouncementList.innerHTML = out;
  }

  // Expose admin actions to global for inline onclicks
  window.adminRemoveAnnouncement = (id) => {
    removeAnnouncementById(id);
    renderAdminAnnouncements();
    renderAnnouncementsInApp();
    showToast('Duyuru kaldırıldı.', true);
  };
  window.adminToggleAnnouncement = (id) => {
    toggleAnnouncementVisibility(id);
    renderAdminAnnouncements();
    renderAnnouncementsInApp();
    showToast('Duyuru durumu güncellendi.', true);
  };

  createAnnouncementBtn.addEventListener('click', () => {
    const title = announceTitleInput.value.trim();
    const msg = announceMsgInput.value.trim();
    const duration = announceExpiresInput.value ? parseInt(announceExpiresInput.value, 10) : null;
    const sticky = announceStickyInput.checked;
    if (!title || !msg) { showToast('Başlık ve mesaj girin.', false); return; }
    const res = createAnnouncement(title, msg, duration, sticky);
    if (!res.ok) { showToast(res.msg || 'Hata', false); return; }
    announceTitleInput.value = ''; announceMsgInput.value = ''; announceExpiresInput.value = ''; announceStickyInput.checked = false;
    renderAdminAnnouncements();
    renderAnnouncementsInApp();
    showToast('Duyuru oluşturuldu.', true);
  });

  // Announcement display logic for app users
  function renderAnnouncementsInApp() {
    const anns = getAnnouncements();
    if (!anns || anns.length === 0) {
      announcementBanner.style.display = 'none';
      return;
    }
    // find highest-priority announcement: sticky visible first, then newest visible and not expired
    const now = Date.now();
    const visible = anns.filter(a => a.visible && (!a.expiresAt || a.expiresAt > now)).sort((a,b) => {
      if (a.sticky === b.sticky) return new Date(b.createdAt) - new Date(a.createdAt);
      return a.sticky ? -1 : 1;
    });
    if (!visible || visible.length === 0) {
      announcementBanner.style.display = 'none';
      return;
    }
    const ann = visible[0];
    // check if user hid this announcement (per-user)
    const hideKey = `announcement_hidden_${ann.id}_${localUserKey()}`;
    if (localStorage.getItem(hideKey) === 'true') {
      announcementBanner.style.display = 'none';
      return;
    }
    announcementTitleText.textContent = ann.title;
    announcementMsgText.textContent = ann.message;
    announcementBanner.style.display = 'flex';
  }

  // helper to hide announcement per user
  closeAnnouncementBtn.addEventListener('click', () => {
    const anns = getAnnouncements();
    if (!anns || anns.length === 0) { announcementBanner.style.display = 'none'; return; }
    const now = Date.now();
    const visible = anns.filter(a => a.visible && (!a.expiresAt || a.expiresAt > now)).sort((a,b) => {
      if (a.sticky === b.sticky) return new Date(b.createdAt) - new Date(a.createdAt);
      return a.sticky ? -1 : 1;
    });
    if (!visible || visible.length === 0) { announcementBanner.style.display = 'none'; return; }
    const ann = visible[0];
    const hideKey = `announcement_hidden_${ann.id}_${localUserKey()}`;
    localStorage.setItem(hideKey, 'true');
    announcementBanner.style.display = 'none';
  });

  // if you want to clear hides on new announcements, consider implementing additional logic (not included)

  function localUserKey() {
    // returns identifier for current user or session: prefer username if logged in, otherwise device-local key
    const u = getLoggedInUser();
    if (u && u.username) return u.username;
    // fallback to device id
    let deviceId = localStorage.getItem('bio_device_id_v1');
    if (!deviceId) {
      deviceId = 'dev_' + generateId();
      localStorage.setItem('bio_device_id_v1', deviceId);
    }
    return deviceId;
  }

  // ######################################################################
  // ########################### BAKIM MODU İŞLEMLERİ #####################
  // ######################################################################

  enableMaintenanceBtn.addEventListener('click', () => {
    const reason = (maintenanceReasonInput.value || '').trim();
    if (!reason) {
      showToast('Lütfen bakım nedeni girin.', false);
      return;
    }
    const s = getSettings();
    s.maintenance = { enabled: true, reason: reason, since: new Date().toISOString() };
    saveSettings(s);
    maintBannerHidden = false;
    updateMaintenanceUI();
    render(); // re-evaluate buttons
    showToast('Bakım etkinleştirildi. Kullanıcı işlemleri kapatıldı.', true);
  });

  disableMaintenanceBtn.addEventListener('click', () => {
    const s = getSettings();
    s.maintenance = { enabled: false, reason: '', since: null };
    saveSettings(s);
    updateMaintenanceUI();
    render();
    showToast('Bakım devre dışı bırakıldı. Kullanıcı işlemleri tekrar aktif.', true);
  });

  // ######################################################################
  // ########################### GÜNLÜK LİMİT YÖNETİMİ ####################
  // ######################################################################

  function todayDateKey() {
    return new Date().toISOString().slice(0,10); // YYYY-MM-DD
  }

  function ensureDailyFields(user) {
    if (!user) return;
    if (!user.dailyDate) user.dailyDate = todayDateKey();
    if (typeof user.dailyClicks !== 'number') user.dailyClicks = 0;
    if (typeof user.dailyEarnings !== 'number') user.dailyEarnings = 0;
    // premium alanı yoksa default false
    if (typeof user.premium !== 'boolean') user.premium = false;
  }

  function resetDailyIfNeeded(user) {
    if (!user) return;
    const users = getUsers();
    ensureDailyFields(user);
    const today = todayDateKey();
    if (user.dailyDate !== today) {
      user.dailyDate = today;
      user.dailyClicks = 0;
      user.dailyEarnings = 0;
      users[user.username] = user;
      saveUsers(users);
    }
  }

  // Settings save handler
  saveSettingsBtn.addEventListener('click', () => {
    const s = getSettings();
    s.dailyClickLimit = parseInt(settingDailyClick.value, 10) || DEFAULT_DAILY_CLICK_LIMIT;
    s.dailyEarningsLimit = parseFloat(settingDailyEarn.value) || DEFAULT_DAILY_EARNINGS_LIMIT;
    s.minWithdrawalAmount = parseFloat(settingMinWithdraw.value) || DEFAULT_MIN_WITHDRAWAL;
    saveSettings(s);
    showToast('Ayarlar kaydedildi.', true);
    renderAdminPanel();
    render(); // update user-side buttons if admin is not in panel
  });

  // ######################################################################
  // ########################### LEADERBOARD ##############################
  // ######################################################################
  function renderLeaderboard(limit = 10) {
    const users = Object.values(getUsers());
    if (!users.length) {
      leaderboardList.innerHTML = '<li style="color:var(--text-muted)">Kayıtlı kullanıcı yok.</li>';
      return;
    }
    users.sort((a,b) => b.balance - a.balance);
    const top = users.slice(0, limit);
    leaderboardList.innerHTML = top.map(u => `<li style="margin-bottom:6px;"><strong>${u.username}</strong> — ${formatMoney(u.balance)} ${u.premium?'<span style="color:#FFD400; padding:2px 6px; border-radius:6px; margin-left:8px;">PREMIUM</span>':''}</li>`).join('');
  }

  // ######################################################################
  // ########################### YARDIMCILAR (KUPOUN/TIME COUPON) ########
  // ######################################################################

  function clearExpiredUserCoupon(user) {
    if (!user || !user.activeCoupon) return;
    if (user.activeCoupon.expiresAt && user.activeCoupon.expiresAt <= Date.now()) {
      // expired -> clear
      saveUserSpecificData('activeCoupon', null);
    }
  }

  // ######################################################################
  // ########################### KOD YÜKLEME SONU #########################
  // ######################################################################

  // Ensure announcements re-render on resize (mobile orientation changes)
  window.addEventListener('resize', () => {
    try { renderAnnouncementsInApp(); } catch (e) { /* ignore */ }
  });

  // İlk yükleme: Uygulama durumunu kontrol et ve doğru görünüme geç
  renderCouponsList();
  updateMaintenanceUI();
  renderAdminAnnouncements();
  renderAnnouncementsInApp();
  navigate();
})();