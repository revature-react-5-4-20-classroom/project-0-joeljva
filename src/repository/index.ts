import {Pool} from 'pg';


// export PG_HOST=database-1.c5kkz6renouf.us-east-2.rds.amazonaws.com
// export PG_USER=postgres
// export PG_PASSWORD=058595230
// export PG_DATABASE=postgres
//execute together

export const connectionPool:Pool=new Pool({
    host: process.env['PG_HOST'],
  user: process.env['PG_USER'],
  password: process.env['PG_PASSWORD'],
  database: process.env['PG_DATABASE'],
  port: 5432,
  max: 5
});