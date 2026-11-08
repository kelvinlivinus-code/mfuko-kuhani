import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API, TOKEN_KEY } from './api';
import { AppUser, AuditEntry } from './models';

/** Kuingia, kujisajili na kutoka. Tokeni (JWT) inahifadhiwa kwenye kivinjari. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  readonly user = signal<AppUser | null>(null);
  readonly role = computed(() => this.user()?.role ?? null);

  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private setToken(t: string | null) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* kivinjari kimezuia hifadhi: mtumiaji ataingia tena */
    }
  }

  /** Inasoma akaunti ya aliyeingia; inarudisha null kama hajaingia au tokeni imeisha muda. */
  async restore(): Promise<AppUser | null> {
    if (!this.token) return null;
    try {
      const u = await firstValueFrom(this.http.get<AppUser>(API + '/auth/me'));
      this.user.set(u);
      return u;
    } catch {
      this.setToken(null);
      this.user.set(null);
      return null;
    }
  }

  async hasUsers(): Promise<boolean> {
    try {
      const r = await firstValueFrom(this.http.get<{ hasUsers: boolean }>(API + '/auth/status'));
      return r.hasUsers;
    } catch {
      return true;
    }
  }

  async login(email: string, password: string) {
    const r = await firstValueFrom(this.http.post<{ token: string; user: AppUser }>(API + '/auth/login', { email, password }));
    this.setToken(r.token);
    this.user.set(r.user);
    return r.user;
  }

  async register(fullName: string, email: string, password: string) {
    const r = await firstValueFrom(this.http.post<{ token: string; user: AppUser }>(API + '/auth/register', { fullName, email, password }));
    this.setToken(r.token);
    this.user.set(r.user);
    return r.user;
  }

  /** Neno la siri likibadilishwa, tokeni za zamani zinakufa; backend inarudisha tokeni mpya ya kifaa hiki. */
  async changePassword(current: string, next: string) {
    const r = await firstValueFrom(this.http.post<{ ok: boolean; token: string }>(API + '/auth/password', { current, next }));
    if (r.token) this.setToken(r.token);
    return r;
  }

  /** Toka kwenye vifaa vyote (simu, kompyuta n.k.) vilivyoingia kwa akaunti hii. */
  async logoutAll() {
    await firstValueFrom(this.http.post(API + '/auth/logout-all', {}));
    this.logout();
  }

  /** Msimamizi/Mkaguzi: kumbukumbu za ukaguzi (nani alifanya nini). */
  audit(limit = 200) {
    return firstValueFrom(this.http.get<AuditEntry[]>(API + '/audit?limit=' + limit));
  }

  logout() {
    this.setToken(null);
    this.user.set(null);
    location.hash = '#/ingia';
    location.reload();
  }
}
