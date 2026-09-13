/* mat-sestevanje.js - Matematika: seštevanje (2. razred) */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_VPRASANJ = 10;

  var TEZAVNOSTI = [
    { meja: 10, oznaka: 'Do 10', opis: 'za začetek' },
    { meja: 20, oznaka: 'Do 20', opis: 's prehodom čez desetico' },
    { meja: 100, oznaka: 'Do 100', opis: 'desetice in enice' }
  ];

  function nakljucno(od, do_) {
    return Math.floor(Math.random() * (do_ - od + 1)) + od;
  }

  function enoVprasanje(meja) {
    var a, b;

    if (meja === 10) {
      a = nakljucno(1, 9);
      return { a: a, b: nakljucno(1, 10 - a) };
    }

    if (meja === 20) {
      /* vecinoma racuni s prehodom cez desetico - tam je vaja najbolj potrebna */
      if (Math.random() < 0.6) {
        a = nakljucno(4, 9);
        return { a: a, b: nakljucno(11 - a, 9) };
      }
      a = nakljucno(2, 9);                       /* ostalo: lazji racun brez prehoda */
      return { a: a, b: nakljucno(1, 10 - a) };
    }

    var nacin = Math.random();
    if (nacin < 0.35) {          /* dvomestno + enomestno */
      a = nakljucno(11, 89);
      return { a: a, b: nakljucno(2, Math.min(9, 100 - a)) };
    }
    if (nacin < 0.65) {          /* same desetice */
      a = nakljucno(1, 8) * 10;
      return { a: a, b: nakljucno(1, (100 - a) / 10) * 10 };
    }
    a = nakljucno(11, 79);       /* dvomestno + dvomestno */
    return { a: a, b: nakljucno(10, 100 - a) };
  }

  function sestaviVprasanja(meja) {
    var v = [], videni = {}, varovalka = 0;
    while (v.length < ST_VPRASANJ && varovalka++ < 400) {
      var p = enoVprasanje(meja);
      var kljuc = p.a + '+' + p.b;
      if (videni[kljuc]) continue;
      videni[kljuc] = true;
      v.push(p);
    }
    return v;
  }

  function zazeni(posoda, ctx) {
    var meja = 20;   /* privzeto za 2. razred */

    pokaziUvod();

    /* ---------- uvod: izbira težavnosti ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Danes <b>seštevamo</b>! Izberi, kako težko naj bo. ' +
        'Če se kje zatakne, klikni <b>Namig</b> — pokazal ti bom pikice.</div>' +
        '</div>' +
        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis" id="opis-tezavnosti"></p>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      TEZAVNOSTI.forEach(function (t) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (t.meja === meja ? ' izbran' : '');
        c.textContent = t.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          meja = t.meja;
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
      var t = TEZAVNOSTI.filter(function (x) { return x.meja === meja; })[0];
      document.getElementById('opis-tezavnosti').textContent =
        'Seštevanje do ' + t.meja + ' — ' + t.opis + '.';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        vprasanja: sestaviVprasanja(meja),
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
          '<div class="stevilka-kartica racun">' + v.a + ' + ' + v.b + '</div>' +
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

      /* Namig se prilagodi računu:
         - majhna števila -> pikice v vrstah po 10 (dve barvi)
         - dvomestno + enomestno -> desetice ostanejo, enice preštej s pikicami
         - dvomestno + dvomestno -> razstavitev na desetice in enice */
      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        var v = trenutno();
        stanje.namigUporabljen = true;

        var vsebina;
        if (v.a + v.b <= 20) {
          vsebina = pikice(v.a, v.b,
            v.a + ' rumenih in ' + v.b + ' modrih pikic — polna vrsta je 10!');
        } else if (v.a % 10 === 0 && v.b % 10 === 0) {
          /* same desetice: vsaka pikica je ena desetica */
          vsebina = pikice(v.a / 10, v.b / 10,
            'Vsaka pikica je ena desetica — ' + steviloDesetic(v.a / 10) +
            ' in ' + steviloDesetic(v.b / 10) + '.');
        } else if (v.a < 10 || v.b < 10) {
          vsebina = namigEnice(v);
        } else {
          vsebina = namigRazstavitev(v);
        }

        document.getElementById('namig').innerHTML = vsebina;
        document.getElementById('gumb-namig').disabled = true;
        document.getElementById('odgovor').focus();
      }

      /* Pikice: prvih `prvih` rumenih, ostale modre, v vrstah po 10. */
      function pikice(prvih, drugih, opis) {
        var skupaj = prvih + drugih;
        var vrstice = '', vrsta = '';
        for (var i = 0; i < skupaj; i++) {
          var razred = i < prvih ? '' : ' druga';
          if (i % 10 === 5) razred += ' presledek';
          vrsta += '<i class="' + razred + '" style="animation-delay:' + (i * 0.03) + 's"></i>';
          if (i % 10 === 9 || i === skupaj - 1) {
            vrstice += '<div class="vrsta-tock">' + vrsta + '</div>';
            vrsta = '';
          }
        }
        return '<p class="namig-opis">' + opis + '</p>' +
          '<div class="mreza-tock">' + vrstice + '</div>';
      }

      function razstavi(n) {
        return { desetice: Math.floor(n / 10) * 10, enice: n % 10 };
      }

      /* pravilna slovenska oblika: 1 desetica, 2 desetici, 3 desetice, 5 desetic */
      function steviloDesetic(n) {
        var oblika = n === 1 ? 'desetica' : n === 2 ? 'desetici' :
          (n === 3 || n === 4) ? 'desetice' : 'desetic';
        return n + ' ' + oblika;
      }

      /* 42 + 5: desetice pustimo pri miru, seštejemo samo enice. */
      function namigEnice(v) {
        var dvomestno = v.a >= 10 ? v.a : v.b;
        var enomestno = v.a >= 10 ? v.b : v.a;
        var d = razstavi(dvomestno);

        /* pri okrogli desetici (50 + 9) razstavitev ni potrebna */
        var skatla = d.enice
          ? '<div class="razstavitev"><span class="del">' + dvomestno + ' = <b>' +
            d.desetice + '</b> + <b>' + d.enice + '</b></span></div>'
          : '';

        return '<p class="namig-opis">Desetice ostanejo enake — seštej samo enice!</p>' +
          skatla +
          pikice(d.enice, enomestno, 'Preštej pikice, nato prištej še ' + d.desetice + '.');
      }

      /* 47 + 38: obe števili razstavimo na desetice in enice. */
      function namigRazstavitev(v) {
        function del(n) {
          var r = razstavi(n);
          if (!r.enice) return '<span class="del"><b>' + r.desetice + '</b></span>';
          return '<span class="del">' + n + ' = <b>' + r.desetice + '</b> + <b>' +
            r.enice + '</b></span>';
        }
        return '<p class="namig-opis">Najprej seštej desetice, nato enice.</p>' +
          '<div class="razstavitev">' + del(v.a) + del(v.b) + '</div>';
      }

      function preveri() {
        var v = trenutno();
        var pravilen = v.a + v.b;
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
          odziv.textContent = O.pohvala() + ' ' + v.a + ' + ' + v.b + ' = ' + pravilen +
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
          odziv.textContent = 'Še ne. Poglej namig in poskusi še enkrat.';
          pokaziNamig();
          vnos.select();
        } else {
          stanje.odgovorjeno = true;
          stanje.napake.push({ vprasanje: v.a + ' + ' + v.b, odgovor: pravilen });
          odziv.className = 'odziv ne';
          odziv.textContent = 'Pravilno je: ' + v.a + ' + ' + v.b + ' = ' + pravilen;
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
              tri: 'Vrhunsko! Seštevanje ti gre odlično!',
              dve: 'Zelo dobro! Še malo vaje in bo popolno.',
              ena: 'Dober začetek! Poskusi najprej lažjo stopnjo.'
            }
          });
        } else {
          pokaziVprasanje();
        }
      }
    }
  }

  global.Igre.registriraj({
    id: 'mat-sestevanje',
    predmet: 'matematika',
    razredi: [1, 2, 3],
    naziv: 'Seštevanje',
    opis: 'Seštevaj do 10, 20 ali 100 — težavnost izbereš sam.',
    ikona: '➕',
    zazeni: zazeni
  });
})(window);
