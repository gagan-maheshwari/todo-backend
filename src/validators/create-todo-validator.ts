import lodash from 'lodash';
import { AppContext } from '@typings';
import { check, ValidationChain } from 'express-validator';

const createTodoValidator = (appContext: AppContext): ValidationChain[] => [
  check('title', 'VALIDATION_ERRORS.INVALID_TITLE').notEmpty(),
  check('title').custom(async (title) => {
    const todo = await appContext.todoRepository.findOne({
      title
    });

    if (!lodash.isEmpty(todo)) {
      return Promise.reject();
    }
  })
  .withMessage('VALIDATION_ERRORS.DUPLICATE_ENTRY')
];

export default createTodoValidator;
