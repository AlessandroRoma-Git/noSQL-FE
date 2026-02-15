
# Frontend Architecture

This document provides an overview of the frontend architecture for the CMS NoSQL Configurator application.

## 1. Core Technologies

- **Framework**: Angular (v21+)
- **Styling**: Tailwind CSS
- **UI Components**: Standalone Components
- **State Management**: RxJS with `BehaviorSubject` in services (Service-with-a-Subject pattern)
- **Build Tool**: Angular CLI (Vite)

## 2. Project Structure

The project follows a standard Angular CLI structure, with key logic organized into three main folders within `src/app/`:

- `core/`: Contains singleton services, models, and guards that are used across the entire application.
  - `services/`: Houses all the logic for interacting with the backend API and managing application state.
  - `models/`: Defines the TypeScript interfaces for our data structures (e.g., `EntityDefinition`, `User`).
  - `guards/`: Contains route guards for authentication and authorization.
- `features/`: Contains the primary features of the application, with each feature encapsulated in its own module/folder (e.g., `dashboard`, `entity-definitions`, `users`).
- `shared/`: Contains reusable components, directives, and pipes that are not tied to a specific feature (e.g., `ModalComponent`, `ToggleSwitchComponent`).

## 3. Key Architectural Decisions

### 3.1. State Management: Service-with-a-Subject

Instead of using a heavy state management library like NgRx, we opted for a lighter, more direct approach using RxJS.

- Each data-managing service (e.g., `EntityDefinitionService`, `UserService`) contains a private `BehaviorSubject`.
- This subject holds the current state of the data (e.g., the list of entity definitions).
- The service exposes a public `Observable` (`service.data$`) that components can subscribe to.
- When a create, update, or delete operation is performed, the service makes the API call and, upon success, re-fetches the updated list and pushes it to the `BehaviorSubject` via `.next()`.
- All components subscribed to the public observable automatically receive the updated list and re-render, creating a reactive and self-updating UI.

### 3.2. Theming System

The application supports multiple, dynamically switchable themes.

- The `ThemeService` is the single source of truth for all theme information. It contains a list of `Theme` objects, each defining a palette of colors.
- When a theme is selected, the service dynamically sets CSS variables on the `:root` element of the document (e.g., `--color-primary`, `--color-bg-surface`).
- Tailwind CSS is configured to use these CSS variables for its color utilities (e.g., `bg-[rgb(var(--color-bg-base))]`).
- This approach allows the entire application's look and feel to be changed instantly without reloading, as all components reference the same set of global CSS variables. The selected theme is persisted in `localStorage`.

### 3.3. Global Modal System

A `ModalService` provides a global, application-wide mechanism for displaying modal dialogs.

- It can render two types of content:
  1.  **Dynamic Components**: Any Angular component can be passed to `modalService.open()` to be rendered inside the modal. This is used for complex UIs like the (now-removed) theme editor.
  2.  **Simple Data**: A `ModalData` object (title and content) can be passed to create simple informational or confirmation dialogs.
- The `ModalComponent` subscribes to the service's state and uses `ViewContainerRef` to dynamically create and insert components, or `[innerHTML]` to display simple HTML content.

### 3.4. Authentication Flow

- Authentication is managed by the `AuthService` using JWT (JSON Web Tokens).
- **Route Guards** (`authGuard`, `publicGuard`) protect the application's routes:
  - `authGuard` prevents unauthenticated users from accessing protected pages, redirecting them to `/login`.
  - `publicGuard` prevents authenticated users from accessing public pages like `/login`, redirecting them to the dashboard.
- The user's authentication state (token, roles, etc.) is stored in a `BehaviorSubject` within the `AuthService` and persisted in `localStorage`.
