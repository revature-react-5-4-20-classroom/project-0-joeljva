import express, { Router, NextFunction, Request, Response } from 'express';
import { getReimbursementById, getReimbursementByUserId, addNewReimbursement, updateReimbursement, getReimbursementByIdDate, getReimbursementByUserIdDate } from '../repository/reimbursement-data-access';
import { checkUserMiddleware } from '../middleware/authMiddleWare';
import { User } from '../models/user';
import { Reimbursement } from '../models/reimbursement';

export const reimRouter = express.Router();

reimRouter.use(checkUserMiddleware);

reimRouter.get("/", (req: Request, res: Response) => {
    res.json("hello");
});




//find reimbursements by status   //only by the finnce manafer
reimRouter.get("/status/:id", async (req: Request, res: Response) => {   //all good handle error later
    if (req.session && req.session.user) {
        console.log(req.session.user.roleName);
        let role: string = req.session.user.roleName;

        if (role != "finance-manager") {
            res.status(401).json("the incoming token has expired");
        } else {


            let statusId = +req.params.id;
            console.log(statusId);
            if (isNaN(statusId)) {
                res.json("please a enter a numerics value");
            } else {
                try {
                    let riems = await getReimbursementById(statusId);
                    res.json(riems);
                }
                catch (e) {
                    res.json(e.message);
                }
            }
        }


    } else {
        res.json("server error");
    }
})

//find reimbursemensts by userid

reimRouter.get("/author/userId/:id", async (req: Request, res: Response) => {            //all good
    let userId = +req.params.id;
    console.log(userId);
    if (isNaN(userId)) {
        res.json("please a enter a numeric value");
    } else {


        if (req.session && req.session.user) {
            let Id = req.session.user.userId;
            let role: string = req.session.user.roleName;

            if ((userId != Id) && role != "finance-manager") {
                res.json("you are not authorized");

            } else {



                try {
                    let riems = await getReimbursementByUserId(userId);
                    res.json(riems);
                }
                catch (e) {
                    res.json(e.message);
                }
            }
        } else {
            res.json("server config error")
        }
    }


})

//submit reimbursements   works later try for the newly created reim to come back   //all employees cansubmit  //prolem with authorid cAN INPUT ANY USERID
reimRouter.post("/", async (req: Request, res: Response) => {
    let { author, amount, dateSubmitted, description, type } = req.body;
    if (req.session && req.session.user) {

        if (req.session.user.userId !== author) {
            res.status(401).json("please enter your correct userId")
        } else {
console.log(type);
            if (!(author && amount && dateSubmitted && description && type)) {    //if u can try for some way to authenticate via username later
                res.status(400).json("please enter all the details");
            } else {
                try {
                    let result = await addNewReimbursement(author, amount, dateSubmitted, description, type);
                    res.status(201).json(result);

                }
                catch (e) {
                    res.status(400).json(e.message);

                }
            }
        }

    } else {
        res.json("server config error")
    }
});


//to update reimbursemnts
reimRouter.patch("/", async (req: Request, res: Response, next: NextFunction) => {

    if (req.session && req.session.user) {

        let role: string = req.session.user.roleName;

        if (role != "finance-manager") {
            res.status(401).json("You have to be a finance manager to update");
        } else {

            let { reimbursementId, dateResolved, description, resolver, status } = req.body;
            console.log("resolasasdfdfgfggver" + resolver)
            if (!reimbursementId || isNaN(reimbursementId)) {
                res.json(" reimbursementId not valid");
            } else {
                let arr = [reimbursementId, dateResolved, description, resolver, status];
                console.log("asdarr3" + arr[3])
                let update = toUpdate(arr);
                let filterArr = arr.filter((elem) => { return elem });
                if (filterArr.length < 2) {
                    res.json("please enter values to update");
                } else {
                    try {
                        let result = await updateReimbursement(update);
                        console.log(result);
                        res.json(result);

                    }
                    catch (e) {
                        console.log(e)
                        res.status(400).json(e.message)
                    }

                }
            }
        }

    } else {
        res.json("server config error")
    }
});

function toUpdate(arr: any[]): any[] {
    let toUpdate = [];
    toUpdate[0] = { reimbursement_id: arr[0] }
    if (arr[1] != undefined) {
        toUpdate.push({ date_resolved: arr[1] });
    }
    if (arr[2] != undefined) {
        toUpdate.push({ description: arr[2] });
    }
    if (arr[3] != undefined) {
        toUpdate.push({ resolver: arr[3] });
    }
    if (arr[4] != undefined) {
        toUpdate.push({ status: arr[4] });
    }
    console.log(toUpdate);
    return toUpdate;



}




//extra get status by date   //all good error handled fine 
reimRouter.get("/status/:id/date-submitted?", async (req: Request, res: Response) => {    //all good
    console.log(req.url);

    let start = req.query.start;
    let end = req.query.end;
    let id = +req.params.id;
    console.log(start);
    console.log(end);
    console.log(id);
    if (!(start && end && id)) {
        res.json("please enter the limits properly");
    } else {
        if (req.session && req.session.user) {
            console.log(req.session.user.roleName);
            let role: string = req.session.user.roleName;

            if (role != "finance-manager") {
                res.json("You have to be a finance manager to login");
            } else {
                //console.log(statusId); errror

                try {
                    let riems = await getReimbursementByIdDate(id, start, end);
                    res.json(riems);
                }
                catch (e) {
                    res.json(e.message);
                }
            }


        } else {
            res.json("server error");
        }

    }

})




//userid challenge

reimRouter.get("/author/userId/:id/date-submitted?", async (req: Request, res: Response) => {            //all good
    let userId = +req.params.id;
    let start = req.query.start;
    let end = req.query.end;

    if (isNaN(userId) || !start || !end) {
        res.json("please the propers limits");
    } else {


        if (req.session && req.session.user) {
            let id = req.session.user.userId;
            let role: string = req.session.user.roleName;

            if ((userId != id) && role != "finance-manager") {
                res.status(401).json("you are not authorized");

            } else {



                try {
                    let riems: Reimbursement[] = await getReimbursementByUserIdDate(userId, start, end);
                    res.json(riems);
                }
                catch (e) {
                    res.json(e.message);
                }
            }
        } else {
            res.json("server config error")
        }
    }


})

