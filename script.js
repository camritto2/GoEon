// ==========================================
// LOGIQUE GLOBALE DU SITE GOEON
// ==========================================

// 1. ASPIRATION DE LA BARRE DE NAVIGATION CENTRALISÉE
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
    
    // Ajouter l'icône après le texte GoEon
    setTimeout(() => {
      const logo = document.querySelector('.nav-logo');
      if (logo) {
        const icon = document.createElement('img');
        icon.src = 'images/Icone.png';
        icon.alt = 'GoEon';
        icon.style.cssText = 'width:46px; height:46px; object-fit:contain; vertical-align:middle; margin-left:-2px;';
        logo.appendChild(icon);
      }
    }, 50);

    gererPageActive();
    gererMenuMobile();
    gererModeSombre();
    gererDropdowns();
    initJohannEffect();
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
      navLinksContainer.classList.toggle('active');
      menuToggleBtn.classList.toggle('open');
    });
  }

  // GESTION DU CLIC SUR LES MENUS DÉROULANTS (Surtout pour Mobile)
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a');
    
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        // Si on est sur un écran mobile (largeur < 768px)
        if (window.innerWidth <= 960) {
          e.preventDefault(); // Empêche de recharger la page ou de suivre un lien vide
          
          // Ferme les autres dropdowns ouverts pour faire propre
          dropdowns.forEach(other => {
            if (other !== dropdown) other.classList.remove('open');
          });

          // Alterne l'ouverture du dropdown cliqué
          dropdown.classList.toggle('open');
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
      const container = emoji.closest('.image-container');
      if (container) {
        const cardImg = container.querySelector('.pokemon-img');
        if (cardImg) {
          cardImg.click(); 
        }
      }
    });
  });
}


// 6. FERME LE MENU BURGER AUTOMATIQUEMENT AU SCROLL
window.addEventListener('scroll', () => {
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    if (menuToggle) {
      menuToggle.classList.remove('open'); 
    }
  }
});

// 7. GESTION DES DROPDOWNS AU CLIC (mobile uniquement)
function gererDropdowns() {
  // Fermer les dropdowns en cliquant ailleurs (mobile uniquement)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 960) return;
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
}


// 7. (Bouton thème mobile géré dans gererModeSombre())

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.log('SW error:', err));
  });
}

// 8. BOUTON "SIGNALER UNE ERREUR"
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