import lodash from 'lodash';
import { AppContext } from '@typings';
import { check, ValidationChain } from 'express-validator';

const mongoose = require('mongoose');

const deleteTodoValidator = (appContext: AppContext): ValidationChain[] => [
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

export default deleteTodoValidator;
