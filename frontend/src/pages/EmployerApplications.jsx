import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

const HISTORY_KEY = 'employer_app_search_history';

function ScreeningBar({ score }) {
  const pct = Math.round(score);
  const badgeColor = pct >= 70 ? 'bg-emerald-100 text-emerald-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600';
  const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${badgeColor}`}>{pct}%</span>
        <span className="text-xs text-slate-400">соответствие резюме</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EmployerApplications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [query, setQuery] = useState('');
  const [recentQueries, setRecentQueries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
  });
  const inputRef = useRef();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'employer') { navigate('/'); return; }
    apiJson('/api/applications/employer/')
      .then(setData)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const saveQuery = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentQueries.filter((r) => r !== trimmed)].slice(0, 20);
    setRecentQueries(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const changeStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await apiJson(`/api/applications/${appId}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setData((d) => ({
        ...d,
        results: d.results.map((a) =>
          a.id === appId
            ? { ...a, status, status_display: d.status_choices.find((c) => c.value === status)?.label || status }
            : a
        ),
      }));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />)}
    </div>
  );

  if (!data) return null;

  const filtered = query.trim()
    ? data.results.filter((a) => a.vacancy_title.toLowerCase().includes(query.toLowerCase()))
    : data.results;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Отклики на вакансии</h1>

      {/* Поиск */}
      <div className="mb-5">
        <input
          ref={inputRef}
          list="app-search-history"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => saveQuery(query)}
          onKeyDown={(e) => e.key === 'Enter' && saveQuery(query)}
          placeholder="Поиск по названию вакансии..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <datalist id="app-search-history">
          {recentQueries.map((q) => <option key={q} value={q} />)}
        </datalist>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-slate-400 font-medium">{query ? 'Ничего не найдено' : 'Откликов пока нет'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <Link
                to={`/vacancies/${app.vacancy_id}`}
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors mb-3 block"
              >
                {app.vacancy_title}
              </Link>
              <div className="flex items-center gap-4">
                {/* Кандидат */}
                <div className="w-36 flex-shrink-0">
                  <Link
                    to={`/applicant/${app.applicant_id}`}
                    className="font-semibold text-slate-800 text-sm hover:text-indigo-600 transition-colors"
                  >
                    {app.applicant_name}
                  </Link>
                  {app.applicant_city && (
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {app.applicant_city}
                    </div>
                  )}
                </div>

                {/* Скрининг */}
                <div className="flex-1 min-w-0">
                  {app.screening
                    ? <ScreeningBar score={app.screening.score} />
                    : <span className="text-xs text-slate-300 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Скрининг выполняется...
                      </span>
                  }
                </div>

                {/* Статус */}
                <div className="w-44 flex-shrink-0">
                  <select
                    value={app.status}
                    disabled={updating === app.id}
                    onChange={(e) => changeStatus(app.id, e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {data.status_choices.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-xs text-slate-300 mt-3">{app.created_at}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
