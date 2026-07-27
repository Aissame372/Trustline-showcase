(function () {
  "use strict";
  var reduitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal au scroll (sections entieres + enfants a cascade via --d)
  var elements = document.querySelectorAll(".reveal, .reveal-item");
  if (reduitMotion || !("IntersectionObserver" in window)) {
    elements.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          observateur.unobserve(entree.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach(function (el) { observateur.observe(el); });
  }

  // Barre de progression de lecture (fil qui se remplit avec le scroll)
  var filLecture = document.getElementById("fil-lecture");
  if (filLecture) {
    var majProgression = function () {
      var hauteurTotale = document.documentElement.scrollHeight - window.innerHeight;
      var progres = hauteurTotale > 0 ? Math.min(1, window.scrollY / hauteurTotale) : 0;
      filLecture.style.transform = "scaleX(" + progres + ")";
    };
    document.addEventListener("scroll", function () { requestAnimationFrame(majProgression); }, { passive: true });
    majProgression();
  }

  // Jauge de score : anime au premier passage en vue
  var jauge = document.getElementById("jauge");
  if (jauge) {
    if (reduitMotion) {
      jauge.classList.add("visible");
    } else if ("IntersectionObserver" in window) {
      var obsJauge = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add("visible");
            obsJauge.unobserve(entree.target);
          }
        });
      }, { threshold: 0.5 });
      obsJauge.observe(jauge);
    } else {
      jauge.classList.add("visible");
    }
  }

  // Reseau ambiant en fond du hero : orbes de profondeur (lents) + reseau de
  // noeuds (existant) + balayage periodique evoquant une verification de
  // handshake. En pause complete si prefers-reduced-motion.
  var canvas = document.getElementById("reseau");
  if (canvas && !reduitMotion) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var noeuds = [];
    var orbes = [];
    var NB_NOEUDS = 32;
    var DISTANCE_LIEN = 130;
    var debut = performance.now();
    var supporteFiltre = (function () { try { return "filter" in ctx; } catch (e) { return false; } })();

    function dimensionner() {
      // Le canvas deborde volontairement du hero (voir CSS, inset negatif) :
      // la marge absorbe le decalage de la parallaxe sans jamais montrer de bord.
      canvas.width = hero.offsetWidth * 1.10;
      canvas.height = hero.offsetHeight * 1.20;
    }
    function initCouches() {
      noeuds = [];
      for (var i = 0; i < NB_NOEUDS; i++) {
        noeuds.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15
        });
      }
      orbes = [];
      for (var j = 0; j < 3; j++) {
        orbes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          rayon: 140 + Math.random() * 90,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05
        });
      }
    }
    function dessinerOrbes() {
      for (var o = 0; o < orbes.length; o++) {
        var orbe = orbes[o];
        orbe.x += orbe.vx; orbe.y += orbe.vy;
        if (orbe.x < -orbe.rayon || orbe.x > canvas.width + orbe.rayon) orbe.vx *= -1;
        if (orbe.y < -orbe.rayon || orbe.y > canvas.height + orbe.rayon) orbe.vy *= -1;
        var degrade = ctx.createRadialGradient(orbe.x, orbe.y, 0, orbe.x, orbe.y, orbe.rayon);
        degrade.addColorStop(0, "rgba(176,141,87,0.10)");
        degrade.addColorStop(1, "rgba(176,141,87,0)");
        ctx.fillStyle = degrade;
        ctx.beginPath();
        ctx.arc(orbe.x, orbe.y, orbe.rayon, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function dessinerBalayage(t) {
      var CYCLE = 7000;
      var phase = (t % CYCLE) / CYCLE;
      if (phase > 0.4) return; // le balayage n'occupe qu'une portion du cycle
      var intensite = Math.sin((phase / 0.4) * Math.PI);
      var x = phase / 0.4 * (canvas.width + 240) - 120;
      var degrade = ctx.createLinearGradient(x - 60, 0, x + 60, 0);
      degrade.addColorStop(0, "rgba(201,166,113,0)");
      degrade.addColorStop(0.5, "rgba(201,166,113," + (0.06 * intensite) + ")");
      degrade.addColorStop(1, "rgba(201,166,113,0)");
      ctx.fillStyle = degrade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function dessiner(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (supporteFiltre) { ctx.filter = "blur(18px)"; dessinerOrbes(); ctx.filter = "none"; }
      else { dessinerOrbes(); }

      for (var i = 0; i < noeuds.length; i++) {
        var n = noeuds[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }
      for (var a = 0; a < noeuds.length; a++) {
        for (var b = a + 1; b < noeuds.length; b++) {
          var dx = noeuds[a].x - noeuds[b].x, dy = noeuds[a].y - noeuds[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < DISTANCE_LIEN) {
            ctx.strokeStyle = "rgba(176,141,87," + (0.14 * (1 - dist / DISTANCE_LIEN)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(noeuds[a].x, noeuds[a].y);
            ctx.lineTo(noeuds[b].x, noeuds[b].y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(201,166,113,0.55)";
        ctx.beginPath();
        ctx.arc(noeuds[a].x, noeuds[a].y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      dessinerBalayage(t - debut);
      requestAnimationFrame(dessiner);
    }
    dimensionner();
    initCouches();
    requestAnimationFrame(dessiner);
    window.addEventListener("resize", function () { dimensionner(); initCouches(); });

    // Parallaxe : scroll (profondeur) + pointeur (tenue en main, souris uniquement)
    var decalageScroll = 0, decalagePointeurX = 0, decalagePointeurY = 0;
    function appliquerTransform() {
      canvas.style.transform = "translate(" + decalagePointeurX + "px," + (decalageScroll + decalagePointeurY) + "px)";
    }
    document.addEventListener("scroll", function () {
      requestAnimationFrame(function () {
        decalageScroll = Math.min(60, window.scrollY * 0.12);
        appliquerTransform();
      });
    }, { passive: true });
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      hero.addEventListener("mousemove", function (evenement) {
        var rect = hero.getBoundingClientRect();
        decalagePointeurX = ((evenement.clientX - rect.left) / rect.width - 0.5) * 18;
        decalagePointeurY = ((evenement.clientY - rect.top) / rect.height - 0.5) * 12;
        appliquerTransform();
      });
      hero.addEventListener("mouseleave", function () {
        decalagePointeurX = 0; decalagePointeurY = 0;
        appliquerTransform();
      });
    }
  }

  // Formulaire de contact structure : compose un email (mailto), aucun
  // backend, aucune donnee envoyee nulle part avant que l'utilisateur
  // n'appuie lui-meme sur "envoyer" dans son propre client mail.
  var formulaireContact = document.getElementById("formulaire-contact");
  if (formulaireContact) {
    var composerMessage = function () {
      var profilCoche = formulaireContact.querySelector('[name="profil"]:checked');
      var natureCochee = formulaireContact.querySelector('[name="nature"]:checked');
      var nom = formulaireContact.querySelector("#contact-nom").value.trim();
      var email = formulaireContact.querySelector("#contact-email").value.trim();
      var message = formulaireContact.querySelector("#contact-message").value.trim();
      var profil = profilCoche ? profilCoche.value : "(non prÃ©cisÃ©)";
      var nature = natureCochee ? natureCochee.value : "(non prÃ©cisÃ©)";

      var corps = "Profil : " + profil + "\n" +
        "Nature du contact : " + nature + "\n" +
        "Nom : " + nom + "\n" +
        "Email : " + email + "\n\n" +
        "Message :\n" + message;
      return { sujet: "Contact via trustline.identity-ops.com â€” " + nature, corps: corps };
    };

    formulaireContact.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      if (!formulaireContact.reportValidity()) { return; }
      var m = composerMessage();
      var statutFormulaire = document.getElementById("contact-statut");
      window.location.href = "mailto:contact@identity-ops.com?subject=" + encodeURIComponent(m.sujet) + "&body=" + encodeURIComponent(m.corps);
      if (statutFormulaire) {
        statutFormulaire.textContent = "Client mail ouvert avec le message prÃ©-rempli â€” relis, puis envoie-le toi-mÃªme.";
      }
    });

    var boutonCopierMessage = document.getElementById("bouton-copier-message");
    if (boutonCopierMessage) {
      boutonCopierMessage.addEventListener("click", function () {
        if (!formulaireContact.reportValidity()) { return; }
        var m = composerMessage();
        var statutFormulaire = document.getElementById("contact-statut");
        var suite = function () { if (statutFormulaire) statutFormulaire.textContent = "Message copiÃ© dans le presse-papiers."; };
        var echec = function () { if (statutFormulaire) statutFormulaire.textContent = "Copie indisponible â€” utilise \"Ouvrir mon client mail\"."; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("Sujet : " + m.sujet + "\n\n" + m.corps).then(suite).catch(echec);
        } else {
          echec();
        }
      });
    }
  }

  // Lien "etre informe au lancement" (section Offre) : pre-coche l'option
  // correspondante dans le formulaire plutot que de laisser chercher.
  var precocherLancement = function () {
    if (location.hash === "#nature-lancement") {
      var radio = document.getElementById("nature-lancement");
      if (radio) { radio.checked = true; }
    }
  };
  window.addEventListener("hashchange", precocherLancement);
  precocherLancement();

  // Contact : copier l'adresse email dans le presse-papiers
  var boutonCopier = document.getElementById("bouton-copier");
  var statutContact = document.getElementById("contact-statut");
  if (boutonCopier) {
    boutonCopier.addEventListener("click", function () {
      var adresse = boutonCopier.dataset.adresse;
      var suite = function () { statutContact.textContent = "Adresse copiÃ©e dans le presse-papiers."; };
      var echec = function () { statutContact.textContent = "Copie indisponible â€” utilisez le lien mailto ci-contre."; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(adresse).then(suite).catch(echec);
      } else {
        echec();
      }
    });
  }
})();

