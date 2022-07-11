const storage = window.localStorage;

const todoList = document.querySelector('.todo-list');

const addForm = document.querySelector('.add-form');

const addInput = document.querySelector('#add-input');

addForm.onsubmit = (e) => {
    e.preventDefault();
    const newTodo = {
        text: addInput.value,
        checked: false,
    };
    storage.setItem(Date.now(), JSON.stringify(newTodo));
    addInput.value = '';
};

document.addEventListener('click', (e) => {
    // TODO: debug here

    if (e.target.name && e.target.name[0] === 't') {
        const key = e.target.name.slice(1);
        const todo = JSON.parse(storage[key]);
        if (todo.checked) {
            todo.checked = false;
        } else {
            todo.checked = true;
        }
        storage.setItem(key, JSON.stringify(todo));
    }
});

function createTodo(id, todo) {
    console.log(todo);
    return `
        <li class="todo-item">
            <label class="todo-item__content">
                <input
                class="todo-checked"
                type="checkbox"
                name="t${id}"
                ${todo.checked ? 'checked' : ''}
                />
                <div class="checkmark"></div>
                <span class="todo-text">${todo.text}</span>
                <button>Delete</button>
            </label>
        </li>
    `;
}

// const todoContent = todos.reduce((content, todo) => {
//     return content + createTodo(todo);
// }, '');

// todoList.innerHTML = todoContent;

for (let i = 0; i < storage.length; i++) {
    let key = storage.key(i);
    todoList.innerHTML += createTodo(key, JSON.parse(storage[key]));
}

console.log(window.localStorage);
