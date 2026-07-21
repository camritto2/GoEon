// ==========================================
// LOGIQUE GLOBALE DU SITE GOEON
// ==========================================

// 1. ASPIRATION DE LA BARRE DE NAVIGATION CENTRALISÉE
fetch('navbar.html')
  .then(response => {
    if (!response.ok) throw new Error('navbar.html introuvable (HTTP ' + response.status + ')');
    return response.text();
  })
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
    
    // Ajouter l'icône après le texte GoEon
    // (innerHTML est synchrone : le logo existe immédiatement)
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      const icon = document.createElement('img');
      icon.src = 'images/Icone.png';
      icon.alt = 'GoEon';
      icon.style.cssText = 'width:46px; height:46px; object-fit:contain; vertical-align:middle; margin-left:-2px;';
      logo.appendChild(icon);
    }

    gererPageActive();
    gererMenuMobile();
    gererModeSombre();
    gererDropdowns();
    initJohannEffect();
    gererLiensMorts();
  })
  .catch(error => console.error("Erreur lors du chargement de la navbar :", error));


// 2. GESTION DE L'ONGLET ACTIF (ALLUMER EN JAUNE ÉQUILIBRÉ)
function gererPageActive() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinksList = document.querySelectorAll('.nav-links a');
  
  navLinksList.forEach(link => {
    const href = link.getAttribute('href');
    
    // 1. Si le lien direct correspond exactement à la page actuelle
    if (href === currentPage) {
      link.classList.add('active');
    }
    
    // 2. Si c'est un menu déroulant, on vérifie s'il contient la page actuelle
    const parentDropdown = link.closest('.dropdown');
    if (parentDropdown) {
      // On cherche si la page actuelle est listée dans le sous-menu de ce dropdown
      const subLink = parentDropdown.querySelector(`.dropdown-menu a[href="${currentPage}"]`);
      
      // Si on trouve le lien dans ce sous-menu, on allume le titre du dropdown parent
      if (subLink) {
        const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
          dropdownToggle.classList.add('active');
        }
      }
    }
  });
}


// 3. GESTION DU MENU MOBILE ET DES CLICS SUR LES DROPDOWNS
function gererMenuMobile() {
  const menuToggleBtn = document.querySelector('.menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (menuToggleBtn && navLinksContainer) {
    // Ouverture/Fermeture du menu burger global
    menuToggleBtn.addEventListener('click', () => {
      const ouvert = navLinksContainer.classList.toggle('active');
      menuToggleBtn.classList.toggle('open');
      menuToggleBtn.setAttribute('aria-expanded', ouvert);
    });
  }

  // GESTION DU CLIC SUR LES MENUS DÉROULANTS (Surtout pour Mobile)
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a');
    
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le saut en haut de page (le lien pointe vers #)

        // Navbar en mode mobile (breakpoint navbar : 960px, voir navbar.css)
        if (window.innerWidth <= 960) {
          // Ferme les autres dropdowns ouverts pour faire propre
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('open');
              const autreToggle = other.querySelector('.dropdown-toggle');
              if (autreToggle) autreToggle.setAttribute('aria-expanded', 'false');
            }
          });

          // Alterne l'ouverture du dropdown cliqué
          const ouvert = dropdown.classList.toggle('open');
          toggle.setAttribute('aria-expanded', ouvert);
        }
      });
    }
  });
}


