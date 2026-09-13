/* mat-desetka-tetris.js - Matematika: Desetka tetris (2.-5. razred)
   Kocke s stevilkami 1-9 padajo z vrha. Ko se kocke, ki stojijo druga na drugi,
   sestejejo v ciljno stevilo, izginejo. Tri stopnje:
     2. razred    - cilj 10, tocno dve kocki
     3.-4. razred - cilj nad 10, dve ali tri kocke
     4.-5. razred - cilj do 20, poljubno mnogo kock */
(function (global) {
  'use strict';

  var O = global.Osnova;

  var STOLPCEV = 6;
  var ST_KOCK = 20;                 /* koliko kock pade v enem krogu */
  var POSPESEK = 0.97;              /* vsaka pristala kocka malce pohiti igro */
  var NAJHITREJE = 240;

  /* Stopnje se ne razlikujejo le po racunu:
     najmanj/najvec - koliko kock sme steti en niz (vkljucno s pristalo)
     vrstic         - visja vsota potrebuje visji kupcek, zato visjo plosco
     delezPara      - kako pogosto igra ponudi stevilko, ki nekje dopolni cilj;
                      pri visjih ciljih se priloznost ponudi redkeje, zato vec */
  var STOPNJE = [
    { id: 'deset', oznaka: '🔟 Desetica', razredi: [1, 2], cilji: [10],
      najmanj: 2, najvec: 2, vrstic: 7, delezPara: 0.5,
      opis: 'Za 2. razred: dve kocki druga na drugi dasta 10.' },
    { id: 'cez', oznaka: '🎯 Čez desetico', razredi: [3], cilji: [11, 12, 13, 14, 15],
      najmanj: 2, najvec: 3, vrstic: 8, delezPara: 0.65,
      opis: 'Za 3. in 4. razred: cilj je nad 10, sestaviš ga z dvema ali tremi kockami.' },
    { id: 'dvajset', oznaka: '🏔️ Do 20', razredi: [4, 5], cilji: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      najmanj: 2, najvec: 9, vrstic: 9, delezPara: 0.8,
      opis: 'Za 4. in 5. razred: cilj gre do 20, sestaviš ga s poljubno mnogo kockami.' }
  ];

  function nakljucnaKocka() {
    return 1 + Math.floor(Math.random() * 9);
  }

  function stopnjaZaRazred(razred) {
    for (var i = 0; i < STOPNJE.length; i++) {
      if (STOPNJE[i].razredi.indexOf(razred) >= 0) return STOPNJE[i];
    }
    return STOPNJE[STOPNJE.length - 1];
  }

  /* Vsi pari a + b = cilj, kjer sta a in b kocki (1-9). */
  function pariZaCilj(cilj) {
    var pari = [];
    for (var a = 1; a <= 9; a++) {
      var b = cilj - a;
      if (b >= a && b <= 9) pari.push([a, b]);
    }
    return pari;
  }

  /* Nekaj trojk a + b + c = cilj - za cilje, ki jih dve kocki ne dosezeta. */
  function trojkeZaCilj(cilj, koliko) {
    var trojke = [];
    for (var a = 1; a <= 9 && trojke.length < koliko; a++) {
      for (var b = a; b <= 9 && trojke.length < koliko; b++) {
        var c = cilj - a - b;
        if (c >= b && c <= 9) trojke.push([a, b, c]);
      }
    }
    return trojke;
  }

  var HITROSTI = [
    { id: 'mirno', oznaka: '🐢 Mirno', korak: 950 },
    { id: 'hitro', oznaka: '🐇 Hitro', korak: 620 },
    { id: 'blisk', oznaka: '⚡ Bliskovito', korak: 420 }
  ];

  function zazeni(posoda, ctx) {
    var stopnja = stopnjaZaRazred(ctx.igralec.razred);
    var cilj = stopnja.cilji[Math.floor(stopnja.cilji.length / 2)];
    var hitrost = HITROSTI[0];

    pokaziUvod();

    /* ---------- uvod: stopnja, ciljno stevilo in hitrost ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Kocke s številkami padajo z vrha. Zloži jih tako, da se tiste, ' +
        'ki stojijo <b>druga na drugi</b>, seštejejo v <b>ciljno število</b> — takrat vse ' +
        'izginejo! Premikaš jih s puščicama ⬅️ ➡️, z ⬇️ pospešiš padanje, s <b>preslednico</b> ' +
        'pa kocko takoj spustiš. Na tablici kar tapni stolpec, v katerega naj gre.</div>' +
        '</div>' +

        '<p class="namig-opis">Kako težko?</p>' +
        '<div class="cipi" id="cipi-stopnja"></div>' +
        '<p class="namig-opis" id="opis-stopnje"></p>' +

        '<div id="izbira-cilja">' +
        '<p class="namig-opis">Katero število sestavljaš?</p>' +
        '<div class="cipi" id="cipi-cilj"></div>' +
        '</div>' +

        '<div id="pregled"></div>' +

        '<p class="namig-opis">Kako hitro naj padajo?</p>' +
        '<div class="cipi" id="cipi-hitrost"></div>' +

        '<p class="namig-opis">Pade ' + ST_KOCK + ' kock — če jih pospraviš vse, je plošča ' +
        'na koncu prazna.</p>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      izrisiCipe('cipi-stopnja', STOPNJE, function (s) { return s.oznaka; },
        function (s) { return s === stopnja; },
        function (s) {
          stopnja = s;
          if (stopnja.cilji.indexOf(cilj) < 0) {
            cilj = stopnja.cilji[Math.floor(stopnja.cilji.length / 2)];
          }
          pokaziUvod();
        });

      izrisiCipe('cipi-hitrost', HITROSTI, function (h) { return h.oznaka; },
        function (h) { return h === hitrost; },
        function (h) { hitrost = h; pokaziUvod(); });

      document.getElementById('opis-stopnje').textContent = stopnja.opis;

      /* pri stopnji z enim samim ciljem izbira nima smisla */
      if (stopnja.cilji.length > 1) {
        izrisiCipe('cipi-cilj', stopnja.cilji, function (c) { return String(c); },
          function (c) { return c === cilj; },
          function (c) { cilj = c; pokaziUvod(); });
      } else {
        document.getElementById('izbira-cilja').style.display = 'none';
      }

      izrisiPregled();
      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    function izrisiCipe(idPosode, moznosti, oznaka, jeIzbran, izberi) {
      var posodaCipov = document.getElementById(idPosode);
      moznosti.forEach(function (m) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (jeIzbran(m) ? ' izbran' : '');
        c.textContent = oznaka(m);
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          izberi(m);
        });
        posodaCipov.appendChild(c);
      });
    }

    /* Ponovitev pred igro: kako se da izbrani cilj sestaviti iz kock. */
    function izrisiPregled() {
      var pari = pariZaCilj(cilj);
      var kartice = pari.map(function (p) {
        return '<div class="ucenje-par"><b>' + p[0] + ' + ' + p[1] + '</b><span>' + cilj +
          '</span></div>';
      });

      if (stopnja.najvec >= 3) {
        trojkeZaCilj(cilj, pari.length ? 2 : 4).forEach(function (t) {
          kartice.push('<div class="ucenje-par"><b>' + t.join(' + ') + '</b><span>' + cilj +
            '</span></div>');
        });
      }

      document.getElementById('pregled').innerHTML =
        '<div class="ucenje-seznam">' + kartice.join('') + '</div>' +
        (stopnja.najvec > 3
          ? '<p class="namig-opis">Šteje tudi štiri ali več kock — če se seštejejo v ' +
            cilj + ', izginejo vse.</p>'
          : '');
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var vrstic = stopnja.vrstic;
      var stanje = {
        cilj: cilj,
        najmanj: stopnja.najmanj,
        najvec: stopnja.najvec,
        mreza: [],            /* mreza[vrstica][stolpec] = {stevilka, el} ali null */
        padajoca: null,       /* {vrstica, stolpec, stevilka, el, namig} */
        naslednja: nakljucnaKocka(),
        postavljenih: 0,
        ocisceno: 0,          /* koliko kock je izginilo */
        tocke: 0,
        niz: 0,
        najdaljsiNiz: 0,
        korak: hitrost.korak,
        cakaj: false,         /* med brisanjem niza kocka ne pada */
        ustavljena: false
      };

      for (var v = 0; v < vrstic; v++) {
        var vrsta = [];
        for (var s = 0; s < STOLPCEV; s++) vrsta.push(null);
        stanje.mreza.push(vrsta);
      }

      var casovnik = null;
      var polje, odziv, gumbNamig, stolpci;

      izrisiOgrodje();
      document.addEventListener('keydown', tipka);
      casovnik = global.setTimeout(tik, 600);

      /* ---------- ogrodje ---------- */
      function izrisiOgrodje() {
        var vodila = '';
        for (var s = 0; s < STOLPCEV; s++) {
          vodila += '<div class="tetris-stolpec" style="left:' + (s * 100 / STOLPCEV) + '%"></div>';
        }

        posoda.innerHTML =
          '<div class="plosca">' +
          '<div class="vrstica-stanja">' +
          '<span class="stanje-znacka" id="znacka-kock">🧱 ' + ST_KOCK + '</span>' +
          '<span class="stanje-znacka cilj">🎯 ' + stanje.cilj + '</span>' +
          '<div class="napredek"><i id="crta" style="width:0%"></i></div>' +
          '<span class="stanje-znacka" id="znacka-tocke">⭐ 0</span>' +
          '<span class="stanje-znacka ogenj" id="znacka-niz" style="display:none"></span>' +
          '</div>' +

          '<div class="tetris-vrh">' +
          '<span class="tetris-oznaka">Naslednja:</span>' +
          '<div class="tetris-mini" id="naslednja"></div>' +
          '</div>' +

          '<div class="tetris-polje" id="polje" style="--st:' + STOLPCEV + ';--vr:' + vrstic + '">' +
          vodila +
          '</div>' +

          '<div class="tetris-tipke">' +
          '<button class="tetris-tipka" id="tipka-levo" type="button" aria-label="Levo">◀</button>' +
          '<button class="tetris-tipka" id="tipka-dol" type="button" aria-label="Spusti">⬇</button>' +
          '<button class="tetris-tipka" id="tipka-desno" type="button" aria-label="Desno">▶</button>' +
          '</div>' +

          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        polje = document.getElementById('polje');
        odziv = document.getElementById('odziv');
        gumbNamig = document.getElementById('gumb-namig');
        stolpci = polje.querySelectorAll('.tetris-stolpec');

        polje.addEventListener('click', klikNaPolje);
        document.getElementById('tipka-levo').addEventListener('click', function () { premakni(-1); });
        document.getElementById('tipka-desno').addEventListener('click', function () { premakni(1); });
        document.getElementById('tipka-dol').addEventListener('click', korakDol);
        gumbNamig.addEventListener('click', pokaziNamig);

        izrisiNaslednjo();
        osveziStanje();
      }

      function izrisiNaslednjo() {
        var n = document.getElementById('naslednja');
        n.className = 'tetris-mini b' + stanje.naslednja;
        n.textContent = stanje.naslednja;
      }

      function osveziStanje() {
        var ostane = ST_KOCK - stanje.postavljenih - (stanje.padajoca ? 1 : 0);
        document.getElementById('znacka-kock').textContent = '🧱 ' + Math.max(0, ostane);
        document.getElementById('znacka-tocke').textContent = '⭐ ' + stanje.tocke;
        document.getElementById('crta').style.width = (stanje.postavljenih / ST_KOCK * 100) + '%';
        O.osveziNiz(stanje.niz);
      }

      /* ---------- ura igre ---------- */
      /* Otrok lahko sredi igre pritisne "Nazaj" v glavi - takrat zaslon ni vec
         aktiven in igro ustavimo, sicer bi casovnik tekel naprej. */
      function ziva() {
        return !stanje.ustavljena && polje.isConnected &&
          document.getElementById('zaslon-igra').classList.contains('aktiven');
      }

      function ustavi() {
        stanje.ustavljena = true;
        if (casovnik) global.clearTimeout(casovnik);
        casovnik = null;
        document.removeEventListener('keydown', tipka);
      }

      function tik() {
        if (!ziva()) { ustavi(); return; }
        if (stanje.cakaj) { casovnik = global.setTimeout(tik, 80); return; }

        if (!stanje.padajoca) {
          if (!spustiNovo()) return;
        } else if (jeProsto(stanje.padajoca.vrstica + 1, stanje.padajoca.stolpec)) {
          stanje.padajoca.vrstica += 1;
          postavi(stanje.padajoca.el, stanje.padajoca.vrstica, stanje.padajoca.stolpec);
        } else {
          pristani();
          return;
        }

        casovnik = global.setTimeout(tik, stanje.korak);
      }

      /* ---------- mreza ---------- */
      function jeProsto(v, s) {
        if (v < 0 || v >= vrstic || s < 0 || s >= STOLPCEV) return false;
        return stanje.mreza[v][s] === null;
      }

      function vrhVrstica(s) {
        for (var v = 0; v < vrstic; v++) {
          if (stanje.mreza[v][s]) return v;
        }
        return -1;
      }

      function postavi(el, v, s) {
        el.style.left = (s * 100 / STOLPCEV) + '%';
        el.style.top = (v * 100 / vrstic) + '%';
      }

      function ustvariKocko(stevilka) {
        var el = document.createElement('div');
        el.className = 'tetris-kocka b' + stevilka;
        el.innerHTML = '<i>' + stevilka + '</i>';
        polje.appendChild(el);
        return el;
      }

      function oznaciStolpec() {
        for (var i = 0; i < stolpci.length; i++) {
          stolpci[i].classList.toggle('aktiven',
            stanje.padajoca !== null && i === stanje.padajoca.stolpec);
        }
      }

      function pocistiNamig() {
        for (var i = 0; i < stolpci.length; i++) stolpci[i].classList.remove('namig');
      }

      /* ---------- iskanje niza ----------
         Kocka s stevilko `stevilka` na mestu (v, s), pod njo pa kupcek: koliko
         kock skupaj da cilj? Vsote strogo rastejo (kocke so vsaj 1), zato lahko
         cilj zadene natanko ena dolzina - dvoumnosti ni. 0 = niza ni. */
      function najdiNiz(v, s, stevilka) {
        var vsota = stevilka;
        var dolzina = 1;
        for (var g = v + 1; g < vrstic; g++) {
          var c = stanje.mreza[g][s];
          if (!c) break;
          vsota += c.stevilka;
          dolzina += 1;
          if (vsota === stanje.cilj && dolzina >= stanje.najmanj) return dolzina;
          if (vsota > stanje.cilj || dolzina >= stanje.najvec) break;
        }
        return 0;
      }

      /* Isto, a za kocko, ki bi sele pristala na vrhu stolpca. */
      function nizNadKupckom(s, stevilka) {
        var vrh = vrhVrstica(s);
        if (vrh < 1) return 0;              /* prazen stolpec ali poln do vrha */
        return najdiNiz(vrh - 1, s, stevilka);
      }

      /* "9 + 3 + 2 = 14" za niz, ki bi nastal v tem stolpcu. */
      function opisNiza(s, stevilka, dolzina) {
        var deli = [stevilka];
        var vrh = vrhVrstica(s);
        for (var i = 1; i < dolzina; i++) deli.push(stanje.mreza[vrh + i - 1][s].stevilka);
        return deli.join(' + ') + ' = ' + stanje.cilj;
      }

      /* ---------- nova kocka ---------- */
      /* Stevilko pogosto izberemo tako, da nekje na plosci dopolni cilj. */
      function izberiStevilko() {
        var dobre = [];
        for (var s = 0; s < STOLPCEV; s++) {
          for (var n = 1; n <= 9; n++) {
            if (nizNadKupckom(s, n)) dobre.push(n);
          }
        }
        if (dobre.length && Math.random() < stopnja.delezPara) {
          return dobre[Math.floor(Math.random() * dobre.length)];
        }
        return nakljucnaKocka();
      }

      function spustiNovo() {
        var s = Math.floor(STOLPCEV / 2);
        if (!jeProsto(0, s)) {
          s = -1;
          for (var i = 0; i < STOLPCEV; i++) {
            if (jeProsto(0, i)) { s = i; break; }
          }
          if (s < 0) { koncaj(true); return false; }
        }

        var stevilka = stanje.naslednja;
        stanje.naslednja = izberiStevilko();
        izrisiNaslednjo();

        var el = ustvariKocko(stevilka);
        el.classList.add('pada');
        postavi(el, 0, s);
        stanje.padajoca = { vrstica: 0, stolpec: s, stevilka: stevilka, el: el, namig: false };

        gumbNamig.disabled = false;
        odziv.className = 'odziv';
        odziv.textContent = '';
        oznaciStolpec();
        osveziStanje();
        return true;
      }

      /* ---------- premikanje ---------- */
      function premakni(smer) {
        if (!ziva() || stanje.cakaj || !stanje.padajoca) return;
        var p = stanje.padajoca;
        if (!jeProsto(p.vrstica, p.stolpec + smer)) return;
        p.stolpec += smer;
        postavi(p.el, p.vrstica, p.stolpec);
        oznaciStolpec();
      }

      /* Tap na stolpec: kocka skoci tja, ponoven tap na isti stolpec jo spusti. */
      function vStolpec(s) {
        if (!ziva() || stanje.cakaj || !stanje.padajoca) return;
        var p = stanje.padajoca;
        if (s === p.stolpec) { spusti(); return; }
        if (!jeProsto(p.vrstica, s)) {
          p.el.classList.remove('zavrnjena');
          void p.el.offsetWidth;
          p.el.classList.add('zavrnjena');
          return;
        }
        p.stolpec = s;
        postavi(p.el, p.vrstica, p.stolpec);
        oznaciStolpec();
      }

      /* Takojsen spust na vrh kupcka. */
      function spusti() {
        if (!ziva() || stanje.cakaj || !stanje.padajoca) return;
        var p = stanje.padajoca;
        while (jeProsto(p.vrstica + 1, p.stolpec)) p.vrstica += 1;
        p.el.classList.add('hiter');
        postavi(p.el, p.vrstica, p.stolpec);
        global.Ucinki.zvok.klik();
        if (casovnik) global.clearTimeout(casovnik);
        casovnik = global.setTimeout(function () {
          if (!ziva()) { ustavi(); return; }
          pristani();
        }, 130);
      }

      function korakDol() {
        if (!ziva() || stanje.cakaj || !stanje.padajoca) return;
        var p = stanje.padajoca;
        if (jeProsto(p.vrstica + 1, p.stolpec)) {
          p.vrstica += 1;
          postavi(p.el, p.vrstica, p.stolpec);
        } else {
          spusti();
        }
      }

      function klikNaPolje(dogodek) {
        var meje = polje.getBoundingClientRect();
        var s = Math.floor((dogodek.clientX - meje.left) / (meje.width / STOLPCEV));
        if (s < 0) s = 0;
        if (s >= STOLPCEV) s = STOLPCEV - 1;
        vStolpec(s);
      }

      function tipka(dogodek) {
        if (!ziva()) { ustavi(); return; }
        if (dogodek.key === 'ArrowLeft') { dogodek.preventDefault(); premakni(-1); }
        else if (dogodek.key === 'ArrowRight') { dogodek.preventDefault(); premakni(1); }
        else if (dogodek.key === 'ArrowDown') { dogodek.preventDefault(); korakDol(); }
        else if (dogodek.key === ' ' || dogodek.key === 'Spacebar') { dogodek.preventDefault(); spusti(); }
      }

      /* ---------- pristanek in ciscenje ---------- */
      function pristani() {
        var p = stanje.padajoca;
        stanje.padajoca = null;
        pocistiNamig();
        oznaciStolpec();
        gumbNamig.disabled = true;

        p.el.classList.remove('pada', 'hiter');
        p.el.classList.add('pristala');
        stanje.mreza[p.vrstica][p.stolpec] = { stevilka: p.stevilka, el: p.el };
        stanje.postavljenih += 1;
        stanje.korak = Math.max(NAJHITREJE, Math.round(stanje.korak * POSPESEK));
        osveziStanje();

        stanje.cakaj = true;
        pocistiNiz(p);
      }

      /* Kocke v stolpcu vedno stojijo druga na drugi, pristala kocka pa je v
         svojem stolpcu najvisja - zato se niz lahko zacne le pri njej in tece
         navzdol. Verig (en niz sprozi naslednjega) tu ni. */
      function pocistiNiz(p) {
        var dolzina = najdiNiz(p.vrstica, p.stolpec, p.stevilka);

        if (!dolzina) {
          stanje.niz = 0;
          osveziStanje();
          global.setTimeout(zakljuciPristanek, 140);
          return;
        }

        var kocke = [];
        var deli = [];
        for (var i = 0; i < dolzina; i++) {
          var c = stanje.mreza[p.vrstica + i][p.stolpec];
          kocke.push(c);
          deli.push(c.stevilka);
          stanje.mreza[p.vrstica + i][p.stolpec] = null;
        }

        stanje.ocisceno += dolzina;
        stanje.niz += 1;
        if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

        /* osnova je 10 (oz. 5 po namigu) + bonus za niz, vsaka kocka nad dvema
           pa je vredna se pol osnove - dolgi nizi so tezji in vec vredni */
        var brezPomoci = !p.namig;
        var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz) +
          (dolzina - 2) * (brezPomoci ? O.TOCKE_NAMIG : Math.round(O.TOCKE_NAMIG / 2));
        stanje.tocke += prisluzeno;
        osveziStanje();

        odziv.className = 'odziv ok';
        odziv.textContent = deli.join(' + ') + ' = ' + stanje.cilj + ' · +' + prisluzeno +
          ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');

        kocke.forEach(function (c) { c.el.classList.add('pocena'); });
        blisk(p.vrstica + dolzina - 1, p.stolpec);
        global.Ucinki.zvok.pravilno();
        global.Ucinki.konfeti(10 + dolzina * 6);

        global.setTimeout(function () {
          if (!ziva()) { ustavi(); return; }
          kocke.forEach(function (c) {
            if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
          });
          zakljuciPristanek();
        }, 340);
      }

      /* Kratek izpis cilja nad nizom, ki izgine. */
      function blisk(v, s) {
        var b = document.createElement('div');
        b.className = 'tetris-blisk';
        b.textContent = stanje.cilj + '!';
        b.style.left = ((s + 0.5) * 100 / STOLPCEV) + '%';
        b.style.top = ((v + 0.5) * 100 / vrstic) + '%';
        polje.appendChild(b);
        global.setTimeout(function () {
          if (b.parentNode) b.parentNode.removeChild(b);
        }, 900);
      }

      function zakljuciPristanek() {
        stanje.cakaj = false;

        for (var s = 0; s < STOLPCEV; s++) {
          if (stanje.mreza[0][s]) { koncaj(true); return; }
        }
        if (stanje.postavljenih >= ST_KOCK) { koncaj(false); return; }

        casovnik = global.setTimeout(tik, stanje.korak);
      }

      /* ---------- namig ---------- */
      function pokaziNamig() {
        if (!ziva() || !stanje.padajoca) return;
        global.Ucinki.zvok.klik();
        stanje.padajoca.namig = true;
        gumbNamig.disabled = true;
        pocistiNamig();

        var stevilka = stanje.padajoca.stevilka;
        var opis = '';
        var najdenih = 0;
        for (var s = 0; s < STOLPCEV; s++) {
          var dolzina = nizNadKupckom(s, stevilka);
          if (!dolzina) continue;
          stolpci[s].classList.add('namig');
          if (!najdenih) opis = opisNiza(s, stevilka, dolzina);
          najdenih += 1;
        }

        odziv.className = 'odziv';
        odziv.textContent = najdenih
          ? opis + ' — poglej označene stolpce.'
          : 'Kocka ' + stevilka + ' zdaj nikjer ne dopolni ' + stanje.cilj +
            ' — postavi jo tja, kjer bo najmanj v napoto.';
      }

      /* ---------- konec ---------- */
      function koncaj(polno) {
        ustavi();

        /* Ce plosca ni prazna, otroku ponovimo, kako se cilj sestavi. */
        var napake = [];
        if (stanje.ocisceno < ST_KOCK) {
          pariZaCilj(stanje.cilj).forEach(function (par) {
            napake.push({ vprasanje: par[0] + ' + ' + par[1], odgovor: stanje.cilj });
          });
          if (stanje.najvec >= 3) {
            trojkeZaCilj(stanje.cilj, napake.length ? 2 : 4).forEach(function (t) {
              napake.push({ vprasanje: t.join(' + '), odgovor: stanje.cilj });
            });
          }
        }

        if (polno) {
          global.Ucinki.zvok.napacno();
          odziv.className = 'odziv ne';
          odziv.textContent = 'Plošča se je napolnila!';
        }

        global.setTimeout(function () {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.ocisceno,
            skupaj: ST_KOCK,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            oznakaPravilnih: 'Pospravljenih kock',
            naslovNapak: (polno ? 'Plošča se je napolnila. ' : '') +
              'Tako sestaviš ' + stanje.cilj + ':',
            podnozje: 'Največ možnih točk: ' + O.najvecTock(ST_KOCK / 2) +
              ' (10 točk za vsako sestavljeno vsoto, 5 za vsako kocko nad dvema, ' +
              'plus bonus za niz)',
            sporocila: {
              tri: 'Vrhunsko! Število ' + stanje.cilj + ' vidiš v trenutku!',
              dve: 'Zelo dobro! Še malo in plošča bo čisto prazna.',
              ena: 'Dober začetek! Izberi počasnejšo hitrost in glej vrhove stolpcev.'
            }
          });
        }, polno ? 900 : 500);
      }
    }
  }

  global.Igre.registriraj({
    id: 'mat-desetka-tetris',
    predmet: 'matematika',
    razredi: [2, 3, 4, 5],
    naziv: 'Desetka — tetris',
    opis: 'Padajoče številke zloži tako, da se seštejejo v ciljno število.',
    ikona: '🔟',
    zazeni: zazeni
  });
})(window);
