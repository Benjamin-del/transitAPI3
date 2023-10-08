import JSZip from 'jszip';
export default {
    async fetch(env,file) {
        console.log("UPDATE (STATIC): Fetching ZIP file")
        const zipFileResponse = await fetch("https://www.octranspo.com/files/google_transit.zip");

        // Check if the fetch was successful
        if (!zipFileResponse.ok) {
            console.log("Failed to fetch ZIP file")
            return "ERROR-001"
        }

        // Read the ZIP file as a Uint8Array
        const zipFileData = await zipFileResponse.arrayBuffer();

        // Create a new ZIP archive object
        const zip = new JSZip();

        // Load the ZIP data
        await zip.loadAsync(zipFileData);
        console.log("UPDATE (STATIC): ZIP file loaded")
        console.log("UPDATE (STATIC): Uploading file: " + file)
        const response = await fetch("https://www.ftp-api.com/ftp/upload", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json', 
                'username': env.FTP_USER, 
                'password': env.FTP_PASS, 
                'port': env.FTP_PORT, 
                'ftp-host': env.FTP_HOST, 
                'ftp-type': 'FTP'
            },
            body: JSON.stringify([
                {
                    fileName: file,
                    path: "/httpdocs/static_gtfs/oct/",
                    body: btoa(await zip.file(file).async('text'))
                }
            ])
         
        })
        console.log("UPDATE (STATIC): File uploaded with code: " + response.status)
        return {
            res: response,
            code: 200
        }
    }
}