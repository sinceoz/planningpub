import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const snap = await adminDb.collection('puby_invitations')
    .where('token', '==', token)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 });
  }

  const invite = snap.docs[0].data();
  if (invite.usedAt) {
    return NextResponse.json({ error: 'used' }, { status: 410 });
  }
  if (invite.expiresAt.toMillis() < Date.now()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    department: invite.department,
    position: invite.position,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { token, displayName, password } = await req.json();

    const snap = await adminDb.collection('puby_invitations')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }

    const inviteDoc = snap.docs[0];
    const invite = inviteDoc.data();

    if (invite.usedAt) {
      return NextResponse.json({ error: 'used' }, { status: 410 });
    }
    if (invite.expiresAt.toMillis() < Date.now()) {
      return NextResponse.json({ error: 'expired' }, { status: 410 });
    }

    const userRecord = await adminAuth.createUser({
      email: invite.email,
      password,
      displayName,
    });

    const now = Timestamp.now();

    await adminDb.collection('puby_users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: invite.email,
      displayName,
      role: invite.role,
      department: invite.department,
      position: invite.position,
      themePreference: 'dark',
      emailNotifications: true,
      createdAt: now,
      updatedAt: now,
    });

    await inviteDoc.ref.update({ usedAt: now });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invite accept error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'email-exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
