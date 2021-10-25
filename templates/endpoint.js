const dx = require('[dxAppScriptRequire]');
const [packageName]Controller = require('./index');
const divbloxEndpointBase = require('divbloxjs/dx-core-modules/endpoint-base');

class [packageNamePascalCase]Endpoint extends divbloxEndpointBase {
    constructor() {
        super();
        // TODO: Declare any additional operations here
        this.declareOperations(
            [
                {
                "operationName": "test",
                "allowedAccess": ["anonymous"]
                }
            ]
        );
    }

    async executeOperation(operation, request) {
        if (!await super.executeOperation(operation, request)) {
            return false;
        }

        // Here we have to deal with our custom operations
        switch(operation) {
            case 'getPackageName': await this.getPackageName();
                break;
            // TODO: Add additional cases here for each declared operation
        }

        return true;
    }

    async getPackageName() {
        this.setResult(true, "Package name is [packageName]");
    }

    // TODO: Add implementations for each declared operation below
}
const [packageName]EndpointInstance = new [packageNamePascalCase]Endpoint();

module.exports = [packageName]EndpointInstance;