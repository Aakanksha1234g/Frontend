# State Management

## Overview

The pitch editor uses a combination of React state and context to manage the application state.

## Files Involved

*   `src/products/pitch-craft/contexts/CanvasContext.jsx`: This is the main context for managing the state of the canvas and its objects.
*   `src/products/pitch-craft/hooks/useContextMenu.jsx`: This hook is used to manage the state of the context menu.
*   `src/products/pitch-craft/pages/edit-pitch/index.jsx`: This component is where the main `CanvasProvider` is used.

## Implementation Details

### Canvas Context

The `CanvasContext` is the single source of truth for the state of the canvas. It stores the Fabric.js canvas instance, the current slide, the slides array, and other canvas-related state.

The `CanvasProvider` component is responsible for initializing the canvas and providing the context to its children.

The `useCanvas` hook is used by other components to access the canvas state and functions.

### Other State

In addition to the `CanvasContext`, the pitch editor also uses local state to manage the state of individual components. For example, the `EffectsPanel.jsx` component uses local state to manage the values of the effect sliders.

The `useContextMenu` hook is a custom hook that is used to manage the state of the context menu. It provides a simple way to open and close the context menu and to set its position.
