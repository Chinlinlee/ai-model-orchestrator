class RetrieveUri {
    #dicomJson;
    constructor(dicomJson) {
        this.#dicomJson = dicomJson;
        if (!this.#dicomJson?.Value?.[0]) {
            throw new Error("Invalid retrieve uri");
        }
    }

    getRetrieveUri() {
        return this.#dicomJson.Value?.[0];
    }
}

module.exports.RetrieveUri = RetrieveUri;