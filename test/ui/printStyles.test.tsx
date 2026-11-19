/**
 * Şartname §12, §18.1 — `src/styles/print.css` denetimleri.
 *
 * Baskı kurallarının gerçekten uygulandığını dosya üzerinde doğrular:
 * A4 ve 12 mm kenar, her belgenin yeni sayfada başlaması, bölünmeyen satırlar,
 * punto alt sınırları, kart ölçülerinin mm ile verilmesi, hex renk
 * kullanılmaması ve ekran görünümünün bozulmaması.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vitest proje kökünden koşar (`vitest.config.ts` ile aynı dizin).
const CSS_PATH = resolve(process.cwd(), 'src/styles/print.css');
const css = readFileSync(CSS_PATH, 'utf8');

/** Yorumlar çıkarılmış kural gövdesi (yorumlardaki sözler ölçüte gümesin). */
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** `@media print` bloğunun başladığı yer; ekran kuralları buradan önce durur. */
const printBlockStart = declarations.indexOf('@media print');
const screenRules = declarations.slice(0, printBlockStart);
const printRules = declarations.slice(printBlockStart);

describe('print.css', () => {
  it('kâğıt boyutu A4 ve kenar 12 mm tanımlar', () => {
    expect(declarations).toContain('@page');
    expect(declarations).toMatch(/size:\s*A4/u);
    expect(declarations).toMatch(/margin:\s*12mm/u);
  });

  it('her belge ve sayfa için yeni sayfa başlatır', () => {
    expect(printRules).toContain('break-before: page');
    // Belge ve sayfa bloklarının ikisi de kesme kuralı taşır.
    expect(printRules).toMatch(/\.print-doc\s*\{[^}]*break-before:\s*page/u);
    expect(printRules).toMatch(/\.print-sheet\s*\{[^}]*break-before:\s*page/u);
  });

  it('satır ve kutuların sayfa ortasında bölünmesini engeller', () => {
    expect(printRules).toContain('break-inside: avoid');
    for (const selector of ['.print-row', '.print-check', '.wallet-card', '.child-card']) {
      expect(printRules, selector).toContain(selector);
    }
  });

  it('punto alt sınırlarını uygular (gövde 11 pt, buzdolabı 16 pt, kartlar 8,5 pt)', () => {
    expect(printRules).toMatch(/font-size:\s*11pt/u);
    expect(printRules).toMatch(/\.print-doc--fridge\s*\{[^}]*font-size:\s*16pt/u);
    expect(printRules).toMatch(
      /\.print-doc--wallet,\s*\.print-doc--child\s*\{[^}]*font-size:\s*8\.5pt/u,
    );
  });

  it('kart ölçülerini mm ile verir (85,6 × 54 mm)', () => {
    expect(printRules).toMatch(/inline-size:\s*85\.6mm/u);
    expect(printRules).toMatch(/block-size:\s*54mm/u);
    // Cüzdan kartı iki yüz yan yana: 85,6 + 4 + 85,6 = 175,2 mm (A4'e sığar).
    expect(printRules).toContain('175.2mm');
  });

  it('alt bilgi satırını küçük puntoyla her sayfanın altına koyar', () => {
    expect(printRules).toMatch(/\.print-foot\s*\{[^}]*font-size:\s*8pt/u);
    expect(printRules).toMatch(/\.print-foot\s*\{[^}]*margin-block-start:\s*auto/u);
  });

  it('kâğıtta gezinmeyi, düğmeleri ve alt bilgiyi gizler', () => {
    expect(printRules).toMatch(/nav,\s*footer/u);
    expect(printRules).toContain('.print__controls');
    expect(printRules).toContain('button');
  });

  it('hex renk kullanmaz; kâğıt paletini adlandırılmış değerlerle kurar', () => {
    expect(declarations).not.toMatch(/#[0-9a-fA-F]{3,8}\b/u);
    expect(printRules).toContain('--print-ink: black');
    expect(printRules).toContain('--print-paper: white');
    // Ekran tarafı renkleri yalnızca tokens.css değişkenlerinden gelir.
    expect(screenRules).toContain('var(--color-surface)');
    expect(screenRules).toContain('var(--color-border)');
  });

  it('ekran görünümünü bozmaz: gizleme yalnızca @media print içindedir', () => {
    expect(printBlockStart).toBeGreaterThan(-1);
    expect(screenRules).not.toContain('display: none');
    // Önizleme ekranda görünür kalır.
    expect(screenRules).toContain('.print-doc');
    expect(screenRules).toContain('overflow-x: auto');
  });
});
