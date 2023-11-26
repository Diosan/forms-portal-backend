const db = require("../models/index");
const Accused = db.accuseds;
const Charge = db.charges;

exports.saveCharge = async (req, res) => {
    
    // let charge = {
    //     name: 'Espionage',
    //     ICCS: '1Q2W3E',
    //     UNODC: 'P0O9I8',
    //     counts: 1,
    //     accusedId: 6
    // };
    let charge = req.body;
    let new_charge = Charge.create(charge);
    res.status(201).json({
        outcome: 'success',
        charge: new_charge
    })

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