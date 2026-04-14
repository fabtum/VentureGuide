import { journeyReveal } from '../main.js';
import { handlePathSelection, updateContext } from '../ai-expert.js';
import { getGlobalFilters, setGlobalFilters } from '../global-filters.js';

/* ───── Data ───── */
const instruments = [
  { id: 'preseed', abbr: 'P', name: 'Pre-Seed', color: 'var(--color-preseed)' },
  { id: 'seed', abbr: 'S', name: 'Seed', color: 'var(--color-seed)' },
  { id: 'series-a', abbr: 'A', name: 'Series A', color: 'var(--color-series-a)' },
  { id: 'grant', abbr: 'G', name: 'Grants', color: 'var(--color-grant)' },
];

/* ── Narrative-specific chart distributions ── */
const narrativeChartData = {
  'General Overview': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'grant', pct: 25 }, { instrument: 'preseed', pct: 40 },
        { instrument: 'seed', pct: 30 }, { instrument: 'series-a', pct: 5 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'preseed', pct: 35 }, { instrument: 'seed', pct: 40 },
        { instrument: 'series-a', pct: 20 }, { instrument: 'grant', pct: 5 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'seed', pct: 25 }, { instrument: 'series-a', pct: 45 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 15 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 55 }, { instrument: 'seed', pct: 20 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 15 },
      ]
    },
  ],
  'Grant-Focus': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'grant', pct: 55 }, { instrument: 'preseed', pct: 25 },
        { instrument: 'seed', pct: 15 }, { instrument: 'series-a', pct: 5 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'grant', pct: 40 }, { instrument: 'preseed', pct: 30 },
        { instrument: 'seed', pct: 22 }, { instrument: 'series-a', pct: 8 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'grant', pct: 35 }, { instrument: 'seed', pct: 30 },
        { instrument: 'series-a', pct: 20 }, { instrument: 'preseed', pct: 15 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'grant', pct: 30 }, { instrument: 'series-a', pct: 35 },
        { instrument: 'seed', pct: 20 }, { instrument: 'preseed', pct: 15 },
      ]
    },
  ],
  'PreSeed to Seed': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'preseed', pct: 55 }, { instrument: 'grant', pct: 20 },
        { instrument: 'seed', pct: 18 }, { instrument: 'series-a', pct: 7 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'seed', pct: 50 }, { instrument: 'preseed', pct: 25 },
        { instrument: 'grant', pct: 15 }, { instrument: 'series-a', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 60 }, { instrument: 'seed', pct: 20 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 10 },
      ]
    },
  ],
  'Seed-only': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'seed', pct: 60 }, { instrument: 'preseed', pct: 20 },
        { instrument: 'grant', pct: 12 }, { instrument: 'series-a', pct: 8 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'seed', pct: 45 }, { instrument: 'series-a', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 35 },
        { instrument: 'preseed', pct: 12 }, { instrument: 'grant', pct: 8 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 55 }, { instrument: 'seed', pct: 28 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 7 },
      ]
    },
  ],
  'Fast track to Series A': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'preseed', pct: 40 }, { instrument: 'seed', pct: 35 },
        { instrument: 'grant', pct: 15 }, { instrument: 'series-a', pct: 10 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 60 }, { instrument: 'seed', pct: 22 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 8 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 70 }, { instrument: 'seed', pct: 15 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 5 },
      ]
    },
  ],
};

