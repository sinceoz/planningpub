import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ExpenseFile } from '@/types/puby';

function matchesTag(f: ExpenseFile, ...tags: string[]) {
  if (f.tag) return tags.includes(f.tag);
  // fallback: 파일명으로 판별
  const n = (f.name + ' ' + (f.url || '')).toLowerCase();
  if (tags.includes('biz_registration') && (n.includes('사업자') || n.includes('등록증'))) return true;
  if (tags.includes('bankbook') && (n.includes('통장') || n.includes('bank') || n.includes('계좌'))) return true;
  if (tags.includes('id_card') && (n.includes('신분') || n.includes('주민') || n.includes('면허'))) return true;
  return false;
}

/**
 * 업체 문서 캐시: 사업자등록번호 기준
 * 불러올 때: 사업자등록증 + 통장사본만
 */
export async function getVendorCache(businessNumber: string) {
  if (!businessNumber) return null;
  const docId = businessNumber.replace(/-/g, '');
  const snap = await getDoc(doc(db, 'puby_vendors', docId));
  if (!snap.exists()) return null;
  const data = snap.data() as { companyName: string; files: ExpenseFile[] };
  const filtered = (data.files || []).filter((f) => matchesTag(f, 'biz_registration', 'bankbook'));
  return { ...data, files: filtered };
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
 * 인력 문서 캐시: 주민등록번호 기준
 * 불러올 때: 통장사본만
 */
export async function getLaboreeCache(residentId: string) {
  if (!residentId) return null;
  const docId = residentId.replace(/-/g, '');
  const snap = await getDoc(doc(db, 'puby_laborees', docId));
  if (!snap.exists()) return null;
  const data = snap.data() as { name: string; files: ExpenseFile[] };
  const filtered = (data.files || []).filter((f) => matchesTag(f, 'bankbook'));
  return { ...data, files: filtered };
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
