const express = require('express');
const { postReview, updateReview } = require('../controllers/reviewController');
const { protected } = require('../controllers/userController');
const restrictTo = require('../utils/restrict');

const router = express.Router({ mergeParams: true });

router.route('/').post(protected, restrictTo('user'), postReview);
router.route('/:id').patch(protected, restrictTo('user'), updateReview);
module.exports = router;
