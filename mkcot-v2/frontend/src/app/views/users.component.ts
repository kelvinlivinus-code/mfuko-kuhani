import { Component, computed, inject, signal } from '@angular/core';
import { errMsg } from '../core/api';
import { AuthService } from '../core/auth.service';
import { ROLES, ROLE_HELP, ROLE_LBL } from '../core/constants';
import { AppUser } from '../core/models';
import { StoreService } from '../core/store.service';
import { UiService } from '../core/ui.service';
import { fmtD } from '../core/util';

@Component({
  selector: 'app-users',
  standalone: true,
  template: `
    @if (auth.role() !== 'msimamizi') {
      <div class="head"><div><h1>Watumiaji</h1></div></div><p>Msimamizi pekee ndiye anayeweza kuona sehemu hii.</p>
    } @else {
      <div class="head"><div><h1>Watumiaji wa mfumo</h1><p>Idhinisha waliojisajili na uchague nafasi ya kila mmoja</p></div></div>
      <div class="banner">Mpe kila mtu nafasi ya kazi yake tu. Kwa Mwanachama, chagua pia kumbukumbu yake ya uanachama ili aone taarifa zake.{{ pend() ? ' Watumiaji ' + pend() + ' wanasubiri kuidhinishwa.' : '' }}</div>
      <ul class="prose" style="margin:0;padding-left:20px">@for (r of roleHelp; track r[0]) { <li><b>{{ r[0] }}</b>: {{ r[1] }}</li> }</ul>
      @if (users() === null) { <div class="empty">Inapakia watumiaji…</div> }
      @else if (users()!.length < 2) { <div class="empty">Hakuna mtumiaji mwingine bado. Waambie wafungue tovuti na kubofya Jisajili.</div> }
      @else {
        <section class="panel"><div class="scroll"><table>
          <thead><tr><th>Jina</th><th>Barua pepe</th><th>Alijisajili</th><th>Nafasi</th><th>Kumbukumbu ya uanachama</th><th></th></tr></thead>
          <tbody>@for (u of users(); track u.id) {
            <tr><td><b>{{ u.fullName || '—' }}</b></td><td>{{ u.email }}</td><td>{{ fmtD((u.createdAt || '').slice(0, 10)) }}</td>
              <td>@if (u.id === auth.user()?.id) { <span class="pill brass">Msimamizi (wewe)</span> } @else {
                <select class="search" style="min-width:0" [attr.aria-label]="'Nafasi ya ' + (u.fullName || u.email)" (change)="setRole(u, $any($event.target).value)">
                  @for (r of roles; track r) { <option [value]="r" [selected]="r === u.role">{{ roleLbl[r] }}</option> }
                </select> }</td>
              <td><select class="search" style="min-width:0" [attr.aria-label]="'Kumbukumbu ya uanachama ya ' + (u.fullName || u.email)" (change)="setMember(u, $any($event.target).value)">
                  <option value="" [selected]="!u.memberId">— Haijaunganishwa —</option>
                  @for (m of members(); track m.id) { <option [value]="m.id" [selected]="m.id === u.memberId">{{ m.name }}{{ m.no ? ' (' + m.no + ')' : '' }}</option> }
                </select></td>
              <td class="r">@if (u.id !== auth.user()?.id) {
                <button class="btn sm" (click)="resetPw(u)">Weka neno jipya la siri</button> <button class="btn sm danger" (click)="del(u)">Futa</button> }</td></tr>
          }</tbody>
        </table></div></section>
      }
    }
  `,
})
export class UsersComponent {
  s = inject(StoreService);
  auth = inject(AuthService);
  ui = inject(UiService);
  users = signal<AppUser[] | null>(null);
  roles = ROLES;
  roleLbl = ROLE_LBL;
  roleHelp = ROLE_HELP;
  fmtD = fmtD;
  members = computed(() => [...this.s.members()].sort((a, b) => a.name.localeCompare(b.name)));
  pend = computed(() => (this.users() || []).filter((u) => u.role === 'anasubiri').length);

  ngOnInit() {
    if (this.auth.role() === 'msimamizi') this.load();
  }
  async load() {
    try {
      this.users.set(await this.s.listUsers());
    } catch {
      this.users.set([]);
      this.ui.toast('Imeshindwa kupakia watumiaji.');
    }
  }
  private patch(u: AppUser, nu: AppUser) {
    this.users.update((l) => (l || []).map((x) => (x.id === u.id ? nu : x)));
  }
  async setRole(u: AppUser, role: string) {
    try {
      this.patch(u, await this.s.updateUser(u.id, { role }));
      this.ui.toast('Nafasi imebadilishwa');
    } catch (e) {
      this.ui.toast(errMsg(e));
      this.load();
    }
  }
  async setMember(u: AppUser, memberId: string) {
    try {
      this.patch(u, await this.s.updateUser(u.id, { memberId }));
      this.ui.toast('Imeunganishwa');
    } catch (e) {
      this.ui.toast(errMsg(e));
    }
  }
  resetPw(u: AppUser) {
    this.ui.openForm({
      title: 'Weka neno jipya la siri',
      intro: `Kwa ${u.fullName || u.email}. Mpe neno hili ana kwa ana, kisha amwambie alibadilishe kwenye Mipangilio.`,
      fields: [{ k: 'password', label: 'Neno jipya la siri (herufi 8 au zaidi)', type: 'password', required: true }],
      onSubmit: async (v) => {
        if (String(v['password']).length < 8) return 'Neno la siri liwe na herufi 8 au zaidi.';
        try {
          await this.s.setUserPassword(u.id, v['password']);
          this.ui.toast('Neno la siri limebadilishwa');
          return true;
        } catch (e) {
          return errMsg(e);
        }
      },
    });
  }
  del(u: AppUser) {
    this.ui.confirm(`Futa akaunti ya ${u.fullName || u.email}? Hataweza kuingia tena.`, 'Futa', async () => {
      try {
        await this.s.deleteUser(u.id);
        this.users.update((l) => (l || []).filter((x) => x.id !== u.id));
        this.ui.toast('Imefutwa');
        return true;
      } catch (e) {
        this.ui.toast(errMsg(e));
        return false;
      }
    });
  }
}
