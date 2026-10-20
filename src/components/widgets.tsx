/* 화면 공통 부품 (React) */
import type { CSSProperties, ChangeEvent, ReactNode } from 'react';
import { statusTone } from '../ui/statusTone';
import { Icon, type IconName } from './Icon';

export function StatusChip({ status }: { status: string }) {
  return <span className={`st ${statusTone(status)}`}>{status}</span>;
}

/** 안내 박스: tone = info · warn · danger (+ compact 등 보조 클래스) */
export function InfoBox({ tone, icon, children }: { tone: string; icon: IconName; children: ReactNode }) {
  return <div className={`box ${tone}`}><Icon name={icon} /><div>{children}</div></div>;
}

/** 완료 카드: rows = [항목, 값, 글자형 여부(숫자 정렬 안 함)] */
export type ReceiptRow = readonly [label: string, value: string, isText?: boolean];

export function DoneCard({ title, message, rows }: { title: string; message: string; rows: readonly ReceiptRow[] }) {
  return (
    <div className="card"><div className="donebox">
      <div className="ck"><Icon name="check" /></div>
      <h2>{title}</h2><p>{message}</p>
      <div className="receipt"><dl className="kv">
        {rows.map(([label, value, isText]) => [<dt key={`${label}-t`}>{label}</dt>, <dd key={`${label}-d`} className={isText ? undefined : 'num'}>{value}</dd>])}
      </dl></div>
    </div></div>
  );
}

/** 계산 결과 박스: rows = [항목, 값, 합계 여부] */
export type CalcRow = readonly [label: string, value: string, isTotal?: boolean];

export function CalcBox({ rows }: { rows: readonly CalcRow[] }) {
  return <div className="calc num">{rows.map(([label, value, isTotal]) => <div key={label} className={isTotal ? 'tot' : undefined}><span>{label}</span><b>{value}</b></div>)}</div>;
}

/** 화면에 체크된 필수 확인 순번 (제출 시 화면 상태 기준으로 다시 확인) */
export const checkedAgreements = (): number[] =>
  [...document.querySelectorAll<HTMLInputElement>('#agr [data-agree]')].filter(box => box.checked).map(box => Number(box.dataset.agree));

/** 필수 확인(동의) 목록: 체크할 때마다 체크된 순번 목록을 알림 */
export function Agreements({ items, agreed, error = '', onChange }: { items: readonly string[]; agreed: readonly number[]; error?: string; onChange: (agreed: number[]) => void }) {
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const boxes = event.currentTarget.closest('#agr')?.querySelectorAll<HTMLInputElement>('[data-agree]') ?? [];
    onChange([...boxes].filter(box => box.checked).map(box => Number(box.dataset.agree)));
  };
  return (
    <>
      <div className="agree checks mt-14" id="agr">
        {items.map((text, index) => (
          <label key={text}><input type="checkbox" data-agree={index} defaultChecked={agreed.includes(index)} onChange={change} /><span>{text}</span></label>
        ))}
      </div>
      <span className="agree-err" id="agrErr" role="alert">{error}</span>
    </>
  );
}

/** 요약 타일 줄: 첫 타일 강조, 열 수는 타일 수 */
export function SummaryTiles({ tiles }: { tiles: readonly (readonly [label: string, value: string])[] }) {
  return (
    <dl className="tiles cols" style={{ '--cols': tiles.length } as CSSProperties}>
      {tiles.map(([label, value], index) => <div key={label} className={index === 0 ? 'tile hl' : 'tile'}><dt>{label}</dt><dd className="num">{value}</dd></div>)}
    </dl>
  );
}

/** 다른 화면으로 가는 버튼 줄 (primaryIndex 번째 버튼을 강조) */
export function LinkButtons({ links, spacing = 'mt-18', primaryIndex = 0 }: { links: readonly (readonly [label: string, screenId: string])[]; spacing?: string; primaryIndex?: number }) {
  return (
    <div className={`navrow inline ${spacing}`}>
      {links.map(([label, id], index) => <button key={id} className={index === primaryIndex ? 'btn pri' : 'btn'} data-action="open" data-id={id}>{label}</button>)}
    </div>
  );
}

/** 진행 단계 표시: 완료·현재 단계를 글자로도 알림 */
export function Stepper({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="steps" aria-label={`진행 단계 (전체 ${steps.length}단계)`}>
      {steps.map((name, index) => {
        const status = index < current ? 'done' : index === current ? 'on' : '';
        const spoken = { done: '완료', on: '현재 단계', '': '' }[status];
        return (
          <li key={name} className={status || undefined} aria-current={status === 'on' ? 'step' : undefined} id={status === 'on' ? 'currentStep' : undefined}>
            <span className="n" aria-hidden="true">{index < current ? <Icon name="check" /> : index + 1}</span>{name}{spoken && <span className="sr-only"> ({spoken})</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** 항목 · 값 목록 */
export function KeyValueList({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return <dl className="kv">{rows.map(([key, value]) => [<dt key={`${key}-t`}>{key}</dt>, <dd key={`${key}-d`} className="num">{value}</dd>])}</dl>;
}
