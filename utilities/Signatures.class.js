import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel } from "../models/index.js";
import {dbConfig} from "../config/db.config.js";
import mysql from 'mysql2';



export class Signatures {

    async complainantSubmissionSign(email, submission_id) {
        let submission = await SubmissionModel.findByPk(submission_id);
        
    }

    async commissionerSubmissionSign(email, submission_id) {

    }

    async verifySubmissionComplianantSignature(email, submission_id) {

    }

    async verifySubmissionCommissionerSignature(email, submission_id) {
        
    }


}