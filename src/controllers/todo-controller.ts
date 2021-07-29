import { Validation } from '@helpers';
import { AppContext, Errors, ExtendedRequest, ValidationFailure } from '@typings';
import { NextFunction, Response, Router } from 'express';
import { createTodoValidator, deleteTodoValidator } from '@validators';
import { BaseController } from './base-controller';
import { Todo } from '@models';

export class TodoController extends BaseController {
  public basePath: string = '/todo';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.basePath}/todos`, createTodoValidator(this.appContext), this.createTodo);
    this.router.delete(`${this.basePath}/todos/:id`, deleteTodoValidator(this.appContext), this.deleteTodo);
  }

  private createTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);

    if (failures.length > 0) {
      const valError = new Errors.ValidationError(res.__('DEFAULT_ERRORS.VALIDATION_FAILED'), failures);

      return next(valError);
    }

    const { title } = req.body;

    const todo = await this.appContext.todoRepository.save(
      new Todo({
        title,
      })
    );

    res.status(201).json(todo.serialize());
  }

  private deleteTodo = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);

    if(failures.length > 0)
    {
      const valError = new Errors.ValidationError(res.__("DEFAULT_ERRORS.VALIDATION_FAILED"), failures);

      return next(valError);
    }

    const { id } = req.params;

    const deletedTodo = await this.appContext.todoRepository.deleteMany({
      _id: id
    });

    res.status(200).json(deletedTodo);
  }
}
