import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { StoreService } from './core/store.service';
import { AboutComponent } from './views/about.component';
import { AccountsComponent } from './views/accounts.component';
import { CabinetComponent } from './views/cabinet.component';
import { ContributionsComponent } from './views/contributions.component';
import { DashboardComponent } from './views/dashboard.component';
import { EventsComponent } from './views/events.component';
import { LoansComponent } from './views/loans.component';
import { LoginComponent } from './views/login.component';
import { MeetingsComponent } from './views/meetings.component';
import { MemberDetailComponent } from './views/member-detail.component';
import { MembersComponent } from './views/members.component';
import { ProjectsComponent } from './views/projects.component';
import { SettingsComponent } from './views/settings.component';
import { ShellComponent } from './views/shell.component';
import { UsersComponent } from './views/users.component';

/** Lazima awe ameingia na kuidhinishwa. */
const signedIn: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user() || (await auth.restore());
  if (!u || u.role === 'anasubiri') return router.parseUrl('/ingia');
  return true;
};

/** Ukurasa unaoruhusiwa kwa nafasi ya mtumiaji; vinginevyo anapelekwa ukurasa wake wa kwanza. */
const view = (v: string): CanActivateFn => () => {
  const s = inject(StoreService);
  const auth = inject(AuthService);
  const ok = v === 'watumiaji' ? auth.role() === 'msimamizi' : s.canView(v);
  return ok || inject(Router).parseUrl('/' + s.homeView());
};

const Home: CanActivateFn = () => inject(Router).parseUrl('/' + inject(StoreService).homeView());

export const routes: Routes = [
  { path: 'ingia', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [signedIn],
    children: [
      { path: '', pathMatch: 'full', canActivate: [Home], children: [] },
      { path: 'dashibodi', component: DashboardComponent, canActivate: [view('dashibodi')] },
      { path: 'zangu', component: MemberDetailComponent, canActivate: [view('zangu')], data: { mine: true } },
      { path: 'wanachama', component: MembersComponent, canActivate: [view('wanachama')] },
      { path: 'wanachama/:id', component: MemberDetailComponent, canActivate: [view('mwanachama')] },
      { path: 'michango', component: ContributionsComponent, canActivate: [view('michango')] },
      { path: 'kuhaniwa', component: EventsComponent, canActivate: [view('kuhaniwa')] },
      { path: 'mikopo', component: LoansComponent, canActivate: [view('mikopo')] },
      { path: 'miradi', component: ProjectsComponent, canActivate: [view('miradi')] },
      { path: 'hesabu', component: AccountsComponent, canActivate: [view('hesabu')] },
      { path: 'vikao', component: MeetingsComponent, canActivate: [view('vikao')] },
      { path: 'uongozi', component: CabinetComponent, canActivate: [view('uongozi')] },
      { path: 'taarifa', component: AboutComponent, canActivate: [view('taarifa')] },
      { path: 'mipangilio', component: SettingsComponent, canActivate: [view('mipangilio')] },
      { path: 'watumiaji', component: UsersComponent, canActivate: [view('watumiaji')] },
      { path: '**', canActivate: [Home], children: [] },
    ],
  },
];
