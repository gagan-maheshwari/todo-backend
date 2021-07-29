import { BaseModel } from './base-model'
import { LooseObject } from '@typings';

export class Todos extends BaseModel {
  todos: LooseObject = [];

  constructor(json?: LooseObject) {
    super(json);
    
    if(json) {
      this.todos = json
    }
  }

  public serialize(): LooseObject {
    return this.todos.map((todo: LooseObject) => todo.serialize());
  }
}
