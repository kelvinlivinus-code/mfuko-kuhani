// Lugha mbili / Two languages: Kiswahili (default) and English.
// The app is written in Kiswahili. When English is chosen, every piece of text the
// page shows is looked up here and swapped as it appears. Stored records (names,
// notes, notices) are left exactly as they were typed.
(function(){
var KEY="mfuko-lang";
var lang="sw";try{lang=localStorage.getItem(KEY)==="en"?"en":"sw";}catch(e){}
window.MFUKO_LANG=lang;
window.setLang=function(l){try{localStorage.setItem(KEY,l);}catch(e){}location.reload();};
document.documentElement.lang=lang;
if(lang!=="en"){window.tr=function(s){return s;};return;}

var M={Januari:"January",Februari:"February",Machi:"March",Aprili:"April",Mei:"May",Juni:"June",Julai:"July",Agosti:"August",Septemba:"September",Oktoba:"October",Novemba:"November",Desemba:"December"};
var D={
// navigation and shell
"Njia za mkato":"Shortcuts","Sehemu za mfumo":"System sections","Mwanzo":"Home","Menyu":"Menu","Fungua menyu":"Open menu",
"Dashibodi":"Dashboard","Wanachama":"Members","Michango":"Contributions","Kuhaniwa":"Bereavement support","Mikopo":"Loans","Miradi":"Projects","Hesabu":"Accounts","Vikao":"Meetings","Uongozi":"Leadership","Taarifa za Mfuko":"Fund information","Mipangilio":"Settings","Watumiaji":"Users","Taarifa zangu":"My details",
"Mfuko wa Kuhani":"Kuhani Fund","Mfuko wa Kuhani - COT":"Kuhani Fund - COT","Mfuko wa Kuhani COT":"Kuhani Fund COT","Tawi la COT":"COT Branch",
"Tawi la COT (Chief of Operations and Training), JWTZ":"COT Branch (Chief of Operations and Training), TPDF",
"Mfuko wa Kuhani COT · Mfumo wa kumbukumbu za mfuko wa wanachama":"Kuhani Fund COT · Members' fund records system",
"Hifadhidata haipatikani":"Database unavailable","Mhariri":"Editor","Msomaji":"Reader",
"Mambo yanayohitaji kufuatiliwa":"Items that need follow-up","Toka":"Log out","Toka kwenye mfumo":"Log out of the system","Taarifa za mfuko":"Fund information",
"Inapakia taarifa za mfuko…":"Loading fund records…","Inaunganisha…":"Connecting…",
"Sehemu hii imeshindwa kuonyeshwa. Fungua sehemu nyingine kisha urudi.":"This section could not be shown. Open another section and come back.",
"Hifadhidata ya mfuko haipatikani. Angalia mtandao kisha pakia ukurasa upya.":"The fund database is unavailable. Check your connection and reload the page.",
"Una nafasi ya Mkaguzi: unaona taarifa zote lakini huwezi kubadilisha chochote.":"You have the Auditor role: you can see all records but cannot change anything.",
"Muunganisho umekatika. Pakia ukurasa upya.":"The connection was lost. Reload the page.",
"Lugha":"Language","SALIO":"BALANCE","MAPATO":"INCOME","MATUMIZI":"EXPENSES","deni":"owed","imelipwa":"paid","Mwanachama wenye deni":"Members in debt","Mwanachama anayehaniwa":"Member being supported","Badilisha lugha":"Change language",
// months
"Jan":"Jan","Feb":"Feb","Mac":"Mar","Apr":"Apr","Mei":"May","Jun":"Jun","Jul":"Jul","Ago":"Aug","Sep":"Sep","Okt":"Oct","Nov":"Nov","Des":"Dec",
// member status, relations, event kinds
"Hai":"Active","Amesimamishwa":"Suspended","Amehama":"Transferred","Amefariki":"Deceased",
"Mke":"Wife","Mume":"Husband","Mtoto":"Child","Baba":"Father","Mama":"Mother","Baba mkwe":"Father-in-law","Mama mkwe":"Mother-in-law","Ndugu mwingine":"Other relative","Mwanachama mwenyewe":"The member themself",
"Msiba":"Bereavement","Ugonjwa":"Illness","Ajali":"Accident","Harusi / Sherehe":"Wedding / Celebration","Changamoto nyingine":"Other hardship",
// payment types
"Mchango wa mwezi":"Monthly contribution","Ada ya kiingilio":"Entry fee","Mchango maalum":"Special contribution","Faini":"Fine","Malipo mengine":"Other payment",
// leadership positions
"Mlezi":"Patron","Mwenyekiti":"Chairperson","Makamu Mwenyekiti":"Vice Chairperson","Katibu":"Secretary","Katibu Msaidizi":"Assistant Secretary","Mweka Hazina":"Treasurer","Mweka Hazina Msaidizi":"Assistant Treasurer","Mjumbe":"Committee member",
// meeting kinds, project status
"Kikao cha kawaida":"Ordinary meeting","Kikao cha dharura":"Emergency meeting","Mkutano mkuu":"General meeting","Kikao cha kamati ya uongozi":"Leadership committee meeting",
"Wazo":"Idea","Inaendelea":"Ongoing","Imekamilika":"Completed","Imesitishwa":"Suspended",
"(mwanachama hayupo)":"(member not found)","Umelipwa":"Paid","Umechelewa":"Overdue","Unaendelea":"Ongoing","Imelipwa":"Paid","Inasubiri":"Pending",
// roles
"Msimamizi":"Administrator","Mkaguzi":"Auditor","Mhazini":"Treasurer","Mweka malipo":"Payments clerk","Mwanachama":"Member","Anasubiri kuidhinishwa":"Awaiting approval","Msimamizi (wewe)":"Administrator (you)",
"anaona taarifa zake binafsi tu: michango, mikopo na matukio yake, pamoja na matangazo.":"sees only their own records: their contributions, loans and events, plus notices.",
"anarekodi michango na malipo tu.":"records contributions and payments only.",
"anasajili wanachama, anarekodi matukio ya kuhaniwa, vikao, uongozi na matangazo.":"registers members and records bereavement events, meetings, leadership and notices.",
"anashughulikia malipo, mikopo, miradi na hesabu za mfuko.":"handles payments, loans, projects and the fund's accounts.",
"anaona taarifa zote lakini hawezi kubadilisha chochote.":"sees all records but cannot change anything.",
"anafanya yote, pamoja na kuidhinisha watumiaji na kubadilisha mipangilio.":"does everything, including approving users and changing settings.",
// messages
"Huna ruhusa ya kufanya hivi kwa nafasi yako. Mwombe msimamizi.":"Your role does not allow this. Ask the administrator.",
"Akaunti yako bado haijaunganishwa na kumbukumbu yako ya uanachama. Mwombe msimamizi wa mfuko akuunganishe.":"Your account is not yet linked to your membership record. Ask the fund administrator to link it.",
"Hifadhidata haipatikani kwa sasa.":"The database is unavailable right now.","Una ruhusa ya kusoma tu.":"You can only view records.",
"Hifadhidata imejaa. Futa kumbukumbu zisizohitajika kisha jaribu tena.":"The database is full. Delete records you no longer need and try again.",
"Maombi mengi kwa muda mfupi. Subiri kidogo kisha jaribu tena.":"Too many requests at once. Wait a moment and try again.",
"Haikuhifadhiwa. Angalia mtandao kisha jaribu tena.":"Not saved. Check your connection and try again.",
"Imehifadhiwa":"Saved","Imefutwa":"Deleted","Haikuhifadhiwa.":"Not saved.",
// dialogs and common buttons
"Funga":"Close","Thibitisha":"Confirm","Ghairi":"Cancel","Futa":"Delete","Hifadhi":"Save","Ondoa":"Remove","Hariri":"Edit","Ndiyo":"Yes","Hapana":"No","Bado":"Not yet",
"Jina":"Name","Uhusiano":"Relationship","Tarehe ya kuzaliwa":"Date of birth","Hali":"Status",
"Wategemezi (mke/mume, watoto, wazazi)":"Dependants (spouse, children, parents)","+ Ongeza mtegemezi":"+ Add dependant",
// member form
"Sajili mwanachama mpya":"Register a new member","Namba ya mwanachama":"Member number","Cheo":"Rank","Jina kamili":"Full name","mf. Sajini":"e.g. Sergeant",
"Namba ya jeshi":"Service number","Kikosi / Idara":"Unit / Department","Simu":"Phone","Tarehe ya kujiunga":"Date joined","Hali ya uanachama":"Membership status",
"Usaili wa awali":"Initial interview","Amefanyiwa":"Done","Tarehe ya usaili":"Interview date","Makazi":"Residence","Ndugu wa karibu (mrithi)":"Next of kin (heir)","Simu ya ndugu wa karibu":"Next of kin's phone",
"Rekodi ada ya kiingilio sasa?":"Record the entry fee now?","Ndiyo, amelipa":"Yes, paid","Hapana, bado":"No, not yet","Kiasi cha kiingilio":"Entry fee amount","Maelezo mengine":"Other notes",
"Ada ya kiingilio wakati wa usajili":"Entry fee at registration","Mwanachama amesajiliwa":"Member registered",
// payment form
"Rekodi malipo":"Record payment","Kwa michango ya mwezi, chagua miezi yote anayolipia; kila mwezi unahifadhiwa peke yake.":"For monthly contributions, choose every month being paid for; each month is saved separately.",
"Chagua mwanachama":"Choose a member","Aina ya malipo":"Payment type","Mwaka wa mchango":"Contribution year","Miezi anayolipia":"Months paid for",
"Kiasi (kwa kila mwezi kama ni mchango wa mwezi)":"Amount (per month for monthly contributions)","Tarehe ya kulipa":"Payment date","Namba ya risiti / muamala":"Receipt / transaction number","Maelezo":"Notes",
"Weka kiasi kilicho zaidi ya sifuri.":"Enter an amount above zero.","Miezi uliyochagua tayari imelipwa kwa mwanachama huyu.":"The months you chose are already paid for this member.",
// event form
"Rekodi tukio la kuhaniwa":"Record a bereavement support event","Hariri tukio":"Edit event","Mwanachama anayehaniwa":"Member being supported","Tarehe ya tukio":"Event date","Aina ya tukio":"Event type",
"Muhusika ni nani kwa mwanachama":"Who the person is to the member","Jina la muhusika":"Person's name","mf. jina la marehemu":"e.g. name of the deceased","Mahali":"Place",
"Kiasi kilichotolewa na mfuko":"Amount given by the fund","Hali ya malipo":"Payment status","Tarehe ya kulipwa":"Date paid","Aliyeidhinisha":"Approved by","Maelezo ya tukio":"Event description",
// loan form
"Toa mkopo mpya":"Issue a new loan","Mikopo inatolewa kwa wanachama hai tu.":"Loans are issued to active members only.","Namba ya mkopo":"Loan number","Tarehe ya kutolewa":"Date issued","Kiasi cha mkopo":"Loan amount",
"Riba (%)":"Interest (%)","Muda wa kurejesha (miezi)":"Repayment period (months)","Mdhamini":"Guarantor","Madhumuni ya mkopo":"Loan purpose","Weka kiasi cha mkopo.":"Enter the loan amount.",
"Tarehe":"Date","Kiasi kilicholipwa":"Amount paid","Namba ya risiti":"Receipt number","Weka kiasi.":"Enter an amount.",
// project form
"Anzisha mradi":"Start a project","Hariri mradi":"Edit project","Jina la mradi":"Project name","Tarehe ya kuanza":"Start date","Msimamizi wa mradi":"Project manager","Bajeti iliyopangwa":"Planned budget","Maelezo ya mradi":"Project description",
"Aina":"Type","Uwekezaji (mtaji kutoka mfuko)":"Investment (capital from the fund)","Mapato ya mradi":"Project income","Matumizi ya mradi":"Project expenses","Kiasi":"Amount",
// leadership form
"Ongeza kiongozi":"Add a leader","Hariri kiongozi":"Edit leader","Yupo madarakani":"In office","Nafasi":"Position","Si mwanachama / andika jina chini":"Not a member / type the name below",
"Jina (kama si mwanachama aliyesajiliwa)":"Name (if not a registered member)","Mwanzo wa kipindi":"Start of term","Mwisho wa kipindi":"End of term","Amemaliza muda":"Term ended","Majukumu":"Responsibilities",
"Chagua mwanachama au andika jina.":"Choose a member or type a name.",
// meeting form
"Rekodi kikao":"Record a meeting","Hariri kikao":"Edit meeting","Kichwa cha kikao":"Meeting title","mf. Kikao cha robo ya tatu 2026":"e.g. Third quarter meeting 2026","Mwenyekiti wa kikao":"Meeting chair","Katibu wa kikao":"Meeting secretary",
"Ajenda":"Agenda","Ajenda moja kwa kila mstari":"One agenda item per line","Wahudhuriaji":"Attendees","Maazimio":"Resolutions","Azimio moja kwa kila mstari":"One resolution per line","Muhtasari wa kikao":"Meeting summary","Kikao kijacho":"Next meeting",
// notice, ledger, about forms
"Toa taarifa mpya":"Post a new notice","Hariri taarifa":"Edit notice","Kichwa":"Title","Ibandikwe juu?":"Pin to the top?",
"Ingiza mapato au matumizi mengine":"Enter other income or expenses","Hariri kumbukumbu":"Edit record","Matumizi":"Expense","Mapato":"Income","Kundi":"Category","mf. Vifaa vya ofisi, Riba ya benki, Usafiri":"e.g. Office supplies, Bank interest, Transport",
"Hariri taarifa za mfuko":"Edit fund information","Utangulizi":"Introduction","Historia ya mfuko":"Fund history","Malengo":"Goals","Lengo moja kwa kila mstari":"One goal per line","Kanuni na taratibu":"Rules and procedures","Kanuni moja kwa kila mstari":"One rule per line","Mawasiliano ya ofisi ya mfuko":"Fund office contacts",
// detail dialogs
"Muhusika":"Person","Risiti":"Receipt","Futa tukio hili la kuhaniwa? Kiasi chake kitaondolewa kwenye hesabu.":"Delete this bereavement event? Its amount will be removed from the accounts.","Futa tukio":"Delete event",
"Riba":"Interest","Muda":"Period","Jumla ya kurejesha":"Total to repay","Rejesho kwa mwezi":"Monthly repayment","Kilichorejeshwa":"Repaid","Salio linalodaiwa":"Balance owed","Tarehe ya mwisho":"Due date","Madhumuni":"Purpose","Marejesho":"Repayments",
"Hakuna rejesho lililorekodiwa bado.":"No repayment recorded yet.","Futa mkopo":"Delete loan","Rekodi rejesho":"Record repayment",
"Uwekezaji":"Investment","Bajeti":"Budget","Faida / hasara":"Profit / loss","Mwenendo wa fedha":"Money flow","Ondoa kumbukumbu hii ya mradi?":"Remove this project record?","Hakuna fedha zilizorekodiwa kwa mradi huu bado.":"No money recorded for this project yet.",
"Futa mradi":"Delete project","Ingiza fedha":"Enter money","Muhtasari":"Summary","Waliohudhuria":"Attended","Futa kumbukumbu za kikao hiki?":"Delete this meeting's records?","Futa kikao":"Delete meeting","Futa malipo":"Delete payment","Mwaka":"Year",
// dashboard
"Dashibodi kuu":"Main dashboard","Sajili mwanachama":"Register member","Bado hakuna mwanachama aliyesajiliwa. Anza kwa kusajili wanachama, kisha rekodi michango yao ya kila mwezi.":"No member has been registered yet. Start by registering members, then record their monthly contributions.",
"Sajili mwanachama wa kwanza":"Register the first member","Salio la mfuko":"Fund balance","Fedha taslimu zilizopo":"Cash on hand","Wanachama hai":"Active members","Mikopo inayodaiwa":"Loans outstanding",
"Deni":"Debt","Yote yamelipwa":"All paid","Wanachama wenye deni":"Members in debt","Mikopo iliyochelewa":"Overdue loans","Malipo ya karibuni":"Recent payments","Hakuna malipo yaliyorekodiwa bado.":"No payments recorded yet.",
"Iliyokusanywa":"Collected","Inayotarajiwa":"Expected","hakuna data":"no data","Jumla ya deni":"Total debt",
// members
"Tafuta kwa jina, namba, kikosi au simu":"Search by name, number, unit or phone","Chuja kwa hali":"Filter by status","Hali zote":"All statuses",
"Hakuna mwanachama bado. Sajili wa kwanza ili kuanza kufuatilia michango.":"No members yet. Register the first one to start tracking contributions.","Hakuna mwanachama anayelingana na utafutaji huu.":"No member matches this search.",
"Namba":"Number","Kiingilio":"Entry fee","Amelipa":"Paid","Sehemu":"Partial","Mwanachama huyu hayupo tena. ":"This member no longer exists. ","Mwanachama huyu hayupo tena.":"This member no longer exists.","Rudi kwa wanachama":"Back to members","← Wanachama wote":"← All members",
"Futa mwanachama":"Delete member","Rekodi tukio":"Record event","Taarifa binafsi":"Personal details","Ndugu wa karibu":"Next of kin","Hana deni.":"No debt.","Wategemezi":"Dependants","Kuzaliwa":"Born",
"Hakuna mtegemezi aliyeandikwa. Hariri taarifa ili kuongeza mke/mume, watoto na wazazi.":"No dependants recorded. Edit the details to add a spouse, children and parents.",
"Historia ya kuhaniwa":"Support history","Tukio":"Event","Hajahaniwa bado.":"No support received yet.","Malipo yote":"All payments","Hakuna malipo yaliyorekodiwa.":"No payments recorded.",
// contributions
"Sajili wanachama kwanza; majina yao yataonekana hapa kwa kila mwezi.":"Register members first; their names will appear here for each month.",
"Bofya kisanduku cha mwezi ambao haujalipwa ili kurekodi mchango wake.":"Click an unpaid month's box to record its contribution.","Kijani = amelipa · Njano = deni":"Green = paid · Yellow = owed","Jumla":"Total",
"Hakuna ada ya kiingilio, faini au mchango maalum uliorekodiwa mwaka huu.":"No entry fee, fine or special contribution recorded this year.","Malipo mengine ya mwaka":"Other payments this year",
// bereavement
"Watoto":"Children","Mke / Mume":"Spouse","Wazazi na wakwe":"Parents and in-laws","Matukio ya kuhaniwa":"Bereavement support events","Historia ya misiba na changamoto ambazo mfuko umewasaidia wanachama":"History of bereavements and hardships the fund has helped members with",
"Jumla iliyotolewa":"Total given","Chuja kwa aina":"Filter by type","Aina zote za matukio":"All event types",
"Hakuna tukio la kuhaniwa lililorekodiwa. Kila msiba au changamoto inayosaidiwa na mfuko iandikwe hapa.":"No support event recorded. Every bereavement or hardship the fund helps with should be recorded here.","Rekodi tukio la kwanza":"Record the first event",
// loans
"Mikopo kwa wanachama tu, na marejesho yake":"Loans to members only, and their repayments","Toa mkopo":"Issue loan","Mikopo iliyotolewa":"Loans issued","Iliyochelewa":"Overdue","Imepita tarehe ya mwisho":"Past the due date",
"Hakuna mkopo uliotolewa bado.":"No loan issued yet.","Toa mkopo wa kwanza":"Issue the first loan","Mkopo":"Loan","Kurejesha":"To repay","Amerejesha":"Repaid","Salio":"Balance","Mwisho":"Due",
// projects
"Miradi ya mfuko":"Fund projects","Miradi inayoanzishwa na mfuko, mtaji wake na mapato yake":"Projects started by the fund, their capital and income",
"Hakuna mradi uliorekodiwa. Andika wazo la mradi hata kabla haujaanza, ili lijadiliwe kwenye vikao.":"No project recorded. Write down a project idea even before it starts, so it can be discussed in meetings.","Ongeza mradi":"Add project",
// accounts
"Hesabu za mfuko":"Fund accounts","Muhtasari wa mapato, matumizi na salio":"Summary of income, expenses and balance","Ingiza mapato / matumizi":"Enter income / expense","Fedha taslimu":"Cash","Mikopo nje":"Loans out","Fedha zilizo kwa wakopaji":"Money held by borrowers",
"Thamani ya mfuko":"Fund value","Salio pamoja na madeni ya mikopo":"Balance plus loans owed","Kipengele":"Item","Tangu mwanzo":"Since the start","Salio la kuanzia":"Opening balance","Ada za kiingilio":"Entry fees","Michango ya kila mwezi":"Monthly contributions",
"Michango maalum, faini na mengine":"Special contributions, fines and others","Marejesho ya mikopo":"Loan repayments","Mapato ya miradi":"Project income","Mapato mengine":"Other income","Jumla ya mapato":"Total income",
"Misaada ya misiba na dharura":"Bereavement and emergency support","Mikopo iliyotolewa ":"Loans issued ","Uwekezaji na matumizi ya miradi":"Project investment and expenses","Matumizi mengine":"Other expenses","Jumla ya matumizi":"Total expenses","Mapato kuondoa matumizi":"Income minus expenses",
"Mapato na matumizi mengine":"Other income and expenses","Futa kumbukumbu hii?":"Delete this record?","Matumizi ya uendeshaji (vifaa, usafiri, ada za benki) na mapato yasiyo ya michango yanaandikwa hapa.":"Running costs (supplies, transport, bank charges) and income other than contributions are recorded here.",
// meetings & leadership
"Vikao na mikutano":"Meetings","Kumbukumbu za vikao, wahudhuriaji na maazimio":"Meeting records, attendees and resolutions","Hakuna kikao kilichorekodiwa bado.":"No meeting recorded yet.","Kipindi":"Term",
"Uongozi (Cabinet)":"Leadership (Cabinet)","Viongozi wa mfuko walio madarakani na waliotangulia":"The fund's current and past leaders","Orodha ya uongozi bado haijajazwa.":"The leadership list has not been filled in yet.","Walio madarakani":"In office","Hakuna.":"None.","Viongozi waliotangulia":"Past leaders",
// fund information
"Utangulizi, historia, kanuni na matangazo":"Introduction, history, rules and notices","Hariri utangulizi na historia":"Edit introduction and history","Toa taarifa":"Post notice","Utangulizi na historia ya mfuko bado haijaandikwa.":"The fund's introduction and history have not been written yet.",
"Andika utangulizi":"Write the introduction","Mawasiliano":"Contacts","Matangazo kwa wanachama":"Notices to members","Imebandikwa":"Pinned","Hakuna tangazo kwa sasa.":"No notices right now.",
// settings
"Jina la mfuko":"Fund name","Tawi":"Branch","Ada ya kiingilio (kabla ya usaili wa awali)":"Entry fee (before the initial interview)","Mchango wa kila mwezi":"Monthly contribution","Riba ya kawaida ya mkopo (%)":"Standard loan interest (%)",
"Salio la kuanzia (fedha zilizokuwepo kabla ya mfumo)":"Opening balance (money held before the system)","Tarehe ya salio la kuanzia":"Opening balance date","Hifadhi mipangilio":"Save settings","Nembo ya JWTZ":"TPDF emblem","Nembo ya mfuko":"Fund emblem",
"Pakia picha ya nembo ya JWTZ (PNG, JPG au SVG, ikiwezekana yenye mandharinyuma meupe au ya uwazi). Itaonekana juu ya menyu kwa kila anayefungua mfumo.":"Upload the TPDF emblem image (PNG, JPG or SVG, preferably with a white or transparent background). It appears above the menu for everyone who opens the system.",
"Ondoa nembo":"Remove emblem","Mhariri pekee ndiye anayeweza kubadilisha nembo.":"Only the administrator can change the emblem.","Viwango vya mfuko":"Fund rates","Nakala ya taarifa":"Backup",
"Pakua nakala ya taarifa zote mara kwa mara na uihifadhi mahali salama. Faili za CSV zinafunguka kwenye Excel.":"Download a copy of all records regularly and keep it somewhere safe. CSV files open in Excel.",
"Pakua nakala kamili (JSON)":"Download full backup (JSON)","Wanachama (CSV)":"Members (CSV)","Malipo yote (CSV)":"All payments (CSV)","Matukio ya kuhaniwa (CSV)":"Bereavement events (CSV)","Ruhusa na usalama":"Permissions and security",
"Kila mtumiaji anaingia kwa barua pepe na neno lake la siri, na anaona sehemu za kazi yake tu. Waliojisajili hawaoni chochote mpaka msimamizi awaidhinishe. Ruhusa hizi zinalindwa pia na hifadhidata yenyewe.":"Each user signs in with their email and password and sees only the sections for their job. People who sign up see nothing until the administrator approves them. These permissions are also enforced by the database itself.",
"Wewe: ":"You: ","Wewe:":"You:","Hamisha taarifa kutoka nakala":"Import records from a backup",
"Chagua faili la nakala kamili (JSON) lililopakuliwa kwenye Mipangilio ya mfumo wa awali. Kumbukumbu zenye namba ile ile zitaandikwa upya, nyingine zitaongezwa.":"Choose a full backup file (JSON) downloaded from Settings. Records with the same number are overwritten; others are added.",
"Faili hili si nakala sahihi ya mfumo.":"This file is not a valid system backup.","Inahamisha taarifa…":"Importing records…","Uhamishaji haukukamilika. Jaribu tena.":"The import did not finish. Try again.",
// users
"Msimamizi pekee ndiye anayeweza kuona sehemu hii.":"Only the administrator can see this section.","Imeshindwa kupakia watumiaji.":"Could not load users.","Watumiaji wa mfumo":"System users","Idhinisha waliojisajili na uchague nafasi ya kila mmoja":"Approve people who signed up and choose each one's role",
"Mpe kila mtu nafasi ya kazi yake tu. Kwa Mwanachama, chagua pia kumbukumbu yake ya uanachama ili aone taarifa zake.":"Give each person only the role their job needs. For a Member, also choose their membership record so they can see their own details.",
"Inapakia watumiaji…":"Loading users…","Hakuna mtumiaji mwingine bado. Waambie wafungue tovuti na kubofya Jisajili.":"No other users yet. Ask them to open the site and click Sign up.",
"Barua pepe":"Email","Alijisajili":"Signed up","Kumbukumbu ya uanachama":"Membership record","Nafasi imebadilishwa":"Role changed","Nafasi haikubadilishwa.":"Role not changed.","Imeunganishwa":"Linked","— Haijaunganishwa —":"— Not linked —",
// logo, downloads
"Chagua faili la picha (PNG, JPG au SVG).":"Choose an image file (PNG, JPG or SVG).","Picha ya SVG ni kubwa mno. Tumia PNG.":"The SVG image is too large. Use a PNG.","Kupakia nembo kunahitaji nafasi ya Mhariri.":"Uploading the emblem requires the Administrator role.",
"Inapakia nembo…":"Uploading emblem…","Picha ni kubwa mno. Tumia picha ndogo zaidi.":"The image is too large. Use a smaller image.","Nembo haikupakiwa. Jaribu tena.":"The emblem was not uploaded. Try again.",
"Kupakua hakupatikani kwenye kifaa hiki.":"Downloading is not available on this device.","Kikosi":"Unit","Usaili":"Interview","Mwezi":"Month","Faili halikupakuliwa. Jaribu tena.":"The file was not downloaded. Try again.",
// sign-in screens (site.js)
"Tovuti bado haijaunganishwa na hifadhidata. Fungua faili config.js uweke anwani ya Supabase na ufunguo wa umma (anon key), kama maelekezo yanavyoeleza.":"The site is not yet connected to a database. Open config.js and enter the Supabase address and public (anon) key, as the guide explains.",
"Ingia kwa barua pepe na neno la siri":"Sign in with your email and password","Neno la siri":"Password","Ingia":"Sign in","Thibitisha barua pepe yako kwanza kupitia kiungo tulichokutumia.":"Confirm your email first using the link we sent you.",
"Barua pepe au neno la siri si sahihi.":"Incorrect email or password.","Jisajili":"Sign up","Umesahau neno la siri?":"Forgot your password?","Fungua akaunti. Msimamizi wa mfuko ataidhinisha kabla hujaona taarifa.":"Create an account. The fund administrator will approve it before you can see any records.",
"Neno la siri (herufi 8 au zaidi)":"Password (8 characters or more)","Neno la siri liwe na herufi 8 au zaidi.":"The password must have 8 characters or more.","Andika jina lako kamili.":"Enter your full name.","Barua pepe hii tayari imesajiliwa. Ingia.":"This email is already registered. Sign in.",
"Tumekutumia barua pepe. Bofya kiungo kilichomo ili kuthibitisha, kisha uingie.":"We have sent you an email. Click the link in it to confirm, then sign in.","Nina akaunti tayari":"I already have an account",
"Andika barua pepe yako. Tutakutumia kiungo cha kuweka neno jipya la siri.":"Enter your email. We will send you a link to set a new password.","Tuma kiungo":"Send link","Kiungo kimetumwa. Angalia barua pepe yako.":"Link sent. Check your email.","Rudi kuingia":"Back to sign in",
"Weka neno jipya la siri":"Set a new password","Neno jipya la siri":"New password","Pakia upya":"Reload","Imeshindwa kusoma akaunti yako. Jaribu tena.":"Could not read your account. Try again.",
"Fungua akaunti ya kwanza":"Create the first account","Akaunti ya kwanza itakuwa ya Msimamizi wa mfumo.":"The first account will be the system administrator's.","Jina lako kamili":"Your full name","Fungua akaunti":"Create account"
};
// Text with numbers or names inside: [pattern, English]
var P=[
[/^Jaza sehemu ya "(.+)"\.$/,function(m){return 'Fill in "'+tt(m[1])+'".';}],
[/^Hariri taarifa za (.+)$/,"Edit details of $1"],
[/^Namba (.+) tayari inatumiwa na (.+)\.$/,"Number $1 is already used by $2."],
[/^Michango ya miezi (\d+) imehifadhiwa( \(miezi iliyolipwa awali imerukwa\))?$/,function(m){return m[1]+" monthly contributions saved"+(m[2]?" (months already paid were skipped)":"");}],
[/^Hariri mkopo (.+)$/,"Edit loan $1"],[/^Namba (.+) tayari ipo\.$/,"Number $1 already exists."],
[/^Rekodi rejesho · (.+)$/,"Record repayment · $1"],[/^Ingiza fedha za mradi · (.+)$/,"Enter project money · $1"],
[/^Ondoa rejesho la (.+) la (.+)\?$/,"Remove the repayment of $1 on $2?"],[/^Futa mkopo (.+) pamoja na marejesho yake yote\?$/,"Delete loan $1 and all its repayments?"],
[/^Futa mradi "(.+)"\?$/,'Delete project "$1"?'],[/^Futa malipo ya (.+) \((.+)\) ya (.+)\?$/,function(m){return "Delete the payment of "+m[1]+" ("+tt(m[2])+") from "+m[3]+"?";}],
[/^Kati ya (\d+) waliosajiliwa$/,"Out of $1 registered"],[/^Mikopo (\d+) hai$/,"$1 active loans"],[/^Muhtasari wa michango (\d{4})$/,"Contributions summary $1"],
[/^Matukio ya kuhaniwa (\d{4})$/,"Support events $1"],[/^(\d+) yanasubiri malipo$/,"$1 awaiting payment"],[/^(\d+) inahitaji kufuatiliwa$/,"$1 need follow-up"],
[/^Michango ya kila mwezi (\d{4})$/,"Monthly contributions $1"],[/^Michango ya (\S+)$/,function(m){return "Contributions for "+(M[m[1]]||m[1]);}],[/^Inatarajiwa (.+)$/,"Expected $1"],
[/^Wanachama (\d+) waliosajiliwa$/,"$1 registered members"],[/^Deni (\d{4})$/,"Debt $1"],[/^Mwaka (\d{4})$/,"Year $1"],[/^Salio (.+)$/,"Balance $1"],[/^Michango (\d{4})$/,"Contributions $1"],
[/^Futa (.+) kwenye orodha\? Malipo, mikopo na matukio yake yatabaki bila jina\. Ni bora kubadilisha hali yake kuwa "Amehama"\.$/,'Remove $1 from the list? Their payments, loans and events will remain without a name. It is better to change their status to "Transferred".'],
[/^Amefanyiwa (.+)$/,"Done $1"],[/^Amelipa (.+) kati ya (.+) inayotarajiwa hadi sasa\. ?$/,"Paid $1 of $2 expected so far. "],[/^Deni (.+)\.$/,"Debt $1."],
[/^Misiba · (.+)$/,"Bereavements · $1"],[/^Mikopo (\d+) bado inaendelea$/,"$1 loans still running"],[/^Mikopo (\d+) kwa jumla$/,"$1 loans in total"],
[/^Ondoa (.+) \((.+)\) kwenye orodha ya uongozi\?$/,function(m){return "Remove "+m[1]+" ("+tt(m[2])+") from the leadership list?";}],[/^Futa taarifa "(.+)"\?$/,'Delete notice "$1"?'],
[/^Kumbukumbu (\d+) zimehamishwa\. Inapakia upya…$/,"$1 records imported. Reloading…"],[/^ ?Watumiaji (\d+) wanasubiri kuidhinishwa\.$/,function(m){return m[1]==="1"?" 1 user is awaiting approval.":" "+m[1]+" users are awaiting approval.";}],
[/^Nafasi ya (.+)$/,"Role of $1"],[/^Kumbukumbu ya uanachama ya (.+)$/,"Membership record of $1"],[/^Mambo (\d+) yanahitaji kufuatiliwa$/,"$1 items need follow-up"],
[/^Nafasi yako: (.+)$/,function(m){return "Your role: "+tt(m[1]);}],[/^Jeshi la Wananchi wa Tanzania \(JWTZ\) · (.+)$/,function(m){return "Tanzania People's Defence Force (TPDF) · "+(t(m[1])||m[1]);}],
[/^Mchango wa mwezi ni (.+) · ada ya kiingilio (.+)$/,"Monthly contribution is $1 · entry fee $2"],[/^Imekusanywa (.+) · madeni (.+)$/,"Collected $1 · owed $2"],
[/^(.+) · leo (.+)$/,function(m){return t(m[1])+" · today "+m[2];}],[/^Usajili haukufanikiwa: (.*)$/,"Sign-up failed: $1"],[/^Haikutumwa: (.*)$/,"Not sent: $1"],
[/^Akaunti yako \((.*)\) imesajiliwa lakini inasubiri kuidhinishwa na msimamizi wa mfuko\. Ukishaidhinishwa, pakia ukurasa upya\.$/,"Your account ($1) is registered but is awaiting approval by the fund administrator. Once approved, reload the page."],
[/^(Januari|Februari|Machi|Aprili|Mei|Juni|Julai|Agosti|Septemba|Oktoba|Novemba|Desemba)(.*)$/,function(m){return M[m[1]]+m[2];}],
[/^Rekodi (\S+) (\d{4}) kwa (.+)$/,function(m){return "Record "+(M[m[1]]||m[1])+" "+m[2]+" for "+m[3];}],
[/^Mikopo iliyotolewa (\d{4})$/,"Loans issued $1"],
[/^Ada na michango mingine (\d{4})$/,"Fees and other contributions $1"],[/^Matukio (\d+) · misiba (\d+)$/,"$1 events · $2 bereavements"],
[/^(\d+) miezi$/,"$1 months"],[/^(.*)– sasa$/,"$1– present"],[/^(\S+) (\d+%)$/,function(m){var a=t(m[1]);return a?a+" "+m[2]:null;}],
[/^(TSh [\d,]+) kati ya (TSh [\d,]+)$/,"$1 of $2"],
[/^ ?Watumiaji 1 wanasubiri kuidhinishwa\.$/," 1 user is awaiting approval."],[/^(.+?) (Watumiaji \d+ wanasubiri kuidhinishwa\.)$/,function(m){var a=t(m[1]),b=t(m[2]);return a&&b?a+" "+b.trim():null;}]
];
function tt(s){var r=t(s);return r==null?s:r;}
function t0(s){if(D.hasOwnProperty(s))return D[s];for(var i=0;i<P.length;i++){var m=s.match(P[i][0]);if(m){var r=typeof P[i][1]==="function"?P[i][1](m):s.replace(P[i][0],P[i][1]);if(r!=null)return r;}}return null;}
// Composite labels: "Name *", ": text", "A · B", "Label TSh 1,000", "Label: TSh 1,000"
function t(s){var r=t0(s),m;if(r!=null)return r;
  if((m=s.match(/^(.+?)(\s*\*)$/))&&(r=t(m[1]))!=null)return r+m[2];
  if((m=s.match(/^(:\s*)(.+)$/))&&(r=t(m[2]))!=null)return m[1]+r;
  if((m=s.match(/^(.+?)(:?\s+TSh [\d,]+)$/))&&(r=t(m[1]))!=null)return r+m[2];
  if(s.indexOf(" · ")>0){var ps=s.split(" · "),ch=false;ps=ps.map(function(x){var y=t(x);if(y!=null){ch=true;return y;}return x;});if(ch)return ps.join(" · ");}
  return null;}
function tr(s){if(!s||!/[A-Za-z]/.test(s))return s;var a=s.match(/^\s*/)[0],b=s.match(/\s*$/)[0],core=s.trim();var r=t(core);return r==null?s:a+r+b;}
window.tr=tr;
var ATTR=["placeholder","title","aria-label","alt"];
function fixEl(el){for(var i=0;i<ATTR.length;i++){var v=el.getAttribute&&el.getAttribute(ATTR[i]);if(v){var n=tr(v);if(n!==v)el.setAttribute(ATTR[i],n);}}}
function walk(node){if(node.nodeType===3){var v=node.nodeValue,n=tr(v);if(n!==v)node.nodeValue=n;return;}
  if(node.nodeType!==1)return;var tag=node.tagName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA")return;
  fixEl(node);for(var c=node.firstChild;c;c=c.nextSibling)walk(c);}
function start(){walk(document.body);document.title=tr(document.title);
  new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];
    if(m.type==="childList")for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);
    else if(m.type==="characterData")walk(m.target);
    else if(m.type==="attributes")fixEl(m.target);}})
  .observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
