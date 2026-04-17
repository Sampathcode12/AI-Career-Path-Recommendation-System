/**
 * Job Search country filter — values must match Back-End seeded JobListing.Country (see JobLocationCountryResolver).
 * Sri Lanka first, then 20 major economies (GDP-weighted), plus "All countries".
 */
export const JOB_COUNTRY_FILTER_OPTIONS = [
  { value: '', label: 'All countries' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'United States', label: 'United States' },
  { value: 'China', label: 'China' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Germany', label: 'Germany' },
  { value: 'India', label: 'India' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Singapore', label: 'Singapore' },
];

export function getJobCountryFilterLabel(value) {
  if (value == null || String(value).trim() === '') return 'All countries';
  const opt = JOB_COUNTRY_FILTER_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}
