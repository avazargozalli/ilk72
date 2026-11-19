/**
 * Åartname Â§11.2, Â§15 â€” bilgilendirme kutusu.
 *
 * Bilgi **yalnÄ±zca renkle** verilmez (Â§15): her kutuda Ã¶zgÃ¼n, Ã§izgisel bir
 * simge ve ekran okuyucuya yazÄ±lan ton adÄ± ("UyarÄ±", "Bilgi" â€¦) bulunur.
 * VarsayÄ±lan olarak `role="note"`; canlÄ± bÃ¶lge gerekiyorsa `live` verilir
 * (`role="status"` / `role="alert"`).
 */
import type { ComponentChildren } from 'preact';
import { tr } from '../../i18n/tr.ts';
import { joinClassNames } from './classNames.ts';

export type NoticeTone = 'info' | 'warning' | 'success' | 'error';

export interface NoticeProps {
  /** KalÄ±n gÃ¶sterilen kÄ±sa baÅŸlÄ±k. */
  title?: string;
  children?: ComponentChildren;
  /** Renk + simge + ekran okuyucu ton adÄ±. */
  tone?: NoticeTone;
  /** Durum iletisi olarak duyurulsun mu (Â§15). */
  live?: 'polite' | 'assertive';
  class?: string;
}

function noticeRole(live: NoticeProps['live']): 'note' | 'status' | 'alert' {
  if (live === 'assertive') return 'alert';
  if (live === 'polite') return 'status';
  return 'note';
}

/** Ton baÅŸÄ±na Ã¶zgÃ¼n, Ã§izgisel simge (24 Ã— 24, `currentColor`). */
function NoticeIcon({ tone }: { tone: NoticeTone }) {
  const iconProps = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round' as const,
    'stroke-linejoin': 'round' as const,
  };

  if (tone === 'warning') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <path d="M12 3 22 20H2L12 3Z" />
        <path d="M12 10v4" />
        <path d="M12 17.5v.5" />
      </svg>
    );
  }
  if (tone === 'success') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <path d="M4 12.5 9 18 20 6" />
      </svg>
    );
  }
  if (tone === 'error') {
    return (
      <svg {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 16.5v.5" />
      </svg>
    );
  }
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7.5v.5" />
    </svg>
  );
}

export function Notice({ title, children, tone = 'info', live, class: className }: NoticeProps) {
  const toneLabel = tr.components.notice.toneLabels[tone];
  return (
    <div class={joinClassNames('notice', `notice--${tone}`, className)} role={noticeRole(live)}>
      <span class="notice__icon">
        <NoticeIcon tone={tone} />
      </span>
      <div class="notice__body">
        {/* Ton, renk dÄ±ÅŸÄ±nda da anlaÅŸÄ±lsÄ±n diye ekran okuyucuya yazÄ±lÄ±r (Â§15). */}
        <span class="visually-hidden">{`${toneLabel}: `}</span>
        {title ? <p class="notice__title">{title}</p> : null}
        {children ? <div class="notice__content">{children}</div> : null}
      </div>
    </div>
  );
}
