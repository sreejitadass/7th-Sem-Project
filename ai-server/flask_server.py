from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
import os
from langchain.text_splitter import TokenTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from flask_cors import CORS
from dotenv import load_dotenv
import docx
import logging

# ---------- Config ----------
load_dotenv()

APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:5173")
DATA_DIR = os.getenv("AI_DATA_DIR", "faiss_data")
PORT = int(os.getenv("PORT", 5001))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": APP_ORIGIN}}, supports_credentials=False)
os.makedirs(DATA_DIR, exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

@app.after_request
def add_cors_headers(resp):
    resp.headers.add("Access-Control-Allow-Origin", APP_ORIGIN)
    resp.headers.add("Vary", "Origin")
    resp.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    resp.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return resp

# ---------- Helpers ----------
def _index_dir(user_id: str) -> str:
    safe = "".join(c for c in (user_id or "") if c.isalnum() or c in ("-", "_"))
    path = os.path.join(DATA_DIR, safe or "default")
    os.makedirs(path, exist_ok=True)
    return path

def get_text_from_file(file):
    filename = file.filename.lower()
    text = ""
    try:
        if filename.endswith('.pdf'):
            reader = PdfReader(file.stream)
            for i, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text() or ""
                except Exception as e:
                    app.logger.error("Failed to extract page %s: %s", i, e)
                    page_text = ""
                text += page_text + "\n"
        elif filename.endswith('.docx') or filename.endswith('.doc'):
            doc = docx.Document(file.stream)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif filename.endswith('.txt'):
            text = file.read().decode('utf-8', errors='ignore')
        else:
            raise ValueError("Unsupported file type")
    except Exception as e:
        app.logger.error("Failed to extract text from %s: %s", filename, e)
    return text.strip()

def get_text_chunks(text):
    splitter = TokenTextSplitter(chunk_size=2000, chunk_overlap=200)
    return splitter.split_text(text)

# Create reusable embeddings client for Ollama
EMBEDDINGS = OllamaEmbeddings(model="gemma:2b")

def get_vector_store(text_chunks):
    try:
        vector_store = FAISS.from_texts(text_chunks, embedding=EMBEDDINGS)
        vector_store.save_local("faiss_index")
    except Exception as e:
        app.logger.error("Failed to create/save vector store: %s", e)
        raise

def make_chain():
    llm = ChatOllama(model="gemma:2b", temperature=0.3)
    prompt_template = """
    Answer the question as detailed as possible from the provided context. If the answer is not in
    the provided context, just say, "answer is not available in the context." Don't provide the wrong answer.
    You can create summaries, question-answer pairs, and personalized flashcards for uploaded documents.
    Context:
    {context}

    Question:
    {question}

    Answer:
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(llm, chain_type="stuff", prompt=prompt)

def query_vector_store(query):
    try:
        db = FAISS.load_local("faiss_index", EMBEDDINGS, allow_dangerous_deserialization=True)
        docs = db.similarity_search(query)
        chain = make_chain()
        response = chain({"input_documents": docs, "question": query}, return_only_outputs=True)
        return response["output_text"]
    except Exception as e:
        app.logger.error("Query failed: %s", e)
        raise

# ---------- Routes ----------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            app.logger.warning("No 'file' form field. keys=%s", list(request.files.keys()))
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        app.logger.info("Received file: %s", getattr(file, "filename", None))

        text = get_text_from_file(file)
        if not text:
            return jsonify({"error": "No extractable text (file may be scanned, protected, or empty)."}), 422

        text_chunks = get_text_chunks(text)
        if not text_chunks:
            return jsonify({"error": "Failed to split text into chunks"}), 500

        get_vector_store(text_chunks)
        return jsonify({"message": "File processed successfully"}), 200

    except Exception as e:
        app.logger.exception("Error processing file: %s", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/summary", methods=["POST"])
def summary():
    try:
        response = query_vector_store("summarize the entire document and extract key points")
        return jsonify({"summary": response})
    except Exception as e:
        app.logger.exception("Summary failed: %s", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/flashcards", methods=["POST"])
def flashcards():
    try:
        prompt = """
        Generate 5-10 educational flashcards from the provided document context.
        
        FORMAT STRICTLY:
        **Flashcard X:**
        Question: [clear question about a key concept]
        Answer: [concise answer, under 50 words]
        
        RULES:
        1. Create questions about the most important concepts in the document
        2. Questions should start with "What is", "What are", "How does", "Why is"
        3. Answers should be factual and based only on the document content
        4. Number flashcards sequentially starting from 1
        5. Do NOT include any introductory text or summaries
        """
        
        response = query_vector_store(prompt)
        app.logger.info("Flashcards response: %s", response)
        return jsonify({"flashcards": response})
    except Exception as e:
        app.logger.exception("Flashcards failed: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)