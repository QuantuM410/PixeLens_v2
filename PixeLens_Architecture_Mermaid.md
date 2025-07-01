# PixeLens_v2 Architecture - Mermaid Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "PixeLens_v2 System"
        subgraph "Frontend Layer (Electron)"
            UI[React UI Components]
            EB[Embedded Browser]
            WP[Workspace Panel]
            IP[Issue Panel]
            CI[Chat Interface]
            SE[Style Editor]
            DT[Design Tokens]
        end
        
        subgraph "Backend Layer (Node.js)"
            API[Express API Server]
            FS[File System Service]
            SC[Scan Controller]
            FC[Fix Controller]
            LC[Location Controller]
        end
        
        subgraph "AI/LLM Layer"
            MAI[Mistral AI Integration]
            CODESTRAL[Codestral Model]
            PROMPT[Prompt Engineering]
            RESPONSE[Response Parser]
        end
        
        subgraph "Data Layer"
            LOCAL[Local Storage]
            PROJECT[Project Files]
            SETTINGS[Settings]
            CACHE[AI Cache]
        end
        
        subgraph "External Services"
            MISTRAL_API[Mistral API]
            FILE_SYS[File System]
            WEB[Web Content]
        end
    end
    
    %% Frontend to Backend connections
    UI --> API
    EB --> API
    WP --> API
    IP --> API
    CI --> API
    
    %% Backend to AI connections
    API --> MAI
    SC --> MAI
    FC --> MAI
    
    %% AI to External Services
    MAI --> MISTRAL_API
    CODESTRAL --> MISTRAL_API
    
    %% Data connections
    API --> LOCAL
    API --> PROJECT
    API --> SETTINGS
    MAI --> CACHE
    
    %% File system connections
    API --> FILE_SYS
    EB --> WEB
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef ai fill:#fff3e0,stroke:#e65100,stroke-width:3px
    classDef data fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    
    class UI,EB,WP,IP,CI,SE,DT frontend
    class API,FS,SC,FC,LC backend
    class MAI,CODESTRAL,PROMPT,RESPONSE ai
    class LOCAL,PROJECT,SETTINGS,CACHE data
    class MISTRAL_API,FILE_SYS,WEB external
```

## 2. Detailed Component Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        subgraph "Main Application"
            TITLE[Title Bar]
            LAYOUT[Layout Manager]
            THEME[Theme Provider]
        end
        
        subgraph "Core Panels"
            WORKSPACE[Workspace Panel<br/>- File Explorer<br/>- Code Editor<br/>- Search]
            BROWSER[Embedded Browser<br/>- WebView Engine<br/>- Viewport Controls<br/>- Element Selection]
            ISSUES[Issue Panel<br/>- Issue List<br/>- Filtering<br/>- Severity Sorting]
        end
        
        subgraph "Supporting Components"
            CHAT[Chat Interface<br/>- AI Assistant<br/>- Context Awareness<br/>- Message History]
            STYLE[Style Editor<br/>- CSS Properties<br/>- Live Preview<br/>- Code Generation]
            DESIGN[Design Tokens<br/>- Color Palette<br/>- Typography<br/>- Spacing]
        end
    end
    
    subgraph "Business Logic Layer"
        subgraph "UI Analysis Engine"
            SCAN[UI Scanner<br/>- DOM Extraction<br/>- CSS Analysis<br/>- Element Mapping]
            DETECT[Issue Detector<br/>- Pattern Recognition<br/>- Rule Validation<br/>- Severity Assessment]
            LOCATE[Code Locator<br/>- Element-to-Code Mapping<br/>- File Search<br/>- Line Highlighting]
        end
        
        subgraph "Fix Management"
            APPLY[Fix Applicator<br/>- Code Modification<br/>- File Updates<br/>- Backup Creation]
            VALIDATE[Fix Validator<br/>- Syntax Checking<br/>- Impact Analysis<br/>- Rollback Support]
        end
        
        subgraph "File Management"
            FS_MGR[File System Manager<br/>- Project Loading<br/>- File Operations<br/>- Path Resolution]
            EDITOR[Code Editor Integration<br/>- Syntax Highlighting<br/>- Auto-completion<br/>- Error Detection]
        end
    end
    
    subgraph "AI/LLM Integration Layer"
        subgraph "Mistral AI Engine"
            MISTRAL[Mistral AI Client<br/>- API Communication<br/>- Request Management<br/>- Response Handling]
            CODESTRAL_MODEL[Codestral Model<br/>- Code Analysis<br/>- Issue Detection<br/>- Fix Generation]
            PROMPT_ENG[Prompt Engineering<br/>- Context Building<br/>- Template Management<br/>- Optimization]
        end
        
        subgraph "AI Processing"
            PARSER[Response Parser<br/>- JSON Extraction<br/>- Error Handling<br/>- Data Validation]
            CONTEXT[Context Manager<br/>- Session State<br/>- Memory Management<br/>- Learning]
        end
    end
    
    subgraph "Data Persistence Layer"
        subgraph "Local Storage"
            SQLITE[SQLite Database<br/>- Settings Storage<br/>- Issue History<br/>- User Preferences]
            CACHE_STORE[Cache Store<br/>- AI Responses<br/>- Scan Results<br/>- Temporary Data]
        end
        
        subgraph "File System"
            PROJECT_FILES[Project Files<br/>- Source Code<br/>- Configuration<br/>- Assets]
            WORKSPACE_DATA[Workspace Data<br/>- Session State<br/>- Editor State<br/>- UI State]
        end
    end
    
    %% Connections between layers
    WORKSPACE --> SCAN
    BROWSER --> SCAN
    ISSUES --> DETECT
    CHAT --> MISTRAL
    
    SCAN --> MISTRAL
    DETECT --> CODESTRAL_MODEL
    LOCATE --> FS_MGR
    
    APPLY --> FS_MGR
    VALIDATE --> APPLY
    
    MISTRAL --> PARSER
    CODESTRAL_MODEL --> PROMPT_ENG
    PARSER --> CONTEXT
    
    SCAN --> CACHE_STORE
    MISTRAL --> CACHE_STORE
    FS_MGR --> PROJECT_FILES
    
    %% Styling
    classDef ui fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef logic fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef ai fill:#fff8e1,stroke:#f57c00,stroke-width:3px
    classDef data fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class TITLE,LAYOUT,THEME,WORKSPACE,BROWSER,ISSUES,CHAT,STYLE,DESIGN ui
    class SCAN,DETECT,LOCATE,APPLY,VALIDATE,FS_MGR,EDITOR logic
    class MISTRAL,CODESTRAL_MODEL,PROMPT_ENG,PARSER,CONTEXT ai
    class SQLITE,CACHE_STORE,PROJECT_FILES,WORKSPACE_DATA data
```

