import { ICONS } from '../ui/icons.js';

export type IconName = keyof typeof ICONS;

/** 24px 선 아이콘 (장식용 — 화면낭독기에서 제외). 경로는 코드에 고정된 SVG 조각만 사용 */
export function Icon({ name }: { name: IconName }) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}
