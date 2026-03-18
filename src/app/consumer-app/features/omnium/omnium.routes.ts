import { Routes } from '@angular/router';
import { authGuard } from 'app/common/guards/auth.guard';
import { OmniumLayoutComponent } from './omnium-layout.component';
import { HomeComponent } from './pages/home.component';
import { DashboardComponent } from './pages/dashboard.component';
import { CompetitionsComponent } from './pages/competitions.component';
import { TeamsComponent } from './pages/teams.component';
import { CompetitionDetailComponent } from './pages/competition-detail.component';
import { NewsComponent } from './pages/news.component';
import { ProfileComponent } from './pages/profile.component';
import { SponsorComponent } from './pages/sponsor.component';
import { TeamDetailComponent } from './pages/team-detail.component';
import { TitleDetailComponent } from './pages/title-detail.component';
import { MatchDetailComponent } from './pages/match-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: OmniumLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'competitions', component: CompetitionsComponent, canActivate: [authGuard] },
      { path: 'competitions/:id', component: CompetitionDetailComponent, canActivate: [authGuard] },
      { path: 'teams', component: TeamsComponent, canActivate: [authGuard] },
      { path: 'teams/:id', component: TeamDetailComponent, canActivate: [authGuard] },
      { path: 'titles/:id', component: TitleDetailComponent, canActivate: [authGuard] },
      { path: 'matches/:id', component: MatchDetailComponent, canActivate: [authGuard] },
      { path: 'news', component: NewsComponent, canActivate: [authGuard] },
      { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'sponsors', component: SponsorComponent, canActivate: [authGuard] }
    ]
  }
];
