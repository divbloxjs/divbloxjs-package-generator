const dx = require('[dxAppScriptRequire]');
const [packageName]Controller = require('./index');
const divbloxEndpointBase = require('divbloxjs/dx-core-modules/endpoint-base');

class [packageNamePascalCase]Endpoint extends divbloxEndpointBase {
    constructor() {
        super();
        this.endpointName = "[packageName]";
        this.endpointDescription = "[packageName] endpoint";
        // TODO: Declare any additional operations here
        this.declareOperations(
            [
                {
                "operationName": "getPackageName",
                "allowedAccess": ["anonymous"]
                }
            ]
        );
    }

    async executeOperation(operation, request, dxInstance = null) {
        if (!await super.executeOperation(operation, request, dxInstance)) {
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