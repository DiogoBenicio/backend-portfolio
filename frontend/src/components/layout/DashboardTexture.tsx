'use client'

import { StackIconTexture } from '@/components/ui/StackIconTexture'

export function DashboardTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Formas geométricas SVG com degradê */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="dtBB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="dtBO" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="dtIO" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <radialGradient id="dtRB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dtRI" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dtRO" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points="80,10 150,50 150,130 80,170 10,130 10,50"            fill="url(#dtBB)" opacity="0.10" />
        <polygon points="1100,10 1170,50 1170,130 1100,170 1030,130 1030,50"  fill="url(#dtIO)" opacity="0.10" />
        <polygon points="60,620 110,650 110,710 60,740 10,710 10,650"          fill="url(#dtBO)" opacity="0.09" />
        <polygon points="1100,580 1170,620 1170,700 1100,740 1030,700 1030,620" fill="url(#dtBB)" opacity="0.09" />
        <polygon points="0,0 160,0 0,160"        fill="url(#dtBO)" opacity="0.08" />
        <polygon points="1200,0 1040,0 1200,160"   fill="url(#dtBB)" opacity="0.08" />
        <polygon points="0,800 160,800 0,640"      fill="url(#dtIO)" opacity="0.08" />
        <polygon points="1200,800 1040,800 1200,640" fill="url(#dtBO)" opacity="0.08" />
        <circle cx="20"   cy="400" r="90" fill="url(#dtRB)" opacity="0.10" />
        <circle cx="1180" cy="400" r="90" fill="url(#dtRO)" opacity="0.10" />
        <circle cx="600"  cy="780" r="70" fill="url(#dtRI)" opacity="0.08" />
        <circle cx="200"  cy="20"  r="50" fill="url(#dtRO)" opacity="0.08" />
        <circle cx="1000" cy="20"  r="50" fill="url(#dtRB)" opacity="0.08" />
        <polygon points="20,220 65,270 20,320 -25,270"        fill="url(#dtIO)" opacity="0.09" />
        <polygon points="1180,220 1225,270 1180,320 1135,270" fill="url(#dtBB)" opacity="0.09" />
      </svg>

      {/* Logos da stack trafegando */}
      <StackIconTexture />
    </div>
  )
}
