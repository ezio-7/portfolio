export type DiagramNode = {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  tip: string;
  kind?: 'process' | 'store' | 'accent' | 'muted';
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  muted?: boolean;
  route?: 'under' | 'over'; // loop back below / above the nodes
  ports?: [string, string]; // pin sides, e.g. ['b.3', 't']
};

export type DiagramGroup = { x: number; y: number; w: number; h: number; label: string };

export type Diagram = {
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
};

export type PlayStep = { node: string; text: string };

export type CaseStudy = {
  id: string;
  title: string;
  tagline: string;
  problem: string;
  approach: string[];
  results: { value: string; label: string }[];
  stack: string[];
  diagram: Diagram;
  steps: PlayStep[]; // ▶ walk-through, in order
  // Recruiter view: the same story in plain English
  plain: { tagline: string; problem: string; approach: string[] };
};

export const caseStudies: CaseStudy[] = [
  {
    id: 'fallout-remediation',
    title: 'Fallout Remediation',
    tagline: 'Closing the loop on data-quality failures',
    problem:
      'Records failing critical data-quality checks are sent back to providers, but nothing told us whether a provider actually fixed them in a later file. Fallout numbers only ever went up.',
    approach: [
      'Index every critical failure into state-partitioned tables keyed by member, source and date of service',
      "Stream each later file's output in checkpointed chunks and look up only the members it touches",
      'Run per-rule reverse checks to decide if the newer record fixes the original failure, then commit in one short transaction',
      'Keep status correct through reprocessing and manual rejection; archive expired loads to blob storage daily',
    ],
    results: [
      { value: '34 hrs → 9 min', label: 'core query' },
      { value: '220×', label: 'faster' },
      { value: 'Idempotent', label: 'crash-resumable runs' },
    ],
    stack: ['Python', 'MySQL', 'SQLAlchemy', 'Azure Blob'],
    plain: {
      tagline: "Showing whether providers fixed their data, automatically",
      problem: "When a provider sends bad data, it is flagged and sent back. Nobody could tell whether the provider actually fixed it in a later file, so the bad-data count only ever went up.",
      approach: [
        "Built a system that remembers every flagged record and checks each new file for the fix",
        "It updates the status automatically and feeds a report the business team uses",
        "It is safe to re-run and picks up where it left off if anything crashes",
        "Made the slowest step 220× faster: from 34 hours to 9 minutes",
      ],
    },
    steps: [
      { node: 'dq', text: "A record fails a critical rule: its lab code is missing." },
      { node: 'indexer', text: "The failure is indexed with member, source, state and date of service." },
      { node: 'index', text: "It waits in the state-partitioned fallout index as 'open'." },
      { node: 'output', text: "Days later, the same provider sends a new file. It streams in chunks." },
      { node: 'lookup', text: "Only members in this chunk are looked up, one partition at a time." },
      { node: 'rules', text: "The engine re-checks the failed rule on the newer record. The lab code is there now." },
      { node: 'commit', text: "Every fix in the chunk commits in one short transaction." },
      { node: 'index', text: "The original failure is marked remediated." },
      { node: 'archive', text: "After the retention window, the load is archived to blob storage and purged." },
      { node: 'report', text: "Business users see what got fixed in the remediation report." },
    ],
    diagram: {
      width: 960,
      height: 430,
      groups: [
        { x: 8, y: 14, w: 944, h: 112, label: 'earlier load · failures indexed' },
        { x: 8, y: 150, w: 944, h: 130, label: 'later load · remediation' },
        { x: 8, y: 304, w: 944, h: 112, label: 'recovery & output' },
      ],
      nodes: [
        { id: 'dq', x: 30, y: 52, label: 'DQ checks', sub: 'critical rule failures', tip: 'Critical data-quality rules flag records that cannot be used downstream.' },
        { id: 'indexer', x: 250, y: 52, label: 'Fallout indexer', sub: 'member · source · DOS', tip: 'Writes each failure with the keys needed to recognise a later fix.' },
        { id: 'index', x: 490, y: 52, w: 190, label: 'Fallout index', sub: 'state-partitioned tables', tip: 'Failures plus their remediation status, partitioned by state so lookups touch one partition.', kind: 'store' },
        { id: 'archive', x: 740, y: 52, w: 190, label: 'Daily archival', sub: 'blob CSV, then purge', tip: 'Expired loads are exported to blob storage before their rows are deleted.' },
        { id: 'output', x: 30, y: 196, label: 'New file output', sub: 'streamed in chunks', tip: "A later file's clinical output, read in chunks with a checkpoint after each one." },
        { id: 'lookup', x: 250, y: 196, label: 'Member lookup', sub: 'partition-pruned join', tip: 'Fetches only open failures for the members in this chunk. Replacing huge IN-lists here took the query from 34 hrs to 9 min.', kind: 'accent' },
        { id: 'rules', x: 490, y: 196, w: 190, label: 'Remediation engine', sub: 'per-rule reverse checks', tip: 'For each failed rule, checks whether the newer record now passes it.' },
        { id: 'commit', x: 740, y: 196, w: 190, label: 'Set-based commit', sub: 'one short transaction', tip: 'Stages all status changes and applies them in a single UPDATE … JOIN, so reruns are safe.' },
        { id: 'checkpoint', x: 30, y: 342, label: 'Checkpoint', sub: 'resume after a crash', tip: 'Progress is saved per chunk, so a crashed run resumes instead of starting over.', kind: 'muted' },
        { id: 'reprocess', x: 250, y: 342, label: 'Reprocess / reject', sub: 'reconcile or roll back', tip: 'When a load is reprocessed or rejected, its remediations are reconciled or rolled back. A load can only remediate older loads.' },
        { id: 'report', x: 740, y: 342, w: 190, label: 'Remediation report', sub: 'per-load Excel', tip: 'Business-facing report of what was fixed, generated before archival purges the rows.' },
      ],
      edges: [
        { from: 'dq', to: 'indexer' },
        { from: 'indexer', to: 'index' },
        { from: 'index', to: 'archive', muted: true },
        { from: 'output', to: 'lookup' },
        { from: 'index', to: 'lookup', label: 'open failures', ports: ['b.25', 't'] },
        { from: 'lookup', to: 'rules' },
        { from: 'rules', to: 'commit' },
        { from: 'commit', to: 'index', label: 'status', ports: ['t', 'b.75'] },
        { from: 'output', to: 'checkpoint', muted: true },
        { from: 'reprocess', to: 'rules', label: 'reconcile', muted: true, ports: ['r', 'b'] },
        { from: 'commit', to: 'report' },
      ],
    },
  },
  {
    id: 'member-matching',
    title: 'Member Matching',
    tagline: 'Linking every clinical record to the right member',
    problem:
      'Every incoming record must be tied to the correct health-plan member before it counts. Matching ran on Azure AI Search, the most expensive service in the platform, and each plan identifies members differently.',
    approach: [
      'Built plan-specific matching tiers: ordered ID matching, padded and trimmed IDs, state scoping and demographics',
      'Moved the member index from Azure AI Search to state-partitioned MySQL / PostgreSQL tables with batched, index-friendly lookups',
      'Automated member-extract indexing with multithreaded, state-partitioned loads',
      'Ran both backends behind a switch to prove parity before cutting over',
    ],
    results: [
      { value: '~$94K/yr', label: 'saved' },
      { value: '~3×', label: 'faster lookups' },
      { value: '43M+', label: 'records indexed' },
    ],
    stack: ['Python', 'Java', 'MySQL', 'PostgreSQL', 'Azure AI Search'],
    plain: {
      tagline: "Making sure every record belongs to the right person",
      problem: "Every medical record has to be linked to the right health-plan member. The old setup ran on the most expensive service in the platform, and each health plan identifies its members differently.",
      approach: [
        "Built matching rules tailored to each health plan",
        "Moved matching to cheaper, faster databases, saving about $94K a year",
        "Made member lists load automatically: 43M+ records",
        "Ran the old and new systems side by side to prove the results matched before switching",
      ],
    },
    steps: [
      { node: 'extract', text: "A health plan sends its member extract." },
      { node: 'indexjob', text: "Indexing picks it up automatically and loads it state by state, in parallel." },
      { node: 'memberidx', text: "Members land in state-partitioned SQL tables. Azure AI Search is no longer needed." },
      { node: 'records', text: "A clinical record arrives carrying member ID 00012345." },
      { node: 'id', text: "ID types are tried in priority order; the first unique hit wins." },
      { node: 'state', text: "Candidates are restricted to the states the plan covers." },
      { node: 'matched', text: "One unique member: the ID and how it matched are written to the record." },
      { node: 'pad', text: "If IDs miss, zero-padded and trimmed variants are tried…" },
      { node: 'demo', text: "…then name plus date of birth." },
      { node: 'fallout', text: "No match at all: the record goes to its own member-match fallout report." },
    ],
    diagram: {
      width: 960,
      height: 380,
      groups: [
        { x: 8, y: 14, w: 944, h: 112, label: 'indexing' },
        { x: 8, y: 150, w: 944, h: 216, label: 'matching' },
      ],
      nodes: [
        { id: 'extract', x: 30, y: 52, label: 'Member extracts', sub: 'plan eligibility files', tip: 'Periodic member files from each health plan.' },
        { id: 'indexjob', x: 250, y: 52, label: 'Indexing job', sub: 'automated · multithreaded', tip: 'Picks up new extracts automatically and loads them state by state in parallel.' },
        { id: 'memberidx', x: 490, y: 52, w: 190, label: 'Member index', sub: 'MySQL / PostgreSQL', tip: 'State-partitioned member tables with indexes for each lookup path. 43M+ records.', kind: 'store' },
        { id: 'aisearch', x: 740, y: 52, w: 190, label: 'Azure AI Search', sub: 'retired', tip: 'The previous backend: the most expensive service in the platform. Removing it saves ~$94K/year.', kind: 'muted' },
        { id: 'records', x: 30, y: 230, label: 'Clinical records', sub: 'from the mapped file', tip: 'Every record in an incoming file needs a member before it can be used.' },
        { id: 'id', x: 250, y: 190, label: 'ID match', sub: 'ordered, first unique wins', tip: 'Tries each member ID type in priority order and stops at the first unique match.', kind: 'accent' },
        { id: 'pad', x: 250, y: 290, label: 'Padded / trimmed IDs', sub: 'leading-zero variants', tip: 'Retries with leading zeros added or stripped, using index-friendly lookups.' },
        { id: 'state', x: 490, y: 190, w: 190, label: 'State scope', sub: 'per-plan rules', tip: 'Restricts candidates to the states a plan covers, including multi-state files.' },
        { id: 'demo', x: 490, y: 290, w: 190, label: 'Demographic match', sub: 'name + date of birth', tip: 'Falls back to name and date of birth when IDs are missing.' },
        { id: 'matched', x: 740, y: 190, w: 190, label: 'Matched member', sub: '+ match criteria', tip: 'The member ID plus which rule matched, written into the output.' },
        { id: 'fallout', x: 740, y: 290, w: 190, label: 'Match fallout', sub: 'separate report', tip: 'Unmatched records go to their own fallout report so other DQ counts stay clean.' },
      ],
      edges: [
        { from: 'extract', to: 'indexjob' },
        { from: 'indexjob', to: 'memberidx' },
        { from: 'memberidx', to: 'aisearch', muted: true },
        { from: 'records', to: 'id' },
        { from: 'id', to: 'pad', label: 'no match' },
        { from: 'pad', to: 'demo' },
        { from: 'id', to: 'state' },
        { from: 'memberidx', to: 'state', label: 'batched lookups' },
        { from: 'state', to: 'matched' },
        { from: 'demo', to: 'matched' },
        { from: 'demo', to: 'fallout', muted: true },
      ],
    },
  },
  {
    id: 'orchestration',
    title: 'Workflow Orchestration',
    tagline: 'Moving 1,000+ files a day through ~17 stages',
    problem:
      'Each file passes through ~17 processing stages across Java and Python. Stuck tasks waited for a fixed 72-hour timeout, and multi-GB files held up the normal daily flow.',
    approach: [
      'Spring Boot fetchers poll a stage table on a schedule (ShedLock keeps it safe across pods) and lock the records they pick up',
      'An executor service runs each stage and writes status back, so every load’s progress is visible',
      'A heartbeat monitor finds stuck loads and retries, fails or releases them automatically',
      'Files up to 100 GB are split into parent/child chunk loads with stage-wise retry and reconciliation',
    ],
    results: [
      { value: '~17', label: 'stages orchestrated' },
      { value: '100 GB', label: 'files supported' },
      { value: '20+', label: 'large files in parallel' },
    ],
    stack: ['Java', 'Spring Boot', 'ShedLock', 'MySQL', 'Kubernetes'],
    plain: {
      tagline: "Keeping 1,000+ files a day moving without babysitting",
      problem: "Each file goes through about 17 processing steps. When a step got stuck it could sit for up to 3 days before timing out, and very large files slowed everything else down.",
      approach: [
        "Built the services that move each file from step to step and track its progress",
        "Stuck work is now detected and restarted automatically, with no 3-day wait",
        "Very large files (up to 100 GB) are split into pieces and processed in parallel",
        "Load-tested with 20+ large files at once",
      ],
    },
    steps: [
      { node: 'big', text: "A 60 GB HIE file arrives." },
      { node: 'split', text: "It is split into child chunk loads under one parent." },
      { node: 'stage', text: "Each child gets a row in the stage table." },
      { node: 'fetch', text: "A fetcher polls the table; ShedLock makes sure only one pod picks it up." },
      { node: 'exec', text: "The executor locks the record and dispatches the stage job." },
      { node: 'jobs', text: "Workers run the stage and write status back to the table." },
      { node: 'rollup', text: "Child statuses roll up into the parent load." },
      { node: 'heart', text: "If a job goes silent, the heartbeat monitor notices…" },
      { node: 'heal', text: "…and self-healing retries, fails or releases it." },
      { node: 'stage', text: "The load is back in the stage table, unblocked. No 72-hour wait." },
    ],
    diagram: {
      width: 960,
      height: 400,
      groups: [
        { x: 8, y: 14, w: 944, h: 104, label: 'large files' },
        { x: 8, y: 140, w: 944, h: 116, label: 'stage loop' },
        { x: 8, y: 278, w: 944, h: 108, label: 'self-healing' },
      ],
      nodes: [
        { id: 'big', x: 30, y: 48, label: 'Large file', sub: 'up to 100 GB', tip: 'HIE and registry files too big to process in one pass.' },
        { id: 'split', x: 250, y: 48, label: 'Splitter', sub: 'parent + child loads', tip: 'Splits the file into child chunk loads under one parent, each processed independently.' },
        { id: 'rollup', x: 740, y: 48, w: 190, label: 'Sibling rollup', sub: 'reconcile chunk status', tip: 'Combines child statuses into the parent; failed chunks retry from their own stage.' },
        { id: 'stage', x: 30, y: 176, label: 'Stage table', sub: 'status per load', tip: 'One row per load and stage: the single source of truth for progress.', kind: 'store' },
        { id: 'fetch', x: 250, y: 176, label: 'Fetchers', sub: 'scheduled · ShedLock', tip: 'Spring Boot schedulers poll for work; ShedLock stops two pods picking the same job.', kind: 'accent' },
        { id: 'exec', x: 490, y: 176, w: 190, label: 'Executor', sub: 'record locking', tip: 'Locks the record and dispatches the stage job.' },
        { id: 'jobs', x: 740, y: 176, w: 190, label: 'Stage jobs', sub: 'Python & Java workers', tip: 'Pre-processing, mapping, matching, ICM, DQ, UCM and reports.' },
        { id: 'heart', x: 250, y: 314, label: 'Heartbeat monitor', sub: 'detects stuck loads', tip: 'Running jobs send heartbeats; silence means stuck. Replaced a fixed 72-hour timeout.' },
        { id: 'heal', x: 30, y: 314, label: 'Self-healing', sub: 'retry · fail · release', tip: 'Retries, fails or releases stuck loads so queues never stay blocked.' },
      ],
      edges: [
        { from: 'big', to: 'split' },
        { from: 'split', to: 'stage', label: 'child loads' },
        { from: 'stage', to: 'fetch', label: 'poll' },
        { from: 'fetch', to: 'exec' },
        { from: 'exec', to: 'jobs' },
        { from: 'jobs', to: 'stage', label: 'status', route: 'under' },
        { from: 'jobs', to: 'rollup' },
        { from: 'exec', to: 'heart', label: 'heartbeats', muted: true, ports: ['b', 'r'] },
        { from: 'heart', to: 'heal' },
        { from: 'heal', to: 'stage', label: 'reset' },
      ],
    },
  },
  {
    id: 'cloud-agnostic',
    title: 'Cloud-Agnostic Platform',
    tagline: 'One codebase, either cloud, either database',
    problem:
      'The platform was wired to one cloud and one database, with connection and storage code scattered across modules. Every new deployment target meant risky, repo-wide changes.',
    approach: [
      'A shared DB layer: thread-safe pooled handlers for MySQL and PostgreSQL that pick password, Azure AD or AWS IAM token auth from config',
      'Automatic retry with backoff on deadlocks, lock timeouts and expired tokens',
      'Storage handlers for Azure Blob, S3 and local disk behind one interface; Java cloud SDKs behind interfaces with Azure / AWS profiles',
      'Migrated MySQL to PostgreSQL on AWS RDS with JPA/Hibernate and Liquibase, verified with parity tests',
    ],
    results: [
      { value: '2', label: 'clouds' },
      { value: '2', label: 'databases' },
      { value: '1', label: 'codebase' },
    ],
    stack: ['Python', 'Java', 'PostgreSQL', 'Liquibase', 'Azure', 'AWS'],
    plain: {
      tagline: "The same product, on any cloud",
      problem: "The product only ran on one cloud provider and one database, so setting it up for a new client was slow and risky.",
      approach: [
        "Built one shared way for all the code to talk to databases and file storage",
        "Secure logins work on both Azure and AWS without code changes",
        "Moved the database to PostgreSQL on AWS and verified nothing changed",
        "Developers can run the whole system on a laptop",
      ],
    },
    steps: [
      { node: 'py', text: "Python code asks for a connection. It never touches a driver or cloud SDK directly." },
      { node: 'db', text: "The DB handler hands out a pooled, thread-safe connection with retries." },
      { node: 'auth', text: "Auth comes from config: password, Azure AD token or AWS IAM token, refreshed before expiry." },
      { node: 'dbs', text: "The same queries run on MySQL or PostgreSQL." },
      { node: 'storage', text: "Files go through one storage interface…" },
      { node: 'blob', text: "…to Azure Blob or S3 in the cloud," },
      { node: 'local', text: "…or local disk for development, with no cloud credentials." },
      { node: 'java', text: "Java services use database-neutral JPA entities…" },
      { node: 'jpa', text: "…and Liquibase migrations, so schemas move with the code." },
      { node: 'dbs', text: "Either cloud, either database, one codebase." },
    ],
    diagram: {
      width: 960,
      height: 360,
      groups: [{ x: 716, y: 14, w: 236, h: 332, label: 'targets · picked by config profile' }],
      nodes: [
        { id: 'java', x: 30, y: 46, label: 'Java services', sub: 'Spring Boot', tip: 'Orchestration and APIs.' },
        { id: 'jpa', x: 270, y: 46, label: 'JPA + Liquibase', sub: 'entities · migrations', tip: 'Database-neutral entities and versioned schema migrations; cloud SDKs sit behind interfaces with Azure / AWS profiles.' },
        { id: 'py', x: 30, y: 196, label: 'Python pipeline', sub: 'ETL · reports', tip: 'Every Python module goes through the shared handlers, never a raw connection or SDK.' },
        { id: 'db', x: 270, y: 150, label: 'DB handler', sub: 'pooled · thread-safe', tip: 'Singleton per process with connection pooling and backoff on deadlocks, lock timeouts and expired tokens.', kind: 'accent' },
        { id: 'auth', x: 500, y: 150, w: 180, label: 'Auth strategy', sub: 'password · Azure AD · AWS IAM', tip: 'Picks password, Azure workload-identity token or AWS RDS IAM token from config, and refreshes tokens before they expire.' },
        { id: 'storage', x: 270, y: 250, label: 'Storage handler', sub: 'one interface', tip: 'Read, write and list files the same way on any backend.' },
        { id: 'dbs', x: 740, y: 46, w: 190, h: 60, label: 'MySQL · PostgreSQL', sub: 'Azure · AWS RDS', tip: 'Same code on either database; MySQL to PostgreSQL migration verified with parity tests.', kind: 'store' },
        { id: 'blob', x: 740, y: 196, w: 190, label: 'Azure Blob · S3', sub: 'object storage', tip: 'Same interface for both clouds.', kind: 'store' },
        { id: 'local', x: 740, y: 276, w: 190, label: 'Local disk', sub: 'local development', tip: 'Run the pipeline locally with no cloud credentials.', kind: 'store' },
      ],
      edges: [
        { from: 'java', to: 'jpa' },
        { from: 'jpa', to: 'dbs', ports: ['r', 'l.35'] },
        { from: 'py', to: 'db' },
        { from: 'py', to: 'storage' },
        { from: 'db', to: 'auth' },
        { from: 'auth', to: 'dbs', ports: ['r', 'l.75'] },
        { from: 'storage', to: 'blob' },
        { from: 'storage', to: 'local' },
      ],
    },
  },
];
