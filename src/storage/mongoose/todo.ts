import { model, Schema } from 'mongoose';

const todoSchema: Schema = new Schema(
  {
    title: { type: String, required: true }
  },
  {
    collection: "todos"
  }
);

const todo = model("Todo", todoSchema);
export default todo;