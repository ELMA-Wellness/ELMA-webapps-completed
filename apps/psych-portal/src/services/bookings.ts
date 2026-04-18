import { getDocById, updateDocById } from "../utils/firestore"
import axios from 'axios'
export const markSessionAsCompleted=async(id:string,userId:string,therapistId:string)=>{
    console.log("params id",id)

    try{

        await updateDocById('bookings',id,{
             sessionCompleted : true

        })

        const userDoc=await getDocById('users',userId)
        const tDoc=await getDocById('therapists',therapistId)

        const uData=userDoc?.data;
        const tData=tDoc?.data;

        const userEmail=uData?.email

        const therapistEmail=tData?.email

        const userName=uData?.name;

        const therapistName = tData?.name

        await axios.post(`https://sendsessioncompletionemail-47bmnp7h7q-el.a.run.app`,{
            to:'user',
            userEmail,
            therapistName,
            therapistEmail,
            userName



        })
        await axios.post(`https://sendsessioncompletionemail-47bmnp7h7q-el.a.run.app`,{
            to:'tpist',
            userEmail,
            therapistName,
            therapistEmail,
            userName



        })


        

    }
    catch(err){

    }

}