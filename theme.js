(function () {
  "use strict";
  try {
    var enregistre = localStorage.getItem("trustline-theme");
    var theme = enregistre || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    var bouton = document.getElementById("theme-toggle");
    if (!bouton) { return; }
    var majLibelle = function () {
      var actuel = document.documentElement.getAttribute("data-theme");
      bouton.setAttribute("aria-label", actuel === "light" ? "Passer en thème sombre" : "Passer en thème clair");
    };
    majLibelle();
    bouton.addEventListener("click", function () {
      var actuel = document.documentElement.getAttribute("data-theme");
      var suivant = actuel === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", suivant);
      try { localStorage.setItem("trustline-theme", suivant); } catch (e) {}
      majLibelle();
    });
  });
})();
