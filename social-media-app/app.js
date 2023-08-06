require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect("");

const User = mongoose.model("user", new mongoose.Schema({
    mailAddress: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    twoFactorialVerification: Boolean,
    code: String,
    codeDifferenceTime: Date,
    mailAddressChangeVerifyCode: String
}));

const Profile = mongoose.model("profile", new mongoose.Schema({
    userId: {
        required: true,
        type: mongoose.SchemaTypes.ObjectId
    },
    avatar: String,
    fullname: {
        required: true,
        type: String
    },
    description: String,
    offset: Number
}));

const Post = mongoose.model("post", new mongoose.Schema({
    profileId: {
        required: true,
        type: mongoose.SchemaTypes.ObjectId
    },
    publishDate: {
        required: true,
        type: Date
    },
    unpublishDate: Date,
    content: {
        required: true,
        type: String,
        minlength: 50
    }
}));

const jwt = require("jsonwebtoken");

function generate_token(body) {
    return jwt.sign(body, process.env.JWT_SIGN_KEY, null, null);
}

function generate_body_from_token(token) {
    return jwt.verify(token, process.env.JWT_SIGN_KEY, null, null);
}

console.log(generate_token({
    mailAddress: "muhammetunatadina@gmail.com",
    password: "0101asdasdTRT"
}));

const httpCodes = {
    200: "OK",
    400: "Bad Request"
};

function generate_body(result = undefined, code = 200, error = undefined) {
    return {
        code,
        message: httpCodes[code],
        error,
        result
    };
}

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gegirsocialmedia@gmail.com",
        pass: "jgjoguynmchyabmi"
    }
});

function generate_mail_body(to, subject, html) {
    return {
        from: "gegirsocialmedia@gmail.com",
        to,
        subject,
        html
    };
}

function send_mail(body) {
    transporter.sendMail(generate_mail_body(body.to, body.subject, body.html));
}

const express = require("express");

const app = express();

app.use(express.json());

const api = express.Router();

api.post("/user/login", (req, res) => {
    let { tk, mailAddress, password } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (mailAddress) {
        mailAddress = decodeURIComponent(mailAddress)
            .trim()
            .toLowerCase();
    }
    if (password) {
        password = decodeURIComponent(password).trim();
    }
    User.findOne({
        mailAddress: mailAddress,
        password: password
    }).then((result) => {
        if (result) {
            if (result.twoFactorialVerification) {
                const { uuid } = require("uuidv4");
                result.code = uuid()
                    .substring(1, 6)
                    .replace("-", "");
                result.codeDifferenceTime = new Date(Date.now());
                (async () => await result.save())();
                send_mail({
                    to: mailAddress,
                    subject: "gegir sosyal medya hesabınızı doğrulamanız için onay kodu",
                    html: `<b>Merhaba, ${mailAddress}</b> / gegir sosyal medya hesabınızı doğrulayabilmeniz için onay kodunuz: ${result.code}`
                });
                return res.send(generate_body("description.user.verification_code_sent"));
            }
            return res.send(generate_body(generate_token({
                mailAddress
            })));
        }
        res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
    });
});

api.post("/user/verify", (req, res) => {
    let { mailAddress, password, code } = req.query;
    if (mailAddress) {
        mailAddress = decodeURIComponent(mailAddress)
            .toLowerCase()
            .trim();
    }
    if (password) {
        password = decodeURIComponent(password)
            .trim();
    }
    if (code) {
        code = decodeURIComponent(code)
            .trim();
    }
    User.findOne({
        mailAddress: mailAddress,
        password: password
    }).then((result) => {
        if (result) {
            if (result.twoFactorialVerification && result.code !== code) {
                return res.status(400).send(generate_body(undefined, 400, "description.user.verification_code_incorrect"));
            }
            return res.send(generate_body(generate_token({
                mailAddress
            })));
        }
        res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
    });
});

api.post("/user/set", (req, res) => {
    let { tk, name, value } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (tokenBody) {
        return User.findOne({
            mailAddress: tokenBody.mailAddress
        }).then((result) => {
            if (result) {
                if (name) {
                    name = decodeURIComponent(name).trim();
                }
                if (value) {
                    value = decodeURIComponent(value).trim();
                }
                if (name === "mailAddress") {
                    const { uuid } = require("uuidv4");
                    result.mailAddressChangeVerifyCode = uuid()
                        .substring(1, 8)
                        .replace("-", "");
                    send_mail({
                        to: value,
                        subject: "gegir sosyal medya hesabınızın E-posta adresini değiştirmek için onay kodu",
                        html: `<b>Merhaba, ${tokenBody.mailAddress} (${value})</b> / gegir sosyal medya hesabınızın E-posta adresini değiştirebilmeniz için onay kodunuz: ${result.mailAddressChangeVerifyCode}`
                    });
                } else {
                    if (name === "twoFactorialVerification" && value.toLowerCase() === "false") {
                        result[name] = undefined;
                        result.code = undefined;
                        result.codeDifferenceTime = undefined;
                    } else {
                        result[name] = value;
                    }
                }
                (async () => await result.save())();
                return res.send(generate_body(name === "mailAddress" ? "description.user.mail_change_verification_code_sent" : "description.user.setting_set"));
            }
            res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
        });
    }
    res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
});

