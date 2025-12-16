import { useGroupActions } from '@products/pitch-craft/hooks/useGroupActions';

export default function GroupControls() {
  const { groupSelection, ungroupSelection, discardSelection } =
    useGroupActions();

  return (
    <>
      <button
        className="bg-yellow-500 text-white px-3 py-1 rounded"
        onClick={groupSelection}
      >
        Group
      </button>
      <button
        className="bg-yellow-600 text-white px-3 py-1 rounded"
        onClick={ungroupSelection}
      >
        Ungroup
      </button>
      <button
        className="bg-gray-500 text-white px-3 py-1 rounded"
        onClick={discardSelection}
      >
        Discard Selection
      </button>
    </>
  );
}
