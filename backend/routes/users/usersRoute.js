const express = require('express');
const {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUsersDetailsCtrl
} = require("../../controllers/users/usersCtrl");
const authMiddleware = require('../../middlewares/auth/authMiddleware');

const userRoutes = express.Router();

userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.get('/', authMiddleware, fetchUsersCtrl);
userRoutes.delete('/:id', deleteUsersCtrl);
userRoutes.get('/:id', fetchUsersDetailsCtrl);

module.exports = userRoutes;