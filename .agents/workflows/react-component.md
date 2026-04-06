---
description: Create a new React component for the web frontend
---
Follow these steps to create a new React component in the Musahm-Vault Frontend:

1. **Locate the Directory:**
   Navigate to `c:\Source\Musahm-Vault\Frontend\apps\web\src\components` or the appropriate feature folder.
2. **Create Component File:**
   Create a new `.tsx` file using PascalCase (e.g., `MyComponent.tsx`).
3. **Define Props Interface:**
   Define a TypeScript interface for the component props right above the functional component. Strongly type all props.
4. **Implement Component:**
   Use React functional components and hooks. Follow the project's styling standard (e.g., Tailwind CSS or CSS Modules). Keep the component focused on a single responsibility.
5. **Export:**
   Export the component. If the project uses barrel exports, update the respective `index.ts` file.
6. **Integration:**
   Import and mount the new component in the desired page or parent component. Check for any re-render optimizations (React.memo) if the component is heavy.
