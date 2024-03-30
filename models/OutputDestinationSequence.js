const { StorageMacro } = require("./StorageMacro");

class OutputDestinationSequence {
    /** @type { import("../types/dicom").GeneralDicomJsonItem } */
    #dicomJsonItem;
    constructor(dicomJson) {
        this.#dicomJsonItem = dicomJson;
    }

    getStorageMacro() {
        return new StorageMacro(this.#dicomJsonItem?.Value?.[0])
    }
}

module.exports.OutputDestinationSequence = OutputDestinationSequence;