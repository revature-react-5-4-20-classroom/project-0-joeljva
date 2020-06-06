



import nodemailer from "nodemailer";


// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'skyservicesjva@gmail.com',
//       pass: 'websky12'
//     }
//   });

//   var mailOptions={
//       from:"skyservicesjva@gmail.com",
//       to:"joeljva23@gmail.com",
//       subject:"hello",
//       text:"so hello text"
//   }

//   transporter.sendMail(mailOptions,function(error,info){
//       if(error){
//           console.log(error);
//       }else{
//           console.log("email sent"+info.response)
//       }
//   })


  export let sentMail=async function(firstname:string,lastname:string,reimId:number,status:string,email:string){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'skyservicesjva@gmail.com',
          pass: process.env['PG_EMAILP']
        }
      });



      var mailOptions={
        from:"skyservicesjva@gmail.com",
        to:email,
        subject:"Reimbursement Status",
        html:`<div>
       <p> Hello ${firstname} ${lastname},<p>
        <p>Your reimbursement request Id:${reimId} was ${status}. </p>
        <p>If you have any further questions, please contact your branch manager.</p>
        <p>Thanks</p>
        
        
        </div>
        `
    }
  
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }else{
            console.log("email sent"+info.response)
        }
    })





  }

   
