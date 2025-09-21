import React from 'react';
import type { GeneratedImage } from '../types';
import EyeIcon from './icons/EyeIcon';
import DownloadIcon from './icons/DownloadIcon';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onPreview: (base64: string) => void;
}

const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({ image, onPreview }) => {
  const imageUrl = `data:image/jpeg;base64,${image.base64}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `dinh-mmo-generated-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group aspect-square">
      <img src={imageUrl} alt="Ảnh đã tạo" className="w-full h-full object-cover rounded-lg shadow-md" />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => onPreview(image.base64)}
            className="p-3 bg-gray-700/80 rounded-full text-white hover:bg-purple-600 transition-all transform hover:scale-110"
            title="Xem trước"
          >
            <EyeIcon />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 bg-gray-700/80 rounded-full text-white hover:bg-purple-600 transition-all transform hover:scale-110"
            title="Tải xuống"
          >
            <DownloadIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImageCard;