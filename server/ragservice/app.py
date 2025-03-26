from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Paths
CHROMA_PATH = "chroma"
DATA_PATH = "./books"

# Create proper prompt template
prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template="""
Answer the question based only on the following context and if you dont get relevant info from the context then specify the the answer is from outer source and proceed:

{context}

---

Answer the question based on the above context: {question}
"""
)

app = FastAPI(title="RAG QA System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    currentTopic: Optional[str] = None
    selectedSubject: Optional[str] = None
    language: Optional[str] = "english"

# Global variables
qa_chain = None
db = None

def generate_data_store():
    """Deletes old DB, processes syllabus books, and saves embeddings."""
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)  # Delete existing DB
        print("Deleted existing Chroma database.")

    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(chunks)

def load_documents():
    """Loads all syllabus books from the data folder."""
    loader = DirectoryLoader(DATA_PATH, glob="*.pdf")
    documents = loader.load()
    print(f"Loaded {len(documents)} documents.")
    return documents

def split_text(documents):
    """Splits documents into smaller chunks for better retrieval."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

def save_to_chroma(chunks):
    global db
    db = Chroma.from_documents(
        chunks, 
        HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"), 
        persist_directory=CHROMA_PATH
    )
    print(f"Saved {len(chunks)} chunks to the database.")

def initialize_qa_system():
    global qa_chain, db
    
    # First generate the data store
    generate_data_store()
    
    # Initialize QA chain
    retriever = db.as_retriever()
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatGroq(
            temperature=0,
            groq_api_key=groq_api_key,
            model_name='llama-3.3-70b-versatile'
        ),
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt_template}
    )

@app.on_event("startup")
async def startup_event():
    """Initialize the QA system on startup"""
    initialize_qa_system()

@app.post("/api/chat")
async def get_ai_response(chat_request: ChatRequest) -> str:
    try:
        # Create context string with additional information
        query = chat_request.message
        if chat_request.currentTopic:
            query = f"Regarding the topic '{chat_request.currentTopic}': {query}"
        if chat_request.selectedSubject:
            query = f"In the subject of {chat_request.selectedSubject}, {query}"
        if chat_request.language != "english":
            query = f"{query} (Please respond in {chat_request.language})"
        
        # Get response from QA chain
        response = qa_chain.invoke(query)
        
        # Return just the response string to match frontend expectations
        return response["result"] if isinstance(response, dict) else response
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)