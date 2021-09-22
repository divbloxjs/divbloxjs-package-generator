const dx = require('[dxAppScriptRequire]');
const [packageName]Controller = require('./index');
const divbloxEndpointBase = require('divbloxjs/dx-core-modules/endpoint-base');

class [packageName]Endpoint extends divbloxEndpointBase {
    constructor() {
        super();
        // TODO: Declare any additional operations here
        this.addOperations(["getPackageName"]);
    }

    async executeOperation(operation, request) {
        await super.executeOperation(operation, request);

        switch(operation) {
            case 'getPackageName': await this.test();
                break;
            // TODO: Add additional cases here for each declared operation
        }
    }

    async getPackageName() {
        this.setResult(true, "Package name is [packageName]");
    }

    // TODO: Add implementations for each declared operation below
}
const [packageName]EndpointInstance = new [packageName]Endpoint();

module.exports = [packageName]EndpointInstance;