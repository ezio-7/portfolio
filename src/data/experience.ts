export type Block = { title: string; stack: string[]; points: string[] };

export type Role = {
  company: string;
  role: string;
  period: string;
  context?: string;
  blocks?: Block[];
  points?: string[];
  platform?: boolean; // show the animated platform pipeline
};

export const experience: Role[] = [
  {
    company: 'HiLabs',
    role: 'Software Development Engineer',
    period: 'Sep 2025 – Present',
    context:
      'Healthcare data ingestion and data-quality platform for multiple US health plans, processing 1,000+ files/day across US states.',
    platform: true,
    blocks: [
      {
        title: 'Clinical Data Ingestion Pipeline',
        stack: ['Python', 'Pandas', 'PyArrow', 'MySQL'],
        points: [
          'Onboarded 20+ provider, lab and HIE sources via a factory-based pre-processing framework',
          'Built multithreaded claims and lab ETL for files up to 100 GB, with a database-driven DQ rules engine',
          'Automated refresh of a 1.9M-code clinical code library (ICD, CPT, LOINC, SNOMED) from UMLS releases',
        ],
      },
      {
        title: 'Fallout Remediation',
        stack: ['Python', 'MySQL', 'SQLAlchemy'],
        points: [
          'Designed and built a system that tracks whether providers fix previously failed records in later files',
          'Built state-partitioned storage, a rule-based remediation engine, daily archival and remediation reports',
          'Made runs idempotent and crash-resumable, consistent across reprocessing and manual rejection',
          'Cut the core query from 34 hrs to 9 min (220×) by replacing large IN-list scans with partition-pruned joins',
        ],
      },
      {
        title: 'Member Matching',
        stack: ['Python', 'Java', 'MySQL', 'PostgreSQL', 'Azure AI Search'],
        points: [
          'Built health-plan-specific member matching (ID-based, state-scoped, demographic) for every clinical record',
          'Migrated matching from Azure AI Search to MySQL/PostgreSQL, saving ~$94K/year with ~3× faster lookups',
          'Automated member-extract indexing, re-indexing 43M+ records with multithreaded, state-partitioned loads',
        ],
      },
      {
        title: 'Reporting & Analytics',
        stack: ['Python', 'SQL'],
        points: [
          "Built the platform's reporting layer: summary view, state breakouts, DQ and member-match fallout reports",
          'Streamed multi-sheet Excel fallout reports with per-cell failure highlighting for files of millions of rows',
          'Reconciled critical-fallout counts across dashboard, load-status and fallout reports for business users',
          'Built member analytics (net-new members, coverage, penetration %) with daily and monthly rollup jobs',
          'Built duplicate-file and provider layout-change detection using file- and record-level hashing',
        ],
      },
      {
        title: 'Workflow Orchestration & Large-File Processing',
        stack: ['Java', 'Spring Boot'],
        points: [
          'Built Spring Boot fetcher/executor microservices with record locking, driving each file through ~17 stages',
          'Built a self-healing framework with heartbeat-based stuck-load detection and automatic retry',
          'Split files up to 100 GB into parent/child chunk loads with stage-wise retry, load-tested at 20+ in parallel',
          'Removed the Solr dependency from the Java orchestrator, deleting ~4K lines of indexing code',
        ],
      },
      {
        title: 'Cloud-Agnostic Platform',
        stack: ['Python', 'Java', 'PostgreSQL', 'Liquibase', 'Azure', 'AWS'],
        points: [
          'Built a shared DB layer with connection pooling, Azure AD / AWS IAM token auth and retry with backoff',
          'Abstracted cloud SDKs behind Java interfaces and Python storage handlers for Azure Blob, S3 and local',
          'Migrated MySQL to PostgreSQL on AWS RDS using JPA/Hibernate and Liquibase, with parity testing',
        ],
      },
      {
        title: 'Infrastructure, Security & Releases',
        stack: ['Kubernetes', 'Helm', 'Docker', 'Azure DevOps'],
        points: [
          'Deployed on Azure Kubernetes Service with Helm and KEDA autoscaling, monitored via Splunk and Grafana',
          'Implemented Entra ID SSO and RBAC in Spring Security, with Managed Identity for secret-free SQL/Blob access',
          'Fixed VAPT/HITRUST findings, cut HIGH container CVEs by 38%, and shipped ~15 production releases via CI/CD',
        ],
      },
    ],
  },
  {
    company: 'EY Global Delivery Services',
    role: 'Analyst',
    period: 'Jul 2024 – Aug 2025',
    points: [
      'Built the complete backend of an OPM Model application from scratch using FastAPI, MySQL and SQLAlchemy',
      'Developed the backend of a Tax Cover Letter application for EY Germany using FastAPI and MongoDB',
      'Built the backend of a document summarization web application using Flask and MySQL',
      'Implemented discount prediction and customer segmentation models in Python for EY Germany',
    ],
  },
  {
    company: 'Noise',
    role: 'Software Development Intern',
    period: 'May 2024 – Jul 2024',
    points: [
      'Migrated the platform from a monolith to microservices and from single-tenant to multi-tenant architecture',
      'Designed and built the Sleep 2.0 API, including its calculations and database migration, from scratch',
    ],
  },
  {
    company: 'Vayuvoy',
    role: 'Software Development Intern',
    period: 'May 2023 – Jul 2023',
    points: [
      'Built a queue management system with NestJS and RabbitMQ using priority queues over AMQP',
      'Created REST APIs for dynamic queue creation, and consumers with acknowledgements to prevent data loss',
    ],
  },
  {
    company: 'Resurgent PMC',
    role: 'Software Development Intern',
    period: 'May 2022 – Aug 2022',
    points: [
      'Built a secure, scalable proctoring web app with Node.js, Socket.io and Next.js (TypeScript)',
      'Added real-time monitoring with PeerJS and cheating detection with TensorFlow.js (phone use, multiple faces)',
    ],
  },
];

// HiLabs platform stages, in processing order
export const platformStages = [
  { name: 'File', tip: 'Provider, lab, registry and HIE files land in blob storage' },
  { name: 'Pre-processing', tip: 'Source-specific handlers normalise 20+ non-standard formats' },
  { name: 'File Validation', tip: 'Encoding, delimiter, header and compatibility checks reject bad files early' },
  { name: 'AutoMapper', tip: 'ML model maps each source column to the canonical model' },
  { name: 'Entity Detection', tip: 'Detects clinical entities (claims, labs, diagnoses, procedures) in the file' },
  { name: 'Member Matching', tip: 'Links every record to the right health-plan member' },
  { name: 'ICM', tip: 'Transforms records into the Integrated Clinical Model' },
  { name: 'DQ', tip: 'Critical and recommended data-quality rules flag unusable records' },
  { name: 'UCM', tip: 'Builds the Unified Clinical Model consumed downstream' },
  { name: 'Reports', tip: 'Summary view, fallout, remediation and analytics reports' },
];
