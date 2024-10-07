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

    convertVideoSize(inputFilePath, outputFilePath).then(()=>{
        console.log('Processing finished successfully')
        return res.status(200).send(`Processing finished successfully`)
    }).catch((err)=>{
        console.log('Server error')
        return res.status(500).send(`Server error: ${err}`);    
    })


    console.log('finsihed converting vids')

    // try{
    //     await convertVideoSize(inputFilePath, outputFilePath)
    // } catch{

    // }
    // console.log(boolRes)
    // return res.status(400).send(`ConvertVideoSize() Invoked with a result of ${boolRes}`)
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
