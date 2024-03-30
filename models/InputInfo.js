const { ReferencedSopSequence } = require("./ReferencedSOPSequence");
const { WadoRsRetrievalSequence } = require("./WadoRsRetrievalSequence");

class InputInfo {

    #dicomJson;
    constructor(dicomJson) {
        this.#dicomJson = dicomJson;
        this.referencedSopSequence = new ReferencedSopSequence(this.#dicomJson["00081199"]);
        this.wadoRsRetrievalSequence = new WadoRsRetrievalSequence(this.#dicomJson["0040E025"]);
    }

    getStudyInstanceUid() {
        return this.#dicomJson?.["0020000D"]?.Value?.[0];
    }

    getSeriesInstanceUid() {
        return this.#dicomJson?.["0020000E"]?.Value?.[0];
    }

    getInstanceUid() {
        return this.referencedSopSequence.getReferencedSopInstanceUid();
    }
}

module.exports.InputInfo = InputInfo;