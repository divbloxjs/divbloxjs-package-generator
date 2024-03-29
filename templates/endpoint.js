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
        this.controller = this.getControllerInstance();

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
        let baseDeclarations = super.handleOperationDeclarations();
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
                "responseSchema": this.getSchema({ message: "string" }),
                f: async (req, res) => {
                    await this.getPackageName();
                },
            }
        );
        
        const packages = [getPackageName];
        
        return [...baseDeclarations, ...packages];
    }

    /**
     * @returns {[packageName]Controller} An instance of the package's controller. Override here if a different controller should be instantiated
     */
    getControllerInstance() {
        return new [packageName]Controller(this.dxInstance);
    }

    /**
     * An example operation
     */
    async getPackageName() {
        this.forceResult({ message: "Package name is [packageName]" }, 200);
    }

    // TODO: Add implementations for each declared operation below
}

module.exports = [packageNamePascalCase]Endpoint;