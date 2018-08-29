// create and export configuration variables

// container for all the environments

var environments = {};

// staging (default) environment
// http - 80 ; https - 443

environments.staging = {
    'httpPort': 3000, 
    'httpsPort': 3001,
    'envName': 'staging'
};

environments.production = {
    'httpPort': 5000, 
    'httpsPort': 5001,
    'envName': 'production'
};

// Determine which was passed as a command-line argument

var currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? 
    process.env.NODE_ENV.toLowerCase() : '';


// check that the current env is one of the env's above
// if not, default to staging

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ?
    environments[currentEnvironment] : environments.staging;


module.exports = environmentToExport;