// 4. LOGIQUE DU MODE SOMBRE
function basculerTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeIconMobile = document.getElementById('theme-icon-mobile');
  const themeTextMobile = document.querySelector('.theme-text-mobile');
  document.body.classList.toggle('dark-mode');
  
  if (document.body.classList.contains('dark-mode')) {
    if (toggleBtn) {
      toggleBtn.title = "Activer le mode clair";
      if (themeIcon) themeIcon.src = 'images/Mentali_icon.png';
      const text = toggleBtn.querySelector('.theme-text');
      if (text) text.textContent = 'Mode Clair';
    }
    if (themeIconMobile) themeIconMobile.src = 'images/Mentali_icon.png';
    if (themeTextMobile) themeTextMobile.textContent = 'Mode Clair';
    localStorage.setItem('theme', 'dark');
  } else {
    if (toggleBtn) {
      toggleBtn.title = "Activer le mode sombre";
      if (themeIcon) themeIcon.src = 'images/Noctali_icon.png';
      const text = toggleBtn.querySelector('.theme-text');
      if (text) text.textContent = 'Mode Sombre';
    }
    if (themeIconMobile) themeIconMobile.src = 'images/Noctali_icon.png';
    if (themeTextMobile) themeTextMobile.textContent = 'Mode Sombre';
    localStorage.setItem('theme', 'light');
  }
}

function gererModeSombre() {
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleMobile = document.getElementById('theme-toggle-mobile');

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (toggleBtn) {
      toggleBtn.title = "Activer le mode clair";
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.src = 'images/Mentali_icon.png';
      const text = toggleBtn.querySelector('.theme-text');
      if (text) text.textContent = 'Mode Clair';
    }
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    const themeTextMobile = document.querySelector('.theme-text-mobile');
    if (themeIconMobile) themeIconMobile.src = 'images/Mentali_icon.png';
    if (themeTextMobile) themeTextMobile.textContent = 'Mode Clair';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => { basculerTheme(); });
  }

  if (toggleMobile) {
    toggleMobile.addEventListener('click', () => { basculerTheme(); });
  }
}


// 5. CLIC SUR L'ÉMOJI SHINY -> DÉCLENCHE LE CLIC SUR L'IMAGE POKÉMON (JOHANN-EFFECT)
function initJohannEffect() {
  document.querySelectorAll('.emoji-shiny').forEach(emoji => {
    emoji.addEventListener('click', (e) => {
      // Niveau carte : couvre les badges dans l'image ET en coin de case (page Rocket)
      const carte = emoji.closest('.pokemon-card, .research-reward-item');
      if (carte) {
        const cardImg = carte.querySelector('.pokemon-img');
        if (cardImg) {
          cardImg.click(); 
        }
      }
    });
  });
}

// 6. BASCULE SHINY : CLIC SUR L'IMAGE -> VERSION CHROMATIQUE
// (centralisé ici — les pages ne doivent PLUS avoir leur propre copie de ce script)
function initShinyToggle() {
  document.querySelectorAll('.pokemon-img[data-shiny]').forEach(img => {
    if (img.dataset.shinyBound) return; // garde anti-double-liaison
    img.dataset.shinyBound = '1';
    const srcNormale = img.src;
    const srcShiny = img.getAttribute('data-shiny');
    img.addEventListener('click', () => {
      const carte = img.closest('.pokemon-card, .research-reward-item');
      const emoji = carte ? carte.querySelector('.emoji-shiny') : null;
      // Si le badge shiny est masqué (pokemon.css), le clic est désactivé
      if (emoji && window.getComputedStyle(emoji).display === 'none') return;
      const estNormale = new URL(img.src, window.location.href).pathname === new URL(srcNormale, window.location.href).pathname;
      img.src = estNormale ? srcShiny : srcNormale;
      img.classList.toggle('shiny-active', estNormale);
      if (emoji) emoji.classList.toggle('shiny-active', estNormale);
    });
  });
}
initShinyToggle();


// 7. BOUTONS DES PAGES TOP (builds alternatifs)
// (centralisé ici — les pages Top ne doivent PLUS avoir leur propre copie)
function toggleBuild(divId, btnId, targetSpanId = null, activeHtml = '', normalHtml = '') {
  const btn = document.getElementById(btnId);
  const div = document.getElementById(divId);
  const arrow = btn.querySelector('.arrow-indicator');
  const targetSpan = targetSpanId ? document.getElementById(targetSpanId) : null;
  const ouvert = !div.classList.contains('open');
  div.classList.toggle('open', ouvert);
  btn.classList.toggle('active', ouvert);      // les couleurs vivent dans top.css (.btn-X.active)
  btn.setAttribute('aria-expanded', ouvert);
  arrow.innerHTML = ouvert ? '\u25b2' : '\u25bc';
  if (targetSpan) targetSpan.innerHTML = ouvert ? activeHtml : normalHtml;
}

