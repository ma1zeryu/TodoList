# TodoList

A first full-stack project of a development novice

针对需要动态添加dom元素的区域的处理

```javascript
//绑定todoList事件采用事件委托写法，把事件绑定到父容器
document.getElementById('todoList').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        console.log('删除');
    }
});

点击 button
↓
事件冒泡到 ul
↓
ul 的 click 事件触发
↓
判断 e.target 是不是 delete-btn
↓
执行删除逻辑

可以避免重复绑定，减少事件监听器，支持动态元素
```
