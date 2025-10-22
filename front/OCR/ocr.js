import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
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
- 상품명 앞에 P라고 붙은 경우는 제외해서 출력해주세요.
- 상품명이 한글자여도 똑같이 추출해주세요.
- 바코드, 날짜, 거래번호, 기타 숫자는 제외
- 가능한 정확히 구분해주세요

OCR 텍스트:
${ocrText}
`;

  const Response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = Response.choices[0].message.content;
  try {
    return JSON.parse(text); // AI가 JSON 배열로 반환했다면 바로 파싱
  } catch (e) {
    // AI가 JSON 아닌 형식으로 반환했으면 그대로 문자열 반환
    return text;
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
