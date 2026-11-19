/**
 * Şartname §11.1 — bilinmeyen yol sayfası (`NotFound`).
 *
 * Yönlendirici tanınmayan yolu bu sayfaya düşürür (§11.1). Sayfa yalnızca
 * başlığı, kısa açıklamayı ve ana sayfa bağlantısını gösterir; alt bilgi
 * uygulama kabuğundadır (§14.5).
 */
import { ROUTES } from '../../config.ts';
import { tr } from '../../i18n/tr.ts';

export function NotFound() {
  return (
    <div class="page page--not-found">
      <h1 tabIndex={-1}>{tr.error.notFound.title}</h1>
      <p>{tr.error.notFound.body}</p>
      <p>
        <a href={ROUTES.home}>{tr.common.backHome}</a>
      </p>
    </div>
  );
}
