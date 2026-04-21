// GroceryItem interface (using constructor function for compatibility)
function GroceryItem(id, name, quantity, completed = false) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.completed = completed;
}

// State management
let items = [];
let nextId = 1;

// DOM Elements
const form = document.getElementById('add-item-form');
const itemNameInput = document.getElementById('item-name');
const itemQuantityInput = document.getElementById('item-quantity');
const addBtn = document.getElementById('add-btn');
const groceryList = document.getElementById('grocery-list');

// Initialize the application
function init() {
    loadItemsFromStorage();
    setupEventListeners();
}

// Load items from localStorage and render them
function loadItemsFromStorage() {
    const storedItems = localStorage.getItem('groceryItems');
    
    if (storedItems) {
        try {
            const parsedItems = JSON.parse(storedItems);
            // Filter only valid items
            items = parsedItems.filter(item => 
                item && 
                typeof item.id === 'number' && 
                typeof item.name === 'string' && 
                typeof item.quantity === 'number'
            );
            nextId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
            
            // Render each valid item
            items.forEach(item => {
                const element = renderItem(item);
                groceryList.appendChild(element);
            });
        } catch (e) {
            console.error('Error parsing grocery items from localStorage:', e);
            items = [];
            nextId = 1;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add button click handler
    addBtn.addEventListener('click', addItem);
    
    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addItem();
    });
    
    // Event delegation for checkbox and delete button
    groceryList.addEventListener('click', function(e) {
        const listItem = e.target.closest('li');
        if (!listItem) return;
        
        const id = parseInt(listItem.dataset.id);
        
        if (e.target.classList.contains('delete-btn')) {
            deleteItem(id);
        } else if (e.target.type === 'checkbox') {
            toggleComplete(id);
        }
    });
}

// Create DOM elements for an item
function renderItem(item) {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    if (item.completed) {
        li.classList.add('completed');
    }
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.completed;
    
    // Item name
    const itemName = document.createElement('span');
    itemName.className = 'item-name';
    itemName.textContent = item.name;
    
    // Quantity
    const quantity = document.createElement('span');
    quantity.className = 'item-quantity';
    quantity.textContent = `x${item.quantity}`;
    
    // Actions container
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    
    actions.appendChild(checkbox);
    actions.appendChild(itemName);
    actions.appendChild(quantity);
    actions.appendChild(deleteBtn);
    
    li.appendChild(actions);
    
    return li;
}

// Validate and add a new item
function addItem() {
    const name = itemNameInput.value.trim();
    const quantity = parseInt(itemQuantityInput.value);
    
    // Validation
    if (!name) {
        itemNameInput.classList.add('is-invalid');
        itemNameInput.setAttribute('aria-invalid', 'true');
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        itemQuantityInput.classList.add('is-invalid');
        itemQuantityInput.setAttribute('aria-invalid', 'true');
        return;
    }
    
    // Clear error states
    itemNameInput.classList.remove('is-invalid');
    itemNameInput.setAttribute('aria-invalid', 'false');
    itemQuantityInput.classList.remove('is-invalid');
    itemQuantityInput.setAttribute('aria-invalid', 'false');
    
    // Create new item
    const newItem = new GroceryItem(nextId++, name, quantity, false);
    items.push(newItem);
    
    // Render and append to list
    const element = renderItem(newItem);
    groceryList.appendChild(element);
    
    // Update localStorage
    saveItemsToStorage();
    
    // Clear form inputs
    itemNameInput.value = '';
    itemQuantityInput.value = '';
    itemNameInput.focus();
}

// Toggle item completion status
function toggleComplete(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        
        // Toggle class on DOM element
        const listItem = groceryList.querySelector(`li[data-id="${id}"]`);
        if (listItem) {
            listItem.classList.toggle('completed');
        }
        
        // Update localStorage
        saveItemsToStorage();
    }
}

// Delete an item
function deleteItem(id) {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        
        // Remove from DOM
        const listItem = groceryList.querySelector(`li[data-id="${id}"]`);
        if (listItem) {
            listItem.remove();
        }
        
        // Update localStorage
        saveItemsToStorage();
    }
}

// Save items to localStorage
function saveItemsToStorage() {
    localStorage.setItem('groceryItems', JSON.stringify(items));
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
