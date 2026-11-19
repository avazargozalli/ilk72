/**
 * Şartname §18.1 — bileşen testleri için küçük yardımcılar.
 *
 * Bu dosya test dosyası değildir (`*.test.tsx` desenine uymaz); yalnızca
 * `test/ui/*.test.tsx` içinden kullanılır.
 */
import { screen } from '@testing-library/preact';

/** Öğeyi `<input>` olarak daraltır; beklenmeyen türde test hatası verir. */
export function asInputElement(element: HTMLElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Beklenen öğe <input> değil: <${element.tagName.toLowerCase()}>`);
  }
  return element;
}

/** Etiketiyle eşleşen denetimi `<input>` olarak döndürür. */
export function inputByLabelText(label: string): HTMLInputElement {
  return asInputElement(screen.getByLabelText(label));
}

/** Görünen adı eşleşen düğmeyi döndürür. */
export function buttonByName(name: string): HTMLButtonElement {
  const element = screen.getByRole('button', { name });
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error('Beklenen öğe <button> değil.');
  }
  return element;
}

/** Ardışık boşlukları tekleştirir (DOM metni karşılaştırmaları için). */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}
