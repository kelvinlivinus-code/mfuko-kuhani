import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API, errMsg } from './api';
import { AuthService } from './auth.service';
import { COLS, Col, DEF_SETTINGS, PERM, READ, VIEW_COL } from './constants';
import {
  About, AppUser, CabinetMember, Loan, LedgerEntry, Meeting, Member, Notice, Payment, Project, Rec, Settings, SupportEvent,
} from './models';
import { UiService } from './ui.service';
import { addMonths, todayISO, yearOf } from './util';

export interface LoanCalc { total: number; paid: number; bal: number; due: string; status: string; monthly: number }
export interface MemberYear {
  paid: number[]; total: number; expected: number; debt: number; unpaid: number[]; first: number; last: number; active: boolean;
}
export interface Finance {
  opening: number; kiingilio: number; mwezi: number; mengine: number; marejesho: number; mradiMapato: number; ledgerIn: number;
  misaada: number; mikopo: number; mradiUwekezaji: number; ledgerOut: number; in: number; out: number; bal: number;
}

/**
 * Data yote ya mfuko kwenye kivinjari, pamoja na hesabu (mikopo, madeni, salio) na ruhusa za kila nafasi.
 * Hesabu ni zile zile za toleo la awali.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private ui = inject(UiService);

  readonly loaded = signal(false);
  readonly members = signal<Member[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly events = signal<SupportEvent[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly cabinet = signal<CabinetMember[]>([]);
  readonly meetings = signal<Meeting[]>([]);
  readonly notices = signal<Notice[]>([]);
  readonly ledger = signal<LedgerEntry[]>([]);
  readonly settings = signal<Settings>({ ...DEF_SETTINGS });
  readonly about = signal<About>({});
  /** Mwaka uliochaguliwa kwenye Michango, Hesabu na ukurasa wa mwanachama. */
  readonly year = signal(new Date().getFullYear());

  private sig(c: Col) {
    return (this as any)[c] as ReturnType<typeof signal<Rec[]>>;
  }

  readonly memberMap = computed(() => new Map(this.members().map((m) => [m.id, m])));

  // ---------- ruhusa ----------
  private perm() {
    return PERM[this.auth.role() || ''] || { views: ['taarifa'], write: [] };
  }
  can(col: string): boolean {
    const w = this.perm().write;
    return w === '*' || w.includes(col);
  }
  canView(v: string): boolean {
    const vs = this.perm().views;
    return vs === '*' ? v !== 'zangu' : vs.includes(v) || (v === 'mwanachama' && vs.includes('wanachama'));
  }
  canWriteView(v: string): boolean {
    return v !== 'zangu' && this.can(VIEW_COL[v] || '-');
  }
  homeView(): string {
    const vs = this.perm().views;
    return vs === '*' ? 'dashibodi' : vs[0];
  }
  private readable(): Col[] {
    const r = READ[this.auth.role() || ''];
    return r === '*' ? [...COLS] : r || [];
  }

  // ---------- kupakia ----------
  async loadAll() {
    const cols = this.readable();
    const [s, a] = await Promise.all([
      firstValueFrom(this.http.get<Settings>(API + '/config/settings')).catch(() => null),
      firstValueFrom(this.http.get<About>(API + '/config/about')).catch(() => null),
    ]);
    if (s) this.settings.set({ ...DEF_SETTINGS, ...this.num(s) });
    if (a) this.about.set(a);
    await Promise.all(cols.map((c) => this.reload(c)));
    this.loaded.set(true);
  }

  async reload(c: Col) {
    try {
      const rows = await firstValueFrom(this.http.get<Rec[]>(`${API}/${c}`));
      this.sig(c).set(rows.map((r) => this.num(r)));
    } catch {
      this.sig(c).set([]);
    }
  }

  /** Fedha zinakuja kama namba; tarehe kama "YYYY-MM-DD". */
  private num<T extends object>(r: T): T {
    return r;
  }

  // ---------- kuandika ----------
  async save(col: Col, id: string | null | undefined, data: Record<string, any>, quiet = false): Promise<Rec | null> {
    if (!this.can(col)) {
      this.ui.toast('Huna ruhusa ya kufanya hivi kwa nafasi yako. Mwombe msimamizi.');
      return null;
    }
    try {
      const body = { ...data };
      delete body['id'];
      const saved = id
        ? await firstValueFrom(this.http.put<Rec>(`${API}/${col}/${id}`, body))
        : await firstValueFrom(this.http.post<Rec>(`${API}/${col}`, body));
      const s = this.sig(col);
      s.set(id ? s().map((x) => (x.id === id ? saved : x)) : [...s(), saved]);
      if (!quiet) this.ui.toast('Imehifadhiwa');
      return saved;
    } catch (e) {
      this.ui.toast(errMsg(e));
      return null;
    }
  }

  async remove(col: Col, id: string): Promise<boolean> {
    if (!this.can(col)) {
      this.ui.toast('Huna ruhusa ya kufanya hivi kwa nafasi yako. Mwombe msimamizi.');
      return false;
    }
    try {
      await firstValueFrom(this.http.delete(`${API}/${col}/${id}`));
      this.sig(col).update((rows) => rows.filter((x) => x.id !== id));
      this.ui.toast('Imefutwa');
      return true;
    } catch (e) {
      this.ui.toast(errMsg(e));
      return false;
    }
  }

  async saveSettings(v: Partial<Settings>) {
    try {
      const s = await firstValueFrom(this.http.put<Settings>(API + '/config/settings', v));
      this.settings.set({ ...DEF_SETTINGS, ...s });
      this.ui.toast('Imehifadhiwa');
      return true;
    } catch (e) {
      this.ui.toast(errMsg(e));
      return false;
    }
  }

  async saveAbout(v: About) {
    try {
      this.about.set(await firstValueFrom(this.http.put<About>(API + '/config/about', v)));
      this.ui.toast('Imehifadhiwa');
      return true;
    } catch (e) {
      this.ui.toast(errMsg(e));
      return false;
    }
  }

  async uploadLogo(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await firstValueFrom(this.http.post<{ logoVersion: number }>(API + '/config/logo', fd));
      this.settings.update((s) => ({ ...s, hasLogo: true, logoVersion: r.logoVersion }));
      this.ui.toast('Imehifadhiwa');
    } catch (e) {
      this.ui.toast(errMsg(e));
    }
  }

  async deleteLogo() {
    try {
      const r = await firstValueFrom(this.http.delete<{ logoVersion: number }>(API + '/config/logo'));
      this.settings.update((s) => ({ ...s, hasLogo: false, logoVersion: r.logoVersion }));
      this.ui.toast('Imehifadhiwa');
    } catch (e) {
      this.ui.toast(errMsg(e));
    }
  }

  logoUrl(): string {
    const s = this.settings();
    return s.hasLogo ? `${API}/config/logo?v=${s.logoVersion}` : 'nembo.svg';
  }

  exportAll() {
    return firstValueFrom(this.http.get<Record<string, unknown>>(API + '/backup'));
  }
  importAll(obj: unknown) {
    return firstValueFrom(this.http.post<Record<string, number>>(API + '/backup/import', obj));
  }
  listUsers() {
    return firstValueFrom(this.http.get<AppUser[]>(API + '/users'));
  }
  updateUser(id: string, body: { role?: string; memberId?: string }) {
    return firstValueFrom(this.http.put<AppUser>(API + '/users/' + id, body));
  }
  setUserPassword(id: string, password: string) {
    return firstValueFrom(this.http.put(API + '/users/' + id + '/password', { password }));
  }
  deleteUser(id: string) {
    return firstValueFrom(this.http.delete(API + '/users/' + id));
  }

  // ---------- msaada ----------
  fundName(): string {
    const n = (this.settings().fundName || '').trim();
    return !n || /^Mfuko wa Kuhani\s*-?\s*COT$/i.test(n) ? 'MKCOT' : n;
  }
  mem(id: string | null | undefined) {
    return id ? this.memberMap().get(id) : undefined;
  }
  mname(id: string | null | undefined) {
    const m = this.mem(id);
    return m ? m.name : '(mwanachama hayupo)';
  }
  memberOptions(onlyActive = false): [string, string][] {
    return this.members()
      .filter((m) => !onlyActive || (m.status || 'Hai') === 'Hai')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => [m.id, `${m.rank ? m.rank + ' ' : ''}${m.name}${m.no ? ' (' + m.no + ')' : ''}`]);
  }
  nextNo(prefix: string, rows: { no?: string }[]) {
    let max = 0;
    for (const r of rows) {
      const m = String(r.no || '').match(/(\d+)\s*$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return prefix + String(max + 1).padStart(3, '0');
  }

  // ---------- hesabu ----------
  loanRate(l: Loan): number {
    return l.rate === null || l.rate === undefined || (l.rate as any) === '' ? Number(this.settings().interestRate) || 0 : Number(l.rate);
  }
  loanCalc(l: Loan): LoanCalc {
    const total = (Number(l.principal) || 0) * (1 + this.loanRate(l) / 100);
    const paid = (l.repayments || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const bal = Math.max(0, total - paid);
    const due = addMonths(l.date, l.months);
    const status = bal <= 0.5 ? 'Umelipwa' : due && todayISO() > due ? 'Umechelewa' : 'Unaendelea';
    return { total, paid, bal, due, status, monthly: l.months ? total / Number(l.months) : 0 };
  }
  projCalc(p: Project) {
    let inv = 0, inc = 0, exp = 0;
    for (const e of p.entries || []) {
      const a = Number(e.amount) || 0;
      if (e.kind === 'mapato') inc += a;
      else if (e.kind === 'matumizi') exp += a;
      else inv += a;
    }
    return { inv, inc, exp, net: inc - exp - inv };
  }
  memberYear(m: Member, Y: number): MemberYear {
    const fee = Number(this.settings().monthlyFee) || 0;
    const paid = Array(13).fill(0);
    for (const p of this.payments())
      if (p.memberId === m.id && p.type === 'mwezi' && Number(p.year) === Y) paid[Number(p.month)] += Number(p.amount) || 0;
    const now = new Date(), cy = now.getFullYear(), cm = now.getMonth() + 1;
    const last = Y < cy ? 12 : Y > cy ? 0 : cm;
    let first = 1;
    if (m.joinDate) {
      const [jy, jm] = m.joinDate.split('-').map(Number);
      if (jy > Y) first = 13;
      else if (jy === Y) first = jm;
    }
    const active = (m.status || 'Hai') === 'Hai';
    const dueMonths: number[] = [];
    for (let i = first; i <= last; i++) dueMonths.push(i);
    const total = paid.reduce((a, b) => a + b, 0);
    const expected = active ? dueMonths.length * fee : 0;
    const unpaid = active ? dueMonths.filter((i) => paid[i] <= 0) : [];
    return { paid, total, expected, debt: Math.max(0, expected - total), unpaid, first, last, active };
  }
  entryPaid(mid: string) {
    let s = 0;
    for (const p of this.payments()) if (p.memberId === mid && p.type === 'kiingilio') s += Number(p.amount) || 0;
    return s;
  }
  finance(Y: number | null): Finance {
    const inY = (d: unknown) => Y == null || yearOf(d) === Y;
    const f: Finance = {
      opening: Y == null ? Number(this.settings().openingBalance) || 0 : 0, kiingilio: 0, mwezi: 0, mengine: 0, marejesho: 0,
      mradiMapato: 0, ledgerIn: 0, misaada: 0, mikopo: 0, mradiUwekezaji: 0, ledgerOut: 0, in: 0, out: 0, bal: 0,
    };
    for (const p of this.payments()) {
      if (!inY(p.date)) continue;
      const a = Number(p.amount) || 0;
      if (p.type === 'kiingilio') f.kiingilio += a;
      else if (p.type === 'mwezi') f.mwezi += a;
      else f.mengine += a;
    }
    for (const l of this.loans()) {
      if (inY(l.date)) f.mikopo += Number(l.principal) || 0;
      for (const r of l.repayments || []) if (inY(r.date)) f.marejesho += Number(r.amount) || 0;
    }
    for (const e of this.events()) if ((e.status || 'Imelipwa') === 'Imelipwa' && inY(e.date)) f.misaada += Number(e.amount) || 0;
    for (const p of this.projects())
      for (const e of p.entries || []) {
        if (!inY(e.date)) continue;
        const a = Number(e.amount) || 0;
        if (e.kind === 'mapato') f.mradiMapato += a;
        else f.mradiUwekezaji += a;
      }
    for (const x of this.ledger()) {
      if (!inY(x.date)) continue;
      const a = Number(x.amount) || 0;
      if (x.dir === 'in') f.ledgerIn += a;
      else f.ledgerOut += a;
    }
    f.in = f.opening + f.kiingilio + f.mwezi + f.mengine + f.marejesho + f.mradiMapato + f.ledgerIn;
    f.out = f.misaada + f.mikopo + f.mradiUwekezaji + f.ledgerOut;
    f.bal = f.in - f.out;
    return f;
  }
  loansOut() {
    let bal = 0, late = 0, active = 0;
    for (const l of this.loans()) {
      const c = this.loanCalc(l);
      bal += c.bal;
      if (c.status === 'Umechelewa') late++;
      if (c.status !== 'Umelipwa') active++;
    }
    return { bal, late, active };
  }
  years(): number[] {
    const ys = new Set([new Date().getFullYear(), this.year()]);
    for (const p of this.payments()) if (p.year) ys.add(Number(p.year));
    return [...ys].sort();
  }
}
