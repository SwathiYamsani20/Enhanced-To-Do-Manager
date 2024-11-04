import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, Box } from '@mui/material'; 
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSorted, setIsSorted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingTodo, setEditingTodo] = useState(null); 
  const [newTitle, setNewTitle] = useState(""); 
  const [newCompleted, setNewCompleted] = useState(false); // New state for checkbox
  const dialogRef = useRef(null);

  useEffect(() => {
    // Fetch todos and check for localStorage updates
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(data => {
        const updatedTodos = data.map(todo => {
          const savedTitle = localStorage.getItem(`todo-${todo.id}`);
          const savedCompleted = localStorage.getItem(`todo-completed-${todo.id}`);
          return {
            ...todo,
            title: savedTitle || todo.title,
            completed: savedCompleted !== null ? JSON.parse(savedCompleted) : todo.completed
          };
        });
        setTodos(updatedTodos);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  const filteredList = todos.filter(val =>
    val.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedList = [...filteredList].sort((a, b) => {
    return isSorted ? b.id - a.id : a.id - b.id;
  });

  function sortById() {
    setIsSorted(!isSorted);
  }

  function deleteTodo(id) {
    const filteredTodo = todos.filter((val) => val.id !== id);
    setTodos(filteredTodo);
  }

  function openDialog(todo) {
    setEditingTodo(todo); 
    setNewTitle(todo.title); 
    setNewCompleted(todo.completed); // Set initial checkbox state
    dialogRef.current.showModal();
  }

  function closeDialog() {
    setEditingTodo(null); 
    dialogRef.current.close();
  }

  function saveTodo() {
    // Update the title and checkbox status of the todo being edited
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === editingTodo.id ? { ...todo, title: newTitle, completed: newCompleted } : todo
      )
    );
    
    // Save the new title and checkbox status to localStorage
    localStorage.setItem(`todo-${editingTodo.id}`, newTitle);
    localStorage.setItem(`todo-completed-${editingTodo.id}`, JSON.stringify(newCompleted));
    
    closeDialog(); // Close the dialog after saving
  }

  // Filtering todos based on active tab
  const displayedTodos = sortedList.filter(todo => {
    if (activeTab === 1) return todo.completed; 
    if (activeTab === 2) return !todo.completed;
    return true; 
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="App">
      <div className='header'>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search todo by title"
      />
      <button onClick={sortById}>
        {isSorted ? "Sort by Ascending" : "Sort by Descending"}
      </button>
      </div>

      <h1>Todo List</h1>

      {/* Tabs Component */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Todo Tabs">
          <Tab label="All Todos" />
          <Tab label="Checked Todos" />
          <Tab label="Unchecked Todos" />
        </Tabs>
      </Box>

      {/* Display Todos in Table Format */}
      {todos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Completed</th>
              <th>Delete</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {displayedTodos.map(todo => (
              <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.title}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                  />
                </td>
                <td>
                  <DeleteOutlineIcon style={{ cursor: 'pointer' }} onClick={() => deleteTodo(todo.id)} />
                </td>
                <td>
                  <button onClick={() => openDialog(todo)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}

      {/* Dialog for editing */}
      <dialog className='custom-dialog' ref={dialogRef}>
        <h2>Edit the todo</h2>
        <input 
          type='text' 
          placeholder='Type your title' 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
        />
        <div className='checkbox-line'>
        
            <input
              type="checkbox"
              checked={newCompleted} 
              onChange={(e) => setNewCompleted(e.target.checked)} // Allow checkbox toggle
            />
            <label>
            Completed
          </label>
        </div>
        <div className='dialog-actions'>
        <button onClick={saveTodo}>Save</button> 
          <button onClick={closeDialog}>Close</button>
        </div>
      </dialog>
    </div>
  );
}

export default App;
