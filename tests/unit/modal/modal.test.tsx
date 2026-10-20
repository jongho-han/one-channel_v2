/* React 모달 레이어: 열기·초점·Tab 순환·Esc·닫을 때 정리·초점 복귀 */
import { closeModal, handleModalKeys, isModalOpen, mountModalLayer, openModal } from '../../../src/ui/modal';
import { ModalTitle } from '../../../src/components/modal/ModalTitle';

const key = (k: string, shiftKey = false) => new KeyboardEvent('keydown', { key: k, shiftKey, cancelable: true });

describe('modal', () => {
  let opener: HTMLButtonElement;
  beforeEach(() => {
    document.body.innerHTML = '<button id="opener">열기</button><div id="layer"></div>';
    mountModalLayer(document.getElementById('layer') as HTMLElement);
    opener = document.getElementById('opener') as HTMLButtonElement;
    opener.focus();
  });
  afterEach(() => closeModal());

  test('대화상자 틀·제목 연결·첫 버튼으로 초점', () => {
    openModal(<><ModalTitle>제목</ModalTitle><button id="a">A</button><button id="b" hidden>B</button><button id="c">C</button></>, { size: 'wide' });
    const dialog = document.querySelector('#layer .dim');
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('modalTitle');
    expect(document.querySelector('.modal')?.className).toBe('modal wide');
    expect(document.activeElement?.id).toBe('a');
    expect(isModalOpen()).toBe(true);
  });

  test('버튼이 없으면 제목으로 초점', () => {
    openModal(<><ModalTitle>대기</ModalTitle><p>잠시만</p></>, { closable: false });
    expect(document.activeElement?.id).toBe('modalTitle');
    expect(document.getElementById('modalTitle')?.getAttribute('tabindex')).toBe('-1');
  });

  test('Tab 순환(숨긴 요소 제외)', () => {
    openModal(<><ModalTitle>제목</ModalTitle><button id="a">A</button><span hidden><button id="b">B</button></span><button id="c">C</button></>);
    (document.getElementById('c') as HTMLElement).focus();
    expect(handleModalKeys(key('Tab'))).toBe(true);
    expect(document.activeElement?.id).toBe('a');
    expect(handleModalKeys(key('Tab', true))).toBe(true);
    expect(document.activeElement?.id).toBe('c');
  });

  test('Esc: 닫고 정리 작업 실행, 연 버튼으로 초점 복귀 — 닫을 수 없는 창은 그대로', () => {
    const onClose = vi.fn();
    openModal(<><ModalTitle>대기</ModalTitle></>, { closable: false });
    expect(handleModalKeys(key('Escape'))).toBe(false);
    expect(isModalOpen()).toBe(true);
    openModal(<><ModalTitle>확인</ModalTitle><button>예</button></>, { onClose });   // 이어서 연 창도 처음 연 버튼으로 복귀
    expect(handleModalKeys(key('Escape'))).toBe(true);
    expect(isModalOpen()).toBe(false);
    expect(document.getElementById('layer')?.innerHTML).toBe('');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
  });

  test('모달이 없으면 키 처리 안 함', () => {
    expect(handleModalKeys(key('Escape'))).toBe(false);
  });
});
