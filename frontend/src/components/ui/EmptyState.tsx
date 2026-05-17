export const EmptyState = ({ message = 'No items yet.' }: { message?: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{message}</div>
);
