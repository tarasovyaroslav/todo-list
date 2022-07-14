function getTodosString() {
    return localStorage.getItem('todos');
}

function getTodosObject() {
    const todoObj = JSON.parse(getTodosString());

    return { ...todoObj };
}

function setTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function sendTodosToStorage() {
    const todoNodes = document.querySelectorAll(
        '.todo-item__content'
    );
    const todosObj = {};
    todoNodes.forEach((todo) => {
        const id = todo.childNodes[0].id.slice(1);
        const checked = todo.childNodes[0].checked;
        const text = todo.childNodes[2].innerHTML;
        todosObj[id] = { text, checked };
    });
    localStorage.setItem('todos', JSON.stringify(todosObj));
}

function setFilter(e) {
    const radioValue = e.target.value;
    localStorage.setItem('filter', radioValue);
    renderTodos();
}

function switchTodo(elementId) {
    try {
        const key = elementId.slice(1);
        const todos = getTodosObject();
        const todo = todos[key];

        todo.checked = !todo.checked;

        const checkbox = document.querySelector(`#${elementId}`);
        checkbox.checked = todo.checked;

        todos[key] = { ...todo };

        filterTodos();
        sendTodosToStorage();
    } catch (error) {
        renderTodos();
        console.error('Something went wrong with local storage');
        console.log(error);
    }
}

function switchTodoByKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        switchTodo(document.activeElement.id);
    }
}

function isTodosExists() {
    const todos = getTodosString();

    return todos !== null;
}

function isTodosEmpty() {
    const todos = getTodosString();

    return todos === '{}';
}

function initTodoStorage() {
    localStorage.setItem('todos', '{}');
    localStorage.setItem('filter', 'all');
}

// function createTodoTemplate(id, todo) {
//     return `
//         <li class="todo-item">
//             <label class="todo-item__content">
//                 <input
//                 class="todo-checked"
//                 type="checkbox"
//                 tabindex="0"
//                 id="t${id}"
//                 ${todo.checked ? 'checked' : ''}
//                 />
//                 <div class="checkmark"></div>
//                 <span class="todo-text">${todo.text}</span>
//                 <button class="remove-button btn" id="b${id}" tabindex="0">X</button>
//             </label>
//         </li>
//     `;
// }

function createTodoElement(id, todo) {
    const todoItem = document.createElement('li');
    todoItem.classList.add('todo-item');
    todoItem.setAttribute('id', `i${id}`);

    const todoContent = document.createElement('label');
    todoContent.classList.add('todo-item__content');

    const todoCheckbox = document.createElement('input');
    todoCheckbox.classList.add('todo-checked');
    todoCheckbox.setAttribute('type', 'checkbox');
    todoCheckbox.setAttribute('tabindex', '0');
    todoCheckbox.setAttribute('id', `t${id}`);
    if (todo.checked) {
        todoCheckbox.setAttribute('checked', 'checked');
    }

    todoCheckbox.addEventListener('click', (e) =>
        switchTodo(e.target.id)
    );
    todoCheckbox.addEventListener('keypress', (e) => {
        switchTodoByKeyboard(e);
    });

    //prevent default space-key check
    todoCheckbox.addEventListener('keyup', (e) => {
        e.preventDefault();
    });

    const customCheckmark = document.createElement('div');
    customCheckmark.classList.add('checkmark');

    const todoText = document.createElement('span');
    todoText.classList.add('todo-text');
    todoText.append(todo.text);

    const removeButton = document.createElement('button');
    removeButton.classList.add('btn', 'remove-button');
    removeButton.setAttribute('id', `b${id}`);
    removeButton.setAttribute('tabindex', '0');
    removeButton.append('X');
    removeButton.addEventListener('click', removeTodo);

    todoContent.append(
        todoCheckbox,
        customCheckmark,
        todoText,
        removeButton
    );
    todoItem.append(todoContent);
    return todoItem;
}

