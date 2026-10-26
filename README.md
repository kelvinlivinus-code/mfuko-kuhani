# Tovuti ya Mfuko wa Kuhani COT: maelekezo ya kuweka mtandaoni

Folda hii ina tovuti kamili ya mfumo. Inafanya kazi kwenye browser yoyote (Chrome, Edge, Safari, Firefox), kwenye simu na kompyuta. Kila mtumiaji anaingia kwa barua pepe na neno lake la siri. Hahitaji akaunti ya Claude.

| Faili | Kazi yake |
|---|---|
| `index.html` | Mfumo wenyewe (dashibodi, wanachama, michango, kuhaniwa, mikopo, miradi, hesabu, vikao, uongozi, taarifa, mipangilio, watumiaji) |
| `site.js` | Unaunganisha mfumo na hifadhidata, na unashughulikia kuingia na kujisajili |
| `i18n.js` | Lugha mbili: tafsiri ya Kiingereza ya maneno yote ya mfumo |
| `config.js` | Mahali pa kuweka anwani na ufunguo wa hifadhidata yako |
| `supabase.sql` | Unaunda majedwali na ruhusa za hifadhidata (kwa mradi mpya) |
| `supabase-ruhusa.sql` | Unaongeza ruhusa za kila nafasi kwenye mradi uliokwisha kufunguliwa kabla ya mabadiliko haya |
| `nembo.svg` | Nembo ya JWTZ inayoonekana kwenye menyu na kichupo cha browser |
| `.nojekyll` | Faili tupu linaloiambia GitHub Pages ichapishe faili kama zilivyo |

Tovuti iko hewani: https://kelvinlivinus-code.github.io/mfuko-kuhani/ (GitHub Pages, hazina `kelvinlivinus-code/mfuko-kuhani`, tawi `main`).

Kuna hatua tatu. Zote ni za bure.

## Hatua 1: Fungua hifadhidata (Supabase)

1. Nenda https://supabase.com, bofya **Start your project**, kisha jisajili (unaweza kutumia akaunti ya Google).
2. Bofya **New project**. Weka jina (mfano `mfuko-kuhani`), andika neno la siri la hifadhidata na ulihifadhi mahali salama. Kwenye **Region** chagua iliyo karibu, mfano *Central EU (Frankfurt)*. Kisha bofya **Create new project** na usubiri dakika moja au mbili.
3. Kwenye menyu ya kushoto bofya **SQL Editor** kisha **New query**. Fungua faili `supabase.sql`, nakili maandishi yote, yabandike hapo, kisha bofya **Run**. Ukiona "Success" umemaliza hatua hii.
4. Nenda **Project Settings → API** (au **Data API**). Nakili:
   - **Project URL** (mfano `https://abcdxyz.supabase.co`)
   - **anon public** key (ufunguo mrefu unaoanza na `eyJ...`, au `sb_publishable_...`)
5. Fungua `config.js` kwa Notepad na ubandike thamani hizo mbili kati ya alama za nukuu:

```js
window.MFUKO_CONFIG = {
  supabaseUrl: "https://abcdxyz.supabase.co",
  supabaseAnonKey: "eyJhbGciOi..."
};
```

Usiweke kamwe ufunguo wa **service_role** kwenye faili hili. Ufunguo huo unaruhusu kila kitu.

## Hatua 2: Weka tovuti mtandaoni (GitHub Pages)

1. Weka faili hizi zote kwenye hazina ya GitHub (public), kwenye tawi `main`.
2. Kwenye hazina: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
3. Baada ya dakika moja au mbili tovuti itapatikana kwenye `https://<jina-lako>.github.io/<jina-la-hazina>/`.
4. Rudi Supabase, **Authentication → URL Configuration**:
   - Kwenye **Site URL** weka anwani ya tovuti yako.
   - Kwenye **Redirect URLs** ongeza anwani hiyo hiyo.

   Hatua hii inahakikisha viungo vya kuthibitisha barua pepe na kubadilisha neno la siri vinarudi kwenye tovuti yako.

Njia mbadala: buruta folda hii nzima kwenye https://app.netlify.com/drop.

## Hatua 3: Anza kutumia

1. Fungua tovuti, bofya **Jisajili** na ujaze jina, barua pepe na neno la siri. Thibitisha barua pepe kupitia kiungo utakachotumiwa, kisha ingia.
2. **Mtu wa kwanza kujisajili anakuwa Msimamizi moja kwa moja**, kwa hiyo jisajili wewe kwanza.
3. Waambie viongozi na wanachama wafungue tovuti na wajisajili. Wataona ujumbe kwamba wanasubiri kuidhinishwa. Nenda sehemu ya **Watumiaji** na umpe kila mmoja nafasi ya kazi yake tu:
   - **Mwanachama**: anaona taarifa zake binafsi tu (michango, mikopo na matukio yake) pamoja na matangazo. Chagua pia kumbukumbu yake ya uanachama kwenye safu ya "Kumbukumbu ya uanachama".
   - **Mweka malipo**: anarekodi michango na malipo tu
   - **Katibu**: anasajili wanachama, anarekodi matukio ya kuhaniwa, vikao, uongozi na matangazo
   - **Mhazini**: malipo, mikopo, miradi na hesabu za mfuko
   - **Mkaguzi**: anaona taarifa zote lakini hawezi kubadilisha chochote
   - **Msimamizi**: anafanya yote, pamoja na kusimamia watumiaji na mipangilio

   Ruhusa hizi zinalindwa na hifadhidata yenyewe (Row Level Security), si kwa kuficha vitufe tu.
4. Nembo ya JWTZ (`nembo.svg`) inaonekana yenyewe. Ukitaka nyingine: **Mipangilio → Nembo ya JWTZ → chagua picha**.

## Kuhamisha taarifa kutoka mfumo wa awali (kiungo cha Claude)

1. Kwenye mfumo wa awali nenda **Mipangilio → Pakua nakala kamili (JSON)**.
2. Kwenye tovuti mpya, ukiwa Msimamizi, nenda **Mipangilio → Hamisha taarifa kutoka nakala** na uchague faili hilo.

## Lugha

Mfumo una Kiswahili na English. Bofya kitufe cha **English** (au **Kiswahili**) juu kulia, kwenye ukurasa wa kuingia, au kwenye Mipangilio. Kila kifaa kinakumbuka lugha iliyochaguliwa. Majina na maelezo yaliyoandikwa na watumiaji hayatafsiriwi.

## Mambo ya kukumbuka

- **Usiri:** taarifa zinakaa kwenye akaunti yako ya Supabase. Ni watumiaji ulioidhinisha pekee wanaoweza kuziona, na mtu akijisajili tu haoni chochote.
- **Nakala za akiba:** pakua nakala kamili kila mwezi kupitia Mipangilio na uihifadhi mahali salama.
- **Kusinzia kwa mpango wa bure:** mradi wa bure wa Supabase husinzia ukikaa wiki moja bila mtu kuutumia. Ukisinzia, ingia supabase.com na ubofye **Restore project**. Ukiwa unatumika kila wiki hautasinzia.
- **Kubadilisha tovuti baadaye:** badilisha faili kwenye hazina ya GitHub (au pakia toleo jipya). GitHub Pages inachapisha upya yenyewe. Taarifa hazipotei, kwa sababu ziko Supabase.
