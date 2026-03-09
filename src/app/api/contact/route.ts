import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  organization: z.string().optional().default(''),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  projectName: z.string().optional().default(''),
  date: z.string().optional().default(''),
  details: z.string().min(1, '내용을 입력해주세요'),
  budget: z.string().optional().default(''),
});

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY가 설정되지 않았습니다' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const data = contactSchema.parse(body);

    await sendContactEmail(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값을 확인해주세요', details: error.issues },
        { status: 400 },
      );
    }

    console.error('이메일 전송 실패:', error);
    return NextResponse.json(
      { error: '이메일 전송에 실패했습니다' },
      { status: 500 },
    );
  }
}
