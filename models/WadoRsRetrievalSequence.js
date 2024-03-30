const { RetrieveUri } = require("./RetrieveUri");

class WadoRsRetrievalSequence {
    #dicomJson;
    #retrieveUris;
    constructor(dicomJson) {
        if (!dicomJson?.Value?.[0]?.["00081190"]) {
            throw new Error("Invalid wado rs retrieval sequence");
        }

        this.#dicomJson = dicomJson;
        this.#retrieveUris = [];
        this.#initRetrieveUris();
    }
    
    get retrieveUris() {
        return this.#retrieveUris.map(element => element.getRetrieveUri());
    }

    #initRetrieveUris() {
        this.#dicomJson.Value.forEach(element => {
            this.#retrieveUris.push(new RetrieveUri(element["00081190"]));
        })
    }
}

module.exports.WadoRsRetrievalSequence = WadoRsRetrievalSequence;