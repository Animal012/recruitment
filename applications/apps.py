import os
import threading

from django.apps import AppConfig


class ApplicationsConfig(AppConfig):
    name = 'applications'

    def ready(self):
        # RUN_MAIN=true только в основном процессе, не в reloader-е
        if os.environ.get('RUN_MAIN') != 'true':
            return

        from .screening import preload_model
        t = threading.Thread(target=preload_model, daemon=True)
        t.start()
