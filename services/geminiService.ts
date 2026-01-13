
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Analysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateQuiz = async (topic?: string): Promise<Question[]> => {
  const topicInstruction = topic 
    ? `tập trung CHỈ VÀO CHỦ ĐỀ: ${topic}` 
    : "bao gồm các chủ đề: Cấu tạo nguyên tử, Bảng tuần hoàn, Liên kết hóa học, Phản ứng Oxi hóa - khử, Năng lượng hóa học";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hãy tạo 20 câu hỏi trắc nghiệm Hóa học lớp 10 chương trình mới. 
      Nội dung ${topicInstruction}. 
      Phân bổ: 7 câu Dễ, 8 câu Trung bình, 5 câu Khó. 
      Yêu cầu: Mỗi câu đúng được 5 điểm. 
      Trả về định dạng JSON thuần túy, không kèm văn bản giải thích ngoài JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["id", "text", "options", "correctIndex", "explanation", "topic", "difficulty"]
        }
      }
    }
  });

  try {
    return JSON.parse(cleanJsonString(response.text));
  } catch (e) {
    console.error("Lỗi parse quiz:", e, response.text);
    throw new Error("Không thể tạo bài kiểm tra.");
  }
};

export const analyzeResults = async (questions: Question[], answers: any[]): Promise<Analysis> => {
  const resultsData = answers.map((ans, idx) => ({
    topic: questions[idx].topic,
    difficulty: questions[idx].difficulty,
    isCorrect: ans.isCorrect
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Phân tích kết quả làm bài của học sinh Hóa 10 dựa trên dữ liệu sau: ${JSON.stringify(resultsData)}. 
    Hãy đưa ra đánh giá chi tiết về điểm mạnh, điểm yếu và một lộ trình học tập cụ thể. Trả về JSON.`,
    config: {
      thinkingConfig: { thinkingBudget: 20000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          roadmap: { type: Type.STRING },
          advice: { type: Type.STRING }
        },
        required: ["strengths", "weaknesses", "roadmap", "advice"]
      }
    }
  });

  try {
    return JSON.parse(cleanJsonString(response.text));
  } catch (e) {
    console.error("Lỗi parse analysis:", e);
    return {
      strengths: ["Cố gắng hoàn thành bài tập"],
      weaknesses: ["Chưa xác định rõ lỗ hổng"],
      roadmap: "Hãy tiếp tục luyện tập thêm các bài tập cơ bản.",
      advice: "Kiên trì là chìa khóa của thành công."
    };
  }
};

export const askChemistryAgent = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: 'Bạn là gia sư Hóa học lớp 10 chuyên nghiệp. Hãy trả lời các thắc mắc của học sinh một cách dễ hiểu, ngắn gọn, có ví dụ minh họa và luôn khuyến khích học sinh.'
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
