#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Construct the NodeBB URL
function constructUrl() {
    const domain = process.env.DOMAIN || 'localhost';
    const subdomain = process.env.SUBDOMAIN_NODEBB || '';
    const protocol = process.env.PROTOCOL || 'http://';
    const port = process.env.NODEBB_PORT || '4567';

    let url = protocol;
    if (subdomain) {
        url += subdomain + '.';
    }
    url += domain;

    // Add port if needed
    if ((protocol === 'http://' && port !== '80') ||
        (protocol === 'https://' && port !== '443')) {
        url += ':' + port;
    }

    return url;
}

// Set environment variables for NodeBB setup
function setupEnvironment() {
    // NodeBB setup flag
    process.env.NODEBB_SETUP = 'true';

    // NodeBB URL
    process.env.NODEBB_URL = constructUrl();

    // NodeBB secret
    process.env.NODEBB_SECRET = process.env.NODEBB_SECRET || '';

    // Admin account
    process.env.NODEBB_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    process.env.NODEBB_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
    process.env.NODEBB_ADMIN_PASSWORD_CONFIRM = process.env.ADMIN_PASSWORD || '';
    process.env.NODEBB_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
}

// Create config.json file directly
function createConfigFile() {
    const host = process.env.MONGO_HOST || 'mongo';
    const port = process.env.MONGO_PORT || '27017';
    const username = process.env.MONGO_NODEBB_USERNAME || 'nodebb';
    const password = process.env.MONGO_NODEBB_PASSWORD || '';
    const database = process.env.MONGO_NODEBB_DATABASE || 'nodebb';

    const configPath = path.join(process.cwd(), 'config.json');

    const config = {
        "url": process.env.NODEBB_URL,
        "secret": process.env.NODEBB_SECRET,
        "database": "mongo",
        "mongo": {
            "host": host,
            "port": parseInt(port),
            "username": username,
            "password": password,
            "database": database,
            "uri": `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=${database}`
        }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    console.log(`Created NodeBB config.json file at ${configPath}`);
}

// Run NodeBB setup
function runSetup() {
    console.log('Setting up NodeBB with the following configuration:');
    console.log(`NodeBB URL: ${process.env.NODEBB_URL}`);
    console.log(`MongoDB URI: mongodb://${process.env.MONGO_NODEBB_USERNAME}:${process.env.MONGO_NODEBB_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_NODEBB_DATABASE}?authSource=${process.env.MONGO_NODEBB_DATABASE}`);
    console.log(`Admin Username: ${process.env.NODEBB_ADMIN_USERNAME}`);

    // Check if admin password is set
    if (!process.env.NODEBB_ADMIN_PASSWORD) {
        console.error('ERROR: ADMIN_PASSWORD environment variable is required for setup');
        process.exit(1);
    }

    // Create the config.json file first
    createConfigFile();

    // Add a small delay to ensure MongoDB is ready
    console.log('Waiting a moment for MongoDB to be ready...');
    setTimeout(() => {
        // Run NodeBB setup
        const setup = spawn('./nodebb', ['setup'], {
            stdio: 'inherit',
            env: process.env
        });

        console.log('Setting up NodeBB...')
        setup.on('close', (code) => {
            if (code !== 0) {
                console.error(`Setup process exited with code ${code}`);
                process.exit(code);
            }

            console.log('NodeBB setup completed successfully');
            console.log('Building NodeBB...');

            const build = spawn('./nodebb', ['build'], { stdio: 'inherit' });

            build.on('close', (buildCode) => {
                if (buildCode !== 0) {
                    console.error(`Build process exited with code ${buildCode}`);
                    process.exit(buildCode);
                }

                console.log('NodeBB build completed successfully');
                console.log('Starting NodeBB...');

                spawn('./nodebb', ['start'], { stdio: 'inherit' });
            });
        });
    }, 3000);  // 3-second delay
}

setupEnvironment();
runSetup();