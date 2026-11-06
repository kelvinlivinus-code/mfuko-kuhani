import { Component, computed, inject } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { LedgerEntry } from '../core/models';
import { Finance, StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { byDateDesc, fmtD, tsh } from '../core/util';
import { YearSegComponent } from '../shared/year-seg.component';

type Line = { sec?: string; l?: string; k?: keyof Finance; strong?: boolean };

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [YearSegComponent],
  template: `
    <div class="head">
      <div><h1>Hesabu za mfuko</h1><p>Muhtasari wa mapato, matumizi na salio</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.ledgerForm()">Ingiza mapato / matumizi</button></div> }
    </div>
    <div class="row"><app-year-seg /></div>
    <div class="kpis">
      <div class="kpi lead"><span class="l">Salio la mfuko</span><span class="v">{{ tsh(t().bal) }}</span><span class="s">Fedha taslimu</span></div>
      <div class="kpi"><span class="l">Mikopo nje</span><span class="v">{{ tsh(lo().bal) }}</span><span class="s">Fedha zilizo kwa wakopaji</span></div>
      <div class="kpi"><span class="l">Thamani ya mfuko</span><span class="v">{{ tsh(t().bal + lo().bal) }}</span><span class="s">Salio pamoja na madeni ya mikopo</span></div>
    </div>
    <section class="panel"><div class="scroll"><table>
      <thead><tr><th>Kipengele</th><th class="r">Mwaka {{ s.year() }}</th><th class="r">Tangu mwanzo</th></tr></thead>
      <tbody>
        @for (x of rows; track $index) {
          @if (x.sec) { <tr><td colspan="3" style="padding-top:16px;font:600 1rem var(--display);letter-spacing:.06em;color:var(--brass)">{{ x.sec }}</td></tr> }
          @else {
            <tr><td>@if (x.strong) {<b>{{ x.l }}</b>} @else {{{ x.l }}}</td><td class="r num">{{ tsh(a()[x.k!]) }}</td>
              <td class="r num">@if (x.strong) {<b>{{ tsh(t()[x.k!]) }}</b>} @else {{{ tsh(t()[x.k!]) }}}</td></tr>
          }
        }
      </tbody>
    </table></div></section>
    <section class="panel"><h2>Mapato na matumizi mengine</h2>
      @if (led().length) {
        <div class="scroll"><table>
          <thead><tr><th>Tarehe</th><th>Aina</th><th>Kundi</th><th>Maelezo</th><th class="r">Kiasi</th>@if (w()) { <th></th> }</tr></thead>
          <tbody>@for (x of led(); track x.id) {
            <tr><td>{{ fmtD(x.date) }}</td><td>@if (x.dir === 'in') { <span class="pill ok">Mapato</span> } @else { <span class="pill warn">Matumizi</span> }</td>
              <td>{{ x.category || '' }}</td><td>{{ x.note || '' }}</td><td class="r num">{{ tsh(x.amount) }}</td>
              @if (w()) { <td class="r"><button class="btn sm" (click)="f.ledgerForm(x)">Hariri</button> <button class="btn sm danger" (click)="del(x)">Futa</button></td> }</tr>
          }</tbody>
        </table></div>
      } @else { <p class="muted">Matumizi ya uendeshaji (vifaa, usafiri, ada za benki) na mapato yasiyo ya michango yanaandikwa hapa.</p> }
    </section>
  `,
})
export class AccountsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  fmtD = fmtD;
  tsh = tsh;
  w = () => this.s.can('ledger');
  a = computed(() => this.s.finance(this.s.year()));
  t = computed(() => this.s.finance(null));
  lo = computed(() => this.s.loansOut());
  led = computed(() => [...this.s.ledger()].sort(byDateDesc));
  rows: Line[] = [
    { sec: 'MAPATO' }, { l: 'Salio la kuanzia', k: 'opening' }, { l: 'Ada za kiingilio', k: 'kiingilio' }, { l: 'Michango ya kila mwezi', k: 'mwezi' },
    { l: 'Michango maalum, faini na mengine', k: 'mengine' }, { l: 'Marejesho ya mikopo', k: 'marejesho' }, { l: 'Mapato ya miradi', k: 'mradiMapato' },
    { l: 'Mapato mengine', k: 'ledgerIn' }, { l: 'Jumla ya mapato', k: 'in', strong: true },
    { sec: 'MATUMIZI' }, { l: 'Misaada ya misiba na dharura', k: 'misaada' }, { l: 'Mikopo iliyotolewa', k: 'mikopo' },
    { l: 'Uwekezaji na matumizi ya miradi', k: 'mradiUwekezaji' }, { l: 'Matumizi mengine', k: 'ledgerOut' }, { l: 'Jumla ya matumizi', k: 'out', strong: true },
    { sec: 'SALIO' }, { l: 'Mapato kuondoa matumizi', k: 'bal', strong: true },
  ];
  del(x: LedgerEntry) {
    this.ui.confirm('Futa kumbukumbu hii?', 'Futa', () => this.s.remove('ledger', x.id));
  }
}
