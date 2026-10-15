export type Project = {
  name: string;
  context: string;
  description: string;
  stack: string[];
  repo: string;
  demo?: string;
  motif: 'proctor' | 'queue' | 'bug' | 'feed' | 'bet' | 'camp' | 'pin' | 'game';
};

export const projects: Project[] = [
  {
    name: 'Proctoring App',
    motif: 'proctor',
    context: 'Internship · Resurgent PMC',
    description:
      'Online exam proctoring with live video monitoring and in-browser cheating detection (phone use, multiple faces, tab switching).',
    stack: ['Node.js', 'Socket.io', 'PeerJS', 'TensorFlow.js'],
    repo: 'https://github.com/ezio-7/proctor-app',
  },
  {
    name: 'Queue Service',
    motif: 'queue',
    context: 'Internship · Vayuvoy',
    description:
      'Message queue service with dynamically created queues, priority delivery and acknowledged consumers.',
    stack: ['NestJS', 'TypeScript', 'RabbitMQ'],
    repo: 'https://github.com/ezio-7/queing-service',
  },
  {
    name: 'Code Guardian',
    motif: 'bug',
    context: 'Self project',
    description:
      'Runs Python, JavaScript or Java snippets and, on failure, asks an LLM to explain the bug and return fixed code, with a chat view for follow-ups.',
    stack: ['Flask', 'LangChain', 'OpenAI', 'JavaScript'],
    repo: 'https://github.com/ezio-7/code-guardian',
  },
  {
    name: 'Twitter Clone',
    motif: 'feed',
    context: 'Self project',
    description: 'Social feed with posts, follows, profiles, image uploads and credential auth.',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'NextAuth'],
    repo: 'https://github.com/ezio-7/twitter-clone',
  },
  {
    name: 'Betting Site',
    motif: 'bet',
    context: 'Self project',
    description:
      'Real-time betting platform with wallets, transaction history and an admin panel for managing users.',
    stack: ['Next.js', 'Socket.io', 'JavaScript'],
    repo: 'https://github.com/ezio-7/betting-site',
  },
  {
    name: 'Yelp Camp',
    motif: 'camp',
    context: 'Self project',
    description: 'Campground review site with authentication, authorization and full CRUD for campgrounds and reviews.',
    stack: ['Node.js', 'Express', 'MongoDB'],
    repo: 'https://github.com/ezio-7/yelp-camp',
  },
  {
    name: 'User Location Extension',
    motif: 'pin',
    context: 'Self project',
    description: "Chrome extension that shows the user's city and country from their IP address.",
    stack: ['TypeScript', 'React', 'Plasmo'],
    repo: 'https://github.com/ezio-7/User-Location-Chrome-Extension',
  },
  {
    name: 'Dribbling Block',
    motif: 'game',
    context: 'Self project',
    description: 'Small browser game with sound, win and game-over states, written in plain JavaScript.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    repo: 'https://github.com/ezio-7/dribbling-block',
    demo: 'https://ezio-7.github.io/dribbling-block/',
  },
];
