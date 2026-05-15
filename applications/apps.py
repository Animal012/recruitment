import os
import threading

from django.apps import AppConfig


class ApplicationsConfig(AppConfig):
    name = 'applications'

    def ready(self):
        os.environ.setdefault('HF_HUB_OFFLINE', '1')
        os.environ.setdefault('TRANSFORMERS_OFFLINE', '1')

        if os.environ.get('RUN_MAIN') != 'true':
            return

        from .screening import preload_model
        t = threading.Thread(target=preload_model, daemon=True)
        t.start()
