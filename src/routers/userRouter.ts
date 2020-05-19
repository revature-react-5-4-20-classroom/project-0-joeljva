
import express, { Router, NextFunction, Request, Response } from 'express';
import { getAllUsers, getUserById, modifyUser } from '../repository/user-data-access';
import { User } from "../models/user";
import { checkUserMiddleware } from '../middleware/authMiddleWare';
import bcrypt from 'bcrypt';
import e from 'express';


export const userRouter = express.Router();

//middleware
userRouter.use(checkUserMiddleware);
//userRouter.use(userPermissions);
//getting all users only by the finance-manager 
userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        let role: string = req.session.user.roleName;

        if (role !=="finance-manager") {
            res.status(401).json("the incoming token has expired");
        }
        else {
            try {
                const users: User[] = await getAllUsers();

                res.json(users);
            }
            catch (e) {
                res.json(e.message);

            }



        }
    } else {
        res.json("server configuration error")
    }
}
);

//get users by user id allowed only for finance manager for all ids or if the id matches the current user id

userRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {



    const id = +req.params.id;
    if (isNaN(id)) {
        res.json("please enter a number");
    }
    else {
        //
        if (req.session && req.session.user) {
            let userId = req.session.user.userId;
            let role: string = req.session.user.roleName;

            if ((userId !== id) && role !== "finance-manager") {
                res.status(401).json("you are not authorized");

            } else {
                try {
                    let user = await getUserById(id);
                    res.json(user);
                }
                catch (e) {
                    res.json(e.message);
                }
            }
        }
    }
});



//update user only by admin 
userRouter.patch("/", async (req: Request, res: Response) => {


    if (req.session && req.session.user) {
        let role: string = req.session.user.roleName;

        if (role !== "admin") {
            res.json("You have to be a admin to update");
        } else {
            let { userId, username, password, firstName, lastName, email, role } = req.body;


            if (!userId || isNaN(userId)) {
                res.json("Please enter useId properly and in a number format");
            } else {
                let arr: any = [userId, username, password, firstName, lastName, email, role];





               
                let filterarr = arr.filter((e: any) => { return e });

                if (filterarr.length < 2) {
                    res.json("please enter a value to update");
                }
                else {
                    try {
                        if (password) {
                            let salt = 2;
                            await bcrypt.hash(arr[2], salt, async function (err, hash) {
                                if (err) { }
                                let toUpdate = generateQueryToUpdate(arr);
                                toUpdate.push({ password: hash });
                                console.log(toUpdate);
                                try {
                                    let result = await modifyUser(toUpdate).then((res1) => { res.json(res1) });;
                                }
                                catch (e) {
                                    console.log(e.message);
                                    res.json(e.message)
                                }


                            });


                        } else {
                            let update = generateQueryToUpdate(arr);
                            let result = await modifyUser(update);
                            res.json(result);
                        }

                    } catch (e) {

                        res.json(e.message);

                    }
                }


            }
         }
    } else {
        res.json("server error")
    }
});

function generateQueryToUpdate(arr: any[]): any[] {

    let toUpdate: any[] = [];
    toUpdate.push({ user_id: arr[0] });
    if (arr[1] != undefined) { toUpdate.push({ username: arr[1] }) }
    // if(arr[2]!=undefined)
    // {toUpdate.push({password:arr[2]})}
    if (arr[3] != undefined) { toUpdate.push({ first_name: arr[3] }) }
    if (arr[4] != undefined) { toUpdate.push({ last_name: arr[4] }) }
    if (arr[5] != undefined) { toUpdate.push({ email: arr[5] }) }
    if (arr[6] != undefined) { toUpdate.push({ role_id: arr[6] }) }
    // let salt=2;
    // if(arr[2]!=undefined){
    //     await bcrypt.hash(arr[2], salt, function(err, hash) {
    //         if(err){  // can only be a string
    //             console.log(err);
    //         }
    //        toUpdate.push({password:hash});
    // console.log(toUpdate);
    // return toUpdate;


    //     });}else{
    return toUpdate;

}

//use for latere

// export async function generatePassword(arr:any[]):Promise<any[]>{
//     //let toUpdate=generateQueryToUpdate(arr);


//     let salt=2;
//    let x= await bcrypt.hash(arr[2], salt, function(err, hash) {
//         if(err){  
//             let toUpdate=generateQueryToUpdate(arr);
//             toUpdate.push({password:hash});

//        return toUpdate;
//         }});





// }








