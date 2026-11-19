/**
 * Sihirbaz yardımcıları — kişi etiketleri.
 *
 * Adı yazılmamış bir kişi ekran okuyucuda ve görev seçiminde "Kişi 2" olarak
 * adlandırılır (§15 "tekrarlı alanlarda Kişi 2 / 4 adlandırması"). Ad varsa
 * ad kullanılır. Metinler `tr.wizard.*` altından gelir.
 */
import { formatText, tr } from '../../../i18n/tr.ts';
import type { Member } from '../../../model/types.ts';

/** Kişinin görünen adı: adı yazılmışsa ad, değilse "Kişi {index}". */
export function memberLabel(member: Member, index: number): string {
  const name = member.name.trim();
  return name !== '' ? name : formatText(tr.wizard.fields.memberFallback, { index: index + 1 });
}
