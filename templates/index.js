const divbloxPackageControllerBase = require('[controllerBasePath]');
const DivbloxBase = require("divbloxjs/divblox");

/*
[packageControllerInfo]
*/

class [packageNamePascalCase] extends divbloxPackageControllerBase {
    constructor(dxInstance = null, packageName = '[packageNameDefault]') {
        /**
         * A basic constructor that can be overridden
         * @param {DivbloxBase} dxInstance An instance of divbloxjs to allow for access to the app configuration
         * @param {string} packageName The name given to this package
         */
        super(dxInstance, packageName);
        // TODO: Override as required
    }
    // TODO: Add package specific functionality below
}

module.exports = [packageNamePascalCase];