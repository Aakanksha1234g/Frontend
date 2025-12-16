# Templates

## Overview

The pitch editor includes a template system that allows users to apply pre-designed layouts to their pitches.

## Files Involved

*   `src/products/pitch-craft/pages/edit-pitch/controls/TemplatesControls.jsx`: This component provides the UI for selecting and applying templates.
*   `src/products/pitch-craft/contexts/CanvasContext.jsx`: This context contains the functions for loading and applying templates.

## Implementation Details

### Loading Templates

The `TemplatesControls.jsx` component fetches a list of available templates from the server. When a user selects a template, the `loadTemplate` function in `CanvasContext.jsx` is called.

### Applying Templates

The `loadTemplate` function loads the template data, which is a JSON representation of a Fabric.js canvas. The function then clears the current canvas and loads the template data onto it.
