function asyncErrorBoundary(delegate, defaultOkStatus=200, defaultErrorStatus=500) {
    return (request, response, next) => {
      Promise.resolve()
        .then(() => delegate(request, response, next))
        .then((rsp = {}) => {
          // console.log(rsp);
          const { rspStatus = defaultOkStatus, data = rsp } = rsp;
          response.status(rspStatus).json({ data });
        })
        .catch(error => {
          const { status = defaultErrorStatus, message = error } = error;
          next({
            status,
            message,
          });
        });
    };
  }
  
  module.exports = asyncErrorBoundary;