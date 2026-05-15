import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VacancyList from './pages/VacancyList';
import VacancyDetail from './pages/VacancyDetail';
import VacancyForm from './pages/VacancyForm';
import MyVacancies from './pages/MyVacancies';
import MyApplications from './pages/MyApplications';
import VacancyApplications from './pages/VacancyApplications';
import ApplicantProfile from './pages/ApplicantProfile';
import EmployerProfile from './pages/EmployerProfile';

function ProfileRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      else if (user.role === 'applicant') navigate('/profile/applicant');
      else navigate('/profile/employer');
    }
  }, [user, loading]);
  return null;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vacancies" element={<VacancyList />} />
        <Route path="/vacancies/create" element={<VacancyForm />} />
        <Route path="/vacancies/:id" element={<VacancyDetail />} />
        <Route path="/vacancies/:id/edit" element={<VacancyForm />} />
        <Route path="/my-vacancies" element={<MyVacancies />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/applications/vacancy/:id" element={<VacancyApplications />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/profile/applicant" element={<ApplicantProfile />} />
        <Route path="/profile/employer" element={<EmployerProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
