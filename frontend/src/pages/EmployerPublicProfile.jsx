import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';
import VacancyCard from '../components/VacancyCard';

export default function EmployerPublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    apiJson(`/api/auth/employer/${id}/`)
      .then((d) => {
        setEmployer(d);
      })
      .catch(() => navigate('/vacancies'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavToggle = (vacancyId, isFav) => {
    setFavIds((prev) => {
      const next = new Set(prev);
      isFav ? next.add(vacancyId) : next.delete(vacancyId);
      return next;
    });
    setEmployer((e) => ({
      ...e,
      vacancies: e.vacancies.map((v) =>
        v.id === vacancyId ? { ...v, is_favorited: isFav } : v
      ),
    }));
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded w-1/3" />
      <div className="bg-white rounded-2xl h-40 border border-slate-100" />
    </div>
  );

  if (!employer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад
      </button>

      <div className="space-y-5">
        {/* Шапка */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{employer.organization_name || 'Организация'}</h1>
              {employer.address && (
                <p className="text-sm text-slate-400 mt-0.5">{employer.address}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            {employer.email && (
              <a href={`mailto:${employer.email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {employer.email}
              </a>
            )}
            {employer.phone && (
              <a href={`tel:${employer.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {employer.phone}
              </a>
            )}
            {employer.website && (
              <a href={employer.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {employer.website}
              </a>
            )}
          </div>
        </div>

        {/* Описание */}
        {employer.description && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Об организации</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">{employer.description}</p>
          </div>
        )}

        {/* Вакансии */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">
            Открытые вакансии
            {employer.vacancies.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">{employer.vacancies.length}</span>
            )}
          </h2>
          {employer.vacancies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
              <p className="text-slate-400 text-sm">Нет открытых вакансий</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employer.vacancies.map((v) => (
                <VacancyCard
                  key={v.id}
                  v={{ ...v, employer_id: employer.id, employer_name: employer.organization_name }}
                  onFavToggle={handleFavToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
