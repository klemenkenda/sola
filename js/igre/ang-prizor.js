/* ang-prizor.js - Angleščina: poišči stvari na sliki (Starter unit, Strawberry Street)
 * Prizor je narisan z SVG; vsak pojem je svoje klikljivo območje.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;

  /* oznaka = položaj napisa nad sliko (v odstotkih) */
  var POJMI = [
    { kljuc: 'a window', slo: 'okno', oznaka: { x: 29, y: 22 } },
    { kljuc: 'trees', slo: 'drevesa', oznaka: { x: 62, y: 15 } },
    { kljuc: 'a classroom', slo: 'učilnica', oznaka: { x: 78, y: 14 } },
    { kljuc: 'a teacher', slo: 'učiteljica', oznaka: { x: 92, y: 32 } },
    { kljuc: 'a pond', slo: 'ribnik', oznaka: { x: 13, y: 60 } },
    { kljuc: 'a park', slo: 'park', oznaka: { x: 35, y: 57 } },
    { kljuc: 'a playground', slo: 'igrišče', oznaka: { x: 63, y: 93 } },
    { kljuc: 'children', slo: 'otroci', oznaka: { x: 20, y: 90 } },
    { kljuc: 'mum', slo: 'mama', oznaka: { x: 88, y: 66 } }
  ];

  function pojem(kljuc) {
    return POJMI.filter(function (p) { return p.kljuc === kljuc; })[0];
  }

  /* Eno klikljivo območje: nevidni pravokotnik + obroč, ki se prikaže ob najdbi. */
  function tocka(kljuc, x, y, s, v, vsebina) {
    return '<g class="tocka" data-kljuc="' + kljuc + '">' +
      '<rect class="obmocje" x="' + x + '" y="' + y + '" width="' + s + '" height="' + v + '"/>' +
      vsebina +
      '<rect class="obroc" x="' + x + '" y="' + y + '" width="' + s + '" height="' + v + '" rx="14"/>' +
      '</g>';
  }

  function drevo(x, y, r) {
    return '<rect x="' + (x - 6) + '" y="' + y + '" width="12" height="' + (r * 1.1) + '" fill="#a9713f"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#5fa84a"/>' +
      '<circle cx="' + (x - r * 0.6) + '" cy="' + (y + r * 0.45) + '" r="' + (r * 0.7) + '" fill="#6fbb56"/>' +
      '<circle cx="' + (x + r * 0.6) + '" cy="' + (y + r * 0.4) + '" r="' + (r * 0.65) + '" fill="#559c42"/>';
  }

  function otrok(x, y, majica, hlace) {
    return '<g>' +
      '<circle cx="' + x + '" cy="' + (y - 26) + '" r="11" fill="#ffd9b3"/>' +
      '<path d="M' + (x - 11) + ',' + (y - 32) + ' q11,-12 22,0 z" fill="#6b4423"/>' +
      '<rect x="' + (x - 10) + '" y="' + (y - 15) + '" width="20" height="22" rx="7" fill="' + majica + '"/>' +
      '<rect x="' + (x - 9) + '" y="' + (y + 6) + '" width="7" height="16" rx="3" fill="' + hlace + '"/>' +
      '<rect x="' + (x + 2) + '" y="' + (y + 6) + '" width="7" height="16" rx="3" fill="' + hlace + '"/>' +
      '</g>';
  }

  function hisa(x, y, s, v, stena, streha) {
    return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + v + '" fill="' + stena + '"/>' +
      '<path d="M' + (x - 10) + ',' + y + ' L' + (x + s / 2) + ',' + (y - 42) +
      ' L' + (x + s + 10) + ',' + y + ' z" fill="' + streha + '"/>';
  }

  function okno(x, y, s, v) {
    return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + v + '" rx="3" fill="#bfe4ff" stroke="#fff" stroke-width="4"/>' +
      '<path d="M' + (x + s / 2) + ',' + y + ' V' + (y + v) + ' M' + x + ',' + (y + v / 2) + ' H' + (x + s) + '" stroke="#fff" stroke-width="4"/>';
  }

  function prizorSvg() {
    return '<svg class="prizor" viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg">' +

      /* nebo, trava, cesta */
      '<rect width="800" height="520" fill="#a9e0ff"/>' +
      '<circle cx="120" cy="60" r="34" fill="#ffe066"/>' +
      '<ellipse cx="640" cy="55" rx="52" ry="20" fill="#fff" opacity=".9"/>' +
      '<ellipse cx="300" cy="45" rx="40" ry="16" fill="#fff" opacity=".85"/>' +
      '<rect y="300" width="800" height="220" fill="#7bd36a"/>' +
      '<rect y="255" width="800" height="48" fill="#b9c2cc"/>' +
      '<path d="M0,279 H800" stroke="#fff" stroke-width="4" stroke-dasharray="26 20"/>' +

      /* hiše */
      hisa(30, 150, 130, 105, '#fdf3e0', '#e2574c') +
      hisa(300, 140, 120, 115, '#fff0f5', '#d4574f') +
      okno(60, 175, 34, 34) + okno(115, 175, 34, 34) +
      okno(325, 170, 30, 30) + okno(375, 170, 30, 30) +
      '<rect x="345" y="215" width="34" height="40" rx="4" fill="#a9713f"/>' +

      /* rumena hiša z velikim oknom = "a window" */
      hisa(175, 130, 115, 125, '#ffe08a', '#e2574c') +
      tocka('a window', 205, 158, 58, 58,
        okno(212, 165, 44, 44) +
        '<path d="M212,187 h44 M234,165 v44" stroke="#fff" stroke-width="4"/>') +
      '<rect x="196" y="212" width="26" height="43" rx="3" fill="#a9713f"/>' +

      /* avto na cesti */
      '<g><rect x="60" y="262" width="96" height="26" rx="10" fill="#e2574c"/>' +
      '<path d="M78,262 l14,-16 h34 l14,16z" fill="#ffd9e0"/>' +
      '<circle cx="84" cy="292" r="10" fill="#3a3f4a"/><circle cx="140" cy="292" r="10" fill="#3a3f4a"/></g>' +

      /* drevesa */
      tocka('trees', 440, 116, 116, 146,
        drevo(470, 175, 34) + drevo(525, 190, 27)) +

      /* šola */
      '<rect x="575" y="105" width="215" height="198" fill="#fdf3e0"/>' +
      '<path d="M565,105 L682,58 L800,105 z" fill="#d4574f"/>' +
      '<rect x="600" y="248" width="120" height="30" rx="5" fill="#fff" stroke="#3a4a7a" stroke-width="3"/>' +
      '<text x="660" y="270" text-anchor="middle" font-size="20" font-weight="700" fill="#243b6b">SCHOOL</text>' +

      /* učilnica = okno s tablo */
      tocka('a classroom', 592, 120, 122, 92,
        '<rect x="600" y="128" width="106" height="76" rx="4" fill="#cfe9ff" stroke="#fff" stroke-width="4"/>' +
        '<rect x="612" y="140" width="56" height="40" rx="3" fill="#2f6b4a"/>' +
        '<text x="640" y="158" text-anchor="middle" font-size="11" fill="#fff">Good</text>' +
        '<text x="640" y="172" text-anchor="middle" font-size="11" fill="#fff">morning!</text>' +
        '<rect x="676" y="166" width="22" height="14" rx="2" fill="#c98a3f"/>') +

      /* učiteljica pri vratih */
      '<rect x="726" y="212" width="46" height="91" rx="4" fill="#a9713f"/>' +
      tocka('a teacher', 722, 196, 56, 110,
        '<circle cx="750" cy="232" r="14" fill="#ffd9b3"/>' +
        '<path d="M736,228 q14,-18 28,0 q-6,-14 -28,-2z" fill="#8a4b2a"/>' +
        '<path d="M734,250 h32 l6,52 h-44z" fill="#e0559b"/>' +
        '<rect x="742" y="300" width="7" height="12" fill="#6b4423"/>' +
        '<rect x="753" y="300" width="7" height="12" fill="#6b4423"/>') +

      /* ribnik */
      tocka('a pond', 36, 342, 168, 84,
        '<ellipse cx="120" cy="384" rx="76" ry="34" fill="#5cc5f0"/>' +
        '<ellipse cx="120" cy="379" rx="60" ry="24" fill="#7ad6fb"/>' +
        '<g><ellipse cx="136" cy="371" rx="17" ry="10" fill="#fff"/>' +
        '<circle cx="152" cy="363" r="8" fill="#fff"/>' +
        '<path d="M158,362 l9,3 -9,3z" fill="#ff9f43"/>' +
        '<circle cx="154" cy="361" r="1.8" fill="#243b6b"/></g>' +
        '<path d="M60,368 q8,-6 16,0" stroke="#fff" stroke-width="3" fill="none"/>') +

      /* park: klopca, pot, rože */
      tocka('a park', 214, 330, 118, 92,
        '<path d="M214,410 q60,-26 118,-8" stroke="#e8d9a8" stroke-width="14" fill="none"/>' +
        '<g><rect x="238" y="356" width="70" height="9" rx="3" fill="#c98a3f"/>' +
        '<rect x="238" y="338" width="70" height="8" rx="3" fill="#d99a4e"/>' +
        '<rect x="242" y="365" width="7" height="20" fill="#a9713f"/>' +
        '<rect x="297" y="365" width="7" height="20" fill="#a9713f"/></g>' +
        '<g><circle cx="226" cy="392" r="7" fill="#ff6b9d"/><circle cx="226" cy="392" r="3" fill="#ffe066"/></g>' +
        '<g><circle cx="320" cy="386" r="7" fill="#b08aff"/><circle cx="320" cy="386" r="3" fill="#ffe066"/></g>') +

      /* igrišče: tobogan, gugalnica, peskovnik */
      tocka('a playground', 352, 308, 196, 162,
        '<g><rect x="366" y="336" width="9" height="96" fill="#c98a3f"/>' +
        '<rect x="414" y="336" width="9" height="96" fill="#c98a3f"/>' +
        '<path d="M366,340 h57 M366,362 h57 M366,384 h57" stroke="#c98a3f" stroke-width="7"/>' +
        '<path d="M423,340 L466,430 h-16 L407,352z" fill="#dfe9f7"/></g>' +
        '<g><rect x="480" y="330" width="8" height="100" fill="#8a5a2b"/>' +
        '<rect x="540" y="330" width="8" height="100" fill="#8a5a2b"/>' +
        '<rect x="472" y="326" width="84" height="9" rx="4" fill="#a9713f"/>' +
        '<path d="M500,335 v46 M528,335 v46" stroke="#5a6b80" stroke-width="3"/>' +
        '<rect x="494" y="380" width="40" height="8" rx="3" fill="#e2574c"/></g>' +
        '<ellipse cx="400" cy="448" rx="44" ry="16" fill="#f0d9a8"/>') +

      /* otroci */
      tocka('children', 196, 428, 150, 84,
        otrok(224, 474, '#4fb0ff', '#3a4a7a') +
        otrok(268, 470, '#ff6b9d', '#7a45f0') +
        otrok(312, 476, '#ffc53d', '#2f9c45') +
        '<circle cx="246" cy="496" r="12" fill="#fff" stroke="#e2574c" stroke-width="3"/>') +

      /* mama z vozičkom */
      tocka('mum', 624, 372, 160, 132,
        '<g><circle cx="680" cy="404" r="16" fill="#ffd9b3"/>' +
        '<path d="M664,400 q16,-20 32,-2 q2,-18 -16,-18 q-16,0 -16,20z" fill="#c98a3f"/>' +
        '<path d="M662,424 h36 l8,60 h-52z" fill="#ff8ab4"/>' +
        '<rect x="670" y="482" width="9" height="16" fill="#8a4b2a"/>' +
        '<rect x="683" y="482" width="9" height="16" fill="#8a4b2a"/>' +
        '<path d="M698,430 l40,14" stroke="#ffd9b3" stroke-width="7" stroke-linecap="round"/></g>' +
        '<g><path d="M736,436 q34,4 30,40 h-46z" fill="#5cc5f0"/>' +
        '<circle cx="730" cy="486" r="11" fill="#3a3f4a"/><circle cx="768" cy="486" r="11" fill="#3a3f4a"/>' +
        '<circle cx="752" cy="452" r="9" fill="#ffd9b3"/></g>') +

      '</svg>';
  }

  function zazeni(posoda, ctx) {
    pokaziUvod();

    /* ---------- uvod: prizor z vsemi napisi ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">To je <b>Strawberry Street</b>. Oglej si napise in klikni ' +
        'nanje, da slišiš izgovorjavo. V igri boš moral stvari <b>poiskati na sliki</b>.</div>' +
        '</div>' +
        '<div class="prizor-ovoj" id="prizor-ovoj">' + prizorSvg() + '</div>' +
        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var ovoj = document.getElementById('prizor-ovoj');
      POJMI.forEach(function (p) {
        var o = document.createElement('button');
        o.type = 'button';
        o.className = 'oznaka';
        o.style.left = p.oznaka.x + '%';
        o.style.top = p.oznaka.y + '%';
        o.innerHTML = p.kljuc + '<small>' + p.slo + '</small>';
        o.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          global.Ucinki.izgovori(p.kljuc.replace(/^an? /, ''));
        });
        ovoj.appendChild(o);
      });

      document.getElementById('gumb-zacni').addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        zacniKrog();
      });
    }

    /* ---------- igra: poišči na sliki ---------- */
    function zacniKrog() {
      var stanje = {
        vrstniRed: O.premesaj(POJMI.map(function (p) { return p.kljuc; })),
        kazalec: 0,
        tocke: 0,
        pravilnih: 0,
        niz: 0,
        najdaljsiNiz: 0,
        namigUporabljen: false,
        poskus: 0,
        odgovorjeno: false,
        napake: [],
        najdeni: []
      };

      izrisiPlosco();
      postaviVprasanje();

      function izrisiPlosco() {
        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.vrstniRed.length, stanje.tocke) +

          '<div class="isci-vrstica">' +
          '<div class="lik-mesto" id="lik-igra"></div>' +
          '<div class="isci-besedilo">' +
          '<span class="isci-naslov">Poišči na sliki:</span>' +
          '<span class="isci-pojem" id="isci-pojem"></span>' +
          '</div>' +
          '<button class="zvocnik" id="gumb-izgovori" title="Poslušaj">🔊</button>' +
          '</div>' +

          '<div class="prizor-ovoj" id="prizor-ovoj">' + prizorSvg() + '</div>' +
          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig (slovensko)</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        document.getElementById('prizor-ovoj').addEventListener('click', klikNaPrizor);
        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);
        document.getElementById('gumb-izgovori').addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          izgovoriPojem();
        });
      }

      function trenutni() {
        return stanje.vrstniRed[stanje.kazalec];
      }

      function izgovoriPojem() {
        global.Ucinki.izgovori(trenutni().replace(/^an? /, ''));
      }

      function postaviVprasanje() {
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        document.getElementById('isci-pojem').textContent = trenutni();
        document.getElementById('gumb-namig').disabled = false;
        var odziv = document.getElementById('odziv');
        odziv.className = 'odziv';
        odziv.textContent = '';

        global.setTimeout(izgovoriPojem, 350);
      }

      function skupina(kljuc) {
        return document.querySelector('.tocka[data-kljuc="' + kljuc + '"]');
      }

      function klikNaPrizor(e) {
        if (stanje.odgovorjeno) return;

        var el = e.target;
        while (el && el !== document.body && !(el.classList && el.classList.contains('tocka'))) {
          el = el.parentNode;
        }
        if (!el || !el.classList || !el.classList.contains('tocka')) return;   /* klik mimo */

        var izbran = el.getAttribute('data-kljuc');
        var cilj = trenutni();
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (izbran === cilj) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

          var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
          var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;
          stanje.odgovorjeno = true;
          stanje.najdeni.push(cilj);

          el.classList.add('najdena');
          dodajOznako(cilj);

          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + cilj + ' = ' + pojem(cilj).slo +
            ' · +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(20);
          izgovoriPojem();
          global.setTimeout(naprej, 1900);
          return;
        }

        /* klik na napačno stvar */
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        el.classList.add('zgresena');
        global.setTimeout(function () { el.classList.remove('zgresena'); }, 700);
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Ni to. Poišči še enkrat — ' + cilj + '!';
        } else {
          stanje.odgovorjeno = true;
          stanje.napake.push({ vprasanje: cilj, odgovor: pojem(cilj).slo });
          odziv.className = 'odziv ne';
          odziv.textContent = 'Tukaj je: ' + cilj + ' = ' + pojem(cilj).slo;
          var pravi = skupina(cilj);
          if (pravi) pravi.classList.add('najdena');
          dodajOznako(cilj);
          izgovoriPojem();
          global.setTimeout(naprej, 2400);
        }
      }

      /* Napis se prilepi na sliko, ko je pojem najden - kot v učbeniku. */
      function dodajOznako(kljuc) {
        var p = pojem(kljuc);
        var ovoj = document.getElementById('prizor-ovoj');
        var o = document.createElement('span');
        o.className = 'oznaka najdena';
        o.style.left = p.oznaka.x + '%';
        o.style.top = p.oznaka.y + '%';
        o.textContent = p.kljuc;
        ovoj.appendChild(o);
      }

      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        stanje.namigUporabljen = true;
        var odziv = document.getElementById('odziv');
        odziv.className = 'odziv';
        odziv.textContent = 'Po slovensko: ' + pojem(trenutni()).slo;
        document.getElementById('gumb-namig').disabled = true;
        global.Ucinki.zvok.klik();
      }

      function naprej() {
        if (!stanje.odgovorjeno) return;
        stanje.kazalec += 1;

        var vrstica = document.querySelector('.vrstica-stanja');
        if (vrstica) {
          vrstica.children[0].textContent = 'Pojem ' + Math.min(stanje.kazalec + 1, stanje.vrstniRed.length) +
            '/' + stanje.vrstniRed.length;
          document.getElementById('crta').style.width =
            (stanje.kazalec / stanje.vrstniRed.length * 100) + '%';
          vrstica.children[2].textContent = '⭐ ' + stanje.tocke;
        }

        if (stanje.kazalec >= stanje.vrstniRed.length) pokaziKonec();
        else postaviVprasanje();
      }

      function pokaziKonec() {
        O.koncniZaslon(posoda, ctx, {
          tocke: stanje.tocke,
          pravilnih: stanje.pravilnih,
          skupaj: stanje.vrstniRed.length,
          najdaljsiNiz: stanje.najdaljsiNiz,
          napake: stanje.napake
        }, {
          ponovi: function () { zazeni(posoda, ctx); },
          naslovNapak: 'Te besede še povadi:',
          sporocila: {
            tri: 'Vrhunsko! Vso ulico že poznaš!',
            dve: 'Zelo dobro! Še malo vaje in bo popolno.',
            ena: 'Dober začetek! Najprej si še enkrat oglej napise.'
          }
        });
      }
    }
  }

  global.Igre.registriraj({
    id: 'ang-prizor',
    predmet: 'anglescina',
    razredi: [2, 3, 4, 5],
    naziv: 'Strawberry Street',
    opis: 'Poišči na sliki: a park, a pond, a playground, children …',
    ikona: '🏘️',
    zazeni: zazeni
  });
})(window);
