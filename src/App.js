import React, { Component } from 'react';
import './App.css';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import 'normalize.css';
import './reset.css';
import UserDialog from './UserDialog';
import {getCurrentUser,signOut,TodoModel} from './leanCloud';



class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: getCurrentUser() || {},
      newTodo: "",
      todoList: []
    }
    let user = getCurrentUser()
    if (user) {
      TodoModel.getByUser(user,(todos) => {
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy.todoList = todos
        this.setState(stateCopy)
      })
    }
  }
  render() {
    let todos = this.state.todoList.filter((item)=> !item.deleted).map((item,index)=>{
      return (
        <li key={index}>
          <TodoItem todo={item} onToggle={this.toggle.bind(this)} onDelete={this.delete.bind(this)}/>
        </li>
      )
    })
    return (
      <div className="App">
        <h1>{this.state.user.username || '我'}的待办
          {this.state.user.id ? <button onClick={this.signOut.bind(this)}>退出</button> : null}
        </h1>
        <div className="inputWrapper">
          <TodoInput content={this.state.newTodo} onChange={this.changeTitle.bind(this)} onSubmit={this.addTodo.bind(this)}/>
        </div>
        <ol className="todoList">
          {todos}
        </ol>
        {this.state.user.id ? null : <UserDialog onSignUp={this.onSignUpOrSignIn.bind(this)} 
                                                 onSignIn={this.onSignUpOrSignIn.bind(this)}/>}
      </div> 
    );
  }
  signOut(){
    signOut()
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    stateCopy.user = {}
    stateCopy.todoList = []
    this.setState(stateCopy)
  }
  onSignUpOrSignIn(user){
    //消除 不要直接修改state 的警告
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    stateCopy.user = user
    TodoModel.getByUser(user,(todos) => {
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy.todoList = todos
        this.setState(stateCopy)
      })
    this.setState(stateCopy)
  }
  delete(e,todo){
    TodoModel.destroy(todo.id,() => {
      todo.deleted = true
      this.setState(this.state)
    })
  }
  toggle(e,todo){
    let oldStatus = todo.status
    todo.status = todo.status === 'completed'? '': 'completed'
    TodoModel.update(todo,() => {
      this.setState(this.state)
    },(error) => {
      console.log(error)
      todo.status = oldStatus
      this.setState(this.state)
    })
    this.setState(this.state)
  }
  changeTitle(event){
    this.setState({
      newTodo: event.target.value,
      todoList: this.state.todoList
    })
  }
  addTodo(event){
    let newTodo = {
      title: event.target.value,
      status: '',
      deleted: false
    }
    TodoModel.create(newTodo,(id) => {
      newTodo.id = id
      this.state.todoList.push(newTodo)
      this.setState({
        newTodo: '',
        todoList: this.state.todoList
      })
    },(error) => {
      console.log(error)
    })
  }
}
let id = 0
function idMaker(){
  id += 1
  return id
}
export default App;