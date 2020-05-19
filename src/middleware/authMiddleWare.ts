import express, { Request, Response, NextFunction, response } from 'express';
import session from 'express-session';

//user authenication for all
export function checkUserMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!(req.session && req.session.user)) {
        res.json("please login first");

    } else {
        next();
    }


}


// //for users authentication factory function
// //get users all-finance manager roleid is 1 admin is 3 sales is 2
// //find user by id is only for finance manger or if id matches id of current user.
// export function userPermissions(req:Request,res:Response,next:NextFunction){
//     console.log(req.url);
//     console.log(req.baseUrl)
//     if(!(req.session&&req.session.user)){

//         res.json("please login first");


//     }else{
//         if(req.baseUrl=="/users"){
//             if(req.method=="GET"){
//             let x=6;
//                 console.log(x);
//                 if(!x){
//                     console.log("dfdf");
//                 }


//             }


//         }

//     }

// }



