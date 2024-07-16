export class ApiResponse {
    message:string
    success:boolean
    statusCode:number
    data:any

    constructor(message:string,statusCode=200,data:any){
        this.message=message
        this.success=true
        this.statusCode=statusCode
        this.data=data
    }
}