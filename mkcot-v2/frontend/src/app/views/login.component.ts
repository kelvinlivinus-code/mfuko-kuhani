import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { errMsg } from '../core/api';
import { AuthService } from '../core/auth.service';

/** Ukurasa wa kuingia, kujisajili na kusubiri kuidhinishwa. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth">
      <div class="box">
        <div class="crest" aria-hidden="true"><img src="nembo.svg" alt="" /></div>
        <h1>MKCOT</h1>
        <p style="margin:-6px 0 0;font-weight:500">Mfuko wa Kuhani wa Operation and Training</p>
        @switch (mode()) {
          @case ('pending') {
            <p>Akaunti yako ({{ auth.user()?.email }}) imesajiliwa lakini inasubiri kuidhinishwa na msimamizi wa mfuko. Ukishaidhinishwa, pakia ukurasa upya.</p>
            <button class="go" type="button" (click)="reload()">Pakia upya</button>
            <div class="links"><button type="button" (click)="auth.logout()">Logout</button></div>
          }
          @default {
            @if (mode() === 'login') { <p>Ingia kwa barua pepe na neno la siri</p> }
            @else if (first()) { <p>Fungua akaunti ya kwanza</p><p>Akaunti ya kwanza itakuwa ya Msimamizi wa mfumo.</p> }
            @else { <p>Fungua akaunti. Msimamizi wa mfuko ataidhinisha kabla hujaona taarifa.</p> }
            <form novalidate (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:12px">
              @if (mode() === 'register') {
                <label for="a_name">Jina kamili<input id="a_name" name="name" type="text" autocomplete="name" [(ngModel)]="name" /></label>
              }
              <label for="a_email">Barua pepe<input id="a_email" name="email" type="email" autocomplete="username" [(ngModel)]="email" /></label>
              <label for="a_pass">{{ mode() === 'register' ? 'Neno la siri (herufi 8 au zaidi)' : 'Neno la siri' }}
                <input id="a_pass" name="pass" type="password" [attr.autocomplete]="mode() === 'register' ? 'new-password' : 'current-password'" [(ngModel)]="pass" /></label>
              <button class="go" type="submit" [disabled]="busy()">{{ mode() === 'register' ? (first() ? 'Fungua akaunti' : 'Jisajili') : 'Ingia' }}</button>
              <p class="msg err" role="status">{{ msg() }}</p>
            </form>
            <div class="links">
              @if (mode() === 'login') {
                <button type="button" (click)="mode.set('register'); msg.set('')">Jisajili</button>
                <span class="muted" style="font-size:.85rem">Umesahau neno la siri? Mwombe msimamizi akuwekee jipya.</span>
              } @else { <button type="button" (click)="mode.set('login'); msg.set('')">Nina akaunti tayari</button> }
            </div>
          }
        }
        <div class="links" style="margin-top:14px"><button type="button" (click)="toggleLang()">{{ lang === 'en' ? 'Kiswahili' : 'English' }}</button></div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  mode = signal<'login' | 'register' | 'pending'>('login');
  first = signal(false);
  busy = signal(false);
  msg = signal('');
  name = '';
  email = '';
  pass = '';
  lang = (window as any).MFUKO_LANG || 'sw';

  async ngOnInit() {
    const u = this.auth.user() || (await this.auth.restore());
    if (u?.role === 'anasubiri') {
      this.mode.set('pending');
      return;
    }
    if (u) {
      this.router.navigateByUrl('/');
      return;
    }
    if (!(await this.auth.hasUsers())) {
      this.first.set(true);
      this.mode.set('register');
    }
  }

  toggleLang() {
    (window as any).setLang?.(this.lang === 'en' ? 'sw' : 'en');
  }
  reload() {
    location.reload();
  }

  async submit() {
    this.msg.set('');
    const email = this.email.trim();
    if (this.mode() === 'register') {
      if (!this.name.trim()) return this.msg.set('Andika jina lako kamili.');
      if (this.pass.length < 8) return this.msg.set('Neno la siri liwe na herufi 8 au zaidi.');
    }
    if (!email || !this.pass) return this.msg.set('Barua pepe au neno la siri si sahihi.');
    this.busy.set(true);
    try {
      const u = this.mode() === 'register' ? await this.auth.register(this.name.trim(), email, this.pass) : await this.auth.login(email, this.pass);
      if (u.role === 'anasubiri') this.mode.set('pending');
      else this.router.navigateByUrl('/');
    } catch (e) {
      this.msg.set(errMsg(e));
    } finally {
      this.busy.set(false);
    }
  }
}
