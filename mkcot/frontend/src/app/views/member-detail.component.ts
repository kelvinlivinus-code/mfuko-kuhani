import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MONTHS } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { byDateDesc, fmtD, loanCls, short, statusCls, tsh } from '../core/util';
import { KvComponent } from '../shared/details';
import { PaymentTableComponent } from '../shared/payment-table.component';
import { YearSegComponent } from '../shared/year-seg.component';

/** Ukurasa wa mwanachama mmoja; pia "Taarifa zangu" kwa Mwanachama aliyeingia. */
@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [KvComponent, YearSegComponent, PaymentTableComponent],
  template: `
    @if (!m()) {
      @if (mine()) {
        <div class="head"><div><h1>Taarifa zangu</h1></div></div>
        <div class="empty"><span>Akaunti yako bado haijaunganishwa na kumbukumbu yako ya uanachama. Mwombe msimamizi wa mfuko akuunganishe.</span></div>
      } @else {
        <p>Mwanachama huyu hayupo tena. </p><button class="btn" (click)="back()">Rudi kwa wanachama</button>
      }
    } @else {
      @let m = this.m()!;
      @if (!mine()) { <div><button class="btn sm" (click)="back()">← Wanachama wote</button></div> }
      <div class="head">
        <div><h1>{{ (m.rank ? m.rank + ' ' : '') + m.name }}</h1>
          <p class="row" style="gap:8px"><span class="num">{{ m.no || '' }}</span><span [class]="'pill ' + statusCls(m.status)">{{ m.status || 'Hai' }}</span>
            @for (c of roles(); track c.id) { <span class="pill brass">{{ c.position }}</span> }</p></div>
        @if (!mine() && (s.can('members') || s.can('events') || s.can('payments'))) {
          <div class="row">
            @if (s.can('members')) {
              <button class="btn danger" (click)="del()">Futa</button>
              <button class="btn" (click)="f.memberForm(m)">Hariri</button>
            }
            @if (s.can('events')) { <button class="btn" (click)="f.eventForm({ memberId: m.id })">Rekodi tukio</button> }
            @if (s.can('payments')) { <button class="btn pri" (click)="f.paymentForm({ memberId: m.id, months: r().unpaid })">Rekodi malipo</button> }
          </div>
        }
      </div>
      <section class="panel"><h2>Taarifa binafsi</h2>
        <app-kv [pairs]="[['Namba ya jeshi', m.armyNo], ['Kikosi / Idara', m.unit], ['Simu', m.phone], ['Tarehe ya kujiunga', fmtD(m.joinDate)],
          ['Usaili wa awali', m.usaili === 'Amefanyiwa' ? 'Amefanyiwa ' + (m.usailiDate ? fmtD(m.usailiDate) : '') : 'Bado'],
          ['Ada ya kiingilio', tsh(ep()) + ' kati ya ' + tsh(s.settings().entryFee)], ['Makazi', m.address], ['Ndugu wa karibu', kin()]]" />
        @if (m.notes) { <p class="prose muted">{{ m.notes }}</p> }
      </section>
      <div class="grid2">
        <section class="panel"><header><h2>Michango {{ s.year() }}</h2><app-year-seg /></header>
          <div class="months">
            @for (mo of months; track $index; let i = $index) {
              <div [class]="'mchip ' + chip(i + 1)"><b>{{ mo }}</b><span class="num">{{ r().paid[i + 1] > 0 ? short(r().paid[i + 1]) : chip(i + 1) === 'due' ? 'Deni' : '—' }}</span></div>
            }
          </div>
          <p style="margin:0">Amelipa {{ tsh(r().total) }} kati ya {{ tsh(r().expected) }} inayotarajiwa hadi sasa. @if (r().debt) {<b style="color:var(--warn)">Deni {{ tsh(r().debt) }}.</b>} @else {<b style="color:var(--ok)">Hana deni.</b>}</p>
        </section>
        <section class="panel"><h2>Wategemezi</h2>
          @if (m.deps?.length) {
            <div class="scroll"><table><thead><tr><th>Jina</th><th>Uhusiano</th><th>Kuzaliwa</th><th>Hali</th></tr></thead>
              <tbody>@for (d of m.deps; track $index) {
                <tr><td>{{ d.name }}</td><td>{{ d.relation }}</td><td>{{ fmtD(d.dob) }}</td>
                  <td>@if (d.alive === 'Amefariki') { <span class="pill bad">Amefariki</span> } @else { <span class="pill ok">Hai</span> }</td></tr>
              }</tbody></table></div>
          } @else { <p class="muted">Hakuna mtegemezi aliyeandikwa. Hariri taarifa ili kuongeza mke/mume, watoto na wazazi.</p> }
        </section>
      </div>
      <section class="panel"><h2>Historia ya kuhaniwa</h2>
        @if (evs().length) {
          <div class="scroll"><table><thead><tr><th>Tarehe</th><th>Tukio</th><th>Muhusika</th><th class="r">Kiasi</th><th>Hali</th></tr></thead>
            <tbody>@for (e of evs(); track e.id) {
              <tr class="click" tabindex="0" (click)="f.eventDetail(e.id)"><td>{{ fmtD(e.date) }}</td><td>{{ e.kind }}</td><td>{{ (e.relation || '') + (e.person ? ' — ' + e.person : '') }}</td>
                <td class="r num">{{ tsh(e.amount) }}</td><td><span [class]="'pill ' + (e.status === 'Inasubiri' ? 'warn' : 'ok')">{{ e.status || 'Imelipwa' }}</span></td></tr>
            }</tbody></table></div>
        } @else { <p class="muted">Hajahaniwa bado.</p> }
      </section>
      @if (loans().length) {
        <section class="panel"><h2>Mikopo</h2><div class="list">
          @for (l of loans(); track l.id) {
            <div class="it" style="cursor:pointer" (click)="f.loanDetail(l.id)">
              <div><b>{{ l.no }}</b><div class="muted">{{ fmtD(l.date) }} · {{ tsh(l.principal) }}</div></div>
              <div style="text-align:right"><div class="num">Salio {{ tsh(s.loanCalc(l).bal) }}</div><span [class]="'pill ' + loanCls(s.loanCalc(l).status)">{{ s.loanCalc(l).status }}</span></div>
            </div>
          }
        </div></section>
      }
      <section class="panel"><h2>Malipo yote</h2>
        @if (pays().length) { <app-payment-table [rows]="pays()" [canWrite]="!mine() && s.can('payments')" /> }
        @else { <p class="muted">Hakuna malipo yaliyorekodiwa.</p> }
      </section>
    }
  `,
})
export class MemberDetailComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  auth = inject(AuthService);
  private router = inject(Router);
  /** Kutoka kwenye njia /wanachama/:id */
  id = input<string>();
  /** true kwenye /zangu */
  mine = input(false);
  months = MONTHS;
  fmtD = fmtD; tsh = tsh; short = short; statusCls = statusCls; loanCls = loanCls;

  mid = computed(() => (this.mine() ? this.auth.user()?.memberId || '' : this.id() || ''));
  m = computed(() => this.s.mem(this.mid()));
  r = computed(() => this.s.memberYear(this.m()!, this.s.year()));
  ep = computed(() => this.s.entryPaid(this.mid()));
  kin = computed(() => [this.m()?.kin, this.m()?.kinPhone].filter(Boolean).join(' · '));
  roles = computed(() => this.s.cabinet().filter((c) => c.memberId === this.mid()));
  pays = computed(() => this.s.payments().filter((p) => p.memberId === this.mid()).sort(byDateDesc));
  loans = computed(() => this.s.loans().filter((l) => l.memberId === this.mid()).sort(byDateDesc));
  evs = computed(() => this.s.events().filter((e) => e.memberId === this.mid()).sort(byDateDesc));

  chip(n: number) {
    const r = this.r();
    return r.paid[n] > 0 ? 'paid' : r.active && n >= r.first && n <= r.last ? 'due' : 'na';
  }
  back() {
    this.router.navigate(['/wanachama']);
  }
  del() {
    const m = this.m()!;
    this.ui.confirm(
      `Futa ${m.name} kwenye orodha? Malipo, mikopo na matukio yake yatabaki bila jina. Ni bora kubadilisha hali yake kuwa "Amehama".`,
      'Futa mwanachama',
      async () => {
        const ok = await this.s.remove('members', m.id);
        if (ok) this.back();
        return ok;
      },
    );
  }
}
