'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset()}
        style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
