/* slo-opis-slike.js - Slovenščina: podčrtaj povedi, ki sodijo k sliki
 * Pikapolonica se vsakič nariše po naključju (očala, pričeska, obleka, pike, obutev,
 * predmet v roki), povedi pa nastanejo iz istih lastnosti - zato so nekatere resnične,
 * druge pa ne. Otrok najprej presodi vsako poved, nato tiste, ki ne sodijo, popravi.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;

  var IMENA = ['Polona', 'Nika', 'Maja', 'Manca', 'Lenka', 'Špela'];

  var BARVE = {
    rdeca: '#e2574c',
    modra: '#3aa0ff',
    zelena: '#43c95d',
    rumena: '#ffc53d',
    crna: '#3a3f4a',
    bela: '#ffffff',
    rjava: '#8a5a2b'
  };

  /* Vsaka lastnost je hkrati navodilo risbi in kalup za poved. `zapis` dobi besedo
     in ime, zato ista lastnost naredi resnično poved (prava beseda), napačno
     (katera koli druga možnost) ali poved z luknjo (drugi del igre). */
  var LASTNOSTI = [
    { id: 'oblikaOcal',
      zapis: function (beseda, ime) { return ime + ' nosi ' + beseda + ' očala.'; },
      moznosti: [
        { id: 'okrogla', beseda: 'okrogla' },
        { id: 'oglata', beseda: 'oglata' },
        { id: 'srcasta', beseda: 'srčasta' }
      ] },

    { id: 'barvaOcal',
      zapis: function (beseda) { return 'Njena očala so ' + beseda + '.'; },
      moznosti: [
        { id: 'rdeca', beseda: 'rdeča' },
        { id: 'modra', beseda: 'modra' },
        { id: 'zelena', beseda: 'zelena' },
        { id: 'rumena', beseda: 'rumena' }
      ] },

    { id: 'pricoska',
      zapis: function (beseda, ime) { return ime + ' ima ' + beseda + '.'; },
      moznosti: [
        { id: 'kita', beseda: 'dolgo kito' },
        { id: 'copka', beseda: 'dva čopka' },
        { id: 'kratki', beseda: 'kratke lase' },
        { id: 'kodri', beseda: 'kodraste lase' }
      ] },

    { id: 'barvaLas',
      zapis: function (beseda) { return 'Njeni lasje so ' + beseda + '.'; },
      moznosti: [
        { id: 'rjava', beseda: 'rjavi' },
        { id: 'rdeca', beseda: 'rdeči' },
        { id: 'crna', beseda: 'črni' },
        { id: 'rumena', beseda: 'rumeni' }
      ] },

    { id: 'barvaObleke',
      zapis: function (beseda) { return 'Njena obleka je ' + beseda + ' barve.'; },
      moznosti: [
        { id: 'rdeca', beseda: 'rdeče' },
        { id: 'zelena', beseda: 'zelene' },
        { id: 'modra', beseda: 'modre' },
        { id: 'rumena', beseda: 'rumene' }
      ] },

    { id: 'barvaPik',
      zapis: function (beseda) { return 'Na obleki ima ' + beseda + ' pike.'; },
      moznosti: [
        { id: 'crna', beseda: 'črne' },
        { id: 'bela', beseda: 'bele' },
        { id: 'rumena', beseda: 'rumene' },
        { id: 'modra', beseda: 'modre' }
      ] },

    { id: 'obutev',
      zapis: function (beseda) { return 'Obuta je v ' + beseda + '.'; },
      moznosti: [
        { id: 'skornji', beseda: 'škornje' },
        { id: 'superge', beseda: 'superge' },
        { id: 'natikace', beseda: 'natikače' },
        { id: 'copate', beseda: 'copate' }
      ] },

    { id: 'predmet',
      zapis: function (beseda) { return 'V roki drži ' + beseda + '.'; },
      moznosti: [
        { id: 'svincnik', beseda: 'svinčnik' },
        { id: 'knjiga', beseda: 'knjigo' },
        { id: 'zoga', beseda: 'žogo' },
        { id: 'deznik', beseda: 'dežnik' }
      ] }
  ];

  function lastnost(id) {
    return LASTNOSTI.filter(function (l) { return l.id === id; })[0];
  }

  function izberi(polje) {
    return polje[Math.floor(Math.random() * polje.length)];
  }

  /* ---------- risba ---------- */

  var KOZA = '#ffd9b3';

  function srce(x, y, s) {
    return 'M' + x + ',' + (y + s) +
      ' C' + (x - s * 1.7) + ',' + (y - s * 0.3) +
      ' ' + (x - s * 1.2) + ',' + (y - s * 1.6) +
      ' ' + x + ',' + (y - s * 0.5) +
      ' C' + (x + s * 1.2) + ',' + (y - s * 1.6) +
      ' ' + (x + s * 1.7) + ',' + (y - s * 0.3) +
      ' ' + x + ',' + (y + s) + 'z';
  }

  function lasjeZadaj(pricoska, barva) {
    var glava = '<ellipse cx="160" cy="116" rx="70" ry="64" fill="' + barva + '"/>';

    if (pricoska === 'kita') {
      var kita = '';
      for (var i = 0; i < 4; i++) {
        kita += '<ellipse cx="' + (232 + i * 3) + '" cy="' + (154 + i * 32) +
          '" rx="' + (21 - i * 2) + '" ry="' + (23 - i * 2) + '" fill="' + barva + '"/>';
      }
      return glava + kita + '<path d="M240,268 q14,-16 26,-4 q-14,6 -26,4z" fill="#ff6b9d"/>';
    }

    if (pricoska === 'copka') {
      return glava +
        '<circle cx="84" cy="94" r="31" fill="' + barva + '"/>' +
        '<circle cx="236" cy="94" r="31" fill="' + barva + '"/>' +
        '<rect x="100" y="106" width="15" height="18" rx="7" fill="#ff6b9d"/>' +
        '<rect x="205" y="106" width="15" height="18" rx="7" fill="#ff6b9d"/>';
    }

    if (pricoska === 'kodri') {
      var kodri = '';
      for (var k = 0; k <= 8; k++) {
        var kot = Math.PI * (1 + k / 8);
        kodri += '<circle cx="' + (160 + Math.cos(kot) * 68).toFixed(1) +
          '" cy="' + (116 + Math.sin(kot) * 62).toFixed(1) + '" r="21" fill="' + barva + '"/>';
      }
      return glava + kodri;
    }

    return glava;   /* kratki lasje */
  }

  /* Čelna krtača: zunanji rob se prilega glavi, notranji jo prereže nad očmi. */
  function lasjeSpredaj(barva) {
    return '<path d="M98,126 A62,62 0 0 1 222,126 Q160,84 98,126 z" fill="' + barva + '"/>';
  }

  function ocalaSvg(oblika, barva) {
    var lece;
    if (oblika === 'oglata') {
      lece = '<rect x="112" y="100" width="48" height="44" rx="9"/>' +
        '<rect x="160" y="100" width="48" height="44" rx="9"/>';
    } else if (oblika === 'srcasta') {
      lece = '<path d="' + srce(136, 118, 19) + '"/><path d="' + srce(184, 118, 19) + '"/>';
    } else {
      lece = '<circle cx="136" cy="122" r="26"/><circle cx="184" cy="122" r="26"/>';
    }
    return '<g fill="rgba(255,255,255,.28)" stroke="' + barva + '" stroke-width="6">' + lece + '</g>' +
      '<path d="M152,116 q8,-8 16,0" fill="none" stroke="' + barva + '" stroke-width="5"/>' +
      '<path d="M108,110 l-16,-8" stroke="' + barva + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M212,110 l16,-8" stroke="' + barva + '" stroke-width="5" stroke-linecap="round"/>';
  }

  function cevelj(x, obutev) {
    if (obutev === 'skornji') {
      return '<path d="M' + (x - 17) + ',394 h34 v32 h13 v20 h-47z" fill="#8a5a2b"/>' +
        '<rect x="' + (x - 20) + '" y="388" width="40" height="13" rx="6" fill="#a9713f"/>';
    }
    if (obutev === 'superge') {
      return '<path d="M' + (x - 15) + ',422 h30 v12 h12 v12 h-42z" fill="#fff" stroke="#c9d6e8" stroke-width="3"/>' +
        '<path d="M' + (x - 14) + ',440 h40" stroke="#3aa0ff" stroke-width="6"/>';
    }
    if (obutev === 'natikace') {
      return '<path d="M' + (x - 9) + ',436 l10,-18 l15,18" fill="none" stroke="#c98a3f" stroke-width="7" stroke-linecap="round"/>' +
        '<rect x="' + (x - 17) + '" y="434" width="44" height="11" rx="5" fill="#c98a3f"/>';
    }
    return '<path d="M' + (x - 15) + ',424 h26 q17,0 17,12 v10 h-43z" fill="#ff8ab4"/>' +
      '<circle cx="' + (x + 9) + '" cy="424" r="10" fill="#fff"/>';
  }

  /* Leva noga je zrcalna, da konici čevljev gledata narazen. */
  function obutevSvg(x, obutev, smer) {
    if (smer > 0) return cevelj(x, obutev);
    return '<g transform="translate(' + (2 * x) + ',0) scale(-1,1)">' + cevelj(x, obutev) + '</g>';
  }

  function predmetSvg(predmet) {
    if (predmet === 'knjiga') {
      return '<g transform="rotate(-10 274 322)">' +
        '<rect x="240" y="292" width="68" height="50" rx="5" fill="#4fb0ff" stroke="#2176c9" stroke-width="3"/>' +
        '<path d="M274,292 V342" stroke="#fff" stroke-width="4"/>' +
        '<path d="M250,308 h16 M282,308 h16 M250,322 h16 M282,322 h16" stroke="#fff" stroke-width="3"/>' +
        '</g>';
    }
    if (predmet === 'zoga') {
      return '<circle cx="286" cy="330" r="30" fill="#fff" stroke="#3a3f4a" stroke-width="3"/>' +
        '<circle cx="286" cy="330" r="10" fill="#3a3f4a"/>' +
        '<circle cx="286" cy="304" r="6" fill="#3a3f4a"/>' +
        '<circle cx="264" cy="344" r="6" fill="#3a3f4a"/>' +
        '<circle cx="308" cy="344" r="6" fill="#3a3f4a"/>';
    }
    if (predmet === 'deznik') {
      return '<path d="M232,300 a46,44 0 0 1 92,0 z" fill="#e2574c"/>' +
        '<path d="M232,300 q11,-13 23,0 q11,-13 23,0 q11,-13 23,0 q11,-13 23,0" fill="#e2574c" stroke="#b8433a" stroke-width="3"/>' +
        '<circle cx="278" cy="256" r="5" fill="#8a5a2b"/>' +
        '<path d="M278,256 V372 q0,18 -18,18" stroke="#8a5a2b" stroke-width="7" fill="none" stroke-linecap="round"/>';
    }
    return '<g transform="rotate(-14 274 320)">' +
      '<rect x="264" y="262" width="20" height="72" rx="3" fill="#ffc53d" stroke="#e0a800" stroke-width="2"/>' +
      '<path d="M264,262 l10,-24 l10,24z" fill="#f6dfc0"/>' +
      '<path d="M269,250 l5,-12 l5,12z" fill="#3a3f4a"/>' +
      '<rect x="264" y="326" width="20" height="14" rx="3" fill="#ff8ab4"/>' +
      '</g>';
  }

  var MESTA_PIK = [[116, 262], [204, 262], [106, 320], [214, 320], [132, 372], [188, 372]];

  function likSvg(lik) {
    var lasje = BARVE[lik.barvaLas];

    return '<svg class="opis-risba" viewBox="0 0 320 470" xmlns="http://www.w3.org/2000/svg" role="img">' +

      /* tipalki */
      '<path d="M132,70 C120,34 108,24 96,18" stroke="#3a3f4a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="94" cy="16" r="10" fill="#3a3f4a"/>' +
      '<path d="M188,70 C200,34 212,24 224,18" stroke="#3a3f4a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="226" cy="16" r="10" fill="#3a3f4a"/>' +

      /* noge in obutev - telo jih zgoraj pokrije */
      '<rect x="125" y="380" width="19" height="58" rx="9" fill="' + KOZA + '"/>' +
      '<rect x="176" y="380" width="19" height="58" rx="9" fill="' + KOZA + '"/>' +
      obutevSvg(134, lik.obutev, -1) + obutevSvg(186, lik.obutev, 1) +

      lasjeZadaj(lik.pricoska, lasje) +

      /* vrat - glavo spodaj pokrije telo, zgoraj pa glava */
      '<rect x="140" y="158" width="40" height="72" rx="18" fill="' + KOZA + '"/>' +

      /* telo = obleka pikapolonice */
      '<ellipse cx="160" cy="310" rx="88" ry="96" fill="' + BARVE[lik.barvaObleke] +
      '" stroke="rgba(0,0,0,.14)" stroke-width="4"/>' +
      '<path d="M160,216 V404" stroke="rgba(0,0,0,.16)" stroke-width="4"/>' +
      MESTA_PIK.map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="' + BARVE[lik.barvaPik] +
          '" stroke="rgba(0,0,0,.12)" stroke-width="2"/>';
      }).join('') +

      /* roki; predmet je pod dlanjo, zato je videti, kot da ga drži */
      '<path d="M112,232 q-46,34 -66,96" stroke="' + KOZA + '" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M208,232 q48,32 66,92" stroke="' + KOZA + '" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      predmetSvg(lik.predmet) +
      '<circle cx="46" cy="330" r="15" fill="' + KOZA + '"/>' +
      '<circle cx="274" cy="326" r="15" fill="' + KOZA + '"/>' +

      /* glava */
      '<circle cx="160" cy="120" r="62" fill="' + KOZA + '"/>' +
      '<ellipse cx="112" cy="148" rx="14" ry="10" fill="#ffb3c1" opacity=".75"/>' +
      '<ellipse cx="208" cy="148" rx="14" ry="10" fill="#ffb3c1" opacity=".75"/>' +
      '<circle cx="136" cy="122" r="16" fill="#fff"/>' +
      '<circle cx="139" cy="125" r="8" fill="#243b6b"/><circle cx="143" cy="120" r="3" fill="#fff"/>' +
      '<circle cx="184" cy="122" r="16" fill="#fff"/>' +
      '<circle cx="187" cy="125" r="8" fill="#243b6b"/><circle cx="191" cy="120" r="3" fill="#fff"/>' +
      '<path d="M144,158 q16,16 32,0" fill="none" stroke="#c0392b" stroke-width="5" stroke-linecap="round"/>' +

      ocalaSvg(lik.oblikaOcal, BARVE[lik.barvaOcal]) +
      lasjeSpredaj(lasje) +
      '</svg>';
  }

  /* ---------- naloge ---------- */

  function narediLik() {
    var lik = {};
    LASTNOSTI.forEach(function (l) { lik[l.id] = izberi(l.moznosti).id; });

    /* pike v barvi obleke bi bile nevidne - otrok povedi o njih ne bi mogel preveriti */
    while (lik.barvaPik === lik.barvaObleke) {
      lik.barvaPik = izberi(lastnost('barvaPik').moznosti).id;
    }
    return lik;
  }

  function narediSliko(stPovedi, stNapacnih) {
    var lik = narediLik();
    var izbrane = O.premesaj(LASTNOSTI).slice(0, stPovedi);
    var napacne = O.premesaj(izbrane.map(function (l, i) { return i; })).slice(0, stNapacnih);

    var povedi = izbrane.map(function (l, i) {
      var prava = l.moznosti.filter(function (m) { return m.id === lik[l.id]; })[0];
      if (napacne.indexOf(i) === -1) {
        return { lastnost: l, moznost: prava, prava: prava, sodi: true };
      }
      var druge = l.moznosti.filter(function (m) { return m.id !== prava.id; });
      return { lastnost: l, moznost: izberi(druge), prava: prava, sodi: false };
    });

    return {
      ime: izberi(IMENA),
      lik: lik,
      povedi: O.premesaj(povedi),
      stanja: povedi.map(function () { return 'cakanje'; }),
      zmote: povedi.map(function () { return false; }),
      popravki: povedi.map(function () { return null; })
    };
  }

  /* Naloge tečejo po slikah: najprej vse presoje ene slike, nato popravki njenih
     napačnih povedi - tako kot v delovnem zvezku (podčrtaj, potem popravi). */
  function sestaviNaloge(stSlik, stPovedi, stNapacnih) {
    var naloge = [];
    for (var s = 0; s < stSlik; s++) {
      var slika = narediSliko(stPovedi, stNapacnih);
      slika.povedi.forEach(function (p, i) {
        naloge.push({ vrsta: 'sodi', slika: slika, kazalec: i });
      });
      slika.povedi.forEach(function (p, i) {
        if (!p.sodi) naloge.push({ vrsta: 'popravi', slika: slika, kazalec: i });
      });
    }
    return naloge;
  }

  function povedBesedilo(slika, i) {
    var p = slika.povedi[i];
    return p.lastnost.zapis(slika.popravki[i] || p.moznost.beseda, slika.ime);
  }

  function seznamHtml(slika, trenutni) {
    return '<ul class="opis-povedi">' + slika.povedi.map(function (p, i) {
      var stanje = slika.stanja[i];
      var razredi = ['opis-poved', stanje];
      if (slika.zmote[i]) razredi.push('zmota');
      if (i === trenutni) razredi.push('trenutna');

      var znak = stanje === 'podcrtana' ? '✓' : (stanje === 'preskocena' ? '✗' : '•');
      var beseda = slika.popravki[i]
        ? '<b class="opis-popravek">' + slika.popravki[i] + '</b>'
        : p.moznost.beseda;

      return '<li class="' + razredi.join(' ') + '">' +
        '<span class="opis-znak">' + znak + '</span>' +
        '<span class="opis-besedilo">' + p.lastnost.zapis(beseda, slika.ime) + '</span>' +
        '</li>';
    }).join('') + '</ul>';
  }

  /* ---------- igra ---------- */

  function zazeni(posoda, ctx) {
    var dveSliki = false;

    pokaziUvod();

    function stevilke() {
      return dveSliki
        ? { slik: 2, povedi: 5, napacnih: 2 }
        : { slik: 1, povedi: 6, napacnih: 3 };
    }

    /* ---------- uvod ---------- */
    function pokaziUvod() {
      var primer = narediSliko(2, 1);
      var sodi = primer.povedi[0].sodi ? 0 : 1;     /* prva resnična, druga napačna */
      var neSodi = 1 - sodi;

      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Pikapolonica se vsakič obleče drugače! Preberi poved in povej, ' +
        'ali <b>sodi k sliki</b>. Če sodi, jo <b>podčrtaj</b>. ' +
        'Povedi, ki ne sodijo, boš na koncu <b>popravil</b>.</div>' +
        '</div>' +

        '<div class="opis-ovoj">' +
        '<div class="opis-slika">' + likSvg(primer.lik) +
        '<div class="opis-ime">To je ' + primer.ime + '.</div></div>' +
        '<div class="opis-desno">' +
        '<p class="opis-vzorec"><span class="opis-znak">✓</span>' +
        '<span class="opis-besedilo podcrtano">' + povedBesedilo(primer, sodi) + '</span></p>' +
        '<p class="opis-razlaga">To drži — poved podčrtamo.</p>' +
        '<p class="opis-vzorec"><span class="opis-znak">✗</span>' +
        '<span class="opis-besedilo">' + povedBesedilo(primer, neSodi) + '</span></p>' +
        '<p class="opis-razlaga">To ne drži — takšno poved pustimo in jo pozneje popravimo.</p>' +
        '</div></div>' +

        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis" id="opis-dolzine"></p>' +

        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      [{ dve: false, oznaka: '🌤️ Ena slika' },
        { dve: true, oznaka: '⛅ Dve sliki' }].forEach(function (moznost) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (moznost.dve === dveSliki ? ' izbran' : '');
        c.textContent = moznost.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          dveSliki = moznost.dve;
          var vsi = cipi.querySelectorAll('.cip');
          for (var k = 0; k < vsi.length; k++) vsi[k].classList.remove('izbran');
          c.classList.add('izbran');
          osveziOpis();
        });
        cipi.appendChild(c);
      });

      osveziOpis();
      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    function osveziOpis() {
      document.getElementById('opis-dolzine').textContent = dveSliki
        ? 'Dve pikapolonici, pri vsaki pet povedi — daljša igra.'
        : 'Ena pikapolonica in šest povedi — krajša igra.';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var st = stevilke();
      var stanje = {
        naloge: sestaviNaloge(st.slik, st.povedi, st.napacnih),
        kazalec: 0,
        tocke: 0,
        pravilnih: 0,
        niz: 0,
        najdaljsiNiz: 0,
        poskus: 0,
        odgovorjeno: false,
        napake: []
      };

      izrisi();

      function naloga() {
        return stanje.naloge[stanje.kazalec];
      }

      function poved() {
        return naloga().slika.povedi[naloga().kazalec];
      }

      function izrisi() {
        var n = naloga();
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.naloge.length, stanje.tocke) +

          '<div class="sova-uvod" style="margin-top:6px">' +
          '<div class="lik-mesto" id="lik-igra" style="width:86px"></div>' +
          '<div class="oblacek" id="navodilo"></div>' +
          '</div>' +

          '<div class="opis-ovoj">' +
          '<div class="opis-slika">' + likSvg(n.slika.lik) +
          '<div class="opis-ime">To je ' + n.slika.ime + '.</div></div>' +
          '<div class="opis-desno" id="opis-desno"></div>' +
          '</div>' +

          '<div class="odziv" id="odziv"></div>' +
          '<div class="gumbi-vrsta" id="gumbi"></div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        /* vrstica stanja šteje vprašanja, tu pa sta dve vrsti nalog */
        var vrstica = posoda.querySelector('.vrstica-stanja');
        if (vrstica) {
          vrstica.children[0].textContent =
            'Naloga ' + (stanje.kazalec + 1) + '/' + stanje.naloge.length;
        }

        if (n.vrsta === 'sodi') izrisiPresojo();
        else izrisiPopravek();
      }

      function osveziSeznam() {
        document.getElementById('seznam-ovoj').innerHTML =
          seznamHtml(naloga().slika, naloga().kazalec);
      }

      /* ---------- 1. del: ali poved sodi k sliki ---------- */
      function izrisiPresojo() {
        document.getElementById('navodilo').innerHTML = 'Ali ta poved <b>sodi k sliki</b>?';

        document.getElementById('opis-desno').innerHTML =
          '<div id="seznam-ovoj">' + seznamHtml(naloga().slika, naloga().kazalec) + '</div>';

        document.getElementById('gumbi').innerHTML =
          '<button class="gumb zelen" type="button" id="gumb-da">✏️ Podčrtaj</button>' +
          '<button class="gumb rumen" type="button" id="gumb-ne">🚫 Ne sodi</button>';

        document.getElementById('gumb-da').addEventListener('click', function () { presodi(true); });
        document.getElementById('gumb-ne').addEventListener('click', function () { presodi(false); });
      }

      /* Presoja je odločitev med dvema možnostma - drugi poskus bi bil že odgovor,
         zato ima otrok tu en sam poskus. */
      function presodi(odgovor) {
        if (stanje.odgovorjeno) return;
        stanje.odgovorjeno = true;

        var n = naloga();
        var p = poved();
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        n.slika.stanja[n.kazalec] = p.sodi ? 'podcrtana' : 'preskocena';

        if (odgovor === p.sodi) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;
          var prisluzeno = O.tockeZaOdgovor(true, stanje.niz);
          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;

          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' +
            (p.sodi ? 'Poved res sodi k sliki.' : 'Ta poved res ne sodi k sliki.') +
            ' · +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(18);
        } else {
          stanje.niz = 0;
          n.slika.zmote[n.kazalec] = true;
          stanje.napake.push({
            vprasanje: povedBesedilo(n.slika, n.kazalec),
            odgovor: p.sodi ? 'sodi k sliki' : 'ne sodi k sliki'
          });

          odziv.className = 'odziv ne';
          odziv.textContent = p.sodi
            ? 'Ta poved drži — poglej še enkrat na sliko.'
            : 'Tega na sliki ni. Prav je: ' + p.lastnost.zapis(p.prava.beseda, n.slika.ime);
          global.Liki.reagiraj(lik, false);
          global.Ucinki.zvok.napacno();
        }

        O.osveziNiz(stanje.niz);
        osveziSeznam();
        zakleni();
        global.setTimeout(naprej, odgovor === p.sodi ? 1700 : 2600);
      }

      /* ---------- 2. del: popravi poved, da bo ustrezala sliki ---------- */
      function izrisiPopravek() {
        var n = naloga();
        var p = poved();

        document.getElementById('navodilo').innerHTML =
          'Ta poved <b>ne sodi</b> k sliki. Popravi jo!';

        /* med možnostmi je tudi napačna beseda iz prvega dela - otrok jo mora zavrniti */
        var tretja = p.lastnost.moznosti.filter(function (m) {
          return m.id !== p.prava.id && m.id !== p.moznost.id;
        });
        var izbire = O.premesaj([p.prava, p.moznost].concat(
          tretja.length ? [izberi(tretja)] : []));

        document.getElementById('opis-desno').innerHTML =
          '<div id="seznam-ovoj">' + seznamHtml(n.slika, n.kazalec) + '</div>' +
          '<p class="opis-naloga" id="luknja">' +
          p.lastnost.zapis('<span class="opis-luknja">?</span>', n.slika.ime) + '</p>' +
          '<div class="moznosti" id="moznosti">' +
          izbire.map(function (m) {
            return '<button class="moznost" type="button" data-id="' + m.id + '">' +
              m.beseda + '</button>';
          }).join('') +
          '</div>';

        document.getElementById('gumbi').innerHTML = '';
        document.getElementById('moznosti').addEventListener('click', klikMoznost);
      }

      function klikMoznost(e) {
        if (stanje.odgovorjeno) return;

        var gumb = e.target;
        while (gumb && !gumb.classList.contains('moznost')) {
          if (gumb === e.currentTarget) return;
          gumb = gumb.parentNode;
        }
        if (!gumb || gumb.disabled) return;

        var n = naloga();
        var p = poved();
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (gumb.getAttribute('data-id') === p.prava.id) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;
          var prisluzeno = O.tockeZaOdgovor(stanje.poskus === 0, stanje.niz);
          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;
          stanje.odgovorjeno = true;

          gumb.classList.add('pravilna');
          popraviPoved();

          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' Zdaj poved ustreza sliki. · +' +
            prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(20);
          O.osveziNiz(stanje.niz);
          zakleni();
          global.setTimeout(naprej, 1900);
          return;
        }

        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        gumb.classList.add('napacna');
        gumb.disabled = true;
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Ni to. Še enkrat poglej sliko!';
          return;
        }

        stanje.odgovorjeno = true;
        stanje.napake.push({
          vprasanje: p.lastnost.zapis('___', n.slika.ime),
          odgovor: p.prava.beseda
        });
        popraviPoved();

        var pravi = posoda.querySelector('.moznost[data-id="' + p.prava.id + '"]');
        if (pravi) pravi.classList.add('pravilna');

        odziv.className = 'odziv ne';
        odziv.textContent = 'Prav je: ' + p.lastnost.zapis(p.prava.beseda, n.slika.ime);
        zakleni();
        global.setTimeout(naprej, 2800);
      }

      /* Popravljena poved se vpiše v seznam in podčrta - tako kot v zvezku. */
      function popraviPoved() {
        var n = naloga();
        var p = poved();
        n.slika.popravki[n.kazalec] = p.prava.beseda;
        n.slika.stanja[n.kazalec] = 'podcrtana';
        n.slika.zmote[n.kazalec] = false;
        osveziSeznam();
        document.getElementById('luknja').innerHTML =
          p.lastnost.zapis('<b class="opis-popravek">' + p.prava.beseda + '</b>', n.slika.ime);
      }

      function zakleni() {
        var gumbi = posoda.querySelectorAll('#gumbi .gumb, .moznost');
        for (var i = 0; i < gumbi.length; i++) gumbi[i].disabled = true;
      }

      function naprej() {
        stanje.kazalec += 1;
        if (stanje.kazalec >= stanje.naloge.length) {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.pravilnih,
            skupaj: stanje.naloge.length,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: stanje.napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            oznakaPravilnih: 'Rešenih nalog',
            naslovNapak: 'Te povedi preberi še enkrat:',
            sporocila: {
              tri: 'Vrhunsko! Sliko si prebral do zadnje pike. 🐞',
              dve: 'Zelo dobro! Še malo natančnega gledanja in bo popolno.',
              ena: 'Dober začetek! Poved beri počasi in vsako besedo poišči na sliki.'
            }
          });
          return;
        }
        izrisi();
      }
    }
  }

  global.Igre.registriraj({
    id: 'slo-opis-slike',
    predmet: 'slovenscina',
    razredi: [2, 3, 4],
    naziv: 'Podčrtaj povedi',
    opis: 'Oglej si pikapolonico in podčrtaj povedi, ki sodijo k sliki. Tiste, ki ne sodijo, popravi.',
    ikona: '🐞',
    zazeni: zazeni
  });
})(window);
