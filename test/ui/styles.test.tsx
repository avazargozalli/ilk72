/**
 * Şartname §15, §18.1 — `src/styles/components.css` denetimleri.
 *
 * Bileşen testleri DOM davranışını doğrular; bu dosya görsel/erişilebilirlik
 * kurallarının stil dosyasında gerçekten uygulandığını denetler:
 * renkler yalnızca `tokens.css` değişkenlerinden, dokunma hedefi 44 px,
 * görünür odak korunur, koyu tema ve `prefers-reduced-motion` gözetilir,
 * alarm kırmızısı yalnızca 112 düğmesinde kullanılır.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vitest proje kökünden koşar (`vitest.config.ts` ile aynı dizin).
const CSS_PATH = resolve(process.cwd(), 'src/styles/components.css');
const css = readFileSync(CSS_PATH, 'utf8');

/** §7'deki ortak bileşenlerin sınıf kökleri. */
const COMPONENT_CLASSES = [
  '.field',
  '.text-input',
  '.phone-input',
  '.checkbox',
  '.radio-group',
  '.repeater',
  '.notice',
  '.stepper',
  '.source-link',
  '.dialog',
  '.error-summary',
  '.save-status',
  '.footer',
  '.first-run',
] as const;

describe('components.css', () => {
  it('her bileşen için bir kural tanımlar', () => {
    for (const className of COMPONENT_CLASSES) {
      expect(css.includes(`${className} {`) || css.includes(`${className},`), className).toBe(true);
    }
  });

  it('renkleri yalnızca tokens.css değişkenlerinden alır', () => {
    // Sabit hex renk yok; koyu tema yalnızca değişkenlerle uyumlu kalır.
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/u);
    expect(css).toContain('var(--color-text)');
    expect(css).toContain('var(--color-surface)');
    expect(css).toContain('var(--color-border)');
  });

  it('dokunma hedefi ve aralık için ölçü değişkenlerini kullanır', () => {
    expect(css).toContain('min-block-size: var(--touch-target)');
    expect(css).toContain('min-inline-size: var(--touch-target)');
    expect(css).toContain('var(--space-1)');
    // 44 px ve 8 px sabit yazılmaz; tek kaynak tokens.css'tir.
    expect(css).not.toContain('44px');
  });

  it('görünür odağı kaldırmaz', () => {
    expect(css).not.toMatch(/outline\s*:\s*(none|0)\b/u);
  });

  it('koyu tema ve hareket azaltma kurallarını içerir', () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\)/u);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/u);
  });

  it('alarm kırmızısını yalnızca 112 düğmesinde kullanır', () => {
    // Yorumlar sayılmaz; kural gövdesi aranır.
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const ruleStart = declarations.indexOf('.button--emergency {');
    expect(ruleStart).toBeGreaterThan(-1);
    const ruleEnd = declarations.indexOf('}', ruleStart);
    const emergencyRule = declarations.slice(ruleStart, ruleEnd);

    expect(emergencyRule).toContain('--color-emergency');

    const total = declarations.split('--color-emergency').length - 1;
    const inRule = emergencyRule.split('--color-emergency').length - 1;
    expect(inRule).toBe(total);
  });
});
