const express = require("express")
const app = express()

const logger = require("./logger")

const businesses = require("./data/businesses.json")
const photos = require("./data/photos.json")
const reviews = require("./data/reviews.json")

app.use(express.json())
app.use(logger)

//TODO Check id param validity
/////////////////////////////////////////////////////////////////////////
////////////////////////////// Businesses ///////////////////////////////

// Get list of 10 businesses
app.get("/businesses", function (req, res, next) {
    console.log("  -- req.query:", req.query)

    if (businesses.length > 0) {
        let page = parseInt(req.query.page) || 1
        const pageSize = 10
        const lastPage = Math.ceil(businesses.length / pageSize)
        page = page < 1 ? 1 : page
        page = page > lastPage ? lastPage : page

        const start = (page - 1) * pageSize
        const end = start + pageSize
        const businessesPage = businesses.slice(start, end)

        const links = {}
        if (page < lastPage) {
            links.nextPage = `/businesses?page=${page + 1}`
            links.lastPage = `/businesses?page=${lastPage}`
        }
        if (page > 1) {
            links.prevPage = `/businesses?page=${page - 1}`
            links.firstPage = `/businesses?page=1`
        }

        res.status(200).send({
            businesses: businessesPage,
            page: page,
            pageSize: pageSize,
            lastPage: lastPage,
            total: businesses.length,
            links: links
        })
    } else {
        res.status(204).send({
            message: `No businesses found`
        })
    }
})

app.post("/businesses", function (req, res, next) {
    console.log(" --req.body:", req.body)
    if (
        req.body &&
        req.body.ownerid &&
        req.body.name &&
        req.body.address &&
        req.body.city &&
        req.body.state &&
        req.body.zip &&
        req.body.phone &&
        req.body.category &&
        req.body.subcategory
    ) {
        res.status(201).send({
            id: businesses.length,
            ...req.body
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `ownerid` `name` `address` `city` `state` `zip` `phone` `category` `subcategory`"
        })
    }
})

// Modify business
app.patch("/businesses/:id", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.id)
    const ownerId = parseInt(req.body.ownerid)

    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    console.log(" --business:", business)
    console.log(ownerId)
    if (
        req.body &&
        req.body.ownerid !== undefined &&
        ownerId === business.ownerid
    ) {
        res.status(200).send({
            message: `Business with id: ${businessId} has been modified`,
            ...req.body
        })
    } else if (req.body.ownerid !== undefined && ownerId !== business.ownerid) {
        res.status(401).send({
            err: `Unauthorized to modify business with id: ${businessId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `ownerid`"
        })
    }
})

// Delete business
app.delete("/businesses/:id", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.id)
    const ownerId = parseInt(req.body.ownerid)
    const businessIdx = businesses.findIndex(
        (business) => business.id == businessId
    )

    if (businessIdx === -1) {
        next()
    }
    if (
        req.body &&
        req.body.ownerid !== undefined &&
        businesses[businessIdx].ownerid === ownerId
    ) {
        businesses.splice(businessIdx, 1)
        res.status(200).send({
            message: `Business with id: ${businessId} has been deleted`
        })
    } else if (
        // Check if correct ownerid is given
        req.body.ownerid !== undefined &&
        ownerId !== businesses[businessIdx].ownerid
    ) {
        res.status(401).send({
            err: `Unauthorized to delete business with id: ${businessId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `ownerid`"
        })
    }
})

// Get specific business
app.get("/businesses/:id", function (req, res, next) {
    console.log("  -- req.params:", req.params)

    const id = parseInt(req.params.id)
    const business = businesses.find((business) => business.id === id)
    const myReviews = reviews.filter((review) => review.businessid === id)
    const myPhotos = photos.filter((photo) => photo.businessid === id)

    if (business !== undefined) {
        res.status(200).send({
            business: business,
            reviews: myReviews,
            photos: myPhotos
        })
    } else {
        next()
    }
})

/////////////////////////////////////////////////////////////////////////
/////////////////////////////// Reviews ////////////////////////////////

