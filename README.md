# Team Task Manager

A comprehensive full-stack web application for team project and task management with advanced role-based access control, automated workflows, and real-time collaboration features.

## 🚀 Features

### Core Functionality
- **Authentication**: Secure user registration and login with JWT tokens
- **Project Management**: Create, edit, and delete projects with member management
- **Task Management**: Create, assign, and track tasks with status and priority levels
- **Role-Based Access Control**: Admin and Member roles with granular permissions
- **Dashboard**: Comprehensive overview of tasks, projects, and overdue items
- **Real-time Updates**: Live status tracking and notifications

### Advanced Features
- **Automatic Project Member Management**: When tasks are assigned, users are automatically added as project members
- **Smart Member Removal**: When users have no tasks in a project, they're automatically removed from project membership
- **Admin User Management**: Complete user administration with project membership visibility
- **Project Membership Display**: Admin can view which projects each user belongs to with their roles
- **Enhanced Task Creation**: Full task details including title, description, assignee, priority, status, and due date
- **Modal-Based UI**: Modern modal interfaces for project editing and task creation
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Task Features
- **Task Status Tracking**: Todo, In Progress, Completed, Overdue
- **Priority Levels**: Low, Medium, High, Urgent
- **Due Date Management**: Track and display overdue tasks
- **Personal Task Views**: "My Tasks" and "Overdue Tasks" filtering
- **Project-Based Organization**: Tasks organized by projects with member access

### User Management
- **Admin Dashboard**: Complete user administration interface
- **Project Membership Tracking**: Visual display of user project affiliations
- **Role Management**: Assign and manage user roles (Admin/Member)
- **User Activity Monitoring**: Track user engagement across projects

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Robust SQL database
- **SQLAlchemy**: Python ORM for database operations
- **JWT**: Secure authentication tokens
- **Alembic**: Database migrations

### Frontend
- **React**: Modern JavaScript library for UI
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icons
- **React Hook Form**: Form management

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** 
- **PostgreSQL 14+** (or use Railway for hosted database)
- **Git** for version control
- **Railway account** (optional, for deployment)

## 🚀 Quick Start

### One-Command Setup (Recommended)

For Windows users, use the provided setup script:
```bash
setup.bat
```

For Mac/Linux users, use:
```bash
chmod +x setup.sh
./setup.sh
```

This script will automatically:
- Set up Python virtual environment
- Install backend dependencies
- Install frontend dependencies  
- Set up environment variables
- Run database migrations
- Start both servers

## 🛠️ Manual Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   
   # Mac/Linux:
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Create .env file from template
   cp .env.example .env
   
   # Edit .env with your configuration:
   # DATABASE_URL=postgresql://username:password@localhost/dbname
   # SECRET_KEY=your-secret-key-here
   # ALGORITHM=HS256
   # ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. Initialize database:
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Database Setup Options

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database
createdb team_task_manager
# Update DATABASE_URL in .env
```

**Option 2: Railway (Recommended for beginners)**
1. Create Railway account
2. Add PostgreSQL service
3. Copy DATABASE_URL from Railway dashboard
4. Add to .env file

### Verification

After setup, verify everything is working:
1. Backend: Visit `http://localhost:8000/docs` for API documentation
2. Frontend: Visit `http://localhost:3000` for the application
3. Test registration and login functionality

## 🌐 Deployment on Railway

### Backend Deployment

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: Random secret key for JWT
   - `ALGORITHM`: HS256
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: 30

5. Deploy the backend

### Frontend Deployment

1. Create another service in the same Railway project
2. Set the root directory to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL`: Your backend Railway URL

4. Deploy the frontend

### Database Setup on Railway

1. Add a PostgreSQL service to your Railway project
2. Connect it to your backend service
3. Railway will automatically provide the `DATABASE_URL`

## 📊 API Documentation

Once backend is running, visit `http://localhost:8000/docs` for interactive API documentation with Swagger UI.

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user (returns user data)
- `POST /api/v1/auth/login` - Login user (returns JWT token)

### User Management Endpoints
- `GET /api/v1/users/me` - Get current authenticated user info
- `GET /api/v1/users` - List all users (Admin only)
- `GET /api/v1/users/{id}` - Get specific user details
- `PUT /api/v1/users/{id}` - Update user information
- `DELETE /api/v1/users/{id}` - Delete user (Admin only)
- `GET /api/v1/users/{id}/projects` - Get all projects a user belongs to (Admin only)

### Project Endpoints
- `GET /api/v1/projects` - List all projects (user has access to)
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/{id}` - Get specific project details
- `PUT /api/v1/projects/{id}` - Update project information
- `DELETE /api/v1/projects/{id}` - Delete project
- `GET /api/v1/projects/{id}/members` - List project members
- `POST /api/v1/projects/{id}/members/{userId}` - Add member to project
- `DELETE /api/v1/projects/{id}/members/{userId}` - Remove member from project

### Task Endpoints
- `GET /api/v1/tasks` - List all tasks (user has access to)
- `POST /api/v1/tasks` - Create new task (auto-adds assignee to project)
- `GET /api/v1/tasks/{id}` - Get specific task details
- `PUT /api/v1/tasks/{id}` - Update task (handles member management)
- `DELETE /api/v1/tasks/{id}` - Delete task (auto-removes users if no tasks left)
- `GET /api/v1/tasks/my-tasks` - Get tasks assigned to current user
- `GET /api/v1/tasks/overdue` - Get overdue tasks
- `GET /api/v1/tasks/project/{projectId}` - Get tasks for specific project

### API Features
- **Automatic Member Management**: Task assignment/removal handles project membership
- **Role-Based Access**: Admin endpoints protected by role checks
- **JWT Authentication**: Bearer token required for protected routes
- **CORS Enabled**: Frontend can communicate from different origins
- **Error Handling**: Consistent error responses with proper HTTP status codes

## 🏗️ Project Structure

```
Team Task Manager/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── crud/
│   │   ├── models/
│   │   └── schemas/
│   ├── alembic/
│   ├── requirements.txt
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── railway.json
└── README.md
```

## 🔐 Authentication

The application uses JWT-based authentication:
- Users register with email, username, full name, and password
- Login returns a JWT token
- Token is stored in localStorage and sent with API requests
- Protected routes require authentication

## 👥 User Roles

- **Admin**: Full access to all features
- **Member**: Can access assigned projects and tasks

## 📝 Usage

1. Register a new account or login
2. Create projects to organize your work
3. Add tasks to projects and assign them to team members
4. Track task status and priority
5. View dashboard for overview of all activities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.
