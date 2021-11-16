const [packageName]Controller = require('./index');
const divbloxEndpointBase = require('[endpointBasePath]');

class [packageNamePascalCase]Endpoint extends divbloxEndpointBase {
    constructor(dxInstance = null) {
        super(dxInstance);

        this.endpointName = "[packageName]"; // Change this to set the actual url endpoint
        this.endpointDescription = "[packageName] endpoint"; // Change this to be more descriptive of the endpoint

        this.controller = new [packageName]Controller(dxInstance);

        // TODO: Declare any additional operations here
        const getPackageName = this.getOperationDefinition(
            {
                "operationName": "getPackageName",
                "allowedAccess": ["anonymous"], // If this array does not contain "anonymous", a JWT token will be expected in the Auth header
                "operationSummary": "A short intro for the operation",
                "operationDescription": "This sentence describes the operation",
                "parameters": [], // An array of this.getInputParameter()
                "requestType": "GET", // GET|POST|PUT|DELETE|OPTIONS|HEAD|PATCH|TRACE
                "requestSchema": {}, // this.getSchema()
                "responseSchema": {}, // this.getSchema()
            }
        );

        // You need to do this in order for the operation to be available on the endpoint.
        // Also, this declaration provides the necessary input for swagger ui present the docs for this
        this.declareOperations([getPackageName]);

        // TODO: Declare any entity schemas here if needed
        // An example of how to declare entity schemas for swagger ui
        //this.declareEntitySchemas(["anEntityInYourDataModel"]);
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

module.exports = [packageNamePascalCase]Endpoint;