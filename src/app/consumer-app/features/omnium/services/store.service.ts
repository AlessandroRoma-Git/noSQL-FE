import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { RecordService } from 'app/consumer-app/services/record.service';
import { AuthService } from 'app/common/services/auth.service';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export type UserRole = 'admin' | 'moderator' | 'player' | 'caster' | 'sponsor' | 'fan';
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  description?: string;
  teamId?: string; // If player
  elo?: number;
  badges?: string[]; // If caster
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
  code: string; // e.g. "1.0", "1.1", "2.1"
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
  // Advanced Details
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  matchRules: number; // Best Of X (e.g. 1, 3, 5, 30)
  maxTeams: number;
  minPlayers: number; // Min players per team roster
  maxPlayers: number; // Max players per team roster
  playDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  startTime?: string; // e.g. "20:00"
  matchesPerDay?: number; // e.g. 2
  roundDuration?: number; // in minutes, e.g. 15
  description?: string;
  rules: CompetitionRule[]; // Structured Rulebook
  registeredTeams?: string[]; // IDs of teams selected (useful for drafts)
  roundRobinType?: 'single' | 'double'; // New Field
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  founded: string;
  wins: number;
  losses: number;
  members: string[]; // List of User Names (for display simplicity)
  captainId: string; // ID of the user who manages the team
  description?: string;
}

export interface JoinRequest {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: Date;
}

export interface Match {
  id: string;
  competitionId: string;
  teamA: string; // Team Name or "TBD"
  teamB: string; // Team Name or "TBD"
  scoreA: number;
  scoreB: number;
  date: string;
  status: 'scheduled' | 'live' | 'completed' | 'disputed';
  casterId?: string;
  confirmedByA: boolean;
  confirmedByB: boolean;
  round?: string; // e.g., "Quarterfinals", "Semifinals", "Round 1"
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

  // --- CMS STATE MAPPING ---
  
  // Mappiamo l'utente del CMS sul modello dell'app Omnium
  currentUser = toSignal(this.authService.userState$.pipe(
    map(state => {
      if (!state) return null;
      
      let role: UserRole = 'fan';
      if (state.systemRoles.includes('ADMIN') || state.systemRoles.includes('SUPER_ADMIN')) {
        role = 'admin';
      } else if (state.groups.includes('casters')) {
        role = 'caster';
      } else if (state.groups.includes('moderators')) {
        role = 'moderator';
      } else if (state.groups.includes('sponsors')) {
        role = 'sponsor';
      } else if (state.groups.includes('players')) {
        role = 'player';
      }

      return {
        id: state.username || 'unknown',
        name: state.username || 'User',
        role: role,
        avatar: 'https://picsum.photos/seed/' + state.username + '/100/100',
        status: 'active',
        elo: 1200 // Default initial ELO
      } as User;
    })
  ));

  notifications = signal<Notification[]>([]);
  toasts = signal<Toast[]>([]);
  
  // Data Signals (Popolati dal RecordService)
  users = signal<User[]>([]);
  titles = signal<Title[]>([]);
  competitions = signal<Competition[]>([]);
  teams = signal<Team[]>([]);
  matches = signal<Match[]>([]);
  news = signal<NewsItem[]>([]);
  reviews = signal<Review[]>([]);
  sponsors = signal<Sponsor[]>([]);
  joinRequests = signal<JoinRequest[]>([]);

  constructor() {
    this.initData();
  }

