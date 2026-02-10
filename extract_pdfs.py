from pypdf import PdfReader

def extract_text(pdf_path):
    print(f"--- Text from {pdf_path} ---")
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            print(page.extract_text())
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

extract_text('c:/Users/HP/OneDrive/Desktop/Grade card.pdf')
extract_text('c:/Users/HP/OneDrive/Desktop/Minor certificate.pdf')
