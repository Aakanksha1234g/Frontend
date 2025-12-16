# Canvas Initialization

## Overview

The pitch editor uses the Fabric.js library to create and manage the canvas. The canvas is initialized in the `CanvasArea.jsx` component.

## Files Involved

*   `src/products/pitch-craft/pages/edit-pitch/CanvasArea.jsx`: This is where the `<canvas>` element is rendered.
*   `src/products/pitch-craft/contexts/CanvasContext.jsx`: This context is responsible for initializing and managing the Fabric.js canvas instance.

## Implementation Details

The `CanvasProvider` in `CanvasContext.jsx` is responsible for creating the Fabric.js canvas instance. It uses the `fabric.Canvas` constructor to create a new canvas and attaches it to the `<canvas>` element in `CanvasArea.jsx`.

The canvas instance is then stored in the `canvas` ref and made available to other components through the `useCanvas` hook.

### Canvas Dimensions

The dimensions of the canvas are determined by the `canvasDimensions` state in the `CanvasContext`. This state is updated when the window is resized, and the canvas is re-rendered with the new dimensions.
