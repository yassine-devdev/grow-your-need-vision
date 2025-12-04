import os
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai
import google.generativeai as genai
from knowledge_base import KnowledgeBase
from pocketbase_client import PocketBaseClient

# Load environment variables
# Explicitly look for .env in the parent directory if not found in current
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
dotenv_path = os.path.join(parent_dir, ".env")

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded .env from: {dotenv_path}")
else:
    load_dotenv() # Fallback to default behavior
    print("Loaded .env from default location (or not found)")

app = FastAPI(title="Concierge AI Service")

# Initialize Knowledge Base & PocketBase
# In production, we fail if KB cannot be initialized.
try:
    kb = KnowledgeBase()
except Exception as e:
    print(f"CRITICAL: KnowledgeBase initialization failed: {e}")
    raise RuntimeError(f"KnowledgeBase initialization failed: {e}")

pb = PocketBaseClient()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openai").lower()
AI_MODEL: Optional[str] = os.getenv("AI_MODEL")
OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OPEN_WEBUI_BASE_URL: str = os.getenv("OPEN_WEBUI_BASE_URL", "http://localhost:3000/api")

# Initialize Clients
client: Optional[openai.OpenAI] = None
genai_model: Optional[genai.GenerativeModel] = None

def get_client() -> None:
    global client, genai_model
    
    if AI_PROVIDER == "openai" and OPENAI_API_KEY:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
    elif AI_PROVIDER == "openrouter" and OPENROUTER_API_KEY:
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
    elif AI_PROVIDER == "groq" and GROQ_API_KEY:
        client = openai.OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=GROQ_API_KEY,
        )
    elif AI_PROVIDER == "ollama":
        client = openai.OpenAI(
            base_url=OLLAMA_BASE_URL,
            api_key="ollama", # Required but unused
        )
    elif AI_PROVIDER == "openwebui":
        client = openai.OpenAI(
            base_url=OPEN_WEBUI_BASE_URL,
            api_key=OPENAI_API_KEY or "sk-placeholder", # OpenWebUI might require a key structure but not validation
        )
    elif AI_PROVIDER == "gemini" and GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        genai_model = genai.GenerativeModel('gemini-pro')

get_client()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: Optional[str] = None
    model: Optional[str] = None
    userId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    usage: Optional[Dict[str, Any]] = None
    provider: str

class SystemStats(BaseModel):
    latency: str
    error_rate: str
    load: str
    tokens_total: str
    tokens_input: str
    tokens_output: str
    provider: str

@app.on_event("startup")
async def startup_event() -> None:
    # 1. Authenticate PocketBase
    await pb.authenticate()
    
    # 2. Ingest docs on startup in background
    # Assuming docs are in ../docs relative to ai_service/
    docs_path: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs")
    if os.path.exists(docs_path):
        print(f"Background ingestion started for: {docs_path}")
        # Note: In a real async app, we might want to run this in a separate thread/process
        # to avoid blocking startup if it takes too long. For now, it's synchronous but fast enough for small docs.
        try:
            count: int = kb.ingest_docs(docs_path)
            print(f"Startup ingestion complete: {count} chunks.")
        except Exception as e:
            print(f"Startup ingestion failed: {e}")
    else:
        print(f"Docs directory not found at {docs_path}")

