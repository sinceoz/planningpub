import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NotificationType, PubyProject } from '@/types/puby';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  await addDoc(collection(db, 'puby_notifications'), {
    ...params,
    read: false,
    createdAt: Timestamp.now(),
  });
}

export async function notifyExpenseStatusChange({
  expenseId,
  targetUserId,
  type,
  actorName,
  expenseTitle,
}: {
  expenseId: string;
  targetUserId: string;
  type: NotificationType;
  actorName: string;
  expenseTitle: string;
}) {
  const titleMap: Record<string, string> = {
    expense_submitted: '새 결의서 제출',
    expense_approved: '결의서 승인',
    expense_rejected: '결의서 반려',
    expense_completed: '결의서 완료',
    expense_manager_approved: '팀장 승인',
  };

  await createNotification({
    userId: targetUserId,
    type,
    title: titleMap[type] || '알림',
    message: `${actorName}님이 "${expenseTitle}" 결의서를 처리했습니다.`,
    relatedId: expenseId,
  });
}

export async function notifyExpenseSubmitted({
  expenseId,
  project,
  actorName,
  actorUid,
  expenseTitle,
}: {
  expenseId: string;
  project: PubyProject;
  actorName: string;
  actorUid: string;
  expenseTitle: string;
}) {
  const targetUserIds: string[] = [];

  if (project.approvalFlow === 'two_step' && project.managerId) {
    targetUserIds.push(project.managerId);
  } else {
    // direct approval: notify all admins
    const adminsSnap = await getDocs(
      query(collection(db, 'puby_users'), where('role', '==', 'admin'))
    );
    adminsSnap.forEach((doc) => targetUserIds.push(doc.id));
  }

  await Promise.all(
    targetUserIds
      .filter((uid) => uid !== actorUid)
      .map((uid) =>
        createNotification({
          userId: uid,
          type: 'expense_submitted',
          title: '새 결의서 제출',
          message: `${actorName}님이 "${expenseTitle}" 결의서를 제출했습니다.`,
          relatedId: expenseId,
        })
      )
  );
}
