import { redisClient, } from '../redis/redisConfig.js';
import {
    db,
    ErrorLogModel,
    SubmissionModel,
    ComplainantModel,
    UserModel,
    AccusedModel,
    ChargesModel,
    SignatureModel,
    ChargeCodeModel,
    VerifierModel,
  } from "../models/index.js";

export const modeSet = async (req, res) => {

    console.log('\n\n\n Configuration Controller \n\n\n');

    await redisClient.set('operation_mode', req.body.mode);
    let mode = await redisClient.get('operation_mode');

    // await redisClient.set('blah', 'blah blah blah');
    // let blah = await redisClient.get('blah');
    // if(!blah) {
    //     blah = 'blah is not set in redis';
    // }


    res.status(201).json({
       mode: mode 
    });
    
};

export const mode = async (req, res) => {

    let mode = await redisClient.get('operation_mode');
    mode = mode ? mode : 'OTP';

    res.status(201).json({
        mode: mode 
    });

}

// export const complainantSign = async (req, res) => {
//     console.log("\n\n\n Request body: ", req.body);
//     let email = req.body.email;
//     let submission_id = req.body.submission_id;
  
//     try {
//       let signature = await signComplainant(email, submission_id);
//       res.status(201).json(signature);
//     } catch (error) {
//       // Handle errors appropriately
//       res.status(500).json({ error: "An error occurred" });
//     }
// };