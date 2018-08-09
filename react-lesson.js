//如果你对前端稍微有一点了解，你就顺手拈来：
<div>
    <button onclick={changeText(this)}>取消</button>
</div>
function changeText(e) {
    e.innerText = isLiked ? '取消' : '点赞';
}
// 现在我们来重新编写这个点赞功能，让它具备一定的可复用。
class LikeButton {
    render() {
        return `
        <div>
            <button onclick={changeText(this)}>取消</button>
        </div>
        `
    }
}
// 我们需要这个点赞功能的 HTML 字符串表示的 DOM 结构。
function createDom(html) {
    let div = document.createElement('div');
    div.innerHTML = html;
    return div;
}
class LikeButton {
    render() {
        this.el = createDom(`
            <button>取消</button>
        `);
        this.el.addEventListener('click', () => { console.log('click') });
        return this.el;
    }
}
// 只要稍微改动一下 LikeButton 的代码就可以完成完整的功能
class LikeButton {
    constructor() {
        this.state = {
            isLiked: false
        }
    }
    changeText() {
        this.state.isLiked = !this.state.isLiked;
        this.el.children[0].innerText = this.state.isLiked ? '取消' : '点赞';
    }
    render() {
        this.el = createDom(`
            <button>取消</button>
        `);
        this.el.addEventListener('click', this.changeText.bind(this));
        return this.el;
    }
}
// 一旦状态发生改变，就重新调用 render 方法，构建一个新的 DOM 元素
class LikeButton {
    constructor() {
        this.state = {
            isLiked: false
        }
    }
    setState(state) {
        this.state = state;
        this.render();
    }
    changeText() {
        this.setState({
            isLiked: !this.state.isLiked
        })
    }
    render() {
        this.el = createDom(`
            <button>${this.state.isLiked ? '取消' : '点赞'}</button>
        `);
        this.el.addEventListener('click', this.changeText.bind(this));
        return this.el;
    }
}
// 所以在这个组件外面，你需要知道这个组件发生了改变，并且把新的 DOM 元素更新到页面当中。
class LikeButton {
    constructor() {
        this.state = {
            isLiked: false
        }
    }
    setState(state) {
        this.state = state;
        this.onChange(this.el, this.render());
    }
    changeText() {
        this.setState({
            isLiked: !this.state.isLiked
        })
    }
    render() {
        this.el = createDom(`
            <button>${this.state.isLiked ? '取消' : '点赞'}</button>
        `);
        this.el.addEventListener('click', this.changeText.bind(this));
        return this.el;
    }
}
const button = new LikeButton();
document.body.appendChild(button);
button.onChange = (oEl, nEl) => {
    document.body.insertBefore(nEl, oEl);
    document.body.removeChild(oEl);
}
// 为了让代码更灵活，可以写更多的组件，我们把这种模式抽象出来，放到一个 Component 类当中
class Component {
    constructor(props = {}) {
        this.props = props;
    }
    setState(state) {
        this.state = state;
        this.onChange(this.el, this._render());
    }
    _render() {
        this.el = createDom(this.render());
        this.el.addEventListener('click', this.onClick.bind(this))
        return this.el;
    }
}
const mount = function (component, wrap) {
    wrap.appendChild(component);
    component.onChange = (oEl, nEl) => {
        wrap.insertBefore(nEl, oEl);
        wrap.removeChild(oEl);
    }
}
class LikeButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLiked: false
        }
    }
    onClick() {
        this.setState({
            isLiked: !this.state.isLiked
        })
    }
    render() {
        return `
        <button style="color:${this.props.color};">${this.state.isLiked ? '取消' : '点赞'}</button>
        `
    }
}
mount(new LikeButton({ color: 'red' }), wrap);
// 其实 React.js 内部对待每个组件都有这么一个过程，也就是初始化组件 -> 挂载到页面上的过程
componentWillRecieveProps()
constructor()
componentWillMount()
render()
componentDidMount()
shouldComponentUpdate()
componentWillUpdate()
componentDidUpdate()
componentWillUnmount()
// 高阶组件就是一个函数，传给它一个组件，它返回一个新的组件。
higherComponent(Old)

function higherComponent(Old, name) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.state = { data: null }
        }
        componentWillMount() {
            this.setState({
                data: localStorage.getItem(name)
            })
        }
        render() {
            return <Old data={this.state.data} {...props} />
        }
    }
}
//现在我们把它们集中到一个地方，给这个地方起个名字叫做 store，然后构建一个函数 createStore
function createStore(dispatch) {
    const listeners = [];
    let state = dispatch({});
    return {
        getState: () => { state },
        dispatch: (action) => {
            state = dispatch(state, action);
            listeners.forEach((listener) => { listener() })
        },
        subscribe: (listener) => { listeners.push(listener) }
    }
}

const store = createStore((state = {}, action) => {
    switch (action.type) {
        case 'UPDATE':
            return {
                ...state,
                data: action.data
            }
        default:
            return state;
    }
})
store.subscribe(() => {
    let newState = store.getState();
    if (oldState === newState) {
        renderApp(newState);
        oldState = newState;
    }
})
store.dispatch({ type: 'UPDATE', data: 1 })
// 我们需要高阶组件帮助我们从 context 取数据，我们也需要写 Dumb 组件帮助我们提高组件的复用性。
import React, { Component } from 'react';
import PropTypes from 'prop-types';

connect = (mapStateToProps, mapDispatchToProps) => (Old) => {
    return class extends Component {
        static contextTypes = {
            store: PropTypes.object
        }
        constructor() {
            super();
            this.state = {
                _props: {}
            }
        }
        componentWillMount() {
            this._getProps();
            this.context.store.subscribe(() => {
                this._getProps();
            })
        }
        _getProps() {
            this.setState({
                _props: {
                    ...mapStateToProps(this.context.store.getState()),
                    ...mapDispatchToProps(this.context.store.dispatch),
                    ...this.props
                }
            });
        }
        render() {
            return <Old  {...this._props} />
        }
    }
}
function mapStateToProps(state) {
    return {
        data: state.data
    }
}
function mapDispatchToProps(dispatch) {
    return {
        update: (data) => {
            dispatch({ type: 'UPDATE', data: data });
        }
    }
}
connect(mapStateToProps, mapDispatchToProps)(Old);