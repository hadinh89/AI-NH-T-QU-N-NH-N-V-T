
import React, { useRef, useEffect } from 'react';
import type { CharacterSlot, ContextSlot } from '../types';
import PlusIcon from './icons/PlusIcon';

// The parent component can be CharacterSlot or ContextSlot
type SlotType = CharacterSlot | ContextSlot;

interface ImageSlotProps {
  label: string;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  slotState: SlotType;
  setSlotState: (updater: (prevState: SlotType) => SlotType) => void;
  isCharacter: boolean;
  onSelect?: () => void;
}

// This helper function converts a File object to a base64 string.
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const ImageSlot: React.FC<ImageSlotProps> = ({
  label,
  imageFile,
  onImageChange,
  slotState,
  setSlotState,
  isCharacter,
  onSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to convert the selected file to Base64 and update parent state
  useEffect(() => {
    if (imageFile) {
      let isCancelled = false;
      fileToBase64(imageFile)
        .then(base64 => {
          if (!isCancelled) {
            setSlotState(prev => ({ ...prev, base64 }));
          }
        })
        .catch(console.error);
      
      return () => {
        isCancelled = true;
      };
    } else {
      // If file is removed, clear the base64 string
      if (slotState.base64 !== null) {
        setSlotState(prev => ({ ...prev, base64: null }));
      }
    }
  // We are intentionally omitting `setSlotState` and `slotState` from dependencies
  // to prevent re-renders, as the parent component does not memoize them.
  // The logic is sound as it only depends on the `imageFile`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isSelected = isCharacter && (slotState as CharacterSlot).selected;
  const imagePreviewUrl = slotState.base64 ? `data:image/jpeg;base64,${slotState.base64}` : null;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`relative group aspect-square w-full rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple-500 ${isSelected ? 'border-purple-500 ring-2 ring-purple-500' : ''} ${imagePreviewUrl ? 'border-solid p-0' : 'p-4'}`}
        onClick={handleContainerClick}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt={label} className="w-full h-full object-cover rounded-md" />
            <button 
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-lg leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
            >
              &times;
            </button>
          </>
        ) : (
          <div className="text-gray-500">
            <PlusIcon />
          </div>
        )}
      </div>
      {isCharacter ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`select-${label}`}
            checked={!!isSelected}
            onChange={onSelect}
            disabled={!imageFile}
            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor={`select-${label}`} className="ml-2 text-sm text-gray-300 select-none cursor-pointer">
            {label}
          </label>
        </div>
      ) : (
         <label className="text-sm text-gray-300">{label}</label>
      )}
    </div>
  );
};

export default ImageSlot;