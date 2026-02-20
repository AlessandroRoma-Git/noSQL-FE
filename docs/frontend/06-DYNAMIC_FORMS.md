
# 6. Dynamic Forms for Records

A core feature of the application is its ability to create, update, and validate records for entities that are defined at runtime. This is accomplished through a dynamic form system built with Angular's Reactive Forms.

## 6.1. Core Component: `RecordEditorComponent`

The `RecordEditorComponent` is responsible for rendering the form to edit or create a record. It is not a static form; it builds itself dynamically based on the schema provided by an `EntityDefinition`.

## 6.2. Implementation Flow

1.  **Fetch Definition**: When the component initializes, it retrieves the `entityKey` from the route parameters. It then uses the `EntityDefinitionService` to fetch the complete definition for that entity.

2.  **Build Form Controls**: The `buildForm()` method iterates over the `fields` array of the fetched `EntityDefinition`. For each field, it creates a `FormControl` and adds it to a `FormGroup`.

    ```typescript
    const formControls: { [key: string]: any } = {};
    this.entityDefinition.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'EMAIL') {
        validators.push(Validators.email);
      }
      formControls[field.name] = [null, validators];
    });
    this.editorForm = this.fb.group(formControls);
    ```

3.  **Render Dynamic Inputs**: In the component's template (`record-editor.component.html`), an `@for` loop iterates over the `entityDefinition.fields`. Inside the loop, an `@switch` block checks the `type` of each field and renders the appropriate HTML input element:
    - `STRING` -> `<input type="text">`
    - `NUMBER` -> `<input type="number">`
    - `BOOLEAN` -> `<input type="checkbox">`
    - `DATE` -> `<input type="datetime-local">`
    - `ENUM` -> `<select>`
    - `REFERENCE` -> `<input type="text">` (for comma-separated IDs)

    ```html
    @for (field of entityDefinition.fields; track field.name) {
      <label [for]="field.name">{{ field.name }}</label>
      @switch (field.type) {
        @case ('STRING') { <input [formControlName]="field.name"> }
        @case ('NUMBER') { <input type="number" [formControlName]="field.name"> }
        // ... other cases
      }
    }
    ```

4.  **Data Patching**: In "edit" mode, after the form is built, the component fetches the specific record's data using the `RecordService` and uses `editorForm.patchValue(record.data)` to populate the dynamically created form controls.

This architecture allows the frontend to adapt to any data structure defined in the backend without requiring any changes to the frontend code, making it a true dynamic CMS configurator.
