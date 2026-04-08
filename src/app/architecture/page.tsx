'use client';

import { Suspense } from 'react';
import ArchitectureDiagram from '@/components/architecture/ArchitectureDiagram';

export default function ArchitecturePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-neutral-400">Loading...</div>}>
      <ArchitectureDiagram />
    </Suspense>
  );
}
