import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from './routes/Index';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

const App = () => {
  return (
    <SocketProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </SocketProvider>
  );
};

export default App;
