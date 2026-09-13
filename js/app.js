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

  var glava = document.getElementById('glava');
  var gumbNazaj = document.getElementById('gumb-nazaj');
  var gumbZvok = document.getElementById('gumb-zvok');

  function oznakaObdobja() {
    return OBDOBJA.filter(function (o) { return o.id === obdobje; })[0].kratko;
  }

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
  function izrisiObdobja(posoda, obNapravi) {
    posoda.innerHTML = '';
    OBDOBJA.forEach(function (o) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'cip' + (o.id === obdobje ? ' izbran' : '');
      c.textContent = o.oznaka;
      c.addEventListener('click', function () {
        global.Ucinki.zvok.klik();
        obdobje = o.id;
        osveziGlavo();
        obNapravi();
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
      odpriOkno(igralec);
    });

    k.addEventListener('click', function () {
      global.Ucinki.zvok.klik();
      trenutniIgralec = igralec;
      osveziGlavo();
      izrisiPredmete();
      pokaziZaslon('zaslon-predmeti');
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
      odpriOkno(null);
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

    izrisiObdobja(document.getElementById('obdobje-predmeti'), izrisiPredmete);

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
        trenutniPredmet = predmet;
        izrisiIgre();
        pokaziZaslon('zaslon-igre');
      });
      posoda.appendChild(k);
    });
  }

  /* ---------- zaslon: igre predmeta ---------- */
  function izrisiIgre() {
    document.getElementById('naslov-predmeta').textContent =
      trenutniPredmet.ikona + ' ' + trenutniPredmet.naziv;

    izrisiObdobja(document.getElementById('obdobje-igre'), izrisiIgre);

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
      k.addEventListener('click', function () { zazeniIgro(igra); });
      mreza.appendChild(k);
    });
  }

  /* ---------- zagon igre ---------- */
  function zazeniIgro(igra) {
    global.Ucinki.zvok.klik();
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
      nazaj: function () {
        izrisiIgre();
        pokaziZaslon('zaslon-igre');
      }
    });
  }

  /* ---------- gumb nazaj ---------- */
  gumbNazaj.addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    var aktiven = document.querySelector('.zaslon.aktiven').id;

    if (aktiven === 'zaslon-igra') {
      izrisiIgre();
      pokaziZaslon('zaslon-igre');
    } else if (aktiven === 'zaslon-igre') {
      izrisiPredmete();
      pokaziZaslon('zaslon-predmeti');
    } else {
      izrisiIgralce();
      pokaziZaslon('zaslon-igralci');
    }
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
    zapriOkno();
    izrisiIgralce();
  }

  function izbrisiIgralca() {
    var igralec = global.Igralci.najdi(urejaniId);
    if (!igralec) return;

    var potrdi = global.confirm('Res izbrišem igralca ' + igralec.ime +
      '? Skupaj z njim se izbrišejo tudi vse njegove točke.');
    if (!potrdi) return;

    global.Igralci.izbrisi(urejaniId);
    if (trenutniIgralec && trenutniIgralec.id === urejaniId) trenutniIgralec = null;

    zapriOkno();
    izrisiIgralce();
  }

  document.getElementById('gumb-shrani-igralca').addEventListener('click', shraniIgralca);
  document.getElementById('gumb-preklici-igralca').addEventListener('click', function () {
    global.Ucinki.zvok.klik();
    zapriOkno();
  });
  gumbIzbrisi.addEventListener('click', izbrisiIgralca);

  /* klik mimo okna in tipka Esc zapreta okno */
  okno.addEventListener('click', function (dogodek) {
    if (dogodek.target === okno) zapriOkno();
  });
  document.addEventListener('keydown', function (dogodek) {
    if (dogodek.key === 'Escape' && !okno.classList.contains('skrito')) zapriOkno();
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
  izrisiIgralce();
  pokaziZaslon('zaslon-igralci');
})(window);
