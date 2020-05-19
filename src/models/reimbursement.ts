export class Reimbursement{
//need to get the actual values
reimbursementId:number;
author:number;
amount:number;
dateSubmitted:number;
dateResolved:number;
description:string;
resolver:number;
status:number;
type:number;
constructor(reimbursementid:number,author:number,amount:number,dateSubmitted:number,dateResolved:number,description:string,resolver:number,status:number,type:number){
this.reimbursementId=reimbursementid;
this.author=author;
this.dateSubmitted=dateSubmitted;
this.dateResolved=dateResolved;
this.description=description;
this.resolver=resolver;
this.status=status;
this.type=type;
this.amount=amount;
}


}

