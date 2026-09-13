# Šolska pustolovščina

Motivacijska učna igra za otroke od 1. do 9. razreda; igralce ustvariš, urediš in
izbrišeš kar v igri, v kodi jih ni. Čisti HTML/CSS/JS, brez knjižnic in brez gradnje —
dvoklik na `index.html` in deluje (tudi brez interneta).

**Igra v živo: <https://klemenkenda.github.io/sola/>**

## Zagon

Odpri `index.html` v brskalniku (Edge, Chrome, Firefox). Nobenega strežnika ni treba.

### Zvok

Spodaj desno je gumb za zvok (🔊 / 🔇). Klik utiša oziroma znova vklopi piske in
izgovorjavo; izbira se shrani v brskalnik, zato utišana igra ostane utišana tudi po
osvežitvi. Gumb je viden na vseh zaslonih.

**Pri samodejnem testiranju** (Playwright ipd.) odpri stran z `?zvok=0`:

```
file:///.../index.html?zvok=0        # ali http://localhost:8080/?zvok=0
```

Tako je igra tiha že od prvega izrisa. Gumb za to ne zadošča: igri »Strawberry Street«
in »Ugani besede« spregovorita sami od sebe kmalu po začetku, klik pa pride prepozno.
Zgolj `--mute-audio` v brskalniku tudi ne zadošča — izgovorjava (SpeechSynthesis) gre
v Windows mimo zvoka zavihka in se sliši kljub temu. Izbira iz naslova velja le za
tisto nalaganje in se ne shrani, zato otroku ne utiša igre.

### Igralci

Ob prvem obisku je stran **prazna** — nobenega igralca ni in profesor Uhec povabi
obiskovalca, naj si ga ustvari. Tako je igra takoj uporabna za kogarkoli, ne le za
otroka, po katerem bi bila vnaprej posejana. Če izbrišeš vse igralce, se stran vrne
v to začetno stanje.

Na prvem zaslonu je poleg kartic igralcev tudi kartica **➕ Nov igralec**: vpišeš ime,
starost in razred ter izbereš sličico in barvo. Razred igra predlaga kar sama
(v 1. razred otroci vstopijo pri šestih letih), dokler ga ne izbereš ročno — od razreda
je odvisno, katere predmete in katere naloge otrok vidi.

Svinčnik ✏️ v kotu kartice odpre urejanje istega igralca; tam je tudi izbris. **Skupaj
z igralcem se izbrišejo tudi vse njegove točke**, zato igra pred tem vpraša za potrditev.

### Napredek na drugo napravo (izvoz in uvoz)

Točke živijo v brskalniku naprave, na kateri se otrok igra. Pod karticami igralcev sta
zato dva gumba:

- **⬇️ Shrani napredek** — shrani datoteko `solska-pustolovscina-<datum>.json`
  (igralci + vsi rezultati po dnevih) v mapo Prenosi.
- **⬆️ Naloži napredek** — prebere tako datoteko nazaj.

Uvoz **združuje, ne prepiše**: igralce, ki jih naprava še ne pozna, doda, pri vsaki igri
posameznega dne pa obdrži boljši rezultat. Isto datoteko lahko uvoziš večkrat in točk ne
napihne. Tako lahko Lenart popoldne vadi na tablici, zvečer pa napredek prenese na
računalnik — ali si naredi varnostno kopijo, preden počisti brskalnik.

### Zagon v Dockerju

Da se otroka lahko igrata tudi s tablice ali telefona na domačem omrežju:

```bash
docker compose up -d --build     # zaženi
docker compose down              # ustavi
docker compose logs -f           # dnevnik
```

- na računalniku: <http://localhost:8080/>
- na tablici/telefonu v istem omrežju: `http://<IP-računalnika>:8080/`

`docker-compose.yml` mapira `index.html`, `css/` in `js/` neposredno v vsebnik,
zato se sprememba kode vidi že ob osvežitvi strani — slike ni treba graditi znova.

