import lodash from 'lodash';
import { AppContext } from '@typings';
import { check, ValidationChain } from 'express-validator';

const mongoose = require('mongoose');

const updateTodoValidator = (appContext: AppContext): ValidationChain[] => [
  check("title", "VALIDATION_ERRORS.INVALID_TITLE").notEmpty(),
  check("title").custom(async (title) => {
    const todo = await appContext.todoRepository.findOne({
      title
    });

    if (!lodash.isEmpty(todo)) {
      return Promise.reject();
    }
  })
  .withMessage("VALIDATION_ERRORS.NO_CHANGES_FOUND"),

  check("id", "VALIDATION_ERRORS.INVALID_ID").notEmpty(),
  check("id").custom(async (id) => {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return Promise.reject();
    }
  })
  .withMessage("VALIDATION_ERRORS.INVALID_ID"),
  check("id").custom(async (id) => {
    const todo = await appContext.todoRepository.findOne({
      _id: id
    });
    if(lodash.isEmpty(todo)) {
      return Promise.reject();
    }
  })
  .withMessage("VALIDATION_ERRORS.ID_NOT_FOUND")
];

export default updateTodoValidator;
