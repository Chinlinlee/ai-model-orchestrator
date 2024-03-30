export type VR = "AE" |
                 "AS" |
                 "AT" |
                 "CS" |
                 "DA" |
                 "DS" |
                 "DT" |
                 "FL" |
                 "FD" |
                 "IS" |
                 "LO" |
                 "LT" |
                 "OB" |
                 "OD" |
                 "OF" |
                 "OW" |
                 "PN" |
                 "SH" |
                 "SL" |
                 "SQ" |
                 "SS" |
                 "ST" |
                 "TM" |
                 "UI" |
                 "UL" |
                 "UN" |
                 "US" |
                 "UT";

export type GeneralDicomJsonItem = {
    vr: VR;
    Value: string[] | number[]
}
export type GeneralDicomJson = {
    [key: string]: GeneralDicomJsonItem
};

export type DicomUid = {
    studyInstanceUid: string;
    seriesInstanceUid?: string;
    instanceUid?: string;
}