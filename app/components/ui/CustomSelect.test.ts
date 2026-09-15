import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import CustomSelect from './CustomSelect';

describe('CustomSelect server rendering', () => {
  it('does not invoke a layout effect on the server', () => {
    const errors: string[] = [];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.map(String).join(' '));
    });

    try {
      const html = renderToString(createElement(CustomSelect, {
        value: '',
        onChange: () => undefined,
        options: [{ value: 'cleaning', label: 'Cleaning' }],
      }));

      expect(html).toContain('role="combobox"');
      expect(errors.join('\n')).not.toContain('useLayoutEffect does nothing on the server');
    } finally {
      errorSpy.mockRestore();
    }
  });
});
