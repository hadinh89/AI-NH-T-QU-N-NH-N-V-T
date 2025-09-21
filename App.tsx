
import React, { useState, useCallback } from 'react';
import { CharacterSlot, ContextSlot, GeneratedImage } from './types';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import Header from './components/Header';
import Modal from './components/Modal';
import { generateConsistentCharacterImage } from './services/geminiService';

const App: React.FC = () => {
  const [characterSlots, setCharacterSlots] = useState<CharacterSlot[]>([
    { id: 1, label: 'Nhân vật 1', file: null, base64: null, selected: true },
    { id: 2, label: 'Nhân vật 2', file: null, base64: null, selected: false },
    { id: 3, label: 'Nhân vật 3', file: null, base64: null, selected: false },
    { id: 4, label: 'Nhân vật 4', file: null, base64: null, selected: false },
  ]);

  const [contextSlot, setContextSlot] = useState<ContextSlot>({
    file: null,
    base64: null,
    useContext: false,
  });

  const [prompt, setPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const selectedCharacters = characterSlots.filter(
      (slot) => slot.selected && slot.base64
    );

    if (selectedCharacters.length === 0) {
      setError('Vui lòng tải lên và chọn ít nhất một ảnh nhân vật.');
      return;
    }
    if (!prompt) {
      setError('Vui lòng nhập câu lệnh.');
      return;
    }
    if (contextSlot.useContext && !contextSlot.base64) {
      setError('Vui lòng tải lên ảnh bối cảnh hoặc tắt "Sử dụng bối cảnh này".');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateConsistentCharacterImage(
        selectedCharacters,
        contextSlot,
        prompt
      );
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [characterSlots, contextSlot, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <ControlPanel
            characterSlots={characterSlots}
            setCharacterSlots={setCharacterSlots}
            contextSlot={contextSlot}
            setContextSlot={setContextSlot}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-8">
          <ResultsPanel
            images={generatedImages}
            isLoading={isLoading}
            error={error}
            onPreview={setModalImage}
          />
        </div>
      </main>
      {modalImage && <Modal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
    </div>
  );
};

export default App;