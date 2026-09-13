/* igra-osnova.js - skupna pravila in gradniki, ki jih uporabljajo vse igre */
(function (global) {
  'use strict';

  var TOCKE_PRVIC = 10;   /* pravilno v prvem poskusu */
  var TOCKE_NAMIG = 5;    /* pravilno po namigu ali drugem poskusu */
  var BONUS_NIZ = 5;      /* dodatek, ko je niz 3 ali vec zaporednih */
  var NIZ_ZA_BONUS = 3;

  var POHVALE = ['Odlično!', 'Bravo!', 'Super!', 'Točno tako!', 'Imenitno!', 'Mojster!'];

  function premesaj(polje) {
    var a = polje.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pohvala() {
    return POHVALE[Math.floor(Math.random() * POHVALE.length)];
  }

  /* Koliko tock je vredno pravilno resen odgovor. */
  function tockeZaOdgovor(brezPomoci, niz) {
    if (!brezPomoci) return TOCKE_NAMIG;
    return niz >= NIZ_ZA_BONUS ? TOCKE_PRVIC + BONUS_NIZ : TOCKE_PRVIC;
  }

  function najvecTock(stVprasanj) {
    return stVprasanj * TOCKE_PRVIC + BONUS_NIZ * (stVprasanj - (NIZ_ZA_BONUS - 1));
  }

  /* Vrstica s stanjem nad igro (stevec, napredek, tocke, niz). */
  function vrsticaStanja(kazalec, skupaj, tocke) {
    return '<div class="vrstica-stanja">' +
      '<span class="stanje-znacka">Vprašanje ' + (kazalec + 1) + '/' + skupaj + '</span>' +
      '<div class="napredek"><i id="crta" style="width:' + (kazalec / skupaj * 100) + '%"></i></div>' +
      '<span class="stanje-znacka">⭐ ' + tocke + '</span>' +
      '<span class="stanje-znacka ogenj" id="znacka-niz" style="display:none"></span>' +
      '</div>';
  }

  function osveziNiz(niz) {
    var z = document.getElementById('znacka-niz');
    if (!z) return;
    if (niz >= 2) {
      z.style.display = '';
      z.textContent = '🔥 Niz ' + niz;
    } else {
      z.style.display = 'none';
    }
  }

  /* Zakljucni zaslon z zvezdicami, tockami in seznamom napak. */
  function koncniZaslon(posoda, ctx, rez, moznosti) {
    moznosti = moznosti || {};
    var odstotek = Math.round(rez.pravilnih / rez.skupaj * 100);
    var zvezd = odstotek >= 90 ? 3 : (odstotek >= 60 ? 2 : 1);

    var sporocila = moznosti.sporocila || {};
    var sporocilo = zvezd === 3 ? (sporocila.tri || 'Vrhunsko! To že obvladaš!')
      : zvezd === 2 ? (sporocila.dve || 'Zelo dobro! Še malo vaje in bo popolno.')
        : (sporocila.ena || 'Dober začetek! Ponovi še enkrat, gre ti vedno bolje.');

    var napakeHtml = '';
    if (rez.napake && rez.napake.length) {
      napakeHtml = '<p style="margin:14px 0 4px;font-weight:800">' +
        (moznosti.naslovNapak || 'Te si zapomni:') + '</p><div class="napake-seznam">' +
        rez.napake.map(function (n) {
          return '<span>' + n.vprasanje + ' = ' + n.odgovor + '</span>';
        }).join('') + '</div>';
    }

    posoda.innerHTML =
      '<div class="plosca konec">' +
      '<div class="lik-mesto" id="lik-konec" style="margin:0 auto"></div>' +
      '<h2 style="margin:6px 0;font-size:32px">' + (zvezd === 3 ? 'Popolno!' : 'Konec igre!') + '</h2>' +
      '<div class="zvezde">' +
      '<i>' + (zvezd >= 1 ? '⭐' : '☆') + '</i>' +
      '<i>' + (zvezd >= 2 ? '⭐' : '☆') + '</i>' +
      '<i>' + (zvezd >= 3 ? '⭐' : '☆') + '</i>' +
      '</div>' +
      '<div class="velike-tocke">+' + rez.tocke + ' točk</div>' +
      '<p style="font-size:20px;margin:4px 0">Pravilnih: <b>' + rez.pravilnih + ' / ' + rez.skupaj +
      '</b> · Najdaljši niz: <b>' + rez.najdaljsiNiz + '</b></p>' +
      '<p style="font-size:19px">' + sporocilo + '</p>' +
      '<div id="obvestilo-rekord"></div>' +
      napakeHtml +
      '<div class="gumbi-vrsta">' +
      '<button class="gumb zelen" id="gumb-ponovi">🔁 Še enkrat</button>' +
      '<button class="gumb" id="gumb-konec">Nazaj na igre</button>' +
      '</div>' +
      '<p style="font-size:14px;color:#7b8bab;margin-top:12px">Največ možnih točk: ' +
      najvecTock(rez.skupaj) + ' (10 za vsak pravilen odgovor + bonus za niz)</p>' +
      '</div>';

    global.Liki.vstavi(document.getElementById('lik-konec'), zvezd >= 2 ? 'vesel' : 'navaden',
      zvezd >= 2 ? 'lik-veselje' : 'lik-plava');
    global.Ucinki.zvok.konec();
    if (zvezd >= 2) global.Ucinki.konfeti(zvezd === 3 ? 140 : 70);

    /* Šteje samo najboljši rezultat dneva - otroku povemo, ali ga je presegel. */
    var izid = ctx.shrani(rez.tocke, odstotek) || {};
    var obvestilo = document.getElementById('obvestilo-rekord');
    if (obvestilo) {
      if (izid.novRekord && izid.prejsnji > 0) {
        obvestilo.className = 'rekord-obvestilo nov';
        obvestilo.innerHTML = '🎉 <b>Nov najboljši rezultat dneva!</b><br>' +
          'Prej ' + izid.prejsnji + ' točk — tvoje točke so zrasle za <b>+' +
          izid.razlika + '</b>.';
      } else if (izid.novRekord) {
        obvestilo.className = 'rekord-obvestilo nov';
        obvestilo.innerHTML = '🎉 <b>Prvi rezultat danes!</b><br>Vseh ' + rez.tocke +
          ' točk se šteje v tvojo vsoto.';
      } else {
        obvestilo.className = 'rekord-obvestilo enako';
        obvestilo.innerHTML = 'Danes si pri tej igri že dosegel <b>' + izid.najboljsi +
          ' točk</b> — ta rezultat ostane.<br>Poskusi ga preseči! 💪';
      }
    }

    document.getElementById('gumb-ponovi').addEventListener('click', function () {
      global.Ucinki.zvok.klik();
      moznosti.ponovi();
    });
    document.getElementById('gumb-konec').addEventListener('click', function () {
      global.Ucinki.zvok.klik();
      ctx.nazaj();
    });
  }

  global.Osnova = {
    TOCKE_PRVIC: TOCKE_PRVIC,
    TOCKE_NAMIG: TOCKE_NAMIG,
    BONUS_NIZ: BONUS_NIZ,
    NIZ_ZA_BONUS: NIZ_ZA_BONUS,
    premesaj: premesaj,
    pohvala: pohvala,
    tockeZaOdgovor: tockeZaOdgovor,
    najvecTock: najvecTock,
    vrsticaStanja: vrsticaStanja,
    osveziNiz: osveziNiz,
    koncniZaslon: koncniZaslon
  };
})(window);
