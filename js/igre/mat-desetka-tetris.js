/* mat-desetka-tetris.js - Matematika: Desetka tetris (2.-5. razred)
   Kocke s stevilkami 1-9 padajo z vrha. Ko se dve navpicno sosednji kocki
   sestejeta v 10, obe izgineta, kocke nad njima pa se posedejo navzdol. */
(function (global) {
  'use strict';

  var O = global.Osnova;

  var STOLPCEV = 6;
  var VRSTIC = 7;
  var ST_KOCK = 20;                 /* koliko kock pade v enem krogu */
  var PAROV = ST_KOCK / 2;          /* toliko desetic je najvec mogocih */
  var POSPESEK = 0.97;              /* vsaka pristala kocka malce pohiti igro */
  var NAJHITREJE = 240;

  var HITROSTI = [
    { id: 'mirno', oznaka: '🐢 Mirno', korak: 950 },
    { id: 'hitro', oznaka: '🐇 Hitro', korak: 620 },
    { id: 'blisk', oznaka: '⚡ Bliskovito', korak: 420 }
  ];

  /* Zakaj stevilke niso cisto nakljucne: brez tega otrok pogosto dobi stevilko,
     ki na plosci nima para, in se kupcek le kopici. */
  var DELEZ_PARA = 0.6;

  function nakljucnaKocka() {
    return 1 + Math.floor(Math.random() * 9);
  }

  function zazeni(posoda, ctx) {
    var hitrost = HITROSTI[0];

    pokaziUvod();

    /* ---------- uvod: razlaga in izbira hitrosti ---------- */
    function pokaziUvod() {
      var pari = '';
      [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]].forEach(function (p) {
        pari += '<div class="ucenje-par"><b>' + p[0] + ' + ' + p[1] + '</b><span>10</span></div>';
      });

      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Kocke s številkami padajo z vrha. Postavi jih tako, da bosta ' +
        '<b>druga nad drugo</b> dve, ki dasta skupaj <b>10</b> — takrat obe izgineta! ' +
        'Premikaš jih s puščicama ⬅️ ➡️, z ⬇️ pospešiš padanje, s <b>preslednico</b> pa kocko ' +
        'takoj spustiš. Na tablici kar tapni stolpec, v katerega naj gre.</div>' +
        '</div>' +
        '<div class="ucenje-seznam">' + pari + '</div>' +
        '<p class="namig-opis">Kako hitro naj padajo?</p>' +
        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis">Pade ' + ST_KOCK + ' kock — če jih povežeš vse, ' +
        'sestaviš ' + PAROV + ' desetic.</p>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      HITROSTI.forEach(function (h) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (h.id === hitrost.id ? ' izbran' : '');
        c.textContent = h.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          hitrost = h;
          var vsi = cipi.querySelectorAll('.cip');
          for (var k = 0; k < vsi.length; k++) vsi[k].classList.remove('izbran');
          c.classList.add('izbran');
        });
        cipi.appendChild(c);
      });

      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        mreza: [],            /* mreza[vrstica][stolpec] = {stevilka, el} ali null */
        padajoca: null,       /* {vrstica, stolpec, stevilka, el, namig} */
        naslednja: nakljucnaKocka(),
        postavljenih: 0,
        tocke: 0,
        parov: 0,
        niz: 0,
        najdaljsiNiz: 0,
        korak: hitrost.korak,
        cakaj: false,         /* med brisanjem para kocka ne pada */
        ustavljena: false
      };

      for (var v = 0; v < VRSTIC; v++) {
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
          '<div class="napredek"><i id="crta" style="width:0%"></i></div>' +
          '<span class="stanje-znacka" id="znacka-tocke">⭐ 0</span>' +
          '<span class="stanje-znacka ogenj" id="znacka-niz" style="display:none"></span>' +
          '</div>' +

          '<div class="tetris-vrh">' +
          '<span class="tetris-oznaka">Naslednja:</span>' +
          '<div class="tetris-mini" id="naslednja"></div>' +
          '</div>' +

          '<div class="tetris-polje" id="polje" style="--st:' + STOLPCEV + ';--vr:' + VRSTIC + '">' +
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
        if (v < 0 || v >= VRSTIC || s < 0 || s >= STOLPCEV) return false;
        return stanje.mreza[v][s] === null;
      }

      function vrhVrstica(s) {
        for (var v = 0; v < VRSTIC; v++) {
          if (stanje.mreza[v][s]) return v;
        }
        return -1;
      }

      function postavi(el, v, s) {
        el.style.left = (s * 100 / STOLPCEV) + '%';
        el.style.top = (v * 100 / VRSTIC) + '%';
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

      /* ---------- nova kocka ---------- */
      /* Stevilko izberemo tako, da ima pogosto par na vrhu enega od kupckov. */
      function izberiStevilko() {
        var pari = [];
        for (var s = 0; s < STOLPCEV; s++) {
          var v = vrhVrstica(s);
          if (v > 0) pari.push(10 - stanje.mreza[v][s].stevilka);
        }
        if (pari.length && Math.random() < DELEZ_PARA) {
          return pari[Math.floor(Math.random() * pari.length)];
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

      /* ---------- pristanek in ciscenje desetic ---------- */
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
        pocistiPare(p.stolpec, p.namig, 0);
      }

      /* Najnizji navpicni par, ki da 10. Po brisanju se kocke posedejo in
         preverimo znova - tako nastanejo verige. */
      function najdiPar(s) {
        for (var v = VRSTIC - 2; v >= 0; v--) {
          var zgoraj = stanje.mreza[v][s];
          var spodaj = stanje.mreza[v + 1][s];
          if (zgoraj && spodaj && zgoraj.stevilka + spodaj.stevilka === 10) return v;
        }
        return -1;
      }

      function pocistiPare(s, namig, zeOcisceno) {
        if (!ziva()) { ustavi(); return; }

        var v = najdiPar(s);
        if (v < 0) {
          if (zeOcisceno === 0) {
            stanje.niz = 0;
            osveziStanje();
          }
          zakljuciPristanek();
          return;
        }

        var zgoraj = stanje.mreza[v][s];
        var spodaj = stanje.mreza[v + 1][s];

        stanje.parov += 1;
        stanje.niz += 1;
        if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;
        var prisluzeno = O.tockeZaOdgovor(!namig, stanje.niz);
        stanje.tocke += prisluzeno;
        osveziStanje();

        odziv.className = 'odziv ok';
        odziv.textContent = zgoraj.stevilka + ' + ' + spodaj.stevilka + ' = 10 · +' +
          prisluzeno + ' točk' +
          (zeOcisceno > 0 ? ' · veriga ×' + (zeOcisceno + 1) + ' 🔥'
            : (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : ''));

        zgoraj.el.classList.add('pocena');
        spodaj.el.classList.add('pocena');
        blisk(v, s);
        global.Ucinki.zvok.pravilno();
        global.Ucinki.konfeti(14);

        stanje.mreza[v][s] = null;
        stanje.mreza[v + 1][s] = null;

        global.setTimeout(function () {
          if (!ziva()) { ustavi(); return; }
          if (zgoraj.el.parentNode) zgoraj.el.parentNode.removeChild(zgoraj.el);
          if (spodaj.el.parentNode) spodaj.el.parentNode.removeChild(spodaj.el);

          /* kocke nad parom se posedejo za dve vrstici */
          for (var g = v - 1; g >= 0; g--) {
            var c = stanje.mreza[g][s];
            stanje.mreza[g][s] = null;
            if (c) {
              stanje.mreza[g + 2][s] = c;
              postavi(c.el, g + 2, s);
            }
          }

          global.setTimeout(function () {
            pocistiPare(s, namig, zeOcisceno + 1);
          }, 260);
        }, 320);
      }

      /* Kratek "10!" nad parom, ki izgine. */
      function blisk(v, s) {
        var b = document.createElement('div');
        b.className = 'tetris-blisk';
        b.textContent = '10!';
        b.style.left = ((s + 0.5) * 100 / STOLPCEV) + '%';
        b.style.top = ((v + 1) * 100 / VRSTIC) + '%';
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

        var iskana = 10 - stanje.padajoca.stevilka;
        var najdenih = 0;
        for (var s = 0; s < STOLPCEV; s++) {
          var v = vrhVrstica(s);
          if (v > 0 && stanje.mreza[v][s].stevilka === iskana) {
            stolpci[s].classList.add('namig');
            najdenih += 1;
          }
        }

        odziv.className = 'odziv';
        odziv.textContent = najdenih
          ? stanje.padajoca.stevilka + ' + ' + iskana + ' = 10 — poglej označene stolpce.'
          : 'Za ' + stanje.padajoca.stevilka + ' zdaj ni para (manjka ' + iskana +
            ') — postavi jo tja, kjer bo najmanj v napoto.';
      }

      /* ---------- konec ---------- */
      function koncaj(polno) {
        ustavi();

        /* Kar je ostalo na plosci, otroku pokazemo kot pare, ki jih se povadi. */
        var napake = [];
        var videne = {};
        for (var v = 0; v < VRSTIC; v++) {
          for (var s = 0; s < STOLPCEV; s++) {
            var c = stanje.mreza[v][s];
            if (!c) continue;
            var manjka = 10 - c.stevilka;
            var kljuc = Math.min(c.stevilka, manjka) + '+' + Math.max(c.stevilka, manjka);
            if (videne[kljuc]) continue;
            videne[kljuc] = true;
            napake.push({ vprasanje: c.stevilka + ' + ' + manjka, odgovor: 10 });
          }
        }

        if (polno) {
          global.Ucinki.zvok.napacno();
          odziv.className = 'odziv ne';
          odziv.textContent = 'Plošča se je napolnila!';
        }

        var parov = Math.min(stanje.parov, PAROV);
        global.setTimeout(function () {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: parov,
            skupaj: PAROV,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            naslovNapak: polno
              ? 'Plošča se je napolnila. Te pare še povadi:'
              : 'Te pare do 10 še povadi:',
            sporocila: {
              tri: 'Vrhunsko! Desetice vidiš v trenutku!',
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
    opis: 'Padajoče številke zloži tako, da dve druga nad drugo dasta 10.',
    ikona: '🔟',
    zazeni: zazeni
  });
})(window);
