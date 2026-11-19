/**
 * Şartname §11.4, §15 — hata özeti.
 *
 * Sayfa doğrulamayı geçemediğinde üstte gösterilir: kaç hata olduğunu söyler
 * ve her hata için **hatalı alana odaklanan** bir bağlantı listeler. Özet
 * `role="alert"` olduğu için ekran okuyucu sayısını duyurur; bağlantı
 * tıklanınca adres değişmez (`#` yönlendiricisi korunur), odak ilgili alana
 * taşınır (§11.4).
 */
import { useEffect, useRef } from 'preact/hooks';
import { formatText, tr } from '../../i18n/tr.ts';
import { focusElementById } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface ErrorSummaryItem {
  /** Hatalı denetimin DOM kimliği (ör. `member-1-name`). */
  id: string;
  /** Hatanın kısa açıklaması: ne olduğu ve ne yapılacağı (§15). */
  message: string;
}

export interface ErrorSummaryProps {
  errors: readonly ErrorSummaryItem[];
  /** Başlık metni; verilmezse "{count} hata var…" kullanılır. */
  title?: string;
  /** Özet çizildiğinde özetin kendisine odaklanılsın mı (form gönderimi sonrası). */
  focusOnMount?: boolean;
  class?: string;
}

export function ErrorSummary({
  errors,
  title,
  focusOnMount = false,
  class: className,
}: ErrorSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnMount && errors.length > 0) containerRef.current?.focus();
  }, [focusOnMount, errors.length]);

  if (errors.length === 0) return null;

  return (
    <div
      class={joinClassNames('error-summary', className)}
      role="alert"
      tabIndex={-1}
      ref={containerRef}
    >
      <h2 class="error-summary__title">
        {title ?? formatText(tr.components.errorSummary.title, { count: errors.length })}
      </h2>
      <ul class="error-summary__list">
        {errors.map((error) => (
          <li class="error-summary__item" key={error.id}>
            <a
              class="error-summary__link"
              href={`#${error.id}`}
              onClick={(event) => {
                event.preventDefault();
                focusElementById(error.id);
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
