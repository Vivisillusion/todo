// ===================================
// CHAOS TO-DO LIST - JAVASCRIPT
// ===================================

class ChaosToDoList {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.attachEventListeners();
    this.renderTasks();
    this.updateStats();
  }

  cacheDOMElements() {
    this.taskInput = document.getElementById('task-input');
    this.prioritySelect = document.getElementById('priority-select');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.tasksList = document.getElementById('tasks-list');
    this.emptyState = document.getElementById('empty-state');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.totalTasksEl = document.getElementById('total-tasks');
    this.completedTasksEl = document.getElementById('completed-tasks');
    this.remainingTasksEl = document.getElementById('remaining-tasks');
  }

  attachEventListeners() {
    // Add task
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // Filter buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
      });
    });

    // Clear completed
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
  }

  addTask() {
    const text = this.taskInput.value.trim();
    
    if (!text) {
      this.shakeInput();
      return;
    }

    const task = {
      id: Date.now(),
      text: text,
      completed: false,
      priority: this.prioritySelect.value,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.taskInput.value = '';
    this.renderTasks();
    this.updateStats();
    
    // Focus back on input
    this.taskInput.focus();
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      
      // Add animation class
      const taskElement = document.querySelector(`[data-id="${id}"]`);
      if (taskElement) {
        taskElement.classList.add('completing');
        setTimeout(() => taskElement.classList.remove('completing'), 400);
      }
      
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  deleteTask(id) {
    // Confirm before delete
    const task = this.tasks.find(t => t.id === id);
    if (task && confirm(`Delete task: "${task.text}"?`)) {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
      alert('No completed tasks to clear!');
      return;
    }

    if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case 'active':
        return this.tasks.filter(t => !t.completed);
      case 'completed':
        return this.tasks.filter(t => t.completed);
      case 'high':
        return this.tasks.filter(t => t.priority === 'high');
      default:
        return this.tasks;
    }
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      this.tasksList.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');
    
    this.tasksList.innerHTML = filteredTasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTask(${task.id})"></div>
        <div class="task-content">
          <div class="task-text">${this.escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            <span class="task-time">${this.formatDate(task.createdAt)}</span>
          </div>
        </div>
        <button class="task-delete" onclick="app.deleteTask(${task.id})">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const remaining = total - completed;

    this.animateNumber(this.totalTasksEl, total);
    this.animateNumber(this.completedTasksEl, completed);
    this.animateNumber(this.remainingTasksEl, remaining);
  }

  animateNumber(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === newValue) return;
    
    const duration = 300;
    const steps = 15;
    const increment = (newValue - currentValue) / steps;
    let current = currentValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        element.textContent = newValue;
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, duration / steps);
  }

  shakeInput() {
    this.taskInput.style.animation = 'shake 0.5s';
    setTimeout(() => {
      this.taskInput.style.animation = '';
    }, 500);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // LocalStorage methods
  saveTasks() {
    localStorage.setItem('chaosToDoTasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const stored = localStorage.getItem('chaosToDoTasks');
    return stored ? JSON.parse(stored) : [];
  }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Initialize app
const app = new ChaosToDoList();

// Expose app globally for onclick handlers
window.app = app;
