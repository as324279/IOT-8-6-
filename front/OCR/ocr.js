// ==============================
// 🔥 농협 영수증 최적화 OCR 서버
// ==============================
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import fetch from "node-fetch";
import OpenAI, { APIUserAbortError } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const imageupload = multer({ dest: "uploads/" });
const port = 5000;
const API_KEY = "AIzaSyAnwvS3jcDO610aSMIz2wzfycJAGKFVBA4";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GOOGLE_API_KEY = API_KEY;


// ==============================
// 📌 Vision v1p4beta1 OCR (농협 영수증 최적화)
// ==============================
async function requestVisionOCR(base64Image) {
  const response = await fetch(
    `https://vision.googleapis.com/v1p4beta1/images:annotate?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            imageContext: {
              languageHints: ["ko"],
              textDetectionParams: {
                enableTextDetectionConfidenceScore: true
              }
            }
          }
        ],
      }),
    }
  );

  const data = await response.json();

  // confidence 있는 라인만 모으기
  const textBlocks =
    data.responses?.[0]?.textAnnotations?.[0]?.description || "";

  return textBlocks;
}


// ==============================
// 📌 OCR 전처리
// ==============================
function preprocessOCR(text) {
  let cleaned = text;

  // 문자+숫자 분리
  cleaned = cleaned.replace(/([가-힣]+)(\d)/g, "$1 $2");

  // 숫자+문자 분리
  cleaned = cleaned.replace(/(\d)([가-힣]+)/g, "$1 $2");

  // 3.300 → 3300
  cleaned = cleaned.replace(/(\d+)[.,](\d{3})/g, "$1$2");

  // 공백 정리
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}


// ==============================
// 📌 GPT 1차 추출 프롬프트
// ==============================
function buildExtractPrompt(text) {
  return `
다음 OCR 텍스트에서 실제 존재하는 상품명(ItemName)과 수량(ItemCount)만 추출하세요.

❗ 매우 중요
- OCR 텍스트에 **존재하지 않는 상품을 생성하면 절대 안 됩니다.**
- OCR에서 보이지 않은 단어(당근, 배추 등)를 만들어내지 마세요.
- 가격은 제외하세요.
- 상품명 앞에 p는 제거하세요
- 상품명 옆에 단위를 빼지마세요. 예를 들어, ml,g,kg같은 단위를 빼지마세요
- 상품명이 한 글자여도 그대로 사용합니다. ("무", "파")
- 수량이 없으면 기본값 1

출력 형식:
[
  { "ItemName": "", "ItemCount": "" }
]

OCR:
${text}
`;
}


// ==============================
// 📌 GPT 호출
// ==============================
async function askGPT(prompt) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  let text = res.choices[0].message.content.replace(/```json|```/g, "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1) return [];
  try {
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    return [];
  }
}


// ==============================
// 📌 최종 /ocr 엔드포인트
// ==============================
app.post("/ocr", imageupload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const base64Image = fs.readFileSync(imagePath).toString("base64");

    // 🔥 농협 영수증용 OCR v1p4beta1
    const ocrText = await requestVisionOCR(base64Image);

    console.log("==== 원본 OCR ====");
    console.log(ocrText);

    // OCR 실패 시 바로 종료
    if (!ocrText || ocrText.trim().length < 5) {
      return res.json({
        error: "OCR이 영수증을 읽지 못했습니다. 다시 찍어주세요.",
        parsed: [],
      });
    }

    const cleaned = preprocessOCR(ocrText);

    console.log("==== 전처리 후 OCR ====");
    console.log(cleaned);

    // GPT로 실제 항목 추출
    const prompt = buildExtractPrompt(cleaned);
    const final = await askGPT(prompt);

    console.log("==== 최종 GPT 결과 ====");
    console.log(final);

    res.json({
      rawOCR: ocrText,
      cleanedOCR: cleaned,
      parsed: final,
    });

    fs.unlinkSync(imagePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR 처리 실패" });
  }
});


app.listen(port, () => {
  console.log(`서버 실행: http://localhost:${port}`);
});
