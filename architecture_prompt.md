# System Architecture Diagram Prompt

Here is the final, detailed prompt to generate the "StackLoad" system architecture diagram. You can copy and paste this directly into your AI image generator (e.g., NanoBanana, Midjourney, DALL-E 3).

---

## 🎨 Design & Style Guidelines

**Role**: You are an expert Software Architect and Technical Illustrator.
**Goal**: Create a high-level, professional system architecture diagram for "StackLoad", a modern developer growth platform.

**Visual Style**:
-   **Aesthetic**: Modern, "SAAS Dashboard" style. Flat design with slight depth (isometric or 2.5D).
-   **Background**: Clean, light background (off-white or very light gray) to make components pop.
-   **Layout**: Organized left-to-right or center-out.
-   **Color Palette**:
    -   **Frontend (Client)**: Deep Blue / Indigo (Next.js brand).
    -   **Backend (AI)**: Vibrant Orange / Yellow (Python/FastAPI).
    -   **Services (Google/LiveKit)**: distinct brand colors (Green/Blue gradient for Gemini, Black/Pink for LiveKit).
    -   **Database**: Emerald Green (Supabase).
-   **Connectors**:
    -   **Solid Lines**: HTTP/Database requests.
    -   **Glowing/Dotted Lines**: Real-time WebSockets / Audio Streams.

---

## 🏗️ System Components & Architecture

Please organize the diagram into these **4 distinct zones**:

### 1. Client Layer (Web Frontend)
*   **Visual Container**: A Web Browser window or a large rounded rectangle labeled "User Client".
*   **Core Icon**: **Next.js 15 (App Router)** logo (Black 'N').
*   **Sub-Modules**:
    *   **LiveKit Client** (Real-time Audio/Video)
    *   **Live2D** (Avatar Rendering)
    *   **Three.js** (3D Visuals)
    *   **Supabase Auth** (Authentication)

### 2. Backend Layer (AI Agent Server)
*   **Visual Container**: A server block or cloud container labeled "AI Agent Server (Python)".
*   **Core Icons**: **FastAPI** (Teal/Green) & **LiveKit Agents** (Pink/Black).
*   **Core Logic**: "Interviewer Persona Agent" (Gear icon).
*   **Connections**:
    *   **<---> LiveKit Server** (WebSocket)
    *   **<---> Gemini API** (Native Audio Stream)
    *   **<---> Supabase Vector** (RAG Retrieval - *Critical*)

### 3. Data Pipeline Layer (Crawler Service)
*   **Visual Container**: A separate background worker block labeled "Data Crawler".
*   **Components**: "**Job Scraper**" & "**Blog Scraper**".
*   **Flow**:
    *   Fetches data from web.
    *   Sends text to **Gemini** for summary/tagging.
    *   Saves processed data to **Supabase**.

### 4. Infrastructure Layer (Central Hub)
*   **Visual Container**: A large database/cloud zone labeled "Infrastructure".
*   **Core Icon**: **Supabase** (Green Bolt).
*   **Sub-Services**:
    *   **Postgres DB** (Primary Storage)
    *   **Vector Store** (For RAG)
    *   **Realtime** (Event Subscriptions)
*   **Media Server**: **LiveKit Server** (Standalone block handling media routing).

---

## 🔄 Data Flow Description (Arrows)

Draw clear directional arrows to show how data moves:

1.  **User <-> Client**: Interactive UI.
2.  **Client <-> LiveKit Server**: **[Real-time]** Audio/Video Media Stream.
3.  **LiveKit Server <-> AI Backend**: **[Real-time]** Forwarding Audio Stream.
4.  **AI Backend <-> Gemini API**: **[Real-time]** Bidirectional "Native Audio" Stream.
5.  **AI Backend <-> Supabase Vector**: **[Database]** RAG Context Retrieval (Resume/JD data).
6.  **Client -> Supabase**: **[HTTP]** Fetch Blog/Job Data.
7.  **Crawler -> Gemini API**: **[API]** Text Summarization Request.
8.  **Crawler -> Supabase**: **[Database]** Insert processed data.

---

**Summary Instruction**:
"Generate a technical diagram showing the user connecting to a **Next.js Client**. The client speaks to **LiveKit** (for media) and **Supabase** (for data). The **LiveKit Server** acts as a bridge to the **Python AI Backend**, which uses **Gemini 2.5** for voice and **Supabase Vector** for memory (RAG). Simultaneously, a **Python Crawler** pipelines data into **Supabase** using **Gemini** for processing. Use official logos and distinguish between real-time (glowing) and static (solid) connections."