function addTodo() {
    if (addInput.value.trim() === '') {
        alert('Write some todo text!');
        return;
    }

    if (!isTodosExists) {
        initTodoStorage();
    }

    // Prevent some code injection
    const specialChars = {
        '&': '&amp;',
        '"': '&quot',
        "'": '&#039;',
        '<': '&lt;',
        '>': '&gt;',
    };
    let newText = addInput.value;
    Object.keys(specialChars).forEach((char) => {
        newText = newText.replaceAll(char, specialChars[char]);
    });

    const id = Date.now();
    const newTodoItem = {
        [id]: {
            text: newText,
            checked: false,
        },
    };

    const todo = createTodoElement(id, newTodoItem[id]);
    todoList.append(todo);

    filterTodos();
    sendTodosToStorage();
    addInput.value = '';
}

function submitHandler(e) {
    e.preventDefault();
    addTodo();
}

function removeTodo(e) {
    const todo = document.querySelector(`#i${e.target.id.slice(1)}`);
    todo.remove();

    //here
    showEmptyMessage();

    sendTodosToStorage();
}

function filterTodos() {
    const todos = document.querySelectorAll('.todo-item');
    const filterButton = document.querySelector(
        'input[name=filter]:checked'
    );
    const filter = filterButton.value;

    todos.forEach((todo) => {
        const checked = todo.childNodes[0].childNodes[0].checked;
        todo.classList.remove('todo-item--hidden');
        switch (filter) {
            case 'completed':
                if (!checked) {
                    todo.classList.add('todo-item--hidden');
                }
                break;
            case 'uncompleted':
                if (checked) {
                    todo.classList.add('todo-item--hidden');
                }
                break;
        }
    });

    //here
    showEmptyMessage();
}

function renderTodos() {
    if (!isTodosExists()) {
        initTodoStorage();
    }

    todoList.innerHTML = '';

    if (isTodosEmpty()) {
        showEmptyMessage();
    } else {
        const todos = getTodosObject();
        Object.keys(todos).forEach((key) => {
            const todo = todos[key];
            todoList.append(createTodoElement(key, todo));
        });
    }
}

function isSomeTodosDisplayed() {
    const todos = document.querySelectorAll('.todo-item');
    for (let todo of todos) {
        if (!todo.classList.contains('todo-item--hidden')) {
            return true;
        }
    }

    return false;
}

function createEmptyMessage(message) {
    const emptyMessage = document.createElement('div');
    emptyMessage.setAttribute('id', 'todo-content__empty-message');
    emptyMessage.append(message);
    return emptyMessage;
}

// Show message for empty list
function showEmptyMessage() {
    const filterButton = document.querySelector(
        'input[name=filter]:checked'
    );
    const filter = filterButton.value;

    const message = document.getElementById(
        'todo-content__empty-message'
    );
    if (!!message) {
        console.log(message);
        message.remove();
    }

    if (!isSomeTodosDisplayed()) {
        let infoText = 'Create some todos!';

        if (filter === 'completed') {
            infoText = 'No completed todos.';
        }

        if (filter === 'uncompleted') {
            infoText = 'Well done! All completed.';
        }

        const infoMessage = createEmptyMessage(infoText);

        // infoMessage.append(infoText);
        todoList.append(infoMessage);
    }
}

function clearCompletedTodos() {
    const ok = confirm(
        'Are you sure? It beyond retrieve remove all completed todos.'
    );

    if (ok) {
        const todos = document.querySelectorAll('.todo-item');
        const newTodos = {};
        Object.keys(todos).forEach((key) => {
            const todo = todos[key];
            if (todo.childNodes[0].childNodes[0].checked) {
                todo.remove();
            }
        });

        //here
        showEmptyMessage();

        sendTodosToStorage();
    }
}

/* -- Main -- */

const addInput = document.querySelector('#add-input'); // text to add to todo item
const todoList = document.querySelector('.todo-list'); // list where placing todo items

// Add todo into local storage and rerender list
const addForm = document.querySelector('.add-form'); // form to creating todo
addForm.addEventListener('submit', submitHandler);

// Remove completed todos
const clearButton = document.querySelector('.clear-button');
clearButton.addEventListener('click', clearCompletedTodos);

const filterButtons = document.querySelectorAll(
    'input[name="filter"]'
);

for (const radio of filterButtons) {
    radio.addEventListener('change', filterTodos /*setFilter*/);
}

// Initial render
renderTodos();
