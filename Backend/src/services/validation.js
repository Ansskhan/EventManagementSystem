function isValidHttpUrl(value) {
    if (!value) return true;
    try {
        const url = new URL(String(value).trim());
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

module.exports = { isValidHttpUrl };
