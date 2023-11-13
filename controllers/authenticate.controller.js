const CONFIG = require('../../config/config')
const db = require("../models");
const AccessLog = db.accesslogs;
var spsave = require("spsave").spsave;
const formidable = require('formidable')

const User = db.users;
const Permission = db.permissions;
const Op = db.Sequelize.Op;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
//const { authenticate } = require('ldap-authentication')
//const { ldap } =  require ("ldapjs")
var LdapAuth = require('ldapauth-fork');
const { servicesVersion } = require('typescript');





exports.doNothing = async (req, res) => {
  console.log("+++++++++++++++ AUTHENTICATE +++++++++++++++++++")
}

exports.login = async (req, res) => {
    try{
      const ua =  req.get('user-agent') ? req.get('user-agent') : "";
      console.log(req.headers)
      const newLogEntry = {
        user_agent: ua ? ua : "",
        referer: (req.headers.referer) ? req.headers.referer : "",
        socket_ip: (req.socket.remoteAddress) ? req.socket.remoteAddress : "",
        host: (req.headers.host) ? req.headers.host : "", 
      };
      const username = req.body.username;
      const password = req.body.password;
      newLogEntry.username = req.body.username ? req.body.username : ""
      const user = await User.findOne({ 
        where: {
            email: username ,
        }
      });
      if (!user) {
        //log failed login attempt
        AccessLog.create(newLogEntry)
        .then(data => {
          return res.json({ msg: "Please enter a valid username and password" });
        })
        .catch(err => {
          return res.json({ msg: "Please enter a valid username and password" });
        });
      }
      let passHash = await bcrypt.hash(password, saltRounds)
      const user_role =  user.role;
      const user_id =  user.id;
      console.log("User role: "+user_role)
      const verbose_permissions = await Permission.findOne({
        where:{
          id: user_role
        }
      });
      const permissions = JSON.parse(JSON.stringify(verbose_permissions))
      const per_obj = (JSON.parse(permissions.permissions))
      const user_obj = per_obj.userList
      //console.log("Verbose Permissions: " + permissions.permissions.userlist)
      var user_permissions = "";
      user_permissions = verbose_permissions ? JSON.parse(JSON.stringify(verbose_permissions)) : "";
      //console.log("Permissions: "+user_permissions)

      const user_db_pass = user.password ? user.password : ""
      const match = await bcrypt.compare(password, user_db_pass);

      if(!match) {
          console.log(match)
          AccessLog.create(newLogEntry)
          .then(data => {
            return res.send({ msg: "Please enter a valid username and password" });
          })
          .catch(err => {
            throw err
          });
      }
      else{
        newLogEntry.user_id = user.id ? user.id : ""
        const accessToken = jwt.sign(
            { username, id: user.id, user_role: user.role, permissions: per_obj },
            JWT_SECRET,
            {
              expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
            }
          );
          //LOG SUER ACCESS
          console.log(newLogEntry)
          AccessLog.create(newLogEntry)
          .then(data => {
            return;
          })
          .catch(err => {
            return;
          });
          //------------------------------------
          res.json({ status:200, token: accessToken });
        }
    }
    catch (err) {
      console.log(err);
      res.status(503).json({ msg: "Server error!" });
    }
  };

exports.authenticate = async(req, res, next) =>
{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("______________________TOKEN___________________________")
  //console.log(token)
  console.log("______________________TOKEN___________________________")
  if (token === null) return res.status(401).json({ msg: "Not Authorized" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ msg: err });
    console.log("______________________USER___________________________")
    //console.log(user)
    console.log("______________________USER___________________________")
    req.user = user;
    next();
  });
};

exports.loginLdap = async (req, res) => {
  /*
  $domain = 'judiciarytt.org';
  $ldapconfig['host'] = 'judiciarydc2.judiciarytt.org';
  $ldapconfig['port'] = 389;
  $ldapconfig['basedn'] = 'ou=users,ou=hoj,ou=1judiciarytt,ou=judiciarytt,dc=judiciarytt,dc=org';
  */
  //console.log("LDAP LOGIN")

  try{

    const username = req.body.username;
    const password = req.body.password;
    let ldapBaseDn = CONFIG.ldap.dn

 
    
    let options = {
      ldapOpts: { 
        url: 'ldap://judiciarydc2.judiciarytt.org:389' },
      //userDn: `uid=${username},judiciarydc2,dc=judiciarytt,dc=org`,
      //userDn: `uid=hhernandez,dc=judiciarytt,dc=org`,
      userDn: `uid=${username},${ldapBaseDn}`,
      userPassword: `${password}`,
      userSearchBase: ldapBaseDn,
      usernameAttribute: 'uid'
      //username: `${username}`,
      //userSearchBase: 'dc=judiciarytt,dc=org',
      //usernameAttribute: 'uid',
    }

    let user = await authenticate(options)


    auth.authenticate(username, password, function(err, user) {
      
    });
    
    
    
    /*
    const user = await User.findOne({ 
      where: {
          email: username ,
      }
    });
    */

    if (!user) {
      return res.json({ msg: "Please enter a valid username" });
    }
    console.log(user)

    let passHash = await bcrypt.hash(password, saltRounds)

    const user_role =  user.role;
    console.log("User role: "+user_role)
    const verbose_permissions = await Permission.findOne({
      where:{
        id: user_role
      }
    });

    var user_permissions = "";
    user_permissions = verbose_permissions?JSON.parse(JSON.stringify(verbose_permissions)):"";
    console.log("Permissions: "+user_permissions)
    const user_db_pass = user.password;
    //console.log("passHash: "+passHash)
    //console.log("user_db_pass: "+user_db_pass)
    const match = await bcrypt.compare(password, user_db_pass);
    //console.log(match)
    
    if(!match) {
      console.log(match)
      return res.json({ msg: "Username and or password is incorrect" });

    }

    
    const accessToken = jwt.sign(
      { username, id: user.id, permissions:JSON.stringify(user_permissions) },
      JWT_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "production" ? "6h" : "2 days",
      }
    );
    res.json({ status:200, token: accessToken });
  }
  catch (err) {
    console.log(err);
    res.status(503).json({ msg: "Server error!" });
  }
};




exports.refreshToken = async(req, res, next) =>
{
  const refreshTokenId = ctx.cookies.get(config.security.refreshToken.name, {
    signed: true,
  });

  const dbToken = await getExistingRefreshTokenById(refreshTokenId);

  if (!dbToken.id || dbToken.error) {
      ctx.throw(400, `The refresh token is not valid.`);
      return;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (dbToken.validityTimestamp <= currentTimestamp) {
      await deleteRefreshToken(refreshTokenId);

      ctx.throw(400, `The refresh token is expired.`);
      return;
  }

  const user = await getOne(dbToken.userId);

  if (!user || user.error) {
      ctx.throw(401, user.error || 'Invalid credentials.');
      return;
  }

  const token = jwt.sign(
      { username: user.username },
      config.security.jwt.secretkey,
      {
          expiresIn: config.security.jwt.expiration,
      }
  );

  ctx.body = {
      token: token,
      tokenExpiry: config.security.jwt.expiration,
      username: user.username,
  };
};

