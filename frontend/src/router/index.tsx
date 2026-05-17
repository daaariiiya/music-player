import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';

const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const PerformersPage = lazy(() => import('../pages/PerformersPage').then((m) => ({ default: m.PerformersPage })));
const PerformerByIdPage = lazy(() => import('../pages/PerformerByIdPage').then((m) => ({ default: m.PerformerByIdPage })));

const AlbumsPage = lazy(() => import('../pages/AlbumsPage').then((m) => ({ default: m.AlbumsPage })));
const AlbumByIdPage = lazy(() => import('../pages/AlbumByIdPage').then((m) => ({ default: m.AlbumByIdPage })));

const SongsPage = lazy(() => import('../pages/SongsPage').then((m) => ({ default: m.SongsPage })));
const SongByIdPage = lazy(() => import('../pages/SongByIdPage').then((m) => ({ default: m.SongByIdPage })));

const PlaylistsPage = lazy(() => import('../pages/PlaylistsPage').then((m) => ({ default: m.PlaylistsPage })));
const PlaylistByIdPage = lazy(() => import('../pages/PlaylistByIdPage').then((m) => ({ default: m.PlaylistByIdPage })));

const StatisticsPage = lazy(() => import('../pages/StatisticsPage').then((m) => ({ default: m.StatisticsPage })));

const AdminPerformerEditPage = lazy(() => import('../pages/admin/AdminPerformerForm').then((m) => ({ default: m.AdminPerformerEditPage })));
const AdminAlbumEditPage = lazy(() => import('../pages/admin/AdminAlbumForm').then((m) => ({ default: m.AdminAlbumEditPage })));
const AdminSongEditPage = lazy(() => import('../pages/admin/AdminSongForm').then((m) => ({ default: m.AdminSongEditPage })));
const AdminPerformersNewPage = lazy(() => import('../pages/admin/AdminPerformersBulkPage').then((m) => ({ default: m.AdminPerformersBulkPage })));
const AdminAlbumsNewPage = lazy(() => import('../pages/admin/AdminAlbumsBulkPage').then((m) => ({ default: m.AdminAlbumsBulkPage })));
const AdminSongsNewPage = lazy(() => import('../pages/admin/AdminSongsBulkPage').then((m) => ({ default: m.AdminSongsBulkPage })));

const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const SuspenseLayout = () => (
  <ErrorBoundary>
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    element: <SuspenseLayout />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },

          { path: '/performers', element: <PerformersPage /> },
          { path: '/performers/:id', element: <PerformerByIdPage /> },
          { path: '/albums', element: <AlbumsPage /> },
          { path: '/albums/:id', element: <AlbumByIdPage /> },
          { path: '/songs', element: <SongsPage /> },
          { path: '/songs/:id', element: <SongByIdPage /> },

          {
            element: <PrivateRoute />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/playlists', element: <PlaylistsPage /> },
              { path: '/playlists/:id', element: <PlaylistByIdPage /> },
            ],
          },

          {
            element: <AdminRoute />,
            children: [
              { path: '/statistics', element: <StatisticsPage /> },
              { path: '/admin/performers/new', element: <AdminPerformersNewPage /> },
              { path: '/admin/performers/:id/edit', element: <AdminPerformerEditPage /> },
              { path: '/admin/albums/new', element: <AdminAlbumsNewPage /> },
              { path: '/admin/albums/:id/edit', element: <AdminAlbumEditPage /> },
              { path: '/admin/songs/new', element: <AdminSongsNewPage /> },
              { path: '/admin/songs/:id/edit', element: <AdminSongEditPage /> },
            ],
          },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
