const express = require('express');
const {
  postGuide,
  getGuides,
  getTopRated,
  updateGuide,
  deleteGuide,
  getGuideById,
  guideStatics,
} = require('../controllers/guideController');
const { protected } = require('../controllers/userController');
const restrictTo = require('../utils/restrict');
const reviewRouter = require('./reviewRouter');

const router = express.Router();
router
  .route('/')
  .post(protected, restrictTo('admin', 'staff'), postGuide)
  .get(getGuides);
router.get('/top-rated-guides', getTopRated, getGuides);
router.get(
  '/guides-statics',
  protected,
  restrictTo('admin', 'staff'),
  guideStatics
);
router
  .route('/:id')
  .patch(protected, restrictTo('admin', 'staff'), updateGuide)
  .get(getGuideById)
  .delete(protected, restrictTo('admin', 'staff'), deleteGuide);
router.use('/:guideId/review', reviewRouter);
module.exports = router;
