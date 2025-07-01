# PixeLens_v2 Architecture - Frontend-Backend-Codestral

```mermaid
graph TB
    subgraph "Frontend (Electron + React)"
        UI[React UI]
        EB[Embedded Browser<br/>- WebView<br/>- DOM Extraction]
        WP[Workspace Panel<br/>- File Explorer<br/>- Code Editor]
        IP[Issue Panel<br/>- Issue Display<br/>- Fix Actions]
    end
    
    subgraph "Backend (Node.js + Express)"
        API[Express API Server<br/>- /api/scan-ui<br/>- /api/chat]
        FS[File System Service<br/>- Project Files<br/>- Code Updates]
        SC[Scan Controller<br/>- Request Processing<br/>- Response Handling]
    end
    
    subgraph "Codestral Integration"
        MISTRAL[Mistral AI Client<br/>- API Key<br/>- Request Management]
        CODESTRAL[Codestral Model<br/>- Code Analysis<br/>- Issue Detection<br/>- Fix Generation]
        PROMPT[Prompt Engineering<br/>- HTML/CSS Context<br/>- Issue Templates]
    end
    
    subgraph "Data Flow"
        DOM[DOM + CSS Data]
        ISSUES[Structured Issues]
        FIXES[Code Fixes]
    end
    
    %% Frontend to Backend
    UI --> API
    EB --> API
    WP --> API
    IP --> API
    
    %% Backend to Codestral
    API --> SC
    SC --> MISTRAL
    MISTRAL --> CODESTRAL
    CODESTRAL --> PROMPT
    
    %% Data Processing
    EB --> DOM
    DOM --> SC
    PROMPT --> ISSUES
    CODESTRAL --> FIXES
    
    %% Back to Frontend
    ISSUES --> IP
    FIXES --> WP
    FS --> WP
    
    %% Styling
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef codestral fill:#fff8e1,stroke:#f57c00,stroke-width:3px
    classDef data fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class UI,EB,WP,IP frontend
    class API,FS,SC backend
    class MISTRAL,CODESTRAL,PROMPT codestral
    class DOM,ISSUES,FIXES data
```

## How It Works:

1. **Frontend** extracts DOM/CSS from embedded browser
2. **Backend** receives data via Express API
3. **Codestral** analyzes code and generates issues/fixes
4. **Backend** processes results and updates files
5. **Frontend** displays issues and applies fixes 