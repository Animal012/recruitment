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

function ScreeningBar({ score }) {
  const pct = Math.round(score);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-red-600';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">Соответствие резюме</span>
        <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'applicant') { navigate('/'); return; }
    apiJson('/api/applications/')
      .then((d) => setApps(d.results))
      .finally(() => setLoading(false));
  }, [user]);

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
              {app.screening
                ? <ScreeningBar score={app.screening.score} />
                : <p className="text-xs text-slate-300 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Скрининг выполняется...
                  </p>
              }
              {app.cover_letter && (
                <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2 truncate">
                  «{app.cover_letter}»
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
