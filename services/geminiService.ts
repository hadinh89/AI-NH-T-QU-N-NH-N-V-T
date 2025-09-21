
import { GoogleGenAI, Modality } from "@google/genai";
import type { CharacterSlot, ContextSlot, GeneratedImage, ImagePart, TextPart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("Biến môi trường API_KEY chưa được đặt");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestPromptFromImage = async (characters: CharacterSlot[]): Promise<string> => {
    const selectedCharacters = characters.filter(c => c.base64 && c.file);
    if (selectedCharacters.length === 0) {
        return "";
    }

    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `Bạn là một trợ lý viết prompt sáng tạo. Hãy phân tích hình ảnh nhân vật được cung cấp. Dựa trên ngoại hình, trang phục và thần thái của nhân vật, hãy tạo ra một câu lệnh (prompt) mô tả chi tiết một kịch bản hoặc hành động mới cho nhân vật đó. Câu lệnh cần bao gồm hành động, bối cảnh, và có thể cả phong cách nghệ thuật. Chỉ trả về duy nhất câu lệnh bằng tiếng Việt.`;

        const parts: ImagePart[] = [];

        for (const char of selectedCharacters) {
             if (char.base64 && char.file) {
                parts.push({
                    inlineData: {
                        data: char.base64,
                        mimeType: char.file.type,
                    },
                });
            }
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
            },
        });
        
        return response.text.trim();

    } catch (error) {
        console.error('Lỗi khi gợi ý câu lệnh:', error);
        return ""; // Trả về chuỗi rỗng nếu có lỗi
    }
};


export const enhancePrompt = async (basePrompt: string, characters: CharacterSlot[]): Promise<string> => {
    if (!basePrompt.trim()) {
        return "";
    }
    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `Bạn là một trợ lý sáng tạo cho một công cụ tạo ảnh AI. Nhiệm vụ của bạn là lấy một câu lệnh cơ bản của người dùng và làm phong phú nó bằng những chi tiết sống động. Hãy phân tích (các) hình ảnh tham chiếu được cung cấp để hiểu về ngoại hình và phong cách của nhân vật. Sau đó, kết hợp các chi tiết đó với câu lệnh của người dùng để tạo ra một câu lệnh mới, chi tiết hơn. Mô tả hành động, cảm xúc, và bối cảnh phù hợp với nhân vật trong ảnh. Giữ lại ý tưởng cốt lõi của câu lệnh gốc. Chỉ trả lời bằng câu lệnh đã được tăng cường. Câu lệnh phải bằng tiếng Việt.`;

        const parts: (ImagePart | TextPart)[] = [];

        const selectedCharacters = characters.filter(char => char.base64 && char.file);

        for (const char of selectedCharacters) {
            parts.push({
                inlineData: {
                    data: char.base64!,
                    mimeType: char.file!.type,
                },
            });
        }
        
        parts.push({ text: basePrompt });

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.95,
            },
        });
        
        return response.text.trim();
    } catch (error) {
        console.error('Lỗi khi tăng cường câu lệnh:', error);
        // Trả về câu lệnh gốc nếu có lỗi
        return basePrompt; 
    }
};

export const generateConsistentCharacterImage = async (
  characters: CharacterSlot[],
  context: ContextSlot,
  userPrompt: string
): Promise<GeneratedImage[]> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const parts: (ImagePart | TextPart)[] = [];

    // Add character images
    for (const char of characters) {
      if (char.base64 && char.file) {
        parts.push({
          inlineData: {
            data: char.base64,
            mimeType: char.file.type,
          },
        });
      }
    }

    // Add context image if used
    if (context.useContext && context.base64 && context.file) {
      parts.push({
        inlineData: {
          data: context.base64,
          mimeType: context.file.type,
        },
      });
    }

    // Construct the final prompt
    let finalPrompt = `Câu lệnh người dùng: "${userPrompt}".\n\n`;
    finalPrompt += `**Nhiệm vụ của bạn:**\n`;
    finalPrompt += `1. **Phân tích ảnh tham chiếu:** Xác định ĐẶC ĐIỂM NHẬN DẠNG CỐT LÕI của (các) nhân vật (khuôn mặt, kiểu tóc, màu mắt, vóc dáng). Đây là những đặc điểm BẮT BUỘC PHẢI GIỮ NGUYÊN.\n`;
    finalPrompt += `2. **Thực hiện câu lệnh:** Đặt nhân vật đã xác định vào một bối cảnh hoàn toàn mới được mô tả trong "Câu lệnh người dùng".\n`;
    finalPrompt += `3. **LƯU Ý VỀ TRANG PHỤC:** TUYỆT ĐỐI KHÔNG sao chép trang phục, quần áo, hay phụ kiện từ ảnh tham chiếu. Thay vào đó, BẮT BUỘC phải vẽ cho nhân vật trang phục MỚI dựa trên "Câu lệnh người dùng". Nếu câu lệnh không mô tả cụ thể, hãy tự sáng tạo trang phục phù hợp với bối cảnh.\n`;
    finalPrompt += `4. **QUAN TRỌNG VỀ HÀNH ĐỘNG/TƯ THẾ:** Hành động và tư thế của nhân vật (cách đứng, vị trí tay chân) PHẢI được quyết định HOÀN TOÀN bởi "Câu lệnh người dùng". **TUYỆT ĐỐI KHÔNG** sao chép hay bị ảnh hưởng bởi tư thế trong ảnh tham chiếu. Hãy thay thế nó bằng hành động mới.\n\n`;
    
    if (context.useContext) {
        finalPrompt += `**Yêu cầu về bối cảnh:** Giữ nguyên hậu cảnh từ hình ảnh bối cảnh được cung cấp. Chỉ thay đổi nhân vật và các yếu tố liên quan đến nhân vật theo câu lệnh.\n\n`;
    }

    parts.push({ text: finalPrompt });

    const generatedImages: GeneratedImage[] = [];

    // Generate 2 images
    for (let i = 0; i < 2; i++) {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImages.push({
                        id: `gen_${Date.now()}_${i}`,
                        base64: part.inlineData.data,
                    });
                }
            }
        }
    }

    if (generatedImages.length === 0) {
      throw new Error('Tạo ảnh thất bại. Mô hình không trả về bất kỳ hình ảnh nào.');
    }

    return generatedImages;
  } catch (error) {
    console.error('Lỗi khi tạo ảnh bằng Gemini:', error);
    throw new Error('Không thể tạo ảnh. Vui lòng kiểm tra đầu vào và khóa API của bạn.');
  }
};