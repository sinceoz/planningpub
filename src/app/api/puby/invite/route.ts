import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import crypto from 'crypto';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const callerDoc = await adminDb.collection('puby_users').doc(decoded.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role, department, position, locale } = await req.json();

    const token = crypto.randomBytes(32).toString('hex');
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 96 * 60 * 60 * 1000);

    await adminDb.collection('puby_invitations').add({
      token,
      email,
      role,
      department,
      position,
      invitedBy: decoded.uid,
      expiresAt,
      createdAt: now,
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale || 'ko'}/puby/invite/${token}`;
    await getResend().emails.send({
      from: 'PlanningPub <info@planningpub.com>',
      to: email,
      subject: '[PlanningPub] PUBY 초대',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7842B3;">PUBY 초대</h2>
          <p>PlanningPub PUBY 시스템에 초대되었습니다.</p>
          <p>아래 링크를 클릭하여 계정을 생성해주세요:</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #7842B3; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">가입하기</a>
          <p style="font-size: 12px; color: #999;">이 링크는 96시간 후 만료됩니다.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
