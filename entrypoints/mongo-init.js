print("MongoDB initialization script starting...");

// First authenticate as root user
db = db.getSiblingDB('admin');

// Create and switch to nodebb database
let nodebbDatabase = process.env.MONGO_NODEBB_DATABASE || 'nodebb';
db = db.getSiblingDB(nodebbDatabase);
print(`Using database: ${nodebbDatabase}`);

// Create nodebb user with appropriate permissions
let nodebbUsername = process.env.MONGO_NODEBB_USERNAME || 'nodebb';
let nodebbPassword = process.env.MONGO_NODEBB_PASSWORD || 'secureNodebbPassword456';
print(`Creating user: ${nodebbUsername}`);

db.createUser({
    user: nodebbUsername,
    pwd: nodebbPassword,
    roles: [
        { role: "readWrite", db: nodebbDatabase },
        { role: "dbAdmin", db: nodebbDatabase }
    ]
});

// Create initial collections if needed
db.createCollection("objects");
db.createCollection("sessions");

print("MongoDB initialization script completed successfully");