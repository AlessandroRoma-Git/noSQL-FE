
# 3. Theming System

The application features a dynamic, multi-theme system that allows users to change the application's appearance in real-time.

## 3.1. Core Concept

The theming system is built upon CSS Custom Properties (Variables) and is controlled by a central `ThemeService`. This approach avoids complex style overrides and ensures consistent application of themes across all components, including those created dynamically.

## 3.2. Implementation

1.  **`ThemeService` as the Source of Truth**: The `ThemeService` holds an array of `Theme` objects. Each object contains a unique `id`, a display `name`, and a `colors` map. The `colors` map defines the RGB values for the core color variables of the application.

    ```typescript
    private themes: Theme[] = [
      {
        name: 'Coder',
        id: 'coder',
        colors: { 
          '--color-primary': '115, 239, 105',
          '--color-accent': '219, 39, 119',
          // ... other colors
        }
      },
      // ... other themes
    ];
    ```

2.  **Dynamic Style Injection**: When `setTheme(themeId)` is called, the service does not just apply a CSS class. Instead, it directly manipulates the document's styles by setting the CSS variables on the `:root` element (`document.documentElement`).

    ```typescript
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    ```
    This method is robust and guarantees that the variables are globally available.

3.  **Tailwind CSS Integration**: The `tailwind.config.js` file is configured to be "unaware" of specific colors. Instead, its color utilities are defined to use our CSS variables.

    ```javascript
    // tailwind.config.js
    theme: {
      extend: {
        // No custom color names are defined here.
      },
    },
    ```

    In the HTML and CSS, we use Tailwind's "arbitrary value" syntax to apply these variables.

    ```html
    <!-- Example from app.html -->
    <div class="bg-[rgb(var(--color-bg-base))] text-[rgb(var(--color-text))]">...</div>
    ```

4.  **Persistence**: The ID of the currently active theme is saved to `localStorage`, so the user's selection is remembered across sessions. The `loadTheme()` method in the service reads this value on application startup.

## 3.3. Benefits of this Approach

- **Centralized**: All theme definitions are in one place.
- **Dynamic**: Themes can be changed instantly without a page reload.
- **Consistent**: Because all components reference the same global CSS variables, the theme is applied consistently everywhere, including in dynamically generated modals.
- **Scalable**: Adding a new theme is as simple as adding a new object to the `themes` array in the `ThemeService`.
