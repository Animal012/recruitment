import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLE = {
  pending:   'bg-amber-50 text-amber-700',
  reviewing: 'bg-blue-50 text-blue-700',
  interview: 'bg-violet-50 text-violet-700',
  accepted:  'bg-emerald-50 text-emerald-700',
  rejected:  'bg-red-50 text-red-600',
};


export default function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'applicant') { navigate('/'); return; }
    apiJson('/api/applications/')
      .then((d) => setApps(d.results))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-100" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Мои отклики</h1>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 font-medium">Вы ещё не откликались ни на одну вакансию</p>
          <Link to="/vacancies" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
            Смотреть вакансии →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Link to={`/vacancies/${app.vacancy_id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                    {app.vacancy_title}
                  </Link>
                  {app.employer_name && (
                    <div className="text-sm text-slate-400 mt-0.5">{app.employer_name}</div>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[app.status] || 'bg-slate-100 text-slate-500'}`}>
                    {app.status_display}
                  </span>
                  <span className="text-xs text-slate-300">{app.created_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