## 3. Data Flow Architecture

```mermaid
flowchart TD
    subgraph "User Interaction"
        USER[Developer User]
        UI_ACTION[UI Action<br/>- Scan Button<br/>- Fix Button<br/>- Element Selection]
    end
    
    subgraph "Frontend Processing"
        DOM_EXTRACT[DOM Extraction<br/>- HTML Content<br/>- CSS Styles<br/>- Element Properties]
        CONTEXT_BUILD[Context Building<br/>- Current State<br/>- User Intent<br/>- Project Context]
    end
    
    subgraph "Backend Processing"
        REQUEST_HANDLER[Request Handler<br/>- API Endpoints<br/>- Data Validation<br/>- Route Management]
        SCAN_ENGINE[Scan Engine<br/>- Issue Detection<br/>- Pattern Analysis<br/>- Severity Calculation]
    end
    
    subgraph "AI/LLM Processing"
        MISTRAL_API[Mistral API Call<br/>- Codestral Model<br/>- Prompt Injection<br/>- Response Streaming]
        AI_ANALYSIS[AI Analysis<br/>- Code Review<br/>- Issue Identification<br/>- Fix Suggestions]
        RESPONSE_PROCESS[Response Processing<br/>- JSON Parsing<br/>- Error Handling<br/>- Data Structuring]
    end
    
    subgraph "Result Processing"
        ISSUE_GENERATION[Issue Generation<br/>- Structured Issues<br/>- Severity Levels<br/>- Fix Recommendations]
        FIX_APPLICATION[Fix Application<br/>- Code Modification<br/>- File Updates<br/>- Validation]
    end
    
    subgraph "Feedback Loop"
        UI_UPDATE[UI Update<br/>- Issue Display<br/>- Visual Feedback<br/>- Status Updates]
        USER_FEEDBACK[User Feedback<br/>- Accept/Reject<br/>- Manual Edits<br/>- Learning Input]
    end
    
    %% Flow connections
    USER --> UI_ACTION
    UI_ACTION --> DOM_EXTRACT
    DOM_EXTRACT --> CONTEXT_BUILD
    CONTEXT_BUILD --> REQUEST_HANDLER
    
    REQUEST_HANDLER --> SCAN_ENGINE
    SCAN_ENGINE --> MISTRAL_API
    MISTRAL_API --> AI_ANALYSIS
    AI_ANALYSIS --> RESPONSE_PROCESS
    
    RESPONSE_PROCESS --> ISSUE_GENERATION
    ISSUE_GENERATION --> FIX_APPLICATION
    FIX_APPLICATION --> UI_UPDATE
    UI_UPDATE --> USER_FEEDBACK
    USER_FEEDBACK --> USER
    
    %% Styling
    classDef user fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef ai fill:#fff8e1,stroke:#f57c00,stroke-width:3px
    classDef result fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef feedback fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class USER,UI_ACTION user
    class DOM_EXTRACT,CONTEXT_BUILD,UI_UPDATE frontend
    class REQUEST_HANDLER,SCAN_ENGINE backend
    class MISTRAL_API,AI_ANALYSIS,RESPONSE_PROCESS ai
    class ISSUE_GENERATION,FIX_APPLICATION result
    class USER_FEEDBACK feedback
```

