/**
 * Şartname §11.2, §15, §18.1 — `FirstRunNotice`.
 *
 * Ölçütler: §11.2'deki dört maddenin **birebir** metni, "tam ekran olmayan"
 * bilgilendirme kutusu, koşullar/gizlilik bağlantıları ve "Anladım, başla"
 * onayı; onay yalnızca `onAccept` ile bildirilir (depo erişimi bileşenin işi
 * değildir).
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from '../../src/config.ts';
import { tr } from '../../src/i18n/tr.ts';
import { FirstRunNotice } from '../../src/ui/components/index.ts';
import { buttonByName, normalizeText } from './helpers.tsx';

describe('FirstRunNotice', () => {
  it('§11.2 başlığını ve dört maddeyi birebir gösterir', () => {
    render(<FirstRunNotice onAccept={() => undefined} />);

    expect(
      screen.getByRole('heading', { level: 2, name: tr.components.firstRun.title }),
    ).not.toBeNull();

    const items = screen.getAllByRole('listitem');

    expect(items.map((item) => normalizeText(item.textContent))).toEqual([
      ...tr.components.firstRun.items,
    ]);
  });

  it('bağımsız proje ve 112 uyarısını içerir (İ5, İ6)', () => {
    render(<FirstRunNotice onAccept={() => undefined} />);

    const text = normalizeText(document.body.textContent);

    expect(text).toContain('bağımsız bir açık kaynak projesidir');
    expect(text).toContain('112');
    expect(text).toContain('yalnızca bu cihazda saklanır');
  });

  it('koşullar ve gizlilik bağlantılarını doğru yollara koyar', () => {
    render(<FirstRunNotice onAccept={() => undefined} />);

    const terms = screen.getByRole('link', { name: tr.components.firstRun.termsLink });
    const privacy = screen.getByRole('link', { name: tr.components.firstRun.privacyLink });

    expect(terms.getAttribute('href')).toBe(ROUTES.terms);
    expect(privacy.getAttribute('href')).toBe(ROUTES.privacy);
  });

  it('tam ekran olmayan bir bölge olarak çizilir', () => {
    render(<FirstRunNotice onAccept={() => undefined} />);

    const region = screen.getByRole('region', { name: tr.components.firstRun.title });

    expect(region.tagName).toBe('SECTION');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('"Anladım, başla" onayını onAccept ile bildirir', () => {
    const onAccept = vi.fn();
    render(<FirstRunNotice onAccept={onAccept} />);

    const accept = buttonByName(tr.components.firstRun.accept);
    expect(accept.getAttribute('type')).toBe('button');

    fireEvent.click(accept);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
