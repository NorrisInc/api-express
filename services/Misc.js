
const date = require('date-and-time');
const mysql = require('mysql');
var CryptoJS = require("crypto-js");
const crypto = require('crypto');

class MiscSingleton {
    
    async query(connection, query, params = null) {
        return new Promise(function(resolve, reject) {
            connection.getConnection((error, connect) => {
                if (error) return reject(error);
                connect.query(query, params, (err, data) => {
                    if (err) return reject(err);
                    //console.log(data);
                    resolve(data);
                });
                connect.release();
            })
        });
    }
    hashPassword(str) {
        const cipher = crypto.createCipher('aes192', 'norrisLtdRuConnect');
        let encrypted = cipher.update(str, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    /*encrypt(text) {
        const key = crypto.scryptSync('norrisLtdRuConnect', 'sss@lTTt', 32); //генерация ключа
        const iv = crypto.randomBytes(16);

        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encyptedData = cipher.update(text, 'utf8', 'hex');
        encyptedData += cipher.final('hex');
        return encyptedData;
    }
    decrypt(text) {
        const key = crypto.scryptSync('norrisLtdRuConnect', 'sss@lTTt', 32); //генерация ключа
        const iv = crypto.randomBytes(16);

        var decyptedData = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decyptedData = cipher.update(text, 'hex', 'utf8');
        decyptedData += cipher.final('utf8');

        return decyptedData;
    }*/
    encrypt(text){
        //return CryptoJS.AES.encrypt(text, "norrisLtdRuConnect:--**-:sss@lTTt").toString();
        return CryptoJS.AES.encrypt(text, "0x5548EA51FBC112").toString();
    }
    decrypt(text) {
        //return CryptoJS.AES.decrypt(text, "norrisLtdRuConnect:--**-:sss@lTTt").toString(CryptoJS.enc.Utf8);
        return CryptoJS.AES.decrypt(text, "0x5548EA51FBC112").toString(CryptoJS.enc.Utf8);
    }
}

module.exports = new MiscSingleton();