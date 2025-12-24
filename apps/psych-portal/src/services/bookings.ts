import { updateDocById } from "../utils/firestore"

export const markSessionAsCompleted=async(id:string)=>{
    console.log("params id",id)

    try{

        await updateDocById('bookings',id,{
             sessionCompleted : true

        })

    }
    catch(err){

    }

}