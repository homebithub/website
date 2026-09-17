import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SubscriptionRequiredModal } from './SubscriptionRequiredModal';

function render(status: string) {
  return renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(SubscriptionRequiredModal, { open: true, status, onClose: () => {}, onRetry: () => {} }),
  ));
}

describe('subscription gate messaging', () => {
  it('asks users to wait, not pay, during a lookup', () => {
    const html = render('loading');
    expect(html).toContain('Checking subscription');
    expect(html).not.toContain('View Plans');
    expect(html).not.toContain('Subscription Required');
  });
  it('offers retry, not payment, after a lookup failure', () => {
    const html = render('error');
    expect(html).toContain('Retry access check');
    expect(html).not.toContain('View Plans');
    expect(html).not.toContain('Subscription Required');
  });
  it.each(['active', 'trial'])('never shows a paywall for %s access', status => {
    expect(render(status)).toBe('');
  });
  it.each(['none', 'expired'])('offers plans after confirmed %s access', status => {
    expect(render(status)).toContain('View Plans');
  });
});
