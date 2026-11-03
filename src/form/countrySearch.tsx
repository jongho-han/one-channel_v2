/* 국가 선택 레이어팝업 열기: 선택 완료하면 같은 칸 묶음(root)의 입력칸에 넣고 창을 닫음 (초점은 레이어가 국가 선택 버튼으로 되돌림) */
import { CountryDialog } from '../components/modal/CountryDialog';
import { closeModal, openModal } from '../ui/modal';

export function openCountrySearch(root: ParentNode | null, fieldId: string, label: string, onPicked: (name: string) => void): void {
  const scope = root ?? document;
  const input = scope.querySelector<HTMLInputElement>(`#${fieldId}`);
  const pick = (name: string) => {
    if (input) input.value = name;
    closeModal();
    onPicked(name);
  };
  openModal(<CountryDialog title={`${label} 선택`} value={input?.value ?? ''} onPick={pick} />);
}
