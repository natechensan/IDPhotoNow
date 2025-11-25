import { IDPreset } from './types';

// Standard PPI for ID photos usually targeted at 300 or 600.
// We will output high res assets.
export const EXPORT_PPI = 300;

export const ID_PRESETS: IDPreset[] = [
  {
    id: 'us-passport',
    name: 'U.S. Passport',
    widthMm: 51,
    heightMm: 51,
    aspectRatio: 1,
    description: '2x2 inches. White background.',
    region: 'USA'
  },
  {
    id: 'jp-passport',
    name: 'Japanese Passport',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    description: '35x45mm. Neutral face.',
    region: 'Japan'
  },
  {
    id: 'cn-passport',
    name: 'Chinese Passport',
    widthMm: 33,
    heightMm: 48,
    aspectRatio: 33 / 48,
    description: '33x48mm. White/Blue background.',
    region: 'China'
  },
  {
    id: 'uk-passport',
    name: 'UK Passport',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    description: '35x45mm. Cream/Grey background.',
    region: 'UK'
  },
  {
    id: 'eu-schengen',
    name: 'Schengen Visa (EU)',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    description: 'Standard 35x45mm.',
    region: 'Europe'
  },
  {
    id: 'in-passport',
    name: 'Indian Passport',
    widthMm: 51,
    heightMm: 51,
    aspectRatio: 1,
    description: '2x2 inches (51x51mm).',
    region: 'India'
  }
];