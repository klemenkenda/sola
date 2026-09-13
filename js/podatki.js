/* podatki.js - predmeti in register iger (igralci so v igralci.js) */
(function (global) {
  'use strict';

  function odDo(od, doo) {
    var r = [];
    for (var i = od; i <= doo; i++) r.push(i);
    return r;
  }

  /* Predmeti po predmetniku osnovne šole (MVI, izdaja februar 2024):
     https://www.gov.si/assets/ministrstva/MVI/Dokumenti/Osnovna-sola/Ucni-nacrti/Predmetnik-OS/

     razredi  - razredi, v katerih je predmet na urniku
     izbirni  - razredi, v katerih predmet ni obvezen (neobvezni / obvezni izbirni predmet)
     nazivi   - predmeti, ki se čez razrede preimenujejo (npr. spoznavanje okolja → naravoslovje) */
  var PREDMETI = [
    { id: 'slovenscina', naziv: 'Slovenščina', ikona: '📚',
      razredi: odDo(1, 9),
      barva: 'linear-gradient(180deg,#6ddf8e,#2f9c45)' },

    { id: 'matematika', naziv: 'Matematika', ikona: '➗',
      razredi: odDo(1, 9),
      barva: 'linear-gradient(180deg,#ff8a8a,#e04b4b)' },

    /* prvi tuji jezik: obvezen od 2. razreda, v 1. razredu neobvezni izbirni predmet */
    { id: 'anglescina', naziv: 'Angleščina', ikona: '🔤',
      razredi: odDo(1, 9), izbirni: [1],
      barva: 'linear-gradient(180deg,#4fb0ff,#2176c9)' },

    /* drugi tuji jezik: neobvezni izbirni predmet v 4.-6., obvezni izbirni v 7.-9. razredu */
    { id: 'nemscina', naziv: 'Nemščina', ikona: '🥨',
      razredi: odDo(4, 9), izbirni: odDo(4, 9),
      barva: 'linear-gradient(180deg,#ffc94f,#e09b00)' },

    { id: 'glasba', naziv: 'Glasbena umetnost', ikona: '🎵',
      razredi: odDo(1, 9),
      barva: 'linear-gradient(180deg,#b08aff,#7a45f0)' },

    { id: 'likovna', naziv: 'Likovna umetnost', ikona: '🎨',
      razredi: odDo(1, 9),
      barva: 'linear-gradient(180deg,#ff9ad5,#d6479c)' },

    /* naravoslovna vertikala: spoznavanje okolja → naravoslovje in tehnika → naravoslovje */
    { id: 'naravoslovje', naziv: 'Naravoslovje', ikona: '🔬',
      razredi: odDo(1, 7),
      nazivi: [
        { razredi: odDo(1, 3), naziv: 'Spoznavanje okolja', ikona: '🌳' },
        { razredi: odDo(4, 5), naziv: 'Naravoslovje in tehnika', ikona: '🔬' }
      ],
      barva: 'linear-gradient(180deg,#65dcd0,#1a9e92)' },

    { id: 'druzba', naziv: 'Družba', ikona: '🏘️',
      razredi: odDo(4, 5),
      barva: 'linear-gradient(180deg,#ffb36b,#e07a1f)' },

    { id: 'geografija', naziv: 'Geografija', ikona: '🌍',
      razredi: odDo(6, 9),
      barva: 'linear-gradient(180deg,#5fd0ff,#1f8fc4)' },

    { id: 'zgodovina', naziv: 'Zgodovina', ikona: '🏺',
      razredi: odDo(6, 9),
      barva: 'linear-gradient(180deg,#d9b380,#9c6b34)' },

    { id: 'dke', naziv: 'Domovinska in državljanska kultura in etika', ikona: '🤝',
      razredi: odDo(7, 8),
      barva: 'linear-gradient(180deg,#9fb4ff,#4457c4)' },

    { id: 'tehnika', naziv: 'Tehnika in tehnologija', ikona: '🔧',
      razredi: odDo(6, 8),
      barva: 'linear-gradient(180deg,#b8c4cf,#68798a)' },

    { id: 'gospodinjstvo', naziv: 'Gospodinjstvo', ikona: '🍎',
      razredi: odDo(5, 6),
      barva: 'linear-gradient(180deg,#ff9f9f,#d1514f)' },

    { id: 'biologija', naziv: 'Biologija', ikona: '🌱',
      razredi: odDo(8, 9),
      barva: 'linear-gradient(180deg,#8ee08a,#3d9c3a)' },

    { id: 'kemija', naziv: 'Kemija', ikona: '🧪',
      razredi: odDo(8, 9),
      barva: 'linear-gradient(180deg,#c8a6ff,#7b3fd4)' },

    { id: 'fizika', naziv: 'Fizika', ikona: '🧲',
      razredi: odDo(8, 9),
      barva: 'linear-gradient(180deg,#ff8fb0,#c4355f)' },

    { id: 'sport', naziv: 'Šport', ikona: '⚽',
      razredi: odDo(1, 9),
      barva: 'linear-gradient(180deg,#7ee0a8,#199e63)' }
  ];

  function vsebuje(polje, razred) {
    return !!polje && polje.indexOf(razred) !== -1;
  }

  /* Predmeti, ki jih otrok tega razreda ima na urniku - z imenom in ikono,
     kakršno ima predmet v tem razredu ("Spoznavanje okolja" v 2., "Naravoslovje" v 6.). */
  function predmetiZaRazred(razred) {
    return PREDMETI.filter(function (p) {
      return vsebuje(p.razredi, razred);
    }).map(function (p) {
      var v = { id: p.id, naziv: p.naziv, ikona: p.ikona, barva: p.barva,
                izbiren: vsebuje(p.izbirni, razred) };
      (p.nazivi || []).forEach(function (n) {
        if (vsebuje(n.razredi, razred)) {
          v.naziv = n.naziv;
          if (n.ikona) v.ikona = n.ikona;
        }
      });
      return v;
    });
  }

  /* Register iger: vsaka igra se prijavi iz svoje datoteke. */
  var seznamIger = [];

  function najvisjiRazred(igra) {
    return igra.razredi ? Math.max.apply(null, igra.razredi) : 99;
  }

  function najnizjiRazred(igra) {
    return igra.razredi ? Math.min.apply(null, igra.razredi) : 0;
  }

  var Igre = {
    registriraj: function (igra) {
      seznamIger.push(igra);
    },

    /* Otrok sme igrati vse, kar je namenjeno njegovemu ALI višjemu razredu -
       mlajši tako dobi tudi naloge starejšega, če si jih želi preizkusiti. */
    zaPredmet: function (idPredmeta, razred) {
      return seznamIger.filter(function (i) {
        if (i.predmet !== idPredmeta) return false;
        return razred <= najvisjiRazred(i);
      });
    },

    /* Igra nad otrokovim razredom je "izziv" - to označimo na kartici. */
    jeIzziv: function (igra, razred) {
      return razred < najnizjiRazred(igra);
    },
    steviloZaPredmet: function (idPredmeta) {
      return seznamIger.filter(function (i) { return i.predmet === idPredmeta; }).length;
    },
    najdi: function (id) {
      var r = seznamIger.filter(function (i) { return i.id === id; });
      return r[0] || null;
    }
  };

  global.Podatki = {
    PREDMETI: PREDMETI,
    predmetiZaRazred: predmetiZaRazred
  };
  global.Igre = Igre;
})(window);
