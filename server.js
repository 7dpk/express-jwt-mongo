const express = require('express');
const cors = require('cors');
const db = require('./models/');
const Role = db.role;
const dbConfig = require("./db.config");

const app = express();

db.mongoose
    .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connected to MongoDB");
        initial();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    })


app.use(cors({
    origin: '*'
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send({ message: "it's working" })
})

require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

function initial() {
    Role.collection.estimatedDocumentCount((err, count) => {
        if (!err && count == 0) {
            new Role({
                name: 'user'
            }).save(err => {
                if (err) {
                    console.log(err);
                }
                console.log("added user to roles collection")
            })

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'moderator' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    })
}