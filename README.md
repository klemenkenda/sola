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
js/igre/nem-pozdravi.js   nemščina: povezovanje pozdravov s prevodi (oblački)
js/igre/slo-abeceda.js    slovenščina: abeceda s številkami in skrivno sporočilo
js/igre/slo-povedi.js     slovenščina: iz pomešanih besed sestavi poved
js/igre/slo-opis-slike.js slovenščina: podčrtaj povedi, ki sodijo k narisani pikapolonici
js/igre/mat-postevanka.js matematika: poštevanka do 10
js/igre/mat-sestevanje.js matematika: seštevanje do 10/20/100
js/igre/mat-desetka-tetris.js matematika: padajoče kocke, ki se seštejejo v ciljno število
js/app.js             navigacija: igralec → predmet → igra; okno za igralca, gumbi za napredek
```

## Naslovi strani

Vsak zaslon ima svoj naslov, zato osvežitev odpre isto stran, gumb »nazaj«
(v brskalniku in na telefonu) pa dela pričakovano. Ker stran teče kot statične
datoteke, je pot zapisana za lojtro:

| Naslov | Kaj odpre |
| --- | --- |
| `#/` | izbira igralca |
| `#/nov` | okno za novega igralca |
| `#/uredi/mojca` | okno za urejanje igralca |
| `#/igralec/mojca` | predmeti |
| `#/igralec/mojca/matematika` | igre pri matematiki |
| `#/igralec/mojca/matematika/mat-postevanka` | igra |

Povezavo do igre lahko tako deliš ali shraniš med zaznamke. Izbrano obdobje visi
zadaj kot `?obdobje=teden` ali `?obdobje=mesec` (`dan` je privzet in ga ni treba
pisati) in zgodovine ne podaljšuje — menjava pogleda torej ne doda koraka, ki bi
ga bilo treba prekliknit nazaj. Naslov, ki ga ni več (izbrisan igralec ali igra,
ki je ta razred nima), stran tiho preusmeri na nadrejeni zaslon.

## Igre

| Igra | Predmet | Razredi | Kako deluje |
|---|---|---|---|
| Številke 0–10 | Angleščina | 2.–5. | Prikaže se število, otrok ga zapiše z angleško besedo. Namig razkrije prvo črko. |
| Številke 0–20 | Angleščina | 3.–5. | Isto, z najstnimi števili (eleven … nineteen). |
| Številke 0–50 | Angleščina | 4.–5. | Isto, s sestavljenimi števili (twenty-one, forty-seven). |
| Pozdravi — poveži oblačke | Angleščina | 2.–5. | Oblački v krogu okoli sove; otrok z miško povleče črto med angleškim pozdravom in prevodom (deluje tudi klik–klik). |
| Ugani besede | Angleščina | 3.–5. | Mednarodne besede iz vaje S-2: enkrat posluša besedo in pokaže sliko, drugič vidi sliko in izbere besedo. |
| Strawberry Street | Angleščina | 2.–5. | Prizor iz Starter unita, narisan v SVG: otrok poišče in klikne pojem na sliki (a pond, a playground, children …). |
| Pozdravi — poveži oblačke | Nemščina | 4.–9. | Isto kot pri angleščini, z nemškimi pozdravi. Vsaka kartica v uvodu pove tudi, kako se pozdrav izgovori (»Tschüss« → čüs). |
| Skrivna abeceda | Slovenščina | 2.–5. | Otrok dopolni pet manjkajočih črk abecede (vsaka ima svojo številko), nato s to abecedo kot ključem razvozla skrivno sporočilo z zmajskega stolpa. |
| Sestavi poved | Slovenščina | 2.–5. | Besede ene povedi priplavajo kot oblački v pomešanem vrstnem redu; otrok jih s klikom ali vlečenjem zloži v okvirčke pod njimi. Prvo besedo igra napiše z veliko začetnico, na koncu doda piko. |
| Podčrtaj povedi | Slovenščina | 2.–4. | Pikapolonica se vsakič nariše drugače (očala, pričeska, obleka, pike, obutev, predmet v roki). Otrok pri vsaki povedi pove, ali sodi k sliki; povedi, ki ne sodijo, na koncu popravi z izbiro prave besede. |
| Poštevanka do 10 | Matematika | 3.–5. | Otrok izbere eno poštevanko ali vse pomešano. Namig nariše pravokotnik pikic (npr. 7 vrstic po 9). |
| Seštevanje | Matematika | 1.–3. | Tri stopnje: do 10, do 20 (privzeto, večinoma s prehodom čez desetico) in do 100. Namig se prilagodi računu. |
| Desetka — tetris | Matematika | 2.–5. | Kocke s številkami 1–9 padajo z vrha. Ko se tiste, ki stojijo druga na drugi, seštejejo v ciljno število, izginejo. Tri stopnje: 10 z dvema kockama, nad 10 z dvema ali tremi, do 20 s poljubno mnogo. |

