class apiresponse {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode < 200 || statusCode > 299 ? 500 : statusCode;
        this.message = message;
        this.data = data;
    }
}

export { apiresponse };