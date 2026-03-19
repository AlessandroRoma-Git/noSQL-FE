import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { RecordService } from 'app/consumer-app/services/record.service';
import { AuthService } from 'app/common/services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'player' | 'caster' | 'sponsor' | 'fan';
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  description?: string;
  teamId?: string;
  elo?: number;
  badges?: string[];
  status?: 'active' | 'banned';
}

export interface Title {
  id: string;
  name: string;
  image: string;
  publisher: string;
  description?: string;
  downloadLinks?: { platform: string, url: string }[];
}

export interface CompetitionRule {
  code: string;
  title: string;
  description: string;
}

export interface Competition {
  id: string;
  titleId: string;
  name: string;
  status: 'draft' | 'active' | 'upcoming' | 'completed';
  prizePool: string;
  image: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  matchRules: number;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  playDays: number[];
  startTime?: string;
  matchesPerDay?: number;
  roundDuration?: number;
  description?: string;
  rules: CompetitionRule[];
  registeredTeams?: string[];
  roundRobinType?: 'single' | 'double';
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  founded: string;
  wins: number;
  losses: number;
  members: string[];
  captainId: string;
  description?: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export interface Match {
  id: string;
  competitionId: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
  status: 'scheduled' | 'live' | 'completed' | 'disputed';
  casterId?: string;
  confirmedByA: boolean;
  confirmedByB: boolean;
  round?: string;
  proposedScoreA?: { a: number, b: number };
  proposedScoreB?: { a: number, b: number };
}

export interface NewsItem {
  id: string;
  title: string;
  image: string;
  date: string;
  excerpt: string;
}

export interface Review {
  id: string;
  casterId: string;
  authorName: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  description: string;
  siteUrl: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private recordService = inject(RecordService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  users = signal<User[]>([]);
  titles = signal<Title[]>([]);
  competitions = signal<Competition[]>([]);
  teams = signal<Team[]>([]);
  matches = signal<Match[]>([]);
  news = signal<NewsItem[]>([]);
  reviews = signal<Review[]>([]);
  sponsors = signal<Sponsor[]>([]);
  joinRequests = signal<JoinRequest[]>([]);
  notifications = signal<Notification[]>([]);
  toasts = signal<Toast[]>([]);
  isGeneratingMatches = signal<string | null>(null);

  currentUser = toSignal(this.authService.userState$.pipe(
    map(state => {
      if (!state) return null;
      let role: UserRole = 'fan';
      if (state.systemRoles.includes('SUPER_ADMIN')) role = 'super_admin';
      else if (state.systemRoles.includes('ADMIN')) role = 'admin';
      else if (state.groups.includes('casters')) role = 'caster';
      else if (state.groups.includes('moderators')) role = 'moderator';
      else if (state.groups.includes('sponsors')) role = 'sponsor';
      else if (state.groups.includes('players')) role = 'player';
      
      return { 
        id: state.username || 'unknown', 
        name: state.username || 'User', 
        role, 
        avatar: '',
        status: 'active',
        elo: 0 
      } as User;
    })
  ));

  activeCompetitions = computed(() => this.competitions().filter(c => c.status === 'active'));
  
  myMatches = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const myTeam = this.teams().find(t => t.id === user.teamId || t.members.includes(user.name));
    return myTeam ? this.matches().filter(m => m.teamA === myTeam.name || m.teamB === myTeam.name) : [];
  });

