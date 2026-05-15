import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../api/client';
import { useAuth } from '../context/AuthContext';

const INPUT = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function EmployerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ organization_name: '', address: '', phone: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'employer') { navigate('/'); return; }
    apiJson('/api/auth/profile/employer/')
      .then((d) => setForm({
        organization_name: d.organization_name || '',
        address: d.address || '',
        phone: d.phone || '',
        website: d.website || '',
        description: d.description || '',
      }))
      .catch(() => {});
  }, [user]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiJson('/api/auth/profile/employer/', { method: 'POST', body: JSON.stringify(form) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Профиль организации</h1>

      <div className="bg-white rounded-2xl border border-slate-100 p-7">
        <form onSubmit={handle} className="space-y-5">
          <Field label="Название организации">
            <input value={form.organization_name} onChange={set('organization_name')} required className={INPUT} placeholder="ГБОУ Школа №1" />
          </Field>
          <Field label="Адрес">
            <input value={form.address} onChange={set('address')} className={INPUT} placeholder="г. Москва, ул. Примерная, 1" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Телефон">
              <input value={form.phone} onChange={set('phone')} className={INPUT} placeholder="+7 (495) 000-00-00" />
            </Field>
            <Field label="Сайт">
              <input value={form.website} onChange={set('website')} className={INPUT} placeholder="https://school1.ru" />
            </Field>
          </div>
          <Field label="Описание организации">
            <textarea value={form.description} onChange={set('description')} rows={5} className={INPUT + ' resize-none'} placeholder="Расскажите о вашей организации..." />
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
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
  );
}
