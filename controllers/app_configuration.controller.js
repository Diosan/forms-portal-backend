const db = require("../models/index");
const fs = require("fs");
const formidable = require('formidable')
const PastDraws = db.past_draws;
const BizBank = db.our_banks;
const Service = db.services
const SelectAddToBalance = db.selections_add_to_balance
const filePath = "./omm.json";

exports.generateConfigFile = (req, res) => {
    // console.log(req.body)
    if (!req) {
      return;
    }
    var past_draws = []
    var banks = []
    var services = []
    var add_to_balances = []

    const config = req.body

    try {
            // Write to file
            fs.writeFile('omm.json', JSON.stringify(config, null, 2), (writeErr) => {
                if (writeErr) throw writeErr;
                console.log(`File ${filePath} has been created`);
            });

       
        //open the configuration file and update it
        Promise.all([
            PastDraws.findAll({order: [ ['draw_number', 'DESC'] ]}),              //order by updatedAt DESC
            BizBank.findAll({order: [ ['bank_name', 'ASC'] ]}),                   //bank_name ASC
            Service.findAll({order: [ ['serviceType', 'ASC'] ]}),                //serviceType ASC
            SelectAddToBalance.findAll({order: [ ['add_amount', 'ASC'] ]}),             //order by updatedAt DESC
        ])
        .then(([pastDrawsData, banksData, servicesData, addToBalancesData]) => {
            // past_draws = pastDrawsData;
            var banks = [];
            var services = [];
            var past_draws = [];
            var add_to_balances = [];

            for(let x=0; x<pastDrawsData.length;x++){ past_draws.push(pastDrawsData[x].dataValues) }
            for(let x=0; x<banksData.length;x++){ banks.push(banksData[x].dataValues) }
            for(let x=0; x<servicesData.length;x++){ banks.push(services[x].dataValues) }
            for(let x=0; x<addToBalancesData.length;x++){ banks.push(add_to_balances[x].dataValues) }

            console.log("PAST DRAWS")
            console.log("----------------------------")
            // console.log(past_draws)
            console.log("BANKS")
            console.log("----------------------------")
            // console.log(banks)
            console.log("SERVICES")
            console.log("----------------------------")
            // console.log(services)
            console.log("FOR ADD TO BALANCE")
            console.log("----------------------------")
            // console.log(add_to_balances)

             // read the current configuration from file
             // and update it with values form the database calls
            const currentConfig = JSON.parse(fs.readFileSync(filePath));
            // update the configuration with data from database calls
            currentConfig.banks = banks;
            currentConfig.past_draws = past_draws;
            currentConfig.services = services;
            currentConfig.balance_selection = add_to_balances;
            // console.log(currentConfig)
            fs.writeFile(filePath, JSON.stringify(currentConfig, null, 2), (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log("omm.json has been updated successfully.");
              });
              

        })
        .catch(err => {
            throw err
        });
    } catch (err) {
        console.log(err)
    }

    res.json({status: 200, message: "Configuration File Updated"})
};
