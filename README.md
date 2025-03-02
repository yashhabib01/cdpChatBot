# CDP Support Assistant Chatbot

A specialized chatbot designed to provide instant, accurate responses to questions about various Customer Data Platforms (CDPs) including Segment, mParticle, Lytics, and Zeotap. The chatbot leverages documentation from these platforms to provide accurate, context-aware responses.

## Live Demo

- Frontend: [https://cdp-chat-bot-nj68.vercel.app/](https://cdp-chat-bot-nj68.vercel.app/)
- Backend API: [https://cdp-chat-bot-sigma.vercel.app/](https://cdp-chat-bot-sigma.vercel.app/)

## Tech Stack

### Frontend

- React.js
- Material-UI (MUI)
- Vite
- Axios

### Backend

- Node.js
- Express.js
- Google's Gemini AI API (For structuring the document fetch data)
- Cheerio (for web scraping)
- Axios

## Approach & Architecture

### 1. Documentation Fetching

- Implements a `DocumentationFetcher` class that crawls CDP documentation websites
- Uses Cheerio for HTML parsing and content extraction
- Creates four platform-specific JSON files in the `backend/data` directory:
  - `segment.json`
  - `mparticle.json`
  - `lytics.json`
  - `zeotap.json`
- Each JSON file contains structured data including:
  - Headings (H1-H4)
  - Paragraphs
  - Lists (ordered and unordered)
  - Code blocks
  - Tables
- Data structure for each platform includes:
  - Platform name
  - Base URL
  - Total pages crawled
  - Last updated timestamp
  - Array of page content with URLs and extracted data

The data fetching process respects rate limits and URL limits per platform (default: 300 URLs per platform) to ensure responsible crawling of documentation websites.

### 2. Document Indexing & Search

The system uses several strategies for matching queries to relevant documentation:

#### Content Processing

- **Stop Words Removal**: Filters out common words like "how", "what", "is", "the", etc.
- **URL Matching**: Gives higher weight to matches in URLs
- **Title Matching**: Prioritizes matches in document titles
- **Heading Matching**: Special consideration for matches in section headers
- **Content Scoring**: Implements a weighted scoring system for different content types

#### Search Strategy

- URL matching (3 points)
- Title matching (3 points)
- Heading matching (2 points)
- Paragraph content matching (1 point)
- List content matching (1 point)

### 3. Response Generation

Uses Google's Gemini AI to generate natural, contextual responses based on:

- User query
- Matched documentation content
- Platform-specific context

## Environment Setup

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env file
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Add your VITE_API_BASE_URL to .env file
```

### Running the Application

#### Backend

```bash
cd backend
npm run dev     # Development mode
npm start       # Production mode
```

#### Fetch New Documentation Data

```bash
cd backend
npm run fetch   # Fetches fresh documentation from all CDP platforms
                # Creates/updates JSON files in backend/data directory:
                # - segment.json
                # - mparticle.json
                # - lytics.json
                # - zeotap.json
```

#### Frontend

```bash
cd frontend
npm run dev     # Development mode
npm run build   # Production build
```

## API Example

### Chat Endpoint

`POST /api/chat`

Request:

```json
{
  "query": "How do I track events in Segment?"
}
```

Response:

````json
{
  "query": "How do I track events in Segment?",
  "classification": {
    "isCdpRelated": true,
    "isHowTo": true,
    "cdpPlatform": "segment",
    "docUrl": "https://segment.com/docs/"
  },
  "response": "To track events in Segment, you can use the analytics.track() method. Here's how:\n\n```javascript\nanalytics.track('Event Name', {\n  property1: 'value1',\n  property2: 'value2'\n});\n```\n\nKey steps:\n1. Initialize the Segment analytics.js library\n2. Call track() with your event name\n3. Add relevant properties as an object\n\nThe event will be sent to all your configured destinations automatically."
}
````

## License

MIT
