import { Component, computed, inject, input } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { byDateDesc, fmtD, lines, loanCls, projCls, tsh } from '../core/util';

/** Orodha ya "kichwa: thamani" (kama kv ya toleo la awali). */
@Component({
  selector: 'app-kv',
  standalone: true,
  template: `<dl class="kv">@for (p of pairs(); track $index) { <div><dt>{{ p[0] }}</dt><dd>{{ p[1] === '' || p[1] == null ? '—' : p[1] }}</dd></div> }</dl>`,
})
export class KvComponent {
  pairs = input.required<[string, unknown][]>();
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [KvComponent],
  template: `
    @if (e(); as e) {
      <div class="body">
        <app-kv [pairs]="[['Tarehe', fmtD(e.date)], ['Muhusika', (e.relation || '') + (e.person ? ' — ' + e.person : '')], ['Mahali', e.place], ['Kiasi', tsh(e.amount)],
          ['Hali', e.status || 'Imelipwa'], ['Tarehe ya kulipwa', fmtD(e.payDate)], ['Aliyeidhinisha', e.approvedBy], ['Risiti', e.receipt]]" />
        @if (e.description) { <p class="prose">{{ e.description }}</p> }
      </div>
      <footer>
        @if (s.can('events')) {
          <button class="btn danger" (click)="ui.confirm('Futa tukio hili la kuhaniwa? Kiasi chake kitaondolewa kwenye hesabu.', 'Futa tukio', del)">Futa</button>
          <button class="btn" (click)="f.eventForm(e)">Hariri</button>
        } @else { <button class="btn" (click)="ui.close()">Funga</button> }
      </footer>
    }
  `,
})
export class EventDetailComponent {
  s = inject(StoreService); ui = inject(UiService); f = inject(FormsService);
  id = input.required<string>();
  e = computed(() => this.s.events().find((x) => x.id === this.id()));
  fmtD = fmtD; tsh = tsh;
  del = () => this.s.remove('events', this.id());
}

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [KvComponent],
  template: `
    @if (l(); as l) {
      <div class="body">
        <div class="row"><span class="pill" [class]="'pill ' + loanCls(c().status)">{{ c().status }}</span></div>
        <app-kv [pairs]="[['Tarehe ya kutolewa', fmtD(l.date)], ['Kiasi cha mkopo', tsh(l.principal)], ['Riba', s.loanRate(l) + '%'], ['Muda', (l.months || '—') + ' miezi'],
          ['Jumla ya kurejesha', tsh(c().total)], ['Rejesho kwa mwezi', tsh(c().monthly)], ['Kilichorejeshwa', tsh(c().paid)], ['Salio linalodaiwa', tsh(c().bal)],
          ['Tarehe ya mwisho', fmtD(c().due)], ['Mdhamini', l.guarantor], ['Madhumuni', l.purpose]]" />
        @if (l.note) { <p class="prose">{{ l.note }}</p> }
        <h3>Marejesho</h3>
        @if (reps().length) {
          <div class="scroll"><table>
            <thead><tr><th>Tarehe</th><th class="r">Kiasi</th><th>Risiti</th><th>Maelezo</th>@if (w()) { <th></th> }</tr></thead>
            <tbody>@for (r of reps(); track r.i) {
              <tr><td>{{ fmtD(r.date) }}</td><td class="r num">{{ tsh(r.amount) }}</td><td>{{ r.receipt || '—' }}</td><td>{{ r.note || '' }}</td>
                @if (w()) { <td><button class="btn sm danger" (click)="removeRep(r.i, r.amount, r.date)">Ondoa</button></td> }</tr>
            }</tbody>
          </table></div>
        } @else { <p class="muted">Hakuna rejesho lililorekodiwa bado.</p> }
      </div>
      <footer>
        @if (w()) {
          <button class="btn danger" (click)="ui.confirm('Futa mkopo ' + l.no + ' pamoja na marejesho yake yote?', 'Futa mkopo', del)">Futa</button>
          <button class="btn" (click)="f.loanForm(l)">Hariri</button>
          @if (c().bal > 0) { <button class="btn pri" (click)="f.repayForm(l)">Rekodi rejesho</button> }
        } @else { <button class="btn" (click)="ui.close()">Funga</button> }
      </footer>
    }
  `,
})
export class LoanDetailComponent {
  s = inject(StoreService); ui = inject(UiService); f = inject(FormsService);
  id = input.required<string>();
  l = computed(() => this.s.loans().find((x) => x.id === this.id()));
  c = computed(() => this.s.loanCalc(this.l()!));
  reps = computed(() => (this.l()?.repayments || []).map((r, i) => ({ ...r, i })).sort(byDateDesc));
  w = () => this.s.can('loans');
  fmtD = fmtD; tsh = tsh; loanCls = loanCls;
  del = () => this.s.remove('loans', this.id());
  removeRep(i: number, amount: number, date?: string) {
    this.ui.confirm(`Ondoa rejesho la ${tsh(amount)} la ${fmtD(date)}?`, 'Ondoa', async () => {
      const arr = [...(this.l()?.repayments || [])];
      arr.splice(i, 1);
      const ok = await this.s.save('loans', this.id(), { repayments: arr });
      if (ok) setTimeout(() => this.f.loanDetail(this.id()), 50);
      return false;
    });
  }
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [KvComponent],
  template: `
    @if (p(); as p) {
      <div class="body">
        <div class="row"><span [class]="'pill ' + projCls(p.status)">{{ p.status || 'Wazo' }}</span></div>
        <app-kv [pairs]="[['Tarehe ya kuanza', fmtD(p.startDate)], ['Msimamizi', p.lead], ['Bajeti', p.budget == null ? '—' : tsh(p.budget)],
          ['Uwekezaji', tsh(c().inv)], ['Mapato', tsh(c().inc)], ['Matumizi', tsh(c().exp)], ['Faida / hasara', tsh(c().net)]]" />
        @if (p.description) { <p class="prose">{{ p.description }}</p> }
        <h3>Mwenendo wa fedha</h3>
        @if (ents().length) {
          <div class="scroll"><table>
            <thead><tr><th>Tarehe</th><th>Aina</th><th class="r">Kiasi</th><th>Maelezo</th>@if (w()) { <th></th> }</tr></thead>
            <tbody>@for (e of ents(); track e.i) {
              <tr><td>{{ fmtD(e.date) }}</td><td>{{ lab[e.kind] || e.kind }}</td><td class="r num">{{ tsh(e.amount) }}</td><td>{{ e.note || '' }}</td>
                @if (w()) { <td><button class="btn sm danger" (click)="removeEntry(e.i)">Ondoa</button></td> }</tr>
            }</tbody>
          </table></div>
        } @else { <p class="muted">Hakuna fedha zilizorekodiwa kwa mradi huu bado.</p> }
      </div>
      <footer>
        @if (w()) {
          <button class="btn danger" (click)="ui.confirm('Futa mradi &quot;' + p.name + '&quot;?', 'Futa mradi', del)">Futa</button>
          <button class="btn" (click)="f.projectForm(p)">Hariri</button>
          <button class="btn pri" (click)="f.projEntryForm(p)">Ingiza fedha</button>
        } @else { <button class="btn" (click)="ui.close()">Funga</button> }
      </footer>
    }
  `,
})
export class ProjectDetailComponent {
  s = inject(StoreService); ui = inject(UiService); f = inject(FormsService);
  id = input.required<string>();
  p = computed(() => this.s.projects().find((x) => x.id === this.id()));
  c = computed(() => this.s.projCalc(this.p()!));
  ents = computed(() => (this.p()?.entries || []).map((e, i) => ({ ...e, i })).sort(byDateDesc));
  lab: Record<string, string> = { uwekezaji: 'Uwekezaji', mapato: 'Mapato', matumizi: 'Matumizi' };
  w = () => this.s.can('projects');
  fmtD = fmtD; tsh = tsh; projCls = projCls;
  del = () => this.s.remove('projects', this.id());
  removeEntry(i: number) {
    this.ui.confirm('Ondoa kumbukumbu hii ya mradi?', 'Ondoa', async () => {
      const arr = [...(this.p()?.entries || [])];
      arr.splice(i, 1);
      const ok = await this.s.save('projects', this.id(), { entries: arr });
      if (ok) setTimeout(() => this.f.projectDetail(this.id()), 50);
      return false;
    });
  }
}

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [KvComponent],
  template: `
    @if (m(); as m) {
      <div class="body">
        <app-kv [pairs]="[['Aina', m.kind], ['Tarehe', fmtD(m.date)], ['Mahali', m.venue], ['Mwenyekiti', m.chair], ['Katibu', m.secretary],
          ['Wahudhuriaji', '' + att().length], ['Kikao kijacho', fmtD(m.nextDate)]]" />
        @if (lines(m.agenda).length) { <h3>Ajenda</h3><ol style="margin:0;padding-left:22px">@for (x of lines(m.agenda); track $index) { <li>{{ x }}</li> }</ol> }
        @if (lines(m.resolutions).length) { <h3>Maazimio</h3><ol style="margin:0;padding-left:22px">@for (x of lines(m.resolutions); track $index) { <li>{{ x }}</li> }</ol> }
        @if (m.minutes) { <h3>Muhtasari</h3><p class="prose">{{ m.minutes }}</p> }
        @if (att().length) { <h3>Waliohudhuria</h3><p style="margin:0">{{ att().join(', ') }}</p> }
      </div>
      <footer>
        @if (s.can('meetings')) {
          <button class="btn danger" (click)="ui.confirm('Futa kumbukumbu za kikao hiki?', 'Futa kikao', del)">Futa</button>
          <button class="btn" (click)="f.meetingForm(m)">Hariri</button>
        } @else { <button class="btn" (click)="ui.close()">Funga</button> }
      </footer>
    }
  `,
})
export class MeetingDetailComponent {
  s = inject(StoreService); ui = inject(UiService); f = inject(FormsService);
  id = input.required<string>();
  m = computed(() => this.s.meetings().find((x) => x.id === this.id()));
  att = computed(() => (this.m()?.attendees || []).map((a) => this.s.mname(a)).sort());
  fmtD = fmtD; lines = lines;
  del = () => this.s.remove('meetings', this.id());
}