## 4. LLM Integration Architecture

```mermaid
graph TB
    subgraph "Mistral AI Integration"
        subgraph "API Layer"
            MISTRAL_CLIENT[Mistral Client<br/>- Authentication<br/>- Rate Limiting<br/>- Error Handling]
            API_ENDPOINTS[API Endpoints<br/>- /api/scan-ui<br/>- /api/chat<br/>- /api/fix]
        end
        
        subgraph "Model Layer"
            CODESTRAL[Codestral Model<br/>- Code Analysis<br/>- Issue Detection<br/>- Fix Generation]
            PROMPT_TEMPLATES[Prompt Templates<br/>- UI Analysis<br/>- Accessibility<br/>- Performance]
        end
        
        subgraph "Processing Layer"
            CONTEXT_MANAGER[Context Manager<br/>- Session State<br/>- Memory Management<br/>- Learning]
            RESPONSE_PARSER[Response Parser<br/>- JSON Extraction<br/>- Error Handling<br/>- Validation]
        end
    end
    
    subgraph "Application Integration"
        subgraph "Frontend Integration"
            CHAT_UI[Chat Interface<br/>- User Messages<br/>- AI Responses<br/>- Context Display]
            SCAN_UI[Scan Interface<br/>- Issue Display<br/>- Fix Suggestions<br/>- Apply Actions]
        end
        
        subgraph "Backend Integration"
            SCAN_CONTROLLER[Scan Controller<br/>- Request Processing<br/>- Data Preparation<br/>- Response Handling]
            FIX_CONTROLLER[Fix Controller<br/>- Fix Application<br/>- Code Modification<br/>- Validation]
        end
    end
    
    subgraph "Data Flow"
        subgraph "Input Processing"
            DOM_DATA[DOM Data<br/>- HTML Content<br/>- CSS Styles<br/>- Element Properties]
            USER_CONTEXT[User Context<br/>- Current State<br/>- Intent<br/>- History]
        end
        
        subgraph "Output Processing"
            AI_RESPONSE[AI Response<br/>- Structured Data<br/>- Issue Objects<br/>- Fix Suggestions]
            VALIDATED_OUTPUT[Validated Output<br/>- Parsed Issues<br/>- Applied Fixes<br/>- User Feedback]
        end
    end
    
    %% Connections
    DOM_DATA --> MISTRAL_CLIENT
    USER_CONTEXT --> MISTRAL_CLIENT
    MISTRAL_CLIENT --> CODESTRAL
    CODESTRAL --> PROMPT_TEMPLATES
    PROMPT_TEMPLATES --> CONTEXT_MANAGER
    CONTEXT_MANAGER --> RESPONSE_PARSER
    RESPONSE_PARSER --> AI_RESPONSE
    AI_RESPONSE --> VALIDATED_OUTPUT
    
    CHAT_UI --> SCAN_CONTROLLER
    SCAN_UI --> FIX_CONTROLLER
    SCAN_CONTROLLER --> MISTRAL_CLIENT
    FIX_CONTROLLER --> MISTRAL_CLIENT
    
    %% Styling
    classDef mistral fill:#fff8e1,stroke:#f57c00,stroke-width:3px
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef data fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class MISTRAL_CLIENT,API_ENDPOINTS,CODESTRAL,PROMPT_TEMPLATES,CONTEXT_MANAGER,RESPONSE_PARSER mistral
    class CHAT_UI,SCAN_UI,SCAN_CONTROLLER,FIX_CONTROLLER app
    class DOM_DATA,USER_CONTEXT,AI_RESPONSE,VALIDATED_OUTPUT data
```

## 5. Technology Stack Architecture

