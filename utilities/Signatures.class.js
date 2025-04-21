import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel, SignatureModel, UserModel } from "../models/index.js";
import {dbConfig} from "../config/db.config.js";
import mysql from 'mysql2';
import { createHash } from 'node:crypto';
// import signaturesModel from "../models/signatures.model.js";



export class Signatures {

    constructor() {
            
    }


    complainantSubmissionSign = async (email, submission_id) => {

        console.log(email)
        let submission = await SubmissionModel.findByPk(submission_id);
        // console.log(submission)

        let user = await UserModel.findOne({
            where: {"email": email}
        });

        // console.log('User found by email: ', user);

        // console.log('\n\n\n Current submission record: ', submission.dataValues);

        let record = JSON.stringify(submission.dataValues);

        // console.log('\n\n\n Current submission record string: ' + record);

        let signature = await SignatureModel.create({
            type: 'submission',
            email: email,
            record: record,
            hash: createHash('sha3-256').update(record).digest('hex'),
            userId: user.id,
            content_id: submission.dataValues.id
        });

        // console.log('\n\n\n Signature: ', signature.dataValues);

        // console.log('\n\n\n User: ', user.dataValues);

        return {
            signature: signature.dataValues,
            user: user.dataValues
        }
        
        // return '1q2w3e4r5t6y7u8i9o0p';
    }

    consenterSubmissionSign = async (email, submission_id, note) => {

        console.log(email)
        let submission = await SubmissionModel.findByPk(submission_id);
        // console.log(submission)

        let user = await UserModel.findOne({
            where: {"email": email}
        });

        // console.log('User found by email: ', user);

        // console.log('\n\n\n Current submission record: ', submission.dataValues);

        let record = JSON.stringify(submission.dataValues);

        // console.log('\n\n\n Current submission record string: ' + record);

        let signature = await SignatureModel.create({
            type: 'consent',
            email: email,
            record: record,
            hash: createHash('sha3-256').update(record).digest('hex'),
            userId: user.id,
            content_id: submission.dataValues.id,
            note: note
        });

        // console.log('\n\n\n Signature: ', signature.dataValues);

        // console.log('\n\n\n User: ', user.dataValues);

        return {
            signature: signature.dataValues,
            user: user.dataValues
        }
        
        // return '1q2w3e4r5t6y7u8i9o0p';
    }

    verifierSubmissionSign = async (email, submission_id) => {


        let submission = await SubmissionModel.findByPk(submission_id);

        let user = await UserModel.findOne({
            where: {email: email}
        });

        // console.log('User found by email: ', user.dataValues);

        // console.log('\n\n\n Current submission record: ', submission.dataValues);

        let record = JSON.stringify(submission.dataValues);

        // console.log('\n\n\n Current submission record string: ' + record);

        let signature = await SignatureModel.create({
            type: 'verification',
            email: email,
            record: record,
            hash: createHash('sha3-256').update(record).digest('hex'),
            userId: user.id,
            content_id: submission.dataValues.id
        });

        console.log('\n\n\n Signature: ', signature.dataValues);

        console.log('\n\n\n User: ', user.dataValues);

        return {
            signature: signature.dataValues,
            user: user.dataValues
        }
        
        // return '1q2w3e4r5t6y7u8i9o0p';
    }

    async verifySubmissionComplianantSignature(email, submission_id) {

    }

    async verifySubmissionCommissionerSignature(email, submission_id) {
        
    }


}