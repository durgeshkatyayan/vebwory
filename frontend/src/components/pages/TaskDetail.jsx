import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Trash2, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { getTaskById, updateTask, deleteTask, addTaskComment, getUsers } from '../services/api';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Select';
import { PriorityBadge, StatusBadge } from '../ui/PriorityBadge';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Editable Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignee_id: '',
    due_date: '',
  });

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [commentAuthorId, setCommentAuthorId] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTaskAndUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskData, usersData] = await Promise.all([getTaskById(id), getUsers()]);
      setTask(taskData);
      setUsers(usersData);

      setFormData({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assigned_to ? String(taskData.assigned_to) : '',
        due_date: taskData.due_date ? taskData.due_date.substring(0, 10) : '',
      });

      if (usersData.length > 0) {
        setCommentAuthorId(String(usersData[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTaskAndUsers();
  }, [fetchTaskAndUsers]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateTask(id, {
        ...formData,
        assigned_to: formData.assignee_id ? parseInt(formData.assignee_id, 10) : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      });
      setTask((prev) => ({ ...prev, ...updated }));
      alert('Task successfully updated');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete task');
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentAuthorId) return;

    try {
      setSubmittingComment(true);
      const newComment = await addTaskComment(id, {
        comment: commentText.trim(),
        user_id: parseInt(commentAuthorId, 10),
      });
      setTask((prev) => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
      }));
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading task details...</div>;
  }

  if (error || !task) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p>{error || 'Task not found'}</p>
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Tasks
        </Link>
        <Button variant="danger" size="sm" onClick={handleDeleteTask}>
          <Trash2 className="w-4 h-4 mr-1.5" /> Delete Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details & Edit Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <Input
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows="4"
                  className="w-full rounded-lg bg-slate-800/80 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Blocked', value: 'Blocked' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  options={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                    { label: 'Urgent', value: 'Urgent' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Assignee"
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  options={[
                    { label: 'Unassigned', value: '' },
                    ...users.map((u) => ({ label: u.name, value: String(u.id) })),
                  ]}
                />

                <Input
                  type="date"
                  label="Due Date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" loading={saving}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Activity / Comments Stream */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-base font-semibold text-slate-100 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-teal-400" /> Task Notes & Comments
            </h3>

            {/* Post Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <Select
                    value={commentAuthorId}
                    onChange={(e) => setCommentAuthorId(e.target.value)}
                    options={users.map((u) => ({ label: u.name, value: String(u.id) }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Write a comment or status note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={submittingComment} disabled={!commentText.trim()}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Post Comment
                </Button>
              </div>
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              {!task.comments || task.comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments posted yet.</p>
              ) : (
                task.comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal-400">{comment.user?.name || 'Team member'}</span>
                      <span className="text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-200 pt-1">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Metadata</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Status</span>
                <div className="mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Priority</span>
                <div className="mt-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Created At</span>
                <span className="text-slate-300 font-medium">{new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Last Updated</span>
                <span className="text-slate-300 font-medium">{new Date(task.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};