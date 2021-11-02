#!/usr/bin/env node

const fs = require("fs");
const fsAsync = require("fs").promises;
const path = require('path')
const dxUtils = require('dx-utils');
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates')

const filesToCreate = {
    "Data model": {"location": "data-model.json",
        "template": TEMPLATE_DIR+'/data-model.json'},
    "Data model readme": {"location": "data-model-readme.md",
        "template": TEMPLATE_DIR+'/data-model-readme.md'},
    "Package main js": {"location": "index.js",
        "template": TEMPLATE_DIR+'/index.js',
        "tokens":["packageName","packageNamePascalCase","dxAppScriptRequire"]},
    "Package end point js": {"location": "endpoint.js",
        "template": TEMPLATE_DIR+'/endpoint.js',
        "tokens":["packageName","packageNamePascalCase","dxAppScriptRequire"]}
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
 * @param appScriptName The filename for the dx app script in the project root
 * @param packageName The name of the package
 * @returns {Promise<void>}
 */
async function createDefaults(configPath, appScriptName, packageName) {
    let dxConfig = await fsAsync.readFile("./"+configPath);
    dxConfig = JSON.parse(dxConfig.toString());

    if (typeof dxConfig["divbloxPackagesRootLocal"] === "undefined") {
        dxConfig["divbloxPackagesRootLocal"] = "divblox-packages-local";
    }

    if (typeof dxConfig["divbloxPackages"] === "undefined") {
        dxConfig["divbloxPackages"] = {
            "local": [],
            "npm": []
        }
    }

    if (typeof dxConfig["divbloxPackages"]["local"] === "undefined") {
        dxConfig["divbloxPackages"]["local"] = [packageName];
    } else {
        dxConfig["divbloxPackages"]["local"].push(packageName);
    }

    if (!fs.existsSync("./"+dxConfig["divbloxPackagesRootLocal"])) {
        dxUtils.printInfoMessage("Creating "+dxConfig["divbloxPackagesRootLocal"]+" directory...");
        fs.mkdirSync(dxConfig["divbloxPackagesRootLocal"]);
    }

    if (fs.existsSync("./"+dxConfig["divbloxPackagesRootLocal"]+"/"+packageName)){
        console.error("The provided package name already exists in the local divblox packages folder.");
        return;
    }
    dxUtils.printInfoMessage("Creating "+dxConfig["divbloxPackagesRootLocal"]+"/"+packageName+" directory...");
    fs.mkdirSync(dxConfig["divbloxPackagesRootLocal"]+"/"+packageName);

    const packageNameCamelCase = dxUtils.convertLowerCaseToCamelCase(packageName,"-");
    const packageNamePascalCase = dxUtils.convertLowerCaseToPascalCase(packageName, "-");
    const dxPackagesPathParts = dxConfig["divbloxPackagesRootLocal"].split("/");
    let dxAppScriptRequire = '../'+appScriptName;
    for (let i = 0; i < dxPackagesPathParts.length; i++) {
        dxAppScriptRequire = '../'+dxAppScriptRequire;
    }
    for (const fileDescription of Object.keys(filesToCreate)) {
        dxUtils.printInfoMessage("Creating "+fileDescription+"...");
        let fileContentStr = await fsAsync.readFile(filesToCreate[fileDescription].template);
        fileContentStr = fileContentStr.toString();
        const tokensToReplace = {
            "packageName": packageNameCamelCase,
            "packageNamePascalCase": packageNamePascalCase,
            "dxAppScriptRequire": dxAppScriptRequire};
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
        const finalLocation = dxConfig["divbloxPackagesRootLocal"]+"/"+packageName+"/"+filesToCreate[fileDescription].location;
        await fsAsync.writeFile(finalLocation, fileContentStr);
    }
    await fsAsync.writeFile(configPath, JSON.stringify(dxConfig,null,2));
    dxUtils.printSuccessMessage("Divblox package initialization done!");
}

/**
 * Handles the command line input that is used to prepare the npm package for the new project
 * @return {Promise<void>}
 */
async function preparePackage() {
    let dxConfigFolderPath = await dxUtils.getCommandLineInput("The Divblox package generator requires divbloxjs to be " +
        "installed and configured.\nPlease provide the folder path that contains the file 'dxconfig.json': " +
        "(Usually 'divblox-config') (Press ENTER to use the default folder path)");
    if (dxConfigFolderPath.length === 0) {
        dxConfigFolderPath = 'divblox-config';
    }
    const dxConfigPath = dxConfigFolderPath+"/dxconfig.json";
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

    let dxAppScriptPath = await dxUtils.getCommandLineInput("Please provide the name for the dx-app script: " +
        "(Usually 'dx-app.js') (Press ENTER to use the default script name)");
    if (dxAppScriptPath.length === 0) {
        dxAppScriptPath = 'dx-app';
    }
    try {
        if (!fs.existsSync("./"+dxAppScriptPath+".js")) {
            console.error(dxAppScriptPath+".js not found. This script should be in the current folder. You can try again " +
                "or try to reinstall divbloxjs by running the " +
                "divbloxjs application generator with:\n'npx github:divbloxjs/divbloxjs-application-generator'");
            return;
        }
    } catch(e) {
        console.error("An error occurred while checking the divblox app script. Please try again");
        return;
    }

    const packageName = await dxUtils.getCommandLineInput("Package name:");
    if (packageName.length > 1) {
        await createPackage(dxConfigPath, dxAppScriptPath, packageName);
    } else {
        console.error("Invalid package name provided. Please try again.");
    }
}

/**
 * Creates a new node package with the given name and installs divbloxjs
 * @param configPath The path to the divblox config for the local project
 * @param appScriptName The filename for the dx app script in the project root
 * @param packageName The packageName provided via the command line
 * @return {Promise<void>}
 */
async function createPackage(configPath, appScriptName, packageName) {
    const lowerCasePackageName = dxUtils.getCamelCaseSplittedToLowerCase(packageName," ");
    const normalizedPackageName = getNormalizePackageName(lowerCasePackageName);
    dxUtils.printHeadingMessage("Creating package '"+normalizedPackageName+"'... ");
    await createDefaults(configPath, appScriptName, normalizedPackageName);

}

// Script entry point
preparePackage();
