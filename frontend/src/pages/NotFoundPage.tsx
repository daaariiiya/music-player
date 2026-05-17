import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
    <p>Page not found.</p>
    <Link to="/">Go home</Link>
  </div>
);
