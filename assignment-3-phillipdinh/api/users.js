const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  try {
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
    res.status(200).json({
      businesses: userBusinesses
    })
  } catch (e) {
    next(e)
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  try {
    const userReviews = await Review.findAll({ where: { userId: userId }})
    res.status(200).json({
      reviews: userReviews
    })
  } catch (e) {
    next(e)
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  try {
    const userPhotos = await Photo.findAll({ where: { userId: userId }})
    res.status(200).json({
      photos: userPhotos
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router