function toggleAltImm(immId, altId, iconId = null) {
  const imm = document.getElementById(immId);
  const alt = document.getElementById(altId);
  const icon = iconId ? document.getElementById(iconId) : null;
  const isOpen = alt.style.display !== 'none';
  if (!isOpen) {
    imm.style.textDecoration = 'line-through';
    imm.style.color = '#a0aec0';
    imm.style.fontWeight = 'normal';
    alt.style.display = 'inline';
    if (icon) icon.style.display = 'none';
  } else {
    imm.style.textDecoration = 'none';
    imm.style.color = '';
    imm.style.fontWeight = 'bold';
    alt.style.display = 'none';
    if (icon) icon.style.display = '';
  }
}

// 8. BANDEAUX REPLIABLES (accueil : PWA/légende — pages Top : intro)
function toggleBanner(btn, contentId, arrowId) {
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);
  content.classList.toggle('open');
  const isOpen = content.classList.contains('open');
  arrow.textContent = isOpen ? '▴' : '▾';
  btn.setAttribute('aria-expanded', isOpen);
}


// 9. FERME LE MENU BURGER AUTOMATIQUEMENT AU SCROLL
window.addEventListener('scroll', () => {
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    if (menuToggle) {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// 10. GESTION DES DROPDOWNS AU CLIC (mobile uniquement)
function gererDropdowns() {
  // Fermer les dropdowns en cliquant ailleurs (mobile uniquement)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 960) return;
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => {
        d.classList.remove('open');
        const toggle = d.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// 11. LIENS MORTS DE LA NAVBAR → TOOLTIP "DISPONIBLE PROCHAINEMENT"
function gererLiensMorts() {
  // Tooltip partagé : réutilise celui de la page s'il existe (index.html), sinon le crée
  let tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'coming-soon-tooltip';
    tooltip.className = 'coming-soon-tooltip';
    tooltip.textContent = 'Disponible prochainement !';
    document.body.appendChild(tooltip);

    const style = document.createElement('style');
    style.textContent = `
      .coming-soon-tooltip {
        position: absolute;
        background: #2a2a2a;
        color: #fff;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 9999;
        white-space: nowrap;
      }
      .coming-soon-tooltip.visible { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.dropdown-menu a[href="#"], a.lien-a-venir').forEach(lien => {
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      // Pas de tooltip pour les entrées informatives ("Aucun évènement annoncé")
      if (lien.textContent.trim().startsWith('Aucun')) return;

      const marge = 8;
      const largeurTooltip = tooltip.offsetWidth;
      const maxGauche = document.documentElement.clientWidth - largeurTooltip - marge;
      let gauche = e.pageX - largeurTooltip / 2;
      gauche = Math.max(marge, Math.min(gauche, maxGauche + window.scrollX));
      tooltip.style.left = gauche + 'px';
      tooltip.style.top = (e.pageY + 20) + 'px';
      tooltip.classList.add('visible');
      setTimeout(() => tooltip.classList.remove('visible'), 1800);
    });
  });
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.log('SW error:', err));
  });
}

// 12. BOUTON "SIGNALER UNE ERREUR"
(function() {
  const btn = document.createElement('a');
  btn.href = 'https://docs.google.com/forms/d/e/1FAIpQLScyUV3hPNevGP_1lsK5Abdi8KbKwwFN5XmGJHRHEAd_pDF7vA/viewform?usp=publish-editor';
  btn.target = '_blank';
  btn.id = 'btn-signaler';
  btn.innerHTML = '<span class="signaler-texte">⚠️ Signaler une erreur</span><span class="signaler-mini">⚠️</span>';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--bg-carte);
    color: var(--text-secondaire);
    border: 1px solid var(--border-carte);
    border-radius: 20px;
    padding: 8px 14px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: background 0.2s, transform 0.2s;
  `;

  // Style media query via feuille de style
  const style = document.createElement('style');
  style.textContent = `
    .signaler-mini { display: none; }
    @media (max-width: 960px) {
      #btn-signaler { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-2px)');
  btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0)');
  document.body.appendChild(btn);
})();

// 13. BOUTON "RETOUR EN HAUT"
(function() {
  const btn = document.createElement('button');
  btn.id = 'btn-retour-haut';
  btn.setAttribute('aria-label', 'Retour en haut de page');
  btn.title = 'Retour en haut';
  btn.textContent = '\u2191';

  const style = document.createElement('style');
  style.textContent = `
    #btn-retour-haut {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-carte);
      color: var(--text-secondaire);
      border: 1px solid var(--border-carte);
      font-size: 20px;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
    }
    #btn-retour-haut.visible { opacity: 1; pointer-events: auto; }
    #btn-retour-haut:hover { transform: translateY(-2px); }
    @media (min-width: 769px) {
      #btn-retour-haut { bottom: 70px; } /* au-dessus du bouton Signaler */
    }
  `;
  document.head.appendChild(style);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
})();

// 14. BARRE DE NAVIGATION DES TYPES (pages Top uniquement)
// Pour activer un nouveau type : remplacer null par le nom de la page
// (ex. page: 'TopGlace.html') — la barre se met à jour sur toutes les pages.
(function() {
  const conteneur = document.querySelector('.ranking-container');
  if (!conteneur) return; // pas une page Top
  const titre = conteneur.querySelector('h1');
  if (!titre) return;

  const TYPES_TOP = [
    { nom: 'Acier',    icone: 'acier',    page: 'TopAcier.html' },
    { nom: 'Combat',   icone: 'combat',   page: 'TopCombat.html' },
    { nom: 'Dragon',   icone: 'dragon',   page: 'TopDragon.html' },
    { nom: 'Eau',      icone: 'eau',      page: 'TopEau.html' },
    { nom: 'Électrik', icone: 'electrik', page: 'TopElectrik.html' },
    { nom: 'Fée',      icone: 'fee',      page: 'TopFee.html' },
    { nom: 'Feu',      icone: 'feu',      page: 'TopFeu.html' },
    { nom: 'Glace',    icone: 'glace',    page: 'TopGlace.html' },
    { nom: 'Insecte',  icone: 'insecte',  page: 'TopInsecte.html' },
    { nom: 'Plante',   icone: 'plante',   page: 'TopPlante.html' },
    { nom: 'Poison',   icone: 'poison',   page: 'TopPoison.html' },
    { nom: 'Psy',      icone: 'psy',      page: 'TopPsy.html' },
    { nom: 'Roche',    icone: 'roche',    page: null },
    { nom: 'Sol',      icone: 'sol',      page: null },
    { nom: 'Spectre',  icone: 'spectre',  page: null },
    { nom: 'Ténèbres', icone: 'tenebres', page: null },
    { nom: 'Vol',      icone: 'vol',      page: null }
  ];

  const pageActuelle = window.location.pathname.split('/').pop();
  const nav = document.createElement('nav');
  nav.className = 'type-nav';
  nav.setAttribute('aria-label', 'Navigation entre les classements par type');

  TYPES_TOP.forEach(t => {
    const lien = document.createElement('a');
    lien.className = 'type-nav-item';
    if (t.page) {
      lien.href = t.page;
      lien.title = t.nom;
      if (t.page === pageActuelle) {
        lien.classList.add('type-nav-current');
        lien.setAttribute('aria-current', 'page');
      }
    } else {
      lien.href = '#';
      lien.title = t.nom + ' — à venir';
      lien.classList.add('type-nav-disabled', 'lien-a-venir'); // tooltip "Disponible prochainement"
    }
    const img = document.createElement('img');
    img.src = 'images/' + t.icone + '.webp';
    img.alt = t.nom;
    lien.appendChild(img);
    nav.appendChild(lien);
  });

  titre.insertAdjacentElement('afterend', nav);
})();
