import { Component, computed, inject } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { StoreService } from '../core/store.service';
import { byDateDesc, fmtD, lines } from '../core/util';

@Component({
  selector: 'app-meetings',
  standalone: true,
  template: `
    <div class="head">
      <div><h1>Vikao na mikutano</h1><p>Kumbukumbu za vikao, wahudhuriaji na maazimio</p></div>
      @if (w()) { <div class="row"><button class="btn pri" (click)="f.meetingForm()">Rekodi kikao</button></div> }
    </div>
    @if (!rows().length) {
      <div class="empty"><span>Hakuna kikao kilichorekodiwa bado.</span>@if (w()) { <button class="btn pri" (click)="f.meetingForm()">Rekodi kikao</button> }</div>
    } @else {
      <div class="cards">@for (x of rows(); track x.m.id) {
        <button class="card" (click)="f.meetingDetail(x.m.id)">
          <div class="meta"><span>{{ x.m.kind }}</span><span>{{ fmtD(x.m.date) }}</span></div>
          <h3>{{ x.m.title || x.m.kind }}</h3>
          <span class="muted">{{ (x.m.attendees || []).length }} walihudhuria{{ x.m.venue ? ' · ' + x.m.venue : '' }}</span>
          @if (x.res.length) { <span>Maazimio {{ x.res.length }}: {{ x.res[0] }}{{ x.res.length > 1 ? '…' : '' }}</span> }
        </button>
      }</div>
    }
  `,
})
export class MeetingsComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  fmtD = fmtD;
  w = () => this.s.can('meetings');
  rows = computed(() => [...this.s.meetings()].sort(byDateDesc).map((m) => ({ m, res: lines(m.resolutions) })));
}
