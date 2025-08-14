# **PixeLens**  
*Enhancing UI/UX Debugging with Memory-Efficient RAG and LLM Integration*

---
## **Architecture**
Functionality Diagram
![Overview](assets/func_diagram.png)

LLM Architecture
![Arch](assets/LLM-architecture.png)


## **Performance Highlights**
| **Metric** | **Result** |
|--------|--------|
| CodeBERT Similarity | 97.36% |
| RAG Retrieval Precision (Top-5) | 89.98% |
| LLM-as-a-Judge Score | 7.86 / 10 |
| User Satisfaction | 8.3 / 10 |

---

## **Project Setup**

### **1. Clone the Repository**
```bash
git clone https://github.com/br34dcrumb/PixeLens.git
cd pixelens
```

### **2. Setup Python Virtual Environment**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### **3. Install NodeJS environment**
```bash
pip install -r requirements.txt
nodeenv -p --node=22.13.0
```

### **4. Run the frontend**
```bash
cd frontend/
npm run dev
```

### **5. Start the backend (another terminal session)**
```bash
cd backend/
npm run start
```