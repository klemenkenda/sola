/* ucinki.js - konfeti, zvoki in izgovorjava */
(function (global) {
  'use strict';

  var barve = ['#ffc53d', '#43c95d', '#3aa0ff', '#ff6b6b', '#9b6bff', '#ff9f43'];

  function konfeti(stKosov) {
    var posoda = document.getElementById('konfeti');
    if (!posoda) return;
    var n = stKosov || 60;
    for (var i = 0; i < n; i++) {
      var k = document.createElement('div');
      k.className = 'kos';
      k.style.left = Math.random() * 100 + 'vw';
      k.style.background = barve[Math.floor(Math.random() * barve.length)];
      k.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
      k.style.animationDelay = (Math.random() * 0.5) + 's';
      if (Math.random() < 0.4) k.style.borderRadius = '50%';
      posoda.appendChild(k);
      (function (el) {
        global.setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 4200);
      })(k);
    }
  }

  /* --- vklop in izklop zvoka ---
     Izbira se shrani v brskalnik, zato utišana igra ostane utišana tudi po osvežitvi
     (uporabno pri samodejnem testiranju, kjer zvoka ne želimo). */
  var KLJUC_ZVOK = 'sola-pustolovscina-zvok';
  var vklopljen = true;

  try {
    vklopljen = global.localStorage.getItem(KLJUC_ZVOK) !== 'ne';
  } catch (e) {
    /* zasebni način - zvok ostane vklopljen */
  }

  /* Naslov ?zvok=0 utiša igro že ob nalaganju, torej pred prvim vprašanjem.
     Samodejni testi (Playwright) tako ne spregovorijo, čeprav gumba še ni nihče
     kliknil - izbira velja le za to nalaganje in se ne shrani. */
  var vUrl = String((global.location && global.location.search) || '').match(/[?&]zvok=([^&]*)/);
  if (vUrl) vklopljen = !/^(0|ne|off|false)$/i.test(vUrl[1]);

  function nastaviZvok(naj) {
    vklopljen = !!naj;
    try {
      global.localStorage.setItem(KLJUC_ZVOK, vklopljen ? 'da' : 'ne');
    } catch (e) {
      /* ni pomembno - izbira velja vsaj do osvežitve */
    }
    if (!vklopljen) utisaj();
    return vklopljen;
  }

  function preklopiZvok() {
    return nastaviZvok(!vklopljen);
  }

  /* Prekinemo, kar se ravno predvaja (izgovorjava zna trajati več sekund). */
  function utisaj() {
    if (!global.speechSynthesis) return;
    try { global.speechSynthesis.cancel(); } catch (e) { /* ni pomembno */ }
  }

  /* --- zvok --- */
  var ac = null;
  function kontekst() {
    if (ac) return ac;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ac = new AC(); } catch (e) { ac = null; }
    return ac;
  }

  function ton(frekvenca, zacetek, trajanje, glasnost) {
    if (!vklopljen) return;
    var c = kontekst();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(frekvenca, c.currentTime + zacetek);
    g.gain.setValueAtTime(0.0001, c.currentTime + zacetek);
    g.gain.exponentialRampToValueAtTime(glasnost || 0.22, c.currentTime + zacetek + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + zacetek + trajanje);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + zacetek);
    o.stop(c.currentTime + zacetek + trajanje + 0.05);
  }

  var zvoki = {
    pravilno: function () { ton(660, 0, 0.14); ton(880, 0.1, 0.2); },
    napacno: function () { ton(300, 0, 0.16); ton(200, 0.12, 0.26); },
    klik: function () { ton(520, 0, 0.07, 0.14); },
    konec: function () { ton(523, 0, 0.16); ton(659, 0.13, 0.16); ton(784, 0.26, 0.16); ton(1046, 0.39, 0.36); }
  };

  /* --- izgovorjava anglescine --- */

  /* Iščemo svetel, otroški ali ženski glas - privzeti sistemski je pogosto moški in zamolkel.
     Vrstni red: Ana (otroški glas v Windows), nato znani ženski glasovi. */
  var ZELENI = ['ana', 'jenny', 'aria', 'michelle', 'zira', 'eva', 'hazel', 'samantha',
    'karen', 'moira', 'tessa', 'female'];

  var izbranGlas = null;
  var glasIskan = false;

  function angleskiGlasovi() {
    if (!global.speechSynthesis || !global.speechSynthesis.getVoices) return [];
    var vsi = global.speechSynthesis.getVoices() || [];
    return vsi.filter(function (g) { return /^en[-_]?/i.test(g.lang || ''); });
  }

  /* ime glasu razbijemo na besede, da se "ana" ne ujame sredi druge besede */
  function imaBesedo(ime, beseda) {
    return String(ime || '').toLowerCase().split(/[^a-z]+/).indexOf(beseda) >= 0;
  }

  function najdiGlas() {
    var angleski = angleskiGlasovi();
    if (!angleski.length) return null;

    for (var i = 0; i < ZELENI.length; i++) {
      var zelen = ZELENI[i];
      var najden = angleski.filter(function (g) { return imaBesedo(g.name, zelen); })[0];
      if (najden) return najden;
    }
    return angleski[0];
  }

  function glas() {
    /* seznam glasov je lahko ob zagonu še prazen, zato poskusimo znova */
    if (!glasIskan || !izbranGlas) {
      izbranGlas = najdiGlas();
      glasIskan = !!izbranGlas;
    }
    return izbranGlas;
  }

  if (global.speechSynthesis) {
    /* brskalnik glasove naloži z zamikom */
    global.speechSynthesis.onvoiceschanged = function () {
      izbranGlas = najdiGlas();
      glasIskan = !!izbranGlas;
    };
    glas();
  }

  function izgovori(besedilo, jezik) {
    if (!vklopljen) return false;
    if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) return false;
    try {
      global.speechSynthesis.cancel();
      var u = new global.SpeechSynthesisUtterance(besedilo);
      var g = glas();
      if (g) {
        u.voice = g;
        u.lang = g.lang;
      } else {
        u.lang = jezik || 'en-US';
      }
      u.rate = 0.88;    /* malo počasneje, da otrok sliši vsak zlog */
      u.pitch = 1.25;   /* višje in bolj veselo */
      u.volume = 1;
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  global.Ucinki = {
    konfeti: konfeti,
    zvok: zvoki,
    izgovori: izgovori,
    zvokVklopljen: function () { return vklopljen; },
    nastaviZvok: nastaviZvok,
    preklopiZvok: preklopiZvok,
    glas: glas,                      /* kateri glas je izbran (za preverjanje) */
    glasovi: angleskiGlasovi
  };
})(window);