```mermaid
graph TB
    subgraph "Frontend Technologies"
        subgraph "Desktop Framework"
            ELECTRON[Electron<br/>- Cross-platform<br/>- Native APIs<br/>- Desktop Integration]
        end
        
        subgraph "UI Framework"
            REACT[React 19<br/>- Component-based<br/>- Hooks<br/>- State Management]
            TYPESCRIPT[TypeScript<br/>- Type Safety<br/>- IntelliSense<br/>- Error Prevention]
        end
        
        subgraph "Styling & UI"
            TAILWIND[Tailwind CSS<br/>- Utility-first<br/>- Responsive Design<br/>- Dark Mode]
            RADIX[Radix UI<br/>- Accessible Components<br/>- Unstyled Design<br/>- Customization]
        end
        
        subgraph "Build Tools"
            VITE[Vite<br/>- Fast Development<br/>- Hot Reload<br/>- Optimized Build]
            ESLINT[ESLint<br/>- Code Quality<br/>- Style Enforcement<br/>- Error Detection]
        end
    end
    
    subgraph "Backend Technologies"
        subgraph "Runtime"
            NODEJS[Node.js<br/>- JavaScript Runtime<br/>- Event-driven<br/>- Non-blocking I/O]
        end
        
        subgraph "Web Framework"
            EXPRESS[Express.js<br/>- RESTful APIs<br/>- Middleware<br/>- Route Management]
        end
        
        subgraph "AI Integration"
            MISTRAL_SDK[Mistral SDK<br/>- API Client<br/>- Model Access<br/>- Response Handling]
        end
        
        subgraph "Database"
            SQLITE[SQLite<br/>- Local Storage<br/>- File-based<br/>- Zero Configuration]
        end
    end
    
    subgraph "AI/LLM Technologies"
        subgraph "Mistral AI"
            MISTRAL_API[Mistral API<br/>- Cloud-based<br/>- RESTful<br/>- Authentication]
            CODESTRAL_MODEL[Codestral Model<br/>- Code Analysis<br/>- Issue Detection<br/>- Fix Generation]
        end
        
        subgraph "Prompt Engineering"
            PROMPT_ENG[Prompt Templates<br/>- Structured Input<br/>- Context Injection<br/>- Output Formatting]
        end
    end
    
    subgraph "Development Tools"
        subgraph "Version Control"
            GIT[Git<br/>- Source Control<br/>- Collaboration<br/>- History Tracking]
        end
        
        subgraph "Package Management"
            NPM[NPM<br/>- Dependency Management<br/>- Script Execution<br/>- Publishing]
        end
        
        subgraph "Development Environment"
            VSCODE[VS Code<br/>- IDE<br/>- Extensions<br/>- Debugging]
        end
    end
    
    %% Technology connections
    ELECTRON --> REACT
    REACT --> TYPESCRIPT
    REACT --> TAILWIND
    REACT --> RADIX
    VITE --> REACT
    ESLINT --> TYPESCRIPT
    
    NODEJS --> EXPRESS
    EXPRESS --> MISTRAL_SDK
    EXPRESS --> SQLITE
    
    MISTRAL_SDK --> MISTRAL_API
    MISTRAL_API --> CODESTRAL_MODEL
    CODESTRAL_MODEL --> PROMPT_ENG
    
    GIT --> NPM
    NPM --> VSCODE
    
    %% Styling
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef ai fill:#fff8e1,stroke:#f57c00,stroke-width:3px
    classDef tools fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class ELECTRON,REACT,TYPESCRIPT,TAILWIND,RADIX,VITE,ESLINT frontend
    class NODEJS,EXPRESS,MISTRAL_SDK,SQLITE backend
    class MISTRAL_API,CODESTRAL_MODEL,PROMPT_ENG ai
    class GIT,NPM,VSCODE tools
```

## Usage Instructions

These Mermaid diagrams can be used in:

1. **GitHub README**: Embed directly in markdown files
2. **Documentation**: Technical documentation and architecture guides
3. **Presentations**: Convert to images for PowerPoint presentations
4. **Development**: Team understanding and onboarding

### Key Features Highlighted:

- **Frontend (Electron + React)**: Desktop application with modern UI
- **Backend (Node.js + Express)**: API server with file system integration
- **AI/LLM (Mistral + Codestral)**: Advanced code analysis and issue detection
- **Data Flow**: Complete request-response cycle with AI processing
- **Technology Stack**: Comprehensive view of all technologies used

The diagrams emphasize the **LLM technologies** (Mistral AI, Codestral model) with special highlighting and show how they integrate with both frontend and backend components. 