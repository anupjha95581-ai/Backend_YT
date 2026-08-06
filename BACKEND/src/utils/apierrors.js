class apierror extends Error{
    constructor(
        statusCode,
        message="Internal Server Error"
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors =  errors

            if(stack){
this.stack = stack
            }else{
                Error.captureStackTrace(this,this.constructor)
            }
    }
}

export default apierror;