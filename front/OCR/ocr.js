import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();
const app = express();

app.use(cors());

const imageupload = multer({ dest: "uploads/" });
const port = 5000;

const API_KEY = "AIzaSyAnwvS3jcDO610aSMIz2wzfycJAGKFVBA4";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// OCR 후 OpenAI로 상품명/가격 추출
const extractItem =  async (ocrText) =>  {
  const prompt = `
다음은 영수증 OCR 텍스트입니다.
이 텍스트에서 상품명과 가격만 추출하여
JSON 배열 형식으로 만들어주세요.
- 상품명 필드는 "ItemName"
- 가격 필드는 "ItemPrice"
- 수량 필드는 "ItemCount"
- 수량이 명확하지 않으면 1 로 해주세요
- 상품명 앞에 P라고 붙은 경우는 제외해서 출력해주세요.
- "상품명이 한 글자라도 반드시 포함"되어야 합니다. ("무", "콜", "소" 이런 것도 실제 상품명일 수 있습니다.)
- 수량 같은 경우에는 알아보기 힘들 수도 있으니 잘 보고 판단해줘.
- 바코드, 날짜, 거래번호, 기타 숫자는 제외
- 가능한 정확히 구분해주세요
- 봉투 와 관련된 것은 안넣어도 돼요.
- 상품명에 ml, g와 같은 단위는 무조건 넣어야돼. 

주의:
- "한 글자" 상품명도 무조건 추출해야 합니다.
- 예: "무 1,000", "소 2,000", "컵 500" → 모두 포함되어야 합니다.

-출력 예시:
[
  { "ItemName": "바닐라파인트474ml", "ItemPrice": "6900", "ItemCount": "1" },
  { "ItemName": "부대찌개라면큰컵", "ItemPrice": "1600", "ItemCount": "2" }
]

OCR 텍스트:
${ocrText}
`;

  const Response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  let text = Response.choices[0].message.content;
  text = text.replace(/```json|```/g, "").trim();

  const match = text.match(/\[.*\]/s);
  if (match) {
  try {
    const parsed = JSON.parse(match[0]); // 배열로 파싱
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("JSON 파싱 실패:", e);
    return [];
  }
} else {
  console.error("JSON 배열을 찾을 수 없음:", text);
  return [];
}
}


app.post("/ocr", imageupload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // API 호출
    const OCRResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            },
          ],
        }),
      }
    );

    const OCRData = await OCRResponse.json();
    const ocrText = OCRData.responses?.[0]?.fullTextAnnotation?.text || "텍스트가 없어";

    console.log("====원본 OCR 텍스트====");
    console.log(ocrText);

    // OpenAI를 이용해 상품명/가격만 추출
    const items = await extractItem(ocrText);

    console.log("====상품 가격 분리 결과====");
    console.log(items);

    res.json({ rawText: ocrText, parsed: items });

    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error("처리 중 문제 발생:", error);
    res.status(500).json({ error: "처리 실패!!" });
  }
});

app.listen(port, () => {
  console.log(`서버 실행: http://localhost:${port}`);
});
