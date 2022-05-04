function setError(status=500, message='Bad error message', next) {
    next({status: status, message: message});
} 

module.exports = setError;