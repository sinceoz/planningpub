import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  // Check secret first — fail fast
  const seedSecret = req.headers.get('X-Seed-Secret');
  if (seedSecret !== process.env.PUBY_SEED_SECRET) {
    return NextResponse.json({ error: 'Invalid seed secret' }, { status: 403 });
  }

  // Only allow if no admin exists yet
  const existingAdmins = await adminDb.collection('puby_users')
    .where('role', '==', 'admin')
    .limit(1)
    .get();

  if (!existingAdmins.empty) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
  }

  const { email, password, displayName } = await req.json();

  try {
    const user = await adminAuth.createUser({ email, password, displayName });
    const now = Timestamp.now();

    await adminDb.collection('puby_users').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName,
      role: 'admin',
      department: '경영',
      position: '대표',
      themePreference: 'dark',
      emailNotifications: true,
      createdAt: now,
      updatedAt: now,
    });

    await adminDb.collection('puby_settings').doc('schedule').set({
      startHour: 9,
      endHour: 18,
      updatedBy: user.uid,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, uid: user.uid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
