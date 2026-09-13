/* slo-povedi.js - Slovenščina: iz pomešanih besed sestavi poved
 * Besede plavajo kot oblački; otrok jih klikne ali povleče v okvirčke pod njimi.
 * Prvo besedo igra sama napiše z veliko začetnico, na koncu doda piko.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_POVEDI = 8;

  /* Povedi pišemo tako, kot bi bile videti sredi besedila: lastna imena z veliko,
     vse drugo z malo začetnico (igra prvo besedo sama povečá). Kjer je naraven tudi
     drug besedni red, ga naštejemo v `tudi` - oboje velja za pravilno. */
  var LAZJE = [
    'Maja kuha juho',
    { poved: 'ura glasno tiktaka', tudi: ['ura tiktaka glasno'] },
    'Manca je učenka',
    'Lenart je poreden',
    'Anton ne uboga',
    'Lenka pripravlja pojedino',
    'Anton spušča zmaja',
    'Lenart se potaplja',
    'Anton noče plavati',
    'Klemen programira igrico',
    'igrice niso dobre',
    'Maja riše sonce',
    { poved: 'sova tiho leti', tudi: ['sova leti tiho'] },
    'zmaj bruha ogenj',
    'Lenart bere strip',
    'muca lovi miš',
    'Anton se smeji',
    { poved: 'dež močno lije', tudi: ['dež lije močno'] },
    'Manca poje pesem',
    'Klemen popravlja računalnik',
    'Lenka zaliva rože',
    { poved: 'pes glasno laja', tudi: ['pes laja glasno'] },
    'Maja je najmlajša',
    { poved: 'sonce toplo greje', tudi: ['sonce greje toplo'] },
    'Lenart ne posluša',
    'Anton meče žogo',
    'vitezi branijo grad',
    'Manca se uči',
    'zmaj rad spi',
    'Klemen kuha kavo',
    'Lenka piše pismo',
    'juha je vroča',
    'Anton je pogumen',
    'Maja pleše balet',
    { poved: 'sneg hitro kopni', tudi: ['sneg kopni hitro'] },
    'Lenart popravlja kolo',
    'babica peče potico',
    'Manca ni utrujena',
    'zmajček se igra',
    'Anton ne pospravlja',
    'Maja gleda risanko',
    { poved: 'veter močno piha', tudi: ['veter piha močno'] },
    'Lenka ni doma',
    'Klemen igra kitaro'
  ];

  var TEZJE = [
    'panda obvlada kung fu',
    'Manca rada bere pravljice',
    'Klemen programira zabavno igrico',
    'Lenka pripravlja veliko pojedino',
    'Anton spušča rdečega zmaja',
    'Maja kuha okusno juho',
    'Lenart se potaplja v bazenu',
    { poved: 'stara ura glasno tiktaka', tudi: ['stara ura tiktaka glasno'] },
    'Anton noče jesti špinače',
    'Maja riše veliko sonce',
    'zmaj bruha vroč ogenj',
    'Manca piše domačo nalogo',
    'Lenart bere smešen strip',
    'muca lovi majhno miš',
    'babica peče sladko potico',
    { poved: 'vitezi pogumno branijo grad', tudi: ['vitezi branijo grad pogumno'] },
    'Klemen popravlja star računalnik',
    'Lenka zaliva rdeče rože',
    'Anton meče žogo v koš',
    'Lenart ne pospravlja svoje sobe',
    'Manca se uči za test',
    'Klemen kuha močno kavo',
    { poved: 'polanski zmaj mirno spi', tudi: ['polanski zmaj spi mirno'] },
    'Anton rad spušča zmaja',
    'Maja ima novo kolo',
    'naša muca je lena',
    'Lenka bere debelo knjigo',
    'dva zmaja spita v jami'
  ];

  function velika(besedilo) {
    return besedilo.charAt(0).toUpperCase() + besedilo.slice(1);
  }

  /* Iz zapisa v seznamu naredimo nalogo: besede, dovoljeni vrstni redi in izpis. */
  function pripravi(vnos) {
    var p = typeof vnos === 'string' ? { poved: vnos } : vnos;
    return {
      besede: p.poved.split(' '),
      razlicice: [p.poved].concat(p.tudi || []).map(function (r) {
        return r.toLowerCase();
      }),
      zapis: velika(p.poved) + '.'
    };
  }

  function zazeni(posoda, ctx) {
    var tezje = false;

    pokaziUvod();

    /* ---------- uvod ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Veter je premešal besede! Postavi jih nazaj v vrsto, ' +
        'da bo <b>poved imela smisel</b>. Oblaček klikni ali ga povleci v okvirček. ' +
        'Začni s tistim, <b>kdo ali kaj</b> nekaj dela.</div>' +
        '</div>' +

        '<div class="primer-poved">' +
        '<span class="primer-besede">juho · Maja · kuha</span>' +
        '<span class="primer-pusc">➜</span>' +
        '<b>Maja kuha juho.</b>' +
        '</div>' +

        '<p class="namig-opis">Prvo besedo napišem z <b>veliko začetnico</b>, ' +
        'na konec povedi pa postavim <b>piko</b> — to dvoje opravim jaz, ' +
        'ti pa pazi na vrstni red.</p>' +

        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis" id="opis-tezavnosti"></p>' +

        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      [{ tezje: false, oznaka: '🌤️ Tri besede' },
        { tezje: true, oznaka: '⛅ Štiri in več' }].forEach(function (moznost) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (moznost.tezje === tezje ? ' izbran' : '');
        c.textContent = moznost.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          tezje = moznost.tezje;
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
      document.getElementById('opis-tezavnosti').textContent = tezje
        ? 'Povedi iz štirih ali petih besed — tudi pridevniki in "kje" se pridružijo.'
        : 'Povedi iz treh besed — kdo, kaj dela in kaj.';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        povedi: O.premesaj(tezje ? TEZJE : LAZJE).slice(0, ST_POVEDI).map(pripravi),
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

      var vlecenje = null;
      var nebo, vrstica;

      pokaziPoved();

      function trenutna() {
        return stanje.povedi[stanje.kazalec];
      }

      function pokaziPoved() {
        var naloga = trenutna();
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.povedi.length, stanje.tocke) +

          '<div class="sova-uvod" style="margin-top:6px">' +
          '<div class="lik-mesto" id="lik-igra" style="width:96px"></div>' +
          '<div class="oblacek">Sestavi poved, ki ima smisel!</div>' +
          '</div>' +

          '<div class="nebo-besed" id="nebo"></div>' +

          '<div class="poved-vrstica" id="vrstica">' +
          naloga.besede.map(function (beseda, i) {
            return '<div class="mesto" data-mesto="' + i + '"><i>' + (i + 1) + '</i></div>';
          }).join('') +
          '<span class="pika">.</span>' +
          '</div>' +

          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '<button class="gumb rumen" id="gumb-pocisti">↩️ Počisti</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        nebo = document.getElementById('nebo');
        vrstica = document.getElementById('vrstica');

        O.premesaj(naloga.besede.map(function (beseda, i) {
          return { beseda: beseda, zac: i };
        })).forEach(function (v, mesto) {
          nebo.appendChild(oblacek(v.beseda, mesto));
        });

        osveziProsta();
        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);
        document.getElementById('gumb-pocisti').addEventListener('click', pocisti);
      }

      function oblacek(beseda, zaporedna) {
        var g = document.createElement('button');
        g.type = 'button';
        g.className = 'oblak-kartica beseda';
        g.setAttribute('data-beseda', beseda);
        g.setAttribute('data-zac', zaporedna);   /* za vrnitev na isto mesto v nebu */
        g.innerHTML =
          '<span class="bula b1"></span><span class="bula b2"></span><span class="bula b3"></span>' +
          '<span class="telo">' + beseda + '</span>';
        g.addEventListener('pointerdown', function (e) { zacniVlecenje(e, g); });
        return g;
      }

      /* ---------- polja povedi ---------- */

      function mesta() {
        return [].slice.call(vrstica.querySelectorAll('.mesto'));
      }

      function vMestu(mesto) {
        return mesto.querySelector('.oblak-kartica');
      }

      function prvoProsto() {
        return mesta().filter(function (m) { return !vMestu(m); })[0] || null;
      }

      function sestavljeno() {
        return mesta().map(function (m) {
          var g = vMestu(m);
          return g ? g.getAttribute('data-beseda') : null;
        });
      }

      /* V nebo se oblaček vrne na svoje staro mesto - tako besede ne skačejo. */
      function vrniVNebo(gumb) {
        var zac = parseInt(gumb.getAttribute('data-zac'), 10);
        var za = [].slice.call(nebo.children).filter(function (d) {
          return parseInt(d.getAttribute('data-zac'), 10) > zac;
        })[0];
        nebo.insertBefore(gumb, za || null);
      }

      function postavi(gumb, mesto) {
        var obstojeci = vMestu(mesto);
        if (obstojeci === gumb) return;
        if (obstojeci) vrniVNebo(obstojeci);

        var staro = gumb.parentNode;
        mesto.appendChild(gumb);
        mesto.classList.add('polno');
        if (staro && staro.classList.contains('mesto')) staro.classList.remove('polno');

        osveziProsta();
        if (!prvoProsto()) global.setTimeout(preveri, 420);
      }

      function odstrani(gumb) {
        var staro = gumb.parentNode;
        vrniVNebo(gumb);
        if (staro && staro.classList.contains('mesto')) staro.classList.remove('polno');
        osveziProsta();
      }

      /* Naslednje prazno polje utripa, da otrok ve, kam gre beseda. */
      function osveziProsta() {
        var prosto = prvoProsto();
        mesta().forEach(function (m) {
          m.classList.toggle('naslednje', m === prosto && !stanje.odgovorjeno);
        });
      }

      function pocisti() {
        if (stanje.odgovorjeno) return;
        global.Ucinki.zvok.klik();
        mesta().forEach(function (m) {
          var g = vMestu(m);
          if (g && !g.classList.contains('pribita')) odstrani(g);
        });
        document.getElementById('odziv').textContent = '';
      }

      /* ---------- klik in vlečenje ---------- */

      function klikni(gumb) {
        if (stanje.odgovorjeno || gumb.classList.contains('pribita')) return;
        global.Ucinki.zvok.klik();

        if (gumb.parentNode.classList.contains('mesto')) {
          odstrani(gumb);
          return;
        }
        var prosto = prvoProsto();
        if (prosto) postavi(gumb, prosto);
      }

      function zacniVlecenje(e, gumb) {
        if (stanje.odgovorjeno || gumb.classList.contains('pribita')) return;
        vlecenje = { gumb: gumb, x0: e.clientX, y0: e.clientY, premaknjen: false, klon: null };
        document.addEventListener('pointermove', medVlecenjem);
        document.addEventListener('pointerup', koncajVlecenje);
        document.addEventListener('pointercancel', prekiniVlecenje);
      }

      function medVlecenjem(e) {
        if (!vlecenje) return;
        var razdalja = Math.abs(e.clientX - vlecenje.x0) + Math.abs(e.clientY - vlecenje.y0);

        if (!vlecenje.premaknjen && razdalja > 8) {
          vlecenje.premaknjen = true;
          var r = vlecenje.gumb.getBoundingClientRect();
          var klon = vlecenje.gumb.cloneNode(true);
          klon.className += ' klon';
          klon.style.width = r.width + 'px';
          document.body.appendChild(klon);
          vlecenje.klon = klon;
          vlecenje.gumb.classList.add('vlecena');
        }
        if (!vlecenje.premaknjen) return;

        e.preventDefault();
        vlecenje.klon.style.left = e.clientX + 'px';
        vlecenje.klon.style.top = e.clientY + 'px';
        oznaciCilj(e);
      }

      function koncajVlecenje(e) {
        odstraniPoslusalce();
        var v = vlecenje;
        vlecenje = null;
        pocistiCilj();
        if (!v) return;

        if (!v.premaknjen) {           /* brez premika = navaden klik (tudi na tablici) */
          klikni(v.gumb);
          return;
        }

        if (v.klon) v.klon.parentNode.removeChild(v.klon);
        v.gumb.classList.remove('vlecena');

        var cilj = mestoPod(e.clientX, e.clientY);
        global.Ucinki.zvok.klik();

        if (cilj === 'nebo') {
          if (v.gumb.parentNode.classList.contains('mesto')) odstrani(v.gumb);
          return;
        }
        if (cilj) postavi(v.gumb, cilj);
      }

      function prekiniVlecenje() {
        odstraniPoslusalce();
        if (vlecenje && vlecenje.klon) vlecenje.klon.parentNode.removeChild(vlecenje.klon);
        if (vlecenje) vlecenje.gumb.classList.remove('vlecena');
        vlecenje = null;
        pocistiCilj();
      }

      function odstraniPoslusalce() {
        document.removeEventListener('pointermove', medVlecenjem);
        document.removeEventListener('pointerup', koncajVlecenje);
        document.removeEventListener('pointercancel', prekiniVlecenje);
      }

      /* Pod prstom iščemo polje povedi ali nebo (kamor se beseda vrne). */
      function mestoPod(x, y) {
        var el = document.elementFromPoint(x, y);
        while (el && el !== document.body) {
          if (el.classList && el.classList.contains('mesto')) return el;
          if (el === nebo) return 'nebo';
          el = el.parentNode;
        }
        return null;
      }

      function oznaciCilj(e) {
        pocistiCilj();
        var cilj = mestoPod(e.clientX, e.clientY);
        if (cilj === 'nebo') nebo.classList.add('cilj');
        else if (cilj) cilj.classList.add('cilj');
      }

      function pocistiCilj() {
        nebo.classList.remove('cilj');
        mesta().forEach(function (m) { m.classList.remove('cilj'); });
      }

      /* ---------- preverjanje ---------- */

      /* Različica, ki je otrokovemu poskusu najbližja - po njej mu povemo,
         katere besede so že na svojem mestu. */
      function najblizja(poskus) {
        var naloga = trenutna();
        var najboljsa = naloga.razlicice[0], najvec = -1;

        naloga.razlicice.forEach(function (r) {
          var besede = r.split(' ');
          var ujemanj = besede.filter(function (b, i) {
            return poskus[i] && poskus[i].toLowerCase() === b;
          }).length;
          if (ujemanj > najvec) { najvec = ujemanj; najboljsa = r; }
        });
        return najboljsa.split(' ');
      }

      function preveri() {
        if (stanje.odgovorjeno) return;
        var naloga = trenutna();
        var poskus = sestavljeno();
        if (poskus.filter(function (b) { return !b; }).length) return;

        var odziv = document.getElementById('odziv');
        var lik = document.getElementById('lik-igra');
        var sestavek = poskus.join(' ').toLowerCase();

        if (naloga.razlicice.indexOf(sestavek) !== -1) {
          stanje.niz += 1;
          if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

          var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
          var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

          stanje.tocke += prisluzeno;
          stanje.pravilnih += 1;
          stanje.odgovorjeno = true;

          mesta().forEach(function (m) {
            m.classList.add('pravilno');
            var g = vMestu(m);
            if (g) g.classList.add('pravilna');
          });
          osveziProsta();

          odziv.className = 'odziv ok';
          odziv.textContent = O.pohvala() + ' ' + velika(poskus.join(' ')) + '. · +' +
            prisluzeno + ' točk' + (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');
          global.Liki.reagiraj(lik, true);
          global.Ucinki.zvok.pravilno();
          global.Ucinki.konfeti(24);
          zakleni();
          global.setTimeout(naprej, 2100);
          return;
        }

        /* poved še ni prava */
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(lik, false);
        vrstica.classList.remove('zgresena');
        void vrstica.offsetWidth;
        vrstica.classList.add('zgresena');

        if (stanje.poskus === 1) {
          /* besede, ki so že na pravem mestu, pustimo - ostale se vrnejo v nebo */
          var prave = najblizja(poskus);
          mesta().forEach(function (m, i) {
            var g = vMestu(m);
            if (!g || g.getAttribute('data-beseda').toLowerCase() === prave[i]) return;
            odstrani(g);
          });

          odziv.className = 'odziv ne';
          odziv.textContent = poskus[0].toLowerCase() === prave[0]
            ? 'Skoraj! Prvo besedo imaš pravo — premešaj še ostale.'
            : 'Skoraj! Poved začni s tistim, kdo ali kaj nekaj dela.';
          return;
        }

        /* drugič poved pokažemo */
        stanje.odgovorjeno = true;
        razkrij();
        stanje.napake.push({
          vprasanje: O.premesaj(naloga.besede).join(' · '),
          odgovor: naloga.zapis
        });
        odziv.className = 'odziv ne';
        odziv.textContent = 'Pravilno je: ' + naloga.zapis;
        global.setTimeout(naprej, 2900);
      }

      /* Namig postavi prvo še manjkajočo besedo na svoje mesto in jo pribije. */
      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        var prave = najblizja(sestavljeno());
        var vsa = mesta();

        for (var i = 0; i < vsa.length; i++) {
          var g = vMestu(vsa[i]);
          if (g && g.getAttribute('data-beseda').toLowerCase() === prave[i]) continue;

          var pravi = najdiOblacek(prave[i]);
          if (!pravi) continue;

          stanje.namigUporabljen = true;
          global.Ucinki.zvok.klik();
          postavi(pravi, vsa[i]);
          pravi.classList.add('pribita');
          document.getElementById('gumb-namig').disabled = true;

          var odziv = document.getElementById('odziv');
          odziv.className = 'odziv';
          odziv.textContent = 'Beseda »' + pravi.getAttribute('data-beseda') +
            '« gre na mesto ' + (i + 1) + '.';
          return;
        }
      }

      /* Oblaček z iskano besedo, ki ni pribit in ne stoji že pravilno. */
      function najdiOblacek(beseda) {
        return [].slice.call(posoda.querySelectorAll('.oblak-kartica.beseda'))
          .filter(function (g) {
            return g.getAttribute('data-beseda').toLowerCase() === beseda &&
              !g.classList.contains('pribita');
          })[0] || null;
      }

      function razkrij() {
        var prave = trenutna().besede;
        var vsa = mesta();
        prave.forEach(function (beseda, i) {
          var g = vMestu(vsa[i]);
          if (g && g.getAttribute('data-beseda') === beseda) return;
          var pravi = najdiOblacek(beseda.toLowerCase());
          if (pravi) postavi(pravi, vsa[i]);
        });
        vsa.forEach(function (m) { m.classList.add('razkrito'); });
        zakleni();
      }

      function zakleni() {
        stanje.odgovorjeno = true;
        osveziProsta();
        [].slice.call(posoda.querySelectorAll('.oblak-kartica.beseda')).forEach(function (g) {
          g.disabled = true;
        });
        document.getElementById('gumb-namig').disabled = true;
        document.getElementById('gumb-pocisti').disabled = true;
      }

      function naprej() {
        stanje.kazalec += 1;
        if (stanje.kazalec >= stanje.povedi.length) {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.pravilnih,
            skupaj: stanje.povedi.length,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: stanje.napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            oznakaPravilnih: 'Sestavljenih povedi',
            naslovNapak: 'Te povedi si preberi še enkrat:',
            sporocila: {
              tri: 'Vrhunsko! Tvoje povedi so kot iz knjige. 📖',
              dve: 'Zelo dobro! Še malo in vsaka poved bo stekla sama od sebe.',
              ena: 'Dober začetek! Poved preberi na glas — takoj slišiš, kje se zatakne.'
            }
          });
          return;
        }
        pokaziPoved();
      }
    }
  }

  global.Igre.registriraj({
    id: 'slo-povedi',
    predmet: 'slovenscina',
    razredi: [2, 3, 4, 5],
    naziv: 'Sestavi poved',
    opis: 'Veter je premešal besede v oblačkih — postavi jih v vrsto, da bo poved imela smisel.',
    ikona: '☁️',
    zazeni: zazeni
  });
})(window);
