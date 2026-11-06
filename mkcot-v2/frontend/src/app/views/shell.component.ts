import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ROLE_LBL, VIEWS } from '../core/constants';
import { StoreService } from '../core/store.service';
import { IconComponent } from '../shared/icon.component';

/** Mpangilio wa mfumo: menyu ya kushoto, upau wa juu, na ukurasa uliochaguliwa. */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, IconComponent],
  template: `
    <div class="app">
      <nav class="irail" aria-label="Njia za mkato">
        <button class="menubtn" aria-label="Fungua menyu" title="Menyu" (click)="menu.set(!menu())">Menyu</button>
      </nav>
      <aside class="side" [class.open]="menu()">
        <div class="brand">
          <div class="logo" aria-hidden="true"><img [src]="s.logoUrl()" alt="Nembo ya JWTZ" /></div>
          <div><b>{{ s.fundName() }}</b><div class="tag">Mfuko wa Kuhani wa Operation and Training</div></div>
          <button class="homepill" (click)="go(s.homeView())">Mwanzo</button>
        </div>
        <nav class="nav" aria-label="Sehemu za mfumo">
          @for (v of views(); track v[0]) {
            <button [attr.aria-current]="v[0] === current() ? 'page' : null" (click)="go(v[0])">{{ v[1] }}</button>
          }
        </nav>
        <div class="who">Nafasi yako: {{ roleLbl() }}</div>
        <button class="logoutbtn" id="logoutbtn" type="button" (click)="auth.logout()">Logout</button>
      </aside>
      <div class="mainwrap">
        <header class="topbar">
          <div class="t"><app-icon name="bank" /><span>Jeshi la Wananchi wa Tanzania (JWTZ) · {{ s.fundName() }}</span></div>
          <div class="r">
            <button title="Taarifa za mfuko" aria-label="Taarifa za mfuko" (click)="go('taarifa')"><app-icon name="help" /></button>
            <button class="bell" title="Mambo yanayohitaji kufuatiliwa" [attr.aria-label]="'Mambo ' + alerts() + ' yanahitaji kufuatiliwa'" (click)="go('dashibodi')">
              <app-icon name="bell" /><span class="badge">{{ alerts() }}</span>
            </button>
            <div class="role">{{ auth.user()?.fullName || auth.user()?.email }}</div>
            <button class="langbtn" title="Badilisha lugha" aria-label="Badilisha lugha" (click)="toggleLang()">{{ lang === 'en' ? 'Kiswahili' : 'English' }}</button>
          </div>
        </header>
        <main class="main">
          @if (auth.role() === 'msomaji') {
            <div class="banner">Una nafasi ya Mkaguzi: unaona taarifa zote lakini huwezi kubadilisha chochote.</div>
          }
          @if (s.loaded()) { <router-outlet /> } @else { <div class="empty">Inapakia taarifa za mfuko…</div> }
        </main>
        <footer class="foot">MKCOT · Mfuko wa Kuhani wa Operation and Training</footer>
      </div>
    </div>
    @if (menu()) { <div class="scrim on" (click)="menu.set(false)"></div> }
  `,
})
export class ShellComponent {
  s = inject(StoreService);
  auth = inject(AuthService);
  private router = inject(Router);
  menu = signal(false);
  url = signal(this.router.url);
  lang = (window as any).MFUKO_LANG || 'sw';

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.url.set((e as NavigationEnd).urlAfterRedirects);
      this.menu.set(false);
      window.scrollTo(0, 0);
    });
  }

  ngOnInit() {
    if (!this.s.loaded()) this.s.loadAll();
  }

  views = computed(() => {
    const role = this.auth.role();
    const vs: [string, string][] = [...VIEWS];
    if (role === 'mwanachama') vs.unshift(['zangu', 'Taarifa zangu']);
    if (role === 'msimamizi') vs.splice(vs.length - 1, 0, ['watumiaji', 'Watumiaji']);
    return vs.filter(([k]) => k === 'watumiaji' || this.s.canView(k));
  });
  current = computed(() => this.url().split('/')[1]?.split('?')[0] || '');
  roleLbl = computed(() => ROLE_LBL[this.auth.role() || ''] || '—');
  alerts = computed(() => this.s.events().filter((e) => e.status === 'Inasubiri').length + this.s.loansOut().late);

  go(v: string) {
    this.router.navigate(['/' + v]);
  }
  toggleLang() {
    (window as any).setLang?.(this.lang === 'en' ? 'sw' : 'en');
  }
}
