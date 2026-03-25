import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, type } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = type === 'vendor'
      ? `이 이미지는 한국 사업자등록증, 세금계산서, 또는 거래명세서입니다.
다음 정보를 JSON으로 추출해주세요. 없는 항목은 빈 문자열로:
{
  "companyName": "상호/회사명",
  "businessNumber": "사업자등록번호 (000-00-00000 형식)",
  "representative": "대표자명",
  "address": "사업장 주소",
  "bankName": "은행명",
  "accountNumber": "계좌번호",
  "accountHolder": "예금주",
  "amount": 금액(숫자만),
  "description": "품목/내용 요약"
}
JSON만 반환하세요.`
      : `이 이미지는 한국 카드 영수증 또는 결제 내역입니다.
다음 정보를 JSON으로 추출해주세요. 없는 항목은 빈 문자열로:
{
  "storeName": "가맹점/상호명",
  "amount": 금액(숫자만),
  "paymentDateTime": "결제일시 (YYYY-MM-DDTHH:mm 형식)",
  "cardLastFour": "카드번호 뒤 4자리",
  "description": "품목/내용 요약"
}
JSON만 반환하세요.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: base64 } },
    ]);

    const text = result.response.text();
    // Extract JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse OCR result' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({ error: 'OCR analysis failed' }, { status: 500 });
  }
}
