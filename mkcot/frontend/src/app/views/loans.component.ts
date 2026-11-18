import { Component, computed, inject } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { byDateDesc, fmtD, loanCls, tsh } from '../core/util';

@Component({
  selector: 'app-loans',
  standalone: true,
  template: `
    <div class="head">
      <div><h1>Mikopo</h1><p>Mikopo kwa wanachama tu, na marejesho yake</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.loanForm()">Toa mkopo</button></div> }
    </div>
    <div class="kpis">
      <div class="kpi lead"><span class="l">Salio linalodaiwa</span><span class="v">{{ tsh(lo().bal) }}</span><span class="s">Mikopo {{ lo().active }} bado inaendelea</span></div>
      <div class="kpi"><span class="l">Mikopo iliyotolewa</span><span class="v">{{ tsh(given()) }}</span><span class="s">Mikopo {{ rows().length }} kwa jumla</span></div>
      <div class="kpi"><span class="l">Iliyochelewa</span><span class="v" [style.color]="lo().late ? 'var(--bad)' : null">{{ lo().late }}</span><span class="s">Imepita tarehe ya mwisho</span></div>
    </div>
    @if (!rows().length) {
      <div class="empty"><span>Hakuna mkopo uliotolewa bado.</span>@if (w()) { <button class="btn pri" (click)="f.loanForm()">Toa mkopo wa kwanza</button> }</div>
    } @else {
      <section class="panel"><div class="scroll"><table>
        <thead><tr><th>Namba</th><th>Mwanachama</th><th>Tarehe</th><th class="r">Mkopo</th><th class="r">Kurejesha</th><th class="r">Amerejesha</th><th class="r">Salio</th><th>Mwisho</th><th>Hali</th></tr></thead>
        <tbody>@for (x of rows(); track x.l.id) {
          <tr class="click" tabindex="0" (click)="f.loanDetail(x.l.id)" (keydown.enter)="f.loanDetail(x.l.id)">
            <td class="num">{{ x.l.no }}</td><td><b>{{ s.mname(x.l.memberId) }}</b></td><td>{{ fmtD(x.l.date) }}</td><td class="r num">{{ tsh(x.l.principal) }}</td>
            <td class="r num">{{ tsh(x.c.total) }}</td><td class="r num">{{ tsh(x.c.paid) }}</td><td class="r num">{{ tsh(x.c.bal) }}</td><td>{{ fmtD(x.c.due) }}</td>
            <td><span [class]="'pill ' + loanCls(x.c.status)">{{ x.c.status }}</span></td></tr>
        }</tbody>
      </table></div></section>
    }
  `,
})
export class LoansComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  fmtD = fmtD; tsh = tsh; loanCls = loanCls;
  w = () => this.s.can('loans');
  lo = computed(() => this.s.loansOut());
  rows = computed(() => [...this.s.loans()].sort(byDateDesc).map((l) => ({ l, c: this.s.loanCalc(l) })));
  given = computed(() => this.s.loans().reduce((a, l) => a + (Number(l.principal) || 0), 0));
}
