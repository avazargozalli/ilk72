/**
 * Şartname §11.2, §15 — iletişim kutusu (modal).
 *
 * - `role="dialog"` + `aria-modal="true"`, başlık `aria-labelledby` ile bağlı.
 * - Açılınca odak kutunun içine taşınır, `Tab`/`Shift+Tab` odak hapsi içinde
 *   döner, `Esc` kapatır.
 * - Kapanınca odak, kutuyu açan öğeye geri verilir (§15).
 *
 * Kutu, sayfa akışına eklenen bir katmandır; portal kullanılmaz (tek kök
 * `#app` yeterlidir, §7).
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { tr } from '../../i18n/tr.ts';
import { focusFirst, trapTabKey, useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface DialogProps {
  /** Kutu açık mı; `false` iken hiçbir şey çizilmez. */
  open: boolean;
  /** Görünen başlık (i18n'den). */
  title: string;
  /** Kapatma isteği: `Esc`, Kapat düğmesi ya da eylem düğmeleri tetikler. */
  onClose: () => void;
  /** Başlığın altındaki kısa açıklama. */
  description?: string;
  children?: ComponentChildren;
  /** Alt sıradaki eylem düğmeleri (ör. İptal / Onayla). */
  actions?: ComponentChildren;
  class?: string;
}

export function Dialog({
  open,
  title,
  onClose,
  description,
  children,
  actions,
  class: className,
}: DialogProps) {
  const titleId = useAutoId('dialog-title');
  const descriptionId = useAutoId('dialog-description');
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement;
    triggerRef.current = previous instanceof HTMLElement ? previous : null;

    const dialog = dialogRef.current;
    if (dialog) focusFirst(dialog);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === 'Tab') {
        trapTabKey(event, dialogRef.current);
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (!trigger || !document.contains(trigger)) return;

      // Kutu kapandığında odak hâlâ kutu içindeyse ya da kutu ile birlikte
      // kaybolduysa odak açan öğeye geri verilir (§15).
      const active = document.activeElement;
      const dialogElement = dialogRef.current;
      const focusStillInsideDialog =
        dialogElement !== null && active instanceof Node && dialogElement.contains(active);
      if (!focusStillInsideDialog) trigger.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div class="dialog-overlay">
      <div
        class={joinClassNames('dialog', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div class="dialog__header">
          <h2 class="dialog__title" id={titleId}>
            {title}
          </h2>
          <button class="dialog__close" type="button" onClick={onClose}>
            {tr.components.dialog.close}
          </button>
        </div>
        {description ? (
          <p class="dialog__description" id={descriptionId}>
            {description}
          </p>
        ) : null}
        {children ? <div class="dialog__body">{children}</div> : null}
        {actions ? <div class="dialog__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