**Pozor:** točke so shranjene v brskalniku posamezne naprave. Lenart na tablici in
Lenart na računalniku imata torej ločeni vsoti; samodejnega seštevka med napravami
ni (za to bi potrebovali strežnik z bazo), ročno pa ju združiš z gumboma
**Shrani napredek** / **Naloži napredek**.

## Objava na GitHub Pages

Stran teče na <https://klemenkenda.github.io/sola/>. Ker gre za čiste datoteke brez
gradnje, GitHub Pages zadošča — strežnika ni in ga stran ne potrebuje.

Objavo opravi delovni tok [.github/workflows/pages.yml](.github/workflows/pages.yml):
ob vsakem potisku v vejo `main` zapakira vsebino repozitorija in jo objavi. Ročno ga
lahko pognaš v zavihku **Actions → Objava na GitHub Pages → Run workflow**.

```bash
git add -A
git commit -m "Kaj sem spremenil"
git push                 # čez minuto ali dve je sprememba na spletu
```

Nastavitev, ki mora biti izbrana v GitHubu (enkratno, že opravljeno):
**Settings → Pages → Source: GitHub Actions**.

Dve podrobnosti, ki jih je vredno ohraniti:

- Vse poti do `css/` in `js/` so **relativne**, zato stran deluje tako v podmapi
  (`/sola/`) kot na morebitni lastni domeni. Poti, ki se začnejo s poševnico
  (`/css/style.css`), bi se na GitHub Pages polomile.
- Prazna datoteka `.nojekyll` pove GitHubu, naj datotek ne obdeluje z Jekyllom.

**Kaj GitHub Pages ne zna:** poganjati kode na strežniku. Ni baze, ni prijave, ni
skupne lestvice med napravami — zato se napredek prenaša z datoteko (glej zgoraj).

## Struktura

```
index.html            ogrodje strani in zasloni
css/style.css         celotna grafična podoba in animacije
.github/workflows/pages.yml   samodejna objava na GitHub Pages
js/shramba.js         rezultati po dnevih (localStorage); seštevki dan/teden/mesec; izvoz/uvoz
js/igralci.js         seznam igralcev (localStorage): dodajanje, urejanje, brisanje
js/prenos.js          napredek v datoteko .json in nazaj
js/liki.js            profesor Uhec – animirana SVG sova (vesel / žalosten / navaden)
js/ucinki.js          konfeti, zvoki (WebAudio) in izgovorjava (SpeechSynthesis)
js/podatki.js         predmeti po razredih (predmetnik OŠ) in register iger
js/igra-osnova.js     skupna pravila: točkovanje, vrstica stanja, zaključni zaslon
js/igre/ang-stevila.js    angleščina: številke 0–10, 0–20 in 0–50 (tri naloge)
js/igre/ang-pozdravi.js   angleščina: povezovanje pozdravov s prevodi (oblački)
js/igre/ang-besede.js     angleščina: mednarodne besede iz vaje S-2
js/igre/ang-prizor.js     angleščina: iskanje pojmov na narisanem prizoru
js/igre/mat-postevanka.js matematika: poštevanka do 10
js/igre/mat-sestevanje.js matematika: seštevanje do 10/20/100
js/igre/mat-desetka-tetris.js matematika: padajoče kocke, ki se v parih seštejejo v 10
js/app.js             navigacija: igralec → predmet → igra; okno za igralca, gumbi za napredek
```

## Igre

