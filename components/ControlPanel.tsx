import React, { useState } from 'react';
import type { CharacterSlot, ContextSlot } from '../types';
import ImageSlot from './ImageSlot';
import { enhancePrompt, suggestPromptFromImage } from '../services/geminiService';

interface ControlPanelProps {
  characterSlots: CharacterSlot[];
  setCharacterSlots: React.Dispatch<React.SetStateAction<CharacterSlot[]>>;
  contextSlot: ContextSlot;
  setContextSlot: React.Dispatch<React.SetStateAction<ContextSlot>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const promptSuggestions = {
  "Hành động": [
    "đang chạy nước rút", "nhảy múa uyển chuyển", "thiền định", "đọc sách cũ", 
    "vẽ một bức tranh", "chiến đấu", "khám phá hang động", "hát trên sân khấu",
    "cưỡi rồng", "lướt sóng", "pha chế độc dược", "sửa chữa robot",
    "chơi guitar điện", "nhảy dù", "lái phi thuyền", "điệp viên ẩn nấp"
  ],
  "Biểu cảm": [
    "mỉm cười rạng rỡ", "vẻ mặt trầm tư", "ánh mắt quyết tâm", "ngạc nhiên tột độ",
    "khóc trong mưa", "nháy mắt tinh nghịch", "hét lên giận dữ", "cười bí ẩn",
    "vẻ mặt kiêu ngạo", "ánh mắt tò mò", "nỗi buồn sâu thẳm", "vẻ mặt tinh ranh",
    "bối rối", "hoài niệm", "vẻ mặt hài hước khi xem phim", "ánh mắt lém lỉnh khi nghịch ngợm",
    "nụ cười bí ẩn", "vẻ mặt nghiêm túc khi giải đố", "ánh mắt trìu mến nhìn xa xăm"
  ],
  "Trang phục": [
    "mặc áo giáp hiệp sĩ", "mặc váy dạ hội", "bộ đồ phi hành gia", "áo khoác da và quần jean",
    "kimono truyền thống", "áo choàng pháp sư", "trang phục steampunk", "đồ bơi",
    "đồng phục học sinh", "trang phục hoàng gia", "đồ của một nhà thám hiểm",
    "trang phục tương lai", "áo hoodie và tai nghe", "trang phục ninja bóng đêm",
    "bộ vest công sở lịch lãm", "trang phục cướp biển caribe", "áo dài Việt Nam cách tân",
    "bộ đồ thể thao năng động", "váy boho-chic", "trang phục cyberpunk với đèn neon",
    "trang phục hậu tận thế"
  ],
  "Phong cách": [
    "phong cách anime", "tranh sơn dầu", "nghệ thuật cyberpunk", "ảnh chụp chân thực",
    "màu nước", "nghệ thuật pixel", "phong cách gothic", "phim hoạt hình Disney",
    "tranh thủy mặc", "phong cách retro thập niên 80", "nghệ thuật huyễn tưởng (fantasy)",
    "phong cách low-poly", "phim noir", "vaporwave"
  ],
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  characterSlots,
  setCharacterSlots,
  contextSlot,
  setContextSlot,
  prompt,
  setPrompt,
  onGenerate,
  isLoading,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const handleAppendPrompt = (text: string) => {
    setPrompt(prev => prev ? `${prev}, ${text}` : text);
  };

  const hasCharacterImage = characterSlots.some(s => s.selected && s.file);

  const handleSuggestPrompt = async () => {
    if (isSuggesting || !hasCharacterImage) return;
    setIsSuggesting(true);
    try {
        const selectedCharacters = characterSlots.filter(
          (slot) => slot.selected && slot.base64
        );
        const suggested = await suggestPromptFromImage(selectedCharacters);
        if (suggested) {
          setPrompt(suggested);
        }
    } catch (error) {
        console.error("Failed to suggest prompt", error);
    } finally {
        setIsSuggesting(false);
    }
  };
  
  const handleEnhancePrompt = async () => {
    if (!prompt || isEnhancing) return;
    setIsEnhancing(true);
    try {
        const selectedCharacters = characterSlots.filter(
          (slot) => slot.selected && slot.base64
        );
        const enhanced = await enhancePrompt(prompt, selectedCharacters);
        setPrompt(enhanced);
    } catch (error) {
        console.error("Failed to enhance prompt", error);
        // Optionally show an error to the user
    } finally {
        setIsEnhancing(false);
    }
  };

  const loadingSpinner = (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6 shadow-lg">
      {showGuide && (
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6 relative animate-fade-in">
          <button
            onClick={() => setShowGuide(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl leading-none"
            title="Đóng hướng dẫn"
            aria-label="Đóng hướng dẫn"
          >
            &times;
          </button>
          <h3 className="text-md font-semibold text-purple-300 mb-2 flex items-center gap-2">
            💡 Hướng Dẫn Nhanh
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            <li><strong>Tải ảnh nhân vật:</strong> Chọn ít nhất một ảnh tham chiếu rõ mặt.</li>
            <li><strong>Viết câu lệnh:</strong> Mô tả hành động, trang phục, và bối cảnh mới.</li>
            <li><strong>(Tùy chọn) Thêm chi tiết:</strong> Dùng các nút gợi ý hoặc "Tăng cường" để câu lệnh thêm sinh động.</li>
            <li><strong>Tạo ảnh:</strong> Nhấn nút "Tạo Ảnh" và chờ kết quả.</li>
          </ol>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Nhân Vật Tham Chiếu</h2>
        <div className="grid grid-cols-2 gap-4">
          {characterSlots.map((slot) => (
            <ImageSlot
              key={slot.id}
              label={slot.label}
              imageFile={slot.file}
              onImageChange={(file) => setCharacterSlots(prev => prev.map(s => s.id === slot.id ? { ...s, file } : s))}
              slotState={slot}
              setSlotState={(updater) => setCharacterSlots(prev => prev.map(s => s.id === slot.id ? updater(s) as CharacterSlot : s))}
              isCharacter={true}
              onSelect={() => setCharacterSlots(prev => prev.map(s => s.id === slot.id ? { ...s, selected: !s.selected } : s))}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Bối Cảnh Tham Chiếu</h2>
        <ImageSlot
          label="Nền"
          imageFile={contextSlot.file}
          onImageChange={(file) => setContextSlot(prev => ({ ...prev, file }))}
          slotState={contextSlot}
          setSlotState={(updater) => setContextSlot(updater as React.SetStateAction<ContextSlot>)}
          isCharacter={false}
        />
        <div className="mt-3 flex items-center">
            <input 
                type="checkbox"
                id="useContext"
                checked={contextSlot.useContext}
                onChange={(e) => setContextSlot(prev => ({...prev, useContext: e.target.checked}))}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="useContext" className="ml-2 text-sm text-gray-300">Sử dụng bối cảnh này</label>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-purple-300">Câu Lệnh</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSuggestPrompt}
                    disabled={isSuggesting || !hasCharacterImage}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSuggesting ? (
                        <>{loadingSpinner}<span>Đang gợi ý...</span></>
                    ) : (
                        <>✨ Gợi ý mô tả</>
                    )}
                </button>
                <button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEnhancing ? (
                       <>{loadingSpinner}<span>Đang tăng cường...</span></>
                    ) : (
                        <>🚀 Tăng cường</>
                    )}
                </button>
            </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tải ảnh tham chiếu và nhấp 'Gợi ý mô tả' hoặc tự nhập mô tả..."
          className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
        />
        <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-2">Thêm chi tiết:</h3>
            <div className="grid grid-cols-2 gap-3">
                {Object.entries(promptSuggestions).map(([category, suggestions]) => (
                    <div key={category} className="relative">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleAppendPrompt(e.target.value);
                                    e.target.value = ""; // Reset dropdown to placeholder
                                }
                            }}
                            className="w-full appearance-none bg-gray-700 border border-gray-600 text-white text-sm rounded-md py-2 px-3 focus:ring-purple-500 focus:border-purple-500 transition cursor-pointer"
                        >
                            <option value="" disabled className="text-gray-500">{category}</option>
                            {suggestions.map((suggestion) => (
                                <option key={suggestion} value={suggestion}>
                                    {suggestion}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <p className="text-xs text-yellow-400 bg-yellow-900/50 p-2 rounded-md">
        Ràng buộc: AI sẽ cố gắng giữ lại toàn bộ khuôn mặt từ ảnh tham chiếu.
      </p>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
          </>
        ) : (
          'Tạo Ảnh'
        )}
      </button>
    </div>
  );
};

export default ControlPanel;