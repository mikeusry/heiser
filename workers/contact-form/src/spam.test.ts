import { describe, expect, it } from 'vitest';
import { contactSpamReason, normalizeFormField } from './spam';
import { spamContactSamples } from './spam-samples';

describe('contactSpamReason', () => {
  it('rejects every attached 2026-10-08 spam sample', () => {
    for (const sample of spamContactSamples) {
      const reason = contactSpamReason(sample.fields);
      expect(reason, sample.label).not.toBeNull();
    }
  });

  it('flags elopVema/elopVema even when a zero-width character breaks token comparison', () => {
    const reason = contactSpamReason({
      firstName: 'elopVema\u200B',
      lastName: 'elopVema',
      email: 'bot@example.com',
      phone: '81968272782',
      serviceType: 'commercial',
      message: 'Need a quote for my office please',
    });
    expect(reason).not.toBeNull();
  });

  it('allows realistic legitimate quote requests', () => {
    const cases = [
      {
        firstName: 'María',
        lastName: "O'Connor",
        email: 'maria@example.com',
        phone: '(773) 545-5200 ext 2',
        serviceType: 'residential',
        message: 'We are moving to Grayslake and need bi-weekly cleaning. You can reach me at maria@example.com.',
      },
      {
        firstName: 'James',
        lastName: 'Wu',
        email: 'james@company.com',
        phone: '847-555-0199',
        serviceType: 'commercial',
        message: 'Looking for nightly office cleaning in Vernon Hills. About 4,000 sq ft.',
      },
      {
        firstName: 'Pat',
        lastName: 'Lee',
        email: 'pat@example.com',
        phone: '',
        serviceType: 'realty',
        message: 'Pre-listing clean for a 3 bed townhouse in Libertyville before photos on Friday.',
      },
    ];

    for (const fields of cases) {
      expect(contactSpamReason(fields)).toBeNull();
    }
  });
});

describe('normalizeFormField', () => {
  it('strips zero-width characters and nbsp', () => {
    expect(normalizeFormField('elopVema\u200B')).toBe('elopVema');
    expect(normalizeFormField('\u00A0')).toBe('');
  });
});
