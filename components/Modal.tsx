import React, { useEffect } from 'react';
import DownloadIcon from './icons/DownloadIcon';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const fullImageUrl = `data:image/jpeg;base64,${imageUrl}`;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn modal đóng lại
    const link = document.createElement('a');
    link.href = fullImageUrl;
    link.download = `dinh-mmo-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        {/* Xem trước ảnh */}
        <img
          src={fullImageUrl}
          alt="Xem trước"
          className="object-contain w-full h-auto max-h-[calc(90vh-80px)] rounded-lg shadow-2xl" // Điều chỉnh max-height để có không gian cho nút
        />

        {/* Nút Tải xuống được căn giữa bên dưới ảnh */}
        <div className="flex justify-center">
            <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                title="Tải xuống ảnh"
            >
                <DownloadIcon />
                <span>Tải xuống</span>
            </button>
        </div>
      </div>

      {/* Nút Đóng (Góc trên cùng bên phải) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-400 transition-colors"
        aria-label="Đóng xem trước"
      >
        &times;
      </button>
    </div>
  );
};

export default Modal;
