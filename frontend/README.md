# Contract Management SaaS - Frontend

A modern React frontend for the Contract Management SaaS platform with AI-powered document processing and natural language querying.

## Features

- **Modern UI/UX**: Built with React and Tailwind CSS for a professional SaaS experience
- **Authentication**: JWT-based login/signup with persistent sessions
- **Dashboard**: Comprehensive overview with contract statistics and quick actions
- **File Upload**: Drag & drop interface with progress tracking and validation
- **Contract Management**: Table view with search, filtering, and pagination
- **Contract Details**: Detailed view with AI insights, clauses, and metadata
- **AI Query Interface**: Natural language search across all contracts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error states and user feedback

## Tech Stack

- **Framework**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM for SPA navigation
- **HTTP Client**: Axios with interceptors for API communication
- **Icons**: Heroicons for consistent iconography
- **Notifications**: React Hot Toast for user feedback
- **File Upload**: React Dropzone for drag & drop functionality
- **Date Handling**: date-fns for date formatting

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main app component with routing
│   ├── index.js               # React app entry point
│   ├── index.css              # Global styles and Tailwind imports
│   ├── components/
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── Sidebar.jsx        # Left sidebar navigation
│   │   ├── UploadBox.jsx      # File upload component
│   │   └── Table.jsx          # Reusable data table component
│   ├── pages/
│   │   ├── Login.jsx          # Authentication page
│   │   ├── Dashboard.jsx      # Main dashboard view
│   │   ├── ContractDetail.jsx # Contract detail page
│   │   ├── Upload.jsx         # File upload page
│   │   └── Query.jsx          # AI query interface
│   └── utils/
│       ├── api.js             # Axios configuration and API calls
│       └── auth.js            # Authentication context and helpers
├── public/
│   └── index.html             # HTML template
├── tailwind.config.js         # Tailwind CSS configuration
├── package.json               # Dependencies and scripts
└── README.md
```

## Component Architecture

### Core Components

- **App.jsx**: Main application with routing, authentication, and layout
- **Navbar.jsx**: Top navigation with user menu and notifications
- **Sidebar.jsx**: Left navigation with menu items and upgrade prompt
- **Table.jsx**: Reusable data table with sorting, filtering, and pagination
- **UploadBox.jsx**: File upload with drag & drop, progress, and validation

### Pages

- **Login.jsx**: Authentication with login/signup toggle
- **Dashboard.jsx**: Overview with stats, quick actions, and contract table
- **ContractDetail.jsx**: Detailed contract view with tabs for different sections
- **Upload.jsx**: File upload interface with metadata input
- **Query.jsx**: AI-powered natural language search interface

### Utilities

- **api.js**: Centralized API communication with error handling
- **auth.js**: Authentication context with JWT token management

## Design System

### Colors
- **Primary**: Blue (#3b82f6) for main actions and branding
- **Success**: Green (#22c55e) for positive states
- **Warning**: Yellow (#f59e0b) for attention states
- **Danger**: Red (#ef4444) for errors and destructive actions

### Typography
- **Font**: Inter for clean, professional appearance
- **Hierarchy**: Clear heading levels with consistent spacing

### Components
- **Cards**: Consistent shadow and border radius
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Consistent input styling with focus states
- **Status Badges**: Color-coded for different states

## API Integration

### Authentication
- Login/signup with JWT tokens
- Automatic token refresh and logout on expiry
- Protected routes with authentication checks

### Contract Management
- CRUD operations for contracts
- File upload with progress tracking
- Pagination and filtering

### AI Features
- Natural language query processing
- Contract analysis and insights
- Semantic search results

## State Management

- **React Context**: For authentication state
- **Local State**: Component-level state with hooks
- **Local Storage**: For token persistence

## Error Handling

- **API Errors**: Centralized error handling with toast notifications
- **Form Validation**: Client-side validation with user feedback
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messages and call-to-actions

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Make sure backend is running on http://localhost:8000

### Build for Production

```bash
# Create production build
npm run build

# The build folder contains optimized static files
# Deploy to Netlify, Vercel, or any static hosting
```

## Deployment

### Netlify (Recommended)

1. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Environment variables**
   ```
   REACT_APP_API_URL=https://your-backend-api.com
   ```

3. **Deploy**
   - Connect GitHub repository
   - Auto-deploy on push to main branch

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## Features in Detail

### Dashboard
- Contract statistics with visual indicators
- Quick action cards for common tasks
- Recent contracts table with search and filters
- Activity timeline showing recent uploads

### File Upload
- Drag & drop interface with visual feedback
- File type validation (PDF, TXT, DOCX)
- Progress tracking during upload
- Metadata input for contract information
- Error handling and retry functionality

### Contract Detail
- Tabbed interface for different views
- AI-generated insights and risk assessment
- Key clauses extraction with confidence scores
- Evidence drawer for detailed clause analysis
- Document chunks view for debugging

### AI Query
- Natural language input with suggestions
- Real-time search across all contracts
- Relevance scoring for results
- Query history for quick access
- Supporting evidence with source links

### Authentication
- Clean login/signup interface
- Password visibility toggle
- Demo credentials for testing
- Persistent sessions with auto-logout
- User profile management

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: API response caching where appropriate
- **Debouncing**: Search input debouncing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.
