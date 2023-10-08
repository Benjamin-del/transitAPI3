import gtfs from "../helper/gtfs-dwldr"

export default {
    async fetch(env) {
        console.log("UPDATE (OC_TRIPS): Condensing File...")
        const trips = await gtfs.octranspo("trips.txt") // File is automaticly seperated
        const tps = trips.map(x => {
            const dts = x.split(",")
            if (dts[0]) {
            // Modify Collunms
            const rt_id = dts[0].split("-")[0]
            const tp_id = dts[2].split("-")[0]
            
            return rt_id + "," + dts[1] + "," + tp_id + "," + dts[4] + "," + dts[6]
            
            } else {
                return ""
            }
            
        })
        console.log("UPDATE (OC_TRIPS): Condensed File")
        console.log("UPDATE (OC_TRIPS): Uploading to FTP...")
        const b64 = btoa(tps.join("\n"))
        //console.log(b64)
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
                    fileName: "trips.txt",
                    path: "/httpdocs/static_gtfs/oct/",
                    body: b64
                }
            ])
            
        })
        console.log("UPDATE (OC_TRIPS): Uploaded to FTP") 
        console.log("UPDATE (OC_TRIPS): Update Complete with code: "+  response.status)

        return {res:{error: false}, code: 200}
    }
}