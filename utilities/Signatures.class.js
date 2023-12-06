import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel } from "../models/index.js";
import {dbConfig} from "../config/db.config.js";
import mysql from 'mysql2';
import { createHash } from 'node:crypto';



export class Signatures {

    constructor() {
            
    }


    complainantSubmissionSign = async (email, submission_id) => {


        let submission = await SubmissionModel.findByPk(submission_id);

        console.log('\n\n\n Submission created at: ', submission.createdAt);
        console.log('Submission updated at: ', submission.updatedAt);
        console.log('\n\n\n');

        return {
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt
        }       
    }

    async commissionerSubmissionSign(email, submission_id) {

    }

    async verifySubmissionComplianantSignature(email, submission_id) {

    }

    async verifySubmissionCommissionerSignature(email, submission_id) {
        
    }


}