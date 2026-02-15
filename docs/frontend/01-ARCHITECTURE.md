
# 1. Frontend Architecture Overview

This document provides a high-level overview of the frontend architecture for the CMS NoSQL Configurator application.

## 1.1. Core Technologies

- **Framework**: Angular (v21+) using Standalone Components. This choice promotes a modular, simplified, and more maintainable component structure.
- **Styling**: Tailwind CSS, used for its utility-first approach, which allows for rapid and consistent UI development directly in the HTML.
- **State Management**: A lightweight, reactive state management pattern using RxJS `BehaviorSubject` within services. This avoids the boilerplate of larger state management libraries while providing robust, reactive data flows.
- **Build Tool**: Angular CLI, powered by Vite for fast development server startup and builds.

## 1.2. Project Structure

The project's source code is organized to separate concerns and improve scalability:

- `src/app/core/`: Contains the application's core logic, including singleton services, data models, and route guards. This is the brain of the application.
- `src/app/features/`: Encapsulates the primary business features. Each feature (e.g., `dashboard`, `entity-definitions`, `users`) resides in its own folder, promoting modularity.
- `src/app/shared/`: Holds reusable UI components, directives, and pipes that are not tied to a specific feature, such as the global `ModalComponent` and `ToggleSwitchComponent`.

## 1.3. Navigation

This documentation is split into several parts for clarity:

- **[2. State Management](./02-STATE_MANAGEMENT.md)**
- **[3. Theming System](./03-THEMING.md)**
- **[4. Authentication Flow](./04-AUTHENTICATION.md)**
- **[5. Modal System](./05-MODAL_SYSTEM.md)**
