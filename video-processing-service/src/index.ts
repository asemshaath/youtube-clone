import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { convertVideoSize } from './stotage';

const app = express();
// const port = 3000;
app.use(express.json())

//req: express.Request, res: express.Response
app.post('/process-video', async (req: any, res: any) => {

    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath){
        console.log('files dne')
        return res.status(400).send('Bad Request: Path is missing');
    }

    console.log('started converting vids')

    await convertVideoSize(inputFilePath, outputFilePath).then(()=>{
        console.log('Processing finished successfully')
        return res.status(200).send(`Processing finished successfully`)
    }).catch((err)=>{
        console.log('Server error')
        return res.status(500).send(`Server error: ${err}`);    
    })


    console.log('finsihed converting vids')

});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
