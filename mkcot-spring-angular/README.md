# MKCOT toleo la 2: Spring Boot + Angular + PostgreSQL

MKCOT (Mfuko wa Kuhani wa Operation and Training), JWTZ. Huu ni mfumo ule ule wa tovuti ya sasa
(wanachama, michango, kuhaniwa, mikopo, miradi, hesabu, vikao, uongozi, taarifa, mipangilio, watumiaji,
lugha mbili), lakini umejengwa upya kwa:

| Sehemu    | Teknolojia                                   | Folda       |
|-----------|----------------------------------------------|-------------|
| Frontend  | Angular 19 (standalone components, signals)  | `frontend/` |
| Backend   | Spring Boot 3.5, Java 21, Spring Security + JWT | `backend/` |
| Database  | PostgreSQL 16 (majedwali yanaundwa na Flyway) | `backend/src/main/resources/db/migration/` |

> **Kuweka mfumo online (seva ya bure, IP/jina la tovuti, HTTPS, usalama):** angalia
> **[MWONGOZO-ONLINE.md](MWONGOZO-ONLINE.md)**. Kwa ufupi: Oracle Cloud Always Free + `deploy/setup-server.sh`
> (IP ya kudumu ya bure), au Render + Neon kwa `render.yaml`.

## Muundo wa msimbo

```
backend/
  pom.xml
  src/main/java/tz/mkcot/
    MkcotApplication.java
    model/      Member, Payment, SupportEvent, Loan, Project, CabinetMember, Meeting, Notice, LedgerEntry,
                FundSettings, FundAbout, AppUser, Roles
    repo/       JpaRepository kwa kila jedwali
                AuditEntry (kumbukumbu za ukaguzi)
    repo/       ... AuditRepository
    security/   JwtService, JwtFilter, SecurityConfig (CSP/HSTS), CurrentUser,
                RateLimiter + RateLimitFilter (kuzuia brute force), PasswordPolicy, ClientIp
    service/    Permissions (ruhusa za kila nafasi), RecordService, ConfigService, BackupService, Collections, AuditService
    web/        AuthController, UserController, RecordController, ConfigController, BackupController, AuditController, ApiErrors
  src/main/resources/
    application.yml
    db/migration/V1__mfumo_wa_mkcot.sql   majedwali yote ya mfuko
    db/migration/V2__usalama.sql          kufunga akaunti, token_version, audit_log
frontend/
  src/app/
    core/       api, auth.service, store.service (data + hesabu), forms.service (fomu zote), constants, models
    shared/     dialog, fomu, chati (donut na nguzo), majedwali
    views/      dashibodi, wanachama, mwanachama, michango, kuhaniwa, mikopo, miradi, hesabu, vikao,
                uongozi, taarifa, mipangilio, watumiaji, kuingia
  public/       i18n.js (Kiswahili/English), config.js (anwani ya API), nembo.svg
docker-compose.yml        kwa kompyuta yako (Postgres + backend + nginx)
Dockerfile                picha moja: Angular ndani ya Spring Boot (kwa seva ya mtandaoni / Render)
deploy/                   seva ya mtandaoni: docker-compose.prod.yml, Caddyfile (HTTPS), setup-server.sh,
                          update.sh, restore.sh, backup.sh
MWONGOZO-ONLINE.md        mwongozo wa kuweka online hatua kwa hatua
```

## Njia ya 1: Docker (rahisi zaidi)

Unahitaji Docker Desktop tu.

```bash
cp .env.example .env        # kisha fungua .env uweke DB_PASSWORD na MKCOT_JWT_SECRET zako
docker compose up -d --build
```

Fungua http://localhost:8081. Mtu wa kwanza kufungua akaunti anakuwa **Msimamizi**.
Mara ya kwanza ujenzi unachukua dakika kadhaa (Maven na npm zinapakua vifurushi ndani ya Docker).
Data inabaki kwenye volume `mkcot-db` hata ukizima (`docker compose down`); usitumie `down -v` isipokuwa unataka kufuta data yote.

Kama ujenzi unashindwa kwa kosa la cheti (`PKIX` au `self-signed certificate`), mtandao wako unapitia
proxy ya ofisi: weka cheti cha proxy hiyo (faili la `.crt`) kwenye `backend/certs/` na `frontend/certs/`, kisha jenga tena.

## Njia ya 2: Bila Docker (kwenye kompyuta yako)

Unahitaji: **Java 21**, **Maven 3.9+**, **Node 22**, **PostgreSQL 16**.

1. Unda database (kwenye `psql` au pgAdmin), ukichagua neno lako la siri:
   ```sql
   create user mkcot password 'NENO_LAKO';
   create database mkcot owner mkcot;
   ```
2. Washa backend (dirisha la kwanza):
   ```bash
   cd backend
   export DB_URL=jdbc:postgresql://localhost:5432/mkcot DB_USER=mkcot DB_PASSWORD='NENO_LAKO'
   export MKCOT_JWT_SECRET='herufi-32-au-zaidi-za-nasibu-ulizochagua'
   mvn spring-boot:run
   ```
   Windows (PowerShell): tumia `$env:DB_PASSWORD="NENO_LAKO"` badala ya `export`.
   Majedwali yote yanaundwa yenyewe mara ya kwanza (Flyway).
3. Washa frontend (dirisha la pili):
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Fungua http://localhost:4200. `ng serve` inapeleka `/api` kwa backend (`proxy.conf.json`).

### Kwa XAMPP / WAMP / Apache

XAMPP haiwezi kuendesha Java, lakini inaweza kuhudumia frontend:

