export const CANVAS_BASE_DIMENSIONS = {
  width: 1600,
  height: 800,
};

export const calculateScalingFactor = canvasDimensions => {
  if (!canvasDimensions?.width || !canvasDimensions?.height) {
    return { scale: 1 };
  }

  const scaleX = canvasDimensions.width / CANVAS_BASE_DIMENSIONS.width;
  const scaleY = canvasDimensions.height / CANVAS_BASE_DIMENSIONS.height;

  // Use uniform scaling to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  return { scale };
};
