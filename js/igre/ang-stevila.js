/* ang-stevila.js - Angleščina: zapiši število z besedo (0-10, 0-20, 0-50) */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_VPRASANJ = 10;

  var ENOTE = ['zero', 'one', 'two', 'three', 'four',
    'five', 'six', 'seven', 'eight', 'nine'];
  var NAJSTE = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
    'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var DESETICE = ['twenty', 'thirty', 'forty', 'fifty'];

  function beseda(n) {
    if (n < 10) return ENOTE[n];
    if (n < 20) return NAJSTE[n - 10];
    var d = DESETICE[Math.floor(n / 10) - 2];
    var e = n % 10;
    return e ? d + '-' + ENOTE[e] : d;
  }

  /* primerjamo samo črke: "twenty one", "twentyone" in "twenty-one" so vsi pravilni */
  function ocisti(besedilo) {
    return String(besedilo).toLowerCase().replace(/[^a-z]/g, '');
  }

  /* namig: prva črka, ostale podčrtaji (vezaj ostane viden) */
  function namigZa(b) {
    return b.charAt(0) + b.slice(1).replace(/[a-z]/g, '_');
  }

  function zazeniZ(meja) {
    return function (posoda, ctx) {
      var stanje = {
        vrstniRed: O.premesaj(vsaStevila()).slice(0, ST_VPRASANJ),
        kazalec: 0,
        tocke: 0,
        pravilnih: 0,
        niz: 0,
        najdaljsiNiz: 0,
        namigUporabljen: false,
        poskus: 0,
        odgovorjeno: false,
        napake: []
      };

      pokaziUvod();

      function vsaStevila() {
        var vsa = [];
        for (var i = 0; i <= meja; i++) vsa.push(i);
        return vsa;
      }

      /* Pri večjih mejah ne naštevamo vseh števil, ampak pokažemo vzorec. */
      function zaUcenje() {
        if (meja <= 20) return vsaStevila();
        var seznam = [];
        for (var i = 0; i <= 20; i++) seznam.push(i);
        return seznam.concat([30, 40, 50].filter(function (n) { return n <= meja; }));
      }

      /* ---------- uvodni zaslon z učenjem ---------- */
      function pokaziUvod() {
        var sestavljene = meja > 20
          ? '<p class="namig-opis">Sestavljena števila pišemo z vezajem: ' +
            '<b>21 = twenty-one</b>, <b>34 = thirty-four</b>, <b>47 = forty-seven</b>. ' +
            'Pozor: <b>40 = forty</b> (brez »u«!).</p>'
          : '';

        posoda.innerHTML =
          '<div class="plosca konec">' +
          '<div class="sova-uvod">' +
          '<div class="lik-mesto" id="lik-uvod"></div>' +
          '<div class="oblacek">Danes se učimo <b>angleške številke od 0 do ' + meja + '</b>. ' +
          'Najprej si jih oglej, potem pa jih boš zapisal sam. ' +
          'Klikni na kartico, da slišiš izgovorjavo!</div>' +
          '</div>' +
          '<div class="ucenje-seznam" id="ucenje"></div>' +
          sestavljene +
          '<div class="gumbi-vrsta">' +
          '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

        var seznam = document.getElementById('ucenje');
        zaUcenje().forEach(function (n) {
          var el = document.createElement('div');
          el.className = 'ucenje-par';
          el.innerHTML = '<b>' + n + '</b><span>' + beseda(n) + '</span>';
          el.addEventListener('click', function () {
            global.Ucinki.zvok.klik();
            global.Ucinki.izgovori(beseda(n));
          });
          seznam.appendChild(el);
        });

        document.getElementById('gumb-zacni').addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          pokaziVprasanje();
        });
      }

      /* ---------- igralni zaslon ---------- */
      function pokaziVprasanje() {
        var stevilo = stanje.vrstniRed[stanje.kazalec];
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.vrstniRed.length, stanje.tocke) +

          '<div class="igra-glavni">' +
          '<div class="lik-mesto" id="lik-igra"></div>' +
          '<div class="stevilka-kartica" id="stevilka">' + stevilo + '</div>' +
          '<div class="pikice" id="pikice"></div>' +
          '</div>' +

          '<p class="podnaslov" style="margin:20px 0 0">Kako to število zapišemo po angleško?</p>' +

          '<div class="vnos-vrsta">' +
          '<input id="odgovor" type="text" autocomplete="off" autocorrect="off" ' +
          'autocapitalize="off" spellcheck="false" placeholder="napiši tukaj...">' +
          '<button class="gumb zelen" id="gumb-preveri">Preveri</button>' +
          '</div>' +

          '<div class="namig-crke" id="namig"></div>' +
          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '<button class="zvocnik" id="gumb-izgovori" title="Poslušaj">🔊</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');

        /* pikice pomagajo le pri majhnih številih */
        if (stevilo <= 20) {
          var pikice = document.getElementById('pikice');
          for (var i = 0; i < stevilo; i++) {
            var p = document.createElement('div');
            p.className = 'pikica';
            p.style.animationDelay = (i * 0.05) + 's';
            pikice.appendChild(p);
          }
        }

        O.osveziNiz(stanje.niz);

        var vnos = document.getElementById('odgovor');
        vnos.focus();
        vnos.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          if (stanje.odgovorjeno) naprej(); else preveri();
        });

        document.getElementById('gumb-preveri').addEventListener('click', function () {
          if (stanje.odgovorjeno) naprej(); else preveri();
        });
        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);
        document.getElementById('gumb-izgovori').addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          if (stanje.odgovorjeno) global.Ucinki.izgovori(beseda(stevilo));
          else global.Ucinki.izgovori(String(stevilo));
        });
      }

      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        stanje.namigUporabljen = true;
        document.getElementById('namig').textContent =
          namigZa(beseda(stanje.vrstniRed[stanje.kazalec]));
        document.getElementById('gumb-namig').disabled = true;
        document.getElementById('odgovor').focus();
      }

      function preveri() {
        var stevilo = stanje.vrstniRed[stanje.kazalec];
        var pravilna = beseda(stevilo);
        var vnos = document.getElementById('odgovor');
        var vpisano = ocisti(vnos.value);
        if (!vpisano) { vnos.focus(); return; }

        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (vpisano === ocisti(pravilna)) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

          var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
          var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;
          stanje.odgovorjeno = true;

          vnos.className = 'pravilno';
          vnos.blur();
          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() +
            ' +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(24);
          global.Ucinki.izgovori(pravilna);
          document.getElementById('gumb-namig').disabled = true;
          document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
          global.setTimeout(naprej, 1900);
          return;
        }

        /* napačen odgovor */
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        vnos.className = 'napacno';
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Skoraj! Poglej namig in poskusi še enkrat.';
          pokaziNamig();
          vnos.select();
        } else {
          stanje.odgovorjeno = true;
          stanje.napake.push({ vprasanje: stevilo, odgovor: pravilna });
          odziv.className = 'odziv ne';
          odziv.textContent = 'Pravilno je: ' + pravilna.toUpperCase() + ' — si zapomniš?';
          document.getElementById('namig').textContent = pravilna;
          vnos.blur();
          global.Ucinki.izgovori(pravilna);
          document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
        }
      }

      function naprej() {
        if (!stanje.odgovorjeno) return;
        stanje.kazalec += 1;
        if (stanje.kazalec >= stanje.vrstniRed.length) pokaziKonec();
        else pokaziVprasanje();
      }

      /* ---------- zaključek ---------- */
      function pokaziKonec() {
        O.koncniZaslon(posoda, ctx, {
          tocke: stanje.tocke,
          pravilnih: stanje.pravilnih,
          skupaj: stanje.vrstniRed.length,
          najdaljsiNiz: stanje.najdaljsiNiz,
          napake: stanje.napake
        }, {
          ponovi: function () { zazeniZ(meja)(posoda, ctx); },
          sporocila: {
            tri: 'Vrhunsko! Angleške številke že obvladaš!',
            dve: 'Zelo dobro! Še malo vaje in bo popolno.',
            ena: 'Dober začetek! Ponovi še enkrat, gre ti vedno bolje.'
          }
        });
      }
    };
  }

  /* Vsaka stopnja je svoja naloga - ima svoj rekord in svoje točke. */
  global.Igre.registriraj({
    id: 'ang-stevila',
    predmet: 'anglescina',
    razredi: [2, 3, 4, 5],
    naziv: 'Številke 0–10',
    opis: 'Prikaže se število, ti pa ga zapišeš z angleško besedo.',
    ikona: '🔢',
    zazeni: zazeniZ(10)
  });

  global.Igre.registriraj({
    id: 'ang-stevila-20',
    predmet: 'anglescina',
    razredi: [3, 4, 5],
    naziv: 'Številke 0–20',
    opis: 'Tudi najstna števila: eleven, twelve, thirteen …',
    ikona: '🔢',
    zazeni: zazeniZ(20)
  });

  global.Igre.registriraj({
    id: 'ang-stevila-50',
    predmet: 'anglescina',
    razredi: [4, 5],
    naziv: 'Številke 0–50',
    opis: 'Sestavljena števila z vezajem: twenty-one, forty-seven …',
    ikona: '🔢',
    zazeni: zazeniZ(50)
  });
})(window);
