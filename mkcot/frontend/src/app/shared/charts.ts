import { Component, computed, input } from '@angular/core';
import { MONTHS, MONTHS_FULL } from '../core/constants';
import { short, tsh } from '../core/util';

/** Pete ya asilimia ya michango iliyolipwa dhidi ya deni. */
@Component({
  selector: 'app-donut',
  standalone: true,
  template: `
    <div class="donut">
      <svg viewBox="0 0 220 220" role="img" [attr.aria-label]="la() + ' ' + pct() + '%'">
        <circle class="ring-bg" cx="110" cy="110" [attr.r]="R" fill="none" stroke-width="34" />
        @if (tot()) {
          <circle class="seg-b" cx="110" cy="110" [attr.r]="R" fill="none" stroke-width="34" [attr.stroke-dasharray]="C + ' ' + C" transform="rotate(-90 110 110)" />
          <circle class="seg-a" cx="110" cy="110" [attr.r]="R" fill="none" stroke-width="34" [attr.stroke-dasharray]="C * fa() + ' ' + C" transform="rotate(-90 110 110)" />
        }
        <text x="110" y="108" text-anchor="middle" font-size="30" font-weight="700">{{ tot() ? pct() + '%' : '—' }}</text>
        <text class="sub" x="110" y="132" text-anchor="middle" font-size="13">{{ tot() ? 'imelipwa' : 'hakuna data' }}</text>
      </svg>
      <div class="legend">
        <span><i style="background:var(--pink)"></i>{{ la() }}: {{ tsh(a()) }}</span>
        <span><i style="background:var(--acc-blue)"></i>{{ lb() }}: {{ tsh(b()) }}</span>
      </div>
    </div>
  `,
})
export class DonutComponent {
  a = input(0);
  b = input(0);
  la = input('');
  lb = input('');
  R = 80;
  C = 2 * Math.PI * 80;
  tsh = tsh;
  tot = computed(() => this.a() + this.b());
  fa = computed(() => (this.tot() ? this.a() / this.tot() : 0));
  pct = computed(() => (this.tot() ? Math.round(this.fa() * 100) : 0));
}

/** Michango iliyokusanywa kila mwezi (nguzo) na inayotarajiwa (mstari). */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <svg class="chart" [attr.viewBox]="'0 0 ' + W + ' ' + H" width="100%" role="img" [attr.aria-label]="'Michango ya kila mwezi ' + year()">
      @for (t of ticks(); track $index) {
        <line class="grid" [attr.x1]="L" [attr.x2]="W - 8" [attr.y1]="y(t)" [attr.y2]="y(t)" />
        <text [attr.x]="L - 6" [attr.y]="y(t) + 4" text-anchor="end">{{ short(t) }}</text>
      }
      @for (v of got(); track $index; let i = $index) {
        <rect class="bar" [attr.x]="L + i * cw + cw * 0.18" [attr.y]="y(v)" [attr.width]="cw * 0.64" [attr.height]="bh(v)" rx="3"><title>{{ full[i] }}: {{ tsh(v) }}</title></rect>
        <text [attr.x]="L + i * cw + cw / 2" [attr.y]="H - 8" text-anchor="middle">{{ months[i] }}</text>
      }
      @if (points()) { <polyline class="exp" [attr.points]="points()" /> }
    </svg>
  `,
})
export class BarChartComponent {
  got = input<number[]>([]);
  exp = input<(number | null)[]>([]);
  year = input(0);
  W = 720; H = 230; L = 48; B = 26; T = 10;
  cw = (720 - 48 - 8) / 12;
  months = MONTHS;
  full = MONTHS_FULL;
  short = short;
  tsh = tsh;
  top = computed(() => {
    const mx = Math.max(1, ...this.got(), ...this.exp().map((x) => x || 0));
    const step = Math.pow(10, Math.floor(Math.log10(mx)));
    return Math.ceil(mx / step) * step;
  });
  ticks = computed(() => [0, this.top() / 2, this.top()]);
  y = (v: number) => this.T + (this.H - this.T - this.B) * (1 - v / this.top());
  bh = (v: number) => Math.max(0, this.H - this.T - this.B - (this.y(v) - this.T));
  points = computed(() => {
    const pts = this.exp()
      .map((v, i) => (v == null ? null : `${this.L + i * this.cw + this.cw / 2},${this.y(v)}`))
      .filter(Boolean);
    return pts.length > 1 ? pts.join(' ') : '';
  });
}
