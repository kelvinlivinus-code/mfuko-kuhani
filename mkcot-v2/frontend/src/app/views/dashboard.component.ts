import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MONTHS_FULL, PAY_TYPES } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { byDateDesc, fmtD, pad, todayISO, tsh, yearOf } from '../core/util';
import { BarChartComponent, DonutComponent } from '../shared/charts';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconComponent, DonutComponent, BarChartComponent],
  template: `
    <div class="head">
      <div><h1>Dashibodi kuu</h1><p>{{ s.settings().branch }} · leo {{ fmtD(today) }}</p></div>
      @if (s.can('members') || s.can('payments')) {
        <div class="row">
          @if (s.can('members')) { <button class="btn" (click)="f.memberForm()">Sajili mwanachama</button> }
          @if (s.can('payments')) { <button class="btn pri" (click)="f.paymentForm()">Rekodi malipo</button> }
        </div>
      }
    </div>
    @if (!s.members().length) {
      <div class="empty"><span>Bado hakuna mwanachama aliyesajiliwa. Anza kwa kusajili wanachama, kisha rekodi michango yao ya kila mwezi.</span>
        @if (s.can('members')) { <button class="btn pri" (click)="f.memberForm()">Sajili mwanachama wa kwanza</button> }</div>
    }
    @for (n of pins(); track n.id) { <div class="banner"><b>{{ n.title }}: </b>{{ n.body }}</div> }
    <div class="kpis">
      <div class="kpi wi lead"><app-icon name="wallet" /><span class="l">Salio la mfuko</span><span class="v">{{ tsh(d().f.bal) }}</span><span class="s">Fedha taslimu zilizopo</span></div>
      <div class="kpi wi"><app-icon name="users" /><span class="l">Wanachama hai</span><span class="v">{{ d().act }}</span><span class="s">Kati ya {{ s.members().length }} waliosajiliwa</span></div>
      <div class="kpi wi"><app-icon name="coins" /><span class="l">Michango ya {{ months[cm - 1] }}</span><span class="v">{{ tsh(d().monthGot) }}</span><span class="s">Inatarajiwa {{ tsh(d().monthExp) }}</span></div>
      <div class="kpi wi"><app-icon name="loan" /><span class="l">Mikopo inayodaiwa</span><span class="v">{{ tsh(d().lo.bal) }}</span><span class="s">Mikopo {{ d().lo.active }} hai</span></div>
    </div>
    <div class="dash">
      <section class="panel"><h2 style="text-align:center;font-size:1.2rem">Muhtasari wa michango {{ Y }}</h2>
        <app-donut [a]="d().yearGot" [b]="d().debt" la="Imelipwa" lb="Deni" /></section>
      <div class="stack">
        <button class="acard" style="--c:var(--acc-green)" (click)="go('kuhaniwa')">
          <span class="circ"><app-icon name="heart" /></span>
          <span style="display:flex;flex-direction:column;min-width:0"><span class="l">Matukio ya kuhaniwa {{ Y }}</span><span class="v">{{ d().evY.length }}</span>
            <span class="s" [class.alert]="d().pend > 0">{{ d().pend ? d().pend + ' yanasubiri malipo' : 'Yote yamelipwa' }}</span></span>
          <span class="side-n">{{ tsh(d().evYSum) }}</span><span class="chev"><app-icon name="chev" /></span>
        </button>
        <button class="acard" style="--c:var(--acc-blue)" (click)="go('michango')">
          <span class="circ"><app-icon name="users" /></span>
          <span style="display:flex;flex-direction:column;min-width:0"><span class="l">Wanachama wenye deni</span><span class="v">{{ d().debtors }}</span><span class="s">Jumla ya deni {{ tsh(d().debt) }}</span></span>
          <span class="side-n"></span><span class="chev"><app-icon name="chev" /></span>
        </button>
        <button class="acard" style="--c:var(--acc-pink)" (click)="go('mikopo')">
          <span class="circ"><app-icon name="alert" /></span>
          <span style="display:flex;flex-direction:column;min-width:0"><span class="l">Mikopo iliyochelewa</span><span class="v">{{ d().lo.late }}</span><span class="s alert">{{ d().lo.late }} inahitaji kufuatiliwa</span></span>
          <span class="side-n">{{ d().lo.late }}</span><span class="chev"><app-icon name="chev" /></span>
        </button>
        <h3 style="margin-top:6px;color:var(--olive);font-size:1.2rem">Malipo ya karibuni</h3>
        <section class="panel" style="padding-block:6px">
          @if (recent().length) {
            <div class="list">@for (p of recent(); track p.id) {
              <div class="it"><div><b>{{ s.mname(p.memberId) }}</b><div class="muted">{{ p.type === 'mwezi' ? months[(p.month || 1) - 1] + ' ' + p.year : payTypes[p.type] }} · {{ fmtD(p.date) }}</div></div>
                <span class="num">{{ tsh(p.amount) }}</span></div>
            }</div>
          } @else { <p class="muted">Hakuna malipo yaliyorekodiwa bado.</p> }
        </section>
      </div>
    </div>
    <section class="panel">
      <header><h2>Michango ya kila mwezi {{ Y }}</h2>
        <div class="legend"><span><i style="background:var(--userbtn)"></i>Iliyokusanywa</span><span><i style="background:var(--pink)"></i>Inayotarajiwa</span></div></header>
      <app-bar-chart [got]="chart().got" [exp]="chart().exp" [year]="Y" />
    </section>
  `,
})
export class DashboardComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  private router = inject(Router);
  Y = new Date().getFullYear();
  cm = new Date().getMonth() + 1;
  today = todayISO();
  months = MONTHS_FULL;
  payTypes = PAY_TYPES;
  fmtD = fmtD;
  tsh = tsh;

  d = computed(() => {
    const ms = this.s.members();
    const act = ms.filter((m) => (m.status || 'Hai') === 'Hai');
    let debt = 0, debtors = 0, monthGot = 0, yearGot = 0;
    for (const m of ms) {
      const r = this.s.memberYear(m, this.Y);
      debt += r.debt;
      if (r.debt > 0) debtors++;
      monthGot += r.paid[this.cm];
      yearGot += r.total;
    }
    const ym = this.Y + '-' + pad(this.cm);
    const monthExp = act.filter((m) => !m.joinDate || m.joinDate.slice(0, 7) <= ym).length * (Number(this.s.settings().monthlyFee) || 0);
    const evs = this.s.events();
    const evY = evs.filter((e) => yearOf(e.date) === this.Y);
    return {
      f: this.s.finance(null), lo: this.s.loansOut(), act: act.length, debt, debtors, monthGot, yearGot, monthExp, evY,
      evYSum: evY.reduce((a, e) => a + (Number(e.amount) || 0), 0), pend: evs.filter((e) => e.status === 'Inasubiri').length,
    };
  });
  pins = computed(() => this.s.notices().filter((n) => n.pinned === 'ndiyo').sort(byDateDesc));
  recent = computed(() =>
    [...this.s.payments()].sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))).slice(0, 6),
  );
  chart = computed(() => {
    const Y = this.Y, fee = Number(this.s.settings().monthlyFee) || 0;
    const got = Array(12).fill(0), exp: (number | null)[] = Array(12).fill(0);
    for (const p of this.s.payments()) if (p.type === 'mwezi' && Number(p.year) === Y) got[(p.month || 1) - 1] += Number(p.amount) || 0;
    for (let i = 1; i <= 12; i++) {
      if (i > this.cm) {
        exp[i - 1] = null;
        continue;
      }
      for (const m of this.s.members()) {
        if ((m.status || 'Hai') !== 'Hai') continue;
        if (m.joinDate) {
          const [jy, jm] = m.joinDate.split('-').map(Number);
          if (jy > Y || (jy === Y && jm > i)) continue;
        }
        exp[i - 1] = (exp[i - 1] || 0) + fee;
      }
    }
    return { got, exp };
  });

  go(v: string) {
    this.router.navigate(['/' + v]);
  }
}
