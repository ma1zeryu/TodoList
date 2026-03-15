class TodoApp {
    constructor() {
        this.todos = [];
        this.filter = 'all';  // 'all','active','completed'
        this.editingId = null;

        //获取DOM元素
        this.todoForm = document.querySelector('.todo-form');
        this.todoInput = document.querySelector('.todo-input');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.clearBtn = document.getElementById('clearCompleted');

        this.init();
    }

    init() {
        //从本地存储加载数据
        this.loadFromStorage();

        //绑定事件监听器
        this.bindEvents();

        //初始渲染
        this.render();
    }

    //生成唯一ID
    generateId(){
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    //添加新的待办事项
    addTodo(text) {
        if(!text.trim()) return;

        const todo = {
            id: this.generateId(),
            text: text.trim(),
            completed: false,
            createAt: new Date().toISOString()
        };

        this.todos.unshift(todo); //新增的事项放在最前面
        this.saveToStorage();
        this.render();

        //清空输入框
        this.todoInput.value = '';
    }

    //删除待办事项
    deleteTodo(id) {
        this.todos = this.todos.find(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    //切换完成状态
    toggleTodo(id) {
        const todo = this.todos.filter(todo => todo.id === id);
        if(todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    //编辑待办事项
    editTodo(id, newText){
        const todo = this.todos.find(todo => todo.id === id);
        if(todo && newText.trim()){
            todo.text = newText.trim();
            this.saveToStorage();
        }

        this.editingId = null;
        this.render();
    }

    //清除已完成的事项
    clearCompleted(){
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToStorage();
        this.render();
    }

    //实现事件处理系统
    bindEvents() {
        //表单提交事件
        this.todoForm.addEventListener('submit', (e)=> {
            e.preventDefault();//阻止提交以及刷新的行为
            this.addTodo(this.todoInput.value);
            console.log(e);
        });

        //待办事项列表的事项委托，因为这里的数据可能动态增加，这样可以避免新增加事件都需要重复绑定
        //事件是绑定在父元素todoList上的，而不是每个子元素
        this.todoList.addEventListener('click', (e) => {
            //找到最近的todo-item来获取id
            const todoItem = e.target.closest('.todo-item');
            if(!todoItem) return;

            const id = todoItem.dataset.id;

            //复选框点击，e.target是用户真正点击的元素
            if(e.target.classList.contains('todo-checkbox')) {
                this.toggleTodo(id);
            }

            //删除按钮点击
            if(e.target.classList.contains('delete-btn')){
                this.deleteTodo(id);
            }

            //文本双击编辑
            if(e.target.classList.contains('todo-text')){
                this.startEdit(id);
            }
        });

        //筛选按钮事件
        this.filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.setFilter(e.target.dataset.filter);
                })
        });

        //清除已完成按钮
        this.clearBtn.addEventListener('click',  () => {
            this.clearCompleted();
        });

        //编辑时的键盘事件
        this.todoList.addEventListener('keydown', (e) => {
            if(e.target.classList.contains('edit-input')){
                if(e.key === 'Enter') {
                    this.finishEdit(e.target);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            }
        });

        //编辑时失去焦点
        this.todoList.addEventListener('blur', (e) => {
            if(e.target.classList.contains('edit-input')) {
                this.finishEdit(e.target);
            }
        }, true);
    }

    //开始编辑
    startEdit(id) {
        this.editingId = id;
        this.render();

        //聚焦到编辑输入框并选中文本
        const editInput = document.querySelector('.edit-input');
        if(editInput) {
            editInput.focus();
            editInput.select();
        }
    }

    //取消编辑
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    //设置筛选条件
    setFilter(filter) {
        this.filter = filter;

        //更新筛选按钮状态
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    //实现渲染系统
    render(){
        //渲染待办事项列表
        this.renderTodos();

        //更新统计信息
        this.updateStats();

        //更新清除按钮状态
        this.updateClearButton();
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();

        if(filteredTodos.length === 0) {
            this.todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const todosHTML = filteredTodos.map(todo => {
            return this.getTodoHTML(todo);
        }).join('');

        this.todoList.innerHTML = todosHTML;
    }

    getFilteredTodos() {
        switch(this.filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    getTodoHTML(todo) {
    const isEditing = this.editingId === todo.id;
    
    if (isEditing) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}">
                <button class="delete-btn" title="删除">×</button>
            </li>
        `;
    }
    
    return `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text" title="双击编辑">${this.escapeHtml(todo.text)}</span>
            <button class="delete-btn" title="删除">×</button>
        </li>
        `;
    }

    getEmptyStateHTML() {
    const messages = {
        all: '还没有任何待办事项<br>点击上方输入框开始添加吧！',
        active: '太棒了！所有任务都已完成 🎉',
        completed: '还没有完成任何任务<br>加油完成你的目标吧！'
    };
    
    return `
        <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-text">${messages[this.filter]}</div>
        </div>
    `;
    }

    updateClearButton() {
        const hasCompleted = this.todos.some(todo => todo.completed);
        this.clearBtn.disabled = !hasCompleted;
    }

    // HTML转义，防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}




