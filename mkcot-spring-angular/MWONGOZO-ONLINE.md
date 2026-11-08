# MKCOT online: mwongozo wa hatua kwa hatua

Mwongozo huu unaeleza jinsi ya kuweka MKCOT (Angular + Spring Boot + PostgreSQL) kwenye seva ya mtandaoni
ya bure, ikiwa na anwani ya IP au jina la tovuti, HTTPS, na usalama wa mfumo.

---

## 0. Mfumo una nini

```
 Mtumiaji (simu/kompyuta)
        │  https://mkcot.duckdns.org   (HTTPS, cheti cha bure)
        ▼
 ┌──────────────┐   port 80/443 tu ndizo zilizo wazi
 │    Caddy     │   HTTPS (Let's Encrypt) + vichwa vya usalama
 └──────┬───────┘
        ▼  (mtandao wa ndani wa Docker)
 ┌──────────────┐
 │ Spring Boot  │   API (/api/...) + kurasa za Angular
 │  (Java 21)   │   JWT, ruhusa za kila nafasi, rate limit, audit log
 └──────┬───────┘
        ▼  (mtandao wa ndani, hauonekani nje)
 ┌──────────────┐        ┌──────────────┐
 │ PostgreSQL 16│ ◄───── │   backup     │  nakala kila siku saa 8 usiku
 └──────────────┘        └──────────────┘
```

| Sehemu | Folda | Maelezo |
|---|---|---|
| Frontend | `frontend/` | Angular 19: kurasa zote (dashibodi, wanachama, michango, kuhaniwa, mikopo, miradi, hesabu, vikao, uongozi, taarifa, mipangilio, watumiaji), Kiswahili/English |
| Backend | `backend/` | Spring Boot 3.5, Java 21, Spring Security + JWT |
| Database | `backend/src/main/resources/db/migration/` | `V1__mfumo_wa_mkcot.sql` (majedwali yote), `V2__usalama.sql` (usalama + audit log). Flyway inayaunda yenyewe |
| Seva | `deploy/` | `docker-compose.prod.yml`, `Caddyfile`, `setup-server.sh`, `update.sh`, `restore.sh`, `backup.sh` |
| Picha ya Docker | `Dockerfile` | Inajenga Angular, kuiweka ndani ya Spring Boot, picha moja ndogo |
| Render | `../render.yaml` | Kwa Njia B |

---

## 1. Kuhusu "IP address"

- **Oracle Cloud Always Free (Njia A)** inakupa **IP ya umma (public IP) ya bure**, na unaweza kuifanya
  **ya kudumu (Reserved Public IP)** bila malipo. Hii ndiyo njia pekee ya bure inayotoa IP yako mwenyewe.
- **Render, Koyeb na huduma kama hizo (Njia B)** hazitoi IP ya kudumu. Zinatoa anwani kama
  `https://mkcot.onrender.com`, ambayo inafanya kazi vizuri vile vile.
