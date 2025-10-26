import express from 'express';
import { 
    convertVideoSize, 
    setupDirectory, 
    downloadFromGCS, 
    uploadProcessedVideoToGCS,
    deleteRawVideo,
    deleteProcessedVideo
} from './stotage';

setupDirectory();

const app = express();
app.use(express.json())

app.post('/process-video', async (req: any, res: any) => {

    console.debug('DEBUG: Received request to process video');
    console.debug(`DEBUG: Request body: ${JSON.stringify(req.body)}`);
    
    if (!req.body) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }

    if (!req.body.message) {
        const msg = 'invalid Pub/Sub message format';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
    }

    // const pubSubMessage = req.body.message;
    const pubSubMessage = Buffer.from(req.body.message.data, 'base64').toString()
    console.debug(`DEBUG: Pub/Sub message data: ${pubSubMessage}`);   
    let data = JSON.parse(pubSubMessage)

    try {
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }    
    } catch(error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');    
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    await downloadFromGCS(inputFileName).catch((err)=>{
        console.log('Server error during download')
        console.log(err)
        return res.status(500).send(`Server error during download: ${err}`);
    });

    await convertVideoSize(inputFileName, outputFileName).then(()=>{
        console.log('Processing finished successfully')
        return res.status(200).send(`Processing finished successfully`)
    }).catch(async (err)=>{
        console.log('Server error')
        console.log(err)
        console.log('DEBUG: Deleting local files due to error')


        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        
        return res.status(500).send(`Server error: ${err}`);    
    });   

    await uploadProcessedVideoToGCS(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send();
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
