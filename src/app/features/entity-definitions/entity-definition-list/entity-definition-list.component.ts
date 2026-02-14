
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityDefinitionService } from '../../../core/services/entity-definition.service';
import { EntityDefinition } from '../../../core/models/entity-definition.model';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../core/services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-entity-definition-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entity-definition-list.component.html',
  styleUrls: ['./entity-definition-list.component.css']
})
export class EntityDefinitionListComponent implements OnInit {
  private entityDefinitionService = inject(EntityDefinitionService);
  private modalService = inject(ModalService);
  public definitions$!: Observable<EntityDefinition[]>;

  ngOnInit(): void {
    this.loadDefinitions();
  }

  loadDefinitions(): void {
    this.definitions$ = this.entityDefinitionService.getEntityDefinitions();
  }

  onDelete(key: string): void {
    this.modalService.confirm(
      'Confirm Deletion',
      `Are you sure you want to delete the entity definition <strong>${key}</strong>? This action cannot be undone.`
    ).pipe(
      filter(confirmed => confirmed) // Proceed only if the user confirmed
    ).subscribe(() => {
      this.entityDefinitionService.deleteEntityDefinition(key).subscribe(() => {
        this.loadDefinitions();
      });
    });
  }

  showUsage(def: EntityDefinition): void {
    const title = `API Usage for: ${def.label}`;

    const samplePayload = def.fields.reduce((acc, field) => {
      let value: any = '';
      switch (field.type) {
        case 'STRING': value = 'string value'; break;
        case 'EMAIL': value = 'user@example.com'; break;
        case 'NUMBER': value = field.min ?? 0; break;
        case 'BOOLEAN': value = true; break;
        case 'DATE': value = new Date().toISOString(); break;
        case 'ENUM': value = field.enumValues?.[0] || 'enum_value'; break;
      }
      acc[field.name] = value;
      return acc;
    }, {} as Record<string, any>);

    const payloadString = JSON.stringify({ data: samplePayload }, null, 2);

    const content = `
      <p>Here is an example of how to interact with the <strong>${def.entityKey}</strong> entity via the API.</p>

      <h4 class="mt-4 font-semibold text-[rgb(var(--color-primary))]">Create Record Endpoint</h4>
      <p><code>POST /api/v1/records/${def.entityKey}</code></p>

      <h4 class="mt-4 font-semibold text-[rgb(var(--color-primary))]">Sample Payload</h4>
      <pre class="bg-[rgb(var(--color-bg-base))] p-2 rounded-md text-sm text-[rgb(var(--color-text))]"><code>${payloadString}</code></pre>
    `;

    this.modalService.open({ title, content });
  }
}
