// const db = require("../models/index");
// const Submission = db.submissions;
// const Accused = db.accuseds;
// const Charge = db.charges;
// const Pending = db.pendings;
// const Conviction = db.convictions;

import { db, SubmissionModel, AccusedModel, ChargesModel, PendingModel, ConvictionModel, RelatedMatterModel } from "../models/index.js";
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
    let submission = await SubmissionModel.findByPk(accused.submissionId);
    await submission.update({ status: 'charge_saved' });
    await submission.save();
    res.status(201).json({
        outcome: 'success',
        charge: new_charge
    });

};



export const savePending = async (req, res) => {
    
    let pending = req.body;
    let new_pending = await PendingModel.create(pending);

    res.status(201).json({
        outcome: 'success',
        pending: new_pending
    });

};


export const saveRelatedMatter = async (req, res) => {
    
    let related = req.body;
    let new_related = await RelatedMatterModel.create(related);

    res.status(201).json({
        outcome: 'success',
        pending: new_related
    });

};



export const saveConviction = async (req, res) => {
    
    let conviction = req.body;
    let new_conviction = await ConvictionModel.create(conviction);

    res.status(201).json({
        outcome: 'success',
        conviction: new_conviction
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

export const pendings = async (req, res) => {
    const id = req.params.id;
    let returned_pendings = await PendingModel.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        pendings: returned_pendings
    }); 
};

export const relateds = async (req, res) => {
    const id = req.params.id;
    let returned_relateds = await RelatedMatterModel.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        relateds: returned_relateds
    }); 
};

export const convictions = async (req, res) => {
    const id = req.params.id;
    let returned_convictions = await ConvictionModel.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        convictions: returned_convictions
    }); 
};


export const findOne = async (req, res) => {
    const id = req.params.id;
    let accused = await AccusedModel.findByPk(id)
    res.status(200).json({
        accused: accused
    });
}