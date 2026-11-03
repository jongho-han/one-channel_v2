/* 국가 선택 레이어팝업: 자주 선택하는 국가 우선 배치, 그 외 국가 검색 → 선택 완료 (우측 상단 X 닫기·Esc) */
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { FREQUENT_COUNTRIES, searchCountries } from '../../data/countryRepository';
import { Icon } from '../Icon';
import { ModalTitle } from './ModalTitle';

interface CountryDialogProps {
  title: string;
  value: string;                       // 이미 고른 국가
  onPick: (name: string) => void;
}

export function CountryDialog({ title, value, onPick }: CountryDialogProps) {
  const [picked, setPicked] = useState(value);
  const [query, setQuery] = useState('');
  const results = searchCountries(query);
  const pick = (name: string) => flushSync(() => setPicked(name));
  return (
    <div className="country-dlg">
      <ModalTitle>{title}</ModalTitle>
      <button className="modal-x" data-action="close-modal" aria-label="닫기"><Icon name="close" /></button>
      <h3 className="country-h" id="ctFreqTitle">자주 선택하는 국가</h3>
      <div className="country-freq" role="group" aria-labelledby="ctFreqTitle">
        {FREQUENT_COUNTRIES.map(country => (
          <button key={country.name} type="button" className={picked === country.name ? 'country-opt on' : 'country-opt'} aria-pressed={picked === country.name} onClick={() => pick(country.name)}>
            <span className="country-code" aria-hidden="true">{country.code}</span>{country.name}
          </button>
        ))}
      </div>
      <label className="country-h" htmlFor="ctq">그 외 국가 검색</label>
      <input className="inp" id="ctq" type="search" placeholder="국가명을 입력해 주세요 (예: 베트남)" autoComplete="off" value={query}
             onChange={event => flushSync(() => setQuery(event.target.value))} />
      <div className="country-list" role="group" aria-label="검색 결과" aria-live="polite">
        {results.length
          ? results.map(country => (
              <button key={country.name} type="button" className={picked === country.name ? 'country-row on' : 'country-row'} aria-pressed={picked === country.name} onClick={() => pick(country.name)}>{country.name}</button>
            ))
          : <p className="note-sm">검색 결과가 없습니다.</p>}
      </div>
      <button className="btn pri lg block mt-12" disabled={!picked} onClick={() => onPick(picked)}>선택 완료</button>
    </div>
  );
}
