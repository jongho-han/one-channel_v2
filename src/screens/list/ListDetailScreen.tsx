/* T2 화면: 목록 상태(state.screen.list)와 연결 */
import { CONTRACTS, USER } from '../../data/customerRepository';
import { contractDocuments, type ContractDocument } from '../../data/contractDocumentRepository';
import type { ScreenSpec } from '../../data/menu';
import { VARIABLE_CONTRACTS, selectedVariableContract } from '../../features/variableContract';
import { rerenderScreen } from '../../pages/screen';
import { state, updateScreenList } from '../../state/store';
import { VariableContractTabs } from '../fund/FundViews';
import { LIST_SCREENS } from '../listScreens';
import { ContractDetail, type ContractInfo } from './ContractDetail';
import { ListScreen, type ListState } from './ListScreen';

const contracts: readonly ContractInfo[] = CONTRACTS;

/** 필터를 바꾸면 선택한 행을 닫고 다시 그림 */
function changeFilter(label: string, value: string) {
  const list = state.screen.list as ListState;
  updateScreenList({ filters: { ...list.filters, [label]: value }, selectedRow: null });
  rerenderScreen();
}

export function ListDetailScreen({ screen }: { screen: ScreenSpec }) {
  const list = state.screen.list as ListState & { contractTab?: number };
  if (screen.id === 'CT-02') {
    const selected = list.contractTab ?? 0;
    const documents: ContractDocument[] = contractDocuments(contracts[selected]);
    return <ContractDetail contracts={contracts} selected={selected} userName={USER.name} documents={documents} />;
  }
  const config = LIST_SCREENS[screen.id];
  const top = config.top === 'variable-contracts' ? <VariableContractTabs contracts={VARIABLE_CONTRACTS} selected={selectedVariableContract()} /> : null;
  return <ListScreen screenId={screen.id} title={screen.depth3} config={config} list={list} top={top} onFilterChange={changeFilter} />;
}
