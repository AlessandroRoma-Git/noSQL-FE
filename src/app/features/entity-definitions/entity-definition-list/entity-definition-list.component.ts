
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { EntityDefinition } from '../../../core/models/entity-definition.model';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-entity-definition-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entity-definition-list.component.html',
  styleUrls: ['./entity-definition-list.component.css']
})
export class EntityDefinitionListComponent implements OnInit {
  private entityDefinitionService = inject(EntityDefinitionService);
  public definitions$!: Observable<EntityDefinition[]>;

  ngOnInit(): void {
    this.loadDefinitions();
  }

  loadDefinitions(): void {
    this.definitions$ = this.entityDefinitionService.getEntityDefinitions();
  }

  onDelete(key: string): void {
    if (confirm('Are you sure you want to delete this entity definition? This action cannot be undone.')) {
      this.entityDefinitionService.deleteEntityDefinition(key).subscribe(() => {
        // Refresh the list after deletion
        this.loadDefinitions();
      });
    }
  }
}
