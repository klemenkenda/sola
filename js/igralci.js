/* igralci.js - kdo se uči: seznam igralcev, shranjen v brskalnik
 *
 * Prej sta bila Lenart in Anton zapisana v kodi. Zdaj ju ob prvem zagonu le
 * "posejemo", nato pa seznam ureja uporabnik sam (nov igralec, sprememba,
 * izbris) - zato lahko isto stran uporablja tudi kdo drug.
 */
(function (global) {
  'use strict';

  var KLJUC = 'sola-pustolovscina-igralci-v1';

  /* Prva zasedba - vpiše se samo, dokler uporabnik seznama še ni odprl. */
  var PRIVZETI = [
    { id: 'lenart', ime: 'Lenart', starost: 9, razred: 4, avatar: '🦊', barva: '#3aa0ff' },
    { id: 'anton', ime: 'Anton', starost: 7, razred: 2, avatar: '🐻', barva: '#ff9f43' }
  ];

  var AVATARJI = [
    '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐵', '🐶',
    '🐱', '🐰', '🦉', '🐸', '🐙', '🦄', '🐝', '🐢',
    '🦖', '🐳', '🦋', '🐧', '🚀', '⚽', '🎸', '🌟'
  ];

  var BARVE = [
    '#3aa0ff', '#ff9f43', '#43c95d', '#ff6b6b',
    '#9b6bff', '#ffc53d', '#1a9e92', '#d6479c'
  ];

  /* ---------- branje in pisanje ---------- */

  function zapisi(seznam) {
    try {
      global.localStorage.setItem(KLJUC, JSON.stringify(seznam));
    } catch (e) {
      /* zasebni način - igra deluje naprej, le seznam se ne shrani */
    }
    return seznam;
  }

  function preberi() {
    try {
      var s = global.localStorage.getItem(KLJUC);
      if (s) {
        var p = JSON.parse(s);
        if (Object.prototype.toString.call(p) === '[object Array]') return p;
      }
    } catch (e) {
      /* poškodovani podatki - začnemo s privzetima igralcema */
    }
    return zapisi(PRIVZETI.slice());
  }

  function vsi() {
    return preberi();
  }

  function najdi(id) {
    var r = preberi().filter(function (i) { return i.id === id; });
    return r[0] || null;
  }

  /* ---------- preverjanje vnosa ---------- */

  var SUMNIKI = { 'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'd' };

  /* "Špela Novak" -> "spela-novak"; iz id-ja delamo ključ v shrambi rezultatov. */
  function vKljuc(ime) {
    var s = String(ime || '').toLowerCase().replace(/[čćšžđ]/g, function (c) {
      return SUMNIKI[c];
    });
    s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'igralec';
  }

  function prostKljuc(ime, seznam) {
    var osnova = vKljuc(ime);
    var kljuc = osnova;
    var n = 2;
    while (seznam.some(function (i) { return i.id === kljuc; })) {
      kljuc = osnova + '-' + n;
      n++;
    }
    return kljuc;
  }

  function meja(stevilo, od, doo, privzeto) {
    var n = parseInt(stevilo, 10);
    if (isNaN(n)) return privzeto;
    return Math.min(doo, Math.max(od, n));
  }

  /* Iz obrazca (ali uvožene datoteke) naredimo zanesljiv zapis igralca. */
  function ocisti(vnos) {
    var v = vnos || {};
    var ime = String(v.ime || '').replace(/\s+/g, ' ').trim().slice(0, 20);
    return {
      ime: ime,
      starost: meja(v.starost, 3, 19, 7),
      razred: meja(v.razred, 1, 9, 1),
      avatar: String(v.avatar || AVATARJI[0]).slice(0, 4),
      barva: /^#[0-9a-fA-F]{6}$/.test(v.barva) ? v.barva : BARVE[0]
    };
  }

  /* ---------- urejanje ---------- */

  /* Vrne novega igralca ali null, če ime manjka. */
  function dodaj(vnos) {
    var igralec = ocisti(vnos);
    if (!igralec.ime) return null;

    var seznam = preberi();
    igralec.id = prostKljuc(igralec.ime, seznam);
    seznam.push(igralec);
    zapisi(seznam);
    return igralec;
  }

  /* Id ostane isti, sicer bi igralec izgubil svoje dosedanje točke. */
  function posodobi(id, vnos) {
    var seznam = preberi();
    var najden = null;

    seznam.forEach(function (i, n) {
      if (i.id !== id) return;
      var nov = ocisti(vnos);
      if (!nov.ime) nov.ime = i.ime;
      nov.id = id;
      seznam[n] = nov;
      najden = nov;
    });

    if (najden) zapisi(seznam);
    return najden;
  }

  /* Skupaj z igralcem pobrišemo tudi njegove točke - sicer bi se pri novem
     igralcu z istim imenom nepričakovano prikazale nazaj. */
  function izbrisi(id) {
    zapisi(preberi().filter(function (i) { return i.id !== id; }));
    if (global.Shramba && global.Shramba.pobrisiIgralca) global.Shramba.pobrisiIgralca(id);
  }

  /* Uvoz iz datoteke: dodamo le igralce, ki jih (po id-ju) še nimamo.
     Vrne število dodanih. */
  function uvozi(tuji) {
    if (Object.prototype.toString.call(tuji) !== '[object Array]') return 0;

    var seznam = preberi();
    var dodanih = 0;

    tuji.forEach(function (t) {
      var igralec = ocisti(t);
      if (!igralec.ime) return;

      var id = String((t && t.id) || '').slice(0, 40) || vKljuc(igralec.ime);
      if (seznam.some(function (i) { return i.id === id; })) return;

      igralec.id = id;
      seznam.push(igralec);
      dodanih++;
    });

    if (dodanih) zapisi(seznam);
    return dodanih;
  }

  global.Igralci = {
    vsi: vsi,
    najdi: najdi,
    dodaj: dodaj,
    posodobi: posodobi,
    izbrisi: izbrisi,
    uvozi: uvozi,
    AVATARJI: AVATARJI,
    BARVE: BARVE
  };
})(window);
