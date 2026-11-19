/**
 * Şartname §11.7, §11.9, §17 — telefon numarası bağlantısı.
 *
 * Özet ve acil ekranında acil kişilerin telefonları `tel:` bağlantısı olarak
 * çizilir (§11.9). Bağlantı yalnızca `toTelHref` güvenli bir değer ürettiğinde
 * kurulur; aksi hâlde numara düz metin kalır. Böylece içe aktarılmış bozuk bir
 * numara `tel:` adresi üretmez.
 */
import { isFilled, toTelHref } from './shared.ts';

export interface PhoneLinkProps {
  /** Kullanıcının yazdığı telefon numarası. */
  phone: string;
}

export function PhoneLink({ phone }: PhoneLinkProps) {
  if (!isFilled(phone)) return null;

  const href = toTelHref(phone);
  if (href === null) {
    return <span class="phone-link">{phone}</span>;
  }

  return (
    <a class="phone-link" href={href}>
      {phone}
    </a>
  );
}
