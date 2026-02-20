
# 1. Frontend Architecture Overview

This document provides a high-level overview of the frontend architecture for the CMS NoSQL Configurator application.

## 1.1. Core Technologies

- **Framework**: Angular (v21+) using Standalone Components.
- **Styling**: Tailwind CSS, using the "arbitrary value" syntax `[rgb(var(--css-variable))]` to consume a dynamic, CSS-variable-driven theming system.
- **State Management**: A reactive "Service-with-a-Subject" pattern using RxJS.
- **Build Tool**: Angular CLI (Vite).

## 1.2. Project Structure

- `src/app/core/`: Contains singleton services, data models, and route guards.
- `src/app/features/`: Encapsulates the primary features, each in its own folder (e.g., `dashboard`, `entity-definitions`, `records`, `files`).
- `src/app/shared/`: Holds reusable UI components like the global `ModalComponent`.

## 1.3. Navigation

This documentation is split into several parts for clarity:

- **[2. State Management](./02-STATE_MANAGEMENT.md)**
- **[3. Theming System](./03-THEMING.md)**
- **[4. Authentication Flow](./04-AUTHENTICATION.md)**
- **[5. Modal System](./05-MODAL_SYSTEM.md)**
- **[6. Dynamic Forms for Records](./06-DYNAMIC_FORMS.md)** (New)
