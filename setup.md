# Setup Guide

## Quick Start

1. **Install Dependencies** ✅
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/link-saver
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If you don't have MongoDB installed:
   
   **Option A: Install MongoDB locally**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start the MongoDB service
   
   **Option B: Use MongoDB Atlas (Cloud)**
   - Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string and update `MONGODB_URI`

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the Application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application

1. **Create an Account**
   - Click "Sign up" on the landing page
   - Enter your email and password
   - Click "Create Account"

2. **Add Your First Bookmark**
   - Enter a URL (e.g., `https://en.wikipedia.org/wiki/Artificial_intelligence`)
   - Optionally add tags like "AI", "Technology"
   - Click "Add Bookmark"
   - The system will automatically:
     - Extract the page title and favicon
     - Generate an AI summary using Jina AI
     - Save the bookmark

3. **Explore Features**
   - View your bookmarks in the grid layout
   - Filter by tags using the tag buttons
   - Toggle dark mode with the moon/sun icon
   - Click "Show Summary" to view AI-generated summaries
   - Delete bookmarks with the trash icon
   - Open original links with the external link icon

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env.local`
   - For Atlas, make sure your IP is whitelisted

2. **Jina AI Summary Generation Fails**
   - The service has a rate limit of ~60 calls/hour per IP
   - Wait a while and try again
   - Check the browser console for error details

3. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Restart your development server

4. **Port Already in Use**
   - Change the port: `npm run dev -- -p 3001`
   - Or kill the process using port 3000

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/link-saver` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-jwt-key` |

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
├── contexts/              # React contexts
├── lib/                   # Utility functions
├── package.json           # Dependencies
└── README.md              # Documentation
```

### Key Features Implemented

✅ **Authentication**
- Email/password registration and login
- bcrypt password hashing
- JWT token-based authentication
- Secure session management

✅ **Bookmark Management**
- Save URLs with automatic metadata extraction
- Title and favicon extraction using Cheerio
- Tag system for organization
- Delete bookmarks functionality

✅ **AI Integration**
- Automatic summary generation using Jina AI
- Error handling for API failures
- Rate limit awareness

✅ **UI/UX**
- Modern, responsive design with Tailwind CSS
- Dark mode toggle
- Loading states and error handling
- Toast notifications for user feedback

✅ **Technical Excellence**
- TypeScript for type safety
- Proper error handling throughout
- Secure authentication
- MongoDB with connection pooling
- Next.js 14 with app router

## Next Steps

1. **Deploy to Production**
   - Set up environment variables on your hosting platform
   - Configure MongoDB Atlas for production
   - Deploy to Vercel, Netlify, or your preferred platform

2. **Add More Features**
   - Google OAuth integration
   - Drag-and-drop reordering
   - Export functionality
   - Advanced search

3. **Enhance Security**
   - Add rate limiting
   - Implement CSRF protection
   - Add input sanitization

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check the network tab for API failures 