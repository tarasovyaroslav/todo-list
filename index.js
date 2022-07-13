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
        setTodos(todos);
        renderTodos();
    } catch (error) {
        renderTodos();
        console.error(error);
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

    todoContent.append(
        todoCheckbox,
        customCheckmark,
        todoText,
        removeButton
    );
    todoItem.append(todoContent);

    return todoItem;
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

function submitHandler(e) {
    e.preventDefault();
    addTodoToStorage();
    renderTodos();
}

function removeTodoFromStorage(e) {
    const todos = getTodosObject();
    const key = e.target.id.slice(1);
    delete todos[key];
    setTodos(todos);
    renderTodos();
}

function renderTodos() {
    if (!isTodosExists()) {
        initTodoStorage();
    }

    const filter = localStorage.getItem('filter');

    // clear todo layout
    todoList.innerHTML = '';

    if (isTodosEmpty()) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('todo-content--empty');
        emptyMessage.append('Create some todos!');
        todoList.append(emptyMessage);
    } else {
        const todos = getTodosObject();
        Object.keys(todos).forEach((key) => {
            const todo = todos[key];

            switch (filter) {
                case 'completed':
                    if (todo.checked) {
                        todoList.append(createTodoElement(key, todo));
                    }
                    break;
                case 'uncompleted':
                    if (!todo.checked) {
                        todoList.append(createTodoElement(key, todo));
                    }
                    break;
                default:
                    todoList.append(createTodoElement(key, todo));
                    break;
            }
        });

        // Add click-switch handlers on todo items
        addCheckedListeners();

        // Add click-remove handlers on todo items
        addRemoveListeners();
    }

    if (todoList.innerHTML === '') {
        const infoMessage = document.createElement('div');
        infoMessage.classList.add('todo-content--empty');

        let infoText = 'Create some todos!';

        if (filter === 'completed') {
            infoText = 'No completed todos.';
        }

        if (filter === 'uncompleted') {
            infoText = 'Well done! All completed.';
        }

        infoMessage.append(infoText);
        todoList.append(infoMessage);
    }
}

function addCheckedListeners() {
    const todoItems = document.querySelectorAll('.todo-checked'); // todo items
    if (isTodosExists() && !isTodosEmpty()) {
        todoItems.forEach((todo) => {
            todo.addEventListener('click', (e) =>
                switchTodo(e.target.id)
            );
            todo.addEventListener('keypress', (e) => {
                switchTodoByKeyboard(e);
            });

            //prevent default space-key check
            todo.addEventListener('keyup', (e) => {
                e.preventDefault();
            });
        });
    }
}

function addRemoveListeners() {
    const removeButtons = document.querySelectorAll('.remove-button');
    removeButtons.forEach((btn) => {
        btn.addEventListener('click', removeTodoFromStorage);
    });
}

function clearCompletedTodos() {
    const ok = confirm(
        'Are you sure? It beyond retrieve remove all completed todos.'
    );

    if (ok) {
        if (isTodosExists) {
            const todos = getTodosObject();
            const newTodos = {};
            Object.keys(todos).forEach((key) => {
                const todo = todos[key];
                if (!todo.checked) {
                    Object.assign(newTodos, { [key]: { ...todo } });
                }
            });
            setTodos(newTodos);
        }
        renderTodos();
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
    radio.addEventListener('change', setFilter);
}

// Initial render
renderTodos();
