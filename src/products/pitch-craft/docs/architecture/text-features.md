# Text Features

## Overview

The pitch editor allows users to add and manipulate text on the canvas. The text features are implemented using Fabric.js's text objects.

## Files Involved

*   `src/products/pitch-craft/pages/edit-pitch/controls/TextControls.jsx`: This component provides the UI for adding and editing text.
*   `src/products/pitch-craft/contexts/CanvasContext.jsx`: This context contains the functions for adding and manipulating text objects on the canvas.

## Implementation Details

### Adding Text

When a user clicks the "Add Text" button in `TextControls.jsx`, the `addText` function in `CanvasContext.jsx` is called. This function creates a new `fabric.IText` object and adds it to the canvas.

### Editing Text

Users can edit text by double-clicking on a text object. This enables Fabric.js's built-in text editing functionality.

### Text Styling

The `TextControls.jsx` component provides a variety of options for styling text, such as font family, font size, and color. When a user changes one of these options, the corresponding property of the active text object is updated.
