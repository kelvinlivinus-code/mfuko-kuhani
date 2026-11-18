import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { STATUS } from '../core/constants';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { statusCls, tsh } from '../core/util';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="head">
      <div><h1>Wanachama</h1><p>Wanachama {{ s.members().length }} waliosajiliwa</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.memberForm()">Sajili mwanachama</button></div> }
    </div>
    <div class="row">
      <input id="q" class="search" type="search" placeholder="Tafuta kwa jina, namba, kikosi au simu" [ngModel]="q()" (ngModelChange)="q.set($event)" />
      <select id="fstatus" class="search" style="min-width:0" aria-label="Chuja kwa hali" [ngModel]="fs()" (ngModelChange)="fs.set($event)">
        <option value="">Hali zote</option>@for (x of statuses; track x) { <option [value]="x">{{ x }}</option> }
      </select>
    </div>
    @if (!s.members().length) {
      <div class="empty"><span>Hakuna mwanachama bado. Sajili wa kwanza ili kuanza kufuatilia michango.</span>
        @if (w()) { <button class="btn pri" (click)="f.memberForm()">Sajili mwanachama</button> }</div>
    } @else if (!rows().length) {
      <p class="muted">Hakuna mwanachama anayelingana na utafutaji huu.</p>
    } @else {
      <div class="panel"><div class="scroll"><table>
        <thead><tr><th>Namba</th><th>Cheo</th><th>Jina kamili</th><th>Kikosi / Idara</th><th>Simu</th><th>Kiingilio</th><th>Hali</th><th class="r">Deni {{ Y }}</th></tr></thead>
        <tbody>
          @for (r of rows(); track r.m.id) {
            <tr class="click" tabindex="0" (click)="open(r.m.id)" (keydown.enter)="open(r.m.id)">
              <td class="num">{{ r.m.no || '—' }}</td><td>{{ r.m.rank || '' }}</td><td><b>{{ r.m.name }}</b></td><td>{{ r.m.unit || '' }}</td><td class="num">{{ r.m.phone || '' }}</td>
              <td>@if (r.ep >= entryFee()) { <span class="pill ok">Amelipa</span> } @else if (r.ep > 0) { <span class="pill warn">Sehemu</span> } @else { <span class="pill bad">Bado</span> }</td>
              <td><span [class]="'pill ' + statusCls(r.m.status)">{{ r.m.status || 'Hai' }}</span></td>
              <td class="r num">{{ r.debt ? tsh(r.debt) : '—' }}</td>
            </tr>
          }
        </tbody>
      </table></div></div>
    }
  `,
})
export class MembersComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  private router = inject(Router);
  statuses = STATUS;
  Y = new Date().getFullYear();
  q = signal('');
  fs = signal('');
  tsh = tsh;
  statusCls = statusCls;
  w = () => this.s.canWriteView('wanachama');
  entryFee = computed(() => Number(this.s.settings().entryFee) || 0);
  rows = computed(() => {
    const q = this.q().toLowerCase();
    let ms = [...this.s.members()].sort((a, b) => String(a.no || '').localeCompare(String(b.no || ''), undefined, { numeric: true }));
    if (this.fs()) ms = ms.filter((m) => (m.status || 'Hai') === this.fs());
    if (q) ms = ms.filter((m) => [m.name, m.no, m.armyNo, m.unit, m.phone, m.rank].join(' ').toLowerCase().includes(q));
    return ms.map((m) => ({ m, ep: this.s.entryPaid(m.id), debt: this.s.memberYear(m, this.Y).debt }));
  });
  open(id: string) {
    this.router.navigate(['/wanachama', id]);
  }
}
