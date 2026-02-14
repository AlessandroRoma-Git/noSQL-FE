
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
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Entity Definitions</h1>
        <a routerLink="new" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Create New
        </a>
      </div>
      <div *ngIf="definitions$ | async as definitions; else loading" class="bg-white shadow-md rounded-lg">
        <div *ngIf="definitions.length > 0; else empty">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let def of definitions" class="p-4 flex justify-between items-center hover:bg-gray-50">
              <div>
                <p class="text-lg font-semibold text-indigo-600">{{ def.label }}</p>
                <p class="text-sm text-gray-500">{{ def.entityKey }}</p>
              </div>
              <div class="space-x-4">
                <a [routerLink]="['edit', def.entityKey]" class="text-blue-500 hover:underline">Edit</a>
                <button (click)="onDelete(def.entityKey)" class="text-red-500 hover:underline">Delete</button>
              </div>
            </li>
          </ul>
        </div>
        <ng-template #empty>
          <p class="p-4 text-gray-500">No entity definitions found. Click "Create New" to get started.</p>
        </ng-template>
      </div>
      <ng-template #loading>
        <p>Loading...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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
