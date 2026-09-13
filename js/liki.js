/* liki.js - animirani liki (SVG), ki vodijo otroka skozi igro */
(function (global) {
  'use strict';

  var slogi = '' +
    '<style>' +
    '.sv-veka{transform-origin:center;animation:sv-mezik 5s infinite}' +
    '@keyframes sv-mezik{0%,92%,100%{transform:scaleY(0)}95%{transform:scaleY(1)}}' +
    '.sv-krilo-l{transform-origin:62px 116px;animation:sv-mah 2.8s ease-in-out infinite}' +
    '.sv-krilo-d{transform-origin:138px 116px;animation:sv-mah 2.8s ease-in-out infinite reverse}' +
    '@keyframes sv-mah{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-14deg)}}' +
    '.sv-cop{transform-origin:100px 34px;animation:sv-nihaj 3.2s ease-in-out infinite}' +
    '@keyframes sv-nihaj{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}' +
    '</style>';

  /* Profesor Uhec - sova z diplomsko kapo */
  function sova(razpolozenje) {
    var m = razpolozenje || 'navaden';

    var oci, kljun, lica = '';
    if (m === 'vesel') {
      /* zaprte, nasmejane oci */
      oci =
        '<path d="M72 96 q12 -16 24 0" fill="none" stroke="#243b6b" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M104 96 q12 -16 24 0" fill="none" stroke="#243b6b" stroke-width="6" stroke-linecap="round"/>';
      kljun = '<path d="M88 108 q12 22 24 0 q-12 8 -24 0z" fill="#ff9f43" stroke="#e07c15" stroke-width="2"/>';
      lica =
        '<ellipse cx="66" cy="110" rx="11" ry="8" fill="#ffb3c1" opacity=".8"/>' +
        '<ellipse cx="134" cy="110" rx="11" ry="8" fill="#ffb3c1" opacity=".8"/>';
    } else if (m === 'zalosten') {
      oci =
        '<circle cx="84" cy="94" r="16" fill="#fff"/><circle cx="84" cy="98" r="8" fill="#243b6b"/>' +
        '<circle cx="116" cy="94" r="16" fill="#fff"/><circle cx="116" cy="98" r="8" fill="#243b6b"/>' +
        /* obrvi navzgor proti sredini = socutno, ne jezno */
        '<path d="M68 82 l18 -7" stroke="#243b6b" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M132 82 l-18 -7" stroke="#243b6b" stroke-width="5" stroke-linecap="round"/>';
      kljun = '<path d="M92 112 q8 10 16 0z" fill="#ff9f43" stroke="#e07c15" stroke-width="2"/>' +
        '<path d="M88 126 q12 -10 24 0" fill="none" stroke="#243b6b" stroke-width="5" stroke-linecap="round"/>';
    } else {
      oci =
        '<circle cx="84" cy="94" r="18" fill="#fff"/><circle cx="84" cy="94" r="9" fill="#243b6b"/>' +
        '<circle cx="87" cy="90" r="3" fill="#fff"/>' +
        '<rect class="sv-veka" x="66" y="76" width="36" height="36" rx="14" fill="#c98a3f"/>' +
        '<circle cx="116" cy="94" r="18" fill="#fff"/><circle cx="116" cy="94" r="9" fill="#243b6b"/>' +
        '<circle cx="119" cy="90" r="3" fill="#fff"/>' +
        '<rect class="sv-veka" x="98" y="76" width="36" height="36" rx="14" fill="#c98a3f"/>';
      kljun = '<path d="M92 110 q8 14 16 0z" fill="#ff9f43" stroke="#e07c15" stroke-width="2"/>';
    }

    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Profesor Uhec">' +
      slogi +
      /* noge */
      '<path d="M84 168 l0 12 M76 182 h18 M116 168 l0 12 M107 182 h18" stroke="#ff9f43" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      /* telo */
      '<ellipse cx="100" cy="118" rx="58" ry="60" fill="#d99a4e"/>' +
      '<ellipse cx="100" cy="130" rx="38" ry="44" fill="#f6dfb8"/>' +
      /* krila */
      '<ellipse class="sv-krilo-l" cx="52" cy="122" rx="15" ry="34" fill="#c98a3f"/>' +
      '<ellipse class="sv-krilo-d" cx="148" cy="122" rx="15" ry="34" fill="#c98a3f"/>' +
      /* glava */
      '<ellipse cx="100" cy="86" rx="54" ry="48" fill="#d99a4e"/>' +
      '<path d="M50 60 q10 -22 22 -6z" fill="#c98a3f"/>' +
      '<path d="M150 60 q-10 -22 -22 -6z" fill="#c98a3f"/>' +
      oci + kljun + lica +
      /* diplomska kapa */
      '<g class="sv-cop">' +
      '<rect x="66" y="34" width="68" height="12" rx="4" fill="#3a4a7a"/>' +
      '<path d="M100 16 l44 20 -44 14 -44 -14z" fill="#243b6b"/>' +
      '<path d="M140 38 l0 22" stroke="#ffc53d" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="140" cy="64" r="6" fill="#ffc53d"/>' +
      '</g>' +
      '</svg>';
  }

  /* Vstavi lika v element in mu nastavi razpolozenje. */
  function vstavi(element, razpolozenje, animacija) {
    if (!element) return;
    element.innerHTML = sova(razpolozenje);
    var svg = element.firstChild;
    svg.setAttribute('class', animacija || 'lik-plava');
  }

  /* Kratka reakcija (veselje / tresenje), nato nazaj v mirovanje. */
  function reagiraj(element, uspeh) {
    if (!element) return;
    vstavi(element, uspeh ? 'vesel' : 'zalosten', uspeh ? 'lik-veselje' : 'lik-tresenje');
    global.clearTimeout(element._casovnik);
    element._casovnik = global.setTimeout(function () {
      vstavi(element, 'navaden', 'lik-plava');
    }, 1600);
  }

  global.Liki = { sova: sova, vstavi: vstavi, reagiraj: reagiraj };
})(window);