  private initData() {
    // Carichiamo i dati iniziali dal CMS solo se siamo nel browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllRecords();
    }
  }

  public loadAllRecords() {
    this.recordService.searchRecords('title').subscribe(res => this.titles.set(res.content as any));
    this.recordService.searchRecords('competition').subscribe(res => this.competitions.set(res.content as any));
    this.recordService.searchRecords('team').subscribe(res => this.teams.set(res.content as any));
    this.recordService.searchRecords('match').subscribe(res => this.matches.set(res.content as any));
    this.recordService.searchRecords('news').subscribe(res => this.news.set(res.content as any));
    this.recordService.searchRecords('sponsor').subscribe(res => this.sponsors.set(res.content as any));
    this.recordService.searchRecords('review').subscribe(res => this.reviews.set(res.content as any));
    this.recordService.searchRecords('join_request').subscribe(res => this.joinRequests.set(res.content as any));
    // Nota: Gli utenti di sistema sono gestiti dall'AuthService, 
    // ma potremmo avere un'entità 'player-profile' nel CMS per dettagli extra.
  }

  // --- Computed ---
  activeCompetitions = computed(() => this.competitions().filter(c => c.status === 'active'));
  
  draftCompetitions = computed(() => this.competitions().filter(c => c.status === 'draft'));

  myMatches = computed(() => {
    const user = this.currentUser();
    if (!user || user.role !== 'player') return [];
    
    let myTeamName = '';
    if (user.teamId) {
       const team = this.teams().find(t => t.id === user.teamId);
       if(team) myTeamName = team.name;
    }
    
    if (!myTeamName) {
        const t = this.teams().find(team => team.members.includes(user.name));
        if (t) myTeamName = t.name;
    }

    if (!myTeamName) return [];

    return this.matches().filter(m => m.teamA === myTeamName || m.teamB === myTeamName);
  });

  myTeamRequests = computed(() => {
    const user = this.currentUser();
    if (!user || !user.teamId) return [];
    const team = this.teams().find(t => t.id === user.teamId);
    if (!team || team.captainId !== user.id) return [];
    return this.joinRequests().filter(r => r.teamId === user.teamId && r.status === 'pending');
  });

  hasPendingRequest = (teamId: string) => computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return this.joinRequests().some(r => r.teamId === teamId && r.userId === user.id && r.status === 'pending');
  });

  availableCasts = computed(() => {
    return this.matches().filter(m => m.status === 'scheduled' && !m.casterId);
  });

  unreadNotificationsCount = computed(() => this.notifications().filter(n => !n.read).length);

  // --- Getters ---
  getCompetitionById(id: string) {
    return computed(() => this.competitions().find(c => c.id === id));
  }
  
  getTitleById(id: string) {
    return computed(() => this.titles().find(t => t.id === id));
  }
  
  getTeamById(id: string) {
    return computed(() => this.teams().find(t => t.id === id));
  }

  getMatchById(id: string) {
    return computed(() => this.matches().find(m => m.id === id));
  }

  getMatchesByCompetition(compId: string) {
    return computed(() => this.matches().filter(m => m.competitionId === compId));
  }
  
  getMatchesByTeam(teamName: string) {
    return computed(() => this.matches().filter(m => m.teamA === teamName || m.teamB === teamName));
  }

  getCompetitionsByTitle(titleId: string) {
    return computed(() => this.competitions().filter(c => c.titleId === titleId && c.status !== 'draft'));
  }

  getUserById(id: string) {
    return computed(() => this.users().find(u => u.id === id));
  }

  getReviewsByCasterId(casterId: string) {
    return computed(() => this.reviews().filter(r => r.casterId === casterId));
  }

  // --- Actions ---

  private showToast(message: string, type: 'info' | 'success' | 'warning' | 'error') {
      const id = Date.now().toString() + Math.random();
      this.toasts.update(t => [...t, { id, message, type }]);
      setTimeout(() => {
         this.toasts.update(t => t.filter(x => x.id !== id));
      }, 3500);
  }

  addNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.showToast(message, type);
    if (type !== 'error' && type !== 'warning') {
        const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          message,
          type,
          read: false,
          timestamp: new Date()
        };
        this.notifications.update(n => [newNotif, ...n]);
    }
  }

  markNotificationsRead() {
    this.notifications.update(n => n.map(notif => ({ ...notif, read: true })));
  }

  loginById(userId: string) {
    // In un sistema reale, qui useremmo authService.login()
    // Per ora simuliamo basandoci sugli utenti caricati o un login fittizio se necessario
    this.addNotification(`Login simulato per ${userId}`, 'info');
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
  }

  updateUserProfile(userId: string, data: { avatar: string, description: string }) {
    // In questo sistema, i profili utente estesi potrebbero essere salvati 
    // in un'entità 'user_profile' o aggiornati tramite un servizio utente dedicato.
    // Per ora, simuliamo l'aggiornamento e mostriamo una notifica.
    this.addNotification('Profilo aggiornato con successo!', 'success');
    
    // Se avessimo un'entità dedicata nel CMS:
    // this.recordService.updateRecord('user_profile', userId, { data }).subscribe(...)
  }

  confirmMatchResult(matchId: string, teamSide: 'A' | 'B', scoreA: number, scoreB: number) {
    const match = this.matches().find(m => m.id === matchId);
    if (!match) return;

    const updated = { ...match };
    if (teamSide === 'A') {
      updated.confirmedByA = true;
      updated.proposedScoreA = { a: scoreA, b: scoreB };
    } else {
      updated.confirmedByB = true;
      updated.proposedScoreB = { a: scoreA, b: scoreB };
    }

    if (updated.confirmedByA && updated.confirmedByB) {
      if (updated.proposedScoreA?.a === updated.proposedScoreB?.a && 
          updated.proposedScoreA?.b === updated.proposedScoreB?.b) {
        updated.scoreA = updated.proposedScoreA!.a;
        updated.scoreB = updated.proposedScoreA!.b;
        updated.status = 'completed';
      } else {
        updated.status = 'disputed';
      }
    }

    this.recordService.updateRecord('match', matchId, { data: updated }).subscribe(() => {
      this.addNotification('Risultato aggiornato nel CMS', 'success');
      this.loadAllRecords();
    });
  }

  assignCaster(matchId: string) {
    const user = this.currentUser();
    if (user?.role !== 'caster') return;
    
    this.recordService.updateRecord('match', matchId, { data: { casterId: user.id } }).subscribe(() => {
      this.addNotification('Ti sei assegnato al match con successo!', 'success');
      this.loadAllRecords();
    });
  }

  // Admin Actions: Create Data

  addTitle(name: string, publisher: string, desc: string, image: string, links: {platform: string, url: string}[]) {
      const data = {
          name,
          publisher,
          image: image || `https://picsum.photos/seed/${name}/400/200`,
          description: desc,
          downloadLinks: links
      };
      this.recordService.createRecord('title', { data }).subscribe(() => {
          this.addNotification(`Titolo "${name}" salvato nel CMS.`, 'success');
          this.loadAllRecords();
      });
  }

  deleteTitle(id: string) {
      this.recordService.deleteRecord('title', id).subscribe(() => {
          this.addNotification('Titolo eliminato dal CMS.', 'info');
          this.loadAllRecords();
      });
  }

  publishCompetition(id: string) {
     this.recordService.updateRecord('competition', id, { data: { status: 'upcoming' } }).subscribe(() => {
         this.addNotification('Competizione pubblicata!', 'success');
         this.loadAllRecords();
     });
  }

  createCompetition(name: string, titleId: string, prize: string, selectedTeamIds: string[], isDraft: boolean, details: any) {
      const data = {
          titleId,
          name,
          prizePool: prize,
          status: isDraft ? 'draft' : 'upcoming',
          image: details.image || `https://picsum.photos/seed/${name}/300/150`,
          ...details,
          registeredTeams: selectedTeamIds
      };
      
      this.recordService.createRecord('competition', { data }).subscribe(() => {
          this.addNotification('Competizione creata nel CMS.', 'success');
          this.loadAllRecords();
      });
  }

  updateCompetition(id: string, name: string, titleId: string, prize: string, selectedTeamIds: string[], isDraft: boolean, details: any) {
      const data = {
          name,
          titleId,
          prizePool: prize,
          status: isDraft ? 'draft' : 'upcoming',
          ...details,
          registeredTeams: selectedTeamIds
      };
      this.recordService.updateRecord('competition', id, { data }).subscribe(() => {
          this.addNotification('Competizione aggiornata.', 'success');
          this.loadAllRecords();
      });
  }

  requestJoinTeam(teamId: string) {
    const user = this.currentUser();
    if (!user) return;

    const data = {
        teamId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        status: 'pending',
        date: new Date()
    };

    this.recordService.createRecord('join_request', { data }).subscribe(() => {
        this.addNotification(`Richiesta inviata tramite CMS.`, 'success');
        this.loadAllRecords();
    });
  }

  respondToRequest(requestId: string, approve: boolean) {
      this.recordService.updateRecord('join_request', requestId, { data: { status: approve ? 'accepted' : 'rejected' } }).subscribe(() => {
          this.addNotification('Risposta salvata nel CMS.', 'info');
          this.loadAllRecords();
      });
  }

  createTeam(name: string, description: string) {
    const user = this.currentUser();
    if (!user) return;

    const data = {
      name,
      description,
      logo: 'https://picsum.photos/seed/' + name + '/100/100',
      founded: new Date().getFullYear().toString(),
      wins: 0,
      losses: 0,
      captainId: user.id,
      members: [user.name]
    };

    this.recordService.createRecord('team', { data }).subscribe(() => {
        this.addNotification(`Team "${name}" creato nel CMS.`, 'success');
        this.loadAllRecords();
    });
  }

  // --- Stubs for backward compatibility with generated DashboardComponent ---
  login(role: UserRole) {
    this.addNotification(`Login simulato per ruolo ${role}. Nel sistema reale usare AuthService.`, 'info');
  }

  banUser(userId: string) {
    this.addNotification('Gestione utenti tramite Configuratore CMS.', 'warning');
  }

  deleteReview(reviewId: string) {
    this.recordService.deleteRecord('review', reviewId).subscribe(() => {
      this.addNotification('Recensione eliminata.', 'info');
      this.loadAllRecords();
    });
  }
  
  deleteCompetition(compId: string) {
     this.recordService.deleteRecord('competition', compId).subscribe(() => {
       this.addNotification('Competizione eliminata.', 'info');
       this.loadAllRecords();
     });
  }
}