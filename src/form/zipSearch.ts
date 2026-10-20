/* 우편번호 검색 창: 결과를 고르면 같은 칸 묶음(root)의 우편번호·기본주소에 넣고 상세주소로 초점 */
import { ZIP_SAMPLES } from '../data/addressRepository.js';
import { closeModal, openModal } from '../ui/overlay.js';

export function openZipSearch(root: ParentNode | null, fieldId: string): void {
  const scope = root ?? document;
  const modal: HTMLElement = openModal(`
    <h2>우편번호 검색</h2>
    <p>도로명, 건물명 또는 지번을 입력하세요.</p>
    <label class="sr-only" for="zq">도로명, 건물명 또는 지번</label>
    <div class="inrow"><input class="inp" id="zq" value="세종대로 110"><button class="btn navy" id="zgo">검색</button></div>
    <div class="mt-12" id="zres" role="group" aria-label="검색 결과" aria-live="polite"></div>
    <button class="btn block mt-12" data-action="close-modal">닫기</button>`);
  const field = (suffix: string) => scope.querySelector<HTMLInputElement>(`#${fieldId}${suffix}`);

  const showResults = () => {
    const results = modal.querySelector('#zres');
    if (!results) return;
    results.innerHTML = (ZIP_SAMPLES as [string, string][]).map(([zip, address]) => `
      <button class="pick mb-6" data-zip-code="${zip}" data-address="${address}"><span class="pm"><b class="num">${zip}</b><small>${address}</small></span></button>`).join('');
    results.querySelectorAll<HTMLButtonElement>('[data-zip-code]').forEach(result => {
      result.onclick = () => {
        const zip = field('_zip');
        const base = field('');
        if (zip) zip.value = result.dataset.zipCode ?? '';
        if (base) base.value = result.dataset.address ?? '';
        closeModal();
        field('_d')?.focus();
      };
    });
  };
  const search = modal.querySelector<HTMLButtonElement>('#zgo');
  if (search) search.onclick = showResults;
  showResults();
}
