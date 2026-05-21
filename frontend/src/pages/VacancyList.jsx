import { useEffect, useRef, useState } from 'react';
import { apiJson } from '../api/client';
import VacancyCard from '../components/VacancyCard';

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
              inputMode="numeric"
              value={salaryFrom}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const normalized = val ? String(parseInt(val, 10)) : '';
                debounce({ salary: normalized });
              }}
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
            {data.results.map((v) => (
              <VacancyCard
                key={v.id}
                v={v}
                onFavToggle={(id, isFav) =>
                  setData((d) => ({
                    ...d,
                    results: d.results.map((r) => r.id === id ? { ...r, is_favorited: isFav } : r),
                  }))
                }
              />
            ))}
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
