class DicomEventReport {
    /** @type { import("../types/dicom").GeneralDicomJson } */
    #dicomJson;
    constructor(generalDicomJson) {
        this.#dicomJson = generalDicomJson;
    }

    getAffectedSopInstanceUid() {
        return this.#dicomJson?.["00001000"]?.Value?.[0];
    }

    getEventType() {
        return this.#dicomJson?.["00001002"]?.Value?.[0];
    }
}

module.exports.DicomEventReport = DicomEventReport;