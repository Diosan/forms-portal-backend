import { db, SubmissionModel, AccusedModel, ChargesModel } from "../models/index.js";
import fs from "fs";
import formidable from 'formidable'
import {dbConfig} from "../config/db.config.js"
import mysql from 'mysql2'



export const saveCharge = async (req, res) => {
    
    // let charge = {
    //     name: 'Espionage',
    //     ICCS: '1Q2W3E',
    //     UNODC: 'P0O9I8',
    //     counts: 1,
    //     accusedId: 6
    // };
    let charge = req.body;
    let new_charge = await ChargesModel.create(charge);
    let accused = await AccusedModel.findByPk(req.body.accusedId);
    let submission = await SubmissionModel.findByPk(AccusedModel.submissionId);
    await SubmissionModel.update({ status: 'charge_saved' });
    await submission.save();
    res.status(201).json({
        outcome: 'success',
        charge: new_charge
    });

};

export const charges = async (req, res) => {
    const id = req.params.id;
    let returned_charges = await ChargesModel.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        charges: returned_charges
    }); 
};