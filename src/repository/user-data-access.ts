import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { User } from "../models/user";
import bcrypt from 'bcrypt';




export async function getAllUsers(): Promise<User[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    console.log("inside get all users")
    try {
        // let result: QueryResult = await client.query(`select * from users`);
        let result: QueryResult = await client.query(`select * from users INNER JOIN roles ON id=role_id`);
        return result.rows.map((r) => {
            return new User(r.user_id, r.username, r.password, r.first_name, r.last_name, r.email, r.role_id,r.role_name);
        });
    }
    catch (e) {
        console.log("failed to get all users");
        throw new Error("falied to get all users");
    }
    finally {
        client && client.release();
    }



};

//function that gets the id and returns the user if the user is manager of if the user id is the same - handle in the router
export async function getUserById(id: number): Promise<User> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult = await client.query('select * from  users inner join roles on users.role_id=roles.id where users.user_id=$1 ', [id]);
        let user = result.rows.map((r) => { return new User(r.user_id, r.username, r.password, r.first_name, r.last_name, r.email, r.role_id) });
        if (result.rows.length > 0) {
            return user[0];

        } else {
            throw new Error("id doesn't exist");
        }
    }
    catch (e) {
        if (e.message == "id doesn't exist") {
            throw e;
        } else {
            throw new Error("wasn't able to retrieve data");
        }
    } finally {
        client && client.release();
    }

}


//modify user by admin
export async function modifyUser(update: any): Promise<User> {
    let client: PoolClient;
    client = await connectionPool.connect();
    let [arr, query] = generateQuery(update);


    let user_id = arr[arr.length - 1];
    try {
        await client.query("BEGIN");
        await client.query(`${query}`, arr);
        let result = await client.query(`select  * from users where user_id=$1`, [user_id]);
        await client.query("COMMIT");
        let user = result.rows.map((r) => { return new User(r.user_id, r.username, r.password, r.first_name, r.last_name, r.email, r.role_id) });
        if (user.length < 1) {
            throw new Error("id doesn't exist");
        } else {
            return user[0];
        }
    }
    catch (e) {
        await client.query("ROLLBACK");
        throw e;
        // throw new Error("wasnt able to update");
    } finally {
        client && client.release();
    }


}


function generateQuery(update: any) {
    let query: string = "update users set ";
    let arr: any = [];
    let count = 1;

    // for(let e of update){
    //     {

    //     }
    //     let val=Object.keys(e)[0];
    //     query+=`,${val}=$${count++} `;
    //     arr.push(Object.values(e)[0]);}
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


    query += ` WHERE user_id=$${count};`
    arr.push(Object.values(update[0])[0]);
    console.log(query)

    return [arr, query];



}


// login by username and password
export async function validateUser(username: string, password: string): Promise<User> {
    console.log(username);
    console.log(password);


    let client: PoolClient;
    client = await connectionPool.connect();
    try {

        let check = await client.query(`select  password from users where username=$1 `, [username]);

        let pass = check.rows[0].password;
        console.log(`pass` + pass);

        let y = await comparepasswordHash(password, pass);
        console.log("y" + y);
        if (!y) {
            throw new Error("failed to authenticate");
        } else {
            let result = await client.query(`select  * from users INNER JOIN roles ON role_id=roles.id where username=$1`, [username]);
            let user = result.rows.map((r) => { return new User(r.user_id, r.username, r.password, r.first_name, r.last_name, r.email, r.role_id, r.role_name) });


            return user[0];



        }

        //  let result=await client.query(`select  * from users INNER JOIN roles ON role_id=id where username=$1 AND password=$2`,[username,password]);
        // let user= result.rows.map((r)=>{return new User(r.user_id,r.username,r.password,r.first_name,r.last_name,r.email,r.role_id,r.role_name)});
        //         if(user.length>0){

        //             return user[0];
        //         }else{
        //             throw new Error("Username and password not validated")
        //         }
    }
    catch (e) {
        throw new Error("failed to validate " + e.message);
    } finally {
        client && client.release();
    }

}




//function for hashing
async function comparepasswordHash(password: string, passwordDb: string): Promise<boolean> {





    let y = await bcrypt.compare(password, passwordDb).then((res) => { console.log(res); return res; });
    console.log("Dsd" + y);


    return y;


}

