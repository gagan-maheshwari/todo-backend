import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import {Todo} from '../../../src/models';
import {App} from '../../../src/server';
import {todo} from '../../../src/storage/mongoose';
import {respositoryContext, testAppContext} from '../../mocks/app-context';

chai.use(chaiHttp);
const expect = chai.expect;
let expressApp: Application;

before(async () => {
  await respositoryContext.store.connect();
  const app = new App(testAppContext);

  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();

  expressApp = app.expressApp;
});

describe("POST /todo", () => {
  it("should create a new todo item", async () => {
    const res = await chai
      .request(expressApp)
      .post("/todo/todos")
      .send({
        title: "ATC: Todo Item"
      });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });

  it("should disallow blank todo item", async() => {
    const res = await chai
      .request(expressApp)
      .post("/todo/todos")
      .send({
        title: ""
      });
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message");
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("Please enter a valid todo item");
  });

  it("should disallow any duplicate todo item", async () => {
    await testAppContext.todoRepository.save(new Todo({
      title: "ATC: Duplicate Check Todo Item"
    }));

    const res = await chai
      .request(expressApp)
      .post("/todo/todos")
      .send({
        title: "ATC: Duplicate Check Todo Item"
      });
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message");
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("This todo item already exists. Please try a new one.");
  });
});

describe("GET /todos", () => {
  it("should GET the list of all todo items", async () => {
    const res = await chai.request(expressApp).get(`/todo/todos`);
  
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
  });

  it("should list all todos in the same order as they were created", async () => {    
    await chai.request(expressApp).post("/todo/todos").send({
      title: "ONE",
    });

    await chai.request(expressApp).post("/todo/todos").send({
      title: "TWO",
    });

    await chai.request(expressApp).post("/todo/todos").send({
      title: "THREE",
    });

    const getTodoItemFromMongoose = (data: object) => {
      return new Todo(data).serialize();
    };

    const convertObjectToString = (data: any) => {
      data.id = data.id.toString();
      return data;
    };

    const res = await chai.request(expressApp).get("/todo/todos");
  
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");

    todo.find({}, function (err, data) {
      expect(res.body).to.deep.equal(
        data.map(getTodoItemFromMongoose).map(convertObjectToString)
      );
    });
  });

  it("should return an empty array if there's no todo item", async () => {
    await testAppContext.todoRepository.getAll();
    await testAppContext.todoRepository.deleteMany({});

    const res = await chai.request(expressApp).get("/todo/todos");
    
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.deep.equal([]);
  });
});
