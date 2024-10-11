import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { convertVideoSize, setupDirectory} from './stotage';

setupDirectory();

const app = express();
// const port = 3000;
app.use(express.json())

//req: express.Request, res: express.Response
app.post('/process-video', async (req: any, res: any) => {

    // const inputFilePath = req.body.inputFilePath;
    // const outputFilePath = req.body.outputFilePath;

    // if (!inputFilePath || !outputFilePath){
    //     console.log('files dne')
    //     return res.status(400).send('Bad Request: Path is missing');
    // }

    // console.log('started converting vids')

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
    let data = JSON.parse(pubSubMessage)

    try {
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }    
    } catch(error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');    
    }
  
    res.status(200).send();
    

    // we need this:
    // await convertVideoSize(inputFilePath, outputFilePath).then(()=>{
    //     console.log('Processing finished successfully')
    //     return res.status(200).send(`Processing finished successfully`)
    // }).catch((err)=>{
    //     console.log('Server error')
    //     return res.status(500).send(`Server error: ${err}`);    
    // })

});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
