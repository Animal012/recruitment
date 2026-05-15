import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY = { title: '', description: '', requirements: '', conditions: '', city: '', salary_from: '', salary_to: '' };

function Field({ label, name, value, onChange, type = 'text', rows, required }) {
  const cls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={onChange} className={cls} />
      ) : (
        <input type={type} value={value} onChange={onChange} required={required} className={cls} />
      )}
    </div>
  );
}

export default function VacancyForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'employer') { navigate('/'); return; }
    if (isEdit) {
      apiJson(`/api/vacancies/${id}/`)
        .then((d) => setForm({
          title: d.title || '',
          description: d.description || '',
          requirements: d.requirements || '',
          conditions: d.conditions || '',
          city: d.city || '',
          salary_from: d.salary_from ?? '',
          salary_to: d.salary_to ?? '',
        }))
        .catch(() => navigate('/my-vacancies'));
    }
  }, [id, user]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const payload = {
      ...form,
      salary_from: form.salary_from ? Number(form.salary_from) : null,
      salary_to: form.salary_to ? Number(form.salary_to) : null,
    };
    try {
      if (isEdit) {
        await apiJson(`/api/vacancies/${id}/edit/`, { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiJson('/api/vacancies/create/', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/my-vacancies');
    } catch (err) {
      setErrors(err?.errors || { title: [err?.error || 'Ошибка'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEdit ? 'Редактировать вакансию' : 'Создать вакансию'}
      </h1>

      <div className="bg-white rounded-2xl border border-slate-100 p-7">
        <form onSubmit={handle} className="space-y-5">
          <Field label="Название вакансии" name="title" value={form.title} onChange={set('title')} required />
          {errors.title && <p className="text-xs text-red-500 -mt-3">{errors.title.join?.(' ') || errors.title}</p>}

          <Field label="Описание" name="description" value={form.description} onChange={set('description')} rows={5} />
          <Field label="Требования" name="requirements" value={form.requirements} onChange={set('requirements')} rows={4} />
          <Field label="Условия работы" name="conditions" value={form.conditions} onChange={set('conditions')} rows={3} />
          <Field label="Город" name="city" value={form.city} onChange={set('city')} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Зарплата от (₽)" name="salary_from" value={form.salary_from} onChange={set('salary_from')} type="number" />
            <Field label="Зарплата до (₽)" name="salary_to" value={form.salary_to} onChange={set('salary_to')} type="number" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать вакансию'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-vacancies')}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
