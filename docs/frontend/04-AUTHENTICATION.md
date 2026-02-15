
# 4. Authentication and Authorization

The application uses a token-based authentication system with JSON Web Tokens (JWT) and controls access to pages using route guards.

## 4.1. Core Components

- **`AuthService`**: The central service responsible for all authentication-related logic. It manages the user's session, handles login/logout, and stores the authentication token.
- **Route Guards**: Functional route guards (`authGuard` and `publicGuard`) protect the application's routes.
- **`AuthInterceptor` (Implicit)**: Although not explicitly created in a separate file, an `HttpInterceptorFn` is provided in `app.config.ts` to automatically attach the JWT to outgoing API requests.

## 4.2. Authentication Flow

1.  **Login**: The user enters their credentials on the `/login` page. The `AuthService.login()` method sends these to the backend.
2.  **Token Reception**: Upon successful login, the backend returns a JWT.
3.  **State Storage**: The `AuthService` saves the user's state (including the token, username, and roles) in a `BehaviorSubject` and persists it to `localStorage`. This ensures the session is maintained even after a page refresh.
4.  **Navigation**: The user is redirected to the main application dashboard.

## 4.3. Authorization and Route Protection

Access to different parts of the application is controlled by two main route guards:

### `authGuard`

- **Purpose**: To protect private routes that should only be accessible to authenticated users.
- **Logic**: It checks the `isAuthenticated$` observable from the `AuthService`.
  - If the user is authenticated, it allows access (`return true`).
  - If the user is not authenticated, it redirects them to the `/login` page and denies access (`return false`).
- **Usage**: Applied to all parent routes that contain protected content.

### `publicGuard`

- **Purpose**: To protect public routes (like `/login`) from being accessed by users who are already logged in.
- **Logic**: It also checks the `isAuthenticated$` observable.
  - If the user is **not** authenticated, it allows access (`return true`).
  - If the user **is** authenticated, it redirects them to the default dashboard (`/dashboard`) and denies access (`return false`).
- **Usage**: Applied to routes like `/login` and `/recover-password`.

## 4.4. Automatic Token Injection

To avoid manually adding the `Authorization` header to every API call, an HTTP interceptor is used.

- It is registered in `app.config.ts` within the `provideHttpClient` function, using `withInterceptors`.
- The interceptor function checks if a token exists in the `AuthService`.
- If a token is present, it clones the outgoing HTTP request and adds the `Authorization: Bearer <token>` header before sending it to the backend.
- This process is transparent to the individual services (like `EntityDefinitionService`), which can focus solely on their specific API endpoints.
