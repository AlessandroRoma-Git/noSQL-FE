
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { EntityDefinitionService } from '../../core/services/entity-definition.service';
import { EmailTemplateService } from '../../core/services/email-template.service';
import { GroupService } from '../../core/services/group.service';
import { UserService } from '../../core/services/user.service';
import { MenuService } from '../../core/services/menu.service';

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

  ngOnInit(): void {
    this.entityCount$ = this.entityService.getEntityDefinitions().pipe(map(items => items.length));
    this.templateCount$ = this.emailTemplateService.getEmailTemplates().pipe(map(items => items.length));
    this.groupCount$ = this.groupService.getGroups().pipe(map(items => items.length));
    this.userCount$ = this.userService.getUsers().pipe(map(items => items.length));
    this.menuCount$ = this.menuService.getMenuItems().pipe(map(items => items.length));
  }
}
