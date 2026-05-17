export const Spinner = ({ label = 'Loading...' }: { label?: string }) => (
  <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
    <span
      style={{
        width: 16,
        height: 16,
        border: '2px solid #ccc',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span>{label}</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
