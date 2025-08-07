# Link Saver + Auto-Summary

A full-stack web application for saving bookmarks with automatic AI-generated summaries using the Jina AI endpoint.

## Features

### Core Functionality
- **Authentication**: Email/password signup & login with bcrypt password hashing
- **Bookmark Management**: Save URLs with automatic title and favicon extraction
- **AI Summaries**: Automatic summary generation using Jina AI endpoint
- **Tag System**: Organize bookmarks with custom tags
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API routes
- **Database**: MongoDB with proper connection management
- **Authentication**: JWT-based authentication with secure token storage
- **UI/UX**: Modern design with Tailwind CSS and Lucide React icons
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: MongoDB
- **Authentication**: bcryptjs, jsonwebtoken
- **HTTP Client**: Axios
- **HTML Parsing**: Cheerio
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd link-saver-auto-summary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/link-saver
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # NextAuth (optional)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use a cloud instance like MongoDB Atlas.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Authentication
1. Create a new account with your email and password
2. Log in with your credentials
3. Your session will be maintained using JWT tokens

### Adding Bookmarks
1. Enter a URL in the "Add New Bookmark" form
2. Optionally add tags to organize your bookmarks
3. Click "Add Bookmark" to save
4. The system will automatically:
   - Extract the page title and favicon
   - Generate an AI summary using Jina AI
   - Save the bookmark to your account

### Managing Bookmarks
- **View**: All bookmarks are displayed in a responsive grid
- **Filter**: Use the tag filter to show specific bookmarks
- **Delete**: Click the trash icon to remove bookmarks
- **Open**: Click the external link icon to visit the original page
- **Summary**: Click "Show Summary" to view the AI-generated summary

### Dark Mode
- Toggle between light and dark themes using the moon/sun icon
- Your preference is saved in localStorage

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Bookmarks
- `GET /api/bookmarks` - Get user's bookmarks (with optional tag filter)
- `POST /api/bookmarks` - Create new bookmark
- `PUT /api/bookmarks/[id]` - Update bookmark tags
- `DELETE /api/bookmarks/[id]` - Delete bookmark

## Jina AI Integration

The application uses the Jina AI endpoint for automatic summary generation:

```javascript
const target = encodeURIComponent('https://example.com');
const response = await fetch(`https://r.jina.ai/http://${target}`);
const summary = await response.text();
```

**Features:**
- No API key required
- CORS enabled
- ~60 calls/hour per IP limit
- Graceful error handling

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String (optional),
  createdAt: Date
}
```

### Bookmarks Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  url: String,
  title: String,
  favicon: String (optional),
  summary: String (optional),
  tags: Array<String>,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Protection**: Proper CORS configuration
- **Error Handling**: Secure error messages without exposing internals

## Performance Optimizations

- **Connection Pooling**: Efficient MongoDB connection management
- **Lazy Loading**: Components load only when needed
- **Optimized Queries**: Indexed database queries
- **Caching**: Client-side caching of user preferences



## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `NEXTAUTH_URL` | NextAuth.js URL | No |
| `NEXTAUTH_SECRET` | NextAuth.js secret | No |



## Roadmap

- [ ] Google OAuth integration
- [ ] Drag-and-drop bookmark reordering
- [ ] Export bookmarks functionality
- [ ] Advanced search and filtering
- [ ] Bookmark sharing
- [ ] Mobile app version 
