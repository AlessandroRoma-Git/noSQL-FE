
# 8. Global Settings

The "Settings" page provides a centralized interface for administrators to configure high-level parameters of the CMS backend. This allows for tuning system behavior without needing to modify configuration files on the server.

## 8.1. Core Components

- **`SettingsService`**: A service designed to interact with the (currently unimplemented) backend endpoints for fetching and saving global settings (e.g., `GET /api/v1/settings`, `PUT /api/v1/settings`).
- **`SettingsComponent`**: The main component for the "Settings" page, containing a reactive form to manage all the settings.

## 8.2. Implemented Settings

The UI is organized into several sections:

### Email Settings

This is the most critical section for system functionality. It allows the administrator to map system events to specific email templates.

- **Default "From" Address**: Sets the global default sender address for emails.
- **New User / Admin Reset Template**: A dropdown menu to select the `EmailTemplate` that will be used when a new user is created or when an administrator resets a user's password. This corresponds to the `cms.email.password-template-id` backend setting.
- **User Password Recovery Template**: A separate dropdown to select the `EmailTemplate` used when a user initiates the password recovery process themselves. This corresponds to the `cms.email.recover-password-template-id` backend setting.

### Security Settings

- **Max Login Attempts**: Configures the number of failed login attempts before a user's account is locked.

### File Storage Settings

- **Storage Type**: A dropdown to switch the backend's storage mechanism between `MongoDB GridFS` and `Amazon S3`.
- **Max File Size**: Sets the maximum allowed file size for uploads, in bytes.

## 8.3. Backend Dependency

Currently, the `SettingsService` is using **mock data** because the corresponding backend endpoints have not yet been implemented. The frontend is fully prepared to connect to these endpoints as soon as they become available. The `getSettings()` method will need to be switched from returning an `of(...)` observable to making a real HTTP call, but no other changes to the frontend will be necessary.
