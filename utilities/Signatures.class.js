import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel, SignatureModel } from "../models/index.js";
import {dbConfig} from "../config/db.config.js";
import mysql from 'mysql2';
import { createHash } from 'node:crypto';
// import signaturesModel from "../models/signatures.model.js";



export class Signatures {

    constructor() {
            
    }


    complainantSubmissionSign = async (email, submission_id) => {


        let submission = await SubmissionModel.findByPk(submission_id);

        let user = await SubmissionModel.getOne({
            where: {email: email}
        });

        let signature = await SignatureModel.create({
            type: 'submission',
            email: email,
            record: JSON.parse(submission),
            hash: createHash('sha3-256').update(content).digest('hex'),
            userId: user.id
        });

        // console.log('\n\n\n Submission created at: ', submission.createdAt);
        // console.log('Submission updated at: ', submission.updatedAt);
        // console.log('\n\n\n');

        return signature.hash; 
    }

    async commissionerSubmissionSign(email, submission_id) {

    }

    async verifySubmissionComplianantSignature(email, submission_id) {

    }

    async verifySubmissionCommissionerSignature(email, submission_id) {
        
    }


}