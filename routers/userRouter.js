const express = require('express');
const restrictTo = require('../utils/restrict');

const {
  addUser,
  signIn,
  changePassword,
  protected,
  updateUserRole,
  getAllUsers,
} = require('../controllers/userController');

const router = express.Router();

router.post('/sign-up', addUser);
router.post('/sign-in', signIn);
router.post('/change-password', protected, changePassword);
router.route('/').get(protected, restrictTo('staff', 'admin'), getAllUsers);

router.route('/:id').patch(protected, updateUserRole);

module.exports = router;
