import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      console.log('Fetching project details for ID:', id);

      const projectRes = await projectAPI.getProject(id);
      console.log('Project response:', projectRes);
      setProject(projectRes.data);

      const tasksRes = await taskAPI.getTasksByProject(id);
      console.log('Tasks response:', tasksRes);
      setTasks(tasksRes.data);

      try {
        const membersRes = await projectAPI.getProjectMembers(id);
        console.log('Members response:', membersRes);
        setMembers(membersRes.data);
      } catch (memberError) {
        console.warn('Failed to fetch project members:', memberError);
        setMembers([]);
      }

    } catch (error) {
      console.error('Error fetching project details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(`Failed to load project details: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectAPI.deleteProject(id);
        toast.success('Project deleted successfully');
        window.location.href = '/projects';
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

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

  const getProjectStats = () => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      overdue: tasks.filter(t => {
        const dueDate = new Date(t.due_date);
        const isPastDue = t.due_date && dueDate < new Date() && t.status !== 'completed';
        return t.status === 'overdue' || isPastDue;
      }).length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const stats = getProjectStats();

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {(currentUser?.role === 'admin' || project?.creator_id === currentUser?.id) && (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Project</span>
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleDeleteProject}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-600">
          {project.description || 'No description provided'}
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">To Do</p>
              <p className="text-2xl font-bold text-gray-600">{stats.todo}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
          <span className="text-sm text-gray-500">{members.length} members</span>
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.user?.full_name || member.user?.email}</p>
                  <p className="text-xs text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {member.role === 'owner' ? 'Owner' : 'Member'}
              </span>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No members found</p>
          )}
        </div>
      </div>

      {}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
          {(currentUser?.role === 'admin' || project?.creator_id === currentUser?.id) && (
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
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
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No tasks found for this project</p>
          )}
        </div>
      </div>

      {}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target);
                  const updateData = {
                    name: formData.get('name'),
                    description: formData.get('description')
                  };
                  await projectAPI.updateProject(id, updateData);
                  toast.success('Project updated successfully');
                  setShowEditModal(false);
                  fetchProjectDetails();
                } catch (error) {
                  toast.error('Failed to update project');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={project?.name}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={project?.description}
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target);
                  const taskData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    project_id: parseInt(id),
                    priority: formData.get('priority'),
                    status: formData.get('status')
                  };

                  const assigneeId = formData.get('assignee_id');
                  if (assigneeId && assigneeId !== '') {
                    taskData.assignee_id = parseInt(assigneeId);
                  }

                  const dueDate = formData.get('due_date');
                  if (dueDate && dueDate !== '') {
                    taskData.due_date = new Date(dueDate).toISOString();
                  }

                  await taskAPI.createTask(taskData);
                  toast.success('Task created successfully');
                  setShowCreateTaskModal(false);
                  fetchProjectDetails();
                } catch (error) {
                  toast.error('Failed to create task');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="input-field"
                    placeholder="Add task description..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select name="assignee_id" className="input-field">
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.user_id}>
                        {member.user?.full_name || member.user?.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select name="status" className="input-field" defaultValue="todo">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select name="priority" className="input-field" defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateTaskModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
