import { Resend } from 'resend';

// 빌드 시 API 키 없으면 빈 문자열로 초기화 (런타임에서 검증)
const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

interface SendContactEmailParams {
  name: string;
  organization: string;
  email: string;
  projectName: string;
  date: string;
  details: string;
  budget: string;
}

export async function sendContactEmail(params: SendContactEmailParams) {
  const { name, organization, email, projectName, date, details, budget } = params;

  // 도메인 인증 전에는 onboarding@resend.dev 사용
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const to = 'info@planningpub.com';

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7842B3;">새로운 프로젝트 문의</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">이름/소속</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name} ${organization ? `/ ${organization}` : ''}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">이메일</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
        ${projectName ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">프로젝트명</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${projectName}</td></tr>` : ''}
        ${date ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">희망 일정</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td></tr>` : ''}
        ${budget ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">예산 범위</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${budget}</td></tr>` : ''}
      </table>
      <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #666;">세부 내용</h3>
        <p style="margin: 0; white-space: pre-wrap;">${details}</p>
      </div>
      <p style="margin-top: 16px; font-size: 12px; color: #999;">PlanningPub 홈페이지에서 전송된 문의입니다.</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `[문의] ${projectName || name} - PlanningPub`,
    html: htmlContent,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
