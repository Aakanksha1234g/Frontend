import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';

// Sortable Item Component
const SortableItem = React.memo(({ scene }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: scene.scene_data_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isUpdated = scene.action_type === 'update';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`cursor-move flex items-center gap-2 ${isUpdated ? 'bg-primary text-white' : 'bg-black text-white'
        } py-2 px-3 shadow-md shadow-shadow-chat-button border border-white/10 rounded-lg`}
    >
      <div {...listeners} className="flex items-center gap-4 w-full">
        <div
          className={`w-8 text-center font-mono text-sm rounded py-0.5 ${isUpdated ? 'bg-primary text-white' : 'bg-black text-white'
            }`}
        >
          {scene.scene_sequence_no}
        </div>

        <div className="flex-1 font-medium text-sm truncate">
          {scene.scene_subscene} {scene.scene_interior_exterior}.
          {scene.scene_location} - {scene.scene_shot_time}
        </div>

        {isUpdated && (
          <div className="text-sm text-white ml-auto">
            {`${scene.original_sequence_no} → ${scene.scene_sequence_no}`}
          </div>
        )}
      </div>
    </div>
  );

});

// Main Dialog Component
export default function ResequenceScenesDialog({
  isOpen,
  onClose,
  scenes,
  script_id,
}) {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [localScenes, setLocalScenes] = useState([]);
  const [originalScenesMap, setOriginalScenesMap] = useState({});

  useEffect(() => {
    if (isOpen) {
      setLocalScenes(scenes);

      const originalMap = {};
      scenes.forEach(scene => {
        originalMap[scene.scene_data_id] = scene.scene_sequence_no;
      });
      setOriginalScenesMap(originalMap);
    }
  }, [isOpen, scenes]);

  const handleDragEnd = useCallback(
    event => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = localScenes.findIndex(
        s => s.scene_data_id === active.id
      );
      const newIndex = localScenes.findIndex(s => s.scene_data_id === over.id);

      const reordered = arrayMove(localScenes, oldIndex, newIndex);

      const updatedScenes = reordered.map((scene, index) => {
        const newSequenceNo = index + 1;
        const originalSeq = originalScenesMap[scene.scene_data_id];

        if (originalSeq !== newSequenceNo) {
          return {
            ...scene,
            action_type: 'update',
            original_sequence_no: originalSeq,
            scene_sequence_no: newSequenceNo,
          };
        } else {
          return {
            ...scene,
            action_type: undefined,
            original_sequence_no: undefined,
            scene_sequence_no: newSequenceNo,
          };
        }
      });

      setLocalScenes(updatedScenes);
    },
    [localScenes, originalScenesMap]
  );

  const handleClose = useCallback(() => {
    setLocalScenes([]);
    setOriginalScenesMap({});
    onClose();
  }, [onClose]);

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ['saveSceneDataAfterReordering', script_id],
    mutationFn: () => {
      const changedScenes = localScenes.filter(
        scene => scene.action_type === 'update'
      );
      sendData({
        endpoint: `/scene_data_processing/${script_id}/save_scene_data`,
        method: 'PUT',
        body: JSON.stringify({ scene_summaries: changedScenes }),
      });
    },
    onSuccess: response => {
     
      queryClient.invalidateQueries(['getScriptInputData', script_id]);
      handleClose();
    },
    onError: error => {
      console.error('Error saving scenes:', error);
    
    },
  });

  const handleSaveSequenceOrder = useCallback(async () => {
    mutate();
  }, [localScenes, script_id, handleClose]);

  const hasChanges = localScenes.some(scene => scene.action_type === 'update');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto ">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

          {/* Dialog */}
          <div className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-black border border-white/10 rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Reorder Scenes</h2>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop scenes to reorder them. Changes will be saved when
                you click Save.
              </p>
              <div className="w-full border-b border-white/20 "></div>
              <div className="overflow-y-auto max-h-[60vh] pr-2 pt-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localScenes.map(scene => scene.scene_data_id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-1">
                      {localScenes.map(scene => (
                        <SortableItem key={scene.scene_data_id} scene={scene} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <div className="w-full border-b border-white/20"></div>

              <div className="flex justify-end gap-3 mt-6">
                {/* Cancel Button → Dark Grey Background, White Text */}
                <button
                  onClick={handleClose}
                  className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl  text-sm"
                >
                  Cancel
                </button>

                {/* Save Button → Black Background, White Text */}
                <button
                  onClick={handleSaveSequenceOrder}
                  disabled={isLoading || !hasChanges}
                  className={`bg-white hover:bg-white/50  text-[#1b1b1b] cursor-pointer px-2 py-3 rounded-xl  text-sm transition ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
