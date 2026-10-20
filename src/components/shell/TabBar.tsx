import type { Route } from '../../state/store';
import { Icon, type IconName } from '../Icon';

interface Tab {
  label: string;
  icon: IconName;
  action: Record<string, string>;   // data-* 속성 (controller/actions.js 에서 처리)
  isActive: (route: Route) => boolean;
}

const TABS: readonly Tab[] = [
  { label: '홈',         icon: 'home',   action: { 'data-action': 'nav', 'data-page': 'home' },  isActive: route => route.page === 'home' },
  { label: '내 계약',    icon: 'shield', action: { 'data-action': 'open', 'data-id': 'CT-01' }, isActive: route => route.screenId === 'CT-01' },
  { label: '보험금청구', icon: 'claim',  action: { 'data-action': 'open', 'data-id': 'PY-01' }, isActive: route => route.screenId === 'PY-01' },
  { label: '증명서',     icon: 'cert',   action: { 'data-action': 'open', 'data-id': 'CF-02' }, isActive: route => Boolean(route.screenId?.startsWith('CF-')) },
  { label: '전체메뉴',   icon: 'menu',   action: { 'data-action': 'toggle-all-menu' },         isActive: route => route.page === 'all' },
];

/** 모바일 하단 탭바 */
export function TabBar({ route }: { route: Route }) {
  return (
    <>
      {TABS.map(tab => {
        const active = tab.isActive(route);
        return (
          <button key={tab.label} className={active ? 'on' : ''} aria-current={active ? 'page' : undefined} {...tab.action}>
            <Icon name={tab.icon} />{tab.label}
          </button>
        );
      })}
    </>
  );
}
