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
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    //切换完成状态
    toggleTodo(id) {
        const todo = this.todos.filter(todo => todo.id === id);
        if(todo) {
            toso.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    //编辑待办事项
    editTodo(id, newText){
        const todo = this.todos.filter(todo => todo.id === id);
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
}