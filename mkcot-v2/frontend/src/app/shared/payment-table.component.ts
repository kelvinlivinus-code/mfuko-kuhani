import { Component, inject, input } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { Payment } from '../core/models';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { fmtD, tsh } from '../core/util';

@Component({
  selector: 'app-payment-table',
  standalone: true,
  template: `<div class="scroll"><table>
    <thead><tr><th>Tarehe</th>@if (withMember()) { <th>Mwanachama</th> }<th>Aina</th><th class="r">Kiasi</th><th>Risiti</th>@if (canWrite()) { <th></th> }</tr></thead>
    <tbody>@for (p of rows(); track p.id) {
      <tr><td>{{ fmtD(p.date) }}</td>@if (withMember()) { <td>{{ s.mname(p.memberId) }}</td> }<td>{{ f.payLabel(p) }}</td>
        <td class="r num">{{ tsh(p.amount) }}</td><td>{{ p.receipt || '—' }}</td>
        @if (canWrite()) { <td class="r"><button class="btn sm danger" (click)="del(p)">Futa</button></td> }</tr>
    }</tbody>
  </table></div>`,
})
export class PaymentTableComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  rows = input.required<Payment[]>();
  withMember = input(false);
  canWrite = input(false);
  fmtD = fmtD;
  tsh = tsh;
  del(p: Payment) {
    this.ui.confirm(`Futa malipo ya ${tsh(p.amount)} (${this.f.payLabel(p)}) ya ${this.s.mname(p.memberId)}?`, 'Futa malipo', () => this.s.remove('payments', p.id));
  }
}
