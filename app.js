        // In-memory storage for tasks (simulating localStorage)
        let tasks = [];
        let currentFilter = 'all';
        let taskIdCounter = 1;
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            updateDisplay();
            
            // Allow Enter key to add tasks
            document.getElementById('taskInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        });
        
        // Add new task function
        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const taskText = taskInput.value.trim();
            
            if (taskText === '') {
                alert('Please enter a task!');
                return;
            }
            
            // Create new task object
            const newTask = {
                id: taskIdCounter++,
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            // Add to tasks array
            tasks.push(newTask);
            
            // Clear input
            taskInput.value = '';
            
            // Update display
            updateDisplay();
            
            // Focus back on input for quick adding
            taskInput.focus();
        }
        
        // Toggle task completion
        function toggleTask(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                updateDisplay();
            }
        }
        
        // Delete task function
        function deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                updateDisplay();
            }
        }
        
        // Edit task function
        function editTask(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            
            const taskElement = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
            const currentText = task.text;
            
            // Make text editable
            taskElement.contentEditable = true;
            taskElement.classList.add('editing');
            taskElement.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(taskElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Handle save on Enter or blur
            function saveEdit() {
                const newText = taskElement.textContent.trim();
                
                if (newText === '') {
                    alert('Task cannot be empty!');
                    taskElement.textContent = currentText;
                } else {
                    task.text = newText;
                }
                
                taskElement.contentEditable = false;
                taskElement.classList.remove('editing');
                updateDisplay();
            }
            
            // Save on Enter key
            taskElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
                if (e.key === 'Escape') {
                    taskElement.textContent = currentText;
                    taskElement.contentEditable = false;
                    taskElement.classList.remove('editing');
                }
            });
            
            // Save on blur (clicking away)
            taskElement.addEventListener('blur', saveEdit);
        }
        
        // Filter tasks function
        function filterTasks(filter) {
            currentFilter = filter;
            
            // Update active filter button
            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Find and activate the correct button
            const buttons = document.querySelectorAll('.filter-button');
            if (filter === 'all') buttons[0].classList.add('active');
            else if (filter === 'pending') buttons[1].classList.add('active');
            else if (filter === 'completed') buttons[2].classList.add('active');
            
            updateDisplay();
        }
        
        // Clear completed tasks
        function clearCompleted() {
            if (confirm('Are you sure you want to delete all completed tasks?')) {
                tasks = tasks.filter(task => !task.completed);
                updateDisplay();
            }
        }
        
        // Update the entire display
        function updateDisplay() {
            updateStats();
            renderTasks();
            updateClearButton();
        }
        
        // Update statistics
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            const pending = total - completed;
            
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;
        }
        
        // Render tasks based on current filter
        function renderTasks() {
            const tasksList = document.getElementById('tasksList');
            
            // Filter tasks based on current filter
            let filteredTasks = tasks;
            if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            } else if (currentFilter === 'pending') {
                filteredTasks = tasks.filter(task => !task.completed);
            }
            
            // Show empty state if no tasks
            if (filteredTasks.length === 0) {
                let emptyMessage = 'No tasks yet';
                if (currentFilter === 'completed') emptyMessage = 'No completed tasks';
                if (currentFilter === 'pending') emptyMessage = 'No pending tasks';
                
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>${emptyMessage}</h3>
                        <p>${currentFilter === 'all' ? 'Add your first task above to get started!' : ''}</p>
                    </div>
                `;
                return;
            }
            
            // Render tasks
            tasksList.innerHTML = filteredTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <div class="task-text ${task.completed ? 'completed' : ''}" onclick="editTask(${task.id})">
                        ${task.text}
                    </div>
                    <div class="task-actions">
                        <button class="action-button edit-button" onclick="editTask(${task.id})" title="Edit task">
                            ✏️
                        </button>
                        <button class="action-button delete-button" onclick="deleteTask(${task.id})" title="Delete task">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update clear completed button visibility
        function updateClearButton() {
            const clearButton = document.getElementById('clearButton');
            const hasCompleted = tasks.some(task => task.completed);
            clearButton.style.display = hasCompleted ? 'block' : 'none';
        }
