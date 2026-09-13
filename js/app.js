/* app.js - navigacija med zasloni, prikaz igralcev, predmetov in iger */
(function (global) {
  'use strict';

  var OBDOBJA = [
    { id: 'dan', oznaka: 'Danes', kratko: 'danes', kartica: 'Danes' },
    { id: 'teden', oznaka: 'Ta teden', kratko: 'ta teden', kartica: 'Teden' },
    { id: 'mesec', oznaka: 'Ta mesec', kratko: 'ta mesec', kartica: 'Mesec' }
  ];

  var trenutniIgralec = null;
  var trenutniPredmet = null;
  var obdobje = 'dan';

  var stanje = {};        /* kar je zdaj na zaslonu, razbrano iz naslova */
  var globina = 0;        /* koliko korakov smo naredili znotraj strani */
  var zadnjiNaslov = null;

  var glava = document.getElementById('glava');
  var gumbNazaj = document.getElementById('gumb-nazaj');
  var gumbZvok = document.getElementById('gumb-zvok');

  function oznakaObdobja() {
    return OBDOBJA.filter(function (o) { return o.id === obdobje; })[0].kratko;
  }

  /* ---------- naslov strani ----------

     Vsak zaslon ima svoj naslov, da osvežitev odpre isto stran in da gumb
     »nazaj« v brskalniku dela pričakovano. Stran teče kot statične datoteke
     (tudi na GitHub Pages), zato pot zapišemo za lojtro:

       #/                                    izbira igralca
       #/nov                                 okno za novega igralca
       #/uredi/<igralec>                     okno za urejanje igralca
       #/igralec/<igralec>                   predmeti
       #/igralec/<igralec>/<predmet>         igre predmeta
       #/igralec/<igralec>/<predmet>/<igra>  igra

     Izbrano obdobje je le drug pogled na iste podatke, zato visi zadaj kot
     ?obdobje=teden in zgodovine ne podaljšuje. */

  function pot(s) {
    if (s.okno === 'nov') return ['nov'];
    if (s.okno === 'uredi') return ['uredi', s.urejani];
    if (!s.igralec) return [];
    var deli = ['igralec', s.igralec];
    if (s.predmet) deli.push(s.predmet);
    if (s.igra) deli.push(s.igra);
    return deli;
  }

  function vNaslov(s) {
    var deli = pot(s).map(encodeURIComponent).join('/');
    var poizvedba = obdobje === 'dan' ? '' : '?obdobje=' + obdobje;
    var lojtra = (deli || poizvedba) ? '#/' + deli + poizvedba : '';
    return global.location.pathname + global.location.search + lojtra;
  }

  function jeObdobje(id) {
    return OBDOBJA.some(function (o) { return o.id === id; });
  }

  /* Naslov v stanje; karkoli neznanega pristane na začetnem zaslonu. */
  function izNaslova() {
    var lojtra = String(global.location.hash || '').replace(/^#/, '');
    var meja = lojtra.indexOf('?');
    var poizvedba = meja === -1 ? '' : lojtra.slice(meja + 1);
    var deli = (meja === -1 ? lojtra : lojtra.slice(0, meja))
      .split('/')
      .filter(function (d) { return d !== ''; })
      .map(function (d) {
        try { return decodeURIComponent(d); } catch (n) { return d; }
      });

    var najdeno = poizvedba.match(/(?:^|&)obdobje=([^&]*)/);
    obdobje = najdeno && jeObdobje(najdeno[1]) ? najdeno[1] : 'dan';

    if (deli[0] === 'nov') return { okno: 'nov' };
    if (deli[0] === 'uredi' && deli[1]) return { okno: 'uredi', urejani: deli[1] };
    if (deli[0] === 'igralec' && deli[1]) {
      return { igralec: deli[1], predmet: deli[2] || null, igra: deli[3] || null };
    }
    return {};
  }

  /* Gre na nov naslov. zamenjaj = true prepiše trenutni vnos v zgodovini
     (preusmeritve in menjava obdobja), da se gumb »nazaj« ne zatika. */
  function pojdi(novo, zamenjaj) {
    var naslov = vNaslov(novo);
    var novaGlobina = zamenjaj ? globina : globina + 1;
    try {
      global.history[zamenjaj ? 'replaceState' : 'pushState'](
        { globina: novaGlobina }, '', naslov);
      globina = novaGlobina;
    } catch (n) {
      global.location.hash = naslov.split('#')[1] || '';
    }
    zadnjiNaslov = global.location.hash;
    uporabi(novo);
  }

  function nadrejeno() {
    if (stanje.igra) return { igralec: stanje.igralec, predmet: stanje.predmet };
    if (stanje.predmet) return { igralec: stanje.igralec };
    return {};
  }

  /* Znotraj strani stopimo po zgodovini nazaj, ob neposrednem obisku
     (npr. deljena povezava do igre) pa na nadrejeni zaslon. */
  function nazaj() {
    if (globina > 0) global.history.back();
    else pojdi(nadrejeno(), true);
  }

  function najdiPredmet(igralec, id) {
    return global.Podatki.predmetiZaRazred(igralec.razred).filter(function (p) {
      return p.id === id;
    })[0] || null;
  }

  function najdiIgro(igralec, predmet, id) {
    return global.Igre.zaPredmet(predmet.id, igralec.razred).filter(function (i) {
      return i.id === id;
    })[0] || null;
  }

  /* Izriše zaslon, ki ga opisuje stanje. Kar ne obstaja več (izbrisan igralec,
     igra, ki je ta razred nima), nas preusmeri na nadrejeni zaslon. */
  function uporabi(novo) {
    stanje = novo;
    poravnajNaslov();

    if (novo.okno) {
      var urejani = novo.okno === 'uredi' ? global.Igralci.najdi(novo.urejani) : null;
      if (novo.okno === 'uredi' && !urejani) { pojdi({}, true); return; }

      trenutniIgralec = null;
      trenutniPredmet = null;
      izrisiIgralce();
      pokaziZaslon('zaslon-igralci');
      odpriOkno(urejani);
      return;
    }

    zapriOkno();

    var igralec = novo.igralec ? global.Igralci.najdi(novo.igralec) : null;
    if (novo.igralec && !igralec) { pojdi({}, true); return; }

    trenutniIgralec = igralec;
    if (!igralec) {
      trenutniPredmet = null;
      izrisiIgralce();
      pokaziZaslon('zaslon-igralci');
      return;
    }

    osveziGlavo();

    var predmet = novo.predmet ? najdiPredmet(igralec, novo.predmet) : null;
    if (novo.predmet && !predmet) { pojdi({ igralec: igralec.id }, true); return; }

    trenutniPredmet = predmet;
    if (!predmet) {
      izrisiPredmete();
      pokaziZaslon('zaslon-predmeti');
      return;
    }

    var igra = novo.igra ? najdiIgro(igralec, predmet, novo.igra) : null;
    if (novo.igra && !igra) { pojdi({ igralec: igralec.id, predmet: predmet.id }, true); return; }

    if (!igra) {
      izrisiIgre();
      pokaziZaslon('zaslon-igre');
      return;
    }

    zazeniIgro(igra);
  }

  /* Naslov v vrstici naj bo zapisan tako, kot bi ga zapisali sami - tudi kadar
     ga je natipkal uporabnik ali kadar smo obdobje prebrali iz njega. */
  function poravnajNaslov() {
    var naslov = vNaslov(stanje);
    var zdaj = global.location.pathname + global.location.search + global.location.hash;
    if (zdaj === naslov) return;
    try {
      global.history.replaceState({ globina: globina }, '', naslov);
      zadnjiNaslov = global.location.hash;
    } catch (n) { /* brez zgodovine teče stran naprej z neurejenim naslovom */ }
  }

  /* Gumba naprej/nazaj v brskalniku sprožita popstate, ročno popravljen naslov
     pa le hashchange - poslušamo oba, dvojnik ujame zadnjiNaslov. */
  global.addEventListener('popstate', function (dogodek) {
    globina = (dogodek.state && dogodek.state.globina) || 0;
    zadnjiNaslov = global.location.hash;
    uporabi(izNaslova());
  });

  global.addEventListener('hashchange', function () {
    if (global.location.hash === zadnjiNaslov) return;
    zadnjiNaslov = global.location.hash;
    uporabi(izNaslova());
  });

  /* ---------- navigacija ---------- */
  function pokaziZaslon(id) {
    var vsi = document.querySelectorAll('.zaslon');
    for (var i = 0; i < vsi.length; i++) vsi[i].classList.remove('aktiven');
    document.getElementById(id).classList.add('aktiven');
    glava.classList.toggle('skrito', id === 'zaslon-igralci');
    global.scrollTo(0, 0);
  }

  function osveziGlavo() {
    if (!trenutniIgralec) return;
    document.getElementById('glava-avatar').textContent = trenutniIgralec.avatar;
    document.getElementById('glava-ime').textContent = trenutniIgralec.ime;
    document.getElementById('glava-skupaj').textContent =
      global.Shramba.tocke(trenutniIgralec.id, obdobje);
    document.getElementById('glava-obdobje').textContent = oznakaObdobja();
  }

  /* Vrstica gumbov Danes / Ta teden / Ta mesec. */
  function izrisiObdobja(posoda) {
    posoda.innerHTML = '';
    OBDOBJA.forEach(function (o) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'cip' + (o.id === obdobje ? ' izbran' : '');
      c.textContent = o.oznaka;
      c.addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        obdobje = o.id;
        pojdi(stanje, true);    /* isti zaslon, le drug pogled - zato zamenjamo */
      });
      posoda.appendChild(c);
    });
  }

  /* ---------- zaslon: izbira igralca ---------- */

  /* Imena zdaj vpisuje uporabnik, zato jih pred vstavljanjem v HTML ublažimo. */
  function varno(besedilo) {
    return String(besedilo)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function karticaIgralca(igralec) {
    var k = document.createElement('div');
    k.className = 'kartica-igralec';
    k.style.borderColor = igralec.barva;
    k.innerHTML =
      '<button class="uredi" type="button" title="Uredi igralca" aria-label="Uredi igralca ' +
        varno(igralec.ime) + '">✏️</button>' +
      '<span class="avatar">' + varno(igralec.avatar) + '</span>' +
      '<div class="ime">' + varno(igralec.ime) + '</div>' +
      '<div class="razred">' + igralec.razred + '. razred · ' + igralec.starost + ' let</div>' +
      '<div class="tocke-obdobja">' +
      OBDOBJA.map(function (o) {
        return '<span><b>' + global.Shramba.tocke(igralec.id, o.id) + '</b>' + o.kartica + '</span>';
      }).join('') +
      '</div>';

    k.querySelector('.uredi').addEventListener('click', function (dogodek) {
      dogodek.stopPropagation();          /* svinčnik ne sme začeti igre */
      global.Ucinki.zvok.klik();
      pojdi({ okno: 'uredi', urejani: igralec.id });
    });

    k.addEventListener('click', function () {
      global.Ucinki.zvok.klik();
      pojdi({ igralec: igralec.id });
    });

    return k;
  }

  function karticaNovega() {
    var k = document.createElement('div');
    k.className = 'kartica-igralec kartica-nov';
    k.innerHTML =
      '<span class="avatar">➕</span>' +
      '<div class="ime">Nov igralec</div>' +
      '<div class="razred">Dodaj sebe ali prijatelja</div>';
    k.addEventListener('click', function () {
      global.Ucinki.zvok.klik();
      pojdi({ okno: 'nov' });
    });
    return k;
  }

  /* Ob prvem obisku igralcev še ni - takrat mora stran povedati, kaj naj
     obiskovalec stori, ne pa ga pozdraviti, kot da ga že pozna. */
  function besediloUvoda(steviloIgralcev) {
    if (steviloIgralcev) {
      return {
        podnaslov: 'Kdo se bo danes učil?',
        oblacek: 'Živjo! Jaz sem <b>profesor Uhec</b>. Izberi svoje ime in začnimo!'
      };
    }
    return {
      podnaslov: 'Za začetek dodaj igralca.',
      oblacek: 'Živjo! Jaz sem <b>profesor Uhec</b>. Klikni <b>Nov igralec</b>, ' +
        'vpiši svoje ime in učenje se lahko začne!'
    };
  }

  function izrisiIgralce() {
    var posoda = document.getElementById('seznam-igralcev');
    posoda.innerHTML = '';

    var igralci = global.Igralci.vsi();
    igralci.forEach(function (igralec) {
      posoda.appendChild(karticaIgralca(igralec));
    });
    posoda.appendChild(karticaNovega());

    var uvod = besediloUvoda(igralci.length);
    document.getElementById('podnaslov-igralci').textContent = uvod.podnaslov;
    document.getElementById('oblacek-uvod').innerHTML = uvod.oblacek;

    global.Liki.vstavi(document.getElementById('sova-uvod-lik'), 'vesel', 'lik-plava');
  }

  /* ---------- zaslon: predmeti ---------- */
  function steviloIger(predmet) {
    return global.Igre.zaPredmet(predmet.id, trenutniIgralec.razred).length;
  }

  function izrisiPredmete() {
    document.getElementById('pozdrav-predmeti').textContent =
      'Pozdravljen, ' + trenutniIgralec.ime + '! Kaj se bomo učili?';

    izrisiObdobja(document.getElementById('obdobje-predmeti'));

    var posoda = document.getElementById('seznam-predmetov');
    posoda.innerHTML = '';

    /* Otrok vidi le predmete, ki jih ima v svojem razredu na urniku (predmetnik OŠ);
       predmeti z igrami gredo naprej, ostali ("Kmalu!") pa za njimi. */
    var predmeti = global.Podatki.predmetiZaRazred(trenutniIgralec.razred);
    var zIgrami = predmeti.filter(function (p) { return steviloIger(p); });
    var brezIger = predmeti.filter(function (p) { return !steviloIger(p); });

    zIgrami.concat(brezIger).forEach(function (predmet) {
      var naVoljo = steviloIger(predmet);
      var tocke = global.Shramba.tocke(trenutniIgralec.id, obdobje, predmet.id);

      var k = document.createElement('div');
      k.className = 'kartica-predmet' + (naVoljo ? '' : ' zaklenjen');
      k.style.background = predmet.barva;
      k.innerHTML =
        '<span class="ikona">' + predmet.ikona + '</span>' +
        '<div class="naziv' + (predmet.naziv.length > 18 ? ' dolg' : '') + '">' +
          predmet.naziv + '</div>' +
        (predmet.izbiren ? '<div class="izbirni">izbirni predmet</div>' : '') +
        '<span class="mini-tocke">⭐ ' + tocke + '</span>' +
        (naVoljo ? '' : '<span class="kmalu">Kmalu!</span>');

      k.addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        pojdi({ igralec: trenutniIgralec.id, predmet: predmet.id });
      });
      posoda.appendChild(k);
    });
  }

  /* ---------- zaslon: igre predmeta ---------- */
  function izrisiIgre() {
    document.getElementById('naslov-predmeta').textContent =
      trenutniPredmet.ikona + ' ' + trenutniPredmet.naziv;

    izrisiObdobja(document.getElementById('obdobje-igre'));

    var posoda = document.getElementById('seznam-iger');
    posoda.innerHTML = '';

    var igre = global.Igre.zaPredmet(trenutniPredmet.id, trenutniIgralec.razred);

    if (!igre.length) {
      posoda.innerHTML =
        '<div class="prazno">🚧 Tu še ni iger za ' + trenutniIgralec.razred +
        '. razred, a kmalu jih bo! Poskusi <b>angleščino</b>.</div>';
      return;
    }

    /* naloge za otrokov razred pokažemo prve, naloge višjih razredov posebej */
    var zaRazred = igre.filter(function (i) {
      return !global.Igre.jeIzziv(i, trenutniIgralec.razred);
    });
    var izzivi = igre.filter(function (i) {
      return global.Igre.jeIzziv(i, trenutniIgralec.razred);
    });

    izrisiSkupino(posoda, 'Za ' + trenutniIgralec.razred + '. razred', zaRazred, '');
    izrisiSkupino(posoda, 'Izzivi iz višjih razredov 💪', izzivi,
      'Te naloge so za starejše — poskusi, če si upaš!');
  }

  /* Ena skupina iger z naslovom; prazne skupine izpustimo. */
  function izrisiSkupino(posoda, naslov, igre, opomba) {
    if (!igre.length) return;

    var h = document.createElement('h3');
    h.className = 'naslov-skupine';
    h.textContent = naslov;
    posoda.appendChild(h);

    if (opomba) {
      var p = document.createElement('p');
      p.className = 'opomba-skupine';
      p.textContent = opomba;
      posoda.appendChild(p);
    }

    var mreza = document.createElement('div');
    mreza.className = 'mreza-iger';
    posoda.appendChild(mreza);

    igre.forEach(function (igra) {
      var rekord = global.Shramba.rekordIgre(trenutniIgralec.id, igra.id, obdobje);
      var poskusi = global.Shramba.poskusiIgre(trenutniIgralec.id, igra.id, obdobje);
      var izziv = global.Igre.jeIzziv(igra, trenutniIgralec.razred);

      var k = document.createElement('div');
      k.className = 'kartica-igra' + (izziv ? ' izziv' : '');
      k.innerHTML =
        '<div class="ikona">' + igra.ikona + '</div>' +
        '<h3>' + igra.naziv + '</h3>' +
        '<p>' + igra.opis + '</p>' +
        '<span class="znacka rekord">Najbolje ' + oznakaObdobja() + ': ' + rekord + ' ⭐</span>' +
        '<span class="znacka">Poskusov: ' + poskusi + '</span>' +
        (izziv ? '<span class="znacka izziv">Izziv 💪</span>' : '');
      k.addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        pojdi({ igralec: trenutniIgralec.id, predmet: trenutniPredmet.id, igra: igra.id });
      });
      mreza.appendChild(k);
    });
  }

  /* ---------- zagon igre ---------- */
  /* Zvok klika sproži klicatelj - igro lahko odpre tudi naslov ob osvežitvi. */
  function zazeniIgro(igra) {
    var posoda = document.getElementById('igra-vsebina');
    posoda.innerHTML = '';
    pokaziZaslon('zaslon-igra');

    igra.zazeni(posoda, {
      igralec: trenutniIgralec,
      shrani: function (tocke, odstotek) {
        var izid = global.Shramba.zabelezi(
          trenutniIgralec.id, igra.predmet, igra.id, tocke, odstotek);
        osveziGlavo();
        if (izid.novRekord) {
          var znacka = document.querySelector('.glava-tocke');
          znacka.classList.remove('skok');
          void znacka.offsetWidth;
          znacka.classList.add('skok');
        }
        return izid;
      },
      nazaj: nazaj
    });
  }

  /* ---------- gumb nazaj ---------- */
  gumbNazaj.addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    nazaj();
  });

  /* ---------- gumb za zvok ---------- */
  function osveziGumbZvok() {
    var vklopljen = global.Ucinki.zvokVklopljen();
    gumbZvok.textContent = vklopljen ? '🔊' : '🔇';
    gumbZvok.classList.toggle('utisan', !vklopljen);
    gumbZvok.setAttribute('aria-pressed', vklopljen ? 'false' : 'true');
    gumbZvok.title = vklopljen ? 'Izklopi zvok' : 'Vklopi zvok';
    gumbZvok.setAttribute('aria-label', gumbZvok.title);
  }

  gumbZvok.addEventListener('click', function () {
    global.Ucinki.preklopiZvok();
    osveziGumbZvok();
    global.Ucinki.zvok.klik();   /* sliši se le, če smo zvok ravno vklopili */
  });

  /* ---------- pogovorno okno: nov / obstoječ igralec ---------- */
  var okno = document.getElementById('okno-igralec');
  var vnosIme = document.getElementById('vnos-ime');
  var vnosStarost = document.getElementById('vnos-starost');
  var vnosRazred = document.getElementById('vnos-razred');
  var oknoNaslov = document.getElementById('okno-naslov');
  var oknoNapaka = document.getElementById('okno-napaka');
  var gumbIzbrisi = document.getElementById('gumb-izbrisi-igralca');

  var urejaniId = null;       /* null = dodajamo novega */
  var izbranAvatar = global.Igralci.AVATARJI[0];
  var izbranaBarva = global.Igralci.BARVE[0];
  var razredRocno = false;    /* ko razred izbere uporabnik, ga starost ne popravlja več */

  /* razredi 1-9 */
  for (var r = 1; r <= 9; r++) {
    var moznost = document.createElement('option');
    moznost.value = String(r);
    moznost.textContent = r + '. razred';
    vnosRazred.appendChild(moznost);
  }

  /* Mreža gumbov (živali ali barve); ob kliku si zapomnimo izbiro. */
  function izrisiIzbiro(posoda, vrednosti, jeBarva, obIzbiri) {
    posoda.innerHTML = '';
    vrednosti.forEach(function (v) {
      var g = document.createElement('button');
      g.type = 'button';
      g.className = jeBarva ? 'pika-barve' : 'pika-avatarja';
      g.setAttribute('data-vrednost', v);
      if (jeBarva) {
        g.style.background = v;
        g.setAttribute('aria-label', 'Barva ' + v);
      } else {
        g.textContent = v;
        g.setAttribute('aria-label', 'Lik ' + v);
      }
      g.addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        obIzbiri(v);
        oznaciIzbrano(posoda, v);
      });
      posoda.appendChild(g);
    });
  }

  function oznaciIzbrano(posoda, vrednost) {
    var gumbi = posoda.querySelectorAll('button');
    for (var i = 0; i < gumbi.length; i++) {
      gumbi[i].classList.toggle('izbran', gumbi[i].getAttribute('data-vrednost') === vrednost);
    }
  }

  var posodaAvatarjev = document.getElementById('izbira-avatarja');
  var posodaBarv = document.getElementById('izbira-barve');

  izrisiIzbiro(posodaAvatarjev, global.Igralci.AVATARJI, false, function (v) { izbranAvatar = v; });
  izrisiIzbiro(posodaBarv, global.Igralci.BARVE, true, function (v) { izbranaBarva = v; });

  /* Prvi predlog naj bo tak, ki ga še nihče nima. */
  function prostaIzbira(seznam, zasedene) {
    var prosti = seznam.filter(function (v) { return zasedene.indexOf(v) === -1; });
    var izbor = prosti.length ? prosti : seznam;
    return izbor[Math.floor(Math.random() * izbor.length)];
  }

  function pokaziNapako(besedilo) {
    oknoNapaka.textContent = besedilo || '';
    oknoNapaka.classList.toggle('skrito', !besedilo);
  }

  function odpriOkno(igralec) {
    var obstojeci = global.Igralci.vsi();
    urejaniId = igralec ? igralec.id : null;
    razredRocno = !!igralec;

    oknoNaslov.textContent = igralec ? 'Uredi igralca' : 'Nov igralec';
    vnosIme.value = igralec ? igralec.ime : '';
    vnosStarost.value = igralec ? igralec.starost : 7;
    vnosRazred.value = String(igralec ? igralec.razred : 2);

    izbranAvatar = igralec ? igralec.avatar : prostaIzbira(global.Igralci.AVATARJI,
      obstojeci.map(function (i) { return i.avatar; }));
    izbranaBarva = igralec ? igralec.barva : prostaIzbira(global.Igralci.BARVE,
      obstojeci.map(function (i) { return i.barva; }));

    oznaciIzbrano(posodaAvatarjev, izbranAvatar);
    oznaciIzbrano(posodaBarv, izbranaBarva);

    gumbIzbrisi.classList.toggle('skrito', !igralec);
    pokaziNapako('');

    okno.classList.remove('skrito');
    vnosIme.focus();
  }

  function zapriOkno() {
    okno.classList.add('skrito');
    urejaniId = null;
  }

  /* Okno je svoj vnos v zgodovini, zato ga zapremo z odhodom z njegovega naslova.
     Tako ga gumb »nazaj« na telefonu zapre, namesto da bi zapustil stran. */
  function zapustiOkno() {
    zapriOkno();
    nazaj();
  }

  /* V 1. razred otroci vstopijo pri šestih letih - razred zato predlagamo sami,
     dokler ga uporabnik ne izbere ročno. */
  vnosStarost.addEventListener('input', function () {
    if (razredRocno) return;
    var starost = parseInt(vnosStarost.value, 10);
    if (isNaN(starost)) return;
    vnosRazred.value = String(Math.min(9, Math.max(1, starost - 5)));
  });

  vnosRazred.addEventListener('change', function () { razredRocno = true; });

  vnosIme.addEventListener('keydown', function (dogodek) {
    if (dogodek.key === 'Enter') shraniIgralca();
  });

  function shraniIgralca() {
    var vnos = {
      ime: vnosIme.value,
      starost: vnosStarost.value,
      razred: vnosRazred.value,
      avatar: izbranAvatar,
      barva: izbranaBarva
    };

    if (!String(vnos.ime).trim()) {
      pokaziNapako('Vpiši ime, da vemo, komu štejemo točke.');
      vnosIme.focus();
      return;
    }

    if (urejaniId) {
      var posodobljen = global.Igralci.posodobi(urejaniId, vnos);
      if (trenutniIgralec && posodobljen && trenutniIgralec.id === urejaniId) {
        trenutniIgralec = posodobljen;
      }
    } else {
      global.Igralci.dodaj(vnos);
      global.Ucinki.konfeti(30);
    }

    global.Ucinki.zvok.klik();
    zapustiOkno();
  }

  function izbrisiIgralca() {
    var igralec = global.Igralci.najdi(urejaniId);
    if (!igralec) return;

    var potrdi = global.confirm('Res izbrišem igralca ' + igralec.ime +
      '? Skupaj z njim se izbrišejo tudi vse njegove točke.');
    if (!potrdi) return;

    global.Igralci.izbrisi(urejaniId);
    if (trenutniIgralec && trenutniIgralec.id === urejaniId) trenutniIgralec = null;

    zapustiOkno();
  }

  document.getElementById('gumb-shrani-igralca').addEventListener('click', shraniIgralca);
  document.getElementById('gumb-preklici-igralca').addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    zapustiOkno();
  });
  gumbIzbrisi.addEventListener('click', izbrisiIgralca);

  /* klik mimo okna in tipka Esc zapreta okno */
  okno.addEventListener('click', function (dogodek) {
    if (dogodek.target === okno) zapustiOkno();
  });
  document.addEventListener('keydown', function (dogodek) {
    if (dogodek.key === 'Escape' && !okno.classList.contains('skrito')) zapustiOkno();
  });

  /* ---------- napredek v datoteko in nazaj ---------- */
  var vhodNapredek = document.getElementById('vhod-napredek');
  var sporociloNapredek = document.getElementById('sporocilo-napredek');

  function sporoci(besedilo, jeNapaka) {
    sporociloNapredek.textContent = besedilo;
    sporociloNapredek.classList.toggle('napaka', !!jeNapaka);
  }

  document.getElementById('gumb-shrani-napredek').addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    var ime = global.Prenos.shrani();
    sporoci('Shranjeno v datoteko ' + ime + ' (mapa Prenosi).', false);
  });

  document.getElementById('gumb-nalozi-napredek').addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    vhodNapredek.click();
  });

  vhodNapredek.addEventListener('change', function () {
    var datoteka = vhodNapredek.files && vhodNapredek.files[0];
    if (!datoteka) return;

    global.Prenos.nalozi(datoteka, function (napaka, povzetek) {
      /* polje spraznimo, da lahko isto datoteko izbereš še enkrat */
      vhodNapredek.value = '';

      if (napaka) {
        sporoci(napaka, true);
        return;
      }

      izrisiIgralce();
      sporoci('Napredek naložen: novih igralcev ' + povzetek.igralci +
        ', posodobljenih rezultatov ' + povzetek.rezultati +
        '. Kjer sta bila dva rezultata, je obveljal boljši.', false);
      if (povzetek.igralci || povzetek.rezultati) global.Ucinki.konfeti(30);
    });
  });

  /* ---------- zagon ---------- */
  osveziGumbZvok();
  zadnjiNaslov = global.location.hash;
  try {
    global.history.replaceState({ globina: 0 }, '', global.location.href);
  } catch (n) { /* brez zgodovine stran dela naprej, le gumb nazaj je slabši */ }
  uporabi(izNaslova());
})(window);
