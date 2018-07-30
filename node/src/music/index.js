const fs = require("fs");
const db = require("../util/Database");
const downloader = require("./downloader");

async function download(url, hash) {
    const download = await downloader(url);
    fs.renameSync(`data/music/${download.info}`, `data/music/${hash}.mp3`);
}

async function convert(uid, provider, url, title, artist) {
    let extractor;

    if (fs.existsSync(`${__dirname}/extractors/${provider}.js`)) {
        extractor = require(`./extractors/${provider.toLowerCase()}`);
    } else {
        extractor = require("./extractors/unknown");
    }

    const data = extractor(url);

    let result = await db.getSongByName(data.hash);

    if (!result) {
        download(data.url, data.hash);
        await db.addSong(data.hash, url, provider, true);
        result = await db.getSongByName(data.hash);
    }

    const convert = await db.addConvert(result.id, uid, title, artist);

    return convert.insertId;
}

async function stream(song) {
    if (!fs.existsSync(`data/music/${song.filename}.mp3`)) {
        await download(song.url, song.filename);
    }
    return fs.readFileSync(`data/music/${song.filename}.mp3`);
}

function createFilename(title, artist, url) {
    if (title !== "" && artist !==  "") return `${artist} - ${title}`;
    if (title !== "") return title;
    if (artist !== "") return artist;
    if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
    return url;
}

module.exports = {
    convert,
    stream,
    createFilename,
};
