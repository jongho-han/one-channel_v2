/* 화면 공통 부품 (React) — ui/widgets.js 와 같은 마크업 */
import type { ReactNode } from 'react';
import { statusTone } from '../ui/statusTone';
import { Icon, type IconName } from './Icon';

export function StatusChip({ status }: { status: string }) {
  return <span className={`st ${statusTone(status)}`}>{status}</span>;
}

/** 안내 박스: tone = info · warn · danger (+ compact 등 보조 클래스) */
export function InfoBox({ tone, icon, children }: { tone: string; icon: IconName; children: ReactNode }) {
  return <div className={`box ${tone}`}><Icon name={icon} /><div>{children}</div></div>;
}
