import { Component, computed, inject } from '@angular/core';
import { FormsService } from '../core/forms.service';
import { Notice } from '../core/models';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { byDateDesc, fmtD, lines } from '../core/util';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="head">
      <div><h1>Taarifa za mfuko</h1><p>Utangulizi, historia, kanuni na matangazo</p></div>
      @if (s.can('about') || w()) {
        <div class="row">
          @if (s.can('about')) { <button class="btn" (click)="f.aboutForm()">Hariri utangulizi na historia</button> }
          @if (w()) { <button class="btn pri" (click)="f.noticeForm()">Toa taarifa</button> }
        </div>
      }
    </div>
    @if (!a().intro && !a().history && !a().goals && !a().rules) {
      <div class="empty"><span>Utangulizi na historia ya mfuko bado haijaandikwa.</span>@if (s.can('about')) { <button class="btn pri" (click)="f.aboutForm()">Andika utangulizi</button> }</div>
    }
    @for (b of blocks(); track b.t) {
      @if (b.txt) {
        <section class="panel"><h2>{{ b.t }}</h2>
          @if (b.list) { <ol style="margin:0;padding-left:22px;max-width:68ch">@for (x of lines(b.txt); track $index) { <li>{{ x }}</li> }</ol> }
          @else { <p class="prose">{{ b.txt }}</p> }
        </section>
      }
    }
    <section class="panel"><h2>Matangazo kwa wanachama</h2>
      @if (ns().length) {
        <div class="list">@for (n of ns(); track n.id) {
          <div class="it"><div style="min-width:0">
              <div class="row" style="gap:8px"><b>{{ n.title }}</b>@if (n.pinned === 'ndiyo') { <span class="pill brass">Imebandikwa</span> }<span class="muted">{{ fmtD(n.date) }}</span></div>
              <p class="prose" style="margin-top:4px">{{ n.body }}</p></div>
            @if (w()) { <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><button class="btn sm" (click)="f.noticeForm(n)">Hariri</button><button class="btn sm danger" (click)="del(n)">Futa</button></div> }
          </div>
        }</div>
      } @else { <p class="muted">Hakuna tangazo kwa sasa.</p> }
    </section>
  `,
})
export class AboutComponent {
  s = inject(StoreService);
  f = inject(FormsService);
  ui = inject(UiService);
  fmtD = fmtD;
  lines = lines;
  w = () => this.s.can('notices');
  a = this.s.about;
  blocks = computed(() => {
    const a = this.a();
    return [
      { t: 'Utangulizi', txt: a.intro }, { t: 'Historia ya mfuko', txt: a.history }, { t: 'Malengo', txt: a.goals, list: true },
      { t: 'Kanuni na taratibu', txt: a.rules, list: true }, { t: 'Mawasiliano', txt: a.contact },
    ];
  });
  ns = computed(() => [...this.s.notices()].sort((x, y) => Number(y.pinned === 'ndiyo') - Number(x.pinned === 'ndiyo') || byDateDesc(x, y)));
  del(n: Notice) {
    this.ui.confirm(`Futa taarifa "${n.title}"?`, 'Futa', () => this.s.remove('notices', n.id));
  }
}
