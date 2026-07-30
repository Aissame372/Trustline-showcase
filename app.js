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
    }, { threshold: 0.2 });
    elements.forEach(function (el) { observateur.observe(el); });
  }

  // ── Rideau d'ouverture + titre cinetique (H1 du hero, <br> preserve) ────
  var titre = document.getElementById("hero-titre");
  if (titre) {
    var segments = titre.innerHTML.split(/<br\s*\/?>/i);
    titre.innerHTML = "";
    var indexMot = 0;
    segments.forEach(function (segment, indexSegment) {
      if (indexSegment > 0) { titre.appendChild(document.createElement("br")); }
      var temporaire = document.createElement("div");
      temporaire.innerHTML = segment;
      temporaire.textContent.split(" ").forEach(function (mot) {
        if (!mot) { return; }
        var span = document.createElement("span");
        span.className = "mot";
        span.textContent = mot;
        span.style.transitionDelay = (0.35 + indexMot * 0.09) + "s";
        titre.appendChild(span);
        titre.appendChild(document.createTextNode(" "));
        indexMot++;
      });
    });
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add("rideau-ouvre");
      if (titre) {
        titre.querySelectorAll(".mot").forEach(function (span) { span.classList.add("visible"); });
      }
    });
  });

  // ── Video de fond du hero : pause si reduced-motion, repli silencieux
  // sur le canvas existant si le fichier ne charge pas. ──
  var heroVideo = document.getElementById("hero-video");
  if (heroVideo) {
    if (reduitMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
      heroVideo.style.display = "none";
    } else {
      heroVideo.addEventListener("error", function () { heroVideo.style.display = "none"; }, true);
    }
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

  // Jauge de score (donut circulaire) : anime le stroke-dashoffset au
  // premier passage en vue, meme mecanisme que le rapport HTML (report.py).
  var jauge = document.getElementById("jauge");
  if (jauge) {
    var dashoffsetCible = jauge.getAttribute("data-dashoffset-final");
    var animerJauge = function () { jauge.style.strokeDashoffset = dashoffsetCible; };
    if (reduitMotion) {
      animerJauge();
    } else if ("IntersectionObserver" in window) {
      var obsJauge = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            animerJauge();
            obsJauge.unobserve(entree.target);
          }
        });
      }, { threshold: 0.5 });
      obsJauge.observe(jauge);
    } else {
      animerJauge();
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
      var perimetreCoche = formulaireContact.querySelector('[name="perimetre"]:checked');
      var interetsCoches = formulaireContact.querySelectorAll('[name="interets"]:checked');
      var nom = formulaireContact.querySelector("#contact-nom").value.trim();
      var email = formulaireContact.querySelector("#contact-email").value.trim();
      var message = formulaireContact.querySelector("#contact-message").value.trim();
      var profil = profilCoche ? profilCoche.value : "(non précisé)";
      var nature = natureCochee ? natureCochee.value : "(non précisé)";
      var perimetre = perimetreCoche ? perimetreCoche.value : "(non précisé)";
      var interets = interetsCoches.length
        ? Array.prototype.map.call(interetsCoches, function (i) { return i.value; }).join(", ")
        : "(non précisé)";

      var corps = "Profil : " + profil + "\n" +
        "Nature du contact : " + nature + "\n" +
        "Périmètre (domaines) : " + perimetre + "\n" +
        "Intérêts : " + interets + "\n" +
        "Nom : " + nom + "\n" +
        "Email : " + email + "\n\n" +
        "Message :\n" + message;
      return { sujet: "Contact via trustline.identity-ops.com — " + nature, corps: corps };
    };

    formulaireContact.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      if (!formulaireContact.reportValidity()) { return; }
      var m = composerMessage();
      var statutFormulaire = document.getElementById("contact-statut");
      window.location.href = "mailto:contact@identity-ops.com?subject=" + encodeURIComponent(m.sujet) + "&body=" + encodeURIComponent(m.corps);
      if (statutFormulaire) {
        statutFormulaire.textContent = "Client mail ouvert avec le message pré-rempli — relis, puis envoie-le toi-même.";
      }
    });

    var boutonCopierMessage = document.getElementById("bouton-copier-message");
    if (boutonCopierMessage) {
      boutonCopierMessage.addEventListener("click", function () {
        if (!formulaireContact.reportValidity()) { return; }
        var m = composerMessage();
        var statutFormulaire = document.getElementById("contact-statut");
        var suite = function () { if (statutFormulaire) statutFormulaire.textContent = "Message copié dans le presse-papiers."; };
        var echec = function () { if (statutFormulaire) statutFormulaire.textContent = "Copie indisponible — utilise \"Ouvrir mon client mail\"."; };
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
      var suite = function () { if (statutContact) statutContact.textContent = "Adresse copiée dans le presse-papiers."; };
      var echec = function () { if (statutContact) statutContact.textContent = "Copie indisponible — utilisez le lien mailto ci-contre."; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(adresse).then(suite).catch(echec);
      } else {
        echec();
      }
    });
  }

  // ── Menu hamburger mobile ──────────────────────────────────────────────
  // Ouvre/ferme le panneau de navigation sur mobile (< 780 px).
  // - aria-expanded sur le bouton, classe "ouverte" sur la liste
  // - Fermeture automatique : clic sur un lien, touche Échap, clic hors nav
  var boutonMenu = document.getElementById("nav-toggle");
  var liensMenu = document.getElementById("nav-liens");
  if (boutonMenu && liensMenu) {
    var fermerMenu = function () {
      liensMenu.classList.remove("ouverte");
      boutonMenu.setAttribute("aria-expanded", "false");
      boutonMenu.setAttribute("aria-label", "Ouvrir le menu");
    };
    var ouvrirMenu = function () {
      liensMenu.classList.add("ouverte");
      boutonMenu.setAttribute("aria-expanded", "true");
      boutonMenu.setAttribute("aria-label", "Fermer le menu");
    };

    boutonMenu.addEventListener("click", function () {
      if (liensMenu.classList.contains("ouverte")) {
        fermerMenu();
      } else {
        ouvrirMenu();
      }
    });

    // Fermer quand on clique sur un lien (navigation vers une ancre)
    liensMenu.querySelectorAll("a").forEach(function (lien) {
      lien.addEventListener("click", fermerMenu);
    });

    // Fermer avec la touche Échap
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && liensMenu.classList.contains("ouverte")) {
        fermerMenu();
        boutonMenu.focus();
      }
    });

    // Fermer si on clique en dehors de la nav (overlay implicite)
    document.addEventListener("click", function (e) {
      if (liensMenu.classList.contains("ouverte") &&
          !boutonMenu.contains(e.target) &&
          !liensMenu.contains(e.target)) {
        fermerMenu();
      }
    });

    // Réinitialiser l'état à > 780 px si on redimensionne la fenêtre
    window.addEventListener("resize", function () {
      if (window.innerWidth > 780) { fermerMenu(); }
    });
  }

  // ── Compteurs animés ──────────────────────────────────────────────────
  var statNums = document.querySelectorAll('.stat-num[data-target]');
  if (statNums.length && 'IntersectionObserver' in window) {
    var obsStats = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obsStats.unobserve(entry.target);
        var el = entry.target;
        var cible = parseInt(el.dataset.target, 10);
        // Sans data-target exploitable on laisse le contenu du HTML en place :
        // ecrire "NaN" dans la page serait pire que ne rien animer.
        if (isNaN(cible)) { return; }
        if (reduitMotion) { el.textContent = cible; return; }
        var debut = performance.now();
        var duree = 1300;
        (function animer(maintenant) {
          var elapsed = Math.min(duree, maintenant - debut);
          var ease = 1 - Math.pow(1 - elapsed / duree, 3);
          el.textContent = Math.round(cible * ease);
          if (elapsed < duree) requestAnimationFrame(animer);
          else el.textContent = cible;
        })(performance.now());
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { obsStats.observe(el); });
  }

  // ── Animation pipeline ──────────────────────────────────────────────
  var pipeline = document.querySelector('.pipeline');
  if (pipeline && 'IntersectionObserver' in window) {
    var obsPipeline = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obsPipeline.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    obsPipeline.observe(pipeline);
  }

  // ── Typewriter terminal ───────────────────────────────────────────────
  // Tape le contenu du terminal ligne par ligne quand il devient visible.
  // Chaque ligne est insérée en HTML brut pour préserver les <span> colorés.
  var termCorps = document.querySelector('.terminal__corps');
  if (termCorps && !reduitMotion && 'IntersectionObserver' in window) {
    var contenuOriginal = termCorps.innerHTML;
    termCorps.innerHTML = '';
    var lignesTerminal = contenuOriginal.split('\n');
    var obsTerminal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obsTerminal.unobserve(entry.target);
        var i = 0;
        var curseur = document.createElement('span');
        curseur.className = 'typewriter-cursor';
        curseur.setAttribute('aria-hidden', 'true');
        entry.target.appendChild(curseur);
        (function afficher() {
          if (i >= lignesTerminal.length) { curseur.remove(); return; }
          var span = document.createElement('span');
          span.innerHTML = lignesTerminal[i] + (i < lignesTerminal.length - 1 ? '\n' : '');
          entry.target.insertBefore(span, curseur);
          i++;
          setTimeout(afficher, i === 1 ? 200 : 55 + Math.random() * 55);
        })();
      });
    }, { threshold: 0.2 });
    obsTerminal.observe(termCorps);
  }

  // ── Bouton retour en haut ────────────────────────────────────────────────
  var boutonHaut = document.getElementById("bouton-haut");
  if (boutonHaut) {
    document.addEventListener("scroll", function () {
      requestAnimationFrame(function () {
        boutonHaut.classList.toggle("visible", window.scrollY > window.innerHeight * 0.6);
      });
    }, { passive: true });
    boutonHaut.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduitMotion ? "auto" : "smooth" });
    });
  }

  // ── Scroll spy navigation ──────────────────────────────────────────
  // Met en évidence le lien de navigation correspondant à la section visible.
  var sectionsNav = document.querySelectorAll('section[id], header[id]');
  var liensNav = document.querySelectorAll('.barre__liens a[href^="#"]');
  if (sectionsNav.length && liensNav.length && 'IntersectionObserver' in window) {
    var obsSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          liensNav.forEach(function (lien) {
            lien.classList.toggle('actif', lien.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
    sectionsNav.forEach(function (s) { obsSpy.observe(s); });
  }
})();

