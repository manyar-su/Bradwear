
import { GoogleGenAI, Type } from "@google/genai";

export const extractOrderData = async (base64Image: string) => {
  // Ambil API Key dari localStorage jika ada, jika tidak gunakan sistem
  const userApiKey = localStorage.getItem('bradwear_gemini_key');
  const ai = new GoogleGenAI({ apiKey: userApiKey || process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Extract exact text data from this order slip image. 
            Act as a high-precision OCR engine.
            MAPPING RULES:
            - Find the numeric order ID/product code for 'kodeBarang'.
            - Extract 'tanggalOrder' and 'tanggalTargetSelesai'.
            - Find Admin/CS name for 'cs'.
            - Find Client/Customer name for 'konsumen'.
            - Sum all item counts for 'jumlahPesanan'.
            - List all items in 'sizeDetails' (size, jumlah, gender, tangan).
            - Identify 'model', 'warna', 'sakuType', 'sakuColor'.
            - Put all extra handwritten notes into 'deskripsiPekerjaan'.
            - LEAVE 'namaPenjahit' EMPTY.
            
            Return ONLY a valid JSON object matching the schema.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kodeBarang: { type: Type.STRING },
            tanggalOrder: { type: Type.STRING },
            tanggalTargetSelesai: { type: Type.STRING },
            cs: { type: Type.STRING },
            konsumen: { type: Type.STRING },
            jumlahPesanan: { type: Type.NUMBER },
            sizeDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  size: { type: Type.STRING },
                  jumlah: { type: Type.NUMBER },
                  gender: { type: Type.STRING },
                  tangan: { type: Type.STRING }
                }
              }
            },
            model: { type: Type.STRING },
            warna: { type: Type.STRING },
            sakuType: { type: Type.STRING },
            sakuColor: { type: Type.STRING },
            deskripsiPekerjaan: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
};

export const extractSplitData = async (base64Images: string[]) => {
  const userApiKey = localStorage.getItem('bradwear_gemini_key');
  const ai = new GoogleGenAI({ apiKey: userApiKey || process.env.API_KEY });
  
  try {
    const parts = base64Images.map(img => ({
      inlineData: { mimeType: 'image/jpeg', data: img }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...parts,
          { text: "OCR all provided images. Extract product codes, models, and size counts per item. Return JSON with an 'orders' array." }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kodeBarang: { type: Type.STRING },
                  model: { type: Type.STRING },
                  sizeCounts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        size: { type: Type.STRING },
                        jumlah: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Split Extraction Error:", error);
    throw error;
  }
};
