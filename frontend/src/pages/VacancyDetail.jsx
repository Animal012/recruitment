import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

function Section({ title, text }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export default function VacancyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applied, setApplied] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    apiJson(`/api/vacancies/${id}/`)
      .then((d) => { setVacancy(d); setApplied(d.already_applied); setIsFav(d.is_favorited); })
      .catch(() => navigate('/vacancies'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFav = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await apiJson(`/api/vacancies/${id}/favorite/`, { method: 'POST' });
      setIsFav(res.is_favorited);
    } catch {}
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplying(true);
    try {
      await apiJson(`/api/applications/apply/${id}/`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setApplied(true);
    } catch (err) {
      if (err?.error === 'no_resume') {
        navigate('/profile/applicant', { state: { noResume: true } });
        return;
      }
      setApplyError(err?.error || 'Ошибка отправки');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
        </div>
      </div>
    );
  }
  if (!vacancy) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/vacancies" className="hover:text-indigo-600 transition-colors">Вакансии</Link>
        <span>›</span>
        <span className="text-slate-600 truncate">{vacancy.title}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-slate-900">{vacancy.title}</h1>
              {(!user || user.role === 'applicant') && (
                <button
                  onClick={toggleFav}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                >
                  <svg
                    className={`w-6 h-6 transition-colors ${isFav ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill={isFav ? 'currentColor' : 'none'}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {vacancy.employer_name && (
                <Link
                  to={`/employer/${vacancy.employer_id}`}
                  className="text-sm text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {vacancy.employer_name}
                </Link>
              )}
              {vacancy.city && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {vacancy.city}
                </span>
              )}
              {(vacancy.salary_from || vacancy.salary_to) && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {vacancy.salary_from ? `от ${vacancy.salary_from.toLocaleString()}` : ''}
                  {vacancy.salary_to ? ` до ${vacancy.salary_to.toLocaleString()}` : ''} ₽
                </span>
              )}
            </div>
            <div className="space-y-5">
              <Section title="Описание" text={vacancy.description} />
              <Section title="Требования" text={vacancy.requirements} />
              <Section title="Условия" text={vacancy.conditions} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            {!vacancy.is_open ? (
              <div className="text-center py-3">
                <span className="inline-block bg-slate-100 text-slate-500 text-sm font-medium px-3 py-1.5 rounded-full">Вакансия закрыта</span>
              </div>
            ) : !user ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-500">Войдите, чтобы откликнуться</p>
                <Link to="/login" className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm text-center transition-colors">
                  Войти
                </Link>
              </div>
            ) : user.role === 'employer' ? (
              <p className="text-sm text-slate-400 text-center">Работодатели не могут откликаться</p>
            ) : applied ? (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">Отклик отправлен</p>
                <Link to="/applications" className="text-sm text-indigo-600 hover:underline">Мои отклики →</Link>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                {applyError && <p className="text-xs text-red-500">{applyError}</p>}
                <button
                  type="submit"
                  disabled={applying}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {applying ? 'Отправка...' : 'Откликнуться'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-xs text-slate-400 space-y-1">
            <div>Опубликовано: {vacancy.created_at}</div>
            {vacancy.status === 'closed' && <div className="text-red-400">Вакансия закрыта</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
