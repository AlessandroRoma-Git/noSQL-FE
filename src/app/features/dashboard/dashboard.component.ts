
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { EmailTemplateService } from '../../core/services/email-template.service';
import { GroupService } from '../../core/services/group.service';
import { UserService } from '../../core/services/user.service';
import { MenuService } from '../../core/services/menu.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private entityService = inject(EntityDefinitionService);
  private emailTemplateService = inject(EmailTemplateService);
  private groupService = inject(GroupService);
  private userService = inject(UserService);
  private menuService = inject(MenuService);

  public entityCount$!: Observable<number>;
  public templateCount$!: Observable<number>;
  public groupCount$!: Observable<number>;
  public userCount$!: Observable<number>;
  public menuCount$!: Observable<number>;
  public recentUsers$!: Observable<User[]>;

  ngOnInit(): void {
    this.entityCount$ = this.entityService.definitions$.pipe(map(items => items.length));
    this.templateCount$ = this.emailTemplateService.templates$.pipe(map(items => items.length));
    this.groupCount$ = this.groupService.groups$.pipe(map(items => items.length));
    this.userCount$ = this.userService.users$.pipe(map(items => items.length));
    this.menuCount$ = this.menuService.menuItems$.pipe(map(items => items.length));

    this.recentUsers$ = this.userService.users$.pipe(
      map(users => users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5))
    );

    // Trigger initial loads
    this.entityService.loadEntityDefinitions().subscribe();
    this.emailTemplateService.loadEmailTemplates().subscribe();
    this.groupService.loadGroups().subscribe();
    this.userService.loadUsers().subscribe();
    this.menuService.loadMenuItems().subscribe();
  }
}
