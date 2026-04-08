'use client';

import { Suspense } from 'react';
import HexGame from '@/components/hex/HexGame';

export default function HexPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-neutral-400">Loading...</div>}>
      <HexGame />
    </Suspense>
  );
}