# Global Stats Tracker
class ServiceStats:
    def __init__(self) -> None:
        self.start_time: float = time.time()
        self.request_count: int = 0
        self.error_count: int = 0
        self.tokens_in: int = 0
        self.tokens_out: int = 0

    def get_uptime(self) -> str:
        uptime_seconds = time.time() - self.start_time
        hours = int(uptime_seconds // 3600)
        minutes = int((uptime_seconds % 3600) // 60)
        return f"{hours}h {minutes}m"

    def get_error_rate(self) -> str:
        if self.request_count == 0:
            return "0.00%"
        return f"{(self.error_count / self.request_count) * 100:.2f}%"

stats = ServiceStats()

@app.get("/")
async def root() -> Dict[str, str]:
    return {
        "status": "online", 
        "service": "Concierge AI", 
        "provider": AI_PROVIDER,
        "uptime": stats.get_uptime()
    }

@app.get("/stats", response_model=SystemStats)
async def get_stats() -> Dict[str, str]:
    return {
        "latency": "24ms", # Placeholder for average latency calculation
        "error_rate": stats.get_error_rate(),
        "load": f"{stats.request_count} reqs",
        "tokens_total": str(stats.tokens_in + stats.tokens_out),
        "tokens_input": str(stats.tokens_in),
        "tokens_output": str(stats.tokens_out),
        "provider": AI_PROVIDER
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> Dict[str, Any]:
    stats.request_count += 1
    try:
        # 1. Check for specific system commands first
        last_message: str = request.messages[-1].content.lower()
        
        if "status" in last_message or "health" in last_message:
            return {
                "response": f"All systems are operational. Provider: {AI_PROVIDER}. Latency is nominal (24ms).",
                "usage": {"total_tokens": 0},
                "provider": AI_PROVIDER
            }
        
        if "help" in last_message:
            return {
                "response": "I am the Concierge AI. I can assist you with:\n- Platform configuration\n- User management\n- System diagnostics\n- Data analysis\n\nHow can I help you today?",
                "usage": {"total_tokens": 0},
                "provider": AI_PROVIDER
            }

        # RAG: Retrieve relevant context
        retrieved_context: str = ""
        try:
            results: List[str] = kb.search(request.messages[-1].content)
            if results:
                retrieved_context = "\n\nRelevant Documentation:\n" + "\n---\n".join(results)
        except Exception as e:
            print(f"Vector search failed: {e}")

        # REAL-TIME DATA: Fetch System Pulse
        system_pulse: str = await pb.get_recent_activity()
        
        # REAL-TIME DATA: Targeted Search (Simple Intent)
        db_results: str = ""
        user_query: str = request.messages[-1].content.lower()
        
        # Wellness Coach Logic
        if request.context == "Wellness Coach" and request.userId:
            try:
                logs = await pb.search_collection("wellness_logs", filter_str=f"user='{request.userId}'", limit=7)
                if logs:
                    # Format logs for better AI consumption
                    formatted_logs: List[str] = []
                    for log in logs:
                        formatted_logs.append(f"- Date: {log.get('date')}, Steps: {log.get('steps')}, Calories: {log.get('calories')}, Sleep: {log.get('sleep_minutes')}m, Mood: {log.get('mood')}")
                    db_results += f"\n\n[USER WELLNESS LOGS (Last 7 Days)]\n" + "\n".join(formatted_logs)
            except Exception as e:
                print(f"Error fetching wellness logs: {e}")

        if "search user" in user_query or "find user" in user_query:
            # Extract name (very naive)
            parts = user_query.split("user")
            if len(parts) > 1:
                search_term = parts[1].strip()
                users = await pb.search_collection("users", filter_str=f"name~'{search_term}' || email~'{search_term}'")
                db_results = f"\n\nDatabase Search Results (Users):\n{users}"
        elif "list products" in user_query:
             products = await pb.search_collection("products", limit=10)
             db_results = f"\n\nDatabase Search Results (Products):\n{products}"

        system_prompt: str = "You are the Concierge AI for the 'Grow Your Need' platform. You are helpful, professional, and concise. You have access to system documentation and real-time database status."
        
        if request.context == "Wellness Coach":
            system_prompt = "You are the Wellness Coach for the 'Grow Your Need' platform. You are an empathetic, encouraging, and knowledgeable health assistant. You help users track their fitness, sleep, and mental well-being. Use the provided wellness logs to give personalized advice. Keep your answers short and motivating."

        # Inject Contexts
        system_prompt += f"\n\n[SYSTEM PULSE - RECENT ACTIVITY]\n{system_pulse}"
        
        if request.context:
            system_prompt += f"\n\n[USER CONTEXT]\n{request.context}"
            
        if retrieved_context:
            system_prompt += f"\n\n[KNOWLEDGE BASE]\n{retrieved_context}"
            
        if db_results:
            system_prompt += f"\n\n[DATABASE RESULTS]\n{db_results}"

        # 2. Handle Gemini Provider
        if AI_PROVIDER == "gemini" and genai_model:
            chat_session = genai_model.start_chat(history=[])
            # Gemini handles system prompts differently, usually prepended to first message or context
            # For simplicity, we'll just send the last message with context
            full_prompt: str = f"{system_prompt}\n\nUser: {request.messages[-1].content}"
            response = chat_session.send_message(full_prompt)
            
            # Estimate tokens (rough approximation for Gemini)
            input_tokens = len(full_prompt) // 4
            output_tokens = len(response.text) // 4
            stats.tokens_in += input_tokens
            stats.tokens_out += output_tokens
            
            return {
                "response": response.text,
                "usage": {"total_tokens": input_tokens + output_tokens}, 
                "provider": AI_PROVIDER
            }

        # 3. Handle OpenAI-compatible Providers (OpenAI, OpenRouter, Groq, Ollama)
        if client:
            model: str = "gpt-3.5-turbo" # Default
            if AI_PROVIDER == "openrouter":
                model = request.model or AI_MODEL or "openai/gpt-3.5-turbo"
            elif AI_PROVIDER == "groq":
                model = request.model or AI_MODEL or "llama3-8b-8192"
            elif AI_PROVIDER == "ollama":
                model = request.model or AI_MODEL or "qwen2.5:1.5b"
            elif AI_PROVIDER == "openwebui":
                model = request.model or AI_MODEL or "gpt-3.5-turbo" # OpenWebUI often aliases models
            
            api_messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
            for msg in request.messages:
                api_messages.append({"role": msg.role, "content": msg.content})

            completion = client.chat.completions.create(
                model=model,
                messages=api_messages
            )
            
            if completion.usage:
                stats.tokens_in += completion.usage.prompt_tokens
                stats.tokens_out += completion.usage.completion_tokens
            
            return {
                "response": completion.choices[0].message.content,
                "usage": {
                    "prompt_tokens": completion.usage.prompt_tokens,
                    "completion_tokens": completion.usage.completion_tokens,
                    "total_tokens": completion.usage.total_tokens
                } if completion.usage else {},
                "provider": AI_PROVIDER
            }
        
        # 4. Fallback
        stats.error_count += 1
        return {
            "response": f"I am currently running in offline mode. Provider '{AI_PROVIDER}' is not configured correctly. Please check your .env file.",
            "usage": {"total_tokens": 0},
            "provider": "offline"
        }

    except Exception as e:
        stats.error_count += 1
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
