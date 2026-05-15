import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FIELDS = [
  { name: 'username', label: 'Имя пользователя', type: 'text', placeholder: 'username' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
  { name: 'first_name', label: 'Имя', type: 'text', placeholder: 'Иван' },
  { name: 'last_name', label: 'Фамилия', type: 'text', placeholder: 'Иванов' },
  { name: 'password1', label: 'Пароль', type: 'password', placeholder: '••••••••' },
  { name: 'password2', label: 'Пароль ещё раз', type: 'password', placeholder: '••••••••' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password1: '', password2: '', role: 'applicant',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors(err?.errors || { __all__: 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Регистрация</h1>
          <p className="text-slate-500 text-sm mt-1">Создайте аккаунт на EduRecruit</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
          {errors.__all__ && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {errors.__all__}
            </div>
          )}
          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <div key={name} className={name === 'username' || name === 'email' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[name]}
                    onChange={set(name)}
                    required
                    placeholder={placeholder}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                      errors[name] ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name].join?.(' ') || errors[name]}</p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Я регистрируюсь как</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'applicant', label: 'Соискатель', desc: 'Ищу работу' },
                  { value: 'employer', label: 'Работодатель', desc: 'Нанимаю персонал' },
                ].map((r) => (
                  <label
                    key={r.value}
                    className={`flex flex-col gap-0.5 p-3 border rounded-xl cursor-pointer transition-colors ${
                      form.role === r.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={set('role')}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${form.role === r.value ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {r.label}
                    </span>
                    <span className="text-xs text-slate-400">{r.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
