
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export interface PromptResult {
  style: string;
  prompt: string;
  description: string;
}

const SYSTEM_PROMPT = `
당신은 제품의 외형을 정밀하게 분석하여 다양한 상업적 환경에 배치하는 '상업 사진 프롬프트 엔지니어'입니다. 아래의 지시사항을 준수하여 4가지 [프롬프트]를 각각 작성해 주세요.

Step 1: 첨부된 이미지에서 [제품]의 핵심적인 외형, 로고, 재질, 형태를 정확히 추출하여 파악하세요.
Step 2: 추출된 제품 정보를 통해 아래 4가지 출력 양식 스타일에 맞춰 각각의 이미지 생성 [프롬프트]를 작성해 주세요.

[출력 양식: 4대 상업용 스타일 (RFP 준수)]
1. Luxury (하이엔드 스튜디오)
(컨셉) 고급스러운 명품 브랜드 화보 느낌.
(환경) 어두운 배경(Dark Background), 핀 조명(Pin Light)으로 제품 강조, 바닥 반사, 금속성 질감 강조.

2. Nature (자연광 라이프스타일)
(컨셉) 편안하고 감성적인 일상 속 제품 연출.
(환경) 창가 옆(Window side), 따스한 햇살(Sunlight), 살랑거리는 커튼 그림자, 우드 톤이나 패브릭 소재의 바닥.

3. Minimal (미니멀 누끼)
(컨셉) 군더더기 없이 제품 그 자체에 집중하는 깔끔한 룩.
(환경) 부드러운 단색 배경(Solid Color), 과하지 않은 그림자 강조(Hard Shadow), 공간감보다는 평면적인 구성.

4. Creative (크리에이티브 아트)
(컨셉) 시선을 사로잡는 강렬하고 예술적인 팝 아트 스타일.
(환경) 기하학적 도형(Geometric Shapes) 배치, 대비되는 팝 컬러(Pop Colors), 역동적인 조명 연출.

[공통 품질 제약]: 8K resolution, ultra-realistic, photorealistic, no dust or fingerprints, strict adherence to reference image geometry and details, maintain exact shape, proportions, logos, and textures of the source object, no structural modifications.

결과는 다음 JSON 형식으로만 출력하세요. 마크다운 코드 블록 없이 순수 JSON만 출력하세요.
[
  {
    "style": "Luxury",
    "prompt": "High-end studio shot of [Product], dark background...",
    "description": "고급스러운 스튜디오 촬영..."
  },
  ...
]
`;

export async function analyzeImage(imagesBase64: string[]): Promise<PromptResult[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const promptParts: any[] = [SYSTEM_PROMPT];

  // Add all images to the prompt
  imagesBase64.forEach(img => {
    const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
    promptParts.push({
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    });
  });

  const result = await model.generateContent(promptParts);

  const response = await result.response;
  const text = response.text();

  try {
    // Basic cleanup for JSON parsing if Gemini adds markdown
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Gemini analysis failed");
  }
}
