import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { AppRouter } from './router';
import { AuthBootstrap } from './components/AuthBootstrap';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
    <ToastContainer position="top-right" autoClose={3000} theme="dark" />
  </React.StrictMode>
);
