# LokNiti - Neighborhood Community Platform

LokNiti is a neighborhood-focused platform that enables communities to organize, discuss, vote, and create positive change locally.

## Live Demo

**Deployment URL:** [https://localvoice-three.vercel.app](https://localvoice-three.vercel.app)

## Project Demo Video

**Watch the Demo:** [LokNiti Platform Demonstration](https://youtu.be/te30iGywT40)

Check out our video walkthrough to see LokNiti in action and get a better understanding of the platform's features and functionality.

## Project Documentation

**Project Report:** [View Detailed Project Report](https://misty-seashore-84e.notion.site/Project-Report-1d3682e8fb8b8042af12cf55bbd04825)

The comprehensive project report includes detailed information about the design, architecture, implementation approaches, and future directions for LokNiti.

## Features

- **User Authentication**: Secure login using NextAuth.js with JWT
  - Multiple authentication methods: email/password, voter ID
  - Session persistence and security
  - Role-based authorization ( Planned )
- **Locality-Based Content**: All content filtered by user's neighborhood
  - Geospatial data organization
  - Community-specific feeds
  - Location-based filtering
- **Real-time Updates**: Using Socket.io for instant notifications
  - Live polling updates
  - Notification system
  - Real-time discussion updates
- **Community Tools**:
  - **Events**: Create, manage, and RSVP to local events with calendar integration
  - **Polls**: Create polls with multiple options and real-time vote tracking
  - **Petitions**: Start petitions with signature goals and progress tracking
  - **Discussions**: Threaded conversations with moderation tools
  - **Announcements**: Official community updates with priority settings
  - **Resource sharing**: Share documents and links relevant to the community
- **AI Integration**:
  - Post summarization using Google's Gemini API
  - Smart content recommendations
  - Automated community insights
  - Visual data representation
- **Gamification**:
  - Points system for community contributions
  - Achievement badges for participation
  - Community leaderboard

## Technical Architecture

### Frontend

- **Next.js App Router**: For client and server components
- **TypeScript**: For type safety and developer experience
- **TailwindCSS**: For responsive styling
- **@heroui Components**: Custom UI component library

### Backend

- **Next.js API Routes**: Serverless functions for API endpoints
- **MongoDB with Mongoose**:
  - Schemas for structured data
  - Indexes for performance optimization
  - Map types for dynamic data structures
- **NextAuth.js**: For authentication and session management
- **Socket.io**: For real-time bidirectional communication (Planned)
- **API middleware**: For request validation and authorization

### AI Features

- **Google Gemini API Integration**:
  - Smart content summarization
  - Community trend analysis
  - Post impact prediction
  - Data visualization suggestions

### Deployment

- **Vercel**: For hosting and serverless functions
- **MongoDB Atlas**: Cloud database
- **Environment Variable Management**: For secure configuration

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
   MONGODB_URI=your-mongodb-uri
   GEMINI_API_KEY=your-gemini-api-key
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
  - `/api` - Backend API endpoints
  - `/[routeName]` - Frontend page routes
- `/components` - Reusable UI components
  - `/ui` - Basic UI elements
  - `/layout` - Layout components
  - `/feature` - Feature-specific components
- `/lib` - Utilities and libraries
  - `/db` - Database connection utilities
  - `/ai` - AI integration helpers
  - `/utils` - Helper functions
- `/models` - Mongoose schema definitions
  - Schema validation
  - Virtual properties
  - Complex relationships
- `/types` - TypeScript type definitions
- `/public` - Static assets

## API Routes Documentation

### Authentication

- **POST /api/auth/[...nextauth]**: NextAuth.js authentication endpoints
  - Handles login, logout, session management

### Users

- **GET /api/users/:id**: Get user profile
- **PATCH /api/users/:id**: Update user profile
- **GET /api/users/me**: Get current authenticated user

### Posts

- **GET /api/posts**: Get all posts (with filters)
- **POST /api/posts**: Create a new post
- **GET /api/posts/:id**: Get specific post
- **PUT /api/posts/:id**: Update a post
- **DELETE /api/posts/:id**: Delete a post

### Polls

- **GET /api/polls**: Get all polls
- **POST /api/polls**: Create a new poll
- **GET /api/polls/:id**: Get specific poll
- **POST /api/polls/:id/vote**: Vote on a poll
- **DELETE /api/polls/:id/vote**: Remove vote from a poll

### Events

- **GET /api/events**: Get all events
- **POST /api/events**: Create a new event
- **GET /api/events/:id**: Get specific event
- **PUT /api/events/:id**: Update an event
- **POST /api/events/:id/attend**: Register attendance

### Petitions

- **GET /api/petitions**: Get all petitions
- **POST /api/petitions**: Create a new petition
- **GET /api/petitions/:id**: Get specific petition
- **POST /api/petitions/:id/sign**: Sign a petition

### AI Features

- **POST /api/ai/summarize**: Summarize content
- **POST /api/ai/ask**: Ask the AI assistant
- **POST /api/ai/visualize**: Generate visualization data

## Implementation Notes

### Polling System

The polling system uses MongoDB Map type to store voting options and counts. Votes are tracked per user to prevent duplicate voting, with real-time updates via SWR revalidation.

### Locality Filtering

All content is automatically filtered by the user's locality, ensuring relevant community information. This is implemented through MongoDB queries with locality as a filter parameter.

### Real-time Updates

Socket.io provides real-time updates for new content, votes, and notifications without requiring page refreshes.

## Future Enhancements

- Nested discussions and comment threads
- Advanced AI-powered stored FAQ with vector search
- Split MongoDB collections by locality for better scaling
- Enhanced analytics and impact visualization
- Mobile app using React Native
- Webhooks for external integrations
- GraphQL API option for more efficient data fetching

## Contributing

We welcome contributions! Please read our contributing guidelines to get started.

## Acknowledgements

- Next.js Team for the amazing framework
- MongoDB for the database platform
- The community for inspiration and feedback

# xto10x-edition3
