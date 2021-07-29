import { LooseObject } from '@typings';
import { BaseModel } from './base-model';

export class Todo extends BaseModel {
  title: string;

  constructor(json?: any) {
    super(json);

    if (json) {
      this.title = json.title;
    }
  }

  public serialize(): LooseObject {
    return {
      id: this._id,
      title: this.title
    };
  }
}
