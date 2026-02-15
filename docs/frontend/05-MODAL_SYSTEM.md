
# 5. Global Modal System

The application features a flexible, global modal system controlled by a single service, `ModalService`. This allows any component to easily open different types of dialogs without needing to manage its own modal state or UI.

## 5.1. Core Concept

The `ModalService` acts as a centralized controller for a single, application-wide `ModalComponent`. It uses an RxJS `BehaviorSubject` to broadcast the desired state of the modal (e.g., open/closed, content to display).

## 5.2. Types of Modals

The system is designed to handle two primary use cases:

1.  **Dynamic Component Modals**: For complex interactions, the modal can host any standalone Angular component. This is achieved by passing the component's `Type` to the service.
    
    ```typescript
    // Example: Opening a ThemeEditorComponent
    import { ThemeEditorComponent } from './shared/components/theme-editor/theme-editor.component';
    // ...
    this.modalService.open(ThemeEditorComponent);
    ```

2.  **Simple Informational/Confirmation Modals**: For simpler messages and user confirmations, a `ModalData` object (containing a `title` and `content` string) can be passed. The `content` can include HTML.

    ```typescript
    // Example: Opening an informational modal
    this.modalService.open({
      title: 'API Usage',
      content: '<p>Here is how to use the API...</p>'
    });

    // Example: Opening a confirmation modal
    this.modalService.confirm('Confirm Deletion', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          // ... proceed with deletion
        }
      });
    ```

## 5.3. Implementation Details

- **`ModalService`**:
  - Manages a `BehaviorSubject<ModalState>` that holds the current state (`isOpen`, `content`, `isConfirmation`).
  - Provides the `open()` and `confirm()` methods to trigger the modal.
  - Uses a separate `Subject` to handle the boolean response from confirmation dialogs.

- **`ModalComponent`**:
  - Subscribes to `modalService.modalState$` to show or hide itself.
  - Uses a `<ng-template #content>` with `ViewContainerRef` to dynamically create and inject components when the content is a component `Type`.
  - Uses `[innerHTML]` to safely render the `content` string when the content is a `ModalData` object. This allows for basic HTML formatting in simple modals.
  - Contains the logic for the "Confirm" and "Cancel" buttons, which call the service's `respond()` method.

This architecture provides a powerful and decoupled way to handle all modal interactions throughout the application from a single, consistent entry point.
