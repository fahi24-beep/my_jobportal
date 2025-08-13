import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ApplyJob from './pages/ApplyJob';
import Application from './pages/Application';
import RecruiterLogin from './pages/RecruiterLogin';

import NotificationsContainer from './components/NotificationsContainer';
import ToastContainer from './components/ToastContainer';

const App = () => {
  return (
    <div>
      {/* Notification UI - available on all pages */}
      <NotificationsContainer />
      <ToastContainer />

      {/* Main app routes */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Application />} />
        <Route path='/recruiter/login' element={<RecruiterLogin />} />
      </Routes>
    </div>
  );
};

export default App;