api.get("/user/self", (req, res) => {
    let { tk } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (tokenBody) {
        return User.findOne({
            mailAddress: tokenBody.mailAddress
        }).then((result) => {
            if (result) {
                result._id = undefined;
                result.password = undefined;
                result.code = undefined;
                result.codeDifferenceTime = undefined;
                return res.send(generate_body(result));
            }
            res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
        });
    }
    res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
});

api.get("/user/profile", (req, res) => {
    let { tk } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (tokenBody) {
        return User.findOne({
            mailAddress: tokenBody.mailAddress
        }).then((result) => {
            if (result) {
                return Profile.findOne({
                    userId: result._id
                }).then((result_2) => {
                    if (result_2) {
                        return res.send(generate_body(result_2));
                    }
                    res.status(400).send(generate_body(undefined, 400, "description.profile.not_found"));
                });
            }
            res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
        });
    }
    res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
});

api.post("/profile", (req, res) => {
    let { tk } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (tokenBody) {
        return User.findOne({
            mailAddress: tokenBody.mailAddress
        }).then((result) => {
            if (result) {
                return Profile.findOne({
                    userId: result._id
                }).then((result_2) => {
                    if (result_2) {
                        return res.status(400).send(generate_body(undefined, 400, "description.profile.not_found"));
                    }
                    let { fullname, description } = req.query;
                    if (fullname) {
                        fullname = decodeURIComponent(fullname)
                            .trim();
                    }
                    if (description) {
                        description = decodeURIComponent(description)
                            .trim();
                    }
                    const profile = new Profile({
                        userId: result._id,
                        fullname,
                        description
                    });
                    (async () => await profile.save())();
                    res.send(generate_body("description.profile.formed"));
                });
            }
            res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
        });
    }
    res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
});

api.get("/post", (req, res) => {
    let { ref } = req.query;
    if (ref) {
        ref = decodeURIComponent(ref)
            .trim();
        Post.findOne({
            ref: ref
        }).then((result) => {
            if (result) {
                return res.send(generate_body(result));
            }
            res.status(400).send(generate_body(undefined, 400, "description.post.not_found"));
        });
    } else {
        let { tk } = req.query;
        let tokenBody;
        if (tk) {
            tk = decodeURIComponent(tk)
                .trim();
            tokenBody = generate_body_from_token(tk);
        }
        if (tokenBody) {
            return User.findOne({
                mailAddress: tokenBody.mailAddress
            }).then((result) => {
                if (result) {
                    return Profile.findOne({
                        userId: result._id
                    }).then((result_2) => {
                        if (result_2) {
                            return Post
                                .find()
                                .skip(result_2.offset)
                                .limit(20)
                                .then((result_3) => {
                                    if (result_3) {
                                        result_2.offset += 20;
                                        (async () => result_2.save())();
                                        return res.send(generate_body(result_3));
                                    }
                                    res.status(400).send(generate_body(undefined, 400, "description.post.list_error_occurred"));
                                });
                        }
                        res.status(400).send(generate_body(undefined, 400, "description.profile.not_found"));
                    });
                }
                res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
            });
        }
        res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
    }
});

api.post("/post", (req, res) => {
    let { tk } = req.query;
    let tokenBody;
    if (tk) {
        tk = decodeURIComponent(tk)
            .trim();
        tokenBody = generate_body_from_token(tk);
    }
    if (tokenBody) {
        User.findOne({
            mailAddress: tokenBody.mailAddress
        }).then((result) => {
            if (result) {
                return Profile.findOne({
                    userId: result._id
                }).then((result_2) => {
                    if (result_2) {
                        const post = new Post({
                            profileId: result_2._id,
                            publishDate: new Date(Date.now()),
                            unpublishDate: new Date(decodeURIComponent(req.query.unpublishDate).trim()),
                            content: decodeURIComponent(req.query.content).trim()
                        });
                        (async () => await post.save())();
                        return res.send(generate_body("description.post.sent"));
                    }
                    res.status(400).send(generate_body(undefined, 400, "description.profile.not_found"));
                });
            }
            res.status(400).send(generate_body(undefined, 400, "description.user.not_found"));
        });
    }
    res.status(400).send(generate_body(undefined, 400, "description.user.token_incorrect"));
});

app.use("/api", api);

app.listen(80);
