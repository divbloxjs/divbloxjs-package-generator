#!/usr/bin/env node

const fs = require("fs");
const fsAsync = require("fs").promises;
const path = require('path')
const dxUtils = require('dx-utils');
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates')

const filesToCreate = {
    "Package": {"location": "package.json",
        "template": TEMPLATE_DIR+'/configs/package.json',
        "tokens":["appName"]},
    "Data model": {"location": "divblox-config/data-model.json",
        "template": TEMPLATE_DIR+'/configs/data-model.json'},
    "Divblox Config": {"location": "divblox-config/dxconfig.json",
        "template": TEMPLATE_DIR+'/configs/dxconfig.json'},
    "Divblox Entry Point": {"location": "bin/divblox-entry-point.js",
        "template": TEMPLATE_DIR+'/divblox-entry-point.js'},
    "Divblox App": {"location": "dx-app.js",
        "template": TEMPLATE_DIR+'/dx-app.js'},
    "Divblox local packages readme": {"location": "divblox-packages-local/readme.md",
        "template": TEMPLATE_DIR+'/infos/dx-packages-readme.md'},
    "Divblox api route": {"location": "divblox-routes/api.js",
        "template": TEMPLATE_DIR+'/routes/api.js'},
    "Divblox index route": {"location": "divblox-routes/www/index.js",
        "template": TEMPLATE_DIR+'/routes/www/index.js'},
    "Divblox example route": {"location": "divblox-routes/dx-example.js",
        "template": TEMPLATE_DIR+'/routes/dx-example.js'},
    "Divblox error view": {"location": "divblox-views/error.pug",
        "template": TEMPLATE_DIR+'/views/error.pug'},
    "Divblox index view": {"location": "divblox-views/index.pug",
        "template": TEMPLATE_DIR+'/views/index.pug'},
    "Divblox layout view": {"location": "divblox-views/layout.pug",
        "template": TEMPLATE_DIR+'/views/layout.pug'},
}

/**
 * An async wrapper for the isEmptyDirectory function
 * @param directory The path to the directory
 * @return {Promise<boolean>} True if directory is empty
 */
async function isEmptyDirectoryAsync (directory) {
    return new Promise((accept, reject) => {
        isEmptyDirectory(directory, accept);
    });
}

/**
 * Checks whether a directory is empty
 * @param directory The path to the directory
 * @param fn The callback function that is called with the result
 */
function isEmptyDirectory (directory, fn) {
    fs.readdir(directory, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}

/**
 * Normalizes a packageName, fitting npm naming requirements.
 * Copied from https://github.com/expressjs/generator/blob/master/bin/express-cli.js
 * @param {String} packageName
 */
function getNormalizePackageName(packageName) {
    return packageName
        .replace(/[^A-Za-z0-9.-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

/**
 * Creates the minimum configuration files needed for a Divblox package
 * @param configPath The path to the divblox config for the local project
 * @param packageName The name of the package
 * @returns {Promise<void>}
 */
async function createDefaults(configPath, packageName) {
    let dxConfig = await fsAsync.readFile("./"+configPath);
    console.dir(JSON.parse(dxConfig.toString()));
    return;
    if (!fs.existsSync("./"+configPath+"/")){
        console.log("Creating "+folderDescription+" directory...");
        fs.mkdirSync(foldersToCreate[folderDescription]);
    }

    for (const fileDescription of Object.keys(filesToCreate)) {
        console.log("Creating "+fileDescription+"...");
        let fileContentStr = await fsAsync.readFile(filesToCreate[fileDescription].template);
        fileContentStr = fileContentStr.toString();
        const tokensToReplace = {"appName": appName};
        const availableTokensToReplace = filesToCreate[fileDescription].tokens;
        if (typeof availableTokensToReplace !== "undefined") {
            for (const token of availableTokensToReplace) {
                if (Object.keys(tokensToReplace).includes(token)) {
                    const search = '['+token+']';
                    let done = false;
                    while (!done) {
                        done = fileContentStr.indexOf(search) === -1;
                        //TODO: This should be done with the replaceAll function
                        fileContentStr = fileContentStr.replace(search, tokensToReplace[token]);
                    }
                }
            }
        }

        await fsAsync.writeFile(filesToCreate[fileDescription].location, fileContentStr);
    }
    console.log("Divblox package initialization done!");
}

/**
 * Handles the command line input that is used to prepare the npm package for the new project
 * @return {Promise<void>}
 */
async function preparePackage() {
    let dxConfigPath = await dxUtils.getCommandLineInput("The Divblox package generator requires divbloxjs to be " +
        "installed and configured.\nPlease provide the path to the file 'dxconfig.json': " +
        "(Usually 'divblox-config/dxconfig.json') (Press ENTER to use the default path)");
    if (dxConfigPath.length === 0) {
        dxConfigPath = 'divblox-config/dxconfig.json';
    }
    try {
        if (!fs.existsSync("./"+dxConfigPath)) {
            console.error("Divblox config path not found. You can try again or try to reinstall divbloxjs by running the " +
                "divbloxjs application generator with:\n'npx github:divbloxjs/divbloxjs-application-generator'");
            return;
        }
    } catch(e) {
        console.error("An error occurred while checking the divblox config path. Please try again");
        return;
    }
    const packageName = await dxUtils.getCommandLineInput("Package name:");
    if (packageName.length > 1) {
        await createPackage(dxConfigPath, packageName);
    } else {
        console.error("Invalid package name provided. Please try again.");
    }
}

/**
 * Creates a new node package with the given name and installs divbloxjs
 * @param configPath The path to the divblox config for the local project
 * @param packageName The packageName provided via the command line
 * @return {Promise<void>}
 */
async function createPackage(configPath, packageName) {
    const normalizedPackageName = getNormalizePackageName(packageName);
    console.log("Creating package '"+normalizedPackageName+"'... ");
    await createDefaults(configPath, normalizedPackageName);

}

// Script entry point
preparePackage();
