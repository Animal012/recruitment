import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

function getCsrf() {
  const m = document.cookie.match(/csrftoken=([^;]+)/);
  return m ? m[1] : '';
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

const DEGREE_OPTIONS = ['Бакалавр', 'Специалист', 'Магистр', 'Аспирант', 'Кандидат наук', 'Доктор наук', 'Среднее профессиональное'];

const EMPTY_EDU = () => ({ id: null, institution: '', degree: '', field_of_study: '', start_year: '', end_year: '' });
const EMPTY_EXP = () => ({ id: null, company: '', position: '', start_date: '', end_date: '', is_current: false, description: '' });

export default function ApplicantProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const needResume = location.state?.noResume;
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', city: '', about: '', birth_date: '' });
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'applicant') { navigate('/'); return; }
    apiJson('/api/auth/profile/applicant/')
      .then((d) => {
        setProfile(d);
        setForm({ first_name: d.first_name || '', last_name: d.last_name || '', phone: d.phone || '', city: d.city || '', about: d.about || '', birth_date: d.birth_date || '' });
        setEducations(d.educations.map((e) => ({ ...e, start_year: String(e.start_year || ''), end_year: String(e.end_year || '') })));
        setExperiences(d.experiences.map((e) => ({ ...e, start_date: e.start_date || '', end_date: e.end_date || '' })));
      })
      .catch(() => navigate('/'));
  }, [user, authLoading]);

  const setEdu = (i, field) => (e) =>
    setEducations((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } : row));

  const setExp = (i, field) => (e) =>
    setExperiences((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } : row));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      fd.append('phone', form.phone);
      fd.append('city', form.city);
      fd.append('about', form.about);
      fd.append('birth_date', form.birth_date);
      fd.append('educations', JSON.stringify(educations.map((e) => ({
        ...e,
        start_year: Number(e.start_year) || 0,
        end_year: e.end_year ? Number(e.end_year) : null,
      }))));
      fd.append('experiences', JSON.stringify(experiences.map((e) => ({
        ...e,
        end_date: e.is_current ? null : (e.end_date || null),
      }))));

      const res = await api('/api/auth/profile/applicant/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrf() },
        body: fd,
      });
      if (!res.ok) throw await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { alert('Только PDF'); return; }
    setResumeUploading(true);
    const fd = new FormData();
    fd.append('resume_file', file);
    try {
      const res = await api('/api/auth/profile/applicant/resume/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrf() },
        body: fd,
      });
      if (res.ok) {
        const d = await res.json();
        setProfile((p) => ({ ...p, resume_file: d.url }));
      }
    } finally {
      setResumeUploading(false);
    }
  };

  const deleteResume = async () => {
    if (!confirm('Удалить резюме?')) return;
    await apiJson('/api/auth/profile/applicant/resume/delete/', { method: 'POST' });
    setProfile((p) => ({ ...p, resume_file: null }));
  };

  if (!profile) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-slate-100 rounded w-1/3" />
      <div className="bg-white rounded-2xl h-48 border border-slate-100" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {needResume && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
          <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Для отклика на вакансию необходимо загрузить резюме
        </div>
      )}
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Профиль соискателя</h1>
      <div className="grid md:grid-cols-3 gap-6">

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-indigo-600">
                {(user?.username?.[0] || '?').toUpperCase()}
              </span>
            </div>
            <div className="font-semibold text-slate-800">
              {user?.username}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Соискатель</div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Резюме (PDF)</h3>
            {profile.resume_file ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2 text-xs font-medium mb-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Файл загружен
                </div>
                <a
                  href={profile.resume_file}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium mb-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Скачать
                </a>
                <button
                  onClick={deleteResume}
                  className="w-full py-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium mb-3 transition-colors"
                >
                  Удалить
                </button>
                <p className="text-xs text-slate-400 mb-2">Заменить файл:</p>
              </>
            ) : (
              <p className="text-xs text-slate-400 mb-3">Файл не загружен</p>
            )}
            <input
              type="file"
              accept=".pdf"
              ref={fileRef}
              className="hidden"
              onChange={(e) => uploadResume(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current.click()}
              disabled={resumeUploading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {resumeUploading ? 'Загрузка...' : 'Загрузить PDF'}
            </button>
          </div>
        </div>

        {/* Main form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Personal */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Личные данные</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Имя">
                  <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={INPUT} placeholder="Иван" />
                </Field>
                <Field label="Фамилия">
                  <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={INPUT} placeholder="Иванов" />
                </Field>
                <Field label="Телефон">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} placeholder="+7 (999) 000-00-00" />
                </Field>
                <Field label="Город">
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={INPUT} placeholder="Москва" />
                </Field>
                <div className="col-span-2">
                  <Field label="Дата рождения">
                    <input
                      type="date"
                      value={form.birth_date}
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const year = parseInt(val.split('-')[0], 10);
                        const currentYear = new Date().getFullYear();
                        if (year < 1900 || year > currentYear) {
                          setForm((f) => ({ ...f, birth_date: '' }));
                        }
                      }}
                      className={INPUT}
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="О себе">
                    <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={4} className={INPUT + ' resize-none'} placeholder="Кратко о себе, ключевые навыки..." />
                  </Field>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Образование</h2>
                <button type="button" onClick={() => setEducations((prev) => [...prev, EMPTY_EDU()])}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить
                </button>
              </div>
              {educations.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Добавьте информацию об образовании</p>
              )}
              <div className="space-y-4">
                {educations.map((edu, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 relative">
                    <button type="button" onClick={() => setEducations((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div className="col-span-2">
                        <Field label="Учебное заведение">
                          <input value={edu.institution} onChange={setEdu(i, 'institution')} className={INPUT} placeholder="МГТУ им. Баумана" />
                        </Field>
                      </div>
                      <Field label="Степень">
                        <select value={edu.degree} onChange={setEdu(i, 'degree')} className={INPUT}>
                          <option value="">—</option>
                          {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </Field>
                      <Field label="Специальность">
                        <input value={edu.field_of_study} onChange={setEdu(i, 'field_of_study')} className={INPUT} placeholder="Педагогика" />
                      </Field>
                      <Field label="Год начала">
                        <input type="number" value={edu.start_year} onChange={setEdu(i, 'start_year')} className={INPUT} placeholder="2018" min="1950" max="2099" />
                      </Field>
                      <Field label="Год окончания">
                        <input type="number" value={edu.end_year} onChange={setEdu(i, 'end_year')} className={INPUT} placeholder="2022" min="1950" max="2099" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Опыт работы</h2>
                <button type="button" onClick={() => setExperiences((prev) => [...prev, EMPTY_EXP()])}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить
                </button>
              </div>
              {experiences.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Добавьте опыт работы</p>
              )}
              <div className="space-y-4">
                {experiences.map((exp, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 relative">
                    <button type="button" onClick={() => setExperiences((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <Field label="Организация">
                        <input value={exp.company} onChange={setExp(i, 'company')} className={INPUT} placeholder="ООО Школа №1" />
                      </Field>
                      <Field label="Должность">
                        <input value={exp.position} onChange={setExp(i, 'position')} className={INPUT} placeholder="Учитель математики" />
                      </Field>
                      <Field label="Дата начала">
                        <input type="date" value={exp.start_date} onChange={setExp(i, 'start_date')} className={INPUT} />
                      </Field>
                      <Field label="Дата окончания">
                        <input type="date" value={exp.end_date} onChange={setExp(i, 'end_date')} className={INPUT} disabled={exp.is_current} />
                      </Field>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={exp.is_current} onChange={setExp(i, 'is_current')}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-600">Текущее место работы</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <Field label="Описание">
                          <textarea value={exp.description} onChange={setExp(i, 'description')} rows={3} className={INPUT + ' resize-none'} placeholder="Чем занимались..." />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {saving ? 'Сохранение...' : 'Сохранить профиль'}
              </button>
              {saved && (
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Сохранено
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
