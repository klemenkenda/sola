/* prenos.js - napredek v datoteko in nazaj
 *
 * Stran nima strežnika (GitHub Pages zna postreči samo datoteke), zato točke
 * živijo v brskalniku naprave. Da napredek preživi menjavo naprave, brisanje
 * podatkov brskalnika ali selitev na tablico, ga tu shranimo v datoteko .json
 * in ga od tam tudi vrnemo.
 */
(function (global) {
  'use strict';

  var ZNAK = 'sola-pustolovscina';   /* podpis, da prepoznamo svojo datoteko */
  var RAZLICICA = 2;

  function sestavi() {
    return {
      aplikacija: ZNAK,
      razlicica: RAZLICICA,
      izvozeno: new Date().toISOString(),
      igralci: global.Igralci.vsi(),
      rezultati: global.Shramba.izvozi()
    };
  }

  function imeDatoteke() {
    return 'solska-pustolovscina-' + global.Shramba.kljucDneva(new Date()) + '.json';
  }

  /* Shrani napredek kot datoteko v mapo Prenosi. */
  function shrani() {
    var besedilo = JSON.stringify(sestavi(), null, 2);
    var blob = new global.Blob([besedilo], { type: 'application/json;charset=utf-8' });
    var url = global.URL.createObjectURL(blob);

    var povezava = document.createElement('a');
    povezava.href = url;
    povezava.download = imeDatoteke();
    document.body.appendChild(povezava);
    povezava.click();
    document.body.removeChild(povezava);

    /* URL sprostimo šele, ko brskalnik prenos res začne */
    global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
    return imeDatoteke();
  }

  /* Prebere izbrano datoteko in vrne { igralci, rezultati } ali sproži napako.
     obKoncu(napaka, povzetek) */
  function nalozi(datoteka, obKoncu) {
    if (!datoteka) return;

    var bralec = new global.FileReader();

    bralec.onerror = function () {
      obKoncu('Datoteke ni bilo mogoče prebrati.');
    };

    bralec.onload = function () {
      var podatki;
      try {
        podatki = JSON.parse(bralec.result);
      } catch (e) {
        obKoncu('To ni veljavna datoteka z napredkom (ni JSON).');
        return;
      }

      if (!podatki || typeof podatki !== 'object' || podatki.aplikacija !== ZNAK) {
        obKoncu('Ta datoteka ni iz Šolske pustolovščine.');
        return;
      }

      /* Najprej igralci, da imajo uvoženi rezultati komu pripadati. */
      var noviIgralci = global.Igralci.uvozi(podatki.igralci);
      var rezultati = global.Shramba.uvozi(podatki.rezultati);

      obKoncu(null, { igralci: noviIgralci, rezultati: rezultati });
    };

    bralec.readAsText(datoteka);
  }

  global.Prenos = {
    shrani: shrani,
    nalozi: nalozi,
    imeDatoteke: imeDatoteke
  };
})(window);
