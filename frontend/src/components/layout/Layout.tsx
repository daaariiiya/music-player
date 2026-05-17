import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Spinner } from '../ui/Spinner';

export const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-row">
        <Sidebar />
        <main className="layout-main">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