Pri številkah so vse tri stopnje **ločene naloge**, vsaka s svojim rekordom in svojimi
točkami — tako lažja stopnja ne »pokrije« težje. Sprejeti so vsi zapisi sestavljenih
števil: `twenty-one`, `twenty one` in `twentyone`.

Pozdravi v angleški igri: Good morning, Good afternoon, Good evening, Good night,
Hello, Hi, Goodbye, Bye, See you later.

Pozdravi v nemški igri: Guten Morgen, Guten Tag, Guten Abend, Gute Nacht, Hallo,
Tschüss, Auf Wiedersehen, Bis später, Wie geht's? Ker otrok nemškega zapisa še ne zna
prebrati, ima vsak pozdrav ob prevodu še približno izgovorjavo, zapisano po slovensko
(*auf vídarzejen*), namig med igro pa jo ponovi. Igra je na voljo v vseh razredih,
v katerih je nemščina na urniku (4.–9.), ker je pri drugem tujem jeziku vsak razred
lahko začetniški.

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

### Skrivna abeceda

Igra ima dva dela in oba uporabljata isto tabelo — **slovensko abecedo s 25 črkami**,
kjer ima vsaka črka svojo številko (A = 1, Č = 4, Ž = 25).

1. **Dopolni abecedo.** Pet naključnih črk je v tabeli skritih (`?`), otrok pa pove,
   katera črka stoji na določenem mestu. Skrite črke nikoli niso sosednje, zato si otrok
   lahko vedno pomaga s sosedom levo in desno — prav to pokaže **namig** (»pred njo je
   C (3), za njo je D (5)«), ki ju v tabeli tudi obarva. Za č, š in ž so pod vnosnim
   poljem gumbi, če jih otrok na tipkovnici nima.
2. **Razvozlaj skrivno sporočilo.** Sporočilo je zapisano s številkami; pod vsakim
   poljem piše številka črke. Otrok ga rešuje **besedo za besedo** — ko je beseda polna,
   se preveri sama. Pri prvi napaki se izbrišejo samo zgrešene črke, pri drugi se beseda
   razkrije in gre igra naprej. Črko lahko natipka ali pa klikne v **ključu** (tabela
   abecede pod sporočilom). Ločila so že izpisana, presledki ločujejo besede.
   Namig razkrije prvo prazno črko besede.

Točkuje se vsaka črka in vsaka beseda posebej, torej po običajnih pravilih
(10 / 5 točk + bonus za niz). Vprašanj je `5 + število besed v sporočilu`.
Ko je sporočilo razvozlano, se izpiše v celoti — to je nagrada, ki jo otrok lovi.

Sporočil je **29** in so vsa iz iste zgodbe o polanskem zmaju:

> Polanski zmaj spi. Vse je v redu.
> Zmajevi zobje so topi. Pokličite zobozdravnika.
> Vitezi prihajajo, da obranijo Polano pred zmajem.

Otrok pred začetkom izbere **✉️ krajše** (do 30 črk) ali **📜 daljše** sporočilo;
igra vsakič izžreba drugo in nikoli dvakrat zapored istega. Novo sporočilo dodaš tako,
da ga pripišeš v seznam `SPOROCILA` v `js/igre/slo-abeceda.js` — uporabi samo črke
slovenske abecede (brez q, w, x in y), sicer se ne da zapisati s številko.

### Sestavi poved

Vaja besednega reda: iz treh (ali štirih in več) pomešanih besed nastane poved,
ki ima smisel. Besede plavajo kot **oblački** nad vrstico praznih okvirčkov —
otrok jih **klikne** (beseda skoči v naslednji prazen okvirček, ponoven klik jo vrne
v nebo) ali **povleče** z miško oziroma prstom v točno določen okvirček. Ko so vsi
okvirčki polni, se poved preveri sama.

Dvoje igra opravi sama in otrok to vidi sproti: **prvo besedo zapiše z veliko
začetnico** (v oblačku piše »ura«, v prvem okvirčku pa »Ura«), na konec vrstice pa
postavi **piko**.

