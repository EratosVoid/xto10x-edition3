# LocalVoice - Neighborhood Community Platform

LocalVoice is a neighborhood-focused platform that enables communities to organize, discuss, vote, and create positive change locally.

## Features

- **User Authentication**: Secure login using NextAuth.js with JWT
- **Locality-Based Content**: All content filtered by user's neighborhood
- **Real-time Updates**: Using Socket.io for instant notifications
- **Community Tools**:
  - Events planning and management
  - Polls and voting
  - Petitions
  - Discussions
  - Resource sharing
- **AI Integration**: Post summarization using Google's Gemini API
- **Gamification**: Points system for community contributions

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MongoDB account (we're using MongoDB Atlas)

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd localvoice
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   MONGODB_URI=mongodb+srv://test:2q1oOhqgEyctMSir@cluster0.hajz5ka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   GEMINI_API_KEY=AIzaSyCjBAPDM5-55Vg8TvvUsVkk-ZkdVFepkn0
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable UI components
- `/features` - Feature-based code organization
- `/lib` - Utilities and libraries
- `/models` - Mongoose schema definitions
- `/types` - TypeScript type definitions

## API Routes

- **Authentication**: `/api/auth/[...nextauth]`
- **Users**: `/api/user/*`
- **Posts**: `/api/post/*`
- **Events**: `/api/event/*`
- **Polls**: `/api/poll/*`
- **Petitions**: `/api/petition/*`
- **Discussions**: `/api/discussion/*`
- **Socket**: `/api/socket`

## Future Enhancements

- Nested discussions and comment threads
- Advanced AI-powered stored FAQ with vector search
- Split MongoDB collections by locality for better scaling
- Enhanced analytics and impact visualization
- Mobile app using React Native

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Next.js Team for the amazing framework
- MongoDB for the database platform
- The community for inspiration and feedback
# xto10x-edition3