- Watumiaji hawapaswi kuandika IP: tumia **jina la tovuti la bure** linaloelekeza kwenye IP yako:
  - **DuckDNS** (https://www.duckdns.org): unaingia kwa Google/GitHub, unachagua mf. `mkcot` → `mkcot.duckdns.org`, unaweka IP yako.
  - **sslip.io** (bila kujisajili kabisa): kama IP ni `140.238.10.20`, jina ni `140-238-10-20.sslip.io`.
- HTTPS (kufuli 🔒) inahitaji jina la tovuti. Caddy inapata cheti cha bure peke yake.

---

## 2. Njia A (inapendekezwa): Oracle Cloud Always Free + IP ya kudumu

**Gharama:** bure milele (Always Free). Oracle wanaomba kadi ya benki (Visa/Mastercard) kwa uthibitisho tu,
hawakati pesa kwa huduma za "Always Free".

### Hatua A1: Fungua akaunti
1. Nenda https://www.oracle.com/cloud/free/ → **Start for free**.
2. Jaza taarifa zako. **Home Region**: chagua iliyo karibu, mf. *South Africa Central (Johannesburg)* au *UK South (London)*.
   (Huwezi kubadilisha baadaye.)
3. Thibitisha barua pepe na kadi. Subiri akaunti iwe tayari (dakika chache).

### Hatua A2: Unda seva (VM)
1. Menyu ☰ → **Compute → Instances → Create instance**.
2. **Name**: `mkcot`.
3. **Image**: bofya *Change image* → **Canonical Ubuntu 24.04**.
4. **Shape**: *Change shape* → **Ampere → VM.Standard.A1.Flex**, OCPU **2**, Memory **12 GB** (ni ndani ya Always Free).
   Kama Ampere haipatikani kwa sasa, chagua **VM.Standard.E2.1.Micro** (nayo ni bure; script itaongeza swap).
5. **Networking**: acha *Create new virtual cloud network*, na hakikisha **Assign a public IPv4 address** imechaguliwa.
6. **Add SSH keys**: chagua **Generate a key pair for me** → bofya **Save private key** (faili `ssh-key-....key`). Lihifadhi vizuri; ndilo funguo lako la kuingia kwenye seva.
7. **Create**. Subiri hali iwe **RUNNING**, kisha nakili **Public IP address** (mf. `140.238.10.20`).

### Hatua A3: Fanya IP iwe ya kudumu (Reserved)
1. Kwenye ukurasa wa instance → **Attached VNICs** → bofya VNIC → **IPv4 Addresses**.
2. Kwenye IP ya Primary → ⋮ → **Edit** → chagua **No public IP** → Update.
3. Tena ⋮ → **Edit** → **Reserved public IP** → **Create new reserved IP** → jina `mkcot-ip` → Update.
4. Nakili IP mpya. Hii haitabadilika hata seva ikizimwa na kuwashwa.

### Hatua A4: Fungua port 80 na 443 kwenye Oracle
1. Ukurasa wa instance → bofya jina la **Subnet** → **Security Lists** → **Default Security List**.
2. **Add Ingress Rules** mara mbili:
   - Source CIDR `0.0.0.0/0`, IP Protocol **TCP**, Destination Port **80**
   - Source CIDR `0.0.0.0/0`, IP Protocol **TCP**, Destination Port **443**
3. Usifungue port ya database (5432) wala 8080. Hazihitajiki nje.

### Hatua A5: Jina la tovuti (bure)
- **DuckDNS:** ingia https://www.duckdns.org → andika `mkcot` (au jina lolote lililo wazi) → **add domain** →
  kwenye **current ip** weka IP yako ya Hatua A3 → **update ip**. Jina lako: `mkcot.duckdns.org`.
- **Au sslip.io:** hakuna cha kufanya; jina ni IP yako kwa vistari: `140-238-10-20.sslip.io`.

### Hatua A6: Ingia kwenye seva (SSH)
**Windows (PowerShell)** au **Mac/Linux (Terminal)**:
```bash
# Windows: weka faili la funguo mahali salama, mf. C:\Users\Wewe\.ssh\mkcot.key
# Mac/Linux tu:  chmod 600 ~/Downloads/ssh-key-*.key
ssh -i PATH/YA/ssh-key.key ubuntu@IP_YAKO
```
Ukiulizwa "Are you sure you want to continue connecting", andika `yes`.

### Hatua A7: Pakua MKCOT na uiwashe (amri 3)
Ukiwa ndani ya seva:
```bash
git clone https://github.com/kelvinlivinus-code/mfuko-kuhani.git
cd mfuko-kuhani/mkcot-spring-angular/deploy
sudo bash setup-server.sh mkcot.duckdns.org barua-pepe-yako@mfano.com
```
Script inafanya kila kitu (masasisho, firewall, fail2ban, Docker, siri za nasibu, HTTPS) na kuwasha mfumo.
Mara ya kwanza ujenzi unachukua **dakika 5 hadi 15**.

> Kama repo yako ni ya **private** kwenye GitHub, `git clone` itaomba jina na token. Tengeneza token kwenye
> GitHub → Settings → Developer settings → Personal access tokens (ruhusa ya *Contents: Read* tu).

### Hatua A8: Ingia kwa mara ya kwanza
1. Fungua `https://mkcot.duckdns.org` (jina lako).
2. Bofya **Jisajili** kwa **barua pepe uliyoweka kwenye script**. Wewe ndiye utakuwa **Msimamizi**.
   (Mtu mwingine yeyote akijisajili, anasubiri mpaka umwidhinishe kwenye **Watumiaji**.)
3. Nenda **Mipangilio**: weka jina la mfuko, ada, riba, nembo.
4. Kama una data ya tovuti ya zamani (Supabase): angalia sehemu ya 5 hapa chini.

---

## 3. Njia B: Render (bure) + Neon PostgreSQL (bure)

Hakuna kadi inayohitajika. Anwani itakuwa kama `https://mkcot.onrender.com` (hakuna IP ya kudumu).
**Kikwazo:** seva ya bure ya Render inalala baada ya dakika 15 bila mtumiaji; mtu wa kwanza kufungua
anasubiri kama dakika 1 iamke. Inafaa kwa majaribio au matumizi madogo.

### Hatua B1: Database ya bure (Neon)
1. Nenda https://neon.tech → **Sign up** (kwa GitHub au Google).
2. **Create project**: jina `mkcot`, Postgres **16**, region **AWS Europe (Frankfurt)**.
3. Kwenye **Connection Details** chagua **Java** (au "Parameters only") na nakili:
   - host, mf. `ep-cool-name-123456.eu-central-1.aws.neon.tech`
   - database `neondb`, user `neondb_owner`, password `...`
4. `DB_URL` yako itakuwa:
   ```
   jdbc:postgresql://ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### Hatua B2: Weka mfumo kwenye Render
1. Nenda https://render.com → **Get Started** → ingia kwa **GitHub**, na uipe Render ruhusa ya repo `mfuko-kuhani`.
2. **New + → Blueprint** → chagua repo `kelvinlivinus-code/mfuko-kuhani` → Render inasoma `render.yaml`.
3. Itakuuliza thamani hizi (andika zako):
   | Jina | Thamani |
   |---|---|
   | `MKCOT_ADMIN_EMAIL` | barua pepe yako (utakuwa Msimamizi) |
   | `DB_URL` | ile ya Hatua B1 |
   | `DB_USER` | `neondb_owner` |
   | `DB_PASSWORD` | neno la siri la Neon |
   `MKCOT_JWT_SECRET` inatengenezwa na Render yenyewe.
4. **Apply**. Ujenzi wa kwanza unachukua dakika 10 hivi. Ukimaliza, fungua `https://mkcot.onrender.com`
   (jina halisi linaonekana juu kwenye ukurasa wa huduma) na **Jisajili** kwa barua pepe yako.

> Unaweza kutumia **Supabase** badala ya Neon: unda *project mpya* (si ile ya tovuti ya sasa), kisha
> Project Settings → Database → **Session pooler**, na utumie
> `jdbc:postgresql://aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require`, user `postgres.XXXX`.

---

## 4. Usalama wa mfumo

### Kilichojengwa ndani
| Hatari | Ulinzi |
|---|---|
| Mtu kukisia neno la siri | Akaunti inafungwa **dakika 15** baada ya majaribio **5** mabaya; IP moja inaruhusiwa majaribio 10 kwa dakika 5 (`RateLimitFilter`) |
| Maneno ya siri dhaifu | Lazima herufi 8+, yenye herufi na namba; yanayojulikana sana yanakataliwa |
| Neno la siri kuibiwa kwenye database | Yanahifadhiwa kwa **BCrypt (nguvu 12)**, si maandishi halisi |
| Tokeni kuibiwa | JWT ina muda (saa 12). Ukibadilisha neno la siri au kubofya **Toka kwenye vifaa vyote**, tokeni zote za zamani zinakufa mara moja |
| Mgeni kuwa Msimamizi kwenye seva mpya | `MKCOT_ADMIN_EMAIL`: ni barua pepe hiyo tu inayoweza kuwa Msimamizi wa kwanza |
| Mtu kuona data asiyoruhusiwa | Ruhusa za kila nafasi zinakaguliwa kwenye **backend** (`Permissions.java`), si kivinjarini tu. Mwanachama anaona taarifa zake tu |
| Kubadilisha data bila kujulikana | **Kumbukumbu za ukaguzi (audit log)**: kila kuingia, jaribio baya, kuongeza/kubadilisha/kufuta, kubadilisha nafasi, nakala. Msimamizi na Mkaguzi wanaziona kwenye **Mipangilio** |
| Kunaswa kwa data njiani | **HTTPS** pekee (Caddy + Let's Encrypt), HSTS |
| XSS / clickjacking | Content-Security-Policy, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| Database kushambuliwa moja kwa moja | Postgres iko kwenye mtandao wa ndani wa Docker usio na njia ya nje; port 5432 haifunguliwi |
| Kuvuja kwa maelezo ya ndani | Makosa ya seva hayaonyeshi stack trace; ujumbe wa kuingia haufichui kama barua pepe ipo |
| Siri kwenye msimbo | Hakuna. Zote ziko kwenye `deploy/.env` (ruhusa 600) au Environment ya Render |
| Seva yenyewe | Firewall (22/80/443 tu), fail2ban, SSH kwa funguo tu, masasisho ya usalama ya kila siku, container zisizo na root na zisizoweza kuandika diski |
| Kupoteza data | Nakala ya database kila siku (`deploy/backups/`, siku 14), na **Pakua nakala kamili (JSON)** kwenye Mipangilio |

### Kazi zako (muhimu)
1. Tumia neno la siri refu kwa akaunti ya Msimamizi (mf. maneno 3-4 + namba).
2. Usimtumie mtu faili `deploy/.env` wala funguo la SSH. Usiziweke GitHub.
3. Mpe kila mtumiaji nafasi ya kazi yake tu (**Watumiaji**). Futa akaunti za walioondoka.
4. Kila wiki: pakua nakala (Mipangilio → Pakua nakala kamili) na uihifadhi mahali pengine (mf. Google Drive).
   Kwenye Njia A unaweza pia kunakili `deploy/backups/` kwa `scp`.
5. Angalia **Kumbukumbu za ukaguzi** mara kwa mara: majaribio mengi mabaya ya kuingia ni ishara ya hatari.
6. Kama unashuku siri imevuja: badilisha `MKCOT_JWT_SECRET` kwenye `.env` (`openssl rand -hex 32`) na uwashe upya
   (`sudo bash update.sh`). Kila mtu atahitaji kuingia upya.

---

## 5. Kuhamisha data kutoka tovuti ya sasa (Supabase)
1. Tovuti ya sasa: **Mipangilio → Pakua nakala kamili (JSON)**.
2. MKCOT mpya, ukiwa Msimamizi: **Mipangilio → Hamisha taarifa kutoka nakala** → chagua faili hilo.
3. Nembo ipakie upya kwa mkono (Mipangilio → Nembo).
4. Waambie watumiaji wajisajili upya kwenye anwani mpya, kisha uwape nafasi zao kwenye **Watumiaji**.

---

## 6. Matengenezo (Njia A)
Ukiwa ndani ya seva, kwenye `mfuko-kuhani/mkcot-spring-angular/deploy`:

| Kazi | Amri |
|---|---|
| Hali ya mfumo | `sudo docker compose -f docker-compose.prod.yml ps` |
| Log za backend | `sudo docker compose -f docker-compose.prod.yml logs -f --tail 100 app` |
| Kusasisha baada ya mabadiliko GitHub | `sudo bash update.sh` |
| Kuwasha upya | `sudo docker compose -f docker-compose.prod.yml restart` |
| Nakala sasa hivi | `sudo docker compose -f docker-compose.prod.yml exec db pg_dump -U mkcot mkcot \| gzip > backups/mkcot-sasa.sql.gz` |
| Kurudisha nakala | `sudo bash restore.sh backups/mkcot-2026-11-08.sql.gz` |
| Kupakua nakala kwenye kompyuta yako | (kwenye kompyuta yako) `scp -i ssh-key.key ubuntu@IP:~/mfuko-kuhani/mkcot-spring-angular/deploy/backups/*.gz .` |

---

## 7. Matatizo ya kawaida

| Tatizo | Suluhisho |
|---|---|
| Tovuti haifunguki kabisa | Angalia Hatua A4 (Ingress 80/443). Kwenye seva: `sudo docker compose -f docker-compose.prod.yml ps` zote ziwe *running/healthy* |
| "Your connection is not private" / cheti | Jina la tovuti halielekezi kwenye IP sahihi. Hakikisha DuckDNS ina IP ya Hatua A3, subiri dakika 2-5, kisha `... restart caddy` |
| Ujenzi unasimama/unafeli kwa "out of memory" | Seva ya GB 1: hakikisha swap ipo (`free -h`). Script inaiongeza yenyewe |
| Siwezi kuwa Msimamizi | Jisajili kwa barua pepe ile ile uliyoweka kwenye `MKCOT_ADMIN_EMAIL` (angalia `deploy/.env`) |
| "Majaribio mengi mno" | Subiri dakika 5-15. Msimamizi anaweza kumwekea mtumiaji neno jipya la siri, na hilo linafungua akaunti |
| Render: ukurasa unachelewa sana | Seva ya bure inaamka (dakika 1). Ni kawaida kwenye mpango wa bure |
| Render: backend inashindwa kuwaka | Angalia **Logs**. Mara nyingi `DB_URL` si sahihi au imekosa `?sslmode=require` |

---

## 8. Kuendesha kwenye kompyuta yako (majaribio)
Angalia `README.md` (Docker: `docker compose up -d --build`, au bila Docker kwa Java 21 + Node 22 + PostgreSQL 16).
