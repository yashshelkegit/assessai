import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Paths
CHROMA_PATH = "chroma"
DATA_PATH = "./books"

# Prompt template
PROMPT_TEMPLATE = """
Answer the question based only on the following context and if you dont get relevant info from the context then specify the the answer is from outer source and proceed:

{context}

---

Answer the question based on the above context: {question}
"""

def main():
    # Step 1: Delete existing database and load new documents
    generate_data_store()
    
    # Step 2: Start CLI for question answering
    query_loop()

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
    loader = DirectoryLoader(DATA_PATH, glob="*.pdf")  # Change to "*.pdf" if needed
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
    """Embeds and stores text chunks in ChromaDB."""
    db = Chroma.from_documents(chunks, HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"), persist_directory=CHROMA_PATH)
    print(f"Saved {len(chunks)} chunks to the database.")

def query_loop():
    """Runs a CLI loop to answer user queries."""
    print("\n📖 AI Syllabus Assistant (Type 'exit' to quit)\n")
    
    # Load ChromaDB as retriever
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"))
    retriever = db.as_retriever()

    # Setup QA system
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatGroq(
            temperature=0,
            groq_api_key=groq_api_key,
            model_name='llama-3.3-70b-versatile'
        ),
        chain_type="stuff",
        retriever=retriever
    )

    while True:
        user_input = input("Ask a question: ")
        if user_input.lower() == "exit":
            print("Goodbye!")
            break

        response = qa_chain.invoke(user_input)
        print(f"\n💡 Answer: {response}\n")

if __name__ == "__main__":
    main()
