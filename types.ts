
export interface CharacterSlot {
  id: number;
  label: string;
  file: File | null;
  base64: string | null;
  selected: boolean;
}

export interface ContextSlot {
  file: File | null;
  base64: string | null;
  useContext: boolean;
}

export interface GeneratedImage {
  id: string;
  base64: string;
}

export interface ImagePart {
    inlineData: {
        mimeType: string;
        data: string;
    }
}

export interface TextPart {
    text: string;
}