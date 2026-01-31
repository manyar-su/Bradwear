
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
            
            TAILOR NAMES LIST: ["Maris", "Ferry", "Aan", "Farid", "Opik", "Fadil", "Asep", "Abdul", "Hadi", "Epul"]
            
            MAPPING RULES:
            - Find the numeric order ID/product code for 'kodeBarang'.
            - Extract 'tanggalOrder' and 'tanggalTargetSelesai'.
            - Find Admin/CS name for 'cs'.
            - Find Client/Customer name for 'konsumen'.
            - Sum all item counts for 'jumlahPesanan'.
            
            - RINCIAN ITEM (sizeDetails):
              * size: (S, M, L, XL, etc. or numeric 28-40)
              * jumlah: (integer)
              * gender: Identify 'Pria' (Cowok/Laki-laki) or 'Wanita' (Cewek/Perempuan).
              * tangan: Identify 'Panjang' (Long) or 'Pendek' (Short).
              * CRITICAL: For each item row, check if there is a tailor name from the TAILOR NAMES LIST.
              
            - Identify 'model', 'warna', 'sakuType', 'sakuColor'.
            - Put all extra handwritten notes into 'deskripsiPekerjaan'.
            
            KUALITAS DETEKSI:
            - Jika gender tidak tertulis eksplisit, cari simbol (P/W) atau konteks model.
            - Jika lengan tidak tertulis, asumsikan 'Pendek' kecuali ada tanda 'Pjg' atau 'Panjang'.
            
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
                  tangan: { type: Type.STRING },
                  namaPenjahit: { type: Type.STRING }
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
