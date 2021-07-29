import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import {Todo} from '../../../src/models';
import {App} from '../../../src/server';
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

describe("DELETE /todos/:id", () => {
  it("should delete a todo item", async () => {
    const todo = await testAppContext.todoRepository.save(
      new Todo({
        title: "To be deleted"
      })
    );

    const res = await chai.request(expressApp).delete(`/todo/todos/${todo._id}`);
    
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("success").to.equal(true);
    expect(res.body).to.have.property("deletedCount").to.equal(1);
  });

  it("should throw an error message if the id is not present", async () => {

    const res = await chai.request(expressApp).delete("/todo/todos/asdf");
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("The id is invalid. Please rectify.");
  });

  it("should throw an error message if the id has been deleted already", async () => {

    const res = await chai.request(expressApp).delete("/todo/todos/6102b70eca135d222aa3d402");
    
    expect(res).to.have.status(400);
    expect(res.body).to.have.nested.property("failures[0].message").to.equal("This id was not found. Kindly recheck.");
  });
});
