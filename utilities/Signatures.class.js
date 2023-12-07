import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel, SignatureModel, UserModel } from "../models/index.js";
import {dbConfig} from "../config/db.config.js";
import mysql from 'mysql2';
import { createHash } from 'node:crypto';
// import signaturesModel from "../models/signatures.model.js";



export class Signatures {

    constructor() {
            
    }


    complainantSubmissionSign = async (email, submission_id) => {


        let submission = await SubmissionModel.findByPk(submission_id);

        let user = await UserModel.findOne({
            where: {email: email}
        });

        console.log('User found by email: ', user.dataValues);

        console.log('\n\n\n Current submission record: ', submission.dataValues);

        let record = JSON.stringify(submission.dataValues);

        console.log('\n\n\n Current submission record string: ' + record);

        let signature = await SignatureModel.create({
            type: 'submission',
            email: email,
            record: record,
            hash: createHash('sha3-256').update(record).digest('hex'),
            userId: user.id
        });

        return signature.hash;
        
        // return '1q2w3e4r5t6y7u8i9o0p';
    }

    async commissionerSubmissionSign(email, submission_id) {

    }

    async verifySubmissionComplianantSignature(email, submission_id) {

    }

    async verifySubmissionCommissionerSignature(email, submission_id) {
        
    }


}