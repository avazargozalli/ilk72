import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertReviewedFiles, readLegalApproval } from '../../scripts/legal-approval.ts';

const exampleCommit = 'a'.repeat(40);
const now = new Date('2026-11-24T22:00:00Z');
const record = [
  '- **Onay tarihi:** 2026-11-25',
  '- **Onaylayan (ad soyad, unvan):** Örnek İnceleyen',
  `- **İncelenen sürüm / commit:** ${exampleCommit}`,
].join('\n');

describe('hukuki yayın kaydı', () => {
  it('Türkiye takvimindeki onay gününü kabul eder', () => {
    expect(readLegalApproval(record, now)).toEqual({ commit: exampleCommit, date: '2026-11-25' });
  });

  it.each(['', '2026-02-30', '2026-11-26'])('geçersiz onay tarihini reddeder (%s)', (date) => {
    expect(() => readLegalApproval(record.replace('2026-11-25', date), now)).toThrow(/onay tarihi/);
  });

  it('boş veya yinelenen onay kaydını ve kısaltılmış commit kimliğini reddeder', () => {
    expect(() => readLegalApproval(record.replace('Örnek İnceleyen', ''), now)).toThrow(/unvanı/);
    expect(() => readLegalApproval(`${record}\n- **Onay tarihi:** 2026-11-25`, now)).toThrow(
      /Tek bir/,
    );
    expect(() => readLegalApproval(record.replace(exampleCommit, 'a'.repeat(7)), now)).toThrow(
      /tam Git/,
    );
  });

  it('sonradan kaydedilen onaya izin verir ve yayın kapsamındaki değişiklikleri reddeder', () => {
    const repo = mkdtempSync(join(tmpdir(), 'ilk72-legal-gate-'));
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const commit = (message: string) =>
      git(
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.invalid',
        '-c',
        'commit.gpgsign=false',
        '-c',
        `core.hooksPath=${join(repo, 'unused-hooks')}`,
        'commit',
        '--quiet',
        '-m',
        message,
      );
    try {
      git('init', '--quiet', '--template=');
      mkdirSync(join(repo, 'src'));
      writeFileSync(join(repo, 'src/app.ts'), 'export const approved = true;\n');
      git('add', 'src');
      commit('İncelenen kaynak');
      const reviewedCommit = git('rev-parse', 'HEAD').trim();

      mkdirSync(join(repo, 'docs'));
      writeFileSync(join(repo, 'docs/hukuki-inceleme.md'), record);
      git('add', 'docs');
      commit('Onay kaydı');
      expect(() => assertReviewedFiles(reviewedCommit, repo)).not.toThrow();
      expect(() => assertReviewedFiles(exampleCommit, repo)).toThrow(/geçmişinde/);

      writeFileSync(join(repo, '.gitignore'), '*.local\n');
      mkdirSync(join(repo, 'public'));
      writeFileSync(join(repo, 'public/private.local'), 'örnek');
      expect(() => assertReviewedFiles(reviewedCommit, repo)).toThrow(
        /incelenen commit’ten farklı/,
      );
      rmSync(join(repo, 'public/private.local'));
      writeFileSync(join(repo, 'src/new.ts'), 'export {};\n');
      expect(() => assertReviewedFiles(reviewedCommit, repo)).toThrow(
        /incelenen commit’ten farklı/,
      );
      rmSync(join(repo, 'src/new.ts'));
      writeFileSync(join(repo, 'src/app.ts'), 'export const approved = false;\n');
      expect(() => assertReviewedFiles(reviewedCommit, repo)).toThrow(
        /incelenen commit’ten farklı/,
      );
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
