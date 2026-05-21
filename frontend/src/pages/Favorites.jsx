import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';
import VacancyCard from '../components/VacancyCard';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'applicant') { navigate('/'); return; }
    apiJson('/api/vacancies/favorites/')
      .then((d) => setVacancies(d.results))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleFavToggle = (id, isFav) => {
    if (!isFav) {
      setVacancies((prev) => prev.filter((v) => v.id !== id));
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Избранное</h1>

      {vacancies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-slate-400 font-medium">Нет сохранённых вакансий</p>
          <Link to="/vacancies" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
            Смотреть вакансии →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vacancies.map((v) => (
            <VacancyCard key={v.id} v={v} onFavToggle={handleFavToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
