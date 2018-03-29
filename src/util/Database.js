const mysql = require("mysql");
const settings = require("../../config.json");
const bcrypt = require('bcrypt');
const lang = require("../../lang/en.json");
const Mail = require("./Mail");

const con = mysql.createConnection({
    host: settings.MYSQL_HOST,
    user: settings.MYSQL_USER,
    password: settings.MYSQL_PASSWORD,
    database: settings.MYSQL_DATABASE
});

con.connect((err) => {
    if(err) throw err;
    // console.log("DATABASE CONNECTED");
});

function query(query, options) {
    return new Promise((resolve, reject) => {
        con.query(query, options, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    }).catch((err) => {
        console.log(err);
        return null;
    });
}

// Register a user with the given username, password, email and level
async function register(username, password, email, level=0) {
    let hash = bcrypt.hashSync(password, 10);
    let emailhash = bcrypt.hashSync(hash, 10);

    let q = await query("INSERT INTO users (username, password, email, level) VALUES (?, ?, ?, ?)", [username, hash, email, level]);
    await Mail.register(email, await getIDByUsername(username), username, emailhash);
    return q;
}

async function unregister(id) {
    return await query("DELETE FROM users WHERE id=?", [id]);
}

// Check if the given username is registered
async function isRegistered(username) {
    let result = await query("SELECT username FROM users WHERE username=?", [username]);
    return result.length === 1;
}

// Check if the given email is in use
async function isInUse(email) {
    let result = await query("SELECT email FROM users WHERE email=?", [email]);
    return result.length === 1;
}

// Return the id of the user with given username
async function getIDByUsername(username) {
    let result = await query("SELECT id FROM users WHERE username=?", [username]);
    if (result.length) {
        return result[0].id;
    } else {
        return null;
    }
}

// Return the username of the user with given id
async function getUsernameByID(id) {
    let result = await query("SELECT username FROM users WHERE id=?", [id]);
    if (result.length) {
        return result[0].username;
    } else {
        return null;
    }
}

// Set the username of the user with the given id to the given username
async function setUsername(id, username) {
    return await query("UPDATE users SET username=? WHERE id=?", [username, id]);
}

// Return the password of the user with given id
async function getPasswordByID(id) {
    let result = await query("SELECT password FROM users WHERE id=?", [id]);
    if (result.length) {
        return result[0].password;
    } else {
        return null;
    }
}

// Set the password of the user with the given id to the given username
async function setPassword(id, password) {
    return await query("UPDATE users SET password=? WHERE id=?", [password, id]);
}

// Return the email of the user with given id
async function getEmailByID(id) {
    let result = await query("SELECT email FROM users WHERE id=?", [id]);
    if (result.length) {
        return result[0].email;
    } else {
        return null;
    }
}

// Set the email of the user with the given id to the given username
async function setEmail(id, email) {
    return await query("UPDATE users SET email=? WHERE id=?", [email, id]);
}

// Return the level of the user with given id
async function getLevelByID(id) {
    let result = await query("SELECT level FROM users WHERE id=?", [id]);
    if (result.length) {
        return result[0].level;
    } else {
        return null;
    }
}

// Get all users
async function getUsers() {
    return await query("SELECT * FROM users");
}

// Set the level of the user with the given id to the given level
async function setLevel(id, level) {
    return await query("UPDATE users SET level=? WHERE id=?", [level, id]);
}

// Register the client's IP and the current timestamp of login attempt with the given username
async function addLoginAttempt(username, success, ip) {
    let id = await getIDByUsername(username);
    return await query("INSERT INTO loginAttempts (username, uid, ip, success) VALUES (?, ?, ?, ?)", [username, id, ip, success]);
}

// Register the client's IP and the current timestamp of login attempt with the given id
async function addLoginAttemptByID(id, success, ip) {
    let username = await getUsernameByID(id);
    return await query("INSERT INTO loginAttempts (username, uid, ip, success) VALUES (?, ?, ?, ?)", [username, id, ip, success]);
}

// Get all login attempts
async function getLoginAttempts() {
    return await query("SELECT * FROM loginAttempts ORDER BY Timestamp DESC");
}

// Register a namechange to the given username of a user with given ID
async function addUsernameChange(id, username) {
    return await query("INSERT INTO usernameChanges (uid, username) VALUES (?, ?)", [id, username]);
}

// Get all namechanges of a user with given id
async function getUsernameChangeHistory(id) {
    return await query("SELECT * FROM usernameChanges WHERE uid=?", [id]);
}

// Get latest namechange of a user with given id
async function getLatestUsernameChange(id) {
    return await query("SELECT * FROM usernameChanges WHERE uid=? ORDER BY Timestamp DESC LIMIT 1", [id]);
}

//MUST RETURN INSERT ID INSTEAD
// Add a song with given title and artist
async function addSong(ytid, title, artist, uid) {
    return await query("INSERT INTO music.songs (ytid, title, artist, uid) VALUES (?, ?, ?, ?)" [ytid, title, artist, uid]);
}

// Remove a song with given id
async function removeSong(id) {
    return await query("DELETE FROM music.songs WHERE id=?", [id]);
}

// Set the title of the song with given id to the given title
async function setTitle(id, title) {
    return await query("UPDATE music.songs SET title=? WHERE id=?", [title, id]);
}

// Set the title of the song with given id to the given title
async function setArtist(id, artist) {
    return await query("UPDATE music.songs SET artist=? WHERE id=?", [artist, id]);
}

//MUST RETURN INSERT ID INSTEAD
// Add a playlist with given name for the given user
async function addPlaylist(name, uid) {
    if (name === null) {
        name = "New Playlist";
    }
    return await query("INSERT INTO music.playlists (name, uid) VALUES (?, ?)", [name, uid]);
}

// Remove a playlist with given id
async function removePlaylist(id) {
    return await query("DELETE FROM music.playlists WHERE id=?", [id]);
}

// Add song with given id to playlist with given id
async function addSongToPlaylist(sid, pid) {
    return await query("INSERT INTO music.songInPlaylist (sid, pid) VALUES (?, ?)", [sid, pid]);
}

// Remove song with given id from playlist with given id
async function removeSongFromPlaylist(sid, pid) {
    return await query("DELETE FROM music.songInPlaylist WHERE sid=? AND pid=?", [sid, pid]);
}

// Get all songs of user with given id
async function getSongsOf(uid) {
    return await query("SELECT * FROM music.songs WHERE uid=? ORDER BY artist, title", [uid]);
}

// Get owner of the song with given id
async function getUserOfSong(sid) {
    let result = await query("SELECT uid FROM music.songs WHERE id=?", [sid]);
    if (result.length) {
        return result[0].uid;
    } else {
        return null;
    }
}

// Get song
async function getSong(sid) {
    let result = await query("SELECT * FROM music.songs WHERE id=?", [sid]);
    if (result.length) {
        return result[0];
    } else {
        return null;
    }
}

// Get all playlist of user with given id
async function getPlaylistsOf(uid) {
    return await query("SELECT * FROM music.playlists WHERE uid=? ORDER BY name", [uid]);
}

// Get owner of the playlist with given id
async function getUserOfPlaylist(pid) {
    let result = await query("SELECT uid FROM music.playlist WHERE id=?", [pid]);
    if (result.length) {
        return result[0].uid;
    } else {
        return null;
    }
}

// Get all playlist of user with given id
async function getPlaylistsOfSong(sid) {
    return await query("SELECT * FROM music.songInPlaylist JOIN music.playlists WHERE pid = id AND sid=? ORDER BY name", [sid]);
}

// Get all songs in playlist with given id
async function getSongsIn(pid) {
    return await query("SELECT * FROM music.songInPlaylist JOIN music.songs WHERE sid = id AND pid=? ORDER BY artist, title", [pid]);
}


/*********************************************/
/*these commands need to be in seperate files*/
/*********************************************/

// Return string without illegal chars for filename
function filename($string) {
    return preg_replace('/[\\\\\/:*?"<>|]/', '', $string);
}

function recoverAccount(){

}

// Verify if the given username, password and email make a valid user instance
async function verifyRegistration(username, password, confirmpassword, email) {
    errorCode = 0;
    errorCode += await verifyUsername(username);
    errorCode += verifyPassword(password);
    errorCode += verifyPasswordMatch(password, confirmpassword);
    errorCode += await verifyEmail(email);
    return errorCode;
}

// Verify if the given username is valid for registration
async function verifyUsername(username) {
    errorCode = 0;
    if (await isRegistered(username)) {
        errorCode += 2 ** 0;
    }
    if (username.length < 3) {
        errorCode += 2 ** 1;
    }
    if (username.length > 20) {
        errorCode += 2 ** 2;
    }
    if (!verifyUsernameChars(username)) {
        errorCode += 2 ** 3;
    }
    return errorCode;
}

// Verify if the given username is valid for registration
function verifyPassword(password) {
    errorCode = 0;
    if (password.length < 8) {
        errorCode += 2 ** 4;
    }
    if (password.length > 30) {
        errorCode += 2 ** 5;
    }
    if (!verifyPasswordChars(password)) {
        errorCode += 2 ** 6;
    }
    return errorCode;
}

// Check if passwords match
function verifyPasswordMatch(password, confirmpassword) {
    errorCode = 0;
    if (password !== confirmpassword) {
        errorCode += 2 ** 7;
    }
    return errorCode;
}

// Verify if the email is valid
async function verifyEmail(email) {
    errorCode = 0;
    if (await isInUse(email)) {
      errorCode += 2 ** 8;
    }
    // if (!filter_var(email, FILTER_VALIDATE_EMAIL)) {
    //   errorCode += 2 ** 9;
    // }
    return errorCode;
}

// Verify string for valid chars
function verifyUsernameChars(string) {
    return !string.match(/[^A-Za-z0-9._-]/);
    // return !preg_match('/[^A-Za-z0-9._-]/', string);
}

// Verify string for valid chars
function verifyPasswordChars(string) {
    return !string.match(/[^A-Za-z0-9!"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}~]/);
    // return !preg_match('/[^A-Za-z0-9!"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}~]/', $string);
}

// Get the error message of this errorCode
function getErrorMessage(errorCode) {
    let errorMessage;
    switch(errorCode) {
        case 0:
            errorMessage = lang["username.availability"];
            break;
        case 1:
            errorMessage = lang["username.tooshort"];
            break;
        case 2:
            errorMessage = lang["username.toolong"];
            break;
        case 3:
            errorMessage = lang["username.invalidchars"];
            break;
        case 4:
            errorMessage = lang["password.tooshort"];
            break;
        case 5:
            errorMessage = lang["password.toolong"];
            break;
        case 6:
            errorMessage = lang["password.invalidchars"];
            break;
        case 7:
            errorMessage = lang["password.match"];
            break;
        case 8:
            errorMessage = lang["email.availability"];
            break;
        case 9:
            errorMessage = lang["email.format"];
            break;
    }
    return errorMessage;
}

// Decode errorCode
function decodeErrorCode(errorCode) {
    let errorMessageList = [];
    let binErrorCode = dec2bin(errorCode);
    for (let i = 1; i <= binErrorCode.length; i++) {
        if (binErrorCode.charAt(binErrorCode.length - i) == "1") {
            errorMessageList.push(getErrorMessage(i-1));
        }
    }
    return errorMessageList;
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

// Verify if the given username and password make a valid login
async function verifyLogin(username, password) {
    let id = await getIDByUsername(username);
    let hash = await getPasswordByID(id);

    return bcrypt.compareSync(password, hash.replace("$2y$", "$2a$"));
}

// Return if the user with given id can do a namechange
async function canDoUsernameChange(id) {
    let data = await getLatestUsernameChange(id);
    let old = new Date(data.timestamp);
    let now = Date.now();
    return (now - old >= 30 * 24 * 60 * 60 * 1000);
}

module.exports = {
    register,
    unregister,
    isRegistered,
    isInUse,
    getIDByUsername,
    getUsernameByID,
    setUsername,
    getPasswordByID,
    setPassword,
    getEmailByID,
    setEmail,
    getLevelByID,
    getUsers,
    setLevel,
    addLoginAttempt,
    addLoginAttemptByID,
    getLoginAttempts,
    addUsernameChange,
    getUsernameChangeHistory,
    getLatestUsernameChange,
    addSong,
    removeSong,
    setTitle,
    setArtist,
    addPlaylist,
    removePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getSongsOf,
    getUserOfSong,
    getSong,
    getPlaylistsOf,
    getUserOfPlaylist,
    getPlaylistsOfSong,
    getSongsIn,
    filename,
    recoverAccount,
    verifyRegistration,
    verifyUsername,
    verifyPassword,
    verifyPasswordMatch,
    verifyEmail,
    verifyUsernameChars,
    verifyPasswordChars,
    getErrorMessage,
    decodeErrorCode,
    verifyLogin,
    canDoUsernameChange
};