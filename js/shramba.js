/* shramba.js - shranjevanje rezultatov v brskalnik (localStorage)
 *
 * Pravilo: pri vsaki igri šteje samo NAJBOLJŠI rezultat dneva, ne vsota poskusov.
 * Točke obdobja = seštevek najboljših rezultatov posameznih iger v tem obdobju.
 * Zato ponavljanje iste igre ne napihuje točk - otrok mora preseči svoj rekord.
 */
(function (global) {
  'use strict';

  var KLJUC = 'sola-pustolovscina-v2';
  var KLJUC_STARI = 'sola-pustolovscina-v1';

  /* ---------- datumi ---------- */

  function kljucDneva(d) {
    var m = d.getMonth() + 1, dan = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dan < 10 ? '0' : '') + dan;
  }

  function danes() {
    return kljucDneva(new Date());
  }

  /* Teden se začne v ponedeljek (slovenska navada). */
  function zacetekTedna(d) {
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return t;
  }

  function vObdobju(kljuc, obdobje) {
    if (obdobje === 'vse') return true;

    var sedaj = new Date();
    if (obdobje === 'dan') return kljuc === kljucDneva(sedaj);

    var deli = kljuc.split('-');
    var d = new Date(parseInt(deli[0], 10), parseInt(deli[1], 10) - 1, parseInt(deli[2], 10));

    if (obdobje === 'teden') return d >= zacetekTedna(sedaj);
    if (obdobje === 'mesec') {
      return d.getFullYear() === sedaj.getFullYear() && d.getMonth() === sedaj.getMonth();
    }
    return true;
  }

  /* ---------- branje in pisanje ---------- */

  function prazno() {
    return { igralci: {} };
  }

  function zapisi(podatki) {
    try {
      global.localStorage.setItem(KLJUC, JSON.stringify(podatki));
    } catch (e) {
      /* npr. zasebni način - igra deluje naprej, le rezultati se ne shranijo */
    }
  }

  /* Stara različica je hranila le skupne vsote; rekord vsake igre prenesemo v današnji dan. */
  function migriraj(stari) {
    var novi = prazno();
    var dan = danes();

    Object.keys(stari.igralci || {}).forEach(function (idIgralca) {
      var star = stari.igralci[idIgralca] || {};
      var vnosi = {};

      Object.keys(star.igre || {}).forEach(function (idIgre) {
        var s = star.igre[idIgre] || {};
        if (!s.rekord) return;
        var igra = global.Igre && global.Igre.najdi ? global.Igre.najdi(idIgre) : null;
        vnosi[idIgre] = {
          tocke: s.rekord,
          odstotek: s.najbolje || 0,
          poskusi: s.odigrano || 1,
          predmet: igra ? igra.predmet : 'neznano'
        };
      });

      novi.igralci[idIgralca] = { dnevi: {} };
      if (Object.keys(vnosi).length) novi.igralci[idIgralca].dnevi[dan] = vnosi;
    });

    zapisi(novi);
    return novi;
  }

  function preberi() {
    try {
      var s = global.localStorage.getItem(KLJUC);
      if (s) {
        var p = JSON.parse(s);
        if (p && typeof p === 'object' && p.igralci) return p;
      }
      var star = global.localStorage.getItem(KLJUC_STARI);
      if (star) return migriraj(JSON.parse(star));
    } catch (e) {
      /* poškodovani podatki - začnemo znova */
    }
    return prazno();
  }

  function igralec(id) {
    var p = preberi();
    return p.igralci[id] || { dnevi: {} };
  }

  /* ---------- zapis rezultata ---------- */

  /* Vrne { novRekord, prejsnji, razlika, najboljsi } za današnji dan. */
  function zabelezi(idIgralca, idPredmeta, idIgre, tocke, odstotek) {
    var p = preberi();
    if (!p.igralci[idIgralca]) p.igralci[idIgralca] = { dnevi: {} };

    var i = p.igralci[idIgralca];
    if (!i.dnevi) i.dnevi = {};

    var dan = danes();
    if (!i.dnevi[dan]) i.dnevi[dan] = {};

    var prej = i.dnevi[dan][idIgre];
    var prejsnjeTocke = prej ? prej.tocke : 0;
    var novRekord = tocke > prejsnjeTocke;

    i.dnevi[dan][idIgre] = {
      tocke: Math.max(tocke, prejsnjeTocke),
      odstotek: Math.max(odstotek, prej ? prej.odstotek : 0),
      poskusi: (prej ? prej.poskusi : 0) + 1,
      predmet: idPredmeta
    };

    zapisi(p);

    return {
      novRekord: novRekord,
      prejsnji: prejsnjeTocke,
      razlika: novRekord ? tocke - prejsnjeTocke : 0,
      najboljsi: i.dnevi[dan][idIgre].tocke
    };
  }

  /* ---------- seštevki ---------- */

  /* Najboljši rezultat vsake igre v obdobju: { idIgre: vnos }. */
  function najboljsiPoIgrah(idIgralca, obdobje, idPredmeta) {
    var i = igralec(idIgralca);
    var najboljsi = {};

    Object.keys(i.dnevi || {}).forEach(function (dan) {
      if (!vObdobju(dan, obdobje)) return;
      var vnosi = i.dnevi[dan];
      Object.keys(vnosi).forEach(function (idIgre) {
        var v = vnosi[idIgre];
        if (idPredmeta && v.predmet !== idPredmeta) return;
        if (!najboljsi[idIgre] || v.tocke > najboljsi[idIgre].tocke) najboljsi[idIgre] = v;
      });
    });

    return najboljsi;
  }

  function tocke(idIgralca, obdobje, idPredmeta) {
    var najboljsi = najboljsiPoIgrah(idIgralca, obdobje, idPredmeta);
    var vsota = 0;
    Object.keys(najboljsi).forEach(function (k) { vsota += najboljsi[k].tocke; });
    return vsota;
  }

  /* Najboljši rezultat ene igre v obdobju (0, če je še ni igral). */
  function rekordIgre(idIgralca, idIgre, obdobje) {
    var najboljsi = najboljsiPoIgrah(idIgralca, obdobje);
    return najboljsi[idIgre] ? najboljsi[idIgre].tocke : 0;
  }

  /* Koliko poskusov je otrok opravil pri igri v obdobju. */
  function poskusiIgre(idIgralca, idIgre, obdobje) {
    var i = igralec(idIgralca);
    var skupaj = 0;
    Object.keys(i.dnevi || {}).forEach(function (dan) {
      if (!vObdobju(dan, obdobje)) return;
      var v = i.dnevi[dan][idIgre];
      if (v) skupaj += v.poskusi || 0;
    });
    return skupaj;
  }

  /* ---------- izvoz in uvoz ---------- */

  /* Celotna vsebina shrambe - prenos.js jo zapiše v datoteko. */
  function izvozi() {
    return preberi();
  }

  /* Združi rezultate iz datoteke z obstoječimi: pri vsaki igri posameznega dne
     obdrži boljši rezultat. Uvoz iste datoteke dvakrat zato ničesar ne pokvari
     in ne napihne točk. Vrne število spremenjenih vnosov. */
  function uvozi(tuji) {
    if (!tuji || typeof tuji !== 'object' || !tuji.igralci) return 0;

    var p = preberi();
    var spremenjenih = 0;

    Object.keys(tuji.igralci).forEach(function (idIgralca) {
      var tujDnevi = (tuji.igralci[idIgralca] || {}).dnevi || {};
      if (!p.igralci[idIgralca]) p.igralci[idIgralca] = { dnevi: {} };
      var nasi = p.igralci[idIgralca];
      if (!nasi.dnevi) nasi.dnevi = {};

      Object.keys(tujDnevi).forEach(function (dan) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dan)) return;
        if (!nasi.dnevi[dan]) nasi.dnevi[dan] = {};

        var tujiVnosi = tujDnevi[dan] || {};
        Object.keys(tujiVnosi).forEach(function (idIgre) {
          var t = tujiVnosi[idIgre];
          if (!t || typeof t.tocke !== 'number') return;

          var n = nasi.dnevi[dan][idIgre];
          var zdruzen = {
            tocke: Math.max(t.tocke || 0, n ? n.tocke : 0),
            odstotek: Math.max(t.odstotek || 0, n ? n.odstotek : 0),
            poskusi: Math.max(t.poskusi || 0, n ? n.poskusi : 0),
            predmet: (n && n.predmet) || t.predmet || 'neznano'
          };

          if (!n || zdruzen.tocke !== n.tocke || zdruzen.poskusi !== n.poskusi) spremenjenih++;
          nasi.dnevi[dan][idIgre] = zdruzen;
        });
      });
    });

    zapisi(p);
    return spremenjenih;
  }

  /* Ob izbrisu igralca odstranimo tudi njegove dneve. */
  function pobrisiIgralca(id) {
    var p = preberi();
    if (!p.igralci[id]) return;
    delete p.igralci[id];
    zapisi(p);
  }

  function pobrisiVse() {
    try {
      global.localStorage.removeItem(KLJUC_STARI);
    } catch (e) { /* ni pomembno */ }
    zapisi(prazno());
  }

  global.Shramba = {
    zabelezi: zabelezi,
    tocke: tocke,
    rekordIgre: rekordIgre,
    poskusiIgre: poskusiIgre,
    najboljsiPoIgrah: najboljsiPoIgrah,
    izvozi: izvozi,
    uvozi: uvozi,
    pobrisiIgralca: pobrisiIgralca,
    kljucDneva: kljucDneva,
    pobrisiVse: pobrisiVse
  };
})(window);
