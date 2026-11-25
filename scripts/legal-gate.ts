import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertReviewedFiles, readLegalApproval } from './legal-approval.ts';

try {
  const root = new URL('../', import.meta.url);
  const approval = readLegalApproval(
    readFileSync(new URL('docs/hukuki-inceleme.md', root), 'utf8'),
  );
  assertReviewedFiles(approval.commit, fileURLToPath(root));
  console.info(`[hukuk] Kayıt doğrulandı (${approval.date}, ${approval.commit}).`);
} catch (error) {
  console.error(`[hukuk] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
