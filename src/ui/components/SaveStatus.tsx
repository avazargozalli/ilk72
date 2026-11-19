/**
 * Şartname §11.4, §15 — otomatik kayıt durumu.
 *
 * "Kaydedildi" durumu `role="status"` + `aria-live="polite"` ile duyurulur
 * (§11.4). Canlı bölgenin çalışması için kap her zaman çizilir; durum
 * değiştiğinde yalnızca metni değişir (bölge sonradan eklenirse ekran
 * okuyucular duyurmaz).
 */
import { tr } from '../../i18n/tr.ts';
import { joinClassNames } from './classNames.ts';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveStatusProps {
  state: SaveState;
  /** Ek açıklama (ör. hata nedeni); durum metninin yanında gösterilir. */
  detail?: string;
  class?: string;
}

function messageOf(state: SaveState): string {
  if (state === 'saving') return tr.components.saveStatus.saving;
  if (state === 'saved') return tr.components.saveStatus.saved;
  if (state === 'error') return tr.components.saveStatus.error;
  return '';
}

export function SaveStatus({ state, detail, class: className }: SaveStatusProps) {
  return (
    <p
      class={joinClassNames('save-status', `save-status--${state}`, className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {messageOf(state)}
      {detail ? <span class="save-status__detail">{` ${detail}`}</span> : null}
    </p>
  );
}
