import type { FooterLink } from '../core/config';

interface FooterProps {
  links: readonly FooterLink[];
  specVersion: string;
}

function FooterItem({ label, url, strong }: FooterLink) {
  if (!url) return <span>{label}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={strong ? 'strong' : undefined}>
      {label}<span className="sr-only"> (새 창)</span>
    </a>
  );
}

/** 공통 하단: 이용 안내 링크 + 회사 정보 */
export function Footer({ links, specVersion }: FooterProps) {
  return (
    <div className="wrap">
      <nav aria-label="이용 안내">
        {links.map(link => <FooterItem key={link.label} {...link} />)}
      </nav>
      <p>iM라이프생명보험(주) · 고객센터 1588-4770 (평일 09:00~18:00)</p>
      <p>본 화면은 「사이버창구 Web 메뉴정의서 {specVersion}」 기반 기획 검토용 프로토타입입니다. 표시 금액은 예시이며 실제 계약과 무관합니다.</p>
    </div>
  );
}
