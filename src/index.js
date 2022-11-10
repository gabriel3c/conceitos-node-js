const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExist = users.find((user) => user.username === username);

  if (!userExist) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = userExist;

  return next();
}

function checksExistsUsername(request, response, next) {
  const { username } = request.body;

  const userNameExists = users.find((user) => user.username === username);
  if (userNameExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  return next();
}

app.post("/users", checksExistsUsername, (request, response) => {
  const { username, name } = request.body;

  const newUser = {
    username,
    name,
    id: uuidv4(),
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  todo.done = true;

  // user.todos = user.todos.map((todo) =>
  //   todo.id === id ? { ...todo, done: true } : todo
  // );

  return response.status(201).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) return response.status(404).json({ error: "Todo not found" });

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;
