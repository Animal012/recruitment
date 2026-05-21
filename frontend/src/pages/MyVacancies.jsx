import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

function StatusBadge({ status }) {
  return status === 'open'
    ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Открыта
      </span>
    : <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Закрыта
      </span>;
}

export default function MyVacancies() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const deleteVacancy = async (id) => {
    if (!confirm('Удалить вакансию? Она будет скрыта для всех пользователей.')) return;
    setDeleting(id);
    try {
      await apiJson(`/api/vacancies/${id}/delete/`, { method: 'POST' });
      setVacancies((vs) => vs.filter((v) => v.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'employer') { navigate('/'); return; }
    apiJson('/api/vacancies/my/')
      .then((d) => setVacancies(d.results))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const close = async (id) => {
    if (!confirm('Закрыть вакансию?')) return;
    setClosing(id);
    try {
      await apiJson(`/api/vacancies/${id}/close/`, { method: 'POST' });
      setVacancies((vs) => vs.map((v) => v.id === id ? { ...v, status: 'closed' } : v));
    } finally {
      setClosing(null);
    }
  };

  const reopen = async (id) => {
    setClosing(id);
    try {
      await apiJson(`/api/vacancies/${id}/reopen/`, { method: 'POST' });
      setVacancies((vs) => vs.map((v) => v.id === id ? { ...v, status: 'open' } : v));
    } finally {
      setClosing(null);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Мои вакансии</h1>
        <Link
          to="/vacancies/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Создать
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 font-medium">Нет вакансий</p>
          <Link to="/vacancies/create" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
            Создать первую →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vacancies.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link to={`/vacancies/${v.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                      {v.title}
                    </Link>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    {v.city && <span>{v.city}</span>}
                    {v.salary_from && <span>от {v.salary_from.toLocaleString()} ₽</span>}
                    <span>{v.created_at}</span>
                    <Link
                      to={`/applications/vacancy/${v.id}`}
                      className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {v.applications_count} откликов
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/vacancies/${v.id}/edit`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => deleteVacancy(v.id)}
                    disabled={deleting === v.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Удалить вакансию"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {v.status === 'open' ? (
                    <button
                      onClick={() => close(v.id)}
                      disabled={closing === v.id}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Закрыть вакансию"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => reopen(v.id)}
                      disabled={closing === v.id}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Открыть вакансию"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
