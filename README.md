# Flowon AI
##### Streamlining the information flow of your business

## Codebase Overview
### Tech Stack
- Python, FastAPI (backend)
- Typescript, Next.js, React, Tailwind CSS (frontend)
- Supabase (for database)
- Pinecone for vector database
- Redis for in-memory 
- Livekit for realtime conversational agent pipeline
- Clerk for user management
- Composio for LLM integration with 3rd party apps
- Twilio for telephony integration


### AI Tools
- Cursor for IDE, Model Sonnet 3.5
- CodeViz for architecture visualisation
- Warp for terminal
- LLM Models: Openai, Anthropic, Meta. Awaiting cerebras and groq api for fast inference. 

### Infra & CI/CD
- DigitalOcean for hosting
- Cloudflare for DNS and CDN
- nginx for reverse proxy
- Sentry for error monitoring
- PostHog for analytics
- Greptile web/app & API for Codebase chat, PR review
- CodeRabbit for PR review
  

## Getting Started

### Backend
1. Set up Python virtual environment:   
```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate   ```

2. Install dependencies:   
```bash pip install -r requirements.txt   ```

3. Run the development server:   
```bash
   python run_fast.py   ```

### Frontend
1. Install Node.js dependencies:  
```bash
   npm install   ```

2. Start development server:   
```bash
   npm run dev   ```

3. For production build:   
```bash
   npm run build
   npm start   ```
   
### Widget UI
The widget system consists of several interconnected components:

- **ChatWidget**: Real-time chat interface component
- **TextWidget**: Text-based interaction component
- **iframe**: Embedding framework for widget integration
- **Clients**: Client-side implementations and examples
