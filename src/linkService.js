/*
This class provides functionality around link creation and manipulation
*/

import {
    blockService
} from "./blockService";

//Link Data Functionality
class LinkService {

    //Creates the linkService
    constructor() {
        this.links = [];
        this.visibleLinks = [];
    }

    //Creates links using blockService function and filters to only show visible links in backbone
    createLinks() {
        blockService.parseBlocksToCreateLinks();
        this.retractAllLinks();
    }

    //Display all Links
    expandAllLinks() {
        this.visibleLinks = this.links;
    }

    //Display only the backbone Links
    retractAllLinks() {
        this.visibleLinks = this.links.filter(l => l.isBackbone);
    }

    //Returns all link objects
    getLinks() {
        return this.links;
    }

    //Returns link object between blocks from and to
    getLink(from, to) {
        return this.links.find(l => l.from === from && l.to === to);
    }

    //Returns all visible link objects
    getVisibleLinks() {
        return this.visibleLinks;
    }

    //Returns visible link between blocks from and to
    getVisibleLink(from, to) {
        return this.visibleLinks.find(l => l.from === from && l.to === to);
    }

    //Adds link to stack
    addLink(links) {
        this.links.push(links);
    }

    //Add Visible Links to stack
    addVisibleLinks(key, n = 0) {
        if (n > 0) {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "destination"
            ).forEach(l => {
                this.addVisibleLinks(l.to, n = 1)
            });
            this.visibleLinks.push(...this.links.filter(l => l.from === key && l.type === "destination"));
        } else {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                this.addVisibleLinks(l.to, n = 1)
            });
            this.visibleLinks.push(...this.links.filter(l => l.from === key && l.type === "utility"));
        }
    }

    //Removes Visible Links
    removeVisibleLinks(key, n = 0) {
        if (n > 0) {
            this.visibleLinks.filter(l =>
                l.from === key
            ).forEach(l => {
                this.removeVisibleLinks(l.to, n = 1)
            });
            this.visibleLinks = this.visibleLinks.filter(l => l.from !== key);
        } else {
            this.visibleLinks.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                this.removeVisibleLinks(l.to, n = 1)
            });
            this.visibleLinks = this.visibleLinks.filter(l => l.from !== key || l.type === "destination");
        }
    }

    //Returns true if block has link(s) of type destination
    hasDestination(key) {
        return (this.links.filter(l => l.from === key && l.type === "destination").length > 0);
    }

    //Returns true if block has visibleLink(s) of type destination
    hasVisibleDestination(key) {
        return (this.visibleLinks.filter(l => l.from === key && l.type === "destination").length > 0);
    }

    //Returns true if block has link(s) of type utility
    hasUtilities(key) {
        return (this.links.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    //Returns true if block has visibleLink(s) of type utility
    hasVisibleUtilities(key) {
        return (this.visibleLinks.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    //Gets and sets a link's linkNumber. Called from within BlockService
    setLinkNumber(from, to, number) {
        if (this.getLink(from, to) !== null && this.getLink(from, to) !== "undefined") {
            this.getLink(from, to).linkNumber = number;
        }
    }
}

//Export the linkService Singleton
export const linkService = new LinkService();
