/* slo-abeceda.js - Slovenščina: abeceda in skrivno sporočilo
 * Otrok najprej dopolni pet manjkajočih črk abecede (vsaka ima svojo številko),
 * nato s to abecedo kot ključem razvozla skrivno sporočilo z zmajskega stolpa.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;

  /* slovenska abeceda - 25 črk; številka črke je njeno mesto v tem seznamu */
  var ABECEDA = ['A', 'B', 'C', 'Č', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'V', 'Z', 'Ž'];

  var ST_CRK = 5;          /* koliko črk abecede otrok dopolni pred sporočilom */
  var MEJA_KRATKO = 30;    /* do toliko črk je sporočilo še "krajše" */

  /* Sporočila z zmajskega stolpa nad Polano. Uporabljajo samo črke slovenske
     abecede (brez q, w, x, y), da se da vsako črko zapisati s številko. */
  var SPOROCILA = [
    'Polanski zmaj spi. Vse je v redu.',
    'Polanski zmaj se je prebudil. Pripravite vodo za gašenje.',
    'Vitezi prihajajo, da obranijo Polano pred zmajem.',
    'Zmaj je danes pojedel tri ovce.',
    'Nad gradom se vali gost dim.',
    'Zmajevo jajce je toplo. Kmalu se bo izvalilo.',
    'Straža na stolpu je zaspala. Zbudite jo takoj.',
    'Zmaj se je preselil v jamo pod hribom.',
    'Princesa in zmaj igrata šah.',
    'Kovač je skoval ščit iz zmajevih lusk.',
    'Zmajevi zobje so topi. Pokličite zobozdravnika.',
    'Zmaj je izgubil luskino. Shranili smo jo.',
    'Ponoči je nad vasjo letela velika senca.',
    'V grajski kleti je zemljevid do zaklada.',
    'Zmaj ima nahod. Namesto ognja piha meglo.',
    'Vaščani so nabrali sto veder vode.',
    'Zmajček se je izgubil. Pripeljite ga domov.',
    'Zmaj rad posluša pravljice pred spanjem.',
    'Most čez reko je pregorel. Gradimo novega.',
    'Mlin ob potoku spet melje.',
    'Zmaj je zahteval zlato. Ponudili smo mu med.',
    'Zmajeva mama prihaja na obisk. Pospravite vas.',
    'Zvonovi bodo zvonili trikrat, če zmaj poleti.',
    'Zmaj danes ni bruhal ognja.',
    'V jami gori luč. Zmaj bere.',
    'Zmajev rep je zvit v klobčič.',
    'Trije vitezi spijo pod hrastom.',
    'Zmaj se igra z oblaki.',
    'Iz jame se kadi. Zmaj kuha.'
  ];

  var zadnjeSporocilo = null;   /* isto sporočilo naj ne pride dvakrat zapored */

  /* Mesto črke v abecedi (1-25); 0 pomeni, da znak ni črka (pika, vejica). */
  function stevilkaZnaka(znak) {
    return ABECEDA.indexOf(String(znak).toUpperCase()) + 1;
  }

  function steviloCrk(sporocilo) {
    var n = 0;
    for (var i = 0; i < sporocilo.length; i++) {
      if (stevilkaZnaka(sporocilo.charAt(i))) n++;
    }
    return n;
  }

  /* Sporočilo razbijemo na besede, besede pa na znake s številkami. */
  function razclenim(sporocilo) {
    return sporocilo.split(' ').map(function (beseda) {
      return {
        crke: beseda.split('').map(function (znak) {
          var velika = znak.toUpperCase();
          return { znak: velika, st: stevilkaZnaka(velika) };
        })
      };
    });
  }

  function izberiSporocilo(dolgo) {
    var izbor = SPOROCILA.filter(function (s) {
      return dolgo ? steviloCrk(s) > MEJA_KRATKO : steviloCrk(s) <= MEJA_KRATKO;
    });
    var sveza = izbor.filter(function (s) { return s !== zadnjeSporocilo; });
    if (sveza.length) izbor = sveza;

    zadnjeSporocilo = izbor[Math.floor(Math.random() * izbor.length)];
    return zadnjeSporocilo;
  }

  /* Pet skritih črk, nikoli dveh sosednjih - sicer otrok ne more preverjati po
     sosedih v tabeli, kar je pri tej nalogi glavni pripomoček. */
  function izberiSkrite() {
    var skrite = [];
    O.premesaj(ABECEDA.map(function (crka, i) { return i; })).forEach(function (i) {
      if (skrite.length >= ST_CRK) return;
      var sosed = skrite.filter(function (s) { return Math.abs(s - i) <= 1; }).length;
      if (!sosed) skrite.push(i);
    });
    return skrite.sort(function (a, b) { return a - b; });
  }

  /* Tabela abecede. Črke iz `skrite` so vidne šele, ko jih otrok dopolni;
     `kljuc` naredi celice klikljive (med razvozlavanjem sporočila). */
  function abecedaHtml(skrite, resene, kljuc) {
    return '<div class="abeceda-mreza' + (kljuc ? ' kljuc' : '') + '">' +
      ABECEDA.map(function (crka, i) {
        var skrita = skrite.indexOf(i) !== -1;
        var resena = resene.indexOf(i) !== -1;
        var razred = 'abeceda-celica' +
          (skrita && !resena ? ' prazna' : '') + (skrita && resena ? ' resena' : '');
        var vsebina = '<b>' + (!skrita || resena ? crka : '?') + '</b><i>' + (i + 1) + '</i>';

        if (!kljuc) {
          return '<div class="' + razred + '" data-mesto="' + i + '">' + vsebina + '</div>';
        }
        return '<button type="button" class="' + razred + '" data-crka="' + crka + '">' +
          vsebina + '</button>';
      }).join('') + '</div>';
  }

  function zazeni(posoda, ctx) {
    var dolgo = false;     /* privzeto krajše sporočilo */

    pokaziUvod();

    /* ---------- uvod: abeceda in izbira dolžine ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Nocoj si <b>čuvaj na zmajskem stolpu</b> nad Polano! ' +
        'Najprej dopolni abecedo — vsaka črka ima svojo številko. ' +
        'S tem ključem boš potem razvozlal <b>skrivno sporočilo</b>.</div>' +
        '</div>' +

        abecedaHtml([], [], false) +

        '<p class="namig-opis">Slovenska abeceda ima <b>25 črk</b>. ' +
        'Poglej, kje stojijo č, š in ž — in da q, w, x in y v njej sploh ni!</p>' +

        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis" id="opis-dolzine"></p>' +

        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      [{ dolgo: false, oznaka: '✉️ Krajše sporočilo' },
        { dolgo: true, oznaka: '📜 Daljše sporočilo' }].forEach(function (moznost) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (moznost.dolgo === dolgo ? ' izbran' : '');
        c.textContent = moznost.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          dolgo = moznost.dolgo;
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
      document.getElementById('opis-dolzine').textContent = dolgo
        ? 'Sporočilo bo daljše — več črk za razvozlati in več točk.'
        : 'Sporočilo bo kratko — za začetek ravno prav.';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var besede = razclenim(izberiSporocilo(dolgo));

      var stanje = {
        skrite: izberiSkrite(),
        resene: [],           /* mesta črk, ki jih je otrok že dopolnil */
        crka: 0,              /* kazalec po skritih črkah */
        besede: besede,
        beseda: 0,            /* kazalec po besedah sporočila */
        kazalec: 0,           /* skupni števec vprašanj (črke + besede) */
        skupaj: ST_CRK + besede.length,
        tocke: 0,
        pravilnih: 0,
        niz: 0,
        najdaljsiNiz: 0,
        namigUporabljen: false,
        poskus: 0,
        odgovorjeno: false,
        napake: []
      };

      pokaziCrko();

      /* Knjiženje točk je za oba dela igre enako. */
      function zabeleziPravilno() {
        stanje.niz += 1;
        if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

        var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
        var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

        stanje.tocke += prisluzeno;
        stanje.pravilnih += 1;
        return prisluzeno;
      }

      function zabeleziNapako(vprasanje, odgovor) {
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        stanje.napake.push({ vprasanje: vprasanje, odgovor: odgovor });
      }

      /* ---------- 1. del: manjkajoče črke abecede ---------- */
      function pokaziCrko() {
        var mesto = stanje.skrite[stanje.crka];
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.skupaj, stanje.tocke) +

          '<div class="igra-glavni">' +
          '<div class="lik-mesto" id="lik-igra"></div>' +
          '<div class="stevilka-kartica racun">' + (mesto + 1) + ' → ?</div>' +
          '</div>' +

          '<p class="podnaslov" style="margin:14px 0 0">Katera črka stoji na mestu ' +
          (mesto + 1) + '?</p>' +

          abecedaHtml(stanje.skrite, stanje.resene, false) +

          '<div class="vnos-vrsta">' +
          '<input id="odgovor" class="crka-vnos" type="text" maxlength="1" autocomplete="off" ' +
          'autocapitalize="characters" spellcheck="false" placeholder="?">' +
          '<button class="gumb zelen" id="gumb-preveri">Preveri</button>' +
          '</div>' +

          '<div class="posebne-crke" id="posebne">' +
          '<span>Posebne črke:</span>' +
          '<button type="button" data-crka="Č">Č</button>' +
          '<button type="button" data-crka="Š">Š</button>' +
          '<button type="button" data-crka="Ž">Ž</button>' +
          '</div>' +

          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        var aktivna = celica(mesto);
        if (aktivna) aktivna.classList.add('aktivna');

        var vnos = document.getElementById('odgovor');
        vnos.focus();
        vnos.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          if (stanje.odgovorjeno) naprejCrka(); else preveriCrko();
        });

        document.getElementById('gumb-preveri').addEventListener('click', function () {
          if (stanje.odgovorjeno) naprejCrka(); else preveriCrko();
        });
        document.getElementById('gumb-namig').addEventListener('click', namigCrka);

        [].slice.call(document.querySelectorAll('#posebne button')).forEach(function (g) {
          g.addEventListener('click', function () {
            if (stanje.odgovorjeno) return;
            global.Ucinki.zvok.klik();
            vnos.value = g.getAttribute('data-crka');
            vnos.focus();
          });
        });
      }

      function celica(mesto) {
        return document.querySelector('.abeceda-celica[data-mesto="' + mesto + '"]');
      }

      /* Namig pokaže sosedi v tabeli - tako otrok črko prešteje, ne ugane. */
      function namigCrka() {
        if (stanje.odgovorjeno) return;
        var mesto = stanje.skrite[stanje.crka];
        stanje.namigUporabljen = true;
        global.Ucinki.zvok.klik();

        var deli = [];
        [mesto - 1, mesto + 1].forEach(function (sosed) {
          if (sosed < 0 || sosed >= ABECEDA.length) return;
          var el = celica(sosed);
          if (el) el.classList.add('sosed');
          deli.push((sosed < mesto ? 'pred njo je ' : 'za njo je ') +
            ABECEDA[sosed] + ' (' + (sosed + 1) + ')');
        });

        var odziv = document.getElementById('odziv');
        odziv.className = 'odziv';
        odziv.textContent = 'Poglej sosedi v tabeli — ' + deli.join(', ') + '.';
        document.getElementById('gumb-namig').disabled = true;
        document.getElementById('odgovor').focus();
      }

      function preveriCrko() {
        var mesto = stanje.skrite[stanje.crka];
        var pravilna = ABECEDA[mesto];
        var vnos = document.getElementById('odgovor');
        var vpisano = vnos.value.replace(/\s/g, '').toUpperCase();
        if (!vpisano) { vnos.focus(); return; }

        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (vpisano === pravilna) {
          var prisluzeno = zabeleziPravilno();
          stanje.odgovorjeno = true;
          stanje.resene.push(mesto);

          vnos.className = 'pravilno';
          vnos.blur();
          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + (mesto + 1) + ' = ' + pravilna +
            ' · +' + prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          razkrijCelico(mesto);
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(20);
          document.getElementById('gumb-namig').disabled = true;
          document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
          global.setTimeout(naprejCrka, 1700);
          return;
        }

        /* napačna črka */
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        vnos.className = 'napacno';
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Še ne. Preštej črke v tabeli in poskusi znova.';
          vnos.select();
          return;
        }

        stanje.odgovorjeno = true;
        stanje.resene.push(mesto);
        zabeleziNapako('mesto ' + (mesto + 1), pravilna);
        odziv.className = 'odziv ne';
        odziv.textContent = 'Na mestu ' + (mesto + 1) + ' je črka ' + pravilna + '.';
        razkrijCelico(mesto);
        vnos.blur();
        document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
        global.setTimeout(naprejCrka, 2400);
      }

      function razkrijCelico(mesto) {
        var el = celica(mesto);
        if (!el) return;
        el.classList.remove('prazna');
        el.classList.remove('aktivna');
        el.classList.add('resena');
        el.querySelector('b').textContent = ABECEDA[mesto];
      }

      function naprejCrka() {
        if (!stanje.odgovorjeno) return;
        stanje.crka += 1;
        stanje.kazalec += 1;
        if (stanje.crka >= stanje.skrite.length) pokaziSporocilo(); else pokaziCrko();
      }

      /* ---------- 2. del: skrivno sporočilo ---------- */

      /* Sporočilo izrišemo samo enkrat - drugače bi otroku pobrisali, kar je vpisal.
         Naprej se spreminjajo le posamezne besede in vrstica stanja. */
      function pokaziSporocilo() {
        posoda.innerHTML =
          '<div class="plosca">' +
          '<div id="stanje">' +
          O.vrsticaStanja(stanje.kazalec, stanje.skupaj, stanje.tocke) + '</div>' +

          '<div class="sova-uvod" style="margin-top:8px">' +
          '<div class="lik-mesto" id="lik-igra" style="width:96px"></div>' +
          '<div class="oblacek">Skrivno sporočilo s stolpa! Vsaka številka je ena črka. ' +
          'Razvozlavaj <b>besedo za besedo</b> — ko je beseda polna, jo sam preverim.</div>' +
          '</div>' +

          sporociloHtml() +

          '<p class="namig-opis">Črko klikni v ključu ali jo natipkaj.</p>' +
          abecedaHtml([], [], true) +

          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        [].slice.call(posoda.querySelectorAll('.sporocilo-beseda input')).forEach(function (p) {
          p.addEventListener('input', function () { vnesenaCrka(p); });
          p.addEventListener('keydown', function (e) { tipkaVPolju(e, p); });
          p.addEventListener('focus', function () { p.select(); });
        });

        [].slice.call(posoda.querySelectorAll('.abeceda-mreza.kljuc button')).forEach(function (g) {
          g.addEventListener('click', function () {
            vstaviCrko(g.getAttribute('data-crka'));
          });
        });

        document.getElementById('gumb-namig').addEventListener('click', namigBeseda);
        aktivirajBesedo();
      }

      function sporociloHtml() {
        return '<div class="sporocilo-blok">' +
          stanje.besede.map(function (beseda, i) {
            return '<div class="sporocilo-beseda" data-beseda="' + i + '">' +
              beseda.crke.map(function (c, j) {
                if (!c.st) return '<span class="crka locilo">' + c.znak + '</span>';
                return '<span class="crka">' +
                  '<input type="text" maxlength="1" autocomplete="off" ' +
                  'autocapitalize="characters" spellcheck="false" disabled ' +
                  'data-crka="' + j + '" aria-label="Črka številka ' + c.st + '">' +
                  '<i>' + c.st + '</i></span>';
              }).join('') +
              '</div>';
          }).join('') + '</div>';
      }

      function besedaEl(i) {
        return posoda.querySelector('.sporocilo-beseda[data-beseda="' + i + '"]');
      }

      function poljaBesede(i) {
        var el = besedaEl(i);
        return el ? [].slice.call(el.querySelectorAll('input')) : [];
      }

      /* Odklene naslednjo besedo; prejšnje ostanejo vidne, a zaklenjene. */
      function aktivirajBesedo() {
        stanje.namigUporabljen = false;
        stanje.poskus = 0;

        stanje.besede.forEach(function (beseda, i) {
          besedaEl(i).classList.toggle('aktivna', i === stanje.beseda);
          poljaBesede(i).forEach(function (p) { p.disabled = i !== stanje.beseda; });
        });

        var gumb = document.getElementById('gumb-namig');
        if (gumb) gumb.disabled = false;
        fokusirajPrazno();
      }

      function fokusirajPrazno() {
        var prazno = poljaBesede(stanje.beseda).filter(function (p) { return !p.value; })[0];
        if (prazno) prazno.focus();
      }

      /* Črka iz ključa gre v polje s kazalcem, sicer v prvo prazno polje besede. */
      function vstaviCrko(crka) {
        global.Ucinki.zvok.klik();
        var polja = poljaBesede(stanje.beseda);
        var cilj = document.activeElement;
        if (polja.indexOf(cilj) === -1) {
          cilj = polja.filter(function (p) { return !p.value; })[0] || polja[0];
        }
        if (!cilj) return;
        cilj.value = crka;
        vnesenaCrka(cilj);
      }

      function vnesenaCrka(polje) {
        var vpisano = String(polje.value).slice(-1).toUpperCase();
        polje.value = stevilkaZnaka(vpisano) ? vpisano : '';
        polje.classList.remove('napacna');

        if (polje.value) {
          var polja = poljaBesede(stanje.beseda);
          var naslednje = polja[polja.indexOf(polje) + 1];
          if (naslednje) naslednje.focus();
        }
        preveriBesedo();
      }

      function tipkaVPolju(e, polje) {
        var polja = poljaBesede(stanje.beseda);
        var i = polja.indexOf(polje);

        if (e.key === 'Backspace' && !polje.value && polja[i - 1]) {
          polja[i - 1].value = '';
          polja[i - 1].focus();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && polja[i - 1]) {
          polja[i - 1].focus();
          e.preventDefault();
        } else if (e.key === 'ArrowRight' && polja[i + 1]) {
          polja[i + 1].focus();
          e.preventDefault();
        }
      }

      /* Beseda se preveri sama, ko je izpolnjeno zadnje polje. */
      function preveriBesedo() {
        var polja = poljaBesede(stanje.beseda);
        if (polja.filter(function (p) { return !p.value; }).length) return;

        var prave = stanje.besede[stanje.beseda].crke.filter(function (c) { return c.st; });
        var beseda = prave.map(function (c) { return c.znak; }).join('');
        var zgresene = polja.filter(function (p, i) { return p.value !== prave[i].znak; });
        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');

        if (!zgresene.length) {
          var prisluzeno = zabeleziPravilno();
          besedaEl(stanje.beseda).classList.add('resena');
          polja.forEach(function (p) { p.disabled = true; });
          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + beseda + ' · +' + prisluzeno + ' točk' +
            (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(18);
          osveziStanje();
          global.setTimeout(naprejBeseda, 1100);
          return;
        }

        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);

        if (stanje.poskus === 1) {
          /* pravilne črke pustimo pri miru - popraviti je treba samo zgrešene */
          zgresene.forEach(function (p) {
            p.classList.add('napacna');
            p.value = '';
          });
          odziv.className = 'odziv ne';
          odziv.textContent = zgresene.length === 1
            ? 'Ena črka še ni prava. Poišči njeno številko v ključu.'
            : 'Nekaj črk še ni pravih. Poišči njihove številke v ključu.';
          fokusirajPrazno();
          return;
        }

        /* v drugem poskusu besedo razkrijemo in gremo naprej */
        polja.forEach(function (p, i) {
          p.value = prave[i].znak;
          p.classList.remove('napacna');
          p.disabled = true;
        });
        besedaEl(stanje.beseda).classList.add('razkrita');
        zabeleziNapako(prave.map(function (c) { return c.st; }).join('-'), beseda);
        odziv.className = 'odziv ne';
        odziv.textContent = 'Ta beseda se glasi ' + beseda + '.';
        osveziStanje();
        global.setTimeout(naprejBeseda, 2200);
      }

      /* Namig razkrije prvo še prazno črko besede. */
      function namigBeseda() {
        var polja = poljaBesede(stanje.beseda);
        var prazno = polja.filter(function (p) { return !p.value; })[0];
        if (!prazno) return;

        var prave = stanje.besede[stanje.beseda].crke.filter(function (c) { return c.st; });
        stanje.namigUporabljen = true;
        global.Ucinki.zvok.klik();

        prazno.value = prave[polja.indexOf(prazno)].znak;
        prazno.classList.add('namignjena');
        document.getElementById('gumb-namig').disabled = true;
        fokusirajPrazno();
        preveriBesedo();
      }

      function osveziStanje() {
        var vrstica = document.getElementById('stanje');
        if (!vrstica) return;
        vrstica.innerHTML = O.vrsticaStanja(stanje.kazalec, stanje.skupaj, stanje.tocke);
        O.osveziNiz(stanje.niz);
      }

      function naprejBeseda() {
        stanje.beseda += 1;
        stanje.kazalec += 1;
        osveziStanje();

        if (stanje.beseda >= stanje.besede.length) {
          pokaziRazkritje();
          return;
        }
        document.getElementById('odziv').textContent = '';
        aktivirajBesedo();
      }

      /* ---------- razkritje sporočila ---------- */
      function pokaziRazkritje() {
        var sporocilo = stanje.besede.map(function (b) {
          return b.crke.map(function (c) { return c.znak; }).join('');
        }).join(' ');

        posoda.innerHTML =
          '<div class="plosca konec">' +
          '<h2 style="margin:6px 0;font-size:30px">Sporočilo je razvozlano! 🔓</h2>' +
          '<div class="lik-mesto" id="lik-razkritje" style="margin:0 auto"></div>' +
          '<div class="razkritje">' + sporocilo + '</div>' +
          '<div class="gumbi-vrsta">' +
          '<button class="gumb zelen" id="gumb-rezultat">Poglej rezultat ▶</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-razkritje'), 'vesel', 'lik-veselje');
        global.Ucinki.konfeti(60);

        document.getElementById('gumb-rezultat').addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.pravilnih,
            skupaj: stanje.skupaj,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: stanje.napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            naslovNapak: 'To si poglej še enkrat:',
            sporocila: {
              tri: 'Vrhunsko! Polana ima najboljšega čuvaja. 🐉',
              dve: 'Zelo dobro! Še malo vaje in abecedo boš znal na pamet.',
              ena: 'Dober začetek! Abeceda se najhitreje zapomni, če jo ponoviš na glas.'
            }
          });
        });
      }
    }
  }

  global.Igre.registriraj({
    id: 'slo-abeceda',
    predmet: 'slovenscina',
    razredi: [2, 3, 4, 5],
    naziv: 'Skrivna abeceda',
    opis: 'Dopolni abecedo, nato s številkami razvozlaj skrivno sporočilo z zmajskega stolpa.',
    ikona: '🔐',
    zazeni: zazeni
  });
})(window);
