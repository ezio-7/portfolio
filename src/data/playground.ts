// Synthetic data for the Playground demos. Not real members, records or formats.

// IN-list model, calibrated to the production incident on a ~38M-row member table:
// a 68,402-ID batch ran as a range scan in ~37.6 s; a 100,000-ID batch fell back to a ~1,750 s full scan.
export const inList = {
  limitBytes: 8 * 1024 * 1024, // MySQL range_optimizer_max_mem_size default
  bytesPerValue: 105, // planner memory per IN value for this lookup (puts the cliff near ~80K IDs)
  rangeMsPerId: 0.55, // range scan cost per ID
  fullScanSec: 1750, // one full scan of the 38M-row table
  totalIds: 968_000, // IDs in the load that stalled
  chosen: 10_000,
  worstCaseCliff: 15_000, // the costliest query in the audit hits the limit near here
};

export const members = [
  { id: 'M-48213', memberId: '00012345', name: 'Jane Doe', dob: '1986-07-04', state: 'TX' },
  { id: 'M-50771', memberId: '77881234', name: 'Ravi Kumar', dob: '1990-02-11', state: 'TX' },
  { id: 'M-61002', memberId: '0004521', name: 'Maria Lopez', dob: '1979-11-23', state: 'CA' },
  { id: 'M-61003', memberId: '4521', name: 'Maria Lopez', dob: '1979-11-23', state: 'NY' },
  { id: 'M-70110', memberId: '33441122', name: 'John Smith', dob: '1985-05-05', state: 'TX' },
  { id: 'M-70111', memberId: '33441199', name: 'John Smith', dob: '1985-05-05', state: 'TX' },
];

export const matchPresets = [
  { label: '00012345', hint: 'exact ID', memberId: '00012345', name: '', dob: '', state: 'TX' },
  { label: '12345', hint: 'zeros trimmed', memberId: '12345', name: '', dob: '', state: 'TX' },
  { label: '4521 · CA', hint: 'state scope', memberId: '4521', name: '', dob: '', state: 'CA' },
  { label: 'Jane Doe', hint: 'no ID', memberId: '', name: 'Jane Doe', dob: '1986-07-04', state: 'TX' },
  { label: 'John Smith', hint: 'ambiguous', memberId: '', name: 'John Smith', dob: '1985-05-05', state: 'TX' },
  { label: '99999999', hint: 'no match', memberId: '99999999', name: '', dob: '', state: 'TX' },
];

export const dqRules = [
  { id: 'member', label: 'Member must be matched', field: 'member' },
  { id: 'code', label: 'Lab code present and valid', field: 'code' },
  { id: 'value', label: 'Result value present', field: 'value' },
  { id: 'dos', label: 'Date of service present, not in the future', field: 'dos' },
];

export const dqBatch = [
  { name: 'Jane Doe', member: 'M-48213', code: '2345-7', value: '98', dos: '2026-03-14' },
  { name: 'Rob Smith', member: '', code: '', value: '', dos: '2026-03-15' },
  { name: 'Ana Ruiz', member: 'M-50771', code: 'UNLOINC', value: '5.4', dos: '2026-03-02' },
  { name: 'Li Wei', member: 'M-61002', code: '4548-4', value: '', dos: '2026-02-28' },
  { name: 'Sam Patel', member: 'M-70110', code: '718-7', value: '13.2', dos: '2027-01-09' },
  { name: 'Ivy Chen', member: 'M-70111', code: '2093-3', value: '182', dos: '2026-01-20' },
  { name: 'Omar Ali', member: 'M-61003', code: '99999', value: '7.1', dos: '2026-03-11' },
  { name: 'Nia Brooks', member: 'M-48990', code: '2160-0', value: '0.9', dos: '2026-03-09' },
];
// default/garbage codes some sources send instead of a real LOINC
export const garbageCodes = ['99999', 'UNLOINC', 'PROF'];
export const today = '2026-10-15';
