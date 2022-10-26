const [packageName]Controller = require('./index');
const divbloxEndpointBase = require('[endpointBasePath]');
const DivbloxBase = require("divbloxjs/divblox");

/*
[packageEndPointInfo]
*/

class [packageNamePascalCase]Endpoint extends divbloxEndpointBase {
    /**
     * Initializes the result and declares the available operations
     * @param {DivbloxBase} dxInstance An instance of divbloxjs to allow for access to the app configuration
     */
    constructor(dxInstance = null) {
        super(dxInstance);

        this.endpointName = "[packageName]"; // Change this to set the actual url endpoint
        this.endpointDescription = "[packageName] endpoint"; // Change this to be more descriptive of the endpoint

        // You need to do this in order for the operation to be available on the endpoint.
        // Also, this declaration provides the necessary input for swagger ui present the docs for this
        const operations = this.handleOperationDeclarations();
        this.declareOperations(operations);

        // TODO: Declare any entity schemas here if needed
        // An example of how to declare entity schemas for swagger ui
        //this.declareEntitySchemas(["anEntityInYourDataModel"]);
    }

    /**
     * @returns {[]} An array of operation definitions to be passed to this.declareOperations()
     */
    handleOperationDeclarations() {
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
        
        return [
            getPackageName
        ];
    }

    /**
     * @returns {[packageName]Controller} An instance of the package's controller. Override here if a different controller should be instantiated
     */
    getControllerInstance() {
        return new [packageName]Controller(this.dxInstance);
    }

    async executeOperation(operation, request) {
        if (!await super.executeOperation(operation, request)) {
            return false;
        }

        // Create an instance of the controller that can be passed down to specific operations that might need access to it.
        // The reason for creating the instance here is that we need a fresh instance for every request to ensure data integrity
        const controller = this.getControllerInstance();

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