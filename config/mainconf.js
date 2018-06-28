// config/database.js
module.exports = {
    'commondb_connection': {
        'multipleStatements': true,
        'connectionLimit' : 100,
        'host': '10.11.90.15',
        'user': 'AppUser',
        'password': 'Special888%',
        'port'    :  3306
    },
    'session_connection': {
        'multipleStatements': true,
        'connectionLimit' : 100,
        'host': '10.11.90.15',
        'user': 'SessionManager',
        'password': 'SManager$44',
        'port'    :  3306
    },

    'Session_db': 'session_DB',
    'Login_db': 'CitySmart',
    'Login_table': 'Users',
    'Upload_db': 'CitySmart',

    'Server_Port': 9090,

    'Upload_Path': 'http://v2.cs.aworldbridgelabs.com/uploadfiles'

};
