# 🌊 Flowon AI
##### 🔄 Streamlining the information flow of your business

## 🏗️ Codebase Overview
### 🛠️ Tech Stack
#### Backend
- 🐍 Python with FastAPI
- 🗄️ Supabase (Database)
- 📊 Pinecone (Vector Database)
- ⚡ Redis (In-memory Cache)
- 🎥 LiveKit (Real-time Communication)
- 🔐 Clerk (Authentication)
- 🔌 Composio (LLM Integration)
- 📞 Twilio (Telephony)

#### Frontend
- ⚛️ React & Next.js
- 🎨 Tailwind CSS
- 💅 Styled-components
- 🔄 LiveKit Components

### 🤖 AI Tools
- 📝 Cursor (IDE) with Claude 3.5 Sonnet
- 📊 CodeViz (Architecture Visualization)
- 💻 Warp (Terminal)
- 🧠 LLM Models:
  - OpenAI
  - Anthropic
  - Meta
  - Coming soon: Cerebras & Groq

### ⚙️ Infrastructure & CI/CD
- 🌊 DigitalOcean (Hosting)
- ☁️ Cloudflare (DNS/CDN)
- 🔄 nginx (Reverse Proxy)
- 🚨 Sentry (Error Monitoring)
- 🧹 Code Quality:
  - flake8 (Linting)
  - mypy (Type Checking)
  - bandit (Security)
- 📊 PostHog (Analytics)
- 🤖 AI-Powered Code Review:
  - Greptile
  - CodeRabbit

## 🚀 Getting Started

### Backend Setup
1. Create Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
python run_fast.py
```

5. Run all the tests:
```bash
pytest tests/ -v
```

### Frontend Setup
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Production build:
```bash
npm run build
npm start
```

## 🔌 Widget System
Our modular widget system consists of:

### Components
- 💬 **ChatWidget**: Real-time conversational interface
  - LiveKit integration
  - Styled-components theming

- 📝 **TextWidget**: Text-based interaction
  - Markdown support
  - Custom styling
  - Responsive design

- 🖼️ **iframe Integration**
  - Secure embedding
  - Cross-origin communication
  - Responsive sizing

### Development
Each widget can be developed independently:
```bash
# ChatWidget
cd ChatWidget && npm run dev

# TextWidget
cd TextWidget && npm run dev
```