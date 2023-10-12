const { GTFS_SVR } = require("../../config.json")
export default {
    async octranspo(file) {
        console.log("HELPER (GTFS-STATIC): Fetching file: " + file)
        try {
            // Fetch the File file from the URL
            const response = await fetch(GTFS_SVR + file);
            const txt = await response.text()
            return txt.split("\n")
        } catch (error) {
            console.error(error);
            return "ERROR"
        }
    },
}