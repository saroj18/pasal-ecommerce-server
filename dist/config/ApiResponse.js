export class ApiResponse {
    constructor(message, statusCode = 200, data) {
        this.message = message;
        this.success = true;
        this.statusCode = statusCode;
        this.data = data;
    }
}
