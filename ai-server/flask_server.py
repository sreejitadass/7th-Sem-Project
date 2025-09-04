from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helper Functions
def get_pdf(pdfs):
    """Extract text from uploaded PDFs."""
    text = ""
    for pdf in pdfs:
        try:
            pdfreader = PdfReader(pdf)
            for i, page in enumerate(pdfreader.pages):
                page_text = page.extract_text() or ""
                if not page_text.strip():
                    logger.warning(f"Page {i} of {pdf.filename} has no extractable text")
                text += page_text
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {pdf.filename}: {e}")
    if not text.strip():
        logger.error(f"No usable text extracted from {pdf.filename} (may be scanned or protected)")
    return text

def get_text_chunks(text):
    """Split text into smaller chunks for processing."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    logger.info(f"Split text into {len(chunks)} chunks")
    return chunks

def get_vector_store(text_chunks):
    """Create a FAISS vector store."""
    embeddings = OllamaEmbeddings(model="llama3.2")
    try:
        vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
        if not text_chunks:
            raise ValueError("No text chunks provided to create vector store")
        vector_store.save_local("faiss_index")
        if not os.path.exists(os.path.join("faiss_index", "index.faiss")):
            raise Exception("FAISS index file not created")
        logger.info("Vector store saved to faiss_index")
    except Exception as e:
        logger.error(f"Failed to create/save vector store: {e}")
        raise

def get_chats():
    """Configure the AI chat model."""
    prompt_template = """
    Answer the question as detailed as possible from the provided context. If the answer is not in
    the provided context, just say, "answer is not available in the context." Don't provide the wrong answer.
    You can create summaries, question-answer pairs, and personalized flashcards for uploaded documents.

    Context:\n{context}\n
    Question:\n{question}\n

    Answer:
    """
    model = ChatOllama(model="llama3.2", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)

def query_vector_store(query):
    embeddings = OllamaEmbeddings(model="llama3.2")
    try:
        if not os.path.exists("faiss_index") or not os.path.exists(os.path.join("faiss_index", "index.faiss")):
            raise Exception("FAISS index not found at faiss_index")
        new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
        docs = new_db.similarity_search(query)
        chain = get_chats()
        response = chain({"input_documents": docs, "question": query}, return_only_outputs=True)
        return response["output_text"]
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise

# Flask API Endpoints
@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        logger.info("Received file upload request")
        pdf_file = request.files["file"]
        logger.info(f"Received file in Flask: {pdf_file.filename}")

        # Process the file
        text = get_pdf([pdf_file])  # Pass as a list
        if not text.strip():
            return jsonify({"error": "Failed to extract text from PDF (may be scanned or empty)"}), 400

        text_chunks = get_text_chunks(text)
        if not text_chunks:
            return jsonify({"error": "Failed to split text into chunks"}), 500

        get_vector_store(text_chunks)
        return jsonify({"message": "File processed successfully"}), 200

    except Exception as e:
        logger.exception("Error processing file")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask():
    """Endpoint for asking questions based on the document."""
    data = request.json
    user_question = data.get("question")
    
    if not user_question:
        return jsonify({"error": "Question is required"}), 400
    
    response = query_vector_store(user_question)
    return jsonify({"response": response})

@app.route("/summary", methods=["POST"])
def summary():
    """Generate a summary of the uploaded document."""
    response = query_vector_store("summarize the entire document and extract key points")
    return jsonify({"summary": response})

@app.route("/flashcards", methods=["POST"])
def flashcards():
    response = query_vector_store("""Extract key concepts from the uploaded document and generate flashcards in the following format:
Flashcard [Number]:
Question: [Concise and clear question]
Answer: [Brief, precise answer with relevant details]

Ensure that:
Questions are clear and to the point.
Answers are informative yet concise.
Important technical terms are included.
Each flashcard follows a structured and consistent format.""")
    return jsonify({"flashcards": response})

if __name__ == "__main__":
    app.run(debug=True)