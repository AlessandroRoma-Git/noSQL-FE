
# 2. State Management: The "Service-with-a-Subject" Pattern

To manage application state, this project uses a lightweight, reactive pattern based on RxJS, often called "Service-with-a-Subject." This approach provides the benefits of reactive state management without the overhead of a full-fledged library like NgRx.

## 2.1. Core Concept

The core idea is to make services the single source of truth for a specific piece of application state. Components do not fetch or hold state themselves; they subscribe to observables provided by the services.

## 2.2. Implementation

Each data-managing service (e.g., `EntityDefinitionService`, `UserService`) follows this implementation:

1.  **Private `BehaviorSubject`**: The service holds a private `BehaviorSubject` which stores the current state (e.g., an array of `EntityDefinition`). A `BehaviorSubject` is used because it always holds the most recent value and emits it to new subscribers immediately.

    ```typescript
    private definitionsSubject = new BehaviorSubject<EntityDefinition[]>([]);
    ```

2.  **Public `Observable`**: The service exposes a public `Observable` derived from the subject. This prevents components from directly pushing new values into the state, enforcing a unidirectional data flow.

    ```typescript
    public definitions$: Observable<EntityDefinition[]> = this.definitionsSubject.asObservable();
    ```

3.  **Load Method**: A `load...()` method fetches the initial data from the backend API. Upon a successful response, it pushes the new data into the `BehaviorSubject` using `.next()`.

    ```typescript
    loadEntityDefinitions(): Observable<EntityDefinition[]> {
      return this.http.get<EntityDefinition[]>(this.apiUrl).pipe(
        tap(definitions => this.definitionsSubject.next(definitions))
      );
    }
    ```

4.  **Mutating Operations**: Methods that change the state on the backend (e.g., `create`, `update`, `delete`) are piped with a `tap()` operator. After the primary operation succeeds, this operator triggers a call to the `load...()` method to re-fetch the data, ensuring the UI is always in sync with the backend.

    ```typescript
    deleteEntityDefinition(key: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${key}`).pipe(
        tap(() => this.loadEntityDefinitions().subscribe())
      );
    }
    ```

## 2.3. Component Usage

Components subscribe to the public observable to display data. Because they are subscribed to a stream, they automatically update whenever the service pushes a new value.

```typescript
// In a component's ngOnInit:
this.definitions$ = this.entityDefinitionService.definitions$; // Subscribe to the stream
this.entityDefinitionService.loadEntityDefinitions().subscribe(); // Trigger initial load
```

This pattern ensures a clean separation of concerns, centralizes state logic, and creates a highly reactive user interface.
