 "use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import api from "@/lib/axios";
  import { useAuth } from "@/context/AuthContext";

  interface Task {
    id: number;
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    createdAt: string;
  }

  interface TaskForm {
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
  }

  const emptyForm: TaskForm = {
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
  };

  export default function DashboardPage() {
    const router = useRouter();
    const { username, logout, isAuthenticated } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // form state
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<TaskForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // redirect if not authenticated
    useEffect(() => {
      if (!isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, router]);

    // load tasks on mount
    useEffect(() => {
      if (isAuthenticated) fetchTasks();
    }, [isAuthenticated]);

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tasks");
        setTasks(response.data);
      } catch (err) {
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        if (editingId !== null) {
          // update existing task
          await api.put(`/tasks/${editingId}`, form);
        } else {
          // create new task
          await api.post("/tasks", form);
        }
        setForm(emptyForm);
        setShowForm(false);
        setEditingId(null);
        fetchTasks(); // refresh list
      } catch (err) {
        setError("Failed to save task");
      } finally {
        setSubmitting(false);
      }
    };

    const handleEdit = (task: Task) => {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      });
      setEditingId(task.id);
      setShowForm(true);
    };

    const handleDelete = async (id: number) => {
      if (!confirm("Delete this task?")) return;
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        setError("Failed to delete task");
      }
    };

    const handleLogout = () => {
      logout();
      router.push("/login");
    };

    const statusColor: Record<string, string> = {
      TODO: "bg-gray-100 text-gray-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700",
    };

    const priorityColor: Record<string, string> = {
      LOW: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-red-100 text-red-700",
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">👤 {username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Header + Add button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
            <button
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
            >
              {showForm ? "Cancel" : "+ New Task"}
            </button>
          </div>

          {/* Task Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4"
            >
              <h3 className="font-semibold text-gray-700">
                {editingId ? "Edit Task" : "New Task"}
              </h3>

              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
  focus:ring-blue-500"
              />

              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
  focus:ring-blue-500"
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as TaskForm["status"] })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
  focus:ring-blue-500"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as TaskForm["priority"] })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
  focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {submitting ? "Saving..." : editingId ? "Update Task" : "Create Task"}
              </button>
            </form>
          )}

          {/* Task List */}
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No tasks yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm p-5 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor[task.status]}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
