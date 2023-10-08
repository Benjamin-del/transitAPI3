# BENJA TRANSIT API3

This API combines GTFS Files for OCtranspo that are needed for the working of the Benja Transit App.

This app only supports the OC TRANSPO API (Found at: https://www.octranspo.com/en/plan-your-trip/travel-tools/developers)

Tools Used
- FTP (Only for upload)
- OC Transpo API
- TurfJS (turf/helper)

## API
The following methods are available for use:
 - `GET /oct/allstops` - Returns all stops in the OC Transpo GTFS File (@ FTP SERVER)
 - `GET /oct/realtime` - Data from OC Transpo's Realtime API, Provided in JSON format
 - `GET oct/shape` - Using data from the GTFS File, this returns the shape of the route (WITHOUT TRIP ID, See below for full documentation)
 - `GET oct/schedule` - A Static Schedule for a specific Stop ID
 - `GET oct/config` - Theme Information for the OC Transpo API
 - `GET oct/shapebyid` - Get the shape of the route using the shape ID

### OCT/SHAPE

The OC Transpo API dosen't provide information about what trip... This makes it hard to figure out what shape it is currently running. Since routes have different brances (Stitsville / Tunneys Pasture) The shape is different. Using the following paramaters the server is able to figure out what shape it is running. There may be multiple that match the query so it returns as an array.

| Paramater     | Description              | Example           |
| ------------- | -------------------------| ----------------- |
| `route`       | The Route Number         | `61`              | 
| `direction`   | The Direction            | `0`               | 
| `startTime`   | The Start Time (HH:MM)   | `15:03`           |
| All above values are required                                |


## FTP
I have a FTP server that has all of the files updated every month (CRON JOB). 
The project liscense does not cover files uploaded to the FTP server.  If you want to use the FTP server, please open a new issue on github. 

### Remove FTP
You are able to delete all of the FTP update file (located at `/update`). If you do that you will also have to remove lines `40-52` in `src/index.js`. You should also remove all files that have a `../helper/gtfs-static` import. You can change that to be `../helper/gtfs-dwldr` so that your app will always download a fresh copy of the GTFS files on each file (!!!). This can slow down the server. 

## Installation
This is designed to run on a cloudflare worker. It could be ported over to a express server but that is not supported.

1. Fork the project and create a `.dev.vars` file in the root directory. I would sugest using wrangler. It should look like this:


    ```
    #FTP
    FTP_PASS="yourpassword"
    FTP_HOST="yourhost"
    FTP_PORT=21
    FTP_USER="yourname"

    # OCTRANSPO API
    OCTRANSPO_API_KEY="0000111122223333444"
    OCTRANSPO_APP_ID="1234566"
    ```
    (Fill in the values)
2. Install Coudlflare Wrangler. You can find the instructions here: https://developers.cloudflare.com/workers/cli-wrangler/install-update

3. Configure your server where you get the GTFS files from. The configuration is found at `src/helper/gtfs-static.js`, line `6`. The current server will not work.

4. run `npm run start` to test the server locally. The server will usually run at `http://localhost:8787`.

5. run `npm run deploy` to deploy the server to cloudflare. The server is ready at  `https://yourpoject.yourname.workers.dev`.

## Contributing
If you want to contribute to this project, please open a new issue on github.