| Igra | Predmet | Razredi | Kako deluje |
|---|---|---|---|
| Številke 0–10 | Angleščina | 2.–5. | Prikaže se število, otrok ga zapiše z angleško besedo. Namig razkrije prvo črko. |
| Številke 0–20 | Angleščina | 3.–5. | Isto, z najstnimi števili (eleven … nineteen). |
| Številke 0–50 | Angleščina | 4.–5. | Isto, s sestavljenimi števili (twenty-one, forty-seven). |
| Pozdravi — poveži oblačke | Angleščina | 2.–5. | Oblački v krogu okoli sove; otrok z miško povleče črto med angleškim pozdravom in prevodom (deluje tudi klik–klik). |
| Ugani besede | Angleščina | 3.–5. | Mednarodne besede iz vaje S-2: enkrat posluša besedo in pokaže sliko, drugič vidi sliko in izbere besedo. |
| Strawberry Street | Angleščina | 2.–5. | Prizor iz Starter unita, narisan v SVG: otrok poišče in klikne pojem na sliki (a pond, a playground, children …). |
| Poštevanka do 10 | Matematika | 3.–5. | Otrok izbere eno poštevanko ali vse pomešano. Namig nariše pravokotnik pikic (npr. 7 vrstic po 9). |
| Seštevanje | Matematika | 1.–3. | Tri stopnje: do 10, do 20 (privzeto, večinoma s prehodom čez desetico) in do 100. Namig se prilagodi računu. |
| Desetka — tetris | Matematika | 2.–5. | Kocke s številkami 1–9 padajo z vrha. Ko se dve, ki stojita druga na drugi, seštejeta v 10, obe izgineta. Namig označi stolpce, kjer je par. |

Pri številkah so vse tri stopnje **ločene naloge**, vsaka s svojim rekordom in svojimi
točkami — tako lažja stopnja ne »pokrije« težje. Sprejeti so vsi zapisi sestavljenih
števil: `twenty-one`, `twenty one` in `twentyone`.

Pozdravi v igri: Good morning, Good afternoon, Good evening, Good night, Hello, Hi,
Goodbye, Bye, See you later.

Pojmi v igri »Strawberry Street«: a window, trees, a teacher, a classroom, a park,
a pond, a playground, children, mum. Prizor je v celoti narisan z SVG (brez slik iz
učbenika); vsak pojem ima svoje klikljivo območje, namig pa pove slovenski prevod.

Besede v igri »Ugani besede« (vaja S-2, vse s slovenskim prevodom): angel, ballerina,
balloon, banana, CD, clown, cowboy, crocodile, dolphin, guitar, hamburger, kangaroo,
mobile phone, mum, park, penguin, pizza, prince, princess, pullover, robot, sandwich,
tablet, tiger. Namig pri poslušanju pokaže zapis besede, pri sliki pa odstrani dva
napačna odgovora.

Namigi pri seštevanju:

- **do 20** — pikice v vrstah po 10, prvi seštevanec rumen, drugi moder (otrok vidi polno desetico)
- **okrogle desetice** (30 + 70) — vsaka pikica je ena desetica
- **dvomestno + enomestno** (87 + 8) — desetice ostanejo, s pikicami seštejemo le enice
- **dvomestno + dvomestno** (57 + 39) — razstavitev obeh števil na desetice in enice

### Desetka — tetris

Vaja dopolnjevanja do 10 (1 + 9, 2 + 8 …), le da otrok namesto računa v zvezku lovi
padajoče kocke. Pade **20 kock**, torej je mogočih **10 desetic**; vsaka je vredna
10 točk (5, če si pomagal z namigom), niz zaporednih desetic pa prinese še bonus.
Igra se konča, ko kock zmanjka ali ko kupček zraste do vrha plošče; kar ostane
na plošči, se na koncu izpiše kot pari, ki jih velja še povaditi.

Plošča ima 6 stolpcev in 7 vrstic. Pred začetkom otrok izbere hitrost padanja
(🐢 Mirno / 🐇 Hitro / ⚡ Bliskovito); vsaka pristala kocka igro malenkost pospeši.

Krmiljenje:

- **tipkovnica** — ⬅️ ➡️ premikata kocko, ⬇️ jo požene za eno vrstico niže,
  **preslednica** jo takoj spusti
- **miška ali tablica** — tap na stolpec kocko prestavi tja, ponoven tap v isti
  stolpec jo spusti; pod ploščo so še gumbi ◀ ⬇ ▶