  myTeamRequests = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const myOwnedTeam = this.teams().find(t => t.captainId === user.id);
    if (!myOwnedTeam) return [];
    return this.joinRequests().filter(r => r.teamId === myOwnedTeam.id && r.status === 'pending');
  });

  availableCasts = computed(() => this.matches().filter(m => m.status === 'scheduled' && !m.casterId));

  hasPendingRequest = (teamId: string) => computed(() => {
    const user = this.currentUser();
    return user ? this.joinRequests().some(r => r.teamId === teamId && r.userId === user.id && r.status === 'pending') : false;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) { this.loadAllRecords(); }
  }

  public loadAllRecords() {
    this.recordService.searchRecords('user').subscribe(res => {
      this.users.set((res.content as any[]).map(u => ({ ...u.data, id: u.id })));
    });
    this.recordService.searchRecords('title').subscribe(res => {
      this.titles.set((res.content as any[]).map(t => {
        let links = [];
        try { links = t.data.downloadLinks ? JSON.parse(t.data.downloadLinks) : []; } catch(e) {}
        return { ...t.data, id: t.id, downloadLinks: links };
      }));
    });
    this.recordService.searchRecords('competition').subscribe(res => {
      this.competitions.set((res.content as any[]).map(c => {
        let playDays = [], rules = [], registeredTeams = [];
        try {
          playDays = c.data.playDays ? JSON.parse(c.data.playDays) : [];
          rules = c.data.rules ? JSON.parse(c.data.rules) : [];
          registeredTeams = c.data.registeredTeams ? JSON.parse(c.data.registeredTeams) : [];
        } catch(e) { }
        return { ...c.data, id: c.id, playDays, rules, registeredTeams };
      }));
    });
    this.recordService.searchRecords('team').subscribe(res => {
      this.teams.set((res.content as any[]).map(t => {
        let members = [];
        try { members = t.data.members ? JSON.parse(t.data.members) : []; } catch(e) {}
        return { ...t.data, id: t.id, members };
      }));
    });
    this.recordService.searchRecords('match').subscribe(res => {
      this.matches.set((res.content as any[]).map(m => {
        let pA = null, pB = null;
        try {
          pA = m.data.proposedScoreA ? JSON.parse(m.data.proposedScoreA) : null;
          pB = m.data.proposedScoreB ? JSON.parse(m.data.proposedScoreB) : null;
        } catch(e) {}
        return { ...m.data, id: m.id, proposedScoreA: pA, proposedScoreB: pB };
      }));
    });
    this.recordService.searchRecords('news').subscribe(res => this.news.set((res.content as any[]).map(x => ({...x.data, id: x.id}))));
    this.recordService.searchRecords('sponsor').subscribe(res => this.sponsors.set((res.content as any[]).map(x => ({...x.data, id: x.id}))));
    this.recordService.searchRecords('review').subscribe(res => this.reviews.set((res.content as any[]).map(x => ({...x.data, id: x.id}))));
    this.recordService.searchRecords('join_request').subscribe(res => this.joinRequests.set((res.content as any[]).map(x => ({...x.data, id: x.id}))));
  }

  generateMatches(compId: string) {
    const comp = this.competitions().find(c => c.id === compId);
    if (!comp) return;
    this.isGeneratingMatches.set(compId);
    const existingMatches = this.matches().filter(m => m.competitionId === compId);
    const deleteRequests = existingMatches.map(m => this.recordService.deleteRecord('match', m.id).pipe(catchError(() => of(null))));
    const doGeneration = () => {
        const maxTeams = comp.maxTeams || 8;
        const registered = comp.registeredTeams || [];
        const virtualTeams: string[] = [];
        for (let i = 0; i < maxTeams; i++) {
           if (registered[i]) {
              const t = this.teams().find(x => x.id === registered[i]);
              virtualTeams.push(t ? t.name : 'TBD');
           } else virtualTeams.push('TBD');
        }
        const matches: any[] = [];
        let currentMatchTime = new Date(comp.startDate);
        const [startH, startM] = (comp.startTime || "20:00").split(':').map(Number);
        currentMatchTime.setHours(startH, startM, 0, 0);
        const duration = comp.roundDuration || 60;
        const maxPerDay = comp.matchesPerDay || 4;
        const allowedDays = comp.playDays.length > 0 ? comp.playDays : [0,1,2,3,4,5,6];
        let matchCountOnDay = 0;
        const nextTime = () => {
           while (!allowedDays.includes(currentMatchTime.getDay()) || matchCountOnDay >= maxPerDay) {
              currentMatchTime.setDate(currentMatchTime.getDate() + 1);
              currentMatchTime.setHours(startH, startM, 0, 0);
              matchCountOnDay = 0;
           }
           const time = currentMatchTime.toISOString();
           matchCountOnDay++;
           currentMatchTime = new Date(currentMatchTime.getTime() + duration * 60000);
           return time;
        };
        if (comp.format === 'round_robin') {
           for (let i = 0; i < virtualTeams.length; i++) {
             for (let j = i + 1; j < virtualTeams.length; j++) {
                matches.push({ competitionId: compId, teamA: virtualTeams[i], teamB: virtualTeams[j], scoreA: 0, scoreB: 0, date: nextTime(), status: 'scheduled', confirmedByA: false, confirmedByB: false, round: 'Girone' });
             }
           }
        } else {
           const numRounds = Math.ceil(Math.log2(maxTeams));
           const totalSlots = Math.pow(2, numRounds);
           let roundNames = ['Round 1', 'Round of 16', 'Round of 8', 'Quarterfinals', 'Semifinals', 'Grand Final'];
           let roundIdx = 5 - (numRounds - 1);
           if (roundIdx < 0) roundIdx = 0;
           let currentTeams = [...virtualTeams];
           while(currentTeams.length < totalSlots) {
              currentTeams.push('BYE');
           }
           let roundCounter = roundIdx;
           let teamsToProcess = [...currentTeams];
           for (let r = 0; r < numRounds; r++) {
              const roundName = roundNames[roundCounter] || `Round ${teamsToProcess.length}`;
              const numMatches = teamsToProcess.length / 2;
              const nextRoundTeams: string[] = [];
              for (let m = 0; m < numMatches; m++) {
                 const teamA = teamsToProcess[m * 2];
                 const teamB = teamsToProcess[m * 2 + 1];
                 const isByeMatch = teamA === 'BYE' || teamB === 'BYE';
                 const winner = teamA === 'BYE' ? teamB : teamA;
                 matches.push({
                    competitionId: compId, teamA, teamB,
                    scoreA: teamB === 'BYE' ? 1 : 0, scoreB: teamA === 'BYE' ? 1 : 0,
                    date: nextTime(), status: isByeMatch ? 'completed' : 'scheduled',
                    confirmedByA: isByeMatch, confirmedByB: isByeMatch, round: roundName
                 });
                 if (r < numRounds - 1) {
                    if (isByeMatch) nextRoundTeams.push(winner);
                    else nextRoundTeams.push('TBD');
                 }
              }
              teamsToProcess = nextRoundTeams;
              roundCounter++;
           }
        }
        const createRequests = matches.map(m => this.recordService.createRecord('match', { data: m }).pipe(catchError(() => of(null))));
        forkJoin(createRequests).subscribe(() => {
           this.isGeneratingMatches.set(null);
           this.addNotification(`Tabellone generato.`, 'success');
           this.loadAllRecords();
           setTimeout(() => this.router.navigate(['/app/competitions', compId], { queryParams: { tab: 'bracket' } }), 1000);
        });
    };
    if (deleteRequests.length > 0) forkJoin(deleteRequests).subscribe(() => doGeneration());
    else doGeneration();
  }

  confirmMatchResult(id: string, side: string, sA: number, sB: number) {
    this.recordService.updateRecord('match', id, { data: { scoreA: sA, scoreB: sB, status: 'completed' } }).subscribe(() => {
      this.addNotification('Risultato confermato.', 'success');
      this.loadAllRecords();
    });
  }

  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const id = Date.now().toString() + Math.random();
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 3500);
  }

  addTitle(n: string, p: string, d: string, i: string, l: any[]) { this.recordService.createRecord('title', { data: { name: n, publisher: p, description: d, image: i, downloadLinks: JSON.stringify(l) } }).subscribe(() => this.loadAllRecords()); }
  createCompetition(n: string, tid: string, p: string, sel: string[], dr: boolean, det: any) {
    const payload = { ...det };
    delete payload.id;
    this.recordService.createRecord('competition', { data: { ...payload, name: n, titleId: tid, prizePool: p, status: dr ? 'draft' : 'upcoming', startDate: new Date(det.startDate).toISOString(), endDate: new Date(det.endDate).toISOString(), playDays: JSON.stringify(det.playDays || []), rules: JSON.stringify(det.rules || []), registeredTeams: JSON.stringify(sel || []) } }).subscribe(() => this.loadAllRecords());
  }
  updateCompetition(id: string, n: string, tid: string, p: string, sel: string[], dr: boolean, det: any) {
    const payload = { ...det };
    delete payload.id;
    this.recordService.updateRecord('competition', id, { data: { ...payload, name: n, titleId: tid, prizePool: p, status: dr ? 'draft' : 'upcoming', startDate: new Date(det.startDate).toISOString(), endDate: new Date(det.endDate).toISOString(), playDays: JSON.stringify(det.playDays || []), rules: JSON.stringify(det.rules || []), registeredTeams: JSON.stringify(sel || []) } }).subscribe(() => this.loadAllRecords());
  }
  createTeam(name: string, description: string, logo: string) {
    const user = this.currentUser();
    if (!user) return;
    this.recordService.createRecord('team', { data: { name, description, logo, founded: new Date().getFullYear().toString(), wins: 0, losses: 0, captainId: user.id, members: JSON.stringify([user.name]) } }).subscribe(() => this.loadAllRecords());
  }
  addMemberToTeam(teamId: string, memberName: string) {
    const team = this.teams().find(t => t.id === teamId);
    if (!team) return;
    const currentMembers = team.members || [];
    if (currentMembers.includes(memberName)) return;
    const newMembers = [...currentMembers, memberName];
    this.recordService.updateRecord('team', teamId, { data: { members: JSON.stringify(newMembers) } }).subscribe(() => this.loadAllRecords());
  }
  removeMemberFromTeam(teamId: string, memberName: string) {
    const team = this.teams().find(t => t.id === teamId);
    if (!team) return;
    const newMembers = (team.members || []).filter(m => m !== memberName);
    this.recordService.updateRecord('team', teamId, { data: { members: JSON.stringify(newMembers) } }).subscribe(() => this.loadAllRecords());
  }

  proposeResult(matchId: string, scoreA: number, scoreB: number, proposingTeamName: string) {
    const match = this.matches().find(m => m.id === matchId);
    if (!match) return;

    const proposingSide = match.teamA === proposingTeamName ? 'A' : 'B';
    const payload: any = {
      status: 'disputed' 
    };

    if (proposingSide === 'A') payload.proposedScoreA = JSON.stringify({ a: scoreA, b: scoreB });
    else payload.proposedScoreB = JSON.stringify({ a: scoreA, b: scoreB });
    
    this.recordService.updateRecord('match', matchId, { data: payload }).subscribe(() => {
      this.addNotification('Result proposed. Awaiting opponent confirmation.', 'info');
      this.loadAllRecords();
    });
  }

  confirmResult(matchId: string) {
    const match = this.matches().find(m => m.id === matchId);
    if (!match || (!match.proposedScoreA && !match.proposedScoreB)) return;

    const finalScore = match.proposedScoreA || match.proposedScoreB;
    if (!finalScore) return;

    this.recordService.updateRecord('match', matchId, { data: { status: 'completed', scoreA: finalScore.a, scoreB: finalScore.b } }).subscribe(() => {
      this.addNotification('Result Confirmed!', 'success');
      this.loadAllRecords();
    });
  }
  
  forceResult(matchId: string, scoreA: number, scoreB: number) {
    this.recordService.updateRecord('match', matchId, { data: { status: 'completed', scoreA, scoreB, proposedScoreA: null, proposedScoreB: null } }).subscribe(() => {
      this.addNotification('Match result has been overridden by an Admin.', 'warning');
      this.loadAllRecords();
    });
  }

  updateMatch(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    this.recordService.updateRecord('match', id, { data: payload }).subscribe(() => this.loadAllRecords());
  }
  deleteMatch(id: string) { this.recordService.deleteRecord('match', id).subscribe(() => this.loadAllRecords()); }
  deleteTitle(id: string) { this.recordService.deleteRecord('title', id).subscribe(() => this.loadAllRecords()); }
  updateTitle(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    this.recordService.updateRecord('title', id, { data: { ...payload, downloadLinks: JSON.stringify(payload.downloadLinks || []) } }).subscribe(() => this.loadAllRecords());
  }
  deleteCompetition(id: string) { this.recordService.deleteRecord('competition', id).subscribe(() => this.loadAllRecords()); }
  addNews(title: string, date: string, excerpt: string, image: string) {
    this.recordService.createRecord('news', { data: { title, date, excerpt, image } }).subscribe(() => this.loadAllRecords());
  }
  updateNews(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    this.recordService.updateRecord('news', id, { data: payload }).subscribe(() => this.loadAllRecords());
  }
  deleteNews(id: string) { this.recordService.deleteRecord('news', id).subscribe(() => this.loadAllRecords()); }
  addSponsor(name: string, description: string, logo: string, siteUrl: string) {
    this.recordService.createRecord('sponsor', { data: { name, description, logo, siteUrl } }).subscribe(() => this.loadAllRecords());
  }
  updateSponsor(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    this.recordService.updateRecord('sponsor', id, { data: payload }).subscribe(() => this.loadAllRecords());
  }
  deleteSponsor(id: string) { this.recordService.deleteRecord('sponsor', id).subscribe(() => this.loadAllRecords()); }
  respondToRequest(id: string, app: boolean) { this.recordService.updateRecord('join_request', id, { data: { status: app ? 'accepted' : 'rejected' } }).subscribe(() => this.loadAllRecords()); }
  requestJoinTeam(teamId: string) {
    const user = this.currentUser();
    if (!user) return;
    this.recordService.createRecord('join_request', { data: { teamId, userId: user.id, userName: user.name, userAvatar: user.avatar, status: 'pending', date: new Date().toISOString() } }).subscribe(() => this.loadAllRecords());
  }
  assignCaster(id: string) { this.recordService.updateRecord('match', id, { data: { casterId: this.currentUser()?.id } }).subscribe(() => this.loadAllRecords()); }
  
  getCompetitionById(id: string) { return computed(() => this.competitions().find(c => c.id === id)); }
  getTitleById(id: string) { return computed(() => this.titles().find(t => t.id === id)); }
  getTeamById(id: string) { return computed(() => this.teams().find(t => t.id === id)); }
  getMatchById(id: string) { return computed(() => this.matches().find(m => m.id === id)); }
  getMatchesByCompetition(compId: string) { return computed(() => this.matches().filter(m => m.competitionId === compId)); }
  getMatchesByTeam(teamName: string) { return computed(() => this.matches().filter(m => m.teamA === teamName || m.teamB === teamName)); }
  getCompetitionsByTitle(titleId: string) { return computed(() => this.competitions().filter(c => c.titleId === titleId && c.status !== 'draft')); }
  getUserById(id: string) { return computed(() => this.users().find(u => u.id === id)); }
  getReviewsByCasterId(id: string) { return computed(() => this.reviews().filter(r => r.casterId === id)); }
  
  banUser(userId: string) { 
    this.recordService.updateRecord('user', userId, { data: { status: 'banned' } }).subscribe(() => {
      this.addNotification('User status updated to BANNED.', 'warning');
      this.loadAllRecords();
    });
  }
  updateUserProfile(userId: string, data: any) { 
    const payload = { ...data };
    delete payload.id;
    this.recordService.updateRecord('user', userId, { data: payload }).subscribe(() => {
      this.addNotification('Profile synchronized successfully.', 'success');
      this.loadAllRecords();
    });
  }
  logout() { this.authService.logout(); }
  login(r: any) {} 
}
