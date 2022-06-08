var CryptoJS = require('crypto-js');
const misc = require('./Misc');
const JWT = require('jsonwebtoken'); 

class AuthService {
    async Login() {
        const request = {
            user: {
                uID: 100,
                uName: 'Thomas',
                lastUpdated: Date.now()
            },
            token: JWT.sign('test','test')

        }
        global.sessions.push(request);
        return request;
    }
}

module.exports = new AuthService();