Vsaka številka ima svojo barvo, a pari do 10 namenoma **nimajo enake barve** —
sicer bi otrok ujemal barve namesto seštevanja. Kocke padajo ena po ena, zato
lahko nastane le en par naenkrat (verig ni): pristala kocka je v svojem stolpcu
vedno najvišja.

Da se kupček ne kopiči brez možnosti, igra vsake druge kocke ne izbere povsem
naključno, ampak vzame par k eni od kock na vrhu stolpcev.

## Točkovanje

- pravilno v prvem poskusu: **10 točk**
- pravilno po namigu ali drugem poskusu: **5 točk**
- niz 3 ali več zaporednih pravilnih: **+5 točk** bonusa pri vsakem naslednjem
- zvezdice ob koncu: 3 ⭐ (≥90 % pravilnih), 2 ⭐ (≥60 %), sicer 1 ⭐

### Šteje samo najboljši rezultat

Pri vsaki igri se za posamezen dan shrani **samo najboljši rezultat**, ne vsota poskusov.
Ponavljanje iste igre torej ne napihuje točk — otrok mora preseči svoj rekord.

Točke obdobja = seštevek najboljših rezultatov **posameznih iger** v tem obdobju:

- **Danes** — najboljši rezultat vsake igre današnjega dne
- **Ta teden** — za vsako igro najboljši dan v tednu (teden se začne v ponedeljek)
- **Ta mesec** — za vsako igro najboljši dan v koledarskem mesecu

Primer: če Lenart v ponedeljek pri poštevanki doseže 100 točk in v torek 135,
je njegov teden 135 — ne 235.

Obdobje se preklaplja z gumbi **Danes / Ta teden / Ta mesec** nad predmeti in igrami;
izbira velja tudi za številko v glavi in za točke pri posameznem predmetu.
Po koncu igre otrok vidi, ali je svoj današnji rekord presegel in za koliko.

Rezultati so shranjeni v brskalniku, zato ostanejo tudi po zaprtju strani — a so vezani
na ta brskalnik in ta računalnik.

Ponastavitev vseh točk (v konzoli brskalnika, F12):

```js
Shramba.pobrisiVse(); location.reload();
```

## Kako dodati novo igro

Točkovanje, vrstica stanja in zaključni zaslon so v `js/igra-osnova.js` (`window.Osnova`),
zato jih igri ni treba pisati znova:

- `Osnova.premesaj(polje)` — naključni vrstni red
- `Osnova.vrsticaStanja(kazalec, skupaj, tocke)` — HTML za števec, napredek in niz
- `Osnova.osveziNiz(niz)` — osveži značko 🔥
- `Osnova.tockeZaOdgovor(brezPomoci, niz)` — 10 / 5 točk + bonus za niz
- `Osnova.pohvala()` — naključna pohvala
- `Osnova.koncniZaslon(posoda, ctx, rezultat, moznosti)` — zvezdice, točke, napake, shranjevanje

1. Ustvari `js/igre/moja-igra.js` po vzoru `mat-postevanka.js`.
2. Na koncu datoteke igro prijavi v register:

```js
window.Igre.registriraj({
  id: 'mat-postevanka',              // enolični id (za shranjevanje rekordov)
  predmet: 'matematika',             // id predmeta iz js/podatki.js
  razredi: [3, 4],                   // priporočeni razredi; mlajši jo dobi kot "izziv"
  naziv: 'Poštevanka do 10',
  opis: 'Kratek opis, ki ga otrok vidi na kartici.',
  ikona: '✖️',
  zazeni: function (posoda, ctx) { /* igra izriše vsebino v `posoda` */ }
});
```

3. Dodaj `<script src="js/igre/moja-igra.js"></script>` v `index.html`
   (pred `js/app.js`).

Igra dobi `ctx` z:

- `ctx.igralec` — `{ id, ime, razred, avatar }`
- `ctx.shrani(tocke, odstotek)` — zabeleži rezultat; vrne
  `{ novRekord, prejsnji, razlika, najboljsi }` za današnji dan
  (`Osnova.koncniZaslon` to izpiše samodejno)
