import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FolderOpen,
  Plus,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const auth = useAuth();
  console.log('Dashboard - auth context:', auth);
  const { user: currentUser } = auth;
  console.log('Dashboard - currentUser:', currentUser);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, myTasksRes, overdueTasksRes] = await Promise.all([
          projectAPI.getProjects(),
          taskAPI.getTasks(),
          taskAPI.getMyTasks(),
          taskAPI.getOverdueTasks()
        ]);

        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
        setMyTasks(myTasksRes.data);
        setOverdueTasks(overdueTasksRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  console.log('Dashboard - tasks data:', tasks);
  console.log('Dashboard - myTasks data:', myTasks);
  console.log('Dashboard - overdueTasks data:', overdueTasks);

  const taskDataForStats = currentUser?.role === 'admin' ? tasks : myTasks;

  const taskStats = {
    total: taskDataForStats.length,
    completed: taskDataForStats.filter(t => t.status === 'completed').length,
    inProgress: taskDataForStats.filter(t => t.status === 'in_progress').length,
    todo: taskDataForStats.filter(t => t.status === 'todo').length,
    overdue: taskDataForStats.filter(t => {

      const dueDate = new Date(t.due_date);
      const isPastDue = t.due_date && dueDate < new Date() && t.status !== 'completed';
      return t.status === 'overdue' || isPastDue;
    }).length
  };

  console.log('Dashboard - calculated taskStats:', taskStats);

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          {currentUser?.role === 'admin' && (
            <Link
              to="/projects/new"
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{taskStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">In Progress</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{taskStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">To Do</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{taskStats.todo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700">Overdue</span>
              </div>
              <span className="text-sm font-medium text-red-600">{taskStats.overdue}</span>
            </div>
          </div>
        </div>

        {}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.description ? project.description.substring(0, 50) + '...' : 'No description'}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No projects yet</p>
            )}
          </div>
        </div>
      </div>

      {}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Overdue Tasks</h3>
          </div>
          <div className="space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {overdueTasks.length > 3 && (
              <p className="text-sm text-red-600 text-center">
                +{overdueTasks.length - 3} more overdue tasks
              </p>
            )}
          </div>
        </div>
      )}

      {}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Recent Tasks</h3>
          <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {myTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
          {myTasks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No tasks assigned to you</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
