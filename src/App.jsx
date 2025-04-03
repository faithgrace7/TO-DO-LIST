import { useState, useEffect } from "react";
import "./index.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch tasks from Django API
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch("http://localhost:8000/api/todos/fetch");
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  // Add Task (POST)
  const addTask = async () => {
    if (task.trim() === "") return;

    const newTask = { title: task, completed: false };

    const response = await fetch("http://localhost:8000/api/todos/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    const data = await response.json();
    setTasks([...tasks, data]);
    setTask("");
  };

  // Remove Task (DELETE)
  const removeTask = async (taskId) => {
    await fetch(`http://localhost:8000/api/todos/${taskId}/delete`, {
      method: "DELETE",
    });
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Toggle Task Completion (PUT)
  const toggleComplete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    const updatedTask = { ...task, completed: !task.completed };

    const response = await fetch(
      `http://localhost:8000/api/todos/${taskId}/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      }
    );

    const data = await response.json();
    setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
  };

  // Edit Task (Enable Editing)
  const editTask = (taskId, text) => {
    setEditingIndex(taskId);
    setEditedTask(text);
  };

  // Save Edited Task (PUT)
  const saveEditedTask = async (taskId) => {
    const updatedTask = { title: editedTask, completed: false };

    const response = await fetch(
      `http://localhost:8000/api/todos/${taskId}/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      }
    );

    const data = await response.json();
    setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
    setEditingIndex(null);
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <h2>To-Do List</h2>
      <div className="input-container">
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>
      <div className="filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />
            {editingIndex === task.id ? (
              <>
                <input
                  type="text"
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                />
                <button onClick={() => saveEditedTask(task.id)}>Save</button>
              </>
            ) : (
              <>
                <span>{task.title}</span>
                <button onClick={() => editTask(task.id, task.title)}>
                  Edit
                </button>
                <button onClick={() => removeTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
