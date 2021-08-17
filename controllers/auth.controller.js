const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;
const Role = db.role;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })

    user.save((err, USER) => {
        if (err) {
            console.log(err);

            res.status(500).send({ message: err });
            return;
        }
        if (req.body.roles) {
            Role.find({
                name: { $in: req.body.roles }
            }, (err, roles) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: err });
                    return
                }
                USER.roles = roles.map(role => role._id);

                USER.save(err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: err })
                        return;
                    }
                    res.status(201).send({ messsage: "USER saved successfully" })
                })
            })
        } else {
            Role.findOne({ name: 'user' }, (err, role) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: err })
                    return;
                }
                USER.roles = [role._id];
                USER.save(err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: err })
                        return;
                    }
                    res.status(201).send({ messsage: "USER saved successfully" })
                })
            })
        }
    })
}

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err })
                return;
            }
            if (!user) {
                return res.status(404).send({ message: "user doesn't exists" })
            }
            let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password"
                })
            }

            const token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 //24 hours
            });

            const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());
            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token
            });
        })
}