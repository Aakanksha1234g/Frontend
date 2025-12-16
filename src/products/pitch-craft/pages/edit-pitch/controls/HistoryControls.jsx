import React from 'react';
import { useCanvasActions } from '@products/pitch-craft/hooks/useCanvasActions';
import UndoIcon from '@assets/pitch-craft/UndoIcon.svg?react';
import RedoIcon from '@assets/pitch-craft/RedoIcon.svg?react';
import Button from '@ui/Button';

export default function HistoryControls() {
  const { undo, redo, canUndo, canRedo } =
    useCanvasActions();

  const handleUndo = () => {
    console.log('Undo button clicked');
    undo();
  };

  const handleRedo = () => {
    console.log('Redo button clicked');
    redo();
  };

  return (
    <div className='flex items-center rounded-full dark:bg-dark-accent-hover bg-light-accent-hover gap-1'>
      <Button
        onClick={handleUndo}
        variant="secondary"
        disabled={!canUndo()}
        className="font-semibold px-2 py-2 rounded-l-full"
        title="Undo"
      >
        <UndoIcon className='w-4 h-4' />
      </Button>
      <span className='text-[#383838]'>|</span>
      <Button
        variant="secondary"
        onClick={handleRedo}
        disabled={!canRedo()}
        className='font-semibold px-2 py-2 rounded-r-full'
        title="Redo"
      >
        <RedoIcon className='w-4 h-4' />
      </Button>
    </div>
  );
}
