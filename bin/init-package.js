#!/usr/bin/env node

const fs = require("fs");
const fsAsync = require("fs").promises;
const path = require('path')
const dxUtils = require('dx-utils');
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates')

const filesToCreate = {
    "Data model": {"location": "data-model.json",
        "template": TEMPLATE_DIR+'/data-model.json'},
    "Package main js": {"location": "packageName.js",
        "template": TEMPLATE_DIR+'/packageName.js',
        "tokens":["packageName"]},
    "Package end point js": {"location": "packageNameEndPoint.js",
        "template": TEMPLATE_DIR+'/packageNameEndPoint.js',
        "tokens":["packageName"]}
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
    dxConfig = JSON.parse(dxConfig.toString());
    if (typeof dxConfig["divbloxPackagesRootLocal"] === "undefined") {
        console.error("The provided dxconfig.json file does not contain a path definition for 'divbloxPackagesRootLocal'.\n" +
            "Cannot proceed.");
        return;
    }
    if (!fs.existsSync("./"+dxConfig["divbloxPackagesRootLocal"])) {
        console.log("Creating "+dxConfig["divbloxPackagesRootLocal"]+" directory...");
        fs.mkdirSync(dxConfig["divbloxPackagesRootLocal"]);
    }

    if (fs.existsSync("./"+dxConfig["divbloxPackagesRootLocal"]+"/"+packageName)){
        console.error("The provided package name already exists in the local divblox packages folder.");
        return;
    }
    console.log("Creating "+dxConfig["divbloxPackagesRootLocal"]+"/"+packageName+" directory...");
    fs.mkdirSync(dxConfig["divbloxPackagesRootLocal"]+"/"+packageName);

    const packageNameCamelCase = dxUtils.convertLowerCaseToCamelCase(packageName,"-");
    for (const fileDescription of Object.keys(filesToCreate)) {
        console.log("Creating "+fileDescription+"...");
        let fileContentStr = await fsAsync.readFile(filesToCreate[fileDescription].template);
        fileContentStr = fileContentStr.toString();
        const tokensToReplace = {"packageName": packageNameCamelCase};
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
        const finalLocation = dxConfig["divbloxPackagesRootLocal"]+"/"+packageName+"/"+
            filesToCreate[fileDescription].location.replace('packageName',packageName);
        await fsAsync.writeFile(finalLocation, fileContentStr);
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
