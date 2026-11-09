import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errMsg } from '../core/api';
import { AuthService } from '../core/auth.service';
import { MONTHS_FULL, PAY_TYPES, ROLE_HELP, ROLE_LBL } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { byDateDesc, todayISO } from '../core/util';
import { AuditEntry } from '../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="head"><div><h1>Mipangilio</h1></div></div>
    <section class="panel"><h2>Nembo ya JWTZ</h2>
      <div class="row" style="align-items:flex-start;gap:16px">
        <div class="logoprev"><img [src]="s.logoUrl()" alt="Nembo ya mfuko" /></div>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:0;flex:1">
          <p class="muted" style="margin:0">Pakia picha ya nembo ya JWTZ (PNG, JPG au SVG, ikiwezekana yenye mandharinyuma meupe au ya uwazi). Itaonekana juu ya menyu kwa kila anayefungua mfumo.</p>
          @if (admin()) {
            <div class="row">
              <input type="file" id="logoFile" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="max-width:100%" (change)="logo($event)" />
              @if (s.settings().hasLogo) { <button class="btn sm danger" (click)="s.deleteLogo()">Ondoa nembo</button> }
            </div>
          } @else { <p class="muted" style="margin:0">Msimamizi pekee ndiye anayeweza kubadilisha nembo.</p> }
        </div>
      </div>
    </section>
    <section class="panel"><h2>Viwango vya mfuko</h2>
      <form class="fgrid" (ngSubmit)="save()">
        @for (k of keys; track k[0]) {
          <div class="field" [class.full]="k[0] === 'branch'">
            <label [for]="'s_' + k[0]">{{ k[1] }}</label>
            <input [id]="'s_' + k[0]" [name]="k[0]" [type]="k[2]" step="any" [(ngModel)]="v[k[0]]" [disabled]="!admin()" />
          </div>
        }
        @if (admin()) { <div class="full"><button class="btn pri" type="submit">Hifadhi mipangilio</button></div> }
      </form>
    </section>
    @if (canExport()) {
      <section class="panel"><h2>Nakala ya taarifa</h2>
        <p class="muted" style="margin:0">Pakua nakala ya taarifa zote mara kwa mara na uihifadhi mahali salama. Faili za CSV zinafunguka kwenye Excel.</p>
        <div class="row">
          <button class="btn" (click)="exportFile('json')">Pakua nakala kamili (JSON)</button>
          <button class="btn" (click)="exportFile('members')">Wanachama (CSV)</button>
          <button class="btn" (click)="exportFile('payments')">Malipo yote (CSV)</button>
          <button class="btn" (click)="exportFile('events')">Matukio ya kuhaniwa (CSV)</button>
        </div>
      </section>
    }
    <section class="panel"><h2>Lugha</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button [class]="lang === 'sw' ? 'btn pri' : 'btn'" (click)="setLang('sw')">Kiswahili</button>
        <button [class]="lang === 'en' ? 'btn pri' : 'btn'" (click)="setLang('en')">English</button>
      </div>
    </section>
    <section class="panel"><h2>Ruhusa na usalama</h2>
      <p class="prose">Kila mtumiaji anaingia kwa barua pepe na neno lake la siri, na anaona sehemu za kazi yake tu. Waliojisajili hawaoni chochote mpaka msimamizi awaidhinishe. Ruhusa hizi zinalindwa pia na hifadhidata yenyewe.</p>
      <p>Wewe: <b>{{ roleLbl[auth.role() || ''] || '—' }}</b></p>
      <ul class="prose" style="margin:0;padding-left:20px">@for (r of roleHelp; track r[0]) { <li><b>{{ r[0] }}</b>: {{ r[1] }}</li> }</ul>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn" (click)="f.passwordForm(changePw)">Badilisha neno la siri</button>
        <button class="btn" (click)="logoutAll()">Toka kwenye vifaa vyote</button>
      </div>
    </section>
    @if (canExport()) {
      <section class="panel"><h2>Kumbukumbu za ukaguzi</h2>
        <p class="muted" style="margin:0">Kila kuingia, jaribio baya la kuingia, na kila badiliko la taarifa linaandikwa hapa: nani, lini, nini na kutoka anwani gani (IP).</p>
        @if (audit === null) { <div><button class="btn" (click)="loadAudit()">Onyesha kumbukumbu 200 za karibuni</button></div> }
        @else if (!audit.length) { <div class="empty">Hakuna kumbukumbu bado.</div> }
        @else {
          <div class="scroll"><table>
            <thead><tr><th>Lini</th><th>Mtumiaji</th><th>Tukio</th><th>Sehemu</th><th>IP</th><th>Maelezo</th></tr></thead>
            <tbody>@for (a of audit; track a.id) {
              <tr><td>{{ (a.at || '').replace('T', ' ').slice(0, 19) }}</td><td>{{ a.userEmail || '—' }}</td>
                <td><span [class]="badAction(a.action) ? 'pill bad' : 'pill'">{{ actLbl[a.action] || a.action }}</span></td>
                <td>{{ a.target || '' }}</td><td>{{ a.ip || '' }}</td><td>{{ a.detail || '' }}</td></tr>
            }</tbody>
          </table></div>
        }
      </section>
    }
    @if (admin()) {
      <section class="panel"><h2>Hamisha taarifa kutoka nakala</h2>
        <p class="muted" style="margin:0">Chagua faili la nakala kamili (JSON) lililopakuliwa kwenye Mipangilio ya mfumo wa awali. Taarifa zote zilizopo zitabadilishwa na zile za kwenye nakala.</p>
        <input type="file" id="impFile" accept="application/json,.json" style="max-width:100%" (change)="importFile($event)" />
      </section>
    }
  `,
})
export class SettingsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  auth = inject(AuthService);
  lang = (window as any).MFUKO_LANG || 'sw';
  roleLbl = ROLE_LBL;
  roleHelp = ROLE_HELP;
  keys: [string, string, string][] = [
    ['fundName', 'Jina la mfuko', 'text'],
    ['branch', 'Tawi', 'text'],
    ['entryFee', 'Ada ya kiingilio (kabla ya usaili wa awali)', 'number'],
    ['monthlyFee', 'Mchango wa kila mwezi', 'number'],
    ['interestRate', 'Riba ya kawaida ya mkopo (%)', 'number'],
    ['openingBalance', 'Salio la kuanzia (fedha zilizokuwepo kabla ya mfumo)', 'number'],
    ['openingDate', 'Tarehe ya salio la kuanzia', 'date'],
  ];
  v: Record<string, any> = {};
  admin = () => this.auth.role() === 'msimamizi';
  canExport = () => this.auth.role() === 'msimamizi' || this.auth.role() === 'msomaji';
  changePw = (a: string, b: string) => this.auth.changePassword(a, b);
  audit: AuditEntry[] | null = null;
  actLbl: Record<string, string> = {
    login: 'Kuingia', login_fail: 'Jaribio baya la kuingia', login_locked: 'Akaunti imefungwa', account_locked: 'Akaunti imefungwa',
    register: 'Kujisajili', password_change: 'Kubadilisha neno la siri', password_fail: 'Neno la siri baya', password_reset: 'Neno jipya la siri',
    logout_all: 'Kutoka vifaa vyote', role_change: 'Kubadilisha nafasi', user_delete: 'Kufuta mtumiaji', create: 'Kuongeza',
    update: 'Kubadilisha', delete: 'Kufuta', backup_export: 'Kupakua nakala', backup_import: 'Kuhamisha nakala',
    settings_change: 'Mipangilio', about_change: 'Taarifa za mfuko', logo_change: 'Nembo',
  };
  badAction = (a: string) => /fail|locked|delete|import/.test(a);

  async loadAudit() {
    try {
      this.audit = await this.auth.audit(200);
    } catch (e) {
      this.ui.toast(errMsg(e));
    }
  }

  logoutAll() {
    this.ui.confirm('Utatolewa kwenye kila kifaa ulichoingia nacho (pamoja na hiki). Endelea?', 'Toka', async () => {
      try {
        await this.auth.logoutAll();
        return true;
      } catch (e) {
        this.ui.toast(errMsg(e));
        return false;
      }
    });
  }

  ngOnInit() {
    const st = this.s.settings() as any;
    for (const [k] of this.keys) this.v[k] = k === 'fundName' ? this.s.fundName() : st[k] ?? '';
  }

  async save() {
    const out: Record<string, any> = {};
    for (const [k, , t] of this.keys) out[k] = t === 'number' ? Number(this.v[k]) || 0 : String(this.v[k] ?? '').trim();
    await this.s.saveSettings(out);
  }

  setLang(l: string) {
    (window as any).setLang?.(l);
  }

  logo(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      this.ui.toast('Chagua faili la picha (PNG, JPG au SVG).');
      return;
    }
    this.ui.toast('Inapakia nembo…');
    this.s.uploadLogo(file);
  }

  async importFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    let obj: unknown;
    try {
      obj = JSON.parse(await file.text());
    } catch {
      this.ui.toast('Faili hili si nakala sahihi ya mfumo.');
      return;
    }
    this.ui.confirm('Taarifa zote zilizopo sasa zitafutwa na kubadilishwa na zile za kwenye nakala. Endelea?', 'Hamisha', async () => {
      try {
        this.ui.toast('Inahamisha taarifa…');
        const r = await this.s.importAll(obj);
        const n = Object.values(r).reduce((a, b) => a + b, 0);
        this.ui.toast(`Kumbukumbu ${n} zimehamishwa. Inapakia upya…`);
        setTimeout(() => location.reload(), 1500);
        return true;
      } catch (err) {
        this.ui.toast(errMsg(err));
        input.value = '';
        return true;
      }
    });
  }

  async exportFile(kind: string) {
    const csv = (rows: unknown[][]) =>
      '﻿' + rows.map((r) => r.map((x) => {
        const v = x == null ? '' : String(x);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',')).join('\r\n');
    const stamp = todayISO();
    const Y = this.s.year();
    let name: string, data: string;
    try {
      if (kind === 'json') {
        name = `mkcot-nakala-${stamp}.json`;
        data = JSON.stringify(await this.s.exportAll(), null, 2);
      } else if (kind === 'members') {
        name = `wanachama-${stamp}.csv`;
        data = csv([
          ['Namba', 'Cheo', 'Jina', 'Namba ya jeshi', 'Kikosi', 'Simu', 'Tarehe ya kujiunga', 'Hali', 'Usaili', 'Ada ya kiingilio', 'Deni ' + Y, 'Wategemezi'],
          ...this.s.members().map((m) => [m.no, m.rank, m.name, m.armyNo, m.unit, m.phone, m.joinDate, m.status, m.usaili, this.s.entryPaid(m.id),
            this.s.memberYear(m, Y).debt, (m.deps || []).map((d) => `${d.name} (${d.relation})`).join('; ')]),
        ]);
      } else if (kind === 'payments') {
        name = `malipo-${stamp}.csv`;
        data = csv([
          ['Tarehe', 'Mwanachama', 'Aina', 'Mwaka', 'Mwezi', 'Kiasi', 'Risiti', 'Maelezo'],
          ...[...this.s.payments()].sort(byDateDesc).map((p) => [p.date, this.s.mname(p.memberId), PAY_TYPES[p.type] || p.type, p.year || '',
            p.month ? MONTHS_FULL[p.month - 1] : '', p.amount, p.receipt, p.note]),
        ]);
      } else {
        name = `kuhaniwa-${stamp}.csv`;
        data = csv([
          ['Tarehe', 'Mwanachama', 'Tukio', 'Muhusika', 'Jina la muhusika', 'Kiasi', 'Hali', 'Aliyeidhinisha', 'Maelezo'],
          ...[...this.s.events()].sort(byDateDesc).map((e) => [e.date, this.s.mname(e.memberId), e.kind, e.relation, e.person, e.amount, e.status, e.approvedBy, e.description]),
        ]);
      }
    } catch (err) {
      this.ui.toast(errMsg(err));
      return;
    }
    const blob = new Blob([data], { type: name.endsWith('.json') ? 'application/json' : 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
  }
}
