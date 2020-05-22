import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { Reimbursement } from "../models/reimbursement";


//function to get all reimbursements by id status
export async function getReimbursementById(id: number): Promise<Reimbursement[]> {
    let client: PoolClient;
    client = await connectionPool.connect();

    try {
        let result = await client.query(`SELECT * FROM reimbursement  WHERE status=$1 ORDER BY date_submitted DESC;`, [id]);

        let arr = result.rows.map((e) => {
            return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
        });
        if (arr.length < 1) {
            throw new Error("no records exist");
        } else {
            return arr;
        }


    }
    catch (e) {

        throw e;
    }
    finally {
        client && client.release();
    }

}

//function to get reim by user id
export async function getReimbursementByUserId(id: number): Promise<Reimbursement[]> {      //all good
    let client: PoolClient;
    client = await connectionPool.connect();

    try {
        let result = await client.query(`SELECT * FROM reimbursement  WHERE author=$1 ORDER BY date_submitted DESC;`, [id]);
        if (result.rows.length < 1) {
            throw new Error("no reimbursemensts exists for the user");
        } else {

            return result.rows.map((e) => {
                return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
            });

        }
    }
    catch (e) {

        throw e;
    }
    finally {
        client && client.release();
    }

}
//author,amount,dateSubmitted,description,type

//function to post a new reimbursement
export async function addNewReimbursement(author: number, amount: number, dateSubmitted: string, description: string, type: number): Promise<Reimbursement> {
    let client: PoolClient;
    client = await connectionPool.connect();

    try {
        await client.query("BEGIN")
        let id = await client.query('INSERT INTO reimbursement values (DEFAULT,$1,$2,$3,Null,$4,null,Default,$5) RETURNING reimbursement_id', [author, amount, dateSubmitted, description, type]);
        let id1 = id.rows[0].reimbursement_id;
        console.log(id1);

        // let result=await client.query(`SELECT * FROM reimbursement  WHERE reimbursement_id=$1`,[id]);
        let result = await client.query(`SELECT * FROM reimbursement where  reimbursement_id=$1`, [id1]);
        await client.query("COMMIT");
        return result.rows.map((e) => {
            return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
        })[0];



    }
    catch (e) {
        client.query("ROLLBACK");
        console.log(e);
        throw e;
    }
    finally {
        client && client.release();
    }

}
//to update a reimbursemnet
export async function updateReimbursement(update: any[]): Promise<Reimbursement> { //all good   all good for now

    let client: PoolClient;
    client = await connectionPool.connect();
    let [arr, query] = generateQuery(update);
    let id = arr[arr.length - 1];
    console.log(query);
    console.log(arr);
    try {

       await client.query("BEGIN");
        let x = await client.query(`${query}`, arr);            //catch unhandled promise error    use await
        let result = await client.query(`select * from reimbursement where reimbursement_id=$1`, [id]);
       await  client.query("COMMIT");
        if (result.rows.length < 1) {
            throw new Error("the id doesn't exist");
        } else {
            return result.rows.map((e) => {
                return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
            })[0];
        }

    }
    catch (e) {
      await   client.query("ROLLBACK");
        console.log(e);
        throw new Error("unable to update");

    }
    finally {
        client && client.release();
    }


}

//function to generate a query and  a array of values
function generateQuery(update: any[]) {
    let query: string = "update reimbursement set ";
    let arr: any = [];
    let count = 1;

    for (let i = 0; i < update.length; i++) {
        if (i == 0) {
            continue;
        }
        if (i == 1) {
            let val = Object.keys(update[i])[0];
            query += `${val}=$${count++} `;
            arr.push(Object.values(update[i])[0]);

        } else {
            let val = Object.keys(update[i])[0];
            query += `,${val}=$${count++} `;
            arr.push(Object.values(update[i])[0]);
        }
    }


    query += ` WHERE reimbursement_id=$${count};`
    arr.push(Object.values(update[0])[0]);
    return [arr, query];



}



//challlenges   status date
export async function getReimbursementByIdDate(id: number, start: any, end: any): Promise<Reimbursement[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    console.log(id);

    try {
        let result = await client.query(`SELECT * FROM reimbursement  WHERE  date_submitted BETWEEN $1 AND $2 AND status=$3 ORDER BY date_submitted desc;`, [start, end, id]);

        let arr = result.rows.map((e) => {
            return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
        });
        console.log(arr)
        if (arr.length < 1) {
            throw new Error("no reimbursements exists");
        } else { return arr; }


    }
    catch (e) {
        console.log(e)
        throw e;
    }
    finally {
        client && client.release();
    }

}



//challenge get user by userid      all good
export async function getReimbursementByUserIdDate(id: number, start: any, end: any): Promise<Reimbursement[]> {      //all good
    let client: PoolClient;
    client = await connectionPool.connect();

    try {
        let result = await client.query(`SELECT * FROM reimbursement  WHERE  date_submitted BETWEEN $1 AND $2 AND author=$3 ORDER BY date_submitted desc;`, [start, end, id]);
        if (result.rows.length < 1) {
            throw new Error("no reimbursemensts exists for the user");
        } else {

            return result.rows.map((e) => {
                return new Reimbursement(e.reimbursement_id, e.author, e.amount, e.date_submitted, e.date_resolved, e.description, e.resolver, e.status, e.type);
            });

        }
    }
    catch (e) {

        throw e;
    }
    finally {
        client && client.release();
    }

}