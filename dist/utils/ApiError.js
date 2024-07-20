export class ApiError extends Error {
    constructor(message, statusCode = 400) {
        console.log(message);
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }
}
