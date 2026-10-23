/* 우편번호 검색 창: 결과를 고르면 같은 칸 묶음(root)의 우편번호·기본주소에 넣고 상세주소로 초점 */
import { ZipSearchDialog } from '../components/modal/ZipSearchDialog';
import { ZIP_SAMPLES } from '../data/addressRepository';
import { closeModal, openModal } from '../ui/modal';

/** 우편번호 검색 창: 결과를 고르면 창을 닫고 onPick (입력칸 처리는 호출한 화면이) */
export function searchZip(onPick: (zip: string, address: string) => void): void {
  openModal(<ZipSearchDialog samples={ZIP_SAMPLES} onPick={(zip, address) => { closeModal(); onPick(zip, address); }} />);
}

export function openZipSearch(root: ParentNode | null, fieldId: string): void {
  const scope = root ?? document;
  const field = (suffix: string) => scope.querySelector<HTMLInputElement>(`#${fieldId}${suffix}`);
  const pick = (zip: string, address: string) => {
    const zipField = field('_zip');
    const base = field('');
    if (zipField) zipField.value = zip;
    if (base) base.value = address;
    closeModal();
    field('_d')?.focus();
  };
  openModal(<ZipSearchDialog samples={ZIP_SAMPLES} onPick={pick} />);
}
