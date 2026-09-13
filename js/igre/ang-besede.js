/* ang-besede.js - Angleščina: mednarodne besede iz vaje S-2
 * "Try to guess the words. Listen and point."
 * Besede so v obeh jezikih podobne, zato se otrok uči prepoznavanja in zapisa.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_VPRASANJ = 10;

  /* za tablico ni emojija, zato jo narišemo */
  var TABLICA = '<svg viewBox="0 0 100 100" class="slika-svg" aria-label="tablica">' +
    '<rect x="21" y="7" width="58" height="86" rx="9" fill="#3a4a7a"/>' +
    '<rect x="27" y="14" width="46" height="68" rx="3" fill="#a9dcff"/>' +
    '<path d="M31 70 l12 -16 9 11 7 -8 10 13z" fill="#7ac4f5"/>' +
    '<circle cx="50" cy="87" r="3.5" fill="#dfe9f7"/>' +
    '</svg>';

  var BESEDE = [
    { ang: 'angel', slo: 'angel', slika: '👼' },
    { ang: 'ballerina', slo: 'balerina', slika: '💃' },
    { ang: 'balloon', slo: 'balon', slika: '🎈' },
    { ang: 'banana', slo: 'banana', slika: '🍌' },
    { ang: 'CD', slo: 'CD, zgoščenka', slika: '💿' },
    { ang: 'clown', slo: 'klovn', slika: '🤡' },
    { ang: 'cowboy', slo: 'kavboj', slika: '🤠' },
    { ang: 'crocodile', slo: 'krokodil', slika: '🐊' },
    { ang: 'dolphin', slo: 'delfin', slika: '🐬' },
    { ang: 'guitar', slo: 'kitara', slika: '🎸' },
    { ang: 'hamburger', slo: 'hamburger', slika: '🍔' },
    { ang: 'kangaroo', slo: 'kenguru', slika: '🦘' },
    { ang: 'mobile phone', slo: 'mobilni telefon', slika: '📱' },
    { ang: 'mum', slo: 'mama', slika: '👩' },
    { ang: 'park', slo: 'park', slika: '🏞️' },
    { ang: 'penguin', slo: 'pingvin', slika: '🐧' },
    { ang: 'pizza', slo: 'pica', slika: '🍕' },
    { ang: 'prince', slo: 'princ', slika: '🤴' },
    { ang: 'princess', slo: 'princesa', slika: '👸' },
    { ang: 'pullover', slo: 'pulover', slika: '🧥' },
    { ang: 'robot', slo: 'robot', slika: '🤖' },
    { ang: 'sandwich', slo: 'sendvič', slika: '🥪' },
    { ang: 'tablet', slo: 'tablica', slika: TABLICA },
    { ang: 'tiger', slo: 'tiger', slika: '🐅' }
  ];

  function najdi(ang) {
    return BESEDE.filter(function (b) { return b.ang === ang; })[0];
  }

  /* Trije naključni moteči odgovori. */
  function motnje(cilj) {
    return O.premesaj(BESEDE.filter(function (b) {
      return b.ang !== cilj.ang;
    })).slice(0, 3);
  }

  function vprasanjePoslusaj(cilj) {
    return {
      tip: 'poslusaj',
      kljuc: cilj.ang,
      naslov: 'Poslušaj in pokaži pravo sliko!',
      pravilen: cilj.ang,
      moznosti: O.premesaj(motnje(cilj).concat(cilj)).map(function (b) { return b.ang; })
    };
  }

  function vprasanjePoglej(cilj) {
    return {
      tip: 'poglej',
      kljuc: cilj.ang,
      naslov: 'Katera angleška beseda je prava?',
      pravilen: cilj.ang,
      moznosti: O.premesaj(motnje(cilj).concat(cilj)).map(function (b) { return b.ang; })
    };
  }

  /* Mešanica obeh tipov; vsaka beseda največ enkrat na krog. */
  function sestaviVprasanja() {
    var kandidati = [];
    BESEDE.forEach(function (b) {
      kandidati.push(vprasanjePoslusaj(b));
      kandidati.push(vprasanjePoglej(b));
    });

    var izbrani = [], uporabljeni = {};
    O.premesaj(kandidati).forEach(function (v) {
      if (izbrani.length >= ST_VPRASANJ || uporabljeni[v.kljuc]) return;
      uporabljeni[v.kljuc] = true;
      izbrani.push(v);
    });
    return izbrani;
  }

  function zazeni(posoda, ctx) {
    pokaziUvod();

    /* ---------- uvod: pregled vseh besed ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Te besede so v <b>angleščini in slovenščini zelo podobne</b> — ' +
        'zato jih znaš že skoraj vse! Klikni sliko, da slišiš izgovorjavo.</div>' +
        '</div>' +
        '<div class="besede-mreza" id="besede"></div>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var mreza = document.getElementById('besede');
      BESEDE.forEach(function (b) {
        var el = document.createElement('div');
        el.className = 'beseda-kartica';
        el.innerHTML = '<span class="slika">' + b.slika + '</span>' +
          '<b>' + b.ang + '</b><span class="prevod">' + b.slo + '</span>';
        el.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          global.Ucinki.izgovori(b.ang);
        });
        mreza.appendChild(el);
      });

      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        vprasanja: sestaviVprasanja(),
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
        var cilj = najdi(v.pravilen);
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        var vprasanjeHtml = v.tip === 'poslusaj'
          ? '<button class="posluh" id="gumb-posluh" title="Poslušaj še enkrat">🔊</button>' +
            '<div class="napis-posluh" id="napis-posluh"></div>'
          : '<div class="slika-kartica">' + cilj.slika + '</div>';

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.vprasanja.length, stanje.tocke) +

          '<div class="igra-glavni">' +
          '<div class="lik-mesto" id="lik-igra"></div>' +
          vprasanjeHtml +
          '</div>' +

          '<p class="podnaslov" style="margin:14px 0 0">' + v.naslov + '</p>' +
          '<div class="moznosti' + (v.tip === 'poslusaj' ? ' slike' : '') + '" id="moznosti"></div>' +
          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        var moznosti = document.getElementById('moznosti');
        v.moznosti.forEach(function (ang) {
          var b = najdi(ang);
          var g = document.createElement('button');
          g.type = 'button';
          g.setAttribute('data-beseda', ang);

          if (v.tip === 'poslusaj') {
            g.className = 'moznost slika';
            g.innerHTML = '<span class="slika">' + b.slika + '</span>';
          } else {
            g.className = 'moznost';
            g.textContent = b.ang;
          }

          g.addEventListener('click', function () { izberi(g, ang); });
          moznosti.appendChild(g);
        });

        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);

        if (v.tip === 'poslusaj') {
          var posluh = document.getElementById('gumb-posluh');
          posluh.addEventListener('click', function () { izgovoriVprasanje(); });
          global.setTimeout(izgovoriVprasanje, 450);
        }
      }

      function izgovoriVprasanje() {
        var v = trenutno();
        var uspelo = global.Ucinki.izgovori(v.pravilen);
        /* če brskalnik ne zna govoriti, besedo pokažemo zapisano */
        if (!uspelo) {
          var napis = document.getElementById('napis-posluh');
          if (napis) napis.textContent = v.pravilen;
        }
      }

      /* Namig: pri poslušanju pokaže zapis, pri sliki odstrani dva napačna odgovora. */
      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        var v = trenutno();
        stanje.namigUporabljen = true;
        global.Ucinki.zvok.klik();

        if (v.tip === 'poslusaj') {
          document.getElementById('napis-posluh').textContent = v.pravilen;
        } else {
          var gumbi = [].slice.call(document.querySelectorAll('.moznost'));
          var napacni = O.premesaj(gumbi.filter(function (g) {
            return g.getAttribute('data-beseda') !== v.pravilen && !g.disabled;
          }));
          napacni.slice(0, 2).forEach(function (g) {
            g.disabled = true;
            g.classList.add('odstranjen');
          });
        }
        document.getElementById('gumb-namig').disabled = true;
      }

      function izberi(gumb, izbrana) {
        if (stanje.odgovorjeno) return;
        var v = trenutno();
        var cilj = najdi(v.pravilen);
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (izbrana === v.pravilen) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

          var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
          var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;
          stanje.odgovorjeno = true;

          gumb.classList.add('pravilna');
          zakleni();
          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + cilj.ang + ' = ' + cilj.slo +
            ' · +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(24);
          global.Ucinki.izgovori(cilj.ang);
          document.getElementById('gumb-namig').disabled = true;
          global.setTimeout(naprej, 2100);
          return;
        }

        /* napačna izbira */
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        gumb.classList.add('napacna');
        gumb.disabled = true;
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Ni to. Poskusi še enkrat!';
        } else {
          stanje.odgovorjeno = true;
          stanje.napake.push({
            vprasanje: cilj.slika + ' ' + cilj.ang,
            odgovor: cilj.slo
          });
          odziv.className = 'odziv ne';
          odziv.textContent = 'Pravilno je: ' + cilj.ang + ' = ' + cilj.slo;
          oznaciPravilno();
          zakleni();
          global.Ucinki.izgovori(cilj.ang);
          global.setTimeout(naprej, 2600);
        }
      }

      function oznaciPravilno() {
        var v = trenutno();
        [].slice.call(document.querySelectorAll('.moznost')).forEach(function (g) {
          if (g.getAttribute('data-beseda') === v.pravilen) g.classList.add('pravilna');
        });
      }

      function zakleni() {
        [].slice.call(document.querySelectorAll('.moznost')).forEach(function (g) {
          g.disabled = true;
        });
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
            naslovNapak: 'Te besede še povadi:',
            sporocila: {
              tri: 'Vrhunsko! Te besede že obvladaš!',
              dve: 'Zelo dobro! Še malo vaje in bo popolno.',
              ena: 'Dober začetek! Najprej si še enkrat oglej slike.'
            }
          });
        } else {
          pokaziVprasanje();
        }
      }
    }
  }

  global.Igre.registriraj({
    id: 'ang-besede',
    predmet: 'anglescina',
    razredi: [3, 4, 5],
    naziv: 'Ugani besede',
    opis: 'Poslušaj besedo in pokaži sliko ali izberi pravo angleško besedo.',
    ikona: '🖼️',
    zazeni: zazeni
  });
})(window);
