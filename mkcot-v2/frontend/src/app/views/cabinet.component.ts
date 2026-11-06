import { Component, computed, inject } from '@angular/core';
import { POSITIONS } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { CabinetMember } from '../core/models';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { fmtD } from '../core/util';

@Component({
  selector: 'app-cabinet',
  standalone: true,
  template: `
    <div class="head">
      <div><h1>Uongozi (Cabinet)</h1><p>Viongozi wa mfuko walio madarakani na waliotangulia</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.cabinetForm()">Ongeza kiongozi</button></div> }
    </div>
    @if (!all().length) {
      <div class="empty"><span>Orodha ya uongozi bado haijajazwa.</span>@if (w()) { <button class="btn pri" (click)="f.cabinetForm()">Ongeza kiongozi</button> }</div>
    } @else {
      <section class="panel"><h2>Walio madarakani</h2>
        @if (cur().length) { <ng-container *ngTemplateOutlet="tbl; context: { $implicit: cur() }" /> } @else { <p class="muted">Hakuna.</p> }
      </section>
      @if (past().length) { <section class="panel"><h2>Viongozi waliotangulia</h2><ng-container *ngTemplateOutlet="tbl; context: { $implicit: past() }" /></section> }
    }
    <ng-template #tbl let-rows>
      <div class="scroll"><table>
        <thead><tr><th>Nafasi</th><th>Jina</th><th>Simu</th><th>Kipindi</th><th>Majukumu</th>@if (w()) { <th></th> }</tr></thead>
        <tbody>@for (c of rows; track c.id) {
          <tr><td><span class="pill brass">{{ c.position }}</span></td><td><b>{{ nm(c) }}</b></td><td class="num">{{ ph(c) }}</td>
            <td>{{ fmtD(c.termStart) }} – {{ c.termEnd ? fmtD(c.termEnd) : 'sasa' }}</td><td>{{ c.duties || '' }}</td>
            @if (w()) { <td class="r"><button class="btn sm" (click)="f.cabinetForm(c)">Hariri</button> <button class="btn sm danger" (click)="del(c)">Ondoa</button></td> }</tr>
        }</tbody>
      </table></div>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class CabinetComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  fmtD = fmtD;
  w = () => this.s.can('cabinet');
  private idx = (p?: string) => {
    const i = POSITIONS.indexOf(p || '');
    return i < 0 ? 99 : i;
  };
  all = computed(() => [...this.s.cabinet()].sort((a, b) => this.idx(a.position) - this.idx(b.position)));
  cur = computed(() => this.all().filter((c) => c.status !== 'Amemaliza muda'));
  past = computed(() =>
    this.all().filter((c) => c.status === 'Amemaliza muda').sort((a, b) => String(b.termEnd || '').localeCompare(String(a.termEnd || ''))),
  );
  nm = (c: CabinetMember) => (c.memberId ? this.s.mname(c.memberId) : c.name);
  ph = (c: CabinetMember) => c.phone || (c.memberId && this.s.mem(c.memberId)?.phone) || '';
  del(c: CabinetMember) {
    this.ui.confirm(`Ondoa ${this.nm(c)} (${c.position}) kwenye orodha ya uongozi?`, 'Ondoa', () => this.s.remove('cabinet', c.id));
  }
}
import { NgTemplateOutlet } from '@angular/common';
