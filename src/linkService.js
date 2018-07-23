import { blockService } from "./blockService";

/*
This class provides functionality around link creation and manipulation
*/

//Link Data Functionality
class LinkService {

    constructor() {
        this.links = [];
        this.visibleLinks = [];
    }

    //Creates links using blockService function and filters to only show visible links in backbone
    createLinks() {
      blockService.parseBlocksToCreateLinks();
      this.visibleLinks = this.links.filter(l =>l.isBackbone);
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

    //Add visible links to stack
    addVisibleLinks(key, n=0) {
        if (n > 0) {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "destination"
            ).forEach(l => {
                this.addVisibleLinks(l.to,n=1)
            });
            this.visibleLinks.push(...this.links.filter(l => l.from === key && l.type === "destination"));
        }
        else {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                this.addVisibleLinks(l.to,n=1)
            });
            this.visibleLinks.push(...this.links.filter(l => l.from === key && l.type === "utility"));
        }
    }

    //Removes visible links
    removeVisibleLinks(key, n=0) {
        if (n > 0){
            this.visibleLinks.filter(l =>
                l.from === key
            ).forEach(l => {
                this.removeVisibleLinks(l.to, n=1)
            });
            this.visibleLinks = this.visibleLinks.filter(l => l.from !== key);
        }
        else {
            this.visibleLinks.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                this.removeVisibleLinks(l.to, n=1)
            });
            this.visibleLinks = this.visibleLinks.filter(l => l.from !== key || l.type === "destination");
        }
    }

    //Returns true if link is of type destination
    hasDestination(key) {
        return (this.links.filter(l => l.from === key && l.type === "destination").length > 0);
    }

    //Returns true if link is of type utility
    hasUtilities(key) {
        return (this.links.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    //Returns true if block has utility links
    hasChildren(key) {
        return (this.links.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    //Returns true if block has visible utility links
    hasVisibleChildren(key) {
        return (this.visibleLinks.filter(l => l.from === key && l.type === "utility").length > 0);
    }

}

export const linkService = new LinkService();
