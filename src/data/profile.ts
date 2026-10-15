export const profile = {
  name: 'Ayush Anand',
  role: 'Software Engineer',
  focus: ['Python', 'Java', 'Data Platforms'],
  tagline:
    'I build the systems that move healthcare data: ingestion pipelines, data-quality engines and the services that orchestrate them.',
  about: [
    'Software engineer at HiLabs, working on a clinical data platform that ingests 1,000+ files a day for multiple US health plans. Most of my work sits where Python data pipelines meet Java services and SQL that has to stay fast at tens of millions of rows.',
    'Before that I built backends at EY and interned across microservices, message queues and real-time apps. IIT Kharagpur graduate.',
  ],
  email: 'ayushanand.app@gmail.com',
  location: 'India',
  links: {
    github: 'https://github.com/ezio-7',
    linkedin: 'https://www.linkedin.com/in/ayush-anand-917ab2220/',
  },
  resume: 'Ayush_Anand_Resume.pdf',
  // "Now" line in the hero: edit freely
  now: 'Building fallout remediation reporting and the Postgres migration at HiLabs',
  updated: 'Oct 2026',
  avatar: 'avatar.jpg',
};

export const skills = [
  { group: 'Languages', items: ['Python', 'Java', 'SQL', 'C++', 'JavaScript', 'TypeScript'] },
  {
    group: 'Frameworks',
    items: ['FastAPI', 'Flask', 'Spring Boot', 'SQLAlchemy', 'Pydantic', 'Pandas', 'Node.js'],
  },
  { group: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'] },
  { group: 'Cloud & DevOps', items: ['Azure', 'AWS', 'Kubernetes', 'Docker', 'Helm', 'CI/CD', 'Git'] },
];

export const education = {
  school: 'Indian Institute of Technology (IIT) Kharagpur',
  degree: 'B.Tech, Metallurgical and Materials Engineering',
  period: 'Dec 2020 – Apr 2024',
  gpa: '8.57 / 10',
};

export const achievements = [
  'Top 1.6% of 2.5 Lakh+ in JEE Advanced and top 0.6% of 10 Lakh+ in JEE Main (2020)',
  'Highest rating of 1798 on CodeChef and 1160 on Codeforces; 500+ problems solved',
  'Selected among the top 5% of applicants for Amazon ML Summer School',
];

// "By the numbers" strip: value counts up from 0 on scroll
export const stats = [
  { value: 1000, suffix: '+', label: 'files processed / day' },
  { value: 43, suffix: 'M+', label: 'member records indexed' },
  { value: 220, suffix: '×', label: 'faster remediation query' },
  { value: 94, prefix: '~$', suffix: 'K', label: 'saved / year' },
  { value: 1000, suffix: '+', label: 'commits at HiLabs' },
];
