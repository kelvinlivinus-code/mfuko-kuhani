import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EV_KINDS } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { SupportEvent } from '../core/models';
import { StoreService } from '../core/store.service';
import { byDateDesc, fmtD, tsh } from '../core/util';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="head">
      <div><h1>Matukio ya kuhaniwa</h1><p>Historia ya misiba na changamoto ambazo mfuko umewasaidia wanachama</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.eventForm()">Rekodi tukio</button></div> }
    </div>
    <div class="kpis">
      <div class="kpi lead"><span class="l">Jumla iliyotolewa</span><span class="v">{{ tsh(paid()) }}</span><span class="s">Matukio {{ all().length }} · misiba {{ misiba().length }}</span></div>
      @for (g of groups(); track g.l) { <div class="kpi"><span class="l">Misiba · {{ g.l }}</span><span class="v">{{ g.n }}</span><span class="s">{{ tsh(g.sum) }}</span></div> }
    </div>
    <div class="row">
      <select id="evkind" class="search" style="min-width:0" aria-label="Chuja kwa aina" [ngModel]="kind()" (ngModelChange)="kind.set($event)">
        <option value="">Aina zote za matukio</option>@for (k of kinds; track k) { <option [value]="k">{{ k }}</option> }
      </select>
    </div>
    @if (!all().length) {
      <div class="empty"><span>Hakuna tukio la kuhaniwa lililorekodiwa. Kila msiba au changamoto inayosaidiwa na mfuko iandikwe hapa.</span>
        @if (w()) { <button class="btn pri" (click)="f.eventForm()">Rekodi tukio la kwanza</button> }</div>
    } @else {
      <section class="panel"><div class="scroll"><table>
        <thead><tr><th>Tarehe</th><th>Mwanachama</th><th>Tukio</th><th>Muhusika</th><th class="r">Kiasi</th><th>Hali</th></tr></thead>
        <tbody>@for (e of shown(); track e.id) {
          <tr class="click" tabindex="0" (click)="f.eventDetail(e.id)" (keydown.enter)="f.eventDetail(e.id)">
            <td>{{ fmtD(e.date) }}</td><td><b>{{ s.mname(e.memberId) }}</b></td><td>{{ e.kind }}</td><td>{{ (e.relation || '') + (e.person ? ' — ' + e.person : '') }}</td>
            <td class="r num">{{ tsh(e.amount) }}</td><td><span [class]="'pill ' + (e.status === 'Inasubiri' ? 'warn' : 'ok')">{{ e.status || 'Imelipwa' }}</span></td></tr>
        }</tbody>
      </table></div></section>
    }
  `,
})
export class EventsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  kinds = EV_KINDS;
  kind = signal('');
  fmtD = fmtD;
  tsh = tsh;
  w = () => this.s.can('events');
  all = computed(() => [...this.s.events()].sort(byDateDesc));
  shown = computed(() => (this.kind() ? this.all().filter((e) => e.kind === this.kind()) : this.all()));
  misiba = computed(() => this.all().filter((e) => e.kind === 'Msiba'));
  paid = computed(() => this.all().filter((e) => (e.status || 'Imelipwa') === 'Imelipwa').reduce((a, e) => a + (Number(e.amount) || 0), 0));
  groups = computed(() => {
    const defs: [string, (e: SupportEvent) => boolean][] = [
      ['Watoto', (e) => e.relation === 'Mtoto'],
      ['Mke / Mume', (e) => e.relation === 'Mke' || e.relation === 'Mume'],
      ['Wazazi na wakwe', (e) => /Baba|Mama/.test(e.relation || '')],
      ['Mwanachama mwenyewe', (e) => e.relation === 'Mwanachama mwenyewe'],
    ];
    return defs.map(([l, fn]) => {
      const g = this.misiba().filter(fn);
      return { l, n: g.length, sum: g.reduce((a, e) => a + (Number(e.amount) || 0), 0) };
    });
  });
}
