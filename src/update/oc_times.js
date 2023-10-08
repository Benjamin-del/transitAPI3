import gtfs from "../helper/gtfs-dwldr"

export default {
    async fetch(env) {
        console.log("UPDATE (OC_TIMES): Condensing File to upload to FTP")
        const trips = await gtfs.octranspo("stop_times.txt") // File is automaticly seperated
        const tps = trips.map(x => {
            const dts = x.split(",")
            if (dts[0]) {
            // Modify Collunms
            const tp_id = dts[0].split("-")[0]
            //console.log(tp_id)
            return tp_id + "," + dts[1] + "," + dts[3] + "," +  dts[4]
            
            } else {
                return ""
            }
            
        })
        console.log("UPDATE (OC_TIMES): Condensed File, Uploading to FTP...")
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
                    fileName: "stop_times.txt",
                    path: "/httpdocs/static_gtfs/oct/",
                    body: b64
                }
            ])
            
        })
        console.log("UPDATE (OC_TIMES): Update completed with code: "+  response.status)
        return {res:tps[0], code: 200}
    }
}