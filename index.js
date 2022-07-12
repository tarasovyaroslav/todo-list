function getTodosString() {
    return storage.getItem('todos');
}

function getTodosObject() {
    const todoObj = JSON.parse(getTodosString());
    return { ...todoObj };
}

// function getTodoObjectByKey(key) {
//     return getTodosObject()[key];
// }

function setTodos(todos) {
    storage.setItem('todos', JSON.stringify(todos));
    return;
}

function switchTodo(elementName) {
    const key = elementName.slice(1);
    const todos = getTodosObject();
    const todo = todos[key];

    if (todo.checked) {
        todo.checked = false;
    } else {
        todo.checked = true;
    }
    const checkbox = document.querySelector(`#${elementName}`);
    checkbox.checked = todo.checked;

    todos[key] = { ...todo };
    setTodos(todos);
    return;
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
    storage.setItem('todos', '{}');
    return;
}

function createTodoTemplate(id, todo) {
    return `
        <li class="todo-item">
            <label class="todo-item__content">
                <input
                class="todo-checked"
                type="checkbox"
                tabindex="0"
                id="t${id}"
                ${todo.checked ? 'checked' : ''}
                />
                <div class="checkmark"></div>
                <span class="todo-text">${todo.text}</span> 
                <button class="remove-button btn" id="b${id}" tabindex="0">X</button>
            </label>
        </li>
    `;
}

function addTodoToStorage() {
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

    const todos = getTodosObject();
    const newTodos = Object.assign(todos, newTodoItem);

    setTodos(newTodos);
    renderTodos();
    addInput.value = '';
    return;
}

function removeTodoFromStorage(e) {
    const todos = getTodosObject();
    const key = e.target.id.slice(1);
    delete todos[key];
    setTodos(todos);
    renderTodos();
    return;
}

function renderTodos() {
    todoList.innerHTML = '';
    if (isTodosExists && !isTodosEmpty()) {
        const todos = getTodosObject();
        // const parser = new DOMParser();
        Object.keys(todos).forEach((key) => {
            // document.createElement(
            //     'li',
            //     parser.parseFromString(
            //         createTodoTemplate(key, todos[key]),
            //         'text/html'
            //     ).body
            // );
            todoList.innerHTML += createTodoTemplate(key, todos[key]);
        });
    } else {
        initTodoStorage();
        // todoList.insertBefore();
        todoList.innerHTML =
            '<div class="todo-content--empty">Create some todos!</div>';
    }

    // Add click-switch handlers on todo items
    const todoItems = document.querySelectorAll('.todo-checked'); // todo items
    if (isTodosExists() && !isTodosEmpty()) {
        todoItems.forEach((todo) => {
            todo.addEventListener('click', (e) =>
                switchTodo(e.target.id)
            );
            todo.addEventListener('keypress', (e) => {
                switchTodoByKeyboard(e);
            });
            todo.addEventListener('keyup', (e) => {
                e.preventDefault();
            });
        });
    }

    // Add click-remove handlers on todo items
    const removeButtons = document.querySelectorAll('.remove-button');
    removeButtons.forEach((btn) => {
        btn.addEventListener('click', removeTodoFromStorage);
    });
}

/* Main */

const storage = window.localStorage;

const addForm = document.querySelector('.add-form'); // form to creating todo
const addInput = document.querySelector('#add-input'); // text to add to todo item
const todoList = document.querySelector('.todo-list'); // list where placing todo items

// Add todo into local storage and rerender list
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodoToStorage();
    renderTodos();
});

const clearButton = document.querySelector('.clear-button');
clearButton.addEventListener('click', (e) => {
    const ok = confirm(
        'Are you sure? It beyond retrieve remove all todos.'
    );
    if (ok) {
        initTodoStorage();
        renderTodos();
    }
});

// Initial render
renderTodos();
