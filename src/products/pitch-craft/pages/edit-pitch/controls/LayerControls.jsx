import { useLayerActions } from '@products/pitch-craft/hooks/useLayerActions';

export default function LayerControls() {
  const { bringForward, bringToFront, sendBackward, sendToBack } =
    useLayerActions();

  return (
    <>
      <button
        className="bg-orange-500 text-white px-3 py-1 rounded"
        onClick={bringForward}
      >
        Bring Forward
      </button>
      <button
        className="bg-orange-600 text-white px-3 py-1 rounded"
        onClick={bringToFront}
      >
        Bring to Front
      </button>
      <button
        className="bg-orange-400 text-white px-3 py-1 rounded"
        onClick={sendBackward}
      >
        Send Backward
      </button>
      <button
        className="bg-orange-300 text-white px-3 py-1 rounded"
        onClick={sendToBack}
      >
        Send to Back
      </button>
    </>
  );
}
