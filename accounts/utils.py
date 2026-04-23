import io

from PyPDF2 import PdfReader


def extract_pdf_text(file_field) -> str:
    try:
        file_field.seek(0)
        reader = PdfReader(io.BytesIO(file_field.read()))
        pages = [page.extract_text() or '' for page in reader.pages]
        return '\n'.join(pages).strip()
    except Exception:
        return ''
