import express from 'express';
import { Application, Request, Response, NextFunction } from "express";
import bodyparser from 'body-parser';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import { userRouter } from './routers/userRouter';
import { reimRouter } from './routers/reimbursementsRouter';
import { connectionPool } from './repository';
import { PoolClient, QueryResult } from 'pg';
import { validateUser } from './repository/user-data-access';



//app
const app: Application = express();
app.use(bodyparser.json());
app.use(sessionMiddleware);


//login and authentication
app.post("/login", async (req: Request, res: Response) => {
    console.log(req.url);
    const { username, password } = req.body;
    if (!username || !password) {
        res.json("please enter all the details");
    } else {
        try {
            //function to authenticate and verify details
            const user = await validateUser(username, password);
            if (req.session) {
                req.session.user = user;
                console.log(req.session.user);
            }
            res.json(user);

        }
        catch (e) {
            console.log(e);
            res.status(400).send("Invalid Credentials")

        }
    }


})


//port
app.listen(60005, () => {
    console.log(`app has started`);

    //promise -connectionPool.connect returns a pool client
    //if then fails then catch is called
    connectionPool.connect().then(
        (client: PoolClient) => {
            client.query('select id from ademo').then(
                (result: QueryResult) => {
                    console.log("connection sucess");
                    console.log(result.rows[0]);
                    client && client.release();

                }
            )
        }
    ).catch((e) => { console.log(e.message) })
});



app.use("/hello", (req: Request, res: Response) => {
    res.json("welcome hello asd123456 to the hello endpoint inside the server, this server  has multiple endpoints for the company to handle it's reimbursements");






});


app.use("/users", userRouter);
app.use("/reimbursements", reimRouter);























