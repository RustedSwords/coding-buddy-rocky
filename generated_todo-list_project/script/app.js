/**
 * Core application logic for task management
 * Implements task data model, localStorage persistence, CRUD operations, and UI event handling
 */

// Initialize state
var TaskApp = (function() {
  'use strict';

  // DOM Elements
  var taskForm = null;
  var taskTitleInput = null;
  var taskPrioritySelect = null;
  var taskTagsInput = null;
  var taskList = null;
  var filterButtons = null;

  /**
   * Task object structure
   * @typedef {Object} Task
   * @property {string} id - Unique identifier
   * @property {string} title - Task title
   * @property {string} priority - Priority level ('high'|'medium'|'low')
   * @property {boolean} completed - Completion status
   * @property {string} createdAt - Creation timestamp (ISO format)
   * @property {string[]} tags - Array of tag strings
   */

  /**
   * Load tasks from localStorage
   * @returns {Task[]} Array of task objects
   */
  function loadTasks() {
    try {
      var tasksData = localStorage.getItem('tasks');
      if (tasksData) {
        var parsed = JSON.parse(tasksData);
        // Ensure it's an array
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error('Error loading tasks from localStorage:', e);
      return [];
    }
  }

  /**
   * Save tasks to localStorage
   * @param {Task[]} tasks - Array of task objects to save
   */
  function saveTasks(tasks) {
    try {
      var tasksData = JSON.stringify(tasks);
      localStorage.setItem('tasks', tasksData);
      return true;
    } catch (e) {
      console.error('Error saving tasks to localStorage:', e);
      return false;
    }
  }

  /**
   * Generate a unique ID for a new task
   * @returns {string} Unique ID
   */
  function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Create a new task object
   * @param {string} title - Task title
   * @param {string} priority - Priority level ('high'|'medium'|'low')
   * @param {string[]} tags - Array of tag strings
   * @returns {Task} New task object
   */
  function createTaskObject(title, priority, tags) {
    return {
      id: generateId(),
      title: title || 'Untitled Task',
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      tags: tags || []
    };
  }

  /**
   * Add a new task
   * @param {string} title - Task title
   * @param {string} priority - Priority level ('high'|'medium'|'low')
   * @param {string[]} tags - Array of tag strings
   * @returns {Task|null} The created task or null if creation failed
   */
  function addTask(title, priority, tags) {
    if (!title || !title.trim()) {
      console.error('Task title is required');
      return null;
    }

    var tasks = loadTasks();
    var task = createTaskObject(title.trim(), priority, tags);
    
    tasks.push(task);
    saveTasks(tasks);
    
    return task;
  }

  /**
   * Edit an existing task
   * @param {string} id - Task ID to edit
   * @param {Object} updates - Object containing fields to update
   * @returns {boolean} True if successful, false otherwise
   */
  function editTask(id, updates) {
    if (!id) {
      console.error('Task ID is required');
      return false;
    }

    var tasks = loadTasks();
    var taskIndex = tasks.findIndex(function(task) {
      return task.id === id;
    });

    if (taskIndex === -1) {
      console.error('Task not found');
      return false;
    }

    // Apply updates
    if (updates.title !== undefined) {
      tasks[taskIndex].title = updates.title;
    }
    if (updates.priority !== undefined) {
      tasks[taskIndex].priority = updates.priority;
    }
    if (updates.completed !== undefined) {
      tasks[taskIndex].completed = updates.completed;
    }
    if (updates.tags !== undefined) {
      tasks[taskIndex].tags = updates.tags;
    }

    saveTasks(tasks);
    return true;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID to delete
   * @returns {boolean} True if successful, false otherwise
   */
  function deleteTask(id) {
    if (!id) {
      console.error('Task ID is required');
      return false;
    }

    var tasks = loadTasks();
    var filteredTasks = tasks.filter(function(task) {
      return task.id !== id;
    });

    if (filteredTasks.length === tasks.length) {
      console.error('Task not found');
      return false;
    }

    saveTasks(filteredTasks);
    return true;
  }

  /**
   * Toggle task completion status
   * @param {string} id - Task ID to toggle
   * @returns {boolean} True if successful, false otherwise
   */
  function toggleComplete(id) {
    if (!id) {
      console.error('Task ID is required');
      return false;
    }

    var tasks = loadTasks();
    var taskIndex = tasks.findIndex(function(task) {
      return task.id === id;
    });

    if (taskIndex === -1) {
      console.error('Task not found');
      return false;
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks(tasks);
    return true;
  }

  /**
   * Get tasks filtered by tag
   * @param {string} tag - Tag to filter by
   * @returns {Task[]} Array of filtered tasks
   */
  function getTasksByTag(tag) {
    var tasks = loadTasks();
    return tasks.filter(function(task) {
      return task.tags && task.tags.includes(tag);
    });
  }

  /**
   * Get unique tags from all tasks
   * @returns {string[]} Array of unique tags
   */
  function getAllTags() {
    var tasks = loadTasks();
    var tags = [];
    
    tasks.forEach(function(task) {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(function(tag) {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    });
    
    return tags.sort();
  }

  /**
   * Render a single task to HTML
   * @param {Task} task - Task object to render
   * @returns {HTMLElement} Rendered task element
   */
  function renderTask(task) {
    var taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.dataset.id = task.id;
    
    if (task.completed) {
      taskEl.classList.add('completed');
    }

    // Create task header
    var headerEl = document.createElement('div');
    headerEl.className = 'task-header';

    // Task title
    var titleEl = document.createElement('h3');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;
    
    // Priority indicator
    var priorityEl = document.createElement('span');
    priorityEl.className = 'task-priority ' + task.priority;
    priorityEl.textContent = task.priority;
    
    headerEl.appendChild(titleEl);
    headerEl.appendChild(priorityEl);

    // Task tags
    if (task.tags && task.tags.length > 0) {
      var tagsContainer = document.createElement('div');
      tagsContainer.className = 'task-tags';
      
      task.tags.forEach(function(tag) {
        var tagEl = document.createElement('span');
        tagEl.className = 'task-tag';
        tagEl.textContent = tag;
        tagEl.style.backgroundColor = Utils.generateColor(tag);
        tagsContainer.appendChild(tagEl);
      });
      
      headerEl.appendChild(tagsContainer);
    }
    
    taskEl.appendChild(headerEl);

    // Task footer
    var footerEl = document.createElement('div');
    footerEl.className = 'task-footer';

    // Creation date
    var dateEl = document.createElement('span');
    dateEl.className = 'task-date';
    dateEl.textContent = Utils.formatDate(task.createdAt);
    footerEl.appendChild(dateEl);

    // Task actions
    var actionsEl = document.createElement('div');
    actionsEl.className = 'task-actions';

    // Complete toggle button
    var completeBtn = document.createElement('button');
    completeBtn.className = 'btn-complete';
    completeBtn.innerHTML = task.completed ? 'Undo' : '✓';
    completeBtn.title = task.completed ? 'Mark as incomplete' : 'Mark as complete';
    completeBtn.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as complete');
    completeBtn.addEventListener('click', function() {
      toggleComplete(task.id);
      renderAllTasks();
    });
    actionsEl.appendChild(completeBtn);

    // Edit button
    var editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', function() {
      editTaskModal(task.id);
    });
    actionsEl.appendChild(editBtn);

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(task.id);
        renderAllTasks();
      }
    });
    actionsEl.appendChild(deleteBtn);

    footerEl.appendChild(actionsEl);
    taskEl.appendChild(footerEl);

    return taskEl;
  }

  /**
   * Render all tasks to the task list
   */
  function renderAllTasks() {
    var tasks = loadTasks();
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = 'No tasks found. Add a new task to get started!';
      taskList.appendChild(emptyMsg);
      updateStats();
      return;
    }

    // Sort tasks: incomplete first, then by creation date (newest first)
    var sortedTasks = tasks.slice().sort(function(a, b) {
      if (a.completed === b.completed) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.completed - b.completed; // false (0) comes before true (1)
    });

    // Render each task
    sortedTasks.forEach(function(task) {
      taskList.appendChild(renderTask(task));
    });
    
    updateStats();
  }

  /**
   * Clear task input fields
   */
  function clearTaskInput() {
    if (taskTitleInput) {
      taskTitleInput.value = '';
    }
    if (taskPrioritySelect) {
      taskPrioritySelect.value = 'medium';
    }
    if (taskTagsInput) {
      taskTagsInput.value = '';
    }
  }

  /**
   * Show edit task modal
   * @param {string} id - Task ID to edit
   */
  function editTaskModal(id) {
    var tasks = loadTasks();
    var task = tasks.find(function(t) { return t.id === id; });
    
    if (!task) {
      console.error('Task not found');
      return;
    }

    // Create modal elements
    var modal = document.createElement('div');
    modal.className = 'task-modal';
    
    var modalContent = document.createElement('div');
    modalContent.className = 'task-modal-content';
    
    var header = document.createElement('h2');
    header.textContent = 'Edit Task';
    
    // Form elements
    var form = document.createElement('form');
    form.className = 'edit-task-form';
    
    // Title input
    var titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    var titleLabel = document.createElement('label');
    titleLabel.textContent = 'Title:';
    titleLabel.setAttribute('for', 'edit-title');
    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'edit-title';
    titleInput.value = task.title;
    titleInput.required = true;
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    form.appendChild(titleGroup);

    // Priority select
    var priorityGroup = document.createElement('div');
    priorityGroup.className = 'form-group';
    var priorityLabel = document.createElement('label');
    priorityLabel.textContent = 'Priority:';
    priorityLabel.setAttribute('for', 'edit-priority');
    var prioritySelect = document.createElement('select');
    prioritySelect.id = 'edit-priority';
    ['low', 'medium', 'high'].forEach(function(p) {
      var option = document.createElement('option');
      option.value = p;
      option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
      if (p === task.priority) {
        option.selected = true;
      }
      prioritySelect.appendChild(option);
    });
    priorityGroup.appendChild(priorityLabel);
    priorityGroup.appendChild(prioritySelect);
    form.appendChild(priorityGroup);

    // Tags input
    var tagsGroup = document.createElement('div');
    tagsGroup.className = 'form-group';
    var tagsLabel = document.createElement('label');
    tagsLabel.textContent = 'Tags (comma-separated):';
    tagsLabel.setAttribute('for', 'edit-tags');
    var tagsInput = document.createElement('input');
    tagsInput.type = 'text';
    tagsInput.id = 'edit-tags';
    tagsInput.value = task.tags.join(', ');
    tagsGroup.appendChild(tagsLabel);
    tagsGroup.appendChild(tagsInput);
    form.appendChild(tagsGroup);

    // Buttons
    var buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-buttons';
    
    var saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn-save';
    saveBtn.textContent = 'Save';
    
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function() {
      modal.remove();
    });
    
    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);
    form.appendChild(buttonGroup);
    
    modalContent.appendChild(header);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle form submit
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      var updates = {
        title: titleInput.value.trim(),
        priority: prioritySelect.value,
        tags: tagsInput.value.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t !== ''; })
      };
      
      if (editTask(id, updates)) {
        renderAllTasks();
        modal.remove();
      }
    });

    // Focus title input
    titleInput.focus();
  }

  /**
   * Handle form submission for adding new tasks
   * @param {Event} e - Form submit event
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    
    var title = taskTitleInput.value.trim();
    var priority = taskPrioritySelect.value;
    var tags = taskTagsInput.value.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t !== ''; });
    
    if (!title) {
      alert('Task title is required');
      taskTitleInput.focus();
      return;
    }
    
    addTask(title, priority, tags);
    renderAllTasks();
    clearTaskInput();
  }

  /**
   * Handle tag filter clicks
   * @param {string} tag - Tag to filter by
   */
  function handleTagFilter(tag) {
    var tasks = getTasksByTag(tag);
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = 'No tasks found with this tag.';
      taskList.appendChild(emptyMsg);
      return;
    }

    // Sort and render filtered tasks
    var sortedTasks = tasks.slice().sort(function(a, b) {
      if (a.completed === b.completed) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.completed - b.completed;
    });

    sortedTasks.forEach(function(task) {
      taskList.appendChild(renderTask(task));
    });
  }

  /**
   * Filter tasks by status (all, pending, completed)
   * @param {string} filter - Filter type ('all', 'pending', 'completed')
   */
  function handleStatusFilter(filter) {
    var tasks = loadTasks();
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Filter tasks based on status
    var filteredTasks = tasks;
    if (filter === 'pending') {
      filteredTasks = tasks.filter(function(task) { return !task.completed; });
    } else if (filter === 'completed') {
      filteredTasks = tasks.filter(function(task) { return task.completed; });
    }
    
    if (filteredTasks.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-message';
      var emptyText = filter === 'pending' ? 'No active tasks. Great job!' :
                      filter === 'completed' ? 'No completed tasks yet.' :
                      'No tasks found. Add a new task to get started!';
      emptyMsg.textContent = emptyText;
      taskList.appendChild(emptyMsg);
      updateStats();
      return;
    }

    // Sort and render filtered tasks
    var sortedTasks = filteredTasks.slice().sort(function(a, b) {
      if (a.completed === b.completed) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.completed - b.completed;
    });

    sortedTasks.forEach(function(task) {
      taskList.appendChild(renderTask(task));
    });
    
    updateStats();
  }

  /**
   * Update task statistics in the sidebar
   */
  function updateStats() {
    var tasks = loadTasks();
    var totalTasks = tasks.length;
    var completedTasks = tasks.filter(function(task) { return task.completed; }).length;
    var pendingTasks = totalTasks - completedTasks;
    
    var totalEl = document.getElementById('totalTasks');
    var completedEl = document.getElementById('completedTasks');
    var pendingEl = document.getElementById('pendingTasks');
    
    if (totalEl) totalEl.textContent = totalTasks;
    if (completedEl) completedEl.textContent = completedTasks;
    if (pendingEl) pendingEl.textContent = pendingTasks;
  }

  /**
   * Initialize the application
   */
  function init() {
    // Get DOM elements
    taskForm = document.getElementById('task-form');
    taskTitleInput = document.getElementById('task-title');
    taskPrioritySelect = document.getElementById('task-priority');
    taskTagsInput = document.getElementById('task-tags');
    taskList = document.getElementById('task-list');
    
    // Render initial tasks
    renderAllTasks();
    updateStats();
    
    // Attach form submit event listener
    if (taskForm) {
      taskForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Attach filter button event listeners (All, Active, Completed)
    var filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    if (filterButtons.length > 0) {
      filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Update active state
          filterButtons.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          
          // Apply filter
          var filter = btn.dataset.filter;
          if (filter === 'pending') {
            handleStatusFilter('pending');
          } else if (filter === 'completed') {
            handleStatusFilter('completed');
          } else {
            renderAllTasks();
          }
        });
      });
    }
    
    // Add tag filter button handlers if they exist
    var filterContainer = document.getElementById('tag-filters');
    if (filterContainer) {
      var tags = getAllTags();
      if (tags.length > 0) {
        tags.forEach(function(tag) {
          var btn = document.createElement('button');
          btn.className = 'filter-btn';
          btn.textContent = tag;
          btn.style.backgroundColor = Utils.generateColor(tag);
          btn.addEventListener('click', function() {
            handleTagFilter(tag);
          });
          filterContainer.appendChild(btn);
        });
      }
    }
    
    // Debounced resize handler for responsive UI
    var resizeHandler = Utils.debounce(function() {
      handleResize();
    }, 250);
    
    window.addEventListener('resize', resizeHandler);
  }

  /**
   * Handle window resize for responsive UI
   */
  function handleResize() {
    // Adjust task item layout for different screen sizes
    if (window.innerWidth < 768) {
      document.body.classList.add('mobile-view');
    } else {
      document.body.classList.remove('mobile-view');
    }
    
    // Re-render tasks if needed to adjust for layout changes
    if (taskList && !taskList.querySelector('.empty-message')) {
      var tasks = loadTasks();
      if (tasks.length > 0) {
        renderAllTasks();
      }
    }
  }

  // Expose public API
  return {
    loadTasks: loadTasks,
    saveTasks: saveTasks,
    addTask: addTask,
    editTask: editTask,
    deleteTask: deleteTask,
    toggleComplete: toggleComplete,
    renderTask: renderTask,
    renderAllTasks: renderAllTasks,
    clearTaskInput: clearTaskInput,
    updateStats: updateStats,
    handleStatusFilter: handleStatusFilter,
    init: init,
    getAllTags: getAllTags
  };
})();

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  TaskApp.init();
});
