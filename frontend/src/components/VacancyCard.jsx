import { Link, useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VacancyCard({ v, onFavToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showHeart = !user || user.role === 'applicant';

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      const res = await apiJson(`/api/vacancies/${v.id}/favorite/`, { method: 'POST' });
      onFavToggle?.(v.id, res.is_favorited);
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link to={`/vacancies/${v.id}`} className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
            {v.title}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            {v.employer_name && (
              <Link
                to={`/employer/${v.employer_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {v.employer_name}
              </Link>
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {(v.salary_from || v.salary_to) && (
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-600">
                {v.salary_from ? `от ${v.salary_from.toLocaleString()} ₽` : ''}
              </div>
              {v.salary_to && (
                <div className="text-xs text-slate-400">до {v.salary_to.toLocaleString()} ₽</div>
              )}
            </div>
          )}
          {showHeart && (
            <button
              onClick={handleFav}
              className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
              title={v.is_favorited ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <svg
                className={`w-5 h-5 transition-colors ${v.is_favorited ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                fill={v.is_favorited ? 'currentColor' : 'none'}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
