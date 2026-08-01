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
// Met à jour icônes (Noctali/Mentali), textes et titres des 2 boutons thème
function appliquerAffichageTheme(sombre) {
  const icone = sombre ? 'images/Mentali_icon.png' : 'images/Noctali_icon.png';
  const libelle = sombre ? 'Mode Clair' : 'Mode Sombre';

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.title = sombre ? "Activer le mode clair" : "Activer le mode sombre";
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.src = icone;
    const text = toggleBtn.querySelector('.theme-text');
    if (text) text.textContent = libelle;
  }

  const themeIconMobile = document.getElementById('theme-icon-mobile');
  const themeTextMobile = document.querySelector('.theme-text-mobile');
  if (themeIconMobile) themeIconMobile.src = icone;
  if (themeTextMobile) themeTextMobile.textContent = libelle;
}

function basculerTheme() {
  const sombre = document.body.classList.toggle('dark-mode');
  appliquerAffichageTheme(sombre);
  localStorage.setItem('theme', sombre ? 'dark' : 'light');
}

function gererModeSombre() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    appliquerAffichageTheme(true);
  }

  const toggleBtn = document.getElementById('theme-toggle');
  const toggleMobile = document.getElementById('theme-toggle-mobile');

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
    imm.style.color = 'var(--text-muet)';
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
  // (le style vit dans navbar.css, chargée sur toutes les pages)
  let tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'coming-soon-tooltip';
    tooltip.className = 'coming-soon-tooltip';
    tooltip.textContent = 'Disponible prochainement !';
    document.body.appendChild(tooltip);
  }

  document.querySelectorAll('.dropdown-menu a[href="#"], a.lien-a-venir').forEach(lien => {
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      // Pas de tooltip pour les entrées informatives ("Aucun évènement annoncé")
      if (lien.textContent.trim().startsWith('Aucun')) return;
      afficherComingSoon(e, 20);
    });
  });
}

