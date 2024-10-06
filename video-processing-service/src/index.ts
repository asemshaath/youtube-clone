import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { convertVideoSize } from './stotage';

const app = express();
// const port = 3000;
app.use(express.json())

//req: express.Request, res: express.Response
app.post('/process-video', (req: any, res: any) => {

    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath){
        console.log('files dne')
        return res.sendStatus(400).send('Bad Request: Path is missing');
    }

    const boolRes = convertVideoSize(inputFilePath, outputFilePath)
    console.log(boolRes)
    return res.sendStatus(200).send(`ConvertVideoSize() Invoked with a result of ${boolRes}`)
    // ffmpeg(inputFilePath)    
    //     .outputOptions('-vf', 'scale=-1:360') // 360p
    //     .on('end', ()=>{
    //         console.log('Processing finished successfully');
    //         return res.status(200).send('Processing finished successfully');    
    //     })
    //     .on('error', (err: any)=>{
    //         console.log(`Error occured: ${err}`)
    //         return res.status(500).send('Server error');    
    //     })
    //     .save(outputFilePath)

});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
