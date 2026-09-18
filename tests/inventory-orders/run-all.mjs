import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
for (const script of ['run.mjs', 'service-check.cjs', 'product-info-check.cjs', 'returns-service-check.cjs', 'warranty-approval-ui.cjs', 'invoice-ui-check.cjs']) {
  const result = spawnSync(process.execPath, [`tests/inventory-orders/${script}`], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
