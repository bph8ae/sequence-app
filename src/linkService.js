import { blockService } from "./blockService";

//Link Data Functionality
class LinkService {

    constructor() {
        this.links = [];
        this.visibleLinks = [];
    }

    createLinks() {
      blockService.parseBlocksToCreateLinks();
      this.visibleLinks = this.links.filter(l =>l.isBackbone);
    }

    getLinks() {
        return this.links;
    }

    getLink(from, to) {
        return this.links.find(l => l.from === from && l.to === to);
    }

    getVisibleLinks() {
        return this.visibleLinks;
    }

    getVisibleLink(from, to) {
        return this.visibleLinks.find(l => l.from === from && l.to === to);
    }

    addLink(links) {
        this.links.push(links);
    }

    addVisibleLinks(key, n=0) {
        //console.log("n: "+n+ " Key:"+key+" Possible Links to Add:");
        //console.log(this.links.filter(l => l.from === key));
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

    removeVisibleLinks(key, n=0) {
        //console.log(this.visibleLinks);
        //console.log("n: "+n+" Key:"+key+" Possible Links to Remove:");
        //console.log(this.visibleLinks.filter(l => l.from === key));
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

    hasDestination(key) {
        return (this.links.filter(l => l.from === key && l.type === "destination").length > 0);
    }

    hasUtilities(key) {
        return (this.links.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    hasChildren(key) {
        return (this.links.filter(l => l.from === key && l.type === "utility").length > 0);
    }

    hasVisibleChildren(key) {
        return (this.visibleLinks.filter(l => l.from === key && l.type === "utility").length > 0);
    }

}

export const linkService = new LinkService();
