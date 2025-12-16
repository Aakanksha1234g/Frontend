import { useRef } from 'react';
import { useImageActions } from '@products/pitch-craft/hooks/useImageActions';
import GalleryIcon from "@assets/pitch-craft/GalleryIcon.svg?react";
import Button from '@ui/Button';

export default function ImageControls() {
  const { addImage } = useImageActions();
  const fileInputRef = useRef(null);

  const handleImageUpload = e => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
    }
    e.target.value = ''; 
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={() => fileInputRef.current.click()}
        variant={"secondary"}
        className=""
        title="Upload image"
      >
        <GalleryIcon className="w-4 h-4 text-white" />
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
