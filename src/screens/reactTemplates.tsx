/* React로 전환한 화면유형 템플릿: 화면 정의 → 본문 요소 */
import type { ReactNode } from 'react';
import { APP } from '../core/config';
import { CONTRACTS } from '../data/customerRepository.js';
import type { ScreenSpec } from '../data/menu';
import { Dashboard } from './dashboard/Dashboard';
import { IssuanceScreen } from './issuance/IssuanceScreen';
import type { Contract } from './dashboard/contractSummary';

export const REACT_TEMPLATES: Partial<Record<string, (screen: ScreenSpec) => ReactNode>> = {
  T1: () => <Dashboard contracts={CONTRACTS as Contract[]} today={APP.today} />,
  T5: screen => <IssuanceScreen screen={screen} />,
};
