/**
 * Şartname §11.2 — ilk açılış bilgilendirmesi.
 *
 * Yalnızca ilk kez gösterilen, tam ekran olmayan kutu. Metin §11.2'deki
 * dört maddenin **birebir** aynısıdır. "Anladım, başla" düğmesi `onAccept`
 * çağırır; onayın `settings.firstRunAccepted` olarak saklanması çağıran
 * bileşenin (depo katmanının) işidir — bu bileşen depoya erişmez.
 */
import { ROUTES } from '../../config.ts';
import { tr } from '../../i18n/tr.ts';
import { useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface FirstRunNoticeProps {
  /** "Anladım, başla" onayı; çağıran `settings.firstRunAccepted` yazar. */
  onAccept: () => void;
  class?: string;
}

export function FirstRunNotice({ onAccept, class: className }: FirstRunNoticeProps) {
  const titleId = useAutoId('first-run-title');

  return (
    <section class={joinClassNames('first-run', className)} aria-labelledby={titleId}>
      <h2 class="first-run__title" id={titleId}>
        {tr.components.firstRun.title}
      </h2>
      <ul class="first-run__list">
        {tr.components.firstRun.items.map((item) => (
          <li class="first-run__item" key={item}>
            {item}
          </li>
        ))}
      </ul>
      <p class="first-run__links">
        <a class="first-run__link" href={ROUTES.terms}>
          {tr.components.firstRun.termsLink}
        </a>
        {' · '}
        <a class="first-run__link" href={ROUTES.privacy}>
          {tr.components.firstRun.privacyLink}
        </a>
      </p>
      <button class="first-run__accept" type="button" onClick={onAccept}>
        {tr.components.firstRun.accept}
      </button>
    </section>
  );
}
