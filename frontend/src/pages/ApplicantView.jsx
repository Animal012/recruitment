import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ApplicantView() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'employer') { navigate('/'); return; }
    apiJson(`/api/auth/applicant/${id}/`)
      .then(setProfile)
      .catch(() => navigate('/employer-applications'))
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded w-1/3" />
      <div className="bg-white rounded-2xl h-48 border border-slate-100" />
    </div>
  );

  if (!profile) return null;

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад
      </button>

      <div className="space-y-4">
        {/* Шапка */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-indigo-600">
              {(profile.username?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xl text-slate-900">{fullName}</div>
            <div className="text-sm text-slate-400 mt-0.5">@{profile.username}</div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {profile.city}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {profile.phone}
                </span>
              )}
              {profile.birth_date && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {profile.birth_date}
                </span>
              )}
            </div>
          </div>
          {profile.has_resume && (
            <a
              href={`/api/auth/applicant/${id}/resume/`}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Резюме
            </a>
          )}
        </div>

        {/* О себе */}
        {profile.about && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">О себе</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">{profile.about}</p>
          </div>
        )}

        {/* Образование */}
        {profile.educations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Образование</h2>
            <div className="space-y-3">
              {profile.educations.map((e, i) => (
                <div key={i} className="border-l-2 border-indigo-100 pl-4">
                  <div className="font-medium text-slate-800 text-sm">{e.institution}</div>
                  {e.degree && <div className="text-xs text-slate-500 mt-0.5">{e.degree}{e.field_of_study ? ` — ${e.field_of_study}` : ''}</div>}
                  <div className="text-xs text-slate-400 mt-0.5">{e.start_year} — {e.end_year || 'н.в.'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Опыт */}
        {profile.experiences.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Опыт работы</h2>
            <div className="space-y-4">
              {profile.experiences.map((e, i) => (
                <div key={i} className="border-l-2 border-indigo-100 pl-4">
                  <div className="font-medium text-slate-800 text-sm">{e.position}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{e.company}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {e.start_date} — {e.is_current ? 'по н.в.' : (e.end_date || '—')}
                  </div>
                  {e.description && <p className="text-xs text-slate-500 mt-1.5">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
