/* 화면유형별 템플릿: 화면 정의 → 본문 요소 (T1 대시보드 · T2 목록 · T3 단계형 · T4 단일폼 · T5 발급) */
import type { ReactNode } from 'react';
import { APP } from '../core/config';
import { CONTRACTS } from '../data/customerRepository';
import type { ScreenSpec } from '../data/menu';
import { Dashboard } from './dashboard/Dashboard';
import { CHANGE_FORMS } from './changeForms';
import { IssuanceScreen } from './issuance/IssuanceScreen';
import { ListDetailScreen } from './list/ListDetailScreen';
import { StepFlowScreen } from './stepFlow/StepFlowScreen';
import { SingleFormScreen } from './singleForm/SingleFormScreen';
import type { Contract } from './dashboard/contractSummary';

export const REACT_TEMPLATES: Partial<Record<string, (screen: ScreenSpec) => ReactNode | null>> = {
  T1: () => <Dashboard contracts={CONTRACTS as Contract[]} today={APP.today} />,
  T2: screen => <ListDetailScreen screen={screen} />,
  T3: screen => <StepFlowScreen screen={screen as ScreenSpec & { bizType: string; result: string }} />,
  T5: screen => <IssuanceScreen screen={screen} />,
  T4: screen => <SingleFormScreen screen={screen as ScreenSpec & { result: string }} config={CHANGE_FORMS[screen.id]} />,
};
