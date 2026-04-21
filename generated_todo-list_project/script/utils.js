/**
 * Utility functions for DOM manipulation, date formatting, and dynamic color generation.
 * Exports as a global Utils namespace since app.js does not use modules.
 */
var Utils = (function() {
  'use strict';

  /**
   * Generate a consistent HSL color string from a seed string.
   * Useful for assigning consistent colors to tags or categories.
   * 
   * @param {string} seed - The seed string to generate the color from
   * @returns {string} HSL color string (e.g., 'hsl(210, 70%, 60%)')
   */
  function generateColor(seed) {
    if (!seed || typeof seed !== 'string') {
      // Default color for empty or invalid seed
      return 'hsl(210, 70%, 60%)';
    }

    // Generate a consistent hash from the seed string
    var hash = 0;
    for (var i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }

    // Generate HSL values based on the hash
    // Hue: 0-360, Saturation: 60-90%, Lightness: 50-70%
    var hue = Math.abs(hash) % 360;
    var saturation = 60 + (Math.abs(hash >> 8) % 30); // 60-89%
    var lightness = 50 + (Math.abs(hash >> 16) % 20); // 50-69%

    return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
  }

  /**
   * Format an ISO date string to a human-readable format.
   * Example: '2024-01-15T10:30:00Z' → 'Mon, Jan 15'
   * 
   * @param {string} dateStr - ISO format date string
   * @returns {string} Formatted date string (e.g., 'Mon, Jan 15')
   */
  function formatDate(dateStr) {
    if (!dateStr) {
      return '';
    }

    try {
      var date = new Date(dateStr);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return '';
      }

      // Get day name (abbreviated)
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var dayName = days[date.getUTCDay()];

      // Get month name (abbreviated)
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var monthName = months[date.getUTCMonth()];

      // Get day of month
      var day = date.getUTCDate();

      return dayName + ', ' + monthName + ' ' + day;
    } catch (e) {
      return '';
    }
  }

  /**
   * Create a DOM fragment for a task item with proper classes and structure.
   * 
   * @param {Object} task - Task object containing properties like title, description, tags, etc.
   * @returns {DocumentFragment} DOM fragment with the task element
   */
  function createTaskElement(task) {
    // Create fragment for the task
    var fragment = document.createDocumentFragment();
    
    // Create main task element
    var taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    
    // Add task ID as data attribute for reference
    if (task.id) {
      taskEl.dataset.id = task.id;
    }
    
    // Create task header
    var headerEl = document.createElement('div');
    headerEl.className = 'task-header';
    
    // Task title
    var titleEl = document.createElement('h3');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title || 'Untitled Task';
    
    // Task description (if provided)
    if (task.description) {
      var descriptionEl = document.createElement('p');
      descriptionEl.className = 'task-description';
      descriptionEl.textContent = task.description;
      headerEl.appendChild(descriptionEl);
    }
    
    headerEl.appendChild(titleEl);
    
    // Task tags (if provided)
    if (task.tags && task.tags.length > 0) {
      var tagsContainer = document.createElement('div');
      tagsContainer.className = 'task-tags';
      
      task.tags.forEach(function(tag) {
        var tagEl = document.createElement('span');
        tagEl.className = 'task-tag';
        tagEl.textContent = tag;
        
        // Assign a consistent color based on the tag name
        tagEl.style.backgroundColor = generateColor(tag);
        
        tagsContainer.appendChild(tagEl);
      });
      
      headerEl.appendChild(tagsContainer);
    }
    
    // Task footer
    var footerEl = document.createElement('div');
    footerEl.className = 'task-footer';
    
    // Task date (if provided)
    if (task.date) {
      var dateEl = document.createElement('span');
      dateEl.className = 'task-date';
      dateEl.textContent = formatDate(task.date);
      footerEl.appendChild(dateEl);
    }
    
    // Task priority (if provided)
    if (task.priority) {
      var priorityEl = document.createElement('span');
      priorityEl.className = 'task-priority';
      priorityEl.textContent = task.priority;
      footerEl.appendChild(priorityEl);
    }
    
    taskEl.appendChild(headerEl);
    taskEl.appendChild(footerEl);
    
    fragment.appendChild(taskEl);
    
    return fragment;
  }

  /**
   * Debounce a function to limit how often it can be called.
   * Useful for throttling UI updates during rapid events like input or resize.
   * 
   * @param {Function} fn - The function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced version of the input function
   */
  function debounce(fn, delay) {
    var timeoutId = null;
    
    return function() {
      var context = this;
      var args = arguments;
      
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  // Return public API
  return {
    generateColor: generateColor,
    formatDate: formatDate,
    createTaskElement: createTaskElement,
    debounce: debounce
  };
})();
