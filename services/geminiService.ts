
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
            text: `Extract production data from this Bradwear recruitment/order slip image.
            Focus on accuracy for all fields. 
            Note: DO NOT extract tailor name (namaPenjahit), keep it empty.
            
            Fields needed:
            - kodeBarang: The order ID or product code (often a 4-digit number).
            - tanggalOrder: The date the order was made.
            - tanggalTargetSelesai: The deadline or target date.
            - cs: Customer Service name.
            - konsumen: The client or customer name.
            - jumlahPesanan: Total pieces.
            - sizeDetails: A list of items containing: size, count (jumlah), gender (Pria/Wanita), and arm type (Panjang/Pendek).
            - model: The product model name.
            - warna: Product color.
            - sakuType: Type of pocket (Polos/Skotlait/Peterban).
            - sakuColor: Pocket color (Abu/Hitam/etc).
            - deskripsiPekerjaan: All other relevant notes found on the paper.

            Important: Return ONLY a valid JSON object matching the schema. Do not include markdown formatting or extra text.`
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
          { text: "Extract metadata and size counts from all provided images. If multiple images are provided, treat them as separate orders. Return JSON with an 'orders' array." }
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
