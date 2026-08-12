import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('mobile layout guardrails', () => {
  it('keeps the document within the device viewport', () => {
    const css = source('app/tailwind.css');
    const root = source('app/root.tsx');
    expect(root).toContain('width=device-width, initial-scale=1');
    expect(css).toContain('-webkit-text-size-adjust: 100%');
    expect(css).toContain('overflow-x: hidden');
  });

  it('renders shared dialogs as bottom sheets on phones', () => {
    expect(source('app/components/ui/BaseModal.tsx')).toContain('rounded-t-2xl sm:rounded-2xl');
    expect(source('app/components/Modal.tsx')).toContain('rounded-t-3xl');
    expect(source('app/components/modals/OpenForWorkModal.tsx')).toContain('hb-modal-shell');
  });

  it('keeps the mobile inbox inside the dynamic viewport', () => {
    const inbox = source('app/routes/inbox.tsx');
    expect(inbox).toContain('h-[100dvh]');
    expect(inbox).toContain('overflow-x-hidden overflow-y-auto');
    expect(inbox).toContain('min-w-0 max-h-[150px] flex-1');
  });
});