- `ctx.nazaj()` — vrne otroka na seznam iger

### Kdo vidi katero igro

`razredi` pove, za kateri razred je igra **priporočena** — ni pa ključavnica.
Otrok vidi vse igre, namenjene njegovemu **ali višjemu** razredu:

- naloge za njegov razred so v razdelku **»Za N. razred«**
- naloge višjih razredov so ločeno spodaj, pod **»Izzivi iz višjih razredov 💪«**,
  vsaka s še značko »Izziv 💪« na kartici

Tako Anton (2. razred) lahko poskusi tudi poštevanko in številke do 50, a takoj vidi,
kaj je zanj in kaj je izziv. Naloge nižjih razredov se starejšemu ne prikažejo
(Lenart tako nima seštevanja do 20).

Predmet z nič igrami za otrokov razred se prikaže sivo z oznako »Kmalu!« — tako je
vidno, kje bodo naloge še prišle.

### Kateri predmeti se pokažejo

Seznam predmetov v `js/podatki.js` sledi [predmetniku osnovne šole (MVI)][predmetnik],
zato otrok vidi točno tiste predmete, ki jih ima v svojem razredu na urniku:

| Predmet | Razredi |
|---|---|
| Slovenščina | 1.–9. |
| Matematika | 1.–9. |
| Angleščina (prvi tuji jezik) | 2.–9.; v 1. razredu kot neobvezni izbirni predmet |
| Nemščina (drugi tuji jezik) | 4.–6. neobvezni izbirni, 7.–9. obvezni izbirni predmet |
| Glasbena umetnost | 1.–9. |
| Likovna umetnost | 1.–9. |
| Spoznavanje okolja → Naravoslovje in tehnika → Naravoslovje | 1.–3. → 4.–5. → 6.–7. |
| Družba | 4.–5. |
| Geografija | 6.–9. |
| Zgodovina | 6.–9. |
| Domovinska in državljanska kultura in etika | 7.–8. |
| Tehnika in tehnologija | 6.–8. |
| Gospodinjstvo | 5.–6. |
| Biologija, Kemija, Fizika | 8.–9. |
| Šport | 1.–9. |

[predmetnik]: https://www.gov.si/assets/ministrstva/MVI/Dokumenti/Osnovna-sola/Ucni-nacrti/Predmetnik-OS/Predmetnik-za-osnovno-solo.pdf

Zato Anton (2. razred) nemščine sploh ne vidi, Lenart (4. razred) pa jo dobi z oznako
»izbirni predmet«; Antonovo naravoslovje se imenuje **Spoznavanje okolja**, Lenartovo
pa **Naravoslovje in tehnika** — tako kot v šoli. Predmeti z igrami so na zaslonu prvi,
sivi (»Kmalu!«) pa za njimi.

V `js/podatki.js` predmet opišejo tri polja:

```js
{ id: 'nemscina', naziv: 'Nemščina', ikona: '🥨',
  razredi: odDo(4, 9),      // razredi, v katerih je predmet na urniku
  izbirni: odDo(4, 9),      // razredi, v katerih ga otrok izbere sam
  nazivi: [ ... ],          // le pri predmetih, ki se čez razrede preimenujejo
  barva: '...' }
```

## Uporabni pripomočki

- `Liki.reagiraj(element, uspeh)` — sova poskoči (uspeh) ali potarna (napaka)
- `Ucinki.konfeti(60)`, `Ucinki.zvok.pravilno() / .napacno() / .klik() / .konec()`
- `Ucinki.izgovori('seven', 'en-US')` — izgovorjava (za jezikovne igre)
- `Ucinki.zvokVklopljen()`, `Ucinki.nastaviZvok(true/false)`, `Ucinki.preklopiZvok()` —
  stanje zvoka (gumb 🔊 spodaj desno; utišano stanje velja za piske in izgovorjavo)