- prva napaka — besede, ki že stojijo prav, ostanejo na svojem mestu, ostale se
  vrnejo v nebo; odziv pove, ali je začetek povedi pravi
- druga napaka — igra poved sestavi sama in gre naprej, poved se zapiše med napake
- **namig** postavi prvo manjkajočo besedo na njeno mesto in jo pribije (velja kot pomoč)
- **počisti** vrne vse nepribite besede nazaj v nebo

Otrok pred začetkom izbere **🌤️ tri besede** (44 povedi: *Maja kuha juho.*,
*Ura glasno tiktaka.*, *Anton noče plavati.*) ali **⛅ štiri in več** (28 povedi
s pridevniki in okoliščinami: *Panda obvlada kung fu.*, *Klemen programira zabavno
igrico.*, *Dva zmaja spita v jami.*). V enem krogu je **8 povedi**, vsaka je eno
vprašanje.

Povedi so v `js/igre/slo-povedi.js` zapisane tako, kot bi bile videti **sredi
besedila** — lastna imena z veliko, vse drugo z malo začetnico, brez pike:

```js
'Maja kuha juho',
{ poved: 'ura glasno tiktaka', tudi: ['ura tiktaka glasno'] },
```

Kjer je naraven tudi drug besedni red, ga naštejemo v `tudi` — vsi našteti redi
veljajo za pravilne. Nova poved je torej ena vrstica več v seznamu `LAZJE` ali `TEZJE`.

### Podčrtaj povedi

Vaja branja z razumevanjem po vzoru delovnega zvezka: **podčrtaj povedi, ki sodijo
k sličici**, tiste, ki ne sodijo, pa popravi. Slike ni v datoteki — **pikapolonico
nariše igra sama** (SVG) iz osmih naključno izbranih lastnosti:

| Lastnost | Možnosti | Poved |
|---|---|---|
| oblika očal | okrogla, oglata, srčasta | *Polona nosi okrogla očala.* |
| barva očal | rdeča, modra, zelena, rumena | *Njena očala so rdeča.* |
| pričeska | dolga kita, dva čopka, kratki, kodrasti lasje | *Polona ima dolgo kito.* |
| barva las | rjavi, rdeči, črni, rumeni | *Njeni lasje so rjavi.* |
| barva obleke | rdeče, zelene, modre, rumene | *Njena obleka je zelene barve.* |
| barva pik | črne, bele, rumene, modre | *Na obleki ima črne pike.* |
| obutev | škornje, superge, natikače, copate | *Obuta je v škornje.* |
| predmet v roki | svinčnik, knjigo, žogo, dežnik | *V roki drži svinčnik.* |

Povedi nastanejo iz **istih** lastnosti kot risba: če je v povedi prava vrednost,
poved drži, sicer je vanjo podtaknjena katera koli druga možnost. Slika in besedilo
se torej nikoli ne razideta in nalog ni treba pisati na roko.

Igra teče v dveh delih, tako kot v zvezku:

1. **Podčrtaj.** Za vsako poved otrok klikne **✏️ Podčrtaj** ali **🚫 Ne sodi**.
   Ker gre za odločitev med dvema možnostma, ima **en sam poskus** — drugi bi bil
   že odgovor. Podčrtane povedi dobijo zeleno črto, ostale ostanejo sive.
2. **Popravi.** Vsako poved, ki ne sodi, otrok popravi: izbere pravo besedo med
   tremi (med njimi je tudi tista napačna iz prvega dela). Popravljena beseda se
   zapiše v seznam in poved se podčrta. Tu velja običajno pravilo — druga izbira
   je vredna 5 točk, po njej igra pokaže pravilno.

Otrok pred začetkom izbere **🌤️ eno sliko** (6 povedi, od tega 3 napačne → 9 nalog)
ali **⛅ dve sliki** (po 5 povedi, od tega 2 napačni → 14 nalog).

Novo lastnost dodaš tako, da jo pripišeš v seznam `LASTNOSTI` v
`js/igre/slo-opis-slike.js` (poved s `zapis` in seznam `moznosti`) in narišeš njene
različice v `likSvg`. Pike se nikoli ne izžrebajo v barvi obleke — na risbi jih ne
bi bilo videti in otrok povedi o njih ne bi mogel preveriti.

### Desetka — tetris

