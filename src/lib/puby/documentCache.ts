import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ExpenseFile } from '@/types/puby';

/**
 * 업체 문서 캐시: 사업자등록번호 기준으로 사업자등록증+통장사본 저장/조회
 */
export async function getVendorCache(businessNumber: string) {
  if (!businessNumber) return null;
  const docId = businessNumber.replace(/-/g, '');
  const snap = await getDoc(doc(db, 'puby_vendors', docId));
  if (!snap.exists()) return null;
  return snap.data() as { companyName: string; files: ExpenseFile[] };
}

export async function saveVendorCache(businessNumber: string, companyName: string, files: ExpenseFile[]) {
  if (!businessNumber) return;
  const docId = businessNumber.replace(/-/g, '');
  await setDoc(doc(db, 'puby_vendors', docId), {
    businessNumber,
    companyName,
    files,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

/**
 * 인력 문서 캐시: 주민등록번호 기준으로 신분증+통장사본 저장/조회
 */
export async function getLaboreeCache(residentId: string) {
  if (!residentId) return null;
  const docId = residentId.replace(/-/g, '');
  const snap = await getDoc(doc(db, 'puby_laborees', docId));
  if (!snap.exists()) return null;
  return snap.data() as { name: string; files: ExpenseFile[] };
}

export async function saveLaboreeCache(residentId: string, name: string, files: ExpenseFile[]) {
  if (!residentId) return;
  const docId = residentId.replace(/-/g, '');
  await setDoc(doc(db, 'puby_laborees', docId), {
    residentId,
    name,
    files,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}
