# Image Features

## Overview

The pitch editor allows users to add and manipulate images on the canvas. The image features are implemented using Fabric.js's image objects.

## Files Involved

*   `src/products/pitch-craft/pages/edit-pitch/controls/ImageControls.jsx`: This component provides the UI for adding images.
*   `src/products/pitch-craft/pages/edit-pitch/MediaPanel.jsx`: This component contains the `ImageControls` component.
*   `src/products/pitch-craft/contexts/CanvasContext.jsx`: This context contains the functions for adding and manipulating image objects on the canvas.

## Implementation Details

### Adding Images

When a user clicks the "Add Image" button in `ImageControls.jsx`, they can either upload an image from their computer or select one from the media library. The `addImage` function in `CanvasContext.jsx` is then called. This function creates a new `fabric.Image` object and adds it to the canvas.

### Image Manipulation

Once an image is added to the canvas, users can resize and move it as needed. Fabric.js provides built-in controls for these manipulations.

### Image Effects

The `EffectsPanel.jsx` component provides a variety of options for applying effects to images, such as brightness, contrast, and saturation. When a user changes one of these options, the corresponding filter is applied to the active image object.
