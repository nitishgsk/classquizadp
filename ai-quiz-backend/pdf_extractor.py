import sys
import fitz  # PyMuPDF
import io

# --- THIS IS THE FIX ---
# Force the standard output to use UTF-8 encoding to handle all characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# --- END OF FIX ---

def extract_text(pdf_path):
    """Extracts text from a PDF and prints it to standard output."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        # This print statement is how Node.js will get the result
        print(text)
    except Exception as e:
        # Print errors to stderr so Node.js can catch them
        print(f"Error processing PDF: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # The script expects exactly one argument: the path to the PDF file
    if len(sys.argv) != 2:
        print("Usage: python pdf_extractor.py <path_to_pdf>", file=sys.stderr)
        sys.exit(1)
    
    pdf_file_path = sys.argv[1]
    extract_text(pdf_file_path)