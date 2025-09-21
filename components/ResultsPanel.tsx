import React from 'react';
import type { GeneratedImage } from '../types';
import GeneratedImageCard from './GeneratedImageCard';

interface ResultsPanelProps {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onPreview: (base64: string) => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
);

const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error, onPreview }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">Kết Quả</h2>
      
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
        </div>
      )}
      
      {!isLoading && !error && images.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 min-h-[300px]">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p>Ảnh được tạo sẽ xuất hiện ở đây.</p>
          <p className="text-sm">Độ phân giải mặc định dựa trên đầu ra của mô hình.</p>
        </div>
      )}
      
      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((image) => (
            <GeneratedImageCard key={image.id} image={image} onPreview={onPreview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;