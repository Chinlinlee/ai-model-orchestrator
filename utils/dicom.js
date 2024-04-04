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

function generateUid() {
    let uid = "2.25." + Math.floor(1 + Math.random() * 9);
    for (let index = 0; index < 38; index++) {
        uid = uid + Math.floor(Math.random() * 10);
    }
    return uid;
}

function getFormattedDateTimeNow() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}.${milliseconds}`;
}

module.exports.storeInstance = storeInstance;
module.exports.generateUid = generateUid;
module.exports.getFormattedDateTimeNow = getFormattedDateTimeNow;