/* 우편번호 검색 (시뮬레이션: 검색어와 관계없이 샘플 결과) */
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { ModalTitle } from './ModalTitle';

import type { ZipSample } from '../../data/addressRepository';

export function ZipSearchDialog({ samples, onPick }: { samples: readonly ZipSample[]; onPick: (zip: string, address: string) => void }) {
  const [searchCount, setSearchCount] = useState(1);   // 검색할 때마다 결과를 다시 그림
  return (
    <>
      <ModalTitle>우편번호 검색</ModalTitle>
      <p>도로명, 건물명 또는 지번을 입력하세요.</p>
      <label className="sr-only" htmlFor="zq">도로명, 건물명 또는 지번</label>
      <div className="inrow"><input className="inp" id="zq" defaultValue="세종대로 110" /><button className="btn navy" id="zgo" onClick={() => flushSync(() => setSearchCount(count => count + 1))}>검색</button></div>
      <div className="mt-12" id="zres" role="group" aria-label="검색 결과" aria-live="polite" key={searchCount}>
        {samples.map(([zip, address]) => (
          <button key={zip + address} className="pick mb-6" data-zip-code={zip} data-address={address} onClick={() => onPick(zip, address)}>
            <span className="pm"><b className="num">{zip}</b><small>{address}</small></span>
          </button>
        ))}
      </div>
      <button className="btn block mt-12" data-action="close-modal">닫기</button>
    </>
  );
}
