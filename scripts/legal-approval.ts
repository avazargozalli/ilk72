import { execFileSync } from 'node:child_process';

const reviewScope = [
  'src',
  'public',
  'scripts',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  ':(glob).env*',
  '.npmrc',
  '.pnpmfile.cjs',
  'pnpmfile.cjs',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'LICENSE',
  'LICENSE-CONTENT',
  'THIRD_PARTY_LICENSES.md',
  'README.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  '.github/ISSUE_TEMPLATE',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/workflows/pages.yml',
];

const istanbulDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function readLegalApproval(
  markdown: string,
  now = new Date(),
): { commit: string; date: string } {
  const lines = markdown.split(/\r?\n/);
  const approvalField = (label: string): string => {
    const prefix = `- **${label}:**`;
    const entries = lines.filter((line) => line.startsWith(prefix));
    if (entries.length !== 1) throw new Error(`Tek bir “${label}” kaydı gerekiyor.`);
    return entries[0]?.slice(prefix.length).trim() ?? '';
  };

  const date = approvalField('Onay tarihi');
  const day = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(day.getTime()) ||
    day.toISOString().slice(0, 10) !== date ||
    date > istanbulDate.format(now)
  ) {
    throw new Error('Geçerli bir avukat onay tarihi gerekiyor (YYYY-AA-GG).');
  }
  if (!approvalField('Onaylayan (ad soyad, unvan)')) {
    throw new Error('Avukat onay kaydında onaylayan kişinin adı ve unvanı gerekiyor.');
  }
  const commit = approvalField('İncelenen sürüm / commit');
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit)) {
    throw new Error('İncelenen sürüm için tam Git commit kimliği gerekiyor.');
  }
  return { commit, date };
}

export function assertReviewedFiles(commit: string, cwd: string): void {
  // Yalnız readLegalApproval tarafından doğrulanmış commit kimliği CLI'dan ulaşır.
  const git = (...args: string[]): string =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  try {
    git('merge-base', '--is-ancestor', commit, 'HEAD');
  } catch {
    throw new Error('İncelenen commit bu sürümün geçmişinde bulunamadı.');
  }
  const changed = git(
    'diff',
    '--name-only',
    '--no-ext-diff',
    '--no-textconv',
    commit,
    '--',
    ...reviewScope,
  );
  const untracked = git('ls-files', '--others', '--', ...reviewScope);
  if (changed.trim() || untracked.trim()) {
    throw new Error(
      'Yayın kapsamındaki dosyalar incelenen commit’ten farklı. Bu sürüme ait avukat onayı gerekiyor.',
    );
  }
}
