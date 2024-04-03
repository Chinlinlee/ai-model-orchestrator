import type { DataSet } from "dicom-parser";

export type AiResult = {
    data: ArrayBuffer,
    dataset: DataSet
}