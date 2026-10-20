import { scrollToTop } from '../../core/dom';
import { rerenderScreen } from '../../pages/screen';
import { toast } from '../../ui/overlay';

/** 단일폼 변경 완료 화면으로 (전자서명 후) */
export function completeSingleForm(flow: { step: number; phase?: string }): void {
  flow.phase = 'edit';
  flow.step = 1;
  rerenderScreen();
  scrollToTop();
  toast('변경되었습니다.');
}