// Create new review
app.post("/businesses/:businessid/reviews", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }
    const stars = parseInt(req.body.stars)
    const dollars = parseInt(req.body.dollars)
    if (stars > 5 || stars < 0) {
        res.status(400).send({
            err: "Stars rating must be in the range of 0...5"
        })
    } else if (dollars > 4 || dollars < 1) {
        res.status(400).send({
            err: "Dollars rating must be in the range of 1...4"
        })
    } else if (
        req.body &&
        req.body.userid !== undefined &&
        req.body.stars !== undefined &&
        req.body.dollars !== undefined
    ) {
        res.status(201).send({
            id: reviews.length,
            businessid: businessId,
            ...req.body
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid` `stars` `dollars`"
        })
    }
})
// Modify Reviews
app.patch("/businesses/:businessid/reviews", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    const reviewId = parseInt(req.body.reviewid)
    const userId = parseInt(req.body.userid)

    const review = reviews.find((review) => review.id === reviewId)

    if (
        req.body &&
        req.body.userid !== undefined &&
        req.body.reviewid !== undefined &&
        review !== undefined &&
        userId === review.userid
    ) {
        res.status(200).send({
            message: `Review with id: ${reviewId} has been modified`,
            ...req.body
        })
    } else if (
        req.body.userid !== undefined &&
        req.body.reviewid !== undefined &&
        userId !== review.userid
    ) {
        // Check if correct ownerid is given
        res.status(401).send({
            err: `Unauthorized to modify review with id: ${reviewId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid` `reviewid` "
        })
    }
})

// Delete reviews
app.delete("/businesses/:businessid/reviews", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    const reviewId = parseInt(req.body.reviewid)
    const userId = parseInt(req.body.userid)
    const reviewIdx = reviews.findIndex(
        (review) => review.id == parseInt(reviewId)
    )

    if (
        req.body &&
        req.body.userid !== undefined &&
        req.body.reviewid !== undefined &&
        reviewIdx !== -1 &&
        reviews[reviewIdx].userid === userId
    ) {
        reviews.splice(reviewIdx, 1)
        res.status(200).send({
            message: `review with id: ${reviewId} has been deleted`
        })
    } else if (
        req.body.userid !== undefined &&
        req.body.reviewid !== undefined &&
        reviewIdx !== -1 &&
        reviews[reviewIdx].userid !== userId
    ) {
        res.status(401).send({
            err: `Unauthorized to delete review with id: ${reviewId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid` `reviewid` "
        })
    }
})

/////////////////////////////////////////////////////////////////////////
//////////////////////////////// Photos /////////////////////////////////

// Upload new Photo
app.post("/businesses/:businessid/photos", function (req, res, next) {
    console.log(" --req.body:", req.body)
    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    if (req.body && req.body.userid !== undefined) {
        res.status(201).send({
            id: photos.length,
            businessid: businessId,
            ...req.body
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid`"
        })
    }
})

// Modify business
app.patch("/businesses/:businessid/photos", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    const photoId = parseInt(req.body.photoid)
    const userId = parseInt(req.body.userid)
    const photo = photos.find((photo) => photo.id === photoId)

    if (
        req.body &&
        req.body.userid !== undefined &&
        req.body.photoid !== undefined &&
        userId === photo.userid
    ) {
        res.status(200).send({
            message: `photo with id: ${photoId} has been modified`,
            ...req.body
        })
    } else if (
        req.body.userid !== undefined &&
        req.body.photoid !== undefined &&
        userId !== photo.userid
    ) {
        res.status(401).send({
            err: `Unauthorized to modify photo with id: ${photoId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid` `photoid`"
        })
    }
})

// Delete photo
app.delete("/businesses/:businessid/photos", function (req, res, next) {
    console.log("  -- req.params:", req.params)
    console.log(" --req.body:", req.body)

    const businessId = parseInt(req.params.businessid)
    const business = businesses.find((business) => business.id === businessId)

    if (business === undefined) {
        next()
    }

    const userId = parseInt(req.body.userid)
    const photoId = parseInt(req.body.photoid)
    const photoIdx = photos.findIndex((photo) => photo.id == photoId)

    if (
        req.body &&
        req.body.userid !== undefined &&
        req.body.photoid !== undefined &&
        photoIdx !== -1 &&
        photos[photoIdx].userid === userId
    ) {
        photos.splice(photoIdx, 1)
        res.status(200).send({
            message: `photo with id: ${photoId} has been deleted`
        })
    } else if (
        req.body.userid !== undefined &&
        req.body.photoid !== undefined &&
        photoIdx !== -1 &&
        photos[photoIdx].userid !== userId
    ) {
        res.status(401).send({
            err: `Unauthorized to delete photo with id: ${photoId}`
        })
    } else {
        res.status(400).send({
            err: "Request needs a JSON body with `userid` `photoid`"
        })
    }
})

/////////////////////////////////////////////////////////////////////////
///////////////////////////////// User //////////////////////////////////

// List all businesses a user owns.
app.get("/users/:id/businesses", function (req, res, next) {
    console.log("  -- req.query:", req.query)

    const ownerId = parseInt(req.params.id)
    if (ownerId === undefined) {
        next()
    }

    const myBusinesses = businesses.filter(
        (business) => business.ownerid === ownerId
    )

    if (myBusinesses.length > 0) {
        res.status(200).send({
            businesses: myBusinesses
        })
    } else {
        res.status(204).send({
            message: `No business found`
        })
    }
})
// List all of reviews user has written
app.get("/users/:id/reviews", function (req, res, next) {
    console.log("  -- req.query:", req.query)

    const userId = parseInt(req.params.id)
    if (userId === undefined) {
        next()
    }

    const myReviews = reviews.filter((review) => review.userid === userId)

    if (myReviews.length > 0) {
        res.status(200).send({
            reviews: myReviews
        })
    } else {
        res.status(204).send({
            message: `No reviews found`
        })
    }
})
// List all photos user has uploaded

app.get("/users/:id/photos", function (req, res, next) {
    console.log("  -- req.query:", req.query)

    const userId = parseInt(req.params.id)
    if (userId === undefined) {
        next()
    }

    const myPhotos = photos.filter((photo) => photo.userid === userId)

    if (myPhotos.length > 0) {
        res.status(200).send({
            photos: myPhotos
        })
    } else {
        res.status(204).send({
            message: `No photos found`
        })
    }
})
////////////////////////////////////////////////////////////////////////
app.use("*", function (req, res, next) {
    res.status(404).send({
        err: `Requested URL doesn't exist: ${req.originalUrl}`
    })
})
app.listen(8000, function () {
    console.log("== Server is listening on port 8000")
})
