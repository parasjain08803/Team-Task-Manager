import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { taskAPI, projectAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      console.log('Updating task status:', { taskId, newStatus, currentUser: currentUser?.id, currentUserEmail: currentUser?.email });
      const updateData = { status: newStatus };
      console.log('Sending update data:', updateData);

      const response = await taskAPI.updateTask(taskId, updateData);
      console.log('Update response:', response);

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.data?.detail) {
        toast.error(`Permission denied: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to update task status. You may not have permission to update this task.');
      }
    }
  };

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {

      const tasksPromise = currentUser?.role === 'admin'
        ? taskAPI.getTasks()
        : taskAPI.getMyTasks();

      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        tasksPromise,
        projectAPI.getProjects(),
        userAPI.getUsers().catch(() => ({ data: [] }))
      ]);

      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication required. Please log in again.');

        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch data: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data) => {
    try {

      if (data.assignee_id && currentUser?.role !== 'admin') {
        toast.error('Only administrators can assign tasks');
        return;
      }

      if (data.due_date === '') {
        data.due_date = null;
      }

      console.log('Creating task with data:', data);
      await taskAPI.createTask(data);
      toast.success('Task created successfully');
      setShowCreateModal(false);
      reset();
      fetchData();
    } catch (error) {
      console.error('Task creation error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail;
      const displayMessage = typeof errorMessage === 'string' ? errorMessage : 'Failed to create task';
      toast.error(displayMessage);
    }
  };

  const handleEditTask = async (data) => {
    try {

      if (data.assignee_id && currentUser?.role !== 'admin') {
        toast.error('Only administrators can assign tasks');
        return;
      }

      if (data.due_date === '') {
        data.due_date = null;
      }

      await taskAPI.updateTask(selectedTask.id, data);
      toast.success('Task updated successfully');
      setShowEditModal(false);
      reset();
      fetchData();
    } catch (error) {
      console.error('Task update error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail;
      const displayMessage = typeof errorMessage === 'string' ? errorMessage : 'Failed to update task';
      toast.error(displayMessage);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskAPI.updateTask(taskId, { status: 'completed' });
      toast.success('Task marked as completed');
      fetchData();
    } catch (error) {
      console.error('Task completion error:', error);
      toast.error('Failed to mark task as completed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await taskAPI.deleteTask(taskId);
        toast.success('Task deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      project_id: task.project?.id || '',
      assignee_id: task.assignee?.id || '',
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      status: task.status
    });
    setShowEditModal(true);
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.project?.id === parseInt(projectFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const selectedProject = watch('project_id');
  const filteredUsers = users;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(task.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.project?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {task.assignee
                          ? task.assignee.full_name || 'Unknown'
                          : 'Unassigned'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {task.due_date ? (
                        <>
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </>
                      ) : (
                        <span className="text-gray-500">No due date</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {currentUser?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {currentUser?.role !== 'admin' && (

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && projectFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Task
            </button>
          )}
        </div>
      )}

      {}
      {showCreateModal && (
        <TaskModal
          title="Create New Task"
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
          projects={projects}
          users={users}
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          reset={reset}
        />
      )}

      {}
      {showEditModal && selectedTask && (
        <TaskModal
          title="Edit Task"
          onSubmit={handleEditTask}
          onClose={() => setShowEditModal(false)}
          projects={projects}
          users={filteredUsers}
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          reset={reset}
          isEdit={true}
          selectedTask={selectedTask}
        />
      )}
    </div>
  );
};

const TaskModal = ({
  title,
  onSubmit,
  onClose,
  projects,
  users,
  register,
  errors,
  handleSubmit,
  reset,
  isEdit = false,
  selectedTask
}) => {
  const { user: currentUser } = useAuth();
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              {...register('title', { required: 'Task title is required' })}
              className="input-field"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {typeof errors.title.message === 'string' ? errors.title.message : 'Task title is required'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
              placeholder="Enter task description"
            />
          </div>

          {currentUser?.role === 'admin' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      {...register('project_id', { required: 'Project is required' })}
                      className="input-field"
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                    {errors.project_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof errors.project_id.message === 'string' ? errors.project_id.message : 'Project is required'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <select
                      {...register('assignee_id')}
                      className="input-field"
                    >
                      <option value="">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="input-field"
                      defaultValue={isEdit ? selectedTask?.status || 'todo' : 'todo'}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {currentUser?.role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Status
                </label>
                <select
                  {...register('status')}
                  className="input-field"
                  defaultValue={selectedTask?.status || 'todo'}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

          {currentUser?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="input-field"
                defaultValue={isEdit ? selectedTask?.priority || 'medium' : 'medium'}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              {...register('due_date')}
              type="date"
              className="input-field"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {isEdit ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tasks;
