import { Component, computed, inject } from '@angular/core';
import { MONTHS, MONTHS_FULL } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { byDateDesc, short, tsh, yearOf } from '../core/util';
import { PaymentTableComponent } from '../shared/payment-table.component';
import { YearSegComponent } from '../shared/year-seg.component';

@Component({
  selector: 'app-contributions',
  standalone: true,
  imports: [YearSegComponent, PaymentTableComponent],
  template: `
    <div class="head">
      <div><h1>Michango</h1><p>Mchango wa mwezi ni {{ tsh(s.settings().monthlyFee) }} · ada ya kiingilio {{ tsh(s.settings().entryFee) }}</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.paymentForm({ year: s.year() })">Rekodi malipo</button></div> }
    </div>
    <div class="row"><app-year-seg /><span class="muted">Imekusanywa {{ tsh(g().tot) }} · madeni {{ tsh(g().debt) }}</span></div>
    @if (!g().rows.length) {
      <div class="empty"><span>Sajili wanachama kwanza; majina yao yataonekana hapa kwa kila mwezi.</span>
        @if (s.can('members')) { <button class="btn pri" (click)="f.memberForm()">Sajili mwanachama</button> }</div>
    } @else {
      <section class="panel">
        <p class="muted" style="margin:0">{{ w() ? 'Bofya kisanduku cha mwezi ambao haujalipwa ili kurekodi mchango wake.' : 'Kijani = amelipa · Njano = deni' }}</p>
        <div class="scroll"><table class="cgrid">
          <thead><tr><th>Mwanachama</th>@for (m of months; track $index) { <th>{{ m }}</th> }<th class="r">Jumla</th><th class="r">Deni</th></tr></thead>
          <tbody>
            @for (row of g().rows; track row.m.id) {
              <tr><td><b>{{ row.m.name }}</b><div class="muted" style="font-size:.8rem">{{ row.m.no || '' }}</div></td>
                @for (c of row.cells; track $index; let i = $index) {
                  <td>@if (w() && !c.paid) {
                      <button [class]="'cell ' + c.cls + ' can'" [title]="'Rekodi ' + full[i] + ' ' + s.year() + ' kwa ' + row.m.name" (click)="f.paymentForm({ memberId: row.m.id, months: [i + 1], year: s.year() })">{{ c.lbl }}</button>
                    } @else { <span [class]="'cell ' + c.cls" [title]="c.paid ? tsh(c.amt) : ''">{{ c.lbl }}</span> }</td>
                }
                <td class="r num">{{ tsh(row.r.total) }}</td><td class="r num" [style.color]="row.r.debt ? 'var(--warn)' : null">{{ row.r.debt ? tsh(row.r.debt) : '—' }}</td></tr>
            }
          </tbody>
          <tfoot><tr><td>Jumla</td>@for (t of g().colTot; track $index) { <td class="num" style="font-size:.8rem">{{ short(t) }}</td> }
            <td class="r num">{{ tsh(g().tot) }}</td><td class="r num">{{ tsh(g().debt) }}</td></tr></tfoot>
        </table></div>
      </section>
    }
    <section class="panel"><header><h2>Ada na michango mingine {{ s.year() }}</h2></header>
      @if (other().length) { <app-payment-table [rows]="other()" [withMember]="true" [canWrite]="w()" /> }
      @else { <p class="muted">Hakuna ada ya kiingilio, faini au mchango maalum uliorekodiwa mwaka huu.</p> }
    </section>
  `,
})
export class ContributionsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  months = MONTHS;
  full = MONTHS_FULL;
  tsh = tsh;
  short = short;
  w = () => this.s.can('payments');
  g = computed(() => {
    const Y = this.s.year();
    const colTot = Array(12).fill(0);
    let tot = 0, debt = 0;
    const rows = this.s
      .members()
      .map((m) => ({ m, r: this.s.memberYear(m, Y) }))
      .filter((x) => x.r.active || x.r.total > 0)
      .sort((a, b) => a.m.name.localeCompare(b.m.name))
      .map(({ m, r }) => {
        tot += r.total;
        debt += r.debt;
        const cells = MONTHS.map((_, i) => {
          const n = i + 1;
          colTot[i] += r.paid[n];
          const paid = r.paid[n] > 0, due = r.active && n >= r.first && n <= r.last;
          return { paid, amt: r.paid[n], cls: paid ? 'paid' : due ? 'due' : 'na', lbl: paid ? short(r.paid[n]) : due ? 'deni' : '·' };
        });
        return { m, r, cells };
      });
    return { rows, colTot, tot, debt };
  });
  other = computed(() => this.s.payments().filter((p) => p.type !== 'mwezi' && yearOf(p.date) === this.s.year()).sort(byDateDesc));
}
