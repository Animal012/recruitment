import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiJson } from '../api/client';

function VacancyCard({ v }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link to={`/vacancies/${v.id}`} className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
            {v.title}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {v.employer_name && (
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {v.employer_name}
              </span>
            )}
            {v.city && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {v.city}
              </span>
            )}
            <span className="text-xs text-slate-300">{v.created_at}</span>
          </div>
        </div>
        {(v.salary_from || v.salary_to) && (
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold text-emerald-600">
              {v.salary_from ? `от ${v.salary_from.toLocaleString()} ₽` : ''}
            </div>
            {v.salary_to && (
              <div className="text-xs text-slate-400">до {v.salary_to.toLocaleString()} ₽</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VacancyList() {
  const [data, setData] = useState({ results: [], num_pages: 1, page: 1, cities: [] });
  const [recentQueries, setRecentQueries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('search_history') || '[]'); } catch { return []; }
  });
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  const fetch_ = (params = {}) => {
    const p = new URLSearchParams({
      q: params.q ?? q,
      city: params.city ?? city,
      salary_from: params.salary ?? salaryFrom,
      page: params.page ?? page,
    });
    setLoading(true);
    apiJson(`/api/vacancies/?${p}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, [page]);

  const debounce = (updates) => {
    clearTimeout(timer.current);
    if (updates.q !== undefined) setQ(updates.q);
    if (updates.city !== undefined) setCity(updates.city);
    if (updates.salary !== undefined) setSalaryFrom(updates.salary);
    timer.current = setTimeout(() => { setPage(1); fetch_({ ...updates, page: 1 }); }, 380);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Вакансии</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => debounce({ q: e.target.value })}
              onBlur={() => {
                const val = q.trim();
                if (val) {
                  setRecentQueries((prev) => {
                    const next = [val, ...prev.filter((x) => x !== val)].slice(0, 20);
                    localStorage.setItem('search_history', JSON.stringify(next));
                    return next;
                  });
                }
              }}
              list="search-history"
              placeholder="Название, описание или требования"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <datalist id="search-history">
              {recentQueries.map((rq) => <option key={rq} value={rq} />)}
            </datalist>
          </div>
          <select
            value={city}
            onChange={(e) => debounce({ city: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700"
          >
            <option value="">Все города</option>
            {data.cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₽</span>
            <input
              type="number"
              value={salaryFrom}
              onChange={(e) => debounce({ salary: e.target.value })}
              placeholder="Зарплата от"
              className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : data.results.length ? (
        <>
          <div className="space-y-3">
            {data.results.map((v) => <VacancyCard key={v.id} v={v} />)}
          </div>
          {data.num_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ‹ Назад
              </button>
              <span className="text-sm text-slate-500">{page} / {data.num_pages}</span>
              <button
                disabled={page >= data.num_pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Вперёд ›
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-400 font-medium">Вакансии не найдены</p>
          <p className="text-slate-300 text-sm mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
}
