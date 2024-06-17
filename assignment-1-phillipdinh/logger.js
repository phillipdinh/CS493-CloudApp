function logger(req, res, next) {
    console.log("== Request received")
    console.log("  -- Method:", req.method)
    console.log("  -- URL:", req.url)
    next()
}

module.exports = logger
