const db = require("../models/index");
const Submission = db.submissions;
const Accused = db.accuseds;
const Charge = db.charges;
const Pending = db.pendings;
const Conviction = db.convictions;

exports.saveCharge = async (req, res) => {
    
    // let charge = {
    //     name: 'Espionage',
    //     ICCS: '1Q2W3E',
    //     UNODC: 'P0O9I8',
    //     counts: 1,
    //     accusedId: 6
    // };
    let charge = req.body;
    let new_charge = await Charge.create(charge);
    let accused = await Accused.findByPk(req.body.accusedId);
    let submission = await Submission.findByPk(accused.submissionId);
    await submission.update({ status: 'charge_saved' });
    await submission.save();
    res.status(201).json({
        outcome: 'success',
        charge: new_charge
    });

};



exports.savePending = async (req, res) => {
    
    let pending = req.body;
    let new_pending = await Pending.create(pending);

    res.status(201).json({
        outcome: 'success',
        pending: new_pending
    });

};



exports.saveConviction = async (req, res) => {
    
    let conviction = req.body;
    let new_conviction = await Conviction.create(conviction);

    res.status(201).json({
        outcome: 'success',
        conviction: new_conviction
    });

};



exports.charges = async (req, res) => {
    const id = req.params.id;
    let returned_charges = await Charge.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        charges: returned_charges
    }); 
};

exports.pendings = async (req, res) => {
    const id = req.params.id;
    let returned_pendings = await Pending.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        pendings: returned_pendings
    }); 
};

exports.convictions = async (req, res) => {
    const id = req.params.id;
    let returned_convictions = await Conviction.findAll({
        where: {
            accusedId: id
        }
    });
    // console.log('\n\n\n returned_charges: ', returned_charges);
    res.status(201).json({
        convictions: returned_convictions
    }); 
};


exports.findOne = async (req, res) => {
    const id = req.params.id;
    let accused = await Accused.findByPk(id)
    res.status(200).json({
        accused: accused
    });
}