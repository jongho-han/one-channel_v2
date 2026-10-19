import { refresh } from '../app/render.js';
import { APP } from '../core/config';
import { storage } from '../core/storage.js';
import { state } from '../state/store.js';
import { toast } from '../ui/overlay.js';

/* 부가 기능 ============================================================ */
/* 큰글씨모드 */
export function setLargeText(isOn, { notify = false } = {}) {
  state.ui.largeText = isOn;
  document.documentElement.classList.toggle('big', isOn);
  storage.set(APP.storageKeys.largeText, isOn ? '1' : '0');
  refresh();
  if (notify) toast(isOn ? '큰글씨모드를 켰습니다.' : '기본 글씨로 돌아왔습니다.');
}
