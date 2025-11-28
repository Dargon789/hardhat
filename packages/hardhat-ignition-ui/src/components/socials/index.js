"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialsItems = exports.SocialsEnum = void 0;
const dc_logo_1 = require("./dc-logo");
const gh_logo_1 = require("./gh-logo");
const tw_logo_1 = require("./tw-logo");
var SocialsEnum;
(function (SocialsEnum) {
    SocialsEnum["GITHUB"] = "GITHUB";
    SocialsEnum["TWITTER"] = "TWITTER";
    SocialsEnum["DISCORD"] = "DISCORD";
})(SocialsEnum = exports.SocialsEnum || (exports.SocialsEnum = {}));
const SOCIALS_LINKS = {
    [SocialsEnum.GITHUB]: "https://hardhat.org/ignition",
    [SocialsEnum.TWITTER]: "https://twitter.com/HardhatHQ",
    [SocialsEnum.DISCORD]: "https://hardhat.org/ignition-discord",
};
exports.socialsItems = [
    {
        name: SocialsEnum.GITHUB,
        href: SOCIALS_LINKS[SocialsEnum.GITHUB],
        Icon: gh_logo_1.GitHubLogo,
    },
    {
        name: SocialsEnum.TWITTER,
        href: SOCIALS_LINKS[SocialsEnum.TWITTER],
        Icon: tw_logo_1.TwitterLogo,
    },
    {
        name: SocialsEnum.DISCORD,
        href: SOCIALS_LINKS[SocialsEnum.DISCORD],
        Icon: dc_logo_1.DiscordLogo,
    },
];
