import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function fetchAsBase64(url: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return {
    base64: Buffer.from(buf).toString('base64'),
    mimeType: res.headers.get('content-type') || 'image/jpeg',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, imageUrls, type } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Support both single imageUrl and multiple imageUrls
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);
    if (urls.length === 0) {
      return NextResponse.json({ error: 'imageUrl or imageUrls is required' }, { status: 400 });
    }

    // Fetch all files in parallel
    const fileData = await Promise.all(urls.map(fetchAsBase64));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompts: Record<string, string> = {
      vendor: `아래 이미지/PDF 파일들은 한국 업체 지출결의에 사용되는 서류들입니다.
사업자등록증, 세금계산서, 통장사본 등이 섞여 있을 수 있습니다.
각 서류에서 해당하는 정보를 찾아 JSON으로 추출해주세요:

- 상호(companyName), 사업자등록번호(businessNumber), 대표자(representative), 주소(address) → 사업자등록증에서
- 금액(amount) → 세금계산서의 합계금액에서 (숫자만)
- 은행명(bankName), 계좌번호(accountNumber), 예금주(accountHolder) → 통장사본에서
- 비고(description) → 세금계산서의 품목 란 중 맨 위(첫 번째) 항목명

없는 항목은 빈 문자열로, amount는 0으로:
{
  "companyName": "",
  "businessNumber": "000-00-00000 형식",
  "representative": "",
  "address": "",
  "bankName": "",
  "accountNumber": "",
  "accountHolder": "",
  "amount": 0,
  "description": "세금계산서 첫 번째 품목명"
}
JSON만 반환하세요.`,
      labor: `아래 이미지/PDF 파일들은 한국 인건비 지출결의에 사용되는 서류들입니다.
신분증(주민등록증, 운전면허증), 통장사본 등이 섞여 있을 수 있습니다.
각 서류에서 해당하는 정보를 찾아 JSON으로 추출해주세요:

- 성명(name), 주민등록번호(residentId), 주소(address) → 신분증에서
- 은행명(bankName), 계좌번호(accountNumber), 예금주(accountHolder) → 통장사본에서

없는 항목은 빈 문자열로:
{
  "name": "",
  "residentId": "000000-0000000 형식",
  "address": "",
  "bankName": "",
  "accountNumber": "",
  "accountHolder": ""
}
JSON만 반환하세요.`,
      card: `이 이미지/PDF는 한국 카드 영수증 또는 결제 내역입니다.
다음 정보를 JSON으로 추출해주세요. 없는 항목은 빈 문자열로, amount는 0으로:
{
  "storeName": "가맹점/상호명",
  "amount": 0,
  "paymentDateTime": "YYYY-MM-DDTHH:mm 형식",
  "cardLastFour": "카드번호 뒤 4자리",
  "description": "품목/내용 요약"
}
JSON만 반환하세요.`,
    };

    const prompt = prompts[type] || prompts.card;

    const parts: any[] = [{ text: prompt }];
    for (const { base64, mimeType } of fileData) {
      parts.push({ inlineData: { mimeType, data: base64 } });
    }

    const result = await model.generateContent(parts);

    const text = result.response.text();
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
