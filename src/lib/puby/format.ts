export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function formatTime(time: string): string {
  return time;
}

export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function formatCurrency(n: number): string {
  return `₩${formatNumber(n)}`;
}
