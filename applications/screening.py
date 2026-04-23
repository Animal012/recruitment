import threading

from sentence_transformers import SentenceTransformer, util

_model = None
_model_lock = threading.Lock()


def _get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    return _model


def preload_model():
    """Вызывается при старте Django — грузит модель заранее."""
    _get_model()


def compute_score(resume_text: str, vacancy_text: str) -> float:
    if not resume_text.strip() or not vacancy_text.strip():
        return 0.0
    model = _get_model()
    emb_resume = model.encode(resume_text, convert_to_tensor=True)
    emb_vacancy = model.encode(vacancy_text, convert_to_tensor=True)
    similarity = util.cos_sim(emb_resume, emb_vacancy).item()
    return round(max(0.0, similarity) * 100, 2)


def _do_screening(application_id: int):
    """Выполняется в фоновом потоке."""
    import django
    django.setup.__module__  # ensure app registry is ready

    from applications.models import Application, ScreeningResult

    try:
        application = Application.objects.select_related(
            'applicant__applicant_profile', 'vacancy'
        ).get(pk=application_id)
    except Application.DoesNotExist:
        return

    try:
        resume_text = application.applicant.applicant_profile.resume_text
    except Exception:
        resume_text = ''

    vacancy = application.vacancy
    vacancy_text = f"{vacancy.title}\n{vacancy.description}\n{vacancy.requirements}"

    score = compute_score(resume_text, vacancy_text)

    ScreeningResult.objects.update_or_create(
        application=application,
        defaults={'score': score, 'details': {'resume_chars': len(resume_text)}},
    )


def run_screening(application):
    """Запускает скрининг в фоновом потоке — пользователь не ждёт."""
    t = threading.Thread(target=_do_screening, args=(application.pk,), daemon=True)
    t.start()
