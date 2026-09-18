# DevQ

DevQ is an AI-powered study companion that turns learning material into an active revision experience. Upload a document, let DevQ understand its content, and use the generated summaries, flashcards, quizzes, and AI chat to study with more focus and less manual preparation.

## What DevQ Does

DevQ brings the main parts of a study workflow into one place:

- **Secure accounts**: Register, log in, manage your profile, and change your password.
- **Document workspace**: Upload study documents, view their details, update metadata, and remove documents when they are no longer needed.
- **AI study generation**: Generate concise summaries, revision flashcards, and quizzes from document content.
- **Interactive flashcards**: Review cards, track review progress, and star important cards for later revision.
- **Practice quizzes**: Take generated quizzes, submit answers, and view results.
- **AI learning assistant**: Ask questions about a document, request explanations, and keep chat history for continued study.
- **Progress dashboard**: See learning activity and revision progress from one dashboard.

The goal is simple: DevQ helps students move from passively reading material to actively understanding, recalling, and testing their knowledge.

## How It Works

1. Create an account and sign in.
2. Upload a study document.
3. Open the document workspace and generate a summary, flashcards, or quiz.
4. Review the generated content and ask the AI assistant about difficult concepts.
5. Practice with quizzes and flashcards while tracking progress.

## Technology

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- React Markdown
- Lucide React

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Google Gemini API
- Cloudinary file storage
- Multer and PDF parsing for document uploads

## Project Structure

```text
DevQ/
├── Backend/
│   ├── config/          Database, Cloudinary, and upload configuration
│   ├── controllers/     Request and business logic
│   ├── middleware/      Authentication and error handling
│   ├── models/          MongoDB models
│   ├── routes/          API routes
│   ├── utils/           AI, PDF, chunking, and upload helpers
│   └── server.js        Express server entrypoint
└── Frontend/
	└── src/
		├── components/  Reusable UI components
		├── context/     Authentication state
		├── pages/       Application screens
		├── services/    API service modules
		└── utils/       Axios and API path configuration
```

## Run Locally

### 1. Start the backend

```bash
cd Backend
npm install
npm run dev
```

The API runs on `http://localhost:8000` by default.

### 2. Configure backend variables

Create `Backend/.env` using `Backend/.env.example`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8000
JWT_EXPIRE=7d
JWT_SECRET=your_long_random_secret
NODE_ENV=development
MAX_FILE_SIZE=10485760
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Start the frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on the Vite development URL, usually `http://localhost:5173`.

To point the frontend at a different API, create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Production Deployment

Deploy the frontend and backend as separate services.

### Backend service

- **Root directory:** `Backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Required variables:** `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, Cloudinary variables, `NODE_ENV`, and `PORT`

### Frontend service

- **Root directory:** `Frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variable:**

```env
VITE_API_URL=https://devq-kr18.onrender.com
```

Vite injects `VITE_API_URL` during the build, so redeploy the frontend whenever this value changes. The deployed frontend will then call endpoints such as:

```text
https://devq-kr18.onrender.com/api/auth/login
```

## Available Scripts

### Frontend

```bash
npm run dev      # Start the development server
npm run build    # Create the production build
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

### Backend

```bash
npm start        # Start the production server
npm run dev      # Start the server with Nodemon
```

## Security Notes

- Never commit `.env` files or API keys.
- Store production secrets in the hosting provider's environment settings.
- Rotate any credentials that have been exposed publicly or shared in screenshots, chat, or source control.
- Use a strong, unique `JWT_SECRET` in production.

## Current Status

The frontend production build completes successfully with Vite, and the backend is ready to run as a Node.js service. Production functionality depends on correctly configured MongoDB, Gemini, Cloudinary, CORS, and frontend API environment variables.