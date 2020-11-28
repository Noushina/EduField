var db=require('../config/connection')
const collection=require('../config/collections');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectID;

const saltRounds = 10;
const myPlaintextPassword = '123';
const someOtherPlaintextPassword = 'not_bacon';


module.exports={
   
    tutorIn:(tutorData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response={}
            let tutor=await db.get().collection(collection.TUTOR_COLLECTION).findOne(
                {username:tutorData.username}
            ) 
            
            
            console.log({username:tutorData.username});
            console.log(tutor+"*******");
            if(tutor){
                console.log(tutorData.password);
                console.log(tutor.password);
                
                console.log(tutor.password);
              let match=await db.get().collection(collection.TUTOR_COLLECTION).findOne({password:tutorData.password})
                    if(match){
                        console.log('login success');
                        response.tutor=tutor
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('loginfailed');
                        resolve({status:false})

                    }
                
            }else{
                
                console.log('login failed, user not found');
                resolve({status:false})



            }
        
            
        })

    }

}