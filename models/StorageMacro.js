class StorageMacro {
    /** @type { import("../types/dicom").GeneralDicomJsonItem } */
    #dicomJsonItem;
    constructor(dicomJson) {
        this.#dicomJsonItem = dicomJson;
    }

    getStowRsUrl() {
        return this.#dicomJsonItem?.["00404072"]?.Value?.[0]?.["00404073"].Value?.[0];
    }
}

module.exports.StorageMacro = StorageMacro;