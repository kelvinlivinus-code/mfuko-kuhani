import { Component, computed, inject } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { fmtD, projCls, tsh } from '../core/util';
import { KvComponent } from '../shared/details';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [KvComponent],
  template: `
    <div class="head">
      <div><h1>Miradi ya mfuko</h1><p>Miradi inayoanzishwa na mfuko, mtaji wake na mapato yake</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.projectForm()">Anzisha mradi</button></div> }
    </div>
    @if (!rows().length) {
      <div class="empty"><span>Hakuna mradi uliorekodiwa. Andika wazo la mradi hata kabla haujaanza, ili lijadiliwe kwenye vikao.</span>
        @if (w()) { <button class="btn pri" (click)="f.projectForm()">Ongeza mradi</button> }</div>
    } @else {
      <div class="cards">@for (x of rows(); track x.p.id) {
        <button class="card" (click)="f.projectDetail(x.p.id)">
          <div class="meta"><span [class]="'pill ' + projCls(x.p.status)">{{ x.p.status || 'Wazo' }}</span><span>{{ fmtD(x.p.startDate) }}</span></div>
          <h3>{{ x.p.name }}</h3>
          @if (x.p.description) { <span class="muted" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">{{ x.p.description }}</span> }
          <app-kv [pairs]="[['Uwekezaji', tsh(x.c.inv)], ['Mapato', tsh(x.c.inc)], ['Faida / hasara', tsh(x.c.net)]]" />
        </button>
      }</div>
    }
  `,
})
export class ProjectsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  fmtD = fmtD; tsh = tsh; projCls = projCls;
  w = () => this.s.can('projects');
  rows = computed(() =>
    [...this.s.projects()]
      .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')))
      .map((p) => ({ p, c: this.s.projCalc(p) })),
  );
}
