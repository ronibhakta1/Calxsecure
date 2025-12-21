'use client';

import { useState } from 'react';

export default function ScanPage() {
  const [_error, _setError] = useState<string | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">QR Code Scanner</h1>
      <p className="mt-4 text-sm text-zinc-500">
        Scan QR codes to perform actions.
      </p>
    </div>
  );
}