1. `cd frontend && npx ng build`, kisha nakili yaliyomo kwenye `frontend/dist/mkcot/` hadi `htdocs/mkcot/`.
2. Kwenye `htdocs/mkcot/config.js` weka `window.MKCOT_API = "http://localhost:8080/api";`
3. Washa backend kama hatua ya 2 hapo juu, ukiongeza `MKCOT_CORS_ORIGINS=http://localhost`.
4. Fungua http://localhost/mkcot/

### Faili moja la jar (backend inahudumia frontend pia)

```bash
cd frontend && npx ng build && cd ../backend && mvn package -DskipTests
MKCOT_FRONTEND_DIR=file:../frontend/dist/mkcot/ java -jar target/mkcot-backend.jar
```
Fungua http://localhost:8080.

## Mipangilio (environment variables)

| Jina | Maana | Kawaida |
|------|-------|---------|
| `DB_URL` | Anwani ya PostgreSQL | `jdbc:postgresql://localhost:5432/mkcot` |
| `DB_USER` / `DB_PASSWORD` | Mtumiaji na neno la siri la database | `mkcot` / (tupu) |
| `MKCOT_JWT_SECRET` | Ufunguo wa tokeni za kuingia, herufi 32+ | (ukiacha tupu, watumiaji wataingia upya kila backend ikiwashwa upya) |
| `MKCOT_JWT_TTL_HOURS` | Muda wa kubaki umeingia (saa) | `12` |
| `MKCOT_CORS_ORIGINS` | Anwani za frontend zinazoruhusiwa, zikitenganishwa kwa koma | `http://localhost:4200` |
| `MKCOT_FRONTEND_DIR` | Folda ya frontend iliyojengwa (hiari) | (hakuna) |
| `PORT` | Port ya backend | `8080` |
| `MKCOT_PRODUCTION` | `true` kwenye seva halisi: backend inakataa kuwaka bila `MKCOT_JWT_SECRET` | `false` |
| `MKCOT_ADMIN_EMAIL` | Barua pepe pekee inayoweza kuwa Msimamizi wa kwanza (inapendekezwa online) | (mtumiaji wa kwanza) |
| `MKCOT_CSP_CONNECT` | Anwani ya API kama frontend iko kwenye seva nyingine (kwa CSP) | (hakuna) |
| `DB_POOL_SIZE` | Idadi ya miunganisho ya database | `5` |

Usiweke neno la siri lolote kwenye msimbo au GitHub: tumia `.env` au mipangilio ya seva.

## API kwa ufupi

| Njia | Kazi |
|------|------|
| `POST /api/auth/register`, `POST /api/auth/login` | Kujisajili / kuingia, inarudisha `{token, user}` |
| `GET /api/auth/me`, `POST /api/auth/password` | Akaunti yangu, kubadilisha neno la siri |
| `GET/POST /api/{sehemu}`, `GET/PUT/DELETE /api/{sehemu}/{id}` | sehemu = members, payments, events, loans, projects, cabinet, meetings, notices, ledger |
| `GET/PUT /api/config/settings`, `GET/PUT /api/config/about` | Mipangilio na taarifa za mfuko |
| `GET/POST/DELETE /api/config/logo` | Nembo |
| `GET /api/users`, `PUT /api/users/{id}`, `PUT /api/users/{id}/password` | Msimamizi: watumiaji, nafasi, neno jipya la siri |
| `GET /api/backup`, `POST /api/backup/import` | Nakala kamili (JSON) na kuihamisha |
| `POST /api/auth/logout-all` | Toka kwenye vifaa vyote (tokeni zote za zamani zinakufa) |
| `GET /api/audit?limit=200` | Msimamizi/Mkaguzi: kumbukumbu za ukaguzi |

Kila ombi (isipokuwa kuingia, kujisajili, `GET /api/config/logo` na `GET /api/health`) linahitaji
`Authorization: Bearer <token>`. Ruhusa za kila nafasi zinakaguliwa kwenye backend (`Permissions.java`),
si kwenye kivinjari tu.

## Nafasi za watumiaji

Msimamizi (yote), Mkaguzi (anasoma yote, haandiki), Mhazini (malipo, mikopo, miradi, hesabu),
Mweka malipo (michango tu), Katibu (wanachama, kuhaniwa, vikao, uongozi, matangazo),
Mwanachama (taarifa zake tu). Waliojisajili wanasubiri mpaka Msimamizi awaidhinishe kwenye **Watumiaji**.
Mtumiaji akisahau neno la siri, Msimamizi anamwekea jipya kwenye **Watumiaji**.

## Kuhamisha data kutoka tovuti ya sasa (Supabase)

1. Kwenye tovuti ya sasa: **Mipangilio → Pakua nakala kamili (JSON)**.
2. Kwenye MKCOT mpya, ingia kama Msimamizi: **Mipangilio → Hamisha taarifa kutoka nakala**, chagua faili hilo.
   Data iliyopo kwenye mfumo mpya inabadilishwa na ile ya kwenye nakala. Nembo inapakiwa upya kwa mkono.

## Usalama

Akaunti inafungwa dakika 15 baada ya majaribio 5 mabaya, maombi mengi kutoka IP moja yanazuiwa, maneno ya siri
yanahifadhiwa kwa BCrypt(12) na lazima yawe na herufi na namba, tokeni zinakufa neno la siri likibadilishwa,
kila badiliko linaandikwa kwenye kumbukumbu za ukaguzi, na kurasa zina CSP/HSTS/X-Frame-Options.
Maelezo kamili: [MWONGOZO-ONLINE.md, sehemu ya 4](MWONGOZO-ONLINE.md#4-usalama-wa-mfumo).

## Hosting

GitHub Pages inaweza kuhudumia frontend tu, si Spring Boot. Kwa seva ya mtandaoni ya bure angalia
[MWONGOZO-ONLINE.md](MWONGOZO-ONLINE.md).
