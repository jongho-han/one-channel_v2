import { refresh } from '../app/render';
import { APP } from '../core/config';
import { storage } from '../core/storage';
import { state } from '../state/store';
import { toast } from '../ui/overlay';

/** 큰글씨모드: 입력 중인 값은 유지한 채 다시 그림 */
export function setLargeText(isOn: boolean, { notify = false } = {}): void {
  state.ui.largeText = isOn;
  document.documentElement.classList.toggle('big', isOn);
  storage.set(APP.storageKeys.largeText, isOn ? '1' : '0');
  refresh();
  if (notify) toast(isOn ? '큰글씨모드를 켰습니다.' : '기본 글씨로 돌아왔습니다.');
}
