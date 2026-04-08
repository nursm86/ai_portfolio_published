'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState } from 'react';

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  x: number;
  y: number;
  color: string;
  details: {
    title: string;
    description: string;
    specs: string[];
    tech?: string[];
  };
}

interface Connection {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}

const nodes: NodeData[] = [
  {
    id: 'user',
    label: 'You',
    sublabel: 'Browser',
    icon: '👤',
    x: 50,
    y: 220,
    color: '#8B5CF6',
    details: {
      title: 'Visitor / Browser',
      description: 'You! Visiting mdnurislam.com from anywhere in the world.',
      specs: [
        'Any modern browser (Chrome, Firefox, Safari)',
        'HTTPS encrypted connection',
        'Cloudflare CDN serves cached assets from nearest edge',
      ],
    },
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare',
    sublabel: 'DNS + CDN + SSL',
    icon: '🛡️',
    x: 270,
    y: 220,
    color: '#F59E0B',
    details: {
      title: 'Cloudflare',
      description: 'DNS resolution, CDN caching, SSL termination, and DDoS protection.',
      specs: [
        'Domain: mdnurislam.com',
        'A record → EC2 instance IP',
        'CNAME: www → mdnurislam.com',
        'SSL mode: Full (Strict)',
        'Proxy enabled (orange cloud)',
        'Global CDN — edge servers worldwide',
      ],
      tech: ['DNS', 'CDN', 'SSL/TLS', 'DDoS Protection'],
    },
  },
  {
    id: 'ec2',
    label: 'AWS EC2',
    sublabel: 't3.micro · Sydney',
    icon: '☁️',
    x: 490,
    y: 220,
    color: '#F97316',
    details: {
      title: 'AWS EC2 Instance',
      description: 'The server that runs everything. A single t3.micro instance in Sydney.',
      specs: [
        'Instance: t3.micro (1 vCPU, 1GB RAM)',
        'Region: ap-southeast-2 (Sydney)',
        'OS: Amazon Linux 2023',
        'Elastic IP assigned',
        'Free tier eligible',
        'Security groups configured for HTTP/HTTPS/SSH',
      ],
      tech: ['AWS EC2', 'Amazon Linux 2023', 'systemd'],
    },
  },
  {
    id: 'nginx',
    label: 'Nginx',
    sublabel: 'Reverse Proxy',
    icon: '⚡',
    x: 490,
    y: 80,
    color: '#10B981',
    details: {
      title: 'Nginx Reverse Proxy',
      description: 'Receives HTTP/HTTPS traffic and forwards to the Next.js app.',
      specs: [
        'Listens on port 80 & 443',
        "SSL via Let's Encrypt (certbot)",
        'Proxies to internal app port',
        'Handles WebSocket upgrades',
        'Auto-starts on boot (systemd)',
        'Config managed via conf.d',
      ],
      tech: ['Nginx', "Let's Encrypt", 'certbot'],
    },
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    sublabel: 'Application',
    icon: '▲',
    x: 710,
    y: 80,
    color: '#3B82F6',
    details: {
      title: 'Next.js Application',
      description: 'The portfolio itself — a full-stack Next.js 15 app with React 19, SSR, and API routes.',
      specs: [
        'Next.js 15.2.3 with App Router',
        'React 19 + TypeScript',
        'Tailwind CSS 4 + Framer Motion',
        'Runs as systemd service (auto-restart)',
        'Custom server for production',
        'Standalone output mode',
      ],
      tech: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
  },
  {
    id: 'openai',
    label: 'OpenAI',
    sublabel: 'Chat API',
    icon: '🤖',
    x: 710,
    y: 360,
    color: '#6366F1',
    details: {
      title: 'OpenAI API',
      description: 'Powers the AI chat assistant with streaming responses.',
      specs: [
        'Streaming responses via Vercel AI SDK',
        'System prompt with my background info',
        'Tool calling for structured responses',
        'Max 30s timeout per request',
      ],
      tech: ['OpenAI API', 'Vercel AI SDK', 'Streaming'],
    },
  },
  {
    id: 'github',
    label: 'GitHub',
    sublabel: 'Source Code',
    icon: '🐙',
    x: 490,
    y: 360,
    color: '#8B5CF6',
    details: {
      title: 'GitHub Repository',
      description: 'Source code hosted on GitHub. Deploy flow: push → SSH → pull → build → restart.',
      specs: [
        'Repo: nursm86/ai_portfolio_published',
        'Deploy: git push → SSH into EC2 → git pull → npm run build → restart',
        'Source code is public',
      ],
      tech: ['Git', 'GitHub'],
    },
  },
];

const connections: Connection[] = [
  { from: 'user', to: 'cloudflare', label: 'HTTPS request' },
  { from: 'cloudflare', to: 'ec2', label: 'Proxied traffic' },
  { from: 'ec2', to: 'nginx', label: 'Port 80/443' },
  { from: 'nginx', to: 'nextjs', label: 'Reverse proxy' },
  { from: 'nextjs', to: 'openai', label: 'API calls' },
  { from: 'github', to: 'ec2', label: 'git pull + build', dashed: true },
];

const NODE_W = 140;
const NODE_H = 70;

function getCenter(n: NodeData) {
  return { x: n.x + NODE_W / 2, y: n.y + NODE_H / 2 };
}

export default function ArchitectureDiagram() {
  const [selected, setSelected] = useState<NodeData | null>(null);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const svgW = 900;
  const svgH = 460;

  // Colors that work in both modes
  const nodeFill = isDark ? 'rgba(38,38,38,0.9)' : 'rgba(255,255,255,0.95)';
  const nodeStroke = isDark ? 'rgba(80,80,80,0.6)' : 'rgba(200,200,200,0.8)';
  const textMain = isDark ? '#e5e5e5' : '#1a1a1a';
  const textSub = isDark ? 'rgba(160,160,160,0.8)' : 'rgba(100,100,100,0.9)';
  const lineColor = isDark ? 'rgba(120,120,120,0.35)' : 'rgba(180,180,180,0.6)';
  const labelBg = isDark ? 'rgba(30,30,30,0.85)' : 'rgba(245,245,245,0.95)';
  const labelStroke = isDark ? 'rgba(80,80,80,0.4)' : 'rgba(200,200,200,0.6)';
  const labelText = isDark ? 'rgba(160,160,160,0.9)' : 'rgba(100,100,100,0.9)';
  const arrowFill = isDark ? 'rgba(130,130,130,0.6)' : 'rgba(160,160,160,0.7)';

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white/10 backdrop-blur-lg transition hover:bg-white/20 dark:border-white/20"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 dark:text-white" />
        </button>
      </div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 mb-2 text-center px-4">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">How This Site Works</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Click on any component to learn more</p>
      </motion.div>

      {/* SVG Diagram — scrollable on mobile */}
      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden flex items-center justify-center px-4">
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full min-w-[700px] max-w-[950px]"
          style={{ maxHeight: '65vh' }}
        >
          <defs>
            <marker id="ah" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={arrowFill} />
            </marker>
            <marker id="ahd" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={arrowFill} />
            </marker>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={isDark ? '0.3' : '0.1'} />
            </filter>
          </defs>

          {/* Connections */}
          {connections.map((conn, i) => {
            const from = getCenter(nodes.find((n) => n.id === conn.from)!);
            const to = getCenter(nodes.find((n) => n.id === conn.to)!);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g key={i}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={lineColor} strokeWidth={2}
                  strokeDasharray={conn.dashed ? '6,4' : undefined}
                  markerEnd={conn.dashed ? 'url(#ahd)' : 'url(#ah)'}
                />
                <rect x={midX - 48} y={midY - 10} width={96} height={18} rx={9} fill={labelBg} stroke={labelStroke} strokeWidth={0.5} />
                <text x={midX} y={midY + 3} textAnchor="middle" fill={labelText} fontSize={9} fontFamily="system-ui">
                  {conn.label}
                </text>
              </g>
            );
          })}

          {/* EC2 boundary box */}
          <rect
            x={475} y={65} width={390} height={240} rx={16}
            fill="none"
            stroke={isDark ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.1)'}
            strokeWidth={1.5}
            strokeDasharray="8,4"
          />
          <text x={670} y={290} textAnchor="middle" fill={isDark ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.25)'} fontSize={10} fontFamily="system-ui">
            EC2 Instance
          </text>

          {/* Nodes */}
          {nodes.map((node) => {
            const isSel = selected?.id === node.id;
            return (
              <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(isSel ? null : node)}>
                <rect
                  x={node.x} y={node.y} width={NODE_W} height={NODE_H} rx={12}
                  fill={isSel ? `${node.color}18` : nodeFill}
                  stroke={isSel ? node.color : nodeStroke}
                  strokeWidth={isSel ? 2 : 1}
                  filter="url(#shadow)"
                />
                <text x={node.x + NODE_W / 2} y={node.y + 22} textAnchor="middle" fontSize={18}>{node.icon}</text>
                <text x={node.x + NODE_W / 2} y={node.y + 42} textAnchor="middle" fill={textMain} fontSize={12} fontWeight="600" fontFamily="system-ui">
                  {node.label}
                </text>
                <text x={node.x + NODE_W / 2} y={node.y + 56} textAnchor="middle" fill={textSub} fontSize={9} fontFamily="system-ui">
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </motion.svg>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-lg"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-xl p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900/95">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">{selected.details.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{selected.details.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                {selected.details.specs.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="text-neutral-400 dark:text-neutral-600 mt-0.5">•</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {selected.details.tech && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  {selected.details.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}30` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
