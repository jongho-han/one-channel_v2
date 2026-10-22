/* 계좌 선택칸에서 「다른 본인 계좌 등록」: 등록 창 → 계좌 확인 후 등록하면 그 계좌를 선택, 취소하면 원래 계좌로 */
import { AccountRegisterDialog } from '../components/modal/AccountRegisterDialog';
import { $, focusElement } from '../core/dom';
import { BANKS, addAccount, registeredAccounts, verifyAccount } from '../data/accountRepository';
import { USER } from '../data/customerRepository';
import { rerenderScreen, saveScreenInputs } from '../pages/screen';
import { updateScreenValues } from '../state/store';
import { closeModal, openModal } from '../ui/modal';
import { toast } from '../ui/overlay';

export function openAccountRegister(select: HTMLSelectElement, previous: string): void {
  let registered = false;
  const register = (label: string) => {
    registered = true;
    addAccount(label);
    closeModal();
    saveScreenInputs();                              // 다른 입력값 유지
    updateScreenValues({ [select.id]: label });
    rerenderScreen();
    focusElement($(`#${select.id}`));
    toast('계좌를 등록했습니다.');
  };
  const restore = () => { if (!registered) select.value = previous; };
  select.focus();   // 창을 닫으면 이 선택칸으로 초점 복귀
  openModal(<AccountRegisterDialog banks={BANKS} holderName={USER.name} registered={registeredAccounts()} verify={verifyAccount} onRegister={register} />,
            { onClose: restore });
}
