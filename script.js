// ==========================================
// LOGIQUE GLOBALE DU SITE GOEON
// ==========================================

// 1. ASPIRATION DE LA BARRE DE NAVIGATION CENTRALISÉE
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    // Insère la barre de navigation dans la boîte HTML prévue
    document.getElementById('nav-placeholder').innerHTML = data;
    
    // ÉTAPES SUIVANTES (Une fois que la barre de navigation est bien chargée)
    gererPageActive();
    gererMenuMobile();
    gererModeSombre();
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
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (mobileMenu && navLinksContainer) {
    // Ouverture/Fermeture du menu burger global
    mobileMenu.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });
  }

  // GESTION DU CLIC SUR LES MENUS DÉROULANTS (Surtout pour Mobile)
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        // Si on est sur un écran mobile (largeur < 768px)
        if (window.innerWidth <= 768) {
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
function gererModeSombre() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  if (toggleBtn) {
    // Vérifie si l'utilisateur avait déjà activé le mode sombre lors d'une visite précédente
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      toggleBtn.innerHTML = '☀️<span class="theme-text">Mode Clair</span>';
      toggleBtn.title = "Activer le mode clair";
    }

    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      
      if (document.body.classList.contains('dark-mode')) {
        toggleBtn.innerHTML = '☀️<span class="theme-text">Mode Clair</span>';
        toggleBtn.title = "Activer le mode clair";
        localStorage.setItem('theme', 'dark');
      } else {
        toggleBtn.innerHTML = '🌙<span class="theme-text">Mode Sombre</span>';
        toggleBtn.title = "Activer le mode sombre";
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

// CLIC SUR L'ÉMOJI SHINY -> DÉCLENCHE LE CLIC SUR L'IMAGE POKÉMON
document.querySelectorAll('.emoji-shiny').forEach(emoji => {
  emoji.addEventListener('click', (e) => {
    // On trouve l'image du Pokémon située dans la même boîte
    const cardImg = emoji.closest('.image-container').querySelector('.pokemon-img');
    if (cardImg) {
      cardImg.click(); // Déclenche virtuellement le Johann-effect !
    }
  });
});