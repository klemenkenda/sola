/* ang-pozdravi.js - Angleščina: poveži oblačke s pozdravi (vlečenje z miško ali klik) */
(function (global) {
  'use strict';

  var O = global.Osnova;

  /* Pari iz Lenartovega seznama. Hello/Goodbye sta vljudna, Hi/Bye prijateljska. */
  var PARI = [
    { ang: 'Good morning', slo: 'Dobro jutro' },
    { ang: 'Good afternoon', slo: 'Dober dan' },
    { ang: 'Good evening', slo: 'Dober večer' },
    { ang: 'Good night', slo: 'Lahko noč' },
    { ang: 'Hello', slo: 'Zdravo' },
    { ang: 'Hi', slo: 'Živjo' },
    { ang: 'Goodbye', slo: 'Nasvidenje' },
    { ang: 'Bye', slo: 'Adijo' },
    { ang: 'See you later', slo: 'Se vidiva pozneje' }
  ];

  function zazeni(posoda, ctx) {
    pokaziUvod();

    /* ---------- uvod: pregled parov ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Učimo se <b>angleške pozdrave</b>. Klikni na kartico, ' +
        'da slišiš izgovorjavo, potem pa v igri <b>povleci črto</b> med oblački, ' +
        'ki gresta skupaj.</div>' +
        '</div>' +
        '<div class="seznam-fraz" id="seznam-fraz"></div>' +
        '<p class="namig-opis"><b>Hello</b> in <b>Goodbye</b> sta bolj vljudna, ' +
        '<b>Hi</b> in <b>Bye</b> pa prijateljska — kot pri nas »zdravo« in »živjo«.</p>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var seznam = document.getElementById('seznam-fraz');
      PARI.forEach(function (p) {
        var el = document.createElement('div');
        el.className = 'fraza-par';
        el.innerHTML = '<b>' + p.ang + '</b><span>' + p.slo + '</span>';
        el.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          global.Ucinki.izgovori(p.ang);
        });
        seznam.appendChild(el);
      });

      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    /* ---------- igra: povezovanje oblačkov ---------- */
    function zacniKrog() {
      var stanje = {
        ujeti: 0,
        tocke: 0,
        pravilnih: 0,
        niz: 0,
        najdaljsiNiz: 0,
        zgreseni: {},        /* indeksi parov, pri katerih je bila napaka ali namig */
        izbrana: { ang: null, slo: null },
        povezani: [],        /* indeksi že povezanih parov - za trajne črte */
        zaklenjeno: false
      };

      var vlecenje = null;
      var ovoj, crte;

      izrisiPlosco();

      function izrisiPlosco() {
        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.ujeti, PARI.length, stanje.tocke) +

          '<p class="podnaslov" style="margin:4px 0 0">' +
          'Povleci črto med oblačkoma, ki gresta skupaj!</p>' +

          '<div class="krog-oder" id="krog-oder">' +
          '<svg class="povezave" id="povezave"></svg>' +
          '<div class="sredina-lik" id="lik-igra"></div>' +
          '</div>' +

          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        ovoj = document.getElementById('krog-oder');
        crte = document.getElementById('povezave');

        izrisiKrog();

        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);
        global.addEventListener('resize', osveziPovezave);
      }

      /* Vse kartice postavimo v krog okoli sove - angleške in slovenske pomešano,
         v dveh polmerih, da se sosedi ne prekrivajo. */
      function izrisiKrog() {
        var vnosi = [];
        PARI.forEach(function (p, i) {
          vnosi.push({ stran: 'ang', indeks: i });
          vnosi.push({ stran: 'slo', indeks: i });
        });
        vnosi = razmakniPare(O.premesaj(vnosi));

        vnosi.forEach(function (v, mesto) {
          var kot = (-90 + mesto * (360 / vnosi.length)) * Math.PI / 180;
          var polmer = mesto % 2 === 0 ? 1 : 0.74;

          var g = document.createElement('button');
          g.type = 'button';
          g.className = 'oblak-kartica ' + v.stran;
          g.setAttribute('data-indeks', v.indeks);
          g.style.left = (50 + Math.cos(kot) * 40 * polmer) + '%';
          g.style.top = (50 + Math.sin(kot) * 39 * polmer) + '%';
          g.innerHTML =
            '<span class="bula b1"></span><span class="bula b2"></span><span class="bula b3"></span>' +
            '<span class="telo">' + PARI[v.indeks][v.stran] + '</span>';
          g.addEventListener('pointerdown', function (e) {
            zacniVlecenje(e, v.stran, v.indeks, g);
          });
          ovoj.appendChild(g);
        });
      }

      /* Para ne postavimo enega ob drugega - črta naj bo lepo dolga. */
      function razmakniPare(vnosi) {
        for (var i = 0; i < vnosi.length; i++) {
          var naslednji = vnosi[(i + 1) % vnosi.length];
          if (vnosi[i].indeks !== naslednji.indeks) continue;

          var zamenjava = (i + Math.floor(vnosi.length / 2)) % vnosi.length;
          var t = vnosi[zamenjava];
          vnosi[zamenjava] = naslednji;
          vnosi[(i + 1) % vnosi.length] = t;
        }
        return vnosi;
      }

      /* ---------- vlečenje z miško / prstom ---------- */

      function zacniVlecenje(e, stran, indeks, gumb) {
        if (stanje.zaklenjeno || gumb.classList.contains('ujeta')) return;
        vlecenje = {
          stran: stran, indeks: indeks, gumb: gumb,
          x0: e.clientX, y0: e.clientY, premaknjen: false
        };
        document.addEventListener('pointermove', medVlecenjem);
        document.addEventListener('pointerup', koncajVlecenje);
        document.addEventListener('pointercancel', prekiniVlecenje);
      }

      function medVlecenjem(e) {
        if (!vlecenje) return;
        var razdalja = Math.abs(e.clientX - vlecenje.x0) + Math.abs(e.clientY - vlecenje.y0);

        if (!vlecenje.premaknjen && razdalja > 8) {
          vlecenje.premaknjen = true;
          vlecenje.gumb.classList.add('izbrana');
          ovoj.classList.add('vlecemo');
        }
        if (!vlecenje.premaknjen) return;

        e.preventDefault();
        narisiAktivnoCrto(e.clientX, e.clientY);
        oznaciCilj(e);
      }

      function koncajVlecenje(e) {
        odstraniPoslusalce();
        var v = vlecenje;
        vlecenje = null;
        pocistiAktivno();
        if (!v) return;

        /* brez premika = navaden klik (tako deluje tudi na tablici) */
        if (!v.premaknjen) {
          klikni(v.stran, v.indeks, v.gumb);
          return;
        }

        v.gumb.classList.remove('izbrana');
        var cilj = karticaPod(e.clientX, e.clientY);
        if (!cilj || cilj.classList.contains('ujeta')) return;

        var ciljStran = cilj.classList.contains('ang') ? 'ang' : 'slo';
        if (ciljStran === v.stran) return;   /* v istem stolpcu ni parov */

        pocistiIzbrano();
        stanje.izbrana[v.stran] = { indeks: v.indeks, gumb: v.gumb };
        stanje.izbrana[ciljStran] = {
          indeks: parseInt(cilj.getAttribute('data-indeks'), 10), gumb: cilj
        };
        preveri();
      }

      function prekiniVlecenje() {
        odstraniPoslusalce();
        if (vlecenje) vlecenje.gumb.classList.remove('izbrana');
        vlecenje = null;
        pocistiAktivno();
      }

      function odstraniPoslusalce() {
        document.removeEventListener('pointermove', medVlecenjem);
        document.removeEventListener('pointerup', koncajVlecenje);
        document.removeEventListener('pointercancel', prekiniVlecenje);
      }

      function karticaPod(x, y) {
        var el = document.elementFromPoint(x, y);
        while (el && el !== document.body) {
          if (el.classList && el.classList.contains('oblak-kartica')) return el;
          el = el.parentNode;
        }
        return null;
      }

      function oznaciCilj(e) {
        var cilj = karticaPod(e.clientX, e.clientY);
        var vsi = document.querySelectorAll('.oblak-kartica.cilj');
        for (var i = 0; i < vsi.length; i++) vsi[i].classList.remove('cilj');

        if (!cilj || cilj === vlecenje.gumb || cilj.classList.contains('ujeta')) return;
        var ciljStran = cilj.classList.contains('ang') ? 'ang' : 'slo';
        if (ciljStran !== vlecenje.stran) cilj.classList.add('cilj');
      }

      function pocistiAktivno() {
        ovoj.classList.remove('vlecemo');
        var aktivna = document.getElementById('crta-aktivna');
        if (aktivna) aktivna.parentNode.removeChild(aktivna);
        var vsi = document.querySelectorAll('.oblak-kartica.cilj');
        for (var i = 0; i < vsi.length; i++) vsi[i].classList.remove('cilj');
      }

      function pocistiIzbrano() {
        var vsi = document.querySelectorAll('.oblak-kartica.izbrana');
        for (var i = 0; i < vsi.length; i++) vsi[i].classList.remove('izbrana');
        stanje.izbrana = { ang: null, slo: null };
      }

      /* ---------- črte ---------- */

      function sredisce(el) {
        var r = el.getBoundingClientRect();
        var o = ovoj.getBoundingClientRect();
        return { x: r.left - o.left + r.width / 2, y: r.top - o.top + r.height / 2 };
      }

      function pot(a, b) {
        var dx = Math.max(30, Math.abs(b.x - a.x) / 2);
        return 'M' + a.x + ',' + a.y + ' C' + (a.x + dx) + ',' + a.y +
          ' ' + (b.x - dx) + ',' + b.y + ' ' + b.x + ',' + b.y;
      }

      function narisiAktivnoCrto(x, y) {
        var o = ovoj.getBoundingClientRect();
        var zac = sredisce(vlecenje.gumb);
        var kon = { x: x - o.left, y: y - o.top };

        var crta = document.getElementById('crta-aktivna');
        if (!crta) {
          crta = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          crta.setAttribute('id', 'crta-aktivna');
          crta.setAttribute('class', 'crta aktivna');
          crte.appendChild(crta);
        }
        crta.setAttribute('d', pot(zac, kon));
      }

      function kartica(stran, indeks) {
        return document.querySelector('.oblak-kartica.' + stran + '[data-indeks="' + indeks + '"]');
      }

      function osveziPovezave() {
        if (!crte) return;
        var aktivna = document.getElementById('crta-aktivna');
        crte.innerHTML = '';
        if (aktivna) crte.appendChild(aktivna);

        stanje.povezani.forEach(function (indeks) {
          var a = kartica('ang', indeks), s = kartica('slo', indeks);
          if (!a || !s) return;
          var crta = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          crta.setAttribute('class', 'crta ujeta');
          crta.setAttribute('d', pot(sredisce(a), sredisce(s)));
          crte.appendChild(crta);
        });
      }

      /* ---------- klik (brez vlečenja) ---------- */

      function klikni(stran, indeks, gumb) {
        if (stanje.zaklenjeno || gumb.classList.contains('ujeta')) return;

        if (stanje.izbrana[stran] && stanje.izbrana[stran].gumb === gumb) {
          gumb.classList.remove('izbrana');
          stanje.izbrana[stran] = null;
          return;
        }

        if (stanje.izbrana[stran]) stanje.izbrana[stran].gumb.classList.remove('izbrana');
        gumb.classList.add('izbrana');
        stanje.izbrana[stran] = { indeks: indeks, gumb: gumb };

        global.Ucinki.zvok.klik();
        if (stran === 'ang') global.Ucinki.izgovori(PARI[indeks].ang);

        if (stanje.izbrana.ang && stanje.izbrana.slo) preveri();
      }

      /* ---------- preverjanje para ---------- */

      function preveri() {
        var a = stanje.izbrana.ang;
        var s = stanje.izbrana.slo;
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        stanje.izbrana = { ang: null, slo: null };

        if (a.indeks === s.indeks) {
          var brezPomoci = !stanje.zgreseni[a.indeks];
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

          var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);
          stanje.tocke += prisluzeno;
          stanje.ujeti += 1;
          if (brezPomoci) stanje.pravilnih += 1;
          stanje.povezani.push(a.indeks);

          [a.gumb, s.gumb].forEach(function (g) {
            g.classList.remove('izbrana', 'cilj');
            g.classList.add('ujeta');
            g.disabled = true;
          });
          osveziPovezave();

          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + PARI[a.indeks].ang + ' = ' +
            PARI[a.indeks].slo + ' · +' + prisluzeno + ' točk' +
            (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');

          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(18);
          global.Ucinki.izgovori(PARI[a.indeks].ang);

          osveziStanje();

          if (stanje.ujeti >= PARI.length) {
            stanje.zaklenjeno = true;
            global.setTimeout(pokaziKonec, 1500);
          }
          return;
        }

        /* napačen par */
        stanje.zgreseni[a.indeks] = true;
        stanje.zgreseni[s.indeks] = true;
        stanje.niz = 0;

        odziv.className = 'odziv ne';
        odziv.textContent = 'Ta dva ne gresta skupaj. Poskusi znova!';
        global.Liki.reagiraj(lik, false);
        global.Ucinki.zvok.napacno();

        stanje.zaklenjeno = true;
        [a.gumb, s.gumb].forEach(function (g) { g.classList.add('zgresena'); });
        global.setTimeout(function () {
          [a.gumb, s.gumb].forEach(function (g) {
            g.classList.remove('zgresena', 'izbrana', 'cilj');
          });
          stanje.zaklenjeno = false;
        }, 700);

        osveziStanje();
      }

      /* Namig: pokaže par izbranega oblačka (velja kot pomoč). */
      function pokaziNamig() {
        if (stanje.zaklenjeno) return;
        var odziv = document.getElementById('odziv');
        var izbran = stanje.izbrana.ang || stanje.izbrana.slo;

        if (!izbran) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Najprej klikni en oblaček, potem ti pokažem njegov par.';
          return;
        }

        var indeks = izbran.indeks;
        stanje.zgreseni[indeks] = true;
        stanje.niz = 0;

        var iskana = stanje.izbrana.ang ? 'slo' : 'ang';
        var par = kartica(iskana, indeks);
        if (par) {
          par.classList.add('namignjena');
          global.setTimeout(function () { par.classList.remove('namignjena'); }, 2000);
        }

        odziv.className = 'odziv ok';
        odziv.textContent = PARI[indeks].ang + ' = ' + PARI[indeks].slo;
        global.Ucinki.zvok.klik();
        osveziStanje();
      }

      function osveziStanje() {
        var vrstica = document.querySelector('.vrstica-stanja');
        if (!vrstica) return;
        vrstica.children[0].textContent = 'Parov: ' + stanje.ujeti + '/' + PARI.length;
        document.getElementById('crta').style.width =
          (stanje.ujeti / PARI.length * 100) + '%';
        vrstica.children[2].textContent = '⭐ ' + stanje.tocke;
        O.osveziNiz(stanje.niz);
      }

      function pokaziKonec() {
        global.removeEventListener('resize', osveziPovezave);

        var napake = Object.keys(stanje.zgreseni).map(function (i) {
          return { vprasanje: PARI[i].ang, odgovor: PARI[i].slo };
        });

        O.koncniZaslon(posoda, ctx, {
          tocke: stanje.tocke,
          pravilnih: stanje.pravilnih,
          skupaj: PARI.length,
          najdaljsiNiz: stanje.najdaljsiNiz,
          napake: napake
        }, {
          ponovi: function () { zazeni(posoda, ctx); },
          naslovNapak: 'Te pare še povadi:',
          sporocila: {
            tri: 'Vrhunsko! Pozdrave že obvladaš!',
            dve: 'Zelo dobro! Še malo vaje in bo popolno.',
            ena: 'Dober začetek! Najprej si še enkrat oglej seznam.'
          }
        });
      }
    }
  }

  global.Igre.registriraj({
    id: 'ang-pozdravi',
    predmet: 'anglescina',
    razredi: [2, 3, 4, 5],
    naziv: 'Pozdravi — poveži oblačke',
    opis: 'Povleci črto med angleškim pozdravom in slovenskim prevodom.',
    ikona: '👋',
    zazeni: zazeni
  });
})(window);
