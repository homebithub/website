import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobListingCard } from './JobListingCard';
import fixture from '~/utils/__fixtures__/listing.json';

describe('homepage and Saved job card information', () => {
  for (const isGridView of [false, true]) {
    it(`renders the same key information in ${isGridView ? 'grid' : 'list'} view`, () => {
      const html = renderToStaticMarkup(React.createElement(JobListingCard, {
        job: { ...fixture, title: 'House Nanny Needed', fit_score: 60, match_reasons: ['same_ward', 'chore'], applicant_count: 2, max_applicants: 15 },
        householdProfile: { rating: 4.5, review_count: 3, response_rate: 0.9 },
        isGridView, hasApplied: true, contacted: true, shortlisted: true,
        onOpen() {}, onChat() {}, onViewProfile() {}, onToggleSave() {},
      }));
      const text = html.replace(/<[^>]*>/g, '');
      for (const value of ['House Nanny Needed', 'Match 60%', 'same ward', 'You applied for this job', 'You two are in contact', '2 / 15 applicants', 'daily: 500-1,000 KES', 'Replies super fast', '4.5', 'Saved']) {
        expect(text).toContain(value);
      }
      expect(text).not.toContain('Flexible role');
      expect(html).toContain('View household profile');
    });
  }
});
