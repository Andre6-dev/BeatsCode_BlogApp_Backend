const express = require('express');
const {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUsersDetailsCtrl
} = require("../../controllers/users/usersCtrl");

const userRoutes = express.Router();

userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.get('/', fetchUsersCtrl);
userRoutes.delete('/:id', deleteUsersCtrl);
userRoutes.get('/:id', fetchUsersDetailsCtrl);

module.exports = userRoutes;