/* ── Narrative-specific paths ── */
const narrativePathsData = {
  'General Overview': [
    { rank: 1, name: 'Seed – Seed – Series A', steps: ['seed', 'seed', 'series-a', null], medianFirst: '5 Months', medianBetween: '8 Months' },
    { rank: 2, name: 'Grant – Grant – Series A', steps: ['grant', 'grant', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'Series A', steps: ['series-a', null, null, null], medianFirst: '6 Months', medianBetween: '0 Months' },
    { rank: 4, name: 'PreSeed – Grant – Seed – Series A', steps: ['preseed', 'grant', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'Grant – Series A', steps: ['grant', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '9 Months' },
    { rank: 6, name: 'Seed – Grant – Series A', steps: ['seed', 'grant', 'series-a', null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 7, name: 'Grant – PreSeed – Grant – Series A', steps: ['grant', 'preseed', 'grant', 'series-a'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 8, name: 'PreSeed – Series A – Series A', steps: ['preseed', 'series-a', 'series-a', null], medianFirst: '4 Months', medianBetween: '7 Months' },
    { rank: 9, name: 'Seed – Series A – Series A', steps: ['seed', 'series-a', 'series-a', null], medianFirst: '5 Months', medianBetween: '6 Months' },
    { rank: 10, name: 'Grant – Seed – Grant – Series A', steps: ['grant', 'seed', 'grant', 'series-a'], medianFirst: '3 Months', medianBetween: '5 Months' },
  ],
  'Grant-Focus': [
    { rank: 1, name: 'Grant – Grant – Grant – Series A', steps: ['grant', 'grant', 'grant', 'series-a'], medianFirst: '2 Months', medianBetween: '3 Months' },
    { rank: 2, name: 'Grant – Grant – Series A', steps: ['grant', 'grant', 'series-a', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 3, name: 'Grant – Series A', steps: ['grant', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 4, name: 'Grant – Seed – Grant – Series A', steps: ['grant', 'seed', 'grant', 'series-a'], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'Seed – Grant – Series A', steps: ['seed', 'grant', 'series-a', null], medianFirst: '4 Months', medianBetween: '4 Months' },
    { rank: 6, name: 'Grant – PreSeed – Grant – Series A', steps: ['grant', 'preseed', 'grant', 'series-a'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 7, name: 'PreSeed – Grant – Grant – Series A', steps: ['preseed', 'grant', 'grant', 'series-a'], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 8, name: 'Grant – Series A – Series A', steps: ['grant', 'series-a', 'series-a', null], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 9, name: 'Grant – Grant – Seed – Series A', steps: ['grant', 'grant', 'seed', 'series-a'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 10, name: 'Seed – Grant – Grant – Series A', steps: ['seed', 'grant', 'grant', 'series-a'], medianFirst: '4 Months', medianBetween: '4 Months' },
  ],
  'PreSeed to Seed': [
    { rank: 1, name: 'PreSeed – PreSeed – Series A', steps: ['preseed', 'preseed', 'series-a', null], medianFirst: '4 Months', medianBetween: '7 Months' },
    { rank: 2, name: 'PreSeed – Seed – Grant – Series A', steps: ['preseed', 'seed', 'grant', 'series-a'], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 3, name: 'PreSeed – Grant – Series A', steps: ['preseed', 'grant', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 4, name: 'Seed – PreSeed – Series A', steps: ['seed', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 5, name: 'PreSeed – Series A – Series A', steps: ['preseed', 'series-a', 'series-a', null], medianFirst: '3 Months', medianBetween: '8 Months' },
    { rank: 6, name: 'PreSeed – PreSeed – Seed – Series A', steps: ['preseed', 'preseed', 'seed', 'series-a'], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 7, name: 'Grant – PreSeed – Grant – Series A', steps: ['grant', 'preseed', 'grant', 'series-a'], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 8, name: 'Seed – PreSeed – Seed – Series A', steps: ['seed', 'preseed', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 9, name: 'PreSeed – Grant – Seed – Series A', steps: ['preseed', 'grant', 'seed', 'series-a'], medianFirst: '4 Months', medianBetween: '6 Months' },
    { rank: 10, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '8 Months' },
  ],
  'Seed-only': [
    { rank: 1, name: 'Seed – Seed – Seed – Series A', steps: ['seed', 'seed', 'seed', 'series-a'], medianFirst: '5 Months', medianBetween: '6 Months' },
    { rank: 2, name: 'Seed – Grant – Seed – Series A', steps: ['seed', 'grant', 'seed', 'series-a'], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'Seed – Series A – Series A', steps: ['seed', 'series-a', 'series-a', null], medianFirst: '4 Months', medianBetween: '8 Months' },
    { rank: 4, name: 'Grant – Seed – Grant – Series A', steps: ['grant', 'seed', 'grant', 'series-a'], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 5, name: 'Seed – Grant – Series A', steps: ['seed', 'grant', 'series-a', null], medianFirst: '5 Months', medianBetween: '7 Months' },
    { rank: 6, name: 'Seed – Seed – Series A', steps: ['seed', 'seed', 'series-a', null], medianFirst: '4 Months', medianBetween: '9 Months' },
    { rank: 7, name: 'Grant – Grant – Seed – Series A', steps: ['grant', 'grant', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 8, name: 'Seed – PreSeed – Seed – Series A', steps: ['seed', 'preseed', 'seed', 'series-a'], medianFirst: '5 Months', medianBetween: '6 Months' },
    { rank: 9, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '6 Months', medianBetween: '7 Months' },
    { rank: 10, name: 'Seed – Seed – Series A – Series A', steps: ['seed', 'seed', 'series-a', 'series-a'], medianFirst: '4 Months', medianBetween: '6 Months' },
  ],
  'Fast track to Series A': [
    { rank: 1, name: 'Series A', steps: ['series-a', null, null, null], medianFirst: '7 Months', medianBetween: '0 Months' },
    { rank: 2, name: 'Grant – Series A', steps: ['grant', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 3, name: 'Series A – Series A', steps: ['series-a', 'series-a', null, null], medianFirst: '6 Months', medianBetween: '8 Months' },
    { rank: 4, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'Grant – Grant – Series A', steps: ['grant', 'grant', 'series-a', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 6, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 7, name: 'Grant – Series A – Series A', steps: ['grant', 'series-a', 'series-a', null], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 8, name: 'PreSeed – Grant – Series A', steps: ['preseed', 'grant', 'series-a', null], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 9, name: 'PreSeed – Series A – Series A', steps: ['preseed', 'series-a', 'series-a', null], medianFirst: '2 Months', medianBetween: '7 Months' },
    { rank: 10, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
  ],
};

/* ── Diverse Paths Data (Not guaranteed to end in Series A) ── */
const diversePathsData = {
  'General Overview': [
    { rank: 1, name: 'Grant – PreSeed – Seed', steps: ['grant', 'preseed', 'seed', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 2, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'Grant – Grant', steps: ['grant', 'grant', null, null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 4, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'PreSeed – PreSeed', steps: ['preseed', 'preseed', null, null], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 6, name: 'Grant – Seed', steps: ['grant', 'seed', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 7, name: 'PreSeed – Seed', steps: ['preseed', 'seed', null, null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 8, name: 'Seed – Seed', steps: ['seed', 'seed', null, null], medianFirst: '4 Months', medianBetween: '6 Months' },
    { rank: 9, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 10, name: 'Grant', steps: ['grant', null, null, null], medianFirst: '2 Months', medianBetween: '0 Months' },
  ],
  'Grant-Focus': [
    { rank: 1, name: 'Grant – Grant – PreSeed', steps: ['grant', 'grant', 'preseed', null], medianFirst: '2 Months', medianBetween: '3 Months' },
    { rank: 2, name: 'Grant – Grant', steps: ['grant', 'grant', null, null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 3, name: 'Grant – Seed – Grant', steps: ['grant', 'seed', 'grant', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 4, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'Grant – PreSeed – PreSeed', steps: ['grant', 'preseed', 'preseed', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 6, name: 'Grant', steps: ['grant', null, null, null], medianFirst: '2 Months', medianBetween: '0 Months' },
    { rank: 7, name: 'Grant – Seed', steps: ['grant', 'seed', null, null], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 8, name: 'Grant – Grant – Seed', steps: ['grant', 'grant', 'seed', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 9, name: 'Grant – Grant – Series A', steps: ['grant', 'grant', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 10, name: 'Grant – Grant – Grant', steps: ['grant', 'grant', 'grant', null], medianFirst: '2 Months', medianBetween: '3 Months' },
  ],
  'PreSeed to Seed': [
    { rank: 1, name: 'PreSeed – Seed', steps: ['preseed', 'seed', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 2, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'PreSeed – PreSeed – Seed', steps: ['preseed', 'preseed', 'seed', null], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 4, name: 'Grant – PreSeed – Seed', steps: ['grant', 'preseed', 'seed', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'PreSeed – Grant – Seed', steps: ['preseed', 'grant', 'seed', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 6, name: 'PreSeed – PreSeed', steps: ['preseed', 'preseed', null, null], medianFirst: '4 Months', medianBetween: '4 Months' },
    { rank: 7, name: 'PreSeed', steps: ['preseed', null, null, null], medianFirst: '3 Months', medianBetween: '0 Months' },
    { rank: 8, name: 'Grant – PreSeed – PreSeed – Seed', steps: ['grant', 'preseed', 'preseed', 'seed'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 9, name: 'PreSeed – Seed – Seed', steps: ['preseed', 'seed', 'seed', null], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 10, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '3 Months', medianBetween: '7 Months' },
  ],
  'Seed-only': [
    { rank: 1, name: 'Seed – Seed', steps: ['seed', 'seed', null, null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 2, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '4 Months', medianBetween: '6 Months' },
    { rank: 3, name: 'Seed – Seed – Series A', steps: ['seed', 'seed', 'series-a', null], medianFirst: '4 Months', medianBetween: '6 Months' },
    { rank: 4, name: 'Seed – PreSeed', steps: ['seed', 'preseed', null, null], medianFirst: '4 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'Seed', steps: ['seed', null, null, null], medianFirst: '4 Months', medianBetween: '0 Months' },
    { rank: 6, name: 'PreSeed – Seed', steps: ['preseed', 'seed', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 7, name: 'Seed – Seed – Seed', steps: ['seed', 'seed', 'seed', null], medianFirst: '4 Months', medianBetween: '4 Months' },
    { rank: 8, name: 'Seed – Grant', steps: ['seed', 'grant', null, null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 9, name: 'Grant – Seed', steps: ['grant', 'seed', null, null], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 10, name: 'Seed – Seed – Grant', steps: ['seed', 'seed', 'grant', null], medianFirst: '4 Months', medianBetween: '4 Months' },
  ],
  'Fast track to Series A': [
    { rank: 1, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 2, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 4, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'Series A', steps: ['series-a', null, null, null], medianFirst: '5 Months', medianBetween: '0 Months' },
    { rank: 6, name: 'Seed – Series A – Series A', steps: ['seed', 'series-a', 'series-a', null], medianFirst: '3 Months', medianBetween: '6 Months' },
    { rank: 7, name: 'PreSeed – Grant – Series A', steps: ['preseed', 'grant', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 8, name: 'Grant – Series A', steps: ['grant', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '8 Months' },
    { rank: 9, name: 'Grant – Seed – Series A', steps: ['grant', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 10, name: 'PreSeed – Series A – Series A', steps: ['preseed', 'series-a', 'series-a', null], medianFirst: '2 Months', medianBetween: '7 Months' },
  ],
};

/* ── Narrative-specific default stats ── */
const narrativeStats = {
  'General Overview': { medianFirst: '3 Months', medianBetween: '5 Months' },
  'Grant-Focus': { medianFirst: '2 Months', medianBetween: '4 Months' },
  'PreSeed to Seed': { medianFirst: '3 Months', medianBetween: '5 Months' },
  'Seed-only': { medianFirst: '4 Months', medianBetween: '5 Months' },
  'Fast track to Series A': { medianFirst: '3 Months', medianBetween: '5 Months' },
};

function getColor(id) {
  return instruments.find(i => i.id === id)?.color || '#ccc';
}

/* ───── Core Functions ───── */
function getSeededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

function shufflePaths(arr, seedStr) {
  const rand = getSeededRandom(seedStr);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getActivePathsData() {
  const isSeriesA = document.getElementById('tp-pfb-seriesa-toggle-collapsed')?.checked;
  if (!isSeriesA) {
    return diversePathsData;
  }
  return narrativePathsData;
}

export function renderTypicalPaths(container) {
  let selectedPathIdx = null;
  let currentNarrative = 'General Overview';
  const filters = getGlobalFilters();

  /* No intro — render main content directly */
  container.innerHTML = `
    <div class="tab-main-content" id="tp-main">

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="tp-pfb">
          <div class="pfb-collapsed" id="tp-pfb-toggle">
            <div class="pfb-filter-values" id="tp-pfb-chips">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="tp-pfb-cv-country">${filters.location}</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="tp-pfb-cv-industry">${filters.industry}</span></div>
              <div class="pfb-filter-chip" style="margin-left: var(--sp-2);">
                <span class="pfb-chip-label" style="text-transform: none;">Show ONLY paths that led to a Series A Round</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="tp-pfb-seriesa-toggle-collapsed">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div class="pfb-toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div class="pfb-expanded">
            <div class="pfb-dropdowns">
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Organisation Location:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-country">
                  <option value="" disabled>Choose Location</option>
                  <option>Austria</option><option>China</option><option>Finland</option><option>France</option><option>Germany</option><option>India</option><option>Switzerland</option><option>United Kingdom</option><option>United States</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-industry">
                  <option value="" disabled>Choose Industry</option>
                  <option>Consumer Goods</option><option>Deep Tech</option><option>Energy / Resources</option><option>Finance / Consulting</option><option>Health / Biotechnology</option><option>Media / Entertainment</option><option>Mobility / Infrastructure</option><option>Tech / Software</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label" style="text-transform: none;">Show ONLY paths that led to a Series A Round</label>
                <div style="margin-top: 4px;">
                  <label class="toggle-switch">
                    <input type="checkbox" id="tp-pfb-seriesa-toggle-expanded">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full-width paths section -->
      <div class="journey-step">
        <div class="tp-paths-container" style="position: relative; z-index: 99;">
          <div class="tp-title-card" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: var(--sp-2);">
              <span class="tp-paths-title" style="margin-bottom: 0;">Most Common Paths in your Ecosystem:</span>
              <div class="info-icon-wrapper">
                <div class="info-icon">i</div>
                <div class="info-tooltip tooltip-down">
                  <strong>Most Common Paths</strong><br/>
                  These are the most frequently chosen funding sequences by startups in your ecosystem. Click on a path to see its details.
                </div>
              </div>
            </div>
            
            <div class="pfb-dropdown-group" style="display: flex; flex-direction: row; align-items: center; gap: var(--sp-2); margin: 0;">
              <span class="pfb-dropdown-label" style="margin: 0; padding: 0;">OPTIONAL: CHOOSE A FOCUS:</span>
              <select class="pfb-dropdown-select" id="tp-pfb-narrative" style="padding-top: var(--sp-1); padding-bottom: var(--sp-1); border-color: var(--accent-lighter);">
                <option>General Overview</option><option>Grant-Focus</option><option>PreSeed to Seed</option><option>Seed-only</option><option>Fast track to Series A</option>
              </select>
            </div>
          </div>
          <div class="tp-paths-list tp-paths-list--bordered" id="tp-paths-list"></div>
        </div>
      </div>
    </div>
  `;

  const mainEl = document.getElementById('tp-main');

  /* ── Persistent Filter Bar elements ── */
  const pfb = document.getElementById('tp-pfb');
  const pfbToggle = document.getElementById('tp-pfb-toggle');
  const pfbCountry = document.getElementById('tp-pfb-country');
  const pfbIndustry = document.getElementById('tp-pfb-industry');
  const toggleCollapsed = document.getElementById('tp-pfb-seriesa-toggle-collapsed');
  const toggleExpanded = document.getElementById('tp-pfb-seriesa-toggle-expanded');
  const pfbNarrative = document.getElementById('tp-pfb-narrative');

  /* Sync toggles */
  toggleCollapsed.addEventListener('change', (e) => { toggleExpanded.checked = e.target.checked; });
  toggleExpanded.addEventListener('change', (e) => { toggleCollapsed.checked = e.target.checked; });

  /* Pre-fill PFB from global filters */
  pfbCountry.value = filters.location;
  pfbIndustry.value = filters.industry;

  /* ── Toggle expand/collapse ── */
  pfbToggle.addEventListener('click', () => {
    pfb.classList.toggle('expanded');
  });

  function updateChips() {
    document.getElementById('tp-pfb-cv-country').textContent = pfbCountry.value;
    document.getElementById('tp-pfb-cv-industry').textContent = pfbIndustry.value;
  }

  function handleFilterChange() {
    currentNarrative = pfbNarrative.value;
    updateChips();
    pfb.classList.remove('expanded');
    // Sync location/industry back to global store
    setGlobalFilters({ location: pfbCountry.value, industry: pfbIndustry.value });
    rebuildContent();
  }

  /* Listeners mapping */
  pfbCountry.addEventListener('change', handleFilterChange);
  pfbIndustry.addEventListener('change', handleFilterChange);
  pfbNarrative.addEventListener('change', handleFilterChange);

  toggleCollapsed.addEventListener('change', (e) => { 
    toggleExpanded.checked = e.target.checked; 
    handleFilterChange();
  });
  toggleExpanded.addEventListener('change', (e) => { 
    toggleCollapsed.checked = e.target.checked; 
    handleFilterChange();
  });

  /* ── Rebuild paths when filters change ── */
  function rebuildContent() {
    selectedPathIdx = null;
    const pathsList = document.getElementById('tp-paths-list');
    if (pathsList) pathsList.innerHTML = '';
    buildPaths();
  }

  const mockCounts = [142, 98, 74, 56, 34, 28, 21, 15, 9, 4];

  /* ── Investor data by instrument ── */
  const investorData = {
    grant: {
      title: 'Grant Investors',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
      investors: ['HTGF – 320 deals', 'EXIST – 212 deals', 'Synergy – 103 deals', 'ERC – 67 deals', 'DFG – 47 deals'],
    },
    preseed: {
      title: 'PreSeed Investors',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
      investors: ['Antler – 285 deals', 'Plug & Play – 198 deals', 'APX – 142 deals', 'Entrepreneur First – 89 deals', 'Seedcamp – 61 deals'],
    },
    seed: {
      title: 'Seed Investors',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      investors: ['Point Nine – 310 deals', 'Cherry Ventures – 224 deals', 'Earlybird – 156 deals', 'HV Capital – 98 deals', 'Creandum – 72 deals'],
    },
    'series-a': {
      title: 'Series A Investors',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      investors: ['Sequoia – 425 deals', 'Index Ventures – 318 deals', 'Atomico – 187 deals', 'Balderton – 134 deals', 'Northzone – 89 deals'],
    },
  };

  const allInstrumentIds = ['grant', 'preseed', 'seed', 'series-a'];

  function buildDetailPanel(path, count) {
    const pathInstruments = new Set(path.steps.filter(Boolean));

    const investorBoxes = allInstrumentIds.map(instId => {
      const data = investorData[instId];
      const isFilled = pathInstruments.has(instId);
      const listHTML = isFilled
        ? data.investors.map(inv => `<li>${inv}</li>`).join('')
        : '<li class="tp-inv-empty">—</li>'.repeat(5);

      return `
        <div class="tp-investor-box active">
          <div class="tp-inv-header">
            <div class="tp-inv-icon">${data.icon}</div>
            <span class="tp-inv-title">${data.title}</span>
          </div>
          <ol class="tp-inv-list">${listHTML}</ol>
        </div>
      `;
    }).join('');

    return `
      <div class="tp-path-detail">
        <div class="tp-stats-row">
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Startups choosing this path:</div>
              <div class="stat-value">${count}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Median Time to first Round:</div>
              <div class="stat-value">${path.medianFirst}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Median Time between Rounds:</div>
              <div class="stat-value">${path.medianBetween}</div>
            </div>
          </div>
        </div>
        <div class="tp-investor-row">${investorBoxes}</div>
      </div>
    `;
  }

  /* ── Paths list builder ── */
  function buildPaths() {
    const pathsList = document.getElementById('tp-paths-list');
    const activeData = getActivePathsData();
    let pathsData = activeData[currentNarrative] || activeData['General Overview'];

    const isSeriesA = document.getElementById('tp-pfb-seriesa-toggle-collapsed')?.checked;
    if (isSeriesA) {
      pathsData = pathsData.filter(path => path.steps.includes('series-a'));
    }

    const pfbCountry = document.getElementById('tp-pfb-country');
    const pfbIndustry = document.getElementById('tp-pfb-industry');
    const seedStr = (pfbCountry?.value || '') + (pfbIndustry?.value || '') + isSeriesA + currentNarrative;
    pathsData = shufflePaths(pathsData, seedStr);

    pathsData.forEach((path, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'tp-path-card';
      cardEl.id = `tp-path-${idx}`;
      const badgesHTML = path.steps.filter(Boolean).map(stepId => {
        const inst = instruments.find(i => i.id === stepId) || { name: stepId, color: 'var(--text-main)' };
        return `<div style="font-size: 0.875rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; white-space: nowrap; color: ${inst.color}; background: color-mix(in srgb, ${inst.color} 10%, transparent); display: inline-flex; align-items: center; justify-content: center;">${inst.name}</div>`;
      }).join('<div style="color: var(--text-muted); font-size: 1.2rem; font-weight: 400; padding: 0 4px; display: inline-flex; align-items: center;">&ndash;</div>');

      cardEl.innerHTML = `
        <div class="tp-path-header">
          <div class="tp-rank">${idx + 1}</div>
          <div class="tp-path-name" style="display:flex; align-items:center;">${badgesHTML}</div>
          <button class="tp-path-detail-btn" id="tp-path-btn-${idx}">Details</button>
        </div>
      `;
      cardEl.querySelector('.tp-path-header').addEventListener('click', () => selectPath(idx));
      pathsList.appendChild(cardEl);
    });
  }

  /* ── Path Selection ── */
  function selectPath(idx) {
    if (selectedPathIdx === idx) { deselectPath(); return; }

    // Collapse previous
    if (selectedPathIdx !== null) {
      deselectPath(true);
    }

    selectedPathIdx = idx;
    const activeData = getActivePathsData();
    let pathsData = activeData[currentNarrative] || activeData['General Overview'];
    const isSeriesA = document.getElementById('tp-pfb-seriesa-toggle-collapsed')?.checked;
    if (isSeriesA) {
      pathsData = pathsData.filter(path => path.steps.includes('series-a'));
    }
    
    const pfbCountry = document.getElementById('tp-pfb-country');
    const pfbIndustry = document.getElementById('tp-pfb-industry');
    const seedStr = (pfbCountry?.value || '') + (pfbIndustry?.value || '') + isSeriesA + currentNarrative;
    pathsData = shufflePaths(pathsData, seedStr);

    const path = pathsData[idx];
    const count = mockCounts[idx] || 0;

    const cardEl = document.getElementById(`tp-path-${idx}`);
    cardEl.classList.add('selected');

    // Change button to X
    const btn = document.getElementById(`tp-path-btn-${idx}`);
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    // Insert detail panel
    const detailHTML = buildDetailPanel(path, count);
    cardEl.insertAdjacentHTML('beforeend', detailHTML);

    // Animate in
    const detail = cardEl.querySelector('.tp-path-detail');
    requestAnimationFrame(() => {
      detail.classList.add('visible');
    });
  }

  function deselectPath(skipReset) {
    if (selectedPathIdx !== null) {
      const cardEl = document.getElementById(`tp-path-${selectedPathIdx}`);
      if (cardEl) {
        cardEl.classList.remove('selected');
        const btn = document.getElementById(`tp-path-btn-${selectedPathIdx}`);
        if (btn) btn.innerHTML = 'Details';
        const detail = cardEl.querySelector('.tp-path-detail');
        if (detail) {
          detail.classList.remove('visible');
          setTimeout(() => detail.remove(), 300);
        }
      }
    }
    if (!skipReset) selectedPathIdx = null;
  }

  // Build content immediately
  buildPaths();

  // Reveal journey steps
  journeyReveal(mainEl, 200, 500);
}
