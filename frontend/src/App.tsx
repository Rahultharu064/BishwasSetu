
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes/Index';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMe } from './Redux/slices/authSlice';
import type { AppDispatch } from './Redux/store';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