Vaja seštevanja, le da otrok namesto računa v zvezku lovi padajoče kocke. Kocke s
številkami **1–9** padajo v mrežo 6 stolpcev; ko se tiste, ki stojijo **druga na
drugi**, seštejejo v **ciljno število**, vse izginejo. Pade **20 kock** — če jih otrok
pospravi vse, je plošča na koncu prazna.

Stopnjo igra predlaga kar po razredu igralca, otrok pa jo lahko zamenja:

| Stopnja | Razred | Cilj | Koliko kock v nizu | Plošča |
|---|---|---|---|---|
| 🔟 Desetica | 2. | 10 | točno 2 | 6 × 7 |
| 🎯 Čez desetico | 3.–4. | 11–15 (izbereš) | 2 ali 3 | 6 × 8 |
| 🏔️ Do 20 | 4.–5. | 11–20 (izbereš) | poljubno mnogo | 6 × 9 |

Ciljno število otrok izbere sam — tako kot pri poštevanki izbere eno poštevanko — in
pred začetkom vidi kartice z vsemi razstavitvami tega cilja (`5 + 9`, `6 + 8`, `7 + 7`
za 14; pri višjih stopnjah tudi trojke, npr. `2 + 9 + 9` za 20). Višji cilj potrebuje
višji kupček, zato ima težja stopnja **višjo ploščo**; da stran ne zraste, se plošča
drži enake višine, manjšajo pa se kocke v njej.

Vsaka sestavljena vsota je vredna 10 točk (5 po namigu), **vsaka kocka nad dvema pa še
5 točk** — niz `8 + 7 + 4 + 1 = 20` torej prinese 20 točk. Niz treh zaporednih vsot
doda še običajni bonus.

Pred začetkom otrok izbere tudi hitrost padanja (🐢 Mirno / 🐇 Hitro / ⚡ Bliskovito);
vsaka pristala kocka igro malenkost pospeši.

Krmiljenje:

- **tipkovnica** — ⬅️ ➡️ premikata kocko, ⬇️ jo požene za eno vrstico niže,
  **preslednica** jo takoj spusti
- **miška ali tablica** — tap na stolpec kocko prestavi tja, ponoven tap v isti
  stolpec jo spusti; pod ploščo so še gumbi ◀ ⬇ ▶

Namig označi stolpce, v katerih bi padajoča kocka dopolnila cilj, in izpiše cel račun
(`9 + 3 + 2 = 14`). Igra se konča, ko kock zmanjka ali ko kupček zraste do vrha plošče;
če plošča ni prazna, zaključni zaslon ponovi, kako se cilj sestavi.

Dve podrobnosti, ki sta videti kot podrobnosti, pa nista:

- Vsaka številka ima svojo barvo, a pari **nimajo enake barve** — sicer bi otrok
  ujemal barve namesto seštevanja.
- Kocke padajo ena po ena, zato je pristala kocka v svojem stolpcu vedno najvišja in
  niz se lahko začne le pri njej. Verig (en niz sproži naslednjega) tu ni, ker nad
  pospravljenim nizom ni ničesar, kar bi se posedlo.

Da se kupček ne kopiči brez možnosti, igra pogosto ne izbere povsem naključne kocke,
ampak tako, ki nekje na plošči dopolni cilj. Pri višjih ciljih je takih priložnosti
manj, zato se to zgodi pogosteje (0,5 → 0,8).

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

Zaključni zaslon privzeto predpostavlja igro z vprašanji (»Pravilnih: 8 / 10«, največ
točk = `najvecTock(skupaj)`). Igra s **drugačnim točkovanjem** to popravi z dvema
neobveznima možnostma — brez njiju ostane vse po starem:

- `oznakaPravilnih` — druga beseda namesto »Pravilnih« (»Desetka — tetris« šteje
  pospravljene kocke, ne odgovorov)
- `podnozje` — cela zadnja vrstica o največjem možnem številu točk

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
- `Ucinki.izgovori('seven')` — izgovorjava (za jezikovne igre); drugi argument pove
  jezik, npr. `Ucinki.izgovori('Guten Morgen', 'de-DE')`. Brez njega igra govori
  angleško. Glas se izbere posebej za vsak jezik — nemškega pozdrava ne sme
  prebrati angleški glas.
- `Ucinki.zvokVklopljen()`, `Ucinki.nastaviZvok(true/false)`, `Ucinki.preklopiZvok()` —
  stanje zvoka (gumb 🔊 spodaj desno; utišano stanje velja za piske in izgovorjavo)
