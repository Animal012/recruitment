import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FeatureCard({ icon, title, text, accent }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${accent}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            Подбор персонала для<br />
            <span className="text-indigo-400">образовательных организаций</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Веб-система для размещения вакансий и автоматической оценки резюме педагогических работников.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {!user ? (
              <>
                <Link to="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
                  Зарегистрироваться
                </Link>
                <Link to="/vacancies" className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-colors">
                  Смотреть вакансии
                </Link>
              </>
            ) : (
              <Link to="/vacancies" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
                Смотреть вакансии
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            accent="bg-indigo-50"
            icon={
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="Поиск вакансий"
            text="Поиск по названию, городу и зарплате. Работает без учёта регистра, в том числе на кириллице."
          />
          <FeatureCard
            accent="bg-violet-50"
            icon={
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Оценка резюме"
            text="После отклика система сравнивает загруженное резюме с текстом вакансии и выдаёт процент соответствия."
          />
          <FeatureCard
            accent="bg-emerald-50"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Работа с откликами"
            text="Работодатель просматривает заявки, видит результат проверки резюме и меняет статус каждого кандидата."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Как пользоваться системой</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-4">Для соискателя</p>
              <div className="space-y-4">
                {[
                  { n: 1, title: 'Заполните профиль', desc: 'Укажите контактные данные, образование и опыт работы. Загрузите резюме в формате PDF.' },
                  { n: 2, title: 'Найдите подходящую вакансию', desc: 'Просмотрите список вакансий, используйте фильтры по городу и зарплате.' },
                  { n: 3, title: 'Откликнитесь', desc: 'Нажмите кнопку отклика — система автоматически проверит резюме и сохранит результат.' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{s.title}</div>
                      <div className="text-slate-400 text-sm mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4">Для работодателя</p>
              <div className="space-y-4">
                {[
                  { n: 1, title: 'Создайте вакансию', desc: 'Заполните название, описание должности, требования к кандидату и условия работы.' },
                  { n: 2, title: 'Получайте заявки', desc: 'Соискатели откликаются на вакансию, резюме каждого проверяется автоматически.' },
                  { n: 3, title: 'Рассматривайте кандидатов', desc: 'Просматривайте заявки, меняйте статус: на рассмотрении, приглашён, отказ.' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{s.title}</div>
                      <div className="text-slate-400 text-sm mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
