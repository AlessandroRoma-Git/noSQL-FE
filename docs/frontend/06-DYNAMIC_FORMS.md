
# 6. Dynamic Forms and Record Management

A core feature of the application is its ability to create, update, and validate records for entities that are defined at runtime. This is accomplished through a dynamic form system built with Angular's Reactive Forms.

## 6.1. Core Components

- **`RecordListComponent`**: Displays a dynamic data grid of records for a specific entity. The columns of the grid are generated at runtime based on the fields defined in the `EntityDefinition`.
- **`RecordEditorComponent`**: Renders a dynamic form to create or edit a record. It inspects the `EntityDefinition` to build the appropriate form controls.
- **`ReferenceSearchComponent`**: A reusable component for handling fields of type `REFERENCE`, allowing users to search and select records from another entity.

## 6.2. Record Editor Implementation

1.  **Fetch Definition**: The `RecordEditorComponent` retrieves the `entityKey` from the route and fetches the corresponding `EntityDefinition`.

2.  **Build Form Controls**: The component iterates over the `fields` array of the definition. For each field, it creates a `FormControl` with the appropriate validators (e.g., `Validators.required`, `Validators.email`).

3.  **Render Dynamic Inputs**: In the template, an `@for` loop iterates over the fields. An `@switch` block checks the `type` of each field and renders the correct HTML input element:
    - `STRING` -> `<input type="text">`
    - `NUMBER` -> `<input type="number">`
    - `BOOLEAN` -> `<input type="checkbox">`
    - `DATE` -> `<input type="datetime-local">`
    - `ENUM` -> `<select>`
    - `REFERENCE` -> `<app-reference-search>`

## 6.3. Reference Field Implementation

The `ReferenceSearchComponent` provides a sophisticated UI for managing relationships between entities.

1.  **ControlValueAccessor**: It implements the `ControlValueAccessor` interface, allowing it to integrate seamlessly with Angular's reactive forms.
2.  **Modal-based Selection**: It displays the currently selected record IDs. An "Add/Select" button opens a modal.
3.  **Dynamic Search**: Inside the modal, the user can search for records in the referenced entity. The component now supports searching not only by `id` but also by any `STRING`, `EMAIL`, or `NUMBER` field defined in the target entity, making it much more user-friendly.
4.  **State Management**: The component uses RxJS `combineLatest` to react to changes in both the search term and the selected search field, providing a live, filtered list of records to choose from.

This architecture allows the frontend to adapt to any data structure defined in the backend, providing a true dynamic CMS experience.
