module.exports = {
    "/index": {
        title: "Dupbit - Home",
        currentPage: "index"
    },
    "/beta": {
        title: "Dupbit - Beta",
        currentPage: "beta"
    },
    "/welcome": {
        title: "Dupbit - Welcome",
        currentPage: "welcome",
        requireLogin: true
    },
    "/contact": {
        title: "Dupbit - Contact",
        currentPage: "contact",
    },
    "/register": {
        title: "Dupbit - Register",
        currentPage: "register",
        requireLogout: true,
        //errorCode = GET["fail"] ? GET["fail"] : 0
        //errorMessageList = decodeErrorCude(errorCode)
    },
    "/login": {
        title: "Dupbit - Login",
        currentPage: "login",
        requireLogout: true,
        // redirect: "welcome"
        //$redirect = isset($_GET["redirect"]) ? $_GET["redirect"] : "welcome";
        //$fail = isset($_GET["fail"]);
        //$notActivated = isset($_GET["notActivated"]);
    },
    "/users": {
        title: "Dupbit - Users",
        currentPage: "users",
        requireLogin: true,
        requireLevel: 3,
        pageData: {
            "users": "Database.getUsers()",
        }
    },
    "/dupbot": {
        title: "Dupbit - Dupbot",
        currentPage: "dupbot",
        metaKeywords: "Dupbot, Discord, Bot, Discordbot",
        metaDescription: "Dupbot the bot for you Discord server.",
    },
    "/notfound": {
        title: "Dupbit - Not Found",
        currentPage: "notfound",
    },
    "/not_authorized": {
        title: "Dupbit - Not Authorized",
        currentPage: "not_authorized",
    },
    "/logins": {
        title: "Dupbit - Logins",
        currentPage: "logins",
        requireLogin: true,
        requireLogout: false,
        requireLevel: 3,
        pageData: {
            "attempts": "Database.getLoginAttempts()",
        }
    },
    "/projects/calendar/index": {
        title: "Dupbit - Calendar",
        currentPage: "projects/calendar",
        requireLogin: true,
        pageData: {
            "calendarTable": "Database.getCalendarTable(this.session.id)",
            "calendarUrls": "Database.getCalendarUrls(this.session.id, this.query.calendar)",
            "calendarCourseNumbers": "Database.getCalendarCourseNumbers(this.session.id, this.query.calendar)",
        },
    },
    "/projects/music/index": {
        title: "Dupbit - Music",
        currentPage: "projects/music",
        requireLogin: true,
        requireLevel: 2,
        pageData: {
            "playlists": "Database.getPlaylistsOfSmart(this.session.id)",
            "songs": "Database.getSongsSmart(this.query.playlist, this.session.id)",
        },
    },
    "/projects/connect/index": {
        title: "Dupbit - Connect",
        currentPage: "projects/connect",
    },
    "/projects/connect/control": {
        title: "Dupbit - Connect Panel",
        currentPage: "projects/connect/control",
        requireLogin: true,
        requireLevel: 2,
    },
    "/account/index": {
        title: "Dupbit - Account Settings",
        currentPage: "account",
        requireLogin: true,
    },
    "/account/edit": {
        title: "Dupbit - Account Settings",
        currentPage: "account/edit",
        requireLogin: true,
    },
    "/account/tokens": {
        title: "Dupbit - Account Settings",
        currentPage: "account/tokens",
        requireLogin: true,
    },
};
