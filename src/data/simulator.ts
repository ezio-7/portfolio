// Synthetic sample records for the hero "run a record" demo. Not real data or formats.
export type SimStep = {
  log: string;
  raw?: string; // shown instead of fields at the file stage
  fields?: Record<string, string>;
  status?: 'ok' | 'fail' | 'skip';
};

const good: SimStep[] = [
  { log: 'received labs_0314.csv · 1 row', raw: '"DOE, JANE ",07/04/86,f,00012345, 2345-7 ,98,mg/dl,03-14-26' },
  {
    log: 'trimmed fields · normalised name, dates, units',
    fields: { pt_name: 'Jane Doe', birth_dt: '1986-07-04', sex: 'F', mbr_no: '00012345', test_cd: '2345-7', result: '98', uom: 'mg/dL', svc_dt: '2026-03-14' },
  },
  { log: 'utf-8 ✓ · delimiter ✓ · header ✓ → file accepted' },
  {
    log: 'mapped 8 / 8 columns · avg confidence 0.96',
    fields: { PatientName: 'Jane Doe', DateOfBirth: '1986-07-04', Gender: 'F', MemberID: '00012345', LabCode: '2345-7', ResultValue: '98', ResultUnit: 'mg/dL', ServiceDate: '2026-03-14' },
  },
  { log: 'entity → LabResult (LOINC 2345-7 · Glucose)', fields: { Entity: 'LabResult' } },
  { log: '00012345 → no exact hit · 12345 → unique match', fields: { PlanMemberID: 'M-48213', MatchedOn: 'ID · trimmed zeros' } },
  { log: 'built integrated clinical record', fields: { LabName: 'Glucose' } },
  { log: '14 critical rules · 0 failures', fields: { DQ: 'passed 14 / 14' } },
  { log: 'written to the unified lab extract', fields: { Status: 'usable ✓' } },
  { log: 'load report · usability 100% · 0 fallout' },
];

const bad: SimStep[] = [
  { log: 'received labs_0315.csv · 1 row', raw: '"SMITH, ROB",,M,99999999,,,,03-15-26' },
  {
    log: 'trimmed fields · normalised name, dates',
    fields: { pt_name: 'Rob Smith', birth_dt: '', sex: 'M', mbr_no: '99999999', test_cd: '', result: '', uom: '', svc_dt: '2026-03-15' },
  },
  { log: 'utf-8 ✓ · delimiter ✓ · header ✓ → file accepted' },
  {
    log: 'mapped 8 / 8 columns · avg confidence 0.93',
    fields: { PatientName: 'Rob Smith', DateOfBirth: '', Gender: 'M', MemberID: '99999999', LabCode: '', ResultValue: '', ResultUnit: '', ServiceDate: '2026-03-15' },
  },
  { log: 'entity → LabResult', fields: { Entity: 'LabResult' } },
  { log: '99999999 → no match · no DOB for demographics → unmatched', fields: { PlanMemberID: '—', MatchedOn: 'none' }, status: 'fail' },
  { log: 'built integrated clinical record', fields: { LabName: '—' } },
  { log: 'failed: LabCode missing · member not matched', fields: { DQ: 'failed 2 critical' }, status: 'fail' },
  { log: 'skipped: record not usable', fields: { Status: 'fallout ✕' }, status: 'skip' },
  { log: 'sent to fallout report · remediation watches for a fix', status: 'fail' },
];

export const simulator = { good, bad };
