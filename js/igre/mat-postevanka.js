/* mat-postevanka.js - Matematika: poštevanka do 10 (4. razred) */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_VPRASANJ = 10;

  /* Sestavi 10 razlicnih racunov. izbrana = null -> pomesano, sicer poštevanka tega stevila. */
  function sestaviVprasanja(izbrana) {
    if (izbrana) {
      return O.premesaj([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(function (b) {
        return { a: izbrana, b: b };
      });
    }

    var vsi = [];
    for (var a = 2; a <= 10; a++) {
      for (var b = 2; b <= 10; b++) vsi.push({ a: a, b: b });
    }
    return O.premesaj(vsi).slice(0, ST_VPRASANJ);
  }

  function zazeni(posoda, ctx) {
    var izbrana = null;   /* katero poštevanko vadimo (null = pomešano) */

    pokaziUvod();

    /* ---------- uvod: izbira poštevanke in ponovitev ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Vadimo <b>poštevanko do 10</b>. Izberi, katero poštevanko želiš ' +
        'vaditi, ali pa kar <b>vse pomešano</b> — to je najtežje in vredno največ točk slave!</div>' +
        '</div>' +
        '<div class="cipi" id="cipi"></div>' +
        '<div id="pregled"></div>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      var moznosti = [{ oznaka: '🎲 Vse pomešano', vrednost: null }];
      for (var i = 2; i <= 10; i++) moznosti.push({ oznaka: i + '-krat', vrednost: i });

      moznosti.forEach(function (m) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (m.vrednost === izbrana ? ' izbran' : '');
        c.textContent = m.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          izbrana = m.vrednost;
          var vsi = cipi.querySelectorAll('.cip');
          for (var k = 0; k < vsi.length; k++) vsi[k].classList.remove('izbran');
          c.classList.add('izbran');
          izrisiPregled();
        });
        cipi.appendChild(c);
      });

      izrisiPregled();
      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    /* Ponovitev pred igro: izbrana poštevanka po vrsti, sicer celotna tabela. */
    function izrisiPregled() {
      var pregled = document.getElementById('pregled');

      if (izbrana) {
        var kartice = '';
        for (var b = 1; b <= 10; b++) {
          kartice += '<div class="ucenje-par"><b>' + izbrana + ' × ' + b + '</b><span>' +
            (izbrana * b) + '</span></div>';
        }
        pregled.innerHTML = '<div class="ucenje-seznam">' + kartice + '</div>';
        return;
      }

      var vrstice = '<tr><th>×</th>';
      for (var g = 1; g <= 10; g++) vrstice += '<th>' + g + '</th>';
      vrstice += '</tr>';
      for (var v = 1; v <= 10; v++) {
        vrstice += '<tr><th>' + v + '</th>';
        for (var s = 1; s <= 10; s++) {
          vrstice += '<td>' + (v * s) + '</td>';
        }
        vrstice += '</tr>';
      }
      pregled.innerHTML = '<div class="tabela-ovoj"><table class="tabela-postevanke">' +
        vrstice + '</table></div>';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        vprasanja: sestaviVprasanja(izbrana),
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

      pokaziVprasanje();

      function trenutno() {
        return stanje.vprasanja[stanje.kazalec];
      }

      function pokaziVprasanje() {
        var v = trenutno();
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.vprasanja.length, stanje.tocke) +

          '<div class="igra-glavni">' +
          '<div class="lik-mesto" id="lik-igra"></div>' +
          '<div class="stevilka-kartica racun">' + v.a + ' × ' + v.b + '</div>' +
          '</div>' +

          '<p class="podnaslov" style="margin:20px 0 0">Koliko je to?</p>' +

          '<div class="vnos-vrsta">' +
          '<input id="odgovor" type="text" inputmode="numeric" autocomplete="off" ' +
          'spellcheck="false" placeholder="?">' +
          '<button class="gumb zelen" id="gumb-preveri">Preveri</button>' +
          '</div>' +

          '<div id="namig"></div>' +
          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
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
        document.getElementById('gumb-namig').addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          pokaziNamig();
        });
      }

      /* Namig: pravokotnik pikic - a vrstic po b pikic, da otrok vidi, zakaj racun drzi. */
      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        var v = trenutno();
        stanje.namigUporabljen = true;

        var vrstice = '';
        for (var i = 0; i < v.a; i++) {
          var vrsta = '';
          for (var j = 0; j < v.b; j++) {
            vrsta += '<i style="animation-delay:' + ((i * v.b + j) * 0.012) + 's"></i>';
          }
          vrstice += '<div class="vrsta-tock">' + vrsta + '</div>';
        }
        document.getElementById('namig').innerHTML =
          '<p class="namig-opis">' + v.a + ' vrstic po ' + v.b + ' pikic — preštej jih!</p>' +
          '<div class="mreza-tock">' + vrstice + '</div>';

        document.getElementById('gumb-namig').disabled = true;
        document.getElementById('odgovor').focus();
      }

      function preveri() {
        var v = trenutno();
        var pravilen = v.a * v.b;
        var vnos = document.getElementById('odgovor');
        var vpisano = vnos.value.replace(/\s/g, '');
        if (!vpisano) { vnos.focus(); return; }

        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (parseInt(vpisano, 10) === pravilen) {
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
          odziv.textContent = O.pohvala() + ' ' + v.a + ' × ' + v.b + ' = ' + pravilen +
            ' · +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(24);
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
          odziv.textContent = 'Še ne. Poglej pikice in poskusi še enkrat.';
          pokaziNamig();
          vnos.select();
        } else {
          stanje.odgovorjeno = true;
          stanje.napake.push({ vprasanje: v.a + ' × ' + v.b, odgovor: pravilen });
          odziv.className = 'odziv ne';
          odziv.textContent = 'Pravilno je: ' + v.a + ' × ' + v.b + ' = ' + pravilen;
          vnos.blur();
          document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
        }
      }

      function naprej() {
        if (!stanje.odgovorjeno) return;
        stanje.kazalec += 1;
        if (stanje.kazalec >= stanje.vprasanja.length) {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.pravilnih,
            skupaj: stanje.vprasanja.length,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: stanje.napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            naslovNapak: 'Te račune še povadi:',
            sporocila: {
              tri: 'Vrhunsko! Poštevanko že obvladaš!',
              dve: 'Zelo dobro! Še malo vaje in bo popolno.',
              ena: 'Dober začetek! Izberi eno poštevanko in jo povadi.'
            }
          });
        } else {
          pokaziVprasanje();
        }
      }
    }
  }

  global.Igre.registriraj({
    id: 'mat-postevanka',
    predmet: 'matematika',
    razredi: [3, 4, 5],
    naziv: 'Poštevanka do 10',
    opis: 'Izberi eno poštevanko ali vse pomešano in reši 10 računov.',
    ikona: '✖️',
    zazeni: zazeni
  });
})(window);
