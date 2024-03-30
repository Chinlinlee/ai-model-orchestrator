class ReferencedSopSequence {
    #dicomJson;
    constructor(dicomJson) {
        this.#dicomJson = dicomJson;
    }

    getReferencedSopInstanceUid() {
        return this.#dicomJson?.Value?.[0]?.["00081155"].Value?.[0];
    }

    getReferencedSopClassUid() {
        return this.#dicomJson?.Value?.[0]?.["00081199"].Value?.[0];
    }
}

module.exports.ReferencedSopSequence = ReferencedSopSequence