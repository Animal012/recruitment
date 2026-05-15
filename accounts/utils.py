import io

from PyPDF2 import PdfReader


def extract_pdf_text(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or '' for page in reader.pages]
        return '\n'.join(pages).strip()
    except Exception:
        return ''
