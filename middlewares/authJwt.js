const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

    if (!token)
        return res.status(403).send({ message: "No token provided" })
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({ message: "Invalid token" })
        }
        req.userId = decoded.id;
        next();
    })
}

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            }, (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (roles.includes('admin')) {
                    next();
                    return;
                }
                res.status(403).send({ message: "admin role required" })
            }

        )
    })
}
isModerator = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return;
        }
        Role.find(
            {
                _id: { $in: user.roles }
            }, (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (roles.includes('moderator')) {
                    next();
                    return;
                }
                res.status(403).send({ message: "moderator role required" })
            }

        )
    })
}

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};

module.exports = authJwt;