// This script creates the users and database
db = db.getSiblingDB('admin');

// Create nodebb database
db = db.getSiblingDB('nodebb');

// Create nodebb user with appropriate permissions
// Values come from environment variables passed to the container
db.createUser({
    user: process.env.NODEBB_USER,
    pwd: process.env.NODEBB_PASSWORD,
    roles: [
        { role: "readWrite", db: "nodebb" },
        { role: "dbAdmin", db: "nodebb" }
    ]
});

db.createUser({
    user: process.env.EXPRESS_MONGO_USER,
    pwd: process.env.EXXPRESS_MONGO_PASSWORD,
    roles: [
        { role: "readWrite", db: "nodebb" },
        { role: "dbAdmin", db: "nodebb" }

    ]
})

// Create any initial collections if needed
db.createCollection("objects");
db.createCollection("sessions");