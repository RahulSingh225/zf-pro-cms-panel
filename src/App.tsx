import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";
import { Provider, useDispatch } from "react-redux";
import store, { AppDispatch } from './redux/store';
import { fetchUserProfile } from "./redux/slices/userDataSlice";

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return (
    <LoadingProvider>
      <AuthProvider>
        <Loader />
        <Router basename="/zf-cms">
          <AppRoutes />
          <ToastContainer position="top-center" autoClose={3000} />
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;