// 11 bis. AFFICHAGE DU TOOLTIP "DISPONIBLE PROCHAINEMENT"
// decalageY : 20 sous le curseur (navbar), -45 au-dessus (cartes de l'accueil)
function afficherComingSoon(e, decalageY) {
  const tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) return;

  // Repli si l'évènement n'a pas de coordonnées (activation au clavier)
  let x = e.pageX;
  let y = e.pageY;
  if (!x && !y && e.currentTarget && e.currentTarget.getBoundingClientRect) {
    const rect = e.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2 + window.scrollX;
    y = rect.top + rect.height / 2 + window.scrollY;
  }

  const marge = 8;
  const largeurTooltip = tooltip.offsetWidth;
  const maxGauche = document.documentElement.clientWidth - largeurTooltip - marge;
  let gauche = x - largeurTooltip / 2;
  gauche = Math.max(marge, Math.min(gauche, maxGauche + window.scrollX));
  tooltip.style.left = gauche + 'px';
  tooltip.style.top = (y + decalageY) + 'px';
  tooltip.classList.add('visible');
  clearTimeout(tooltip.timerComingSoon);
  tooltip.timerComingSoon = setTimeout(() => tooltip.classList.remove('visible'), 1800);
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
  btn.innerHTML = '<span class="signaler-texte">⚠️ Signaler une erreur</span>';
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

  // Masquage sur mobile via media query
  const style = document.createElement('style');
  style.textContent = `
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
    { nom: 'Roche',    icone: 'roche',    page: 'TopRoche.html' },
    { nom: 'Sol',      icone: 'sol',      page: 'TopSol.html' },
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

// 15. PAGE D'ACCUEIL (index.html)
function switchTab(os, btn) {
  document.getElementById('pwa-android').classList.toggle('active', os === 'android');
  document.getElementById('pwa-ios').classList.toggle('active', os === 'ios');
  document.querySelectorAll('.pwa-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function showComingSoon(e) {
  e.preventDefault();
  afficherComingSoon(e, -45);
}

// 16. PAGE OPTIPM (OptiPM.html)
// Menu déroulant des PM du Passe du mois + recalcul du tableau.
// Ne s'exécute que si la page contient le menu.
var PM_STOCK_MAX_J2 = 710;   // au-delà, le plafond de 1500 bloque la marche du Jour J
var PM_STOCK_MIN_J2 = 380;   // en dessous, taper une Source la vide d'office et bouleverse l'ordre
var PM_COUT_COMBAT  = 800;   // coût d'un Combat Gigamax
var PM_PASSE_MAX    = 2500;  // Passe payant : 3 × (100 + 400) au rangs 19/49/74, + (200 + 800) au rang 86
var PM_PASSE_PAS    = 100;

function pmLignes() {
  return Array.prototype.slice.call(document.querySelectorAll('.pm-timeline tr[data-delta]'));
}

function pmPasse() {
  return parseInt(document.getElementById('pm-passe').value, 10) || 0;
}

function pmDelta(ligne, passe) {
  return ligne.dataset.role === 'passe' ? passe : parseInt(ligne.dataset.delta, 10);
}

// 1160 → « 1 160 » (espace insécable)
function pmFormat(nombre) {
  return String(nombre).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// Revenus de la séquence hors Passe du mois (3 620 PM)
function pmRevenusFixes() {
  var total = 0;
  pmLignes().forEach(function (ligne) {
    var delta = parseInt(ligne.dataset.delta, 10);
    if (ligne.dataset.role !== 'passe' && delta > 0) total += delta;
  });
  return total;
}

function pmNbCombats(passe) {
  var maximum = pmLignes().filter(function (ligne) {
    return parseInt(ligne.dataset.delta, 10) < 0;
  }).length;
  return Math.min(maximum, Math.floor((PM_STOCK_MAX_J2 + pmRevenusFixes() + passe) / PM_COUT_COMBAT));
}

// Stock à viser en fin de J-2, jamais sous le plancher
function pmDepart(passe) {
  return Math.max(PM_STOCK_MIN_J2, pmNbCombats(passe) * PM_COUT_COMBAT - pmRevenusFixes() - passe);
}

function remplitPmSelect() {
  var select = document.getElementById('pm-passe');
  var choisi = pmPasse();
  var html = '';

  for (var pm = 0; pm <= PM_PASSE_MAX; pm += PM_PASSE_PAS) {
    html += '<option value="' + pm + '"' + (pm === choisi ? ' selected' : '') + '>'
          + pmFormat(pm) + ' PM → ' + pmNbCombats(pm) + ' Combats</option>';
  }
  select.innerHTML = html;
}

function updatePmTable() {
  var passe     = pmPasse();
  var nbCombats = pmNbCombats(passe);
  var mini      = pmDepart(passe);
  var maxi      = PM_STOCK_MAX_J2;
  var combat    = 0;

  document.querySelectorAll('.pm-passe-montant').forEach(function (el) {
    el.textContent = pmFormat(passe);
  });

  pmLignes().forEach(function (ligne) {
    var cellule    = ligne.querySelector('td:last-child');
    var delta      = pmDelta(ligne, passe);
    var impossible = ligne.dataset.role === 'passe'
      ? passe === 0
      : delta < 0 && ++combat > nbCombats;

    ligne.classList.toggle('pm-struck', impossible);

    if (impossible) {
      cellule.textContent = '-';
      return;
    }

    mini += delta;
    maxi += delta;

    cellule.textContent = ligne.dataset.format === 'entre'
      ? 'Entre ' + pmFormat(mini) + ' et ' + pmFormat(maxi) + ' PM'
      : pmFormat(mini) + ' – ' + pmFormat(maxi) + ' PM';
  });
}

// Garde : la section 16 ne s'exécute que sur OptiPM.html
if (document.getElementById('pm-passe')) {
  remplitPmSelect();
  updatePmTable();
}
