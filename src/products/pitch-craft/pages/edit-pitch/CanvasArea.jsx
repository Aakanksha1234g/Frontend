import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export default function CanvasArea({ className = "" }) {
  const { isLoadingSlide, slides, canvasDimensions } = useCanvas();

  const noData = !slides?.length;

  return (
    <div
      id="canvas-wrapper"
      className={`relative flex flex-col items-center justify-center ${className}`}
    >
      <canvas
        id="fabric-canvas"
        className={`hover:border-2 hover:border-[#999999] backdrop-blur-5xl rounded-xl object-contain ${noData || isLoadingSlide ? "" : ""}`}
      />
    </div>
  );
}
