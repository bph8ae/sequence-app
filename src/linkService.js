import { blockService } from "./blockService";

//Link Data Functionality
class LinkService {

    constructor() {
        this.links = [
            {from:1, to:2, type:"utility", isBackbone:false},
            {from:1, to:3, type:"destination", isBackbone:true},
            {from:3, to:4, type:"utility", isBackbone:false},
            {from:3, to:5, type:"utility", isBackbone:false},
            {from:2, to:6, type:"utility", isBackbone:false},
            {from:4, to:7, type:"utility", isBackbone:false},
            {from:5, to:8, type:"destination", isBackbone:false},
            {from:5, to:9, type:"utility", isBackbone:false},
            {from:9, to:10, type:"destination", isBackbone:false}
        ];
        this.visibleLinks = this.links.filter(l =>l.isBackbone);
    }

    getLinks() {
        return this.links;
    }

    getLink(from, to) {
        return this.links.find(l => l.from === from && l.to === to);
    }

    getVisibleLinks() {
        console.log("Visible Links:");
        console.log(this.visibleLinks);
        return this.visibleLinks;
    }

    getVisibleLink(from, to) {
        return this.visibleLinks.find(l => l.from === from && l.to === to);
    }

    addLink(links) {
        this.links.push(...links);
    }

    addVisibleLinks(key, n=0) {
        //console.log("n: "+n+ " Key:"+key+" Possible Links to Add:");
        //console.log(this.links.filter(l => l.from === key));
        if (n > 0) {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "destination"
            ).forEach(l => {
                //console.log("ForEach Loop Link:");
                //console.log(l);
                this.addVisibleLinks(l.to,n=1)
            });
            this.visibleLinks.push(...this.links.filter(l => l.from === key && l.type === "destination"));
        } 
        else {
            const linksToAdd = this.links.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                //console.log("ForEach Loop Link:");
                //console.log(l);
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
                //console.log("ForEach Loop Link:");
                //console.log(l);
                this.removeVisibleLinks(l.to, n=1)
            });
            this.visibleLinks = this.visibleLinks.filter(l => l.from !== key);
        } 
        else {
            this.visibleLinks.filter(l =>
                l.from === key && l.type === "utility"
            ).forEach(l => {
                //console.log("ForEach Loop Link:");
                //console.log(l);
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