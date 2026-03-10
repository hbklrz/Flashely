/* ═══════════════════════════════════════════
   Flashely Framework v3.0
   ═══════════════════════════════════════════ */
(function(F) {
  'use strict';

  // ── Server Context ─────────────────────────────────────────────
  F.getServer = function() {
    try { return JSON.parse(sessionStorage.getItem('fl_server') || 'null'); } catch(e) { return null; }
  };
  F.setServer = function(srv) {
    sessionStorage.setItem('fl_server', JSON.stringify(srv));
  };
  F.requireServer = function() {
    const s = F.getServer();
    if (!s || !s.name) { window.location.href = '/dashboard'; return null; }
    return s;
  };

  // ── Theme ───────────────────────────────────────────────────────
  F.theme = localStorage.getItem('fl_theme') || 'dark';
  F.applyTheme = function(t) {
    F.theme = t;
    localStorage.setItem('fl_theme', t);
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : '');
  };
  F.applyTheme(F.theme);

  // ── API helper ──────────────────────────────────────────────────
  F.api = async function(url, opts = {}) {
    try {
      const cfg = {
        method: opts.method || 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      };
      if (opts.body && typeof opts.body === 'object') cfg.body = JSON.stringify(opts.body);
      const res = await fetch(url, cfg);
      const text = await res.text();
      try { return JSON.parse(text); }
      catch(e) { return { Success: false, Message: 'Server returned non-JSON: ' + text.slice(0,100) }; }
    } catch(e) {
      return { Success: false, Message: e.message };
    }
  };

  // ── Toast ───────────────────────────────────────────────────────
  let toastRoot;
  const ICONS = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };
  F.toast = function(msg, type = 'info', ms = 3500) {
    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.className = 'toast-root';
      document.body.appendChild(toastRoot);
    }
    const el = document.createElement('div');
    el.className = `toast t-${type === 'success' ? 'ok' : type === 'error' ? 'err' : type === 'warning' ? 'warn' : 'info'}`;
    el.innerHTML = `<span class="toast-ico">${ICONS[type === 'success' ? 'ok' : type === 'error' ? 'err' : type === 'warning' ? 'warn' : 'info']}</span><span>${msg}</span>`;
    toastRoot.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, ms);
  };

  // ── Confirm dialog ──────────────────────────────────────────────
  F.confirm = function(title, msg, btnTxt = 'Confirm', danger = false) {
    return new Promise(res => {
      if (window.Swal) {
        Swal.fire({
          title, text: msg,
          icon: danger ? 'warning' : 'question',
          showCancelButton: true,
          confirmButtonText: btnTxt,
          confirmButtonColor: danger ? '#F87171' : '#818CF8',
          background: 'var(--s2)', color: 'var(--fg)',
        }).then(r => res(r.isConfirmed));
      } else {
        res(window.confirm(`${title}\n${msg}`));
      }
    });
  };

  // ── Format helpers ──────────────────────────────────────────────
  F.bytes = function(n) {
    if (!n) return '0 B';
    const u = ['B','KB','MB','GB','TB'], i = Math.floor(Math.log(n) / Math.log(1024));
    return (n / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + u[i];
  };
  F.uptime = function(secs) {
    if (!secs) return '0s';
    const d = Math.floor(secs/86400), h = Math.floor((secs%86400)/3600), m = Math.floor((secs%3600)/60), s = secs%60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };
  F.ago = function(ts) {
    if (!ts) return '—';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };
  F.statusBadge = function(st) {
    const map = {
      online:  ['b-on', 'Online'],
      running: ['b-on', 'Running'],
      offline: ['b-off', 'Offline'],
      stopped: ['b-off', 'Stopped'],
      errored: ['b-off', 'Errored'],
      starting:['b-start','Starting'],
      stopping:['b-idle', 'Stopping'],
    };
    const [cls, lbl] = map[st] || ['b-idle', st || 'Unknown'];
    return `<span class="badge ${cls}">${lbl}</span>`;
  };
  F.barColor = function(pct) {
    return pct > 85 ? 'err' : pct > 60 ? 'warn' : 'ok';
  };

  // ── Sidebar nav definition ──────────────────────────────────────
  const SVG = {
    term: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
    log:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    start:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    db:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    net:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-4h14v4M12 8v4"/></svg>',
    bk:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    env:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="15" r="5"/><path d="M15.09 10.72L21 4.81"/><line x1="18" y1="7.5" x2="19.5" y2="6"/></svg>',
    set:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    out:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  };
  F.SVG = SVG;

  const NAV_ITEMS = [
    { id: 'console',  label: 'Console',     icon: 'term',  href: '/console',     sect: 'Server' },
    { id: 'files',    label: 'Files',       icon: 'file',  href: '/files',       sect: null },
    { id: 'logs',     label: 'Logs',        icon: 'log',   href: '/logs',        sect: null },
    { id: 'startup',  label: 'Startup',     icon: 'start', href: '/startup',     sect: null },
    { id: 'database', label: 'Database',    icon: 'db',    href: '/database',    sect: 'Data' },
    { id: 'environment', label: 'Environment', icon: 'env', href: '/environment', sect: null },
    { id: 'stats',    label: 'Statistics',  icon: 'stats', href: '/stats',       sect: 'Monitor' },
    { id: 'domains',  label: 'Domains',     icon: 'net',   href: '/domains',     sect: null },
    { id: 'backups',  label: 'Backups',     icon: 'bk',    href: '/backups',     sect: null },
    { id: 'settings-server', label: 'Settings', icon: 'set', href: '/settings-server', sect: 'Manage' },
  ];

  // ── Build sidebar (desktop/tablet) ─────────────────────────────
  F.buildSidebar = function(pageId) {
    const aside = document.getElementById('aside');
    if (!aside) return;

    const srv = F.getServer();
    let lastSect = null;
    let html = '';

    // Server name at top
    if (srv) {
      html += `<div class="nav-sect">${srv.name}</div>`;
      lastSect = 'server';
    }

    NAV_ITEMS.forEach(item => {
      if (item.sect && item.sect !== lastSect) {
        lastSect = item.sect;
        html += `<div class="nav-sect">${item.sect}</div>`;
      }
      const act = item.id === pageId ? ' act' : '';
      html += `<div class="nav-item${act}" data-tip="${item.label}" onclick="window.location.href='${item.href}'">`
        + `<div class="nav-ico">${SVG[item.icon]}</div>`
        + `<div class="nav-lbl">${item.label}</div>`
        + `</div>`;
    });

    // Back to dashboard
    html += `<div class="nav-sect" style="margin-top:auto"></div>`;
    html += `<div class="nav-item" data-tip="Dashboard" onclick="window.location.href='/dashboard'">`
      + `<div class="nav-ico">${SVG.dash}</div><div class="nav-lbl">Dashboard</div></div>`;

    document.getElementById('aside-nav').innerHTML = html;

    // Toggle collapse
    const toggle = document.getElementById('aside-toggle');
    if (toggle) {
      toggle.onclick = () => {
        aside.classList.toggle('sm');
        localStorage.setItem('fl_aside', aside.classList.contains('sm') ? 'sm' : '');
      };
      if (localStorage.getItem('fl_aside') === 'sm') aside.classList.add('sm');
    }
  };

  // ── Build bottom nav (mobile) ───────────────────────────────────
  F.buildBnav = function(pageId) {
    const bnav = document.getElementById('bnav');
    if (!bnav) return;
    const BNAV = [
      { id:'console', icon:'term',  label:'Console', href:'/console' },
      { id:'files',   icon:'file',  label:'Files',   href:'/files'   },
      { id:'__mid__', icon:'',      label:'',        href:''         },
      { id:'stats',   icon:'stats', label:'Stats',   href:'/stats'   },
      { id:'settings-server', icon:'set', label:'Settings', href:'/settings-server' },
    ];
    let html = '<div class="bnav-row">';
    BNAV.forEach(b => {
      if (b.id === '__mid__') {
        html += `<div class="bn-mid" id="bn-menu-btn"><div class="bn-mid-ico">${SVG.dash}</div></div>`;
      } else {
        const act = b.id === pageId ? ' act' : '';
        html += `<div class="bn-item${act}" onclick="window.location.href='${b.href}'">`
          + `<div class="bnav-pill"></div>${SVG[b.icon]}<span>${b.label}</span></div>`;
      }
    });
    html += '</div>';
    bnav.innerHTML = html;

    document.getElementById('bn-menu-btn')?.addEventListener('click', F.openDrawer);
  };

  // ── Drawer (mobile full nav) ────────────────────────────────────
  F.openDrawer = function() {
    document.getElementById('drawer-bg')?.classList.add('open');
    document.getElementById('drawer')?.classList.add('open');
  };
  F.closeDrawer = function() {
    document.getElementById('drawer-bg')?.classList.remove('open');
    document.getElementById('drawer')?.classList.remove('open');
  };

  F.buildDrawer = function(pageId) {
    const drawer = document.getElementById('drawer');
    if (!drawer) return;
    const srv = F.getServer();

    let statusClass = 'b-off', dot = '#F87171';
    if (srv) {
      if (srv.status === 'online' || srv.status === 'running') { dot = '#34D399'; }
      else if (srv.status === 'starting') { dot = '#60A5FA'; }
    }

    let html = `<div class="drawer-head">
      <div class="drawer-srv-dot" style="background:${dot}"></div>
      <div><div class="drawer-srv-name">${srv ? srv.name : 'No server'}</div>
      <div class="drawer-srv-status muted text-xs">${srv ? (srv.status || 'unknown') : 'Select from dashboard'}</div></div>
      <button class="btn bg btn-ico btn-sm ml-a" onclick="Flashely.closeDrawer()">${SVG.out.replace('polyline points="16 17 21 12 16 7"','polyline points="18 6 6 6"').replace('line x1="21"','line x1="18"')}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div><div class="drawer-items">`;

    let lastSect = null;
    NAV_ITEMS.forEach(item => {
      if (item.sect && item.sect !== lastSect) {
        lastSect = item.sect;
        html += `<div class="di-sect">${item.sect}</div>`;
      }
      const act = item.id === pageId ? ' act' : '';
      html += `<div class="di-item${act}" onclick="window.location.href='${item.href}';Flashely.closeDrawer()">`
        + SVG[item.icon] + `<span>${item.label}</span></div>`;
    });

    html += `</div>
    <div class="drawer-back" onclick="window.location.href='/dashboard';Flashely.closeDrawer()">
      ${SVG.dash}<span>Back to Dashboard</span>
    </div>`;

    drawer.innerHTML = html;
    document.getElementById('drawer-bg')?.addEventListener('click', F.closeDrawer);
  };

  // ── Server context bar ──────────────────────────────────────────
  F.buildCtxBar = function() {
    const bar = document.getElementById('ctx-bar');
    if (!bar) return;
    const srv = F.getServer();
    if (!srv) { bar.style.display = 'none'; return; }
    let dotCls = srv.status === 'online' || srv.status === 'running' ? 'ok'
      : srv.status === 'starting' ? 'inf' : 'err';
    bar.innerHTML = `<div class="ctx-dot" style="background:var(--${dotCls})"></div>
      <div class="ctx-name">${srv.name}</div>
      <div class="ctx-info">${srv.status || 'unknown'} · ${F.uptime(srv.uptime || 0)}</div>
      <div class="ml-a row gap-2" id="ctx-quick"></div>`;
  };

  // ── WebSocket live stats ────────────────────────────────────────
  F._ws = null;
  F._wsListeners = [];
  F.onStats = function(fn) { F._wsListeners.push(fn); };
  F.connectWS = function() {
    if (F._ws && F._ws.readyState < 2) return;
    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      F._ws = new WebSocket(`${proto}://${location.host}`);
      F._ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d.type === 'stats') F._wsListeners.forEach(fn => fn(d));
        } catch(e) {}
      };
      F._ws.onerror = () => {};
      F._ws.onclose = () => setTimeout(F.connectWS, 3000);
    } catch(e) {}
  };

  // ── Init ────────────────────────────────────────────────────────
  F.init = function(pageId) {
    F.buildSidebar(pageId);
    F.buildBnav(pageId);
    F.buildDrawer(pageId);
    F.buildCtxBar();
    F.connectWS();
    // Topbar title
    const ttl = document.getElementById('tb-title');
    if (ttl) {
      const item = NAV_ITEMS.find(i => i.id === pageId);
      ttl.textContent = item ? item.label : pageId;
    }
    // Theme toggle
    document.getElementById('theme-btn')?.addEventListener('click', () => {
      F.applyTheme(F.theme === 'dark' ? 'light' : 'dark');
    });
  };

  window.Flashely = F;
})(window.Flashely = {});
