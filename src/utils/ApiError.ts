export class ApiError extends Error{
    statusCode:number
    success:boolean
    constructor(message:string,statusCode=400){
        console.log(message)
        super(message)
        this.statusCode=statusCode
        this.success=false
    }
}