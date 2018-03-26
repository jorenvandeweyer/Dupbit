const Database = require("./Database");
const pageInfo = require("../../data/pages");
const Url = require("./Url");
const User = require("./User");
const Token = require("./Token");

class Data {
    constructor(page) {
        this.page = page;
        this.pageInfo = pageInfo[this.page.url.url.pathname];
        if (this.pageInfo == undefined) {
            this.pageInfo = pageInfo["/notfound"];
        }
        this.lang = require("../../lang/en.json");
        this.path = this.page.url.url.pathname;
        this.mimeType = ".ejs";
        this.errorMessageList = [];
        this.addQuery();
    }

    addQuery() {
        let query = this.page.url.url.query;
        for (let key in query) {
            this[key] = query[key];
        }
    }

    async load() {
        let decoded = Token.verifyToken(this.page.cookies["sid"]);

        if (decoded) {
            this.session = decoded.data;
            this.user = await new User(this.session.id).load();
        } else {
            this.session = {
                isLoggedIn: false,
            }
            this.user = User.nullUser();
        }

        if (this.pageInfo && this.pageInfo.requireLogin && !this.session.isLoggedIn) {
            this.status = 303;
            this.redirectHeader = "login?redirect=" + this.pageInfo.currentPage;
        } else {
            this.status = 200;
        }

        return this;
    }
}

async function get(page) {
    return new Data(page).load();
}

module.exports = {
    get,
};
