const { request } = require("undici");
const FormData = require("form-data");

/**
 * 
 * @param {ArrayBuffer} buffer 
 * @param {string} stowUrl 
 */
async function storeInstance(buffer, stowUrl) {
    const form = new FormData();
    form.append("file", Buffer.from(buffer));

    let uploadRes = await request(stowUrl, {
        method: "POST",
        headers: {
            "content-type": `multipart/related; type="application/dicom"; boundary=${form.getBoundary()}`
        },
        body: form
    });

    let uploadResult = await uploadRes.body.json();
    if (uploadResult["00081198"].Value.length > 0) {
        throw new Error("Failed to store instance");
    }

    return true;
}

module.exports.storeInstance = storeInstance;