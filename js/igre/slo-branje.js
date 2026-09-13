/* slo-branje.js - Slovenščina: preberi besedilo in odgovori
 * Otrok prebere kratko zgodbo, nato pa o njej dopolnjuje povedi (vpiše besedo)
 * ali izbira med možnostmi. Besedilo ves čas ostane na zaslonu - odgovor je
 * vedno v njem, včasih naravnost zapisan, včasih ga je treba razbrati.
 */
(function (global) {
  'use strict';

  var O = global.Osnova;
  var ST_VPRASANJ = 8;

  /* Dve vrsti nalog:
       { poved: 'Alenka je šla v hribe s ___.', odgovor: 'Klemnom|Klemenom' }
         - otrok vpiše besedo na mesto ___; v `odgovor` naštejemo vse sprejemljive
           zapise, ločene s | (prvi je tisti, iz katerega igra naredi namig)
       { vprasanje: 'V obeh državah sta bila ...', moznosti: ['v istem letu', 'vsako leto v eni'] }
         - otrok izbere; PRVA možnost je pravilna, igra jih pred prikazom premeša

     Šumnikov ne zahtevamo: »rdece« velja enako kot »rdeče«, pravilen zapis
     otrok vidi v odzivu. */

  /* ---------- kratka besedila: ena poved ---------- */
  var KRATKA = [
    { besedilo: 'Alenka in Klemen sta se letos odpravila v hribe v Italijo, nato pa še v Bolgarijo.',
      naloge: [
        { poved: 'Alenka je šla v hribe s ___.', odgovor: 'Klemnom|Klemenom' },
        { poved: 'Najprej sta šla v ___.', odgovor: 'Italijo' },
        { vprasanje: 'V obeh državah sta bila ...',
          moznosti: ['v istem letu', 'vsakič v drugem letu'] }
      ] },

    { besedilo: 'Franci in Milena sta postala starša dvojčicama Izi in Lari.',
      naloge: [
        { poved: 'Franci in Milena sta dobila ___ hčerki.', odgovor: 'dve|2' },
        { poved: 'Ena od deklic je ___.', odgovor: 'Iza|Lara' },
        { vprasanje: 'Deklici sta se rodili ...',
          moznosti: ['isti dan', 'vsaka v svojem letu'] }
      ] },

    { besedilo: 'Anton se je v glasbeni šoli začel učiti kitaro.',
      naloge: [
        { poved: 'Anton se uči igrati ___.', odgovor: 'kitaro' },
        { poved: 'Uči se v ___ šoli.', odgovor: 'glasbeni' },
        { vprasanje: 'Kitaro igra ...',
          moznosti: ['šele kratek čas', 'že veliko let'] },
        { vprasanje: 'Koliko strun ima njegova kitara?',
          moznosti: ['tega besedilo ne pove', 'šest', 'štiri'] }
      ] },

    { besedilo: 'Pipi in Melkijad sta odpotovala, med potjo pa je Melkijad Pipiju razložil, kaj je astronavt.',
      naloge: [
        { poved: 'Razlagal je ___.', odgovor: 'Melkijad' },
        { poved: 'Poslušal je ___.', odgovor: 'Pipi' },
        { vprasanje: 'Kaj je Pipi izvedel?',
          moznosti: ['kaj je astronavt', 'kako se popravi kolo'] }
      ] },

    { besedilo: 'Maja je v soboto zjutraj spekla jabolčno pito za babico.',
      naloge: [
        { poved: 'Maja je spekla ___ pito.', odgovor: 'jabolčno' },
        { poved: 'Pito je spekla za ___.', odgovor: 'babico' },
        { vprasanje: 'Kdaj je pekla?',
          moznosti: ['v soboto zjutraj', 'v nedeljo zvečer'] },
        { vprasanje: 'Koliko jabolk je porabila?',
          moznosti: ['tega besedilo ne pove', 'tri', 'deset'] }
      ] },

    { besedilo: 'Lenart je domačo nalogo pozabil doma in jo je učiteljici prinesel šele naslednji dan.',
      naloge: [
        { poved: 'Nalogo je pozabil ___.', odgovor: 'doma' },
        { poved: 'Nalogo je prinesel ___.', odgovor: 'učiteljici' },
        { vprasanje: 'Zakaj naloge ni oddal pravočasno?',
          moznosti: ['ker jo je pozabil doma', 'ker je ni napisal'] }
      ] },

    { besedilo: 'Manca si je v knjižnici izposodila tri knjige o dinozavrih.',
      naloge: [
        { poved: 'Knjige si je izposodila v ___.', odgovor: 'knjižnici' },
        { poved: 'Izposodila si je ___ knjige.', odgovor: 'tri|3' },
        { vprasanje: 'O čem govorijo knjige?',
          moznosti: ['o dinozavrih', 'o vesoljskih ladjah'] }
      ] },

    { besedilo: 'Na šolskem izletu je Klemen izgubil dežnik, našel pa ga je hišnik.',
      naloge: [
        { poved: 'Klemen je izgubil ___.', odgovor: 'dežnik' },
        { poved: 'Dežnik je našel ___.', odgovor: 'hišnik' },
        { vprasanje: 'Kje se je to zgodilo?',
          moznosti: ['na šolskem izletu', 'doma v kopalnici'] }
      ] },

    { besedilo: 'Lenka je mlajši sestri Zali za rojstni dan podarila rdečo kolesarsko čelado.',
      naloge: [
        { poved: 'Zala je Lenkina ___ sestra.', odgovor: 'mlajša' },
        { poved: 'Za rojstni dan je dobila ___.', odgovor: 'čelado|kolesarsko čelado' },
        { vprasanje: 'Kakšne barve je čelada?',
          moznosti: ['rdeča', 'modra'] }
      ] },

    { besedilo: 'Nejc je v šolo prišel z novim nahrbtnikom, ker je stari razpadel.',
      naloge: [
        { poved: 'Nejc ima ___ nahrbtnik.', odgovor: 'nov' },
        { vprasanje: 'Zakaj ima nov nahrbtnik?',
          moznosti: ['ker je stari razpadel', 'ker je starega izgubil'] },
        { vprasanje: 'Kam je prišel z njim?',
          moznosti: ['v šolo', 'v trgovino'] }
      ] },

    { besedilo: 'Babica je v nedeljo skuhala govejo juho, ker je bilo zunaj mrzlo.',
      naloge: [
        { poved: 'Babica je skuhala ___ juho.', odgovor: 'govejo' },
        { poved: 'Juho je kuhala v ___.', odgovor: 'nedeljo' },
        { vprasanje: 'Zakaj je skuhala juho?',
          moznosti: ['ker je bilo zunaj mrzlo', 'ker je zmanjkalo kruha'] }
      ] },

    { besedilo: 'Tinkara je na tekmovanju v teku osvojila drugo mesto.',
      naloge: [
        { poved: 'Tinkara je tekmovala v ___.', odgovor: 'teku' },
        { poved: 'Osvojila je ___ mesto.', odgovor: 'drugo|2' },
        { vprasanje: 'Koliko tekmovalcev je bilo hitrejših od nje?',
          moznosti: ['eden', 'nobeden'] },
        { vprasanje: 'Koliko metrov je tekla?',
          moznosti: ['tega besedilo ne pove', 'šestdeset', 'tisoč'] }
      ] },

    { besedilo: 'Rok je mački Piki vsak večer nastavil skledico mleka pred vrata.',
      naloge: [
        { poved: 'Mački je ime ___.', odgovor: 'Pika' },
        { poved: 'V skledici je bilo ___.', odgovor: 'mleko' },
        { vprasanje: 'Kako pogosto ji je nastavljal mleko?',
          moznosti: ['vsak večer', 'enkrat na teden'] }
      ] },

    { besedilo: 'Ema je pozabila ključ, zato je pol ure čakala pred vrati, dokler ni prišel oče.',
      naloge: [
        { poved: 'Ema je pozabila ___.', odgovor: 'ključ' },
        { poved: 'Čakala je ___ ure.', odgovor: 'pol' },
        { vprasanje: 'Kdo ji je na koncu odprl?',
          moznosti: ['oče', 'sosed'] }
      ] },

    { besedilo: 'Miha je v soboto pomagal dedku pobirati jabolka v sadovnjaku.',
      naloge: [
        { poved: 'Miha je pomagal ___.', odgovor: 'dedku' },
        { poved: 'Pobirala sta ___.', odgovor: 'jabolka' },
        { vprasanje: 'Kje sta bila?',
          moznosti: ['v sadovnjaku', 'v gozdu'] }
      ] },

    { besedilo: 'Zoja je z zeleno barvo narisala velikega zmaja, ki bruha ogenj.',
      naloge: [
        { poved: 'Zoja je narisala ___.', odgovor: 'zmaja' },
        { poved: 'Risala je z ___ barvo.', odgovor: 'zeleno' },
        { vprasanje: 'Kaj zmaj počne?',
          moznosti: ['bruha ogenj', 'mirno spi'] }
      ] },

    { besedilo: 'Jaka je ob petkih po pouku hodil na nogomet, ob torkih pa na plavanje.',
      naloge: [
        { poved: 'Ob petkih je hodil na ___.', odgovor: 'nogomet' },
        { poved: 'Ob torkih je hodil na ___.', odgovor: 'plavanje' },
        { vprasanje: 'Koliko športov trenira?',
          moznosti: ['dva', 'enega'] }
      ] },

    { besedilo: 'Učiteljica je povedala, da bo test iz matematike v sredo.',
      naloge: [
        { poved: 'Test bo iz ___.', odgovor: 'matematike' },
        { poved: 'Test bo v ___.', odgovor: 'sredo' },
        { vprasanje: 'Kdo je to povedal?',
          moznosti: ['učiteljica', 'hišnik'] }
      ] },

    { besedilo: 'Ana je svojemu psu Bobiju vrgla žogico, on pa jo je prinesel nazaj.',
      naloge: [
        { poved: 'Psu je ime ___.', odgovor: 'Bobi' },
        { poved: 'Ana mu je vrgla ___.', odgovor: 'žogico' },
        { vprasanje: 'Kaj je pes naredil z žogico?',
          moznosti: ['prinesel jo je nazaj', 'zakopal jo je'] }
      ] },

    { besedilo: 'Vid je v snegu pred hišo naredil snežaka s korenčkom namesto nosu.',
      naloge: [
        { poved: 'Vid je naredil ___.', odgovor: 'snežaka' },
        { poved: 'Namesto nosu je uporabil ___.', odgovor: 'korenček' },
        { vprasanje: 'Kakšno je bilo takrat vreme?',
          moznosti: ['zapadel je sneg', 'bilo je vroče'] }
      ] },

    { besedilo: 'Nika je v šolski torbi našla pozabljeno banano, ki je bila že čisto črna.',
      naloge: [
        { poved: 'V torbi je našla ___.', odgovor: 'banano' },
        { vprasanje: 'Kakšna je bila banana?',
          moznosti: ['že čisto črna', 'sveža in rumena'] },
        { vprasanje: 'Kako dolgo je bila banana že v torbi?',
          moznosti: ['več dni', 'samo eno uro'] }
      ] },

    { besedilo: 'Tim je na morju prvič zaplaval brez rokavčkov.',
      naloge: [
        { poved: 'Tim je zaplaval brez ___.', odgovor: 'rokavčkov' },
        { vprasanje: 'Kolikokrat je brez rokavčkov plaval prej?',
          moznosti: ['nikoli', 'večkrat'] },
        { vprasanje: 'Kje se je to zgodilo?',
          moznosti: ['na morju', 'v telovadnici'] }
      ] },

    { besedilo: 'Sara je vsak dan po šoli zalivala rože na okenski polici.',
      naloge: [
        { poved: 'Sara je zalivala ___.', odgovor: 'rože' },
        { poved: 'Rože so bile na ___ polici.', odgovor: 'okenski' },
        { vprasanje: 'Kdaj jih je zalivala?',
          moznosti: ['vsak dan po šoli', 'enkrat na mesec'] }
      ] },

    { besedilo: 'Žan je zamudil avtobus, zato je moral v šolo peš.',
      naloge: [
        { poved: 'Žan je zamudil ___.', odgovor: 'avtobus' },
        { vprasanje: 'Kako je prišel v šolo?',
          moznosti: ['peš', 's kolesom'] },
        { vprasanje: 'Zakaj je šel peš?',
          moznosti: ['ker je zamudil avtobus', 'ker je bilo lepo vreme'] }
      ] },

    { besedilo: 'Mia je ob morju nabrala pet školjk in jih shranila v kozarec.',
      naloge: [
        { poved: 'Nabrala je ___ školjk.', odgovor: 'pet|5' },
        { poved: 'Školjke je shranila v ___.', odgovor: 'kozarec' },
        { vprasanje: 'Kje je nabirala školjke?',
          moznosti: ['ob morju', 'v gozdu'] }
      ] },

    { besedilo: 'Filip je za rojstni dan povabil sedem prijateljev, prišlo pa jih je le pet.',
      naloge: [
        { poved: 'Povabil je ___ prijateljev.', odgovor: 'sedem|7' },
        { poved: 'Prišlo jih je ___.', odgovor: 'pet|5' },
        { vprasanje: 'Koliko jih ni prišlo?',
          moznosti: ['dva', 'pet'] }
      ] },

    { besedilo: 'Neža je risala s flomastri, dokler ji ni zmanjkalo rdeče barve.',
      naloge: [
        { poved: 'Neža je risala s ___.', odgovor: 'flomastri' },
        { vprasanje: 'Katere barve ji je zmanjkalo?',
          moznosti: ['rdeče', 'modre'] },
        { vprasanje: 'Zakaj je nehala risati?',
          moznosti: ['ker ji je zmanjkalo barve', 'ker je bila risba končana'] }
      ] },

    { besedilo: 'Bine je v gozdu našel ježa, ki se je pred njim zvil v klobčič.',
      naloge: [
        { poved: 'Bine je našel ___.', odgovor: 'ježa' },
        { poved: 'Našel ga je v ___.', odgovor: 'gozdu' },
        { vprasanje: 'Kaj je jež naredil?',
          moznosti: ['zvil se je v klobčič', 'splezal je na drevo'] }
      ] },

    { besedilo: 'Urban je pomagal materi zložiti perilo, potem pa je šel na igrišče.',
      naloge: [
        { poved: 'Urban je pomagal ___.', odgovor: 'materi|mami' },
        { poved: 'Zložila sta ___.', odgovor: 'perilo' },
        { vprasanje: 'Kaj je naredil najprej?',
          moznosti: ['zložil je perilo', 'šel je na igrišče'] }
      ] },

    { besedilo: 'Lana je na dopustu v Avstriji prvič videla pravo kravo.',
      naloge: [
        { poved: 'Lana je bila na dopustu v ___.', odgovor: 'Avstriji' },
        { poved: 'Prvič je videla pravo ___.', odgovor: 'kravo' },
        { vprasanje: 'Ali je kdaj prej videla pravo kravo?',
          moznosti: ['ne, to je bilo prvič', 'da, velikokrat'] }
      ] },

    { besedilo: 'Peter je v šolski jedilnici razlil sok po mizi in ga sam pobrisal.',
      naloge: [
        { poved: 'Peter je razlil ___.', odgovor: 'sok' },
        { vprasanje: 'Kdo je pobrisal mizo?',
          moznosti: ['Peter sam', 'kuharica'] },
        { vprasanje: 'Kje se je to zgodilo?',
          moznosti: ['v šolski jedilnici', 'na igrišču'] }
      ] },

    { besedilo: 'Iza je bratu Maticu posodila svinčnik, ker je njegov počil.',
      naloge: [
        { poved: 'Iza je posodila ___.', odgovor: 'svinčnik' },
        { poved: 'Svinčnik je dobil ___.', odgovor: 'Matic' },
        { vprasanje: 'Zakaj mu ga je posodila?',
          moznosti: ['ker je njegov počil', 'ker ga je pozabil doma'] }
      ] },

    { besedilo: 'Nejc in Vid sta v parku igrala šah, dokler ni začelo deževati.',
      naloge: [
        { poved: 'Igrala sta ___.', odgovor: 'šah' },
        { poved: 'Igrala sta v ___.', odgovor: 'parku' },
        { vprasanje: 'Zakaj sta nehala?',
          moznosti: ['ker je začelo deževati', 'ker sta bila lačna'] }
      ] },

    { besedilo: 'Katja je v torek izgubila prvi mlečni zob.',
      naloge: [
        { poved: 'Katja je izgubila ___.', odgovor: 'zob' },
        { poved: 'To se je zgodilo v ___.', odgovor: 'torek' },
        { vprasanje: 'Koliko zob je izgubila pred tem?',
          moznosti: ['nobenega', 'veliko'] }
      ] },

    { besedilo: 'Blaž je na kmetiji vsako jutro pobral jajca iz kurnika.',
      naloge: [
        { poved: 'Blaž je pobiral ___.', odgovor: 'jajca' },
        { poved: 'Jajca je pobiral iz ___.', odgovor: 'kurnika' },
        { vprasanje: 'Kako pogosto je to počel?',
          moznosti: ['vsako jutro', 'enkrat na leto'] },
        { vprasanje: 'Koliko kokoši je bilo na kmetiji?',
          moznosti: ['tega besedilo ne pove', 'dvanajst', 'dve'] }
      ] },

    { besedilo: 'Špela je za materinski dan narisala šopek tulipanov.',
      naloge: [
        { poved: 'Narisala je šopek ___.', odgovor: 'tulipanov' },
        { vprasanje: 'Za kateri praznik je nastala risba?',
          moznosti: ['za materinski dan', 'za novo leto'] },
        { vprasanje: 'Kako je nastalo darilo?',
          moznosti: ['sama ga je naredila', 'kupila ga je v trgovini'] }
      ] },

    { besedilo: 'Val je na kolesu prvič zapeljal brez pomožnih koles.',
      naloge: [
        { poved: 'Val je zapeljal brez ___ koles.', odgovor: 'pomožnih' },
        { vprasanje: 'Kolikokrat je to naredil doslej?',
          moznosti: ['prvič', 'že stokrat'] },
        { vprasanje: 'S čim se je vozil?',
          moznosti: ['s kolesom', 's skirojem'] }
      ] },

    { besedilo: 'Nina je psičku Piki spletla pisano rutko iz volne.',
      naloge: [
        { poved: 'Rutka je bila iz ___.', odgovor: 'volne' },
        { poved: 'Psičku je ime ___.', odgovor: 'Pika' },
        { vprasanje: 'Kdo je naredil rutko?',
          moznosti: ['Nina', 'babica'] }
      ] },

    { besedilo: 'Aljaž je v šoli pozabil copate, zato je vso uro hodil v nogavicah.',
      naloge: [
        { poved: 'Aljaž je pozabil ___.', odgovor: 'copate' },
        { vprasanje: 'V čem je hodil po šoli?',
          moznosti: ['v nogavicah', 'v škornjih'] },
        { vprasanje: 'Kako dolgo?',
          moznosti: ['vso uro', 'pet minut'] }
      ] },

    { besedilo: 'Taja je v soboto z očetom pekla palačinke z marmelado.',
      naloge: [
        { poved: 'Pekla sta ___.', odgovor: 'palačinke' },
        { poved: 'V palačinkah je bila ___.', odgovor: 'marmelada' },
        { vprasanje: 'S kom je pekla?',
          moznosti: ['z očetom', 'z bratom'] }
      ] },

    { besedilo: 'Gal je na šolskem nastopu igral medveda in imel kosmat kostum.',
      naloge: [
        { poved: 'Gal je igral ___.', odgovor: 'medveda' },
        { vprasanje: 'Kakšen je bil njegov kostum?',
          moznosti: ['kosmat', 'svilnat'] },
        { vprasanje: 'Kje je nastopil?',
          moznosti: ['v šoli', 'v cirkusu'] }
      ] },

    { besedilo: 'Ajda je pozabila plavalno kapo, zato ji jo je posodila učiteljica.',
      naloge: [
        { poved: 'Ajda je pozabila plavalno ___.', odgovor: 'kapo' },
        { poved: 'Kapo ji je posodila ___.', odgovor: 'učiteljica' },
        { vprasanje: 'Kam je šla Ajda?',
          moznosti: ['na plavanje', 'na smučanje'] }
      ] },

    { besedilo: 'Tine je iz kock zgradil stolp, ki se je pri enaindvajseti kocki podrl.',
      naloge: [
        { poved: 'Tine je gradil iz ___.', odgovor: 'kock' },
        { vprasanje: 'Kaj se je zgodilo s stolpom?',
          moznosti: ['podrl se je', 'ostal je cel'] },
        { vprasanje: 'Koliko kock je stolp še zdržal?',
          moznosti: ['dvajset', 'enaindvajset'] }
      ] },

    { besedilo: 'Zala je v šolski pevski zbor hodila ob sredah in četrtkih.',
      naloge: [
        { poved: 'Zala je hodila v šolski pevski ___.', odgovor: 'zbor' },
        { vprasanje: 'Kolikokrat na teden je hodila?',
          moznosti: ['dvakrat', 'enkrat'] },
        { vprasanje: 'Kateri dan ni imela zbora?',
          moznosti: ['v petek', 'v sredo'] }
      ] },

    { besedilo: 'Oskar je na morju pojedel tri kepice sladoleda: čokoladno, jagodno in vaniljevo.',
      naloge: [
        { poved: 'Pojedel je ___ kepice.', odgovor: 'tri|3' },
        { poved: 'Ena od kepic je bila ___.', odgovor: 'čokoladna|jagodna|vaniljeva' },
        { vprasanje: 'Katere kepice ni jedel?',
          moznosti: ['lešnikove', 'jagodne'] }
      ] },

    { besedilo: 'Larisa je med počitnicami prebrala celo knjigo o piratih.',
      naloge: [
        { poved: 'Knjiga je bila o ___.', odgovor: 'piratih' },
        { vprasanje: 'Koliko knjige je prebrala?',
          moznosti: ['celo knjigo', 'samo prvo stran'] },
        { vprasanje: 'Kdaj je brala?',
          moznosti: ['med počitnicami', 'med poukom'] }
      ] },

    { besedilo: 'Matevž je v šoli dobil pohvalo, ker je pomagal sošolcu s poškodovano nogo.',
      naloge: [
        { poved: 'Matevž je dobil ___.', odgovor: 'pohvalo' },
        { vprasanje: 'Zakaj je dobil pohvalo?',
          moznosti: ['ker je pomagal sošolcu', 'ker je najhitreje tekel'] },
        { vprasanje: 'Kaj je bilo s sošolcem?',
          moznosti: ['imel je poškodovano nogo', 'pozabil je torbo'] }
      ] },

    { besedilo: 'Ela je na igrišču izgubila rokavico, našla pa jo je šele čez teden dni.',
      naloge: [
        { poved: 'Ela je izgubila ___.', odgovor: 'rokavico' },
        { poved: 'Izgubila jo je na ___.', odgovor: 'igrišču' },
        { vprasanje: 'Kdaj jo je našla?',
          moznosti: ['čez teden dni', 'še isti dan'] }
      ] },

    { besedilo: 'Bor je za domačo žival dobil želvo, ki se je premikala zelo počasi.',
      naloge: [
        { poved: 'Bor je dobil ___.', odgovor: 'želvo' },
        { vprasanje: 'Kako se je žival premikala?',
          moznosti: ['zelo počasi', 'zelo hitro'] },
        { vprasanje: 'Kaj mu je ta žival?',
          moznosti: ['domača žival', 'divja žival iz gozda'] }
      ] },

    { besedilo: 'Hana je v petek napisala pismo prijateljici v Nemčijo.',
      naloge: [
        { poved: 'Hana je napisala ___.', odgovor: 'pismo' },
        { poved: 'Pismo je poslala v ___.', odgovor: 'Nemčijo' },
        { vprasanje: 'Komu je pisala?',
          moznosti: ['prijateljici', 'učitelju'] }
      ] },

    { besedilo: 'Jure je v vrtcu pozabil plišastega medvedka in ves večer jokal.',
      naloge: [
        { poved: 'Jure je pozabil ___ medvedka.', odgovor: 'plišastega' },
        { poved: 'Pozabil ga je v ___.', odgovor: 'vrtcu' },
        { vprasanje: 'Kako se je počutil?',
          moznosti: ['žalosten', 'vesel'] }
      ] },

    { besedilo: 'Polona je za malico vedno prinesla jabolko, sošolka Ula pa hruško.',
      naloge: [
        { poved: 'Polona je prinesla ___.', odgovor: 'jabolko' },
        { poved: 'Ula je prinesla ___.', odgovor: 'hruško' },
        { vprasanje: 'Ali sta za malico jedli isto sadje?',
          moznosti: ['ne, vsaka svoje', 'da, obe isto'] }
      ] },

    { besedilo: 'Domen je v šolskem atriju posadil hrastov želod in ga zalil z vodo iz steklenice.',
      naloge: [
        { poved: 'Domen je posadil ___.', odgovor: 'želod|hrastov želod' },
        { poved: 'Zalil ga je z ___.', odgovor: 'vodo' },
        { vprasanje: 'Kaj bo iz želoda zraslo?',
          moznosti: ['hrast', 'smreka'] }
      ] },

    { besedilo: 'Eva je v ponedeljek pozabila telovadno opremo, zato je uro športa samo gledala.',
      naloge: [
        { poved: 'Eva je pozabila telovadno ___.', odgovor: 'opremo' },
        { vprasanje: 'Kaj je delala med uro športa?',
          moznosti: ['gledala je', 'igrala je odbojko'] },
        { vprasanje: 'Kateri dan je bilo to?',
          moznosti: ['v ponedeljek', 'v četrtek'] }
      ] },

    { besedilo: 'Luka je na semnju zavrtel kolo sreče in zadel plišastega zajca.',
      naloge: [
        { poved: 'Luka je zadel plišastega ___.', odgovor: 'zajca' },
        { poved: 'Zavrtel je kolo ___.', odgovor: 'sreče' },
        { vprasanje: 'Kje se je to zgodilo?',
          moznosti: ['na semnju', 'v šoli'] }
      ] },

    { besedilo: 'Pia je na vrtu našla štiriperesno deteljico in jo stisnila med strani slovarja.',
      naloge: [
        { poved: 'Pia je našla ___ deteljico.', odgovor: 'štiriperesno' },
        { poved: 'Deteljico je stisnila med strani ___.', odgovor: 'slovarja' },
        { vprasanje: 'Kaj naj bi štiriperesna deteljica prinesla?',
          moznosti: ['srečo', 'dež'] }
      ] }
  ];

  /* ---------- daljša besedila: dve ali tri povedi ---------- */
  var DALJSA = [
    { besedilo: 'Alenka in Klemen sta se letos poleti odpravila v hribe v Italijo. Avgusta sta se ' +
        'z avtom odpeljala še v Bolgarijo, kjer sta ostala deset dni.',
      naloge: [
        { poved: 'V Bolgarijo sta se odpeljala z ___.', odgovor: 'avtom|avtomobilom' },
        { poved: 'V Bolgariji sta ostala ___ dni.', odgovor: 'deset|10' },
        { vprasanje: 'V Italiji sta bila ...',
          moznosti: ['pred potjo v Bolgarijo', 'po poti iz Bolgarije'] }
      ] },

    { besedilo: 'Franci in Milena sta postala starša dvojčicama Izi in Lari. Iza se je rodila dve ' +
        'minuti prej kot Lara, zato jo Franci v šali kliče velika sestra.',
      naloge: [
        { poved: 'Prva se je rodila ___.', odgovor: 'Iza' },
        { poved: 'Rodila se je ___ minuti prej.', odgovor: 'dve|2' },
        { vprasanje: 'Zakaj Franci Izo kliče velika sestra?',
          moznosti: ['ker se je rodila prva', 'ker je višja od Lare'] }
      ] },

    { besedilo: 'Anton se je v glasbeni šoli začel učiti kitaro. Doma vadi vsak dan po pol ure, ' +
        'najraje pa igra pesmi, ki jih pozna z radia.',
      naloge: [
        { poved: 'Anton vadi po ___ ure.', odgovor: 'pol' },
        { poved: 'Najraje igra pesmi z ___.', odgovor: 'radia' },
        { vprasanje: 'Kako pogosto vadi?',
          moznosti: ['vsak dan', 'samo ob nedeljah'] },
        { vprasanje: 'Kdo je njegov učitelj kitare?',
          moznosti: ['tega besedilo ne pove', 'oče', 'sosed'] }
      ] },

    { besedilo: 'Pipi in Melkijad sta odpotovala z vlakom. Med potjo je Melkijad Pipiju razložil, ' +
        'kaj je astronavt, Pipi pa je sklenil, da bo nekoč tudi sam poletel v vesolje.',
      naloge: [
        { poved: 'Potovala sta z ___.', odgovor: 'vlakom' },
        { poved: 'Pipi želi poleteti v ___.', odgovor: 'vesolje' },
        { vprasanje: 'Kdo je o astronavtih vedel več?',
          moznosti: ['Melkijad', 'Pipi'] }
      ] },

    { besedilo: 'Maja je v soboto spekla jabolčno pito za babico. Ko jo je nesla čez dvorišče, je ' +
        'začelo močno deževati, zato je pito pokrila s svojim dežnikom.',
      naloge: [
        { poved: 'Pito je nesla ___.', odgovor: 'babici' },
        { poved: 'Pito je pokrila z ___.', odgovor: 'dežnikom' },
        { vprasanje: 'Koga je Maja varovala pred dežjem?',
          moznosti: ['pito', 'sebe'] }
      ] },

    { besedilo: 'Lenart je pisal test iz matematike. Doma je vadil cel teden, zato je imel vse ' +
        'račune pravilne in učiteljica ga je pohvalila.',
      naloge: [
        { poved: 'Lenart je pisal test iz ___.', odgovor: 'matematike' },
        { poved: 'Doma je vadil cel ___.', odgovor: 'teden' },
        { vprasanje: 'Zakaj mu je test tako dobro uspel?',
          moznosti: ['ker je doma vadil', 'ker je imel srečo'] }
      ] },

    { besedilo: 'Manca si je v knjižnici izposodila tri knjige o dinozavrih. Dve je prebrala že v ' +
        'prvem tednu, tretjo pa je pustila za počitnice.',
      naloge: [
        { poved: 'Prebrala je ___ knjigi.', odgovor: 'dve|2' },
        { poved: 'Tretjo je pustila za ___.', odgovor: 'počitnice' },
        { vprasanje: 'Koliko knjig ji je ostalo za branje?',
          moznosti: ['ena', 'tri'] }
      ] },

    { besedilo: 'Klemen je na šolskem izletu izgubil dežnik. Ko so se vračali, ga je na klopi ' +
        'opazil hišnik in mu ga je prinesel nazaj.',
      naloge: [
        { poved: 'Dežnik je opazil ___.', odgovor: 'hišnik' },
        { poved: 'Dežnik je ležal na ___.', odgovor: 'klopi' },
        { vprasanje: 'Ali je Klemen dobil dežnik nazaj?',
          moznosti: ['da', 'ne'] }
      ] },

    { besedilo: 'Zala je za rojstni dan dobila kolesarsko čelado. Naslednji dan se je z njo prvič ' +
        'peljala do jezera, kjer sta z Lenko jedli sladoled.',
      naloge: [
        { poved: 'Peljala se je do ___.', odgovor: 'jezera' },
        { poved: 'Pri jezeru sta jedli ___.', odgovor: 'sladoled' },
        { vprasanje: 'Kdaj se je peljala do jezera?',
          moznosti: ['dan po rojstnem dnevu', 'na rojstni dan'] }
      ] },

    { besedilo: 'Nejc je prišel v šolo z novim nahrbtnikom. Stari mu je razpadel med vožnjo s ' +
        'kolesom, ko so se knjige raztresle po cesti.',
      naloge: [
        { poved: 'Stari nahrbtnik je razpadel med vožnjo s ___.', odgovor: 'kolesom' },
        { poved: 'Po cesti so se raztresle ___.', odgovor: 'knjige' },
        { vprasanje: 'Zakaj ima nov nahrbtnik?',
          moznosti: ['ker se je stari strgal', 'ker je bil stari premajhen'] }
      ] },

    { besedilo: 'Babica je v nedeljo skuhala govejo juho. Zunaj je snežilo in bilo je zelo mrzlo, ' +
        'zato so vsi dobili še drugi krožnik.',
      naloge: [
        { poved: 'Babica je skuhala ___ juho.', odgovor: 'govejo' },
        { vprasanje: 'Kakšno je bilo vreme?',
          moznosti: ['snežilo je', 'sijalo je sonce'] },
        { vprasanje: 'Koliko krožnikov juhe so pojedli?',
          moznosti: ['dva', 'enega'] }
      ] },

    { besedilo: 'Tinkara je tekmovala v teku na 60 metrov. Osvojila je drugo mesto, prehitela jo ' +
        'je le Ema, ki trenira že tri leta.',
      naloge: [
        { poved: 'Tinkara je tekla ___ metrov.', odgovor: '60|šestdeset' },
        { poved: 'Prehitela jo je ___.', odgovor: 'Ema' },
        { vprasanje: 'Kdo je zmagal?',
          moznosti: ['Ema', 'Tinkara'] }
      ] },

    { besedilo: 'Rok je mački Piki vsak večer nastavil skledico mleka. Nekega jutra je pred vrati ' +
        'našel še tri majhne mucke, ki so mijavkale.',
      naloge: [
        { poved: 'Mački je ime ___.', odgovor: 'Pika' },
        { poved: 'Našel je ___ mucke.', odgovor: 'tri|3' },
        { vprasanje: 'Kdaj je našel mucke?',
          moznosti: ['zjutraj', 'zvečer'] },
        { vprasanje: 'Kdo je mati muckov?',
          moznosti: ['tega besedilo ne pove', 'Pika', 'soseda'] }
      ] },

    { besedilo: 'Ema je ključ pozabila doma. Pred vrati je čakala pol ure, dokler ni prišel oče, ' +
        'ki ji je odklenil in skuhal čaj.',
      naloge: [
        { poved: 'Ema je čakala ___ ure.', odgovor: 'pol' },
        { poved: 'Oče ji je skuhal ___.', odgovor: 'čaj' },
        { vprasanje: 'Kaj je Ema pozabila?',
          moznosti: ['ključ', 'telefon'] }
      ] },

    { besedilo: 'Miha je z dedkom pobiral jabolka v sadovnjaku. Nabrala sta dva zaboja: enega sta ' +
        'odnesla domov, drugega pa dala sosedom.',
      naloge: [
        { poved: 'Nabrala sta ___ zaboja.', odgovor: 'dva|2' },
        { poved: 'En zaboj sta dala ___.', odgovor: 'sosedom' },
        { vprasanje: 'Koliko zabojev je ostalo doma?',
          moznosti: ['eden', 'oba'] }
      ] },

    { besedilo: 'Zoja je narisala velikega zelenega zmaja, ki bruha ogenj. Risbo je obesila na ' +
        'hladilnik, mama pa jo je fotografirala in sliko poslala babici.',
      naloge: [
        { poved: 'Risbo je obesila na ___.', odgovor: 'hladilnik' },
        { poved: 'Mama je sliko poslala ___.', odgovor: 'babici' },
        { vprasanje: 'Kdo je narisal zmaja?',
          moznosti: ['Zoja', 'mama'] }
      ] },

    { besedilo: 'Jaka je ob petkih hodil na nogomet, ob torkih pa na plavanje. Ta teden je nogomet ' +
        'odpadel, ker je bilo igrišče poplavljeno.',
      naloge: [
        { poved: 'Ob torkih hodi na ___.', odgovor: 'plavanje' },
        { vprasanje: 'Zakaj je nogomet odpadel?',
          moznosti: ['ker je bilo igrišče poplavljeno', 'ker je bil trener bolan'] },
        { vprasanje: 'Kolikokrat je ta teden treniral?',
          moznosti: ['enkrat', 'dvakrat'] }
      ] },

    { besedilo: 'Učiteljica je povedala, da bo test iz matematike v sredo. Nejc si je datum zapisal ' +
        'v beležko, Lenart pa si ga ni, zato je test skoraj pozabil.',
      naloge: [
        { poved: 'Test bo v ___.', odgovor: 'sredo' },
        { poved: 'Datum si je v beležko zapisal ___.', odgovor: 'Nejc' },
        { vprasanje: 'Kdo je test skoraj pozabil?',
          moznosti: ['Lenart', 'Nejc'] }
      ] },

    { besedilo: 'Ana je psu Bobiju vrgla žogico čez travnik. Bobi je stekel za njo, a je namesto ' +
        'žogice prinesel star čevelj.',
      naloge: [
        { poved: 'Bobi je prinesel star ___.', odgovor: 'čevelj' },
        { poved: 'Ana mu je vrgla ___.', odgovor: 'žogico' },
        { vprasanje: 'Ali je Bobi prinesel pravo stvar?',
          moznosti: ['ne', 'da'] }
      ] },

    { besedilo: 'Vid je naredil snežaka s korenčkom namesto nosu. Popoldne je posijalo sonce in ' +
        'snežak se je do večera stopil, na travi je ostal le korenček.',
      naloge: [
        { poved: 'Namesto nosu je imel ___.', odgovor: 'korenček' },
        { vprasanje: 'Kaj se je zgodilo s snežakom?',
          moznosti: ['stopil se je', 'nekdo ga je podrl'] },
        { vprasanje: 'Zakaj se je stopil?',
          moznosti: ['ker je posijalo sonce', 'ker je začelo deževati'] }
      ] },

    { besedilo: 'Nika je v torbi našla pozabljeno banano. Bila je že čisto črna in je grdo dišala, ' +
        'zato jo je vrgla v smeti in torbo obrisala.',
      naloge: [
        { poved: 'Banano je vrgla v ___.', odgovor: 'smeti' },
        { vprasanje: 'Kakšna je bila banana?',
          moznosti: ['črna in smrdljiva', 'sveža in rumena'] },
        { vprasanje: 'Kaj je naredila s torbo?',
          moznosti: ['obrisala jo je', 'vrgla jo je stran'] }
      ] },

    { besedilo: 'Tim je na morju prvič zaplaval brez rokavčkov. Oče je stal poleg njega v vodi, da ' +
        'bi ga ujel, a ga Tim ni potreboval.',
      naloge: [
        { poved: 'Tim je plaval brez ___.', odgovor: 'rokavčkov' },
        { poved: 'Poleg njega je v vodi stal ___.', odgovor: 'oče' },
        { vprasanje: 'Ali je moral oče pomagati?',
          moznosti: ['ne', 'da'] }
      ] },

    { besedilo: 'Sara je vsak dan zalivala rože na polici. Ko je odšla na počitnice, je pozabila ' +
        'prositi soseda, zato so rože ob njeni vrnitvi visele povešene.',
      naloge: [
        { poved: 'Sara je zalivala ___.', odgovor: 'rože' },
        { poved: 'Prositi bi morala ___.', odgovor: 'soseda' },
        { vprasanje: 'Kaj se je zgodilo z rožami?',
          moznosti: ['ovenele so', 'lepo so zacvetele'] }
      ] },

    { besedilo: 'Žan je zamudil avtobus. Do šole je tekel dvajset minut in prišel ravno takrat, ko ' +
        'je zazvonil šolski zvonec.',
      naloge: [
        { poved: 'Tekel je ___ minut.', odgovor: 'dvajset|20' },
        { vprasanje: 'Ali je zamudil pouk?',
          moznosti: ['ne, prišel je ravno pravi čas', 'da, zamudil je celo uro'] },
        { vprasanje: 'Zakaj je tekel?',
          moznosti: ['ker je zamudil avtobus', 'ker je treniral tek'] }
      ] },

    { besedilo: 'Mia je ob morju nabrala pet školjk. Doma jih je oprala, tri je podarila sestrični, ' +
        'dve pa je postavila na polico.',
      naloge: [
        { poved: 'Nabrala je ___ školjk.', odgovor: 'pet|5' },
        { poved: 'Sestrični je dala ___ školjke.', odgovor: 'tri|3' },
        { vprasanje: 'Koliko školjk je obdržala zase?',
          moznosti: ['dve', 'pet'] }
      ] },

    { besedilo: 'Filip je na rojstni dan povabil sedem prijateljev. Dva sta zbolela, eden pa je bil ' +
        'na počitnicah, zato so torto rezali v manjši družbi.',
      naloge: [
        { poved: 'Povabil je ___ prijateljev.', odgovor: 'sedem|7' },
        { vprasanje: 'Koliko prijateljev je prišlo?',
          moznosti: ['štirje', 'sedem'] },
        { vprasanje: 'Zakaj dva nista prišla?',
          moznosti: ['ker sta zbolela', 'ker sta bila na počitnicah'] },
        { vprasanje: 'Kakšno torto so rezali?',
          moznosti: ['tega besedilo ne pove', 'čokoladno', 'jagodno'] }
      ] },

    { besedilo: 'Neža je risala s flomastri. Ko ji je zmanjkalo rdeče barve, si je flomaster ' +
        'izposodila od sošolke in risbo dokončala.',
      naloge: [
        { poved: 'Zmanjkalo ji je ___ barve.', odgovor: 'rdeče' },
        { poved: 'Flomaster si je izposodila od ___.', odgovor: 'sošolke' },
        { vprasanje: 'Ali je risbo dokončala?',
          moznosti: ['da', 'ne'] }
      ] },

    { besedilo: 'Bine je v gozdu našel ježa. Ko se ga je dotaknil, se je jež zvil v klobčič in ' +
        'ostal pri miru, dokler Bine ni odšel naprej.',
      naloge: [
        { poved: 'Bine je našel ___.', odgovor: 'ježa' },
        { vprasanje: 'Zakaj se je jež zvil v klobčič?',
          moznosti: ['ker se ga je Bine dotaknil', 'ker je bil lačen'] },
        { vprasanje: 'Kdaj se je jež spet razvil?',
          moznosti: ['ko je Bine odšel', 'takoj'] }
      ] },

    { besedilo: 'Urban je pomagal materi zložiti perilo. Ko sta končala, mu je dovolila na igrišče, ' +
        'kjer je do večera igral košarko.',
      naloge: [
        { poved: 'Zložila sta ___.', odgovor: 'perilo' },
        { poved: 'Na igrišču je igral ___.', odgovor: 'košarko' },
        { vprasanje: 'Kaj je moral narediti, preden je šel ven?',
          moznosti: ['zložiti perilo', 'skuhati večerjo'] }
      ] },

    { besedilo: 'Lana je bila na dopustu v Avstriji. Tam je prvič videla pravo kravo in se je ' +
        'najprej ustrašila njenega zvonca.',
      naloge: [
        { poved: 'Lana je bila v ___.', odgovor: 'Avstriji' },
        { poved: 'Ustrašila se je kravjega ___.', odgovor: 'zvonca' },
        { vprasanje: 'Kako se je počutila, ko je zagledala kravo?',
          moznosti: ['najprej se je ustrašila', 'takoj jo je pobožala'] }
      ] },

    { besedilo: 'Peter je v jedilnici razlil sok. Kuharica mu je dala krpo, on pa je mizo pobrisal ' +
        'sam in se opravičil sošolcem.',
      naloge: [
        { poved: 'Peter je razlil ___.', odgovor: 'sok' },
        { poved: 'Krpo mu je dala ___.', odgovor: 'kuharica' },
        { vprasanje: 'Kdo je pobrisal mizo?',
          moznosti: ['Peter', 'kuharica'] }
      ] },

    { besedilo: 'Iza je bratu Maticu posodila svinčnik. Matic ga je vrnil čez teden dni, a je bil ' +
        'svinčnik že čisto majhen, zato mu je Iza rekla, naj si kupi svojega.',
      naloge: [
        { poved: 'Svinčnik je vrnil čez ___ dni.', odgovor: 'teden' },
        { poved: 'Svinčnik je bil takrat že čisto ___.', odgovor: 'majhen' },
        { vprasanje: 'Kaj mu je Iza svetovala?',
          moznosti: ['naj si kupi svojega', 'naj ga kar obdrži'] }
      ] },

    { besedilo: 'Nejc in Vid sta v parku igrala šah. Ko je začelo deževati, sta figure pospravila v ' +
        'škatlo in igro nadaljevala doma pri Vidu.',
      naloge: [
        { poved: 'Figure sta pospravila v ___.', odgovor: 'škatlo' },
        { poved: 'Igro sta nadaljevala doma pri ___.', odgovor: 'Vidu' },
        { vprasanje: 'Ali sta igro dokončala?',
          moznosti: ['da, doma', 'ne, kar prekinila sta jo'] }
      ] },

    { besedilo: 'Katja je izgubila prvi mlečni zob. Zvečer ga je položila pod blazino, zjutraj pa ' +
        'je namesto zoba našla kovanec.',
      naloge: [
        { poved: 'Zob je položila pod ___.', odgovor: 'blazino' },
        { poved: 'Zjutraj je našla ___.', odgovor: 'kovanec' },
        { vprasanje: 'Kdaj je našla kovanec?',
          moznosti: ['zjutraj', 'zvečer'] }
      ] },

    { besedilo: 'Blaž je na kmetiji vsako jutro pobral jajca. Nekega dne jih je bilo dvanajst, zato ' +
        'mu je teta rekla, da bo za zajtrk cvrtje.',
      naloge: [
        { poved: 'Nekega dne je bilo ___ jajc.', odgovor: 'dvanajst|12' },
        { poved: 'To mu je povedala ___.', odgovor: 'teta' },
        { vprasanje: 'Kaj bo za zajtrk?',
          moznosti: ['cvrtje iz jajc', 'palačinke'] }
      ] },

    { besedilo: 'Špela je za materinski dan narisala šopek tulipanov. Risbo je skrila pod posteljo ' +
        'in jo zjutraj položila mami na krožnik.',
      naloge: [
        { poved: 'Risbo je skrila pod ___.', odgovor: 'posteljo' },
        { poved: 'Zjutraj jo je položila na ___.', odgovor: 'krožnik' },
        { vprasanje: 'Zakaj je risbo skrila?',
          moznosti: ['da bi bilo presenečenje', 'ker ji ni bila všeč'] }
      ] },

    { besedilo: 'Val je prvič zapeljal brez pomožnih koles. Po desetih metrih je padel v travo, a ' +
        'je takoj vstal in poskusil znova.',
      naloge: [
        { poved: 'Padel je po ___ metrih.', odgovor: 'desetih|10' },
        { poved: 'Padel je v ___.', odgovor: 'travo' },
        { vprasanje: 'Kaj je naredil po padcu?',
          moznosti: ['poskusil je znova', 'nehal je voziti'] }
      ] },

    { besedilo: 'Nina je psičku Piki spletla rutko iz volne. Ko sta šla na sprehod, so sosedje ' +
        'spraševali, v kateri trgovini jo je kupila.',
      naloge: [
        { poved: 'Rutka je bila iz ___.', odgovor: 'volne' },
        { vprasanje: 'Ali je rutko kupila?',
          moznosti: ['ne, sama jo je spletla', 'da, kupila jo je'] },
        { vprasanje: 'Kaj so mislili sosedje?',
          moznosti: ['da je rutka kupljena', 'da je rutka strgana'] }
      ] },

    { besedilo: 'Aljaž je pozabil copate. Vso uro je hodil v nogavicah in ob koncu pouka je imel ' +
        'podplate čisto sive.',
      naloge: [
        { poved: 'Hodil je v ___.', odgovor: 'nogavicah' },
        { vprasanje: 'Kakšne so bile nogavice na koncu?',
          moznosti: ['umazane', 'čiste'] },
        { vprasanje: 'Kaj je pozabil?',
          moznosti: ['copate', 'torbo'] }
      ] },

    { besedilo: 'Taja je z očetom pekla palačinke. Prvo je zažgala, druge pa so bile tako dobre, da ' +
        'jih je pojedla pet.',
      naloge: [
        { poved: 'Zažgala je ___ palačinko.', odgovor: 'prvo' },
        { poved: 'Pojedla je ___ palačink.', odgovor: 'pet|5' },
        { vprasanje: 'Kako ji je šlo peka od palačinke do palačinke?',
          moznosti: ['vse bolje', 'vse slabše'] }
      ] },

    { besedilo: 'Gal je na šolskem nastopu igral medveda. Kostum je bil tako topel, da se je moral ' +
        'po nastopu preobleči v suho majico.',
      naloge: [
        { poved: 'Gal je igral ___.', odgovor: 'medveda' },
        { vprasanje: 'Zakaj se je moral preobleči?',
          moznosti: ['ker se je v kostumu spotil', 'ker je kostum strgal'] },
        { vprasanje: 'Kakšen je bil kostum?',
          moznosti: ['zelo topel', 'zelo tanek'] }
      ] },

    { besedilo: 'Ajda je pozabila plavalno kapo. Učiteljica ji je posodila rezervno, ki je bila ' +
        'rumena, zato jo je bilo v bazenu takoj videti.',
      naloge: [
        { poved: 'Kapa je bila ___.', odgovor: 'rumena' },
        { poved: 'Kapo ji je posodila ___.', odgovor: 'učiteljica' },
        { vprasanje: 'Zakaj je bilo Ajdo v bazenu dobro videti?',
          moznosti: ['ker je bila kapa rumena', 'ker je plavala najhitreje'] }
      ] },

    { besedilo: 'Tine je iz kock gradil stolp. Pri enaindvajseti kocki se je stolp podrl, zato je ' +
        'Tine začel znova in prišel do petindvajsete.',
      naloge: [
        { poved: 'Drugič je prišel do ___ kocke.', odgovor: 'petindvajsete|25' },
        { vprasanje: 'Kateri stolp je bil višji?',
          moznosti: ['drugi', 'prvi'] },
        { vprasanje: 'Kaj je naredil, ko se je stolp podrl?',
          moznosti: ['začel je znova', 'odnehal je'] }
      ] },

    { besedilo: 'Zala je hodila v šolski pevski zbor ob sredah in četrtkih. Pred nastopom so vadili ' +
        'tudi ob sobotah, takrat pa je pela z njimi tudi Lenka.',
      naloge: [
        { poved: 'Pred nastopom so vadili tudi ob ___.', odgovor: 'sobotah' },
        { poved: 'Ob sobotah je pela tudi ___.', odgovor: 'Lenka' },
        { vprasanje: 'Kolikokrat na teden so vadili pred nastopom?',
          moznosti: ['trikrat', 'dvakrat'] }
      ] },

    { besedilo: 'Oskar je na morju pojedel tri kepice sladoleda. Ko je hotel še četrto, mu je mama ' +
        'rekla, da bo drugače imel trebuh poln ledu.',
      naloge: [
        { poved: 'Pojedel je ___ kepice.', odgovor: 'tri|3' },
        { vprasanje: 'Ali je dobil četrto kepico?',
          moznosti: ['ne', 'da'] },
        { vprasanje: 'Kdo mu je to rekel?',
          moznosti: ['mama', 'prodajalec'] }
      ] },

    { besedilo: 'Matevž je sošolcu s poškodovano nogo vsak dan nosil torbo v razred. Ob koncu leta ' +
        'je za to dobil pohvalo, ki jo je obesil nad pisalno mizo.',
      naloge: [
        { poved: 'Sošolcu je nosil ___.', odgovor: 'torbo' },
        { poved: 'Pohvalo je obesil nad ___ mizo.', odgovor: 'pisalno' },
        { vprasanje: 'Kako dolgo mu je pomagal?',
          moznosti: ['vsak dan do konca leta', 'samo en dan'] }
      ] },

    { besedilo: 'Ela je na igrišču izgubila rokavico. Čez teden dni jo je našla na ograji, kamor jo ' +
        'je obesil nekdo, ki jo je pobral s tal.',
      naloge: [
        { poved: 'Rokavica je visela na ___.', odgovor: 'ograji' },
        { vprasanje: 'Kdo je rokavico obesil na ograjo?',
          moznosti: ['nekdo, ki jo je našel', 'Ela sama'] },
        { vprasanje: 'Čez koliko časa jo je našla?',
          moznosti: ['čez teden dni', 'čez eno uro'] }
      ] },

    { besedilo: 'Bor je dobil želvo. Prvi teden se je skrivala pod listjem, potem pa se ga je ' +
        'navadila in jedla solato kar Boru iz roke.',
      naloge: [
        { poved: 'Skrivala se je pod ___.', odgovor: 'listjem' },
        { poved: 'Jedla je ___.', odgovor: 'solato' },
        { vprasanje: 'Kako se je želva čez čas spremenila?',
          moznosti: ['navadila se je na Bora', 'postala je bolj plaha'] }
      ] },

    { besedilo: 'Hana je prijateljici v Nemčijo napisala pismo in mu priložila risbo svoje ulice. ' +
        'Odgovor je prišel čez tri tedne, v njem pa je bila fotografija nemškega mesta.',
      naloge: [
        { poved: 'Pismu je priložila ___.', odgovor: 'risbo' },
        { poved: 'Odgovor je prišel čez ___ tedne.', odgovor: 'tri|3' },
        { vprasanje: 'Kaj je bilo v odgovoru?',
          moznosti: ['fotografija', 'risba'] }
      ] },

    { besedilo: 'Jure je v vrtcu pozabil plišastega medvedka. Vzgojiteljica ga je našla pod mizo in ' +
        'ga naslednje jutro pričakala z njim pri vratih.',
      naloge: [
        { poved: 'Medvedek je bil pod ___.', odgovor: 'mizo' },
        { poved: 'Našla ga je ___.', odgovor: 'vzgojiteljica' },
        { vprasanje: 'Kdaj ga je Jure dobil nazaj?',
          moznosti: ['naslednje jutro', 'še isti večer'] }
      ] },

    { besedilo: 'Polona je za malico vedno prinesla jabolko, sošolka Ula pa hruško. Nekega dne sta ' +
        'sadje zamenjali in odkrili, da je tudi drugo dobro.',
      naloge: [
        { poved: 'Polona je tisti dan jedla ___.', odgovor: 'hruško' },
        { poved: 'Ula je tisti dan jedla ___.', odgovor: 'jabolko' },
        { vprasanje: 'Kaj sta ugotovili?',
          moznosti: ['da je dobro tudi drugo sadje', 'da jima drugo sadje ne tekne'] }
      ] },

    { besedilo: 'Domen je v šolskem atriju posadil hrastov želod. Vsak teden ga je zalival, spomladi ' +
        'pa je iz zemlje pogledal droben zelen poganjek.',
      naloge: [
        { poved: 'Domen je posadil ___.', odgovor: 'želod|hrastov želod' },
        { poved: 'Poganjek se je pokazal ___.', odgovor: 'spomladi' },
        { vprasanje: 'Kaj je Domen delal vsak teden?',
          moznosti: ['zalival je', 'prestavljal je želod'] }
      ] },

    { besedilo: 'Eva je pozabila telovadno opremo, zato je uro športa presedela na klopi. Doma si je ' +
        'na vrata omare nalepila listek z urnikom, da se to ne bi ponovilo.',
      naloge: [
        { poved: 'Uro športa je presedela na ___.', odgovor: 'klopi' },
        { poved: 'Na omaro je nalepila listek z ___.', odgovor: 'urnikom' },
        { vprasanje: 'Zakaj je nalepila listek?',
          moznosti: ['da ne bi spet pozabila opreme', 'da bi omara lepše izgledala'] }
      ] },

    { besedilo: 'Luka je na semnju zavrtel kolo sreče in zadel plišastega zajca. Zajca je podaril ' +
        'mlajši sestri, ki ga od takrat nosi s seboj povsod.',
      naloge: [
        { poved: 'Luka je zadel plišastega ___.', odgovor: 'zajca' },
        { poved: 'Zajca je podaril mlajši ___.', odgovor: 'sestri' },
        { vprasanje: 'Komu je zajec zdaj najljubši?',
          moznosti: ['Lukovi sestri', 'Luku'] }
      ] },

    { besedilo: 'Pia je na vrtu našla štiriperesno deteljico. Stisnila jo je med strani slovarja, ' +
        'čez mesec dni pa jo je suho nalepila na voščilnico za babico.',
      naloge: [
        { poved: 'Deteljico je stisnila med strani ___.', odgovor: 'slovarja' },
        { poved: 'Nalepila jo je na ___.', odgovor: 'voščilnico' },
        { vprasanje: 'Zakaj je deteljico pustila v slovarju cel mesec?',
          moznosti: ['da se je posušila', 'da je zrasla'] }
      ] },

    { besedilo: 'Nik je v soboto pomagal očetu prebarvati vrtno ograjo. Barva je bila bela, na ' +
        'koncu pa sta bila bela tudi Nikova lasa in nos.',
      naloge: [
        { poved: 'Barvala sta vrtno ___.', odgovor: 'ograjo' },
        { poved: 'Barva je bila ___.', odgovor: 'bela' },
        { vprasanje: 'Kaj se je zgodilo z Nikom?',
          moznosti: ['poškropil se je z barvo', 'ostal je čist'] }
      ] },

    { besedilo: 'Brina je za šolski projekt merila, koliko dežja pade v enem tednu. V ponedeljek je ' +
        'bila posoda prazna, v petek pa polna do polovice.',
      naloge: [
        { poved: 'Brina je merila ___.', odgovor: 'dež|dežja' },
        { poved: 'V ponedeljek je bila posoda ___.', odgovor: 'prazna' },
        { vprasanje: 'Kdaj je deževalo bolj?',
          moznosti: ['proti koncu tedna', 'na začetku tedna'] }
      ] },

    { besedilo: 'Tai je med počitnicami pri babici vsak dan pomival posodo. Ob koncu tedna mu je ' +
        'babica dala kovanec, ki ga je shranil v prašička.',
      naloge: [
        { poved: 'Tai je pomival ___.', odgovor: 'posodo' },
        { poved: 'Kovanec je shranil v ___.', odgovor: 'prašička' },
        { vprasanje: 'Zakaj je dobil kovanec?',
          moznosti: ['ker je pomagal babici', 'ker je imel rojstni dan'] }
      ] }
  ];

  /* ---------- pomožne funkcije ---------- */

  /* Primerjamo brez ločil, velikih črk in šumnikov - otrok, ki nima slovenske
     tipkovnice, ne sme biti v slabšem položaju. */
  function ocisti(besedilo) {
    return String(besedilo).toLowerCase()
      .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd')
      .replace(/[.,!?;:"»«'`-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function razlicice(naloga) {
    return naloga.odgovor.split('|');
  }

  /* Namig: prva črka, ostale pikice (presledki med besedami ostanejo vidni). */
  function namigZa(beseda) {
    return beseda.charAt(0) + beseda.slice(1).replace(/[^\s]/g, '·');
  }

  function velika(besedilo) {
    return besedilo.charAt(0).toUpperCase() + besedilo.slice(1);
  }

  /* En krog: zgodbe jemljemo cele in po vrsti, dokler ni vprašanj dovolj.
     Zadnja zgodba je lahko odrezana - vprašanj je vedno natanko toliko,
     kolikor jih obljubi vrstica stanja. */
  function sestaviKrog(zgodbe) {
    var vprasanja = [];
    O.premesaj(zgodbe).forEach(function (z) {
      if (vprasanja.length >= ST_VPRASANJ) return;
      z.naloge.forEach(function (n) {
        vprasanja.push({ zgodba: z, naloga: n });
      });
    });
    return vprasanja.slice(0, ST_VPRASANJ);
  }

  function zazeni(posoda, ctx) {
    var daljsa = false;

    pokaziUvod();

    /* ---------- uvod ---------- */
    function pokaziUvod() {
      posoda.innerHTML =
        '<div class="plosca konec">' +
        '<div class="sova-uvod">' +
        '<div class="lik-mesto" id="lik-uvod"></div>' +
        '<div class="oblacek">Preberi besedilo — <b>počasi in do konca</b> — potem pa mi ' +
        'povej, kaj v njem piše. Včasih boš besedo <b>vpisal</b>, včasih jo boš ' +
        '<b>izbral</b>. Če pozabiš, besedilo ostane na zaslonu; kar znova ga preberi!</div>' +
        '</div>' +

        '<div class="branje-primer">' +
        '<p class="branje-zgled">Alenka in Klemen sta se letos odpravila v hribe v Italijo, ' +
        'nato pa še v Bolgarijo.</p>' +
        '<p class="branje-naloga-zgled">Alenka je šla v hribe s <b>Klemnom</b>. ' +
        '<span>← besedo vpišeš</span></p>' +
        '<p class="branje-naloga-zgled">V obeh državah sta bila <b>v istem letu</b>. ' +
        '<span>← odgovor izbereš</span></p>' +
        '</div>' +

        '<p class="namig-opis">Odgovor je vedno v besedilu. Včasih je zapisan naravnost, ' +
        'včasih pa ga je treba <b>razbrati</b> — kot to, da »letos« pomeni isto leto.</p>' +

        '<div class="cipi" id="cipi"></div>' +
        '<p class="namig-opis" id="opis-dolzine"></p>' +

        '<div class="gumbi-vrsta">' +
        '<button class="gumb zelen" id="gumb-zacni">Začni igro ▶</button>' +
        '</div>' +
        '</div>';

      global.Liki.vstavi(document.getElementById('lik-uvod'), 'navaden', 'lik-plava');

      var cipi = document.getElementById('cipi');
      [{ daljsa: false, oznaka: '📄 Ena poved' },
        { daljsa: true, oznaka: '📖 Cela zgodbica' }].forEach(function (moznost) {
        var c = document.createElement('button');
        c.type = 'button';
        c.className = 'cip' + (moznost.daljsa === daljsa ? ' izbran' : '');
        c.textContent = moznost.oznaka;
        c.addEventListener('click', function () {
          global.Ucinki.zvok.klik();
          daljsa = moznost.daljsa;
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
      document.getElementById('opis-dolzine').textContent = daljsa
        ? 'Zgodbice iz dveh ali treh povedi — odgovor je treba poiskati med njimi.'
        : 'Besedila iz ene same povedi — kratko za branje, a vseeno polno podatkov.';
    }

    /* ---------- krog ---------- */
    function zacniKrog() {
      var stanje = {
        vprasanja: sestaviKrog(daljsa ? DALJSA : KRATKA),
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

      pokaziNalogo();

      function trenutno() {
        return stanje.vprasanja[stanje.kazalec];
      }

      /* Je besedilo isto kot pri prejšnjem vprašanju? Če ni, ga posebej označimo. */
      function novoBesedilo() {
        var prej = stanje.vprasanja[stanje.kazalec - 1];
        return !prej || prej.zgodba !== trenutno().zgodba;
      }

      function pokaziNalogo() {
        var v = trenutno();
        var n = v.naloga;
        stanje.namigUporabljen = false;
        stanje.poskus = 0;
        stanje.odgovorjeno = false;

        var vpisovanje = !!n.poved;
        var prve = vpisovanje ? razlicice(n)[0] : '';

        posoda.innerHTML =
          '<div class="plosca">' +
          O.vrsticaStanja(stanje.kazalec, stanje.vprasanja.length, stanje.tocke) +

          '<div class="branje-list' + (novoBesedilo() ? ' novo' : '') + '">' +
          (novoBesedilo() ? '<span class="branje-znacka">📖 novo besedilo</span>' : '') +
          '<p class="branje-besedilo">' + v.zgodba.besedilo + '</p>' +
          '<button class="branje-govor" id="gumb-govor" title="Poslušaj besedilo">🔊</button>' +
          '</div>' +

          '<div class="sova-uvod" style="margin-top:8px">' +
          '<div class="lik-mesto" id="lik-igra" style="width:86px"></div>' +
          '<div class="oblacek">' + (vpisovanje
            ? 'Dopolni poved z besedo iz besedila.'
            : 'Kaj je prav? Izberi eno možnost.') + '</div>' +
          '</div>' +

          (vpisovanje
            ? '<p class="branje-naloga">' + poljeVPovedi(n.poved, prve) + '</p>' +
              '<div class="vnos-vrsta">' +
              '<button class="gumb zelen" id="gumb-preveri">Preveri</button>' +
              '</div>'
            : '<p class="branje-naloga">' + n.vprasanje + '</p>' +
              '<div class="moznosti" id="moznosti"></div>') +

          '<div class="namig-crke" id="namig"></div>' +
          '<div class="odziv" id="odziv"></div>' +

          '<div class="gumbi-vrsta">' +
          '<button class="gumb rumen" id="gumb-namig">💡 Namig</button>' +
          '</div>' +
          '</div>';

        global.Liki.vstavi(document.getElementById('lik-igra'), 'navaden', 'lik-plava');
        O.osveziNiz(stanje.niz);

        /* Brez slovenskega glasu bi bilo besedilo prebrano s tujim naglasom,
           zato gumb v tem primeru raje skrijemo. */
        var govor = document.getElementById('gumb-govor');
        if (global.Ucinki.glas('sl')) {
          govor.addEventListener('click', function () {
            global.Ucinki.zvok.klik();
            global.Ucinki.izgovori(v.zgodba.besedilo, 'sl-SI');
          });
        } else {
          govor.parentNode.removeChild(govor);
        }

        if (vpisovanje) pripraviVpis();
        else pripraviMoznosti(n);

        document.getElementById('gumb-namig').addEventListener('click', pokaziNamig);
      }

      /* Namesto ___ v povedi stoji okence, široko toliko, kot je dolg odgovor. */
      function poljeVPovedi(poved, odgovor) {
        var sirina = Math.max(6, odgovor.length + 2);
        return poved.replace('___',
          '<input id="vnos-odgovor" class="branje-vnos" type="text" autocomplete="off" ' +
          'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'style="width:' + sirina + 'ch" placeholder="?">');
      }

      function pripraviVpis() {
        var vnos = document.getElementById('vnos-odgovor');
        vnos.focus();
        vnos.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          if (stanje.odgovorjeno) naprej(); else preveriVpis();
        });
        document.getElementById('gumb-preveri').addEventListener('click', function () {
          if (stanje.odgovorjeno) naprej(); else preveriVpis();
        });
      }

      function pripraviMoznosti(n) {
        var posodaMoznosti = document.getElementById('moznosti');
        O.premesaj(n.moznosti).forEach(function (m) {
          var g = document.createElement('button');
          g.type = 'button';
          g.className = 'moznost';
          g.textContent = velika(m);
          g.setAttribute('data-moznost', m);
          g.addEventListener('click', function () { preveriIzbiro(g, m, n); });
          posodaMoznosti.appendChild(g);
        });
      }

      /* ---------- točkovanje, skupno obema vrstama nalog ---------- */

      function zadel(besedilo) {
        stanje.niz += 1;
        if (stanje.niz > stanje.najdaljsiNiz) stanje.najdaljsiNiz = stanje.niz;

        var brezPomoci = !stanje.namigUporabljen && stanje.poskus === 0;
        var prisluzeno = O.tockeZaOdgovor(brezPomoci, stanje.niz);

        stanje.tocke += prisluzeno;
        stanje.pravilnih += 1;
        stanje.odgovorjeno = true;

        var odziv = document.getElementById('odziv');
        odziv.className = 'odziv ok';
        odziv.textContent = O.pohvala() + ' ' + besedilo + ' +' + prisluzeno + ' točk' +
          (stanje.niz >= O.NIZ_ZA_BONUS ? ' 🔥' : '');

        global.Liki.reagiraj(document.getElementById('lik-igra'), true);
        global.Ucinki.zvok.pravilno();
        global.Ucinki.konfeti(24);
        document.getElementById('gumb-namig').disabled = true;
        global.setTimeout(naprej, 1900);
      }

      function zgresil() {
        stanje.poskus += 1;
        stanje.niz = 0;
        O.osveziNiz(stanje.niz);
        global.Ucinki.zvok.napacno();
        global.Liki.reagiraj(document.getElementById('lik-igra'), false);
      }

      function shraniNapako(vprasanje, odgovor) {
        stanje.napake.push({ vprasanje: vprasanje, odgovor: odgovor });
      }

      /* ---------- vpisovanje besede ---------- */

      function preveriVpis() {
        var n = trenutno().naloga;
        var vnos = document.getElementById('vnos-odgovor');
        var vpisano = ocisti(vnos.value);
        if (!vpisano) { vnos.focus(); return; }

        var zadetek = razlicice(n).filter(function (r) {
          return ocisti(r) === vpisano;
        })[0];

        if (zadetek) {
          vnos.className = 'branje-vnos pravilno';
          vnos.value = zadetek;          /* otrok vidi zapis s šumniki in veliko začetnico */
          vnos.disabled = true;
          vnos.blur();
          document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
          zadel('');
          return;
        }

        zgresil();
        vnos.className = 'branje-vnos napacno';
        var odziv = document.getElementById('odziv');

        if (stanje.poskus === 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Še ni prav. Poišči besedo v besedilu — namig ti pove prvo črko.';
          pokaziNamig();
          vnos.select();
          return;
        }

        stanje.odgovorjeno = true;
        var prave = razlicice(n).join(' ali ');
        vnos.value = razlicice(n)[0];
        vnos.disabled = true;
        vnos.blur();
        odziv.className = 'odziv ne';
        odziv.textContent = 'Pravilno je: ' + prave;
        document.getElementById('namig').textContent = '';
        document.getElementById('gumb-preveri').textContent = 'Naprej ▶';
        shraniNapako(n.poved.replace('___', '___'), prave);
      }

      /* ---------- izbiranje med možnostmi ---------- */

      function preveriIzbiro(gumb, izbrana, n) {
        if (stanje.odgovorjeno) return;
        var prava = n.moznosti[0];

        if (izbrana === prava) {
          gumb.classList.add('pravilna');
          zakleniMoznosti();
          zadel('');
          return;
        }

        zgresil();
        gumb.classList.add('napacna');
        gumb.disabled = true;
        var odziv = document.getElementById('odziv');

        if (stanje.poskus === 1 && preostale().length > 1) {
          odziv.className = 'odziv ne';
          odziv.textContent = 'Ne še. Preberi besedilo še enkrat in poskusi znova.';
          return;
        }

        stanje.odgovorjeno = true;
        najdiMoznost(prava).classList.add('pravilna');
        zakleniMoznosti();
        odziv.className = 'odziv ne';
        odziv.textContent = 'Pravilno je: ' + velika(prava);
        document.getElementById('gumb-namig').disabled = true;
        shraniNapako(n.vprasanje, prava);
        global.setTimeout(naprej, 2600);
      }

      function moznostiGumbi() {
        return [].slice.call(posoda.querySelectorAll('.moznost'));
      }

      function preostale() {
        return moznostiGumbi().filter(function (g) { return !g.disabled; });
      }

      function najdiMoznost(besedilo) {
        return moznostiGumbi().filter(function (g) {
          return g.getAttribute('data-moznost') === besedilo;
        })[0];
      }

      function zakleniMoznosti() {
        moznostiGumbi().forEach(function (g) { g.disabled = true; });
      }

      /* ---------- namig ---------- */

      /* Pri vpisovanju pokaže prvo črko, pri izbiranju odstrani eno napačno možnost. */
      function pokaziNamig() {
        if (stanje.odgovorjeno) return;
        var n = trenutno().naloga;
        stanje.namigUporabljen = true;
        global.Ucinki.zvok.klik();

        if (n.poved) {
          document.getElementById('namig').textContent = namigZa(razlicice(n)[0]);
          document.getElementById('vnos-odgovor').focus();
        } else {
          var napacne = O.premesaj(preostale().filter(function (g) {
            return g.getAttribute('data-moznost') !== n.moznosti[0];
          }));
          if (napacne.length > 1) {
            napacne[0].disabled = true;
            napacne[0].classList.add('odstranjen');
          }
        }
        document.getElementById('gumb-namig').disabled = true;
      }

      /* ---------- naprej ---------- */

      function naprej() {
        if (!stanje.odgovorjeno) return;
        stanje.kazalec += 1;
        if (stanje.kazalec >= stanje.vprasanja.length) {
          O.koncniZaslon(posoda, ctx, {
            tocke: stanje.tocke,
            pravilnih: stanje.pravilnih,
            skupaj: stanje.vprasanja.length,
            najdaljsiNiz: stanje.najdaljsiNiz,
            napake: stanje.napake
          }, {
            ponovi: function () { zazeni(posoda, ctx); },
            oznakaPravilnih: 'Pravilnih odgovorov',
            naslovNapak: 'To še enkrat preberi:',
            sporocila: {
              tri: 'Vrhunsko! Prebrano si res razumel. 📖',
              dve: 'Zelo dobro! Še malo počasnejšega branja in bo popolno.',
              ena: 'Dober začetek! Besedilo preberi dvakrat — drugič opaziš veliko več.'
            }
          });
          return;
        }
        pokaziNalogo();
      }
    }
  }

  global.Igre.registriraj({
    id: 'slo-branje',
    predmet: 'slovenscina',
    razredi: [2, 3, 4, 5],
    naziv: 'Beri in odgovori',
    opis: 'Preberi kratko zgodbico in povej, kaj v njej piše — besedo vpiši ali izberi.',
    ikona: '📖',
    zazeni: zazeni
  });
})(window);
