'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <h1>Something went wrong</h1>
      <button onClick={() => reset()} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Try again
      </button>
    </div>
  );
}
