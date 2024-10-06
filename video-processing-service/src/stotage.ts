import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";

/**
 * 
 * 
A user uploads a video to Google Cloud Storage

The video processing service will be notified of the upload via Cloud Pub/Sub
The video processing service will download the video from Google Cloud Storage
The video processing service will process the video
The video processing service will upload the processed video to Google Cloud Storage

user -> gcs -> local server -> process -> local server -> gcs 
 */

const storage = new Storage();

const rawVideoLocalPath = './raw-videos';
const processedVideoLocalPath = './processed-videos';

const rawVideoBucket = 'my-yt-clone-raw';
const processedVideoBucket = 'my-yt-clone-processed'

export function convertVideoSize(rawVideoName: string, processedVideoName: string){

    ffmpeg(rawVideoName)    
    .outputOptions('-vf', 'scale=-1:360') // 360p
    .on('end', ()=>{
        console.log('Processing finished successfully');
        return true;
    })
    .on('error', (err: any)=>{
        console.log(`Error occured: ${err}`)
        return false;
    })
    .save(processedVideoName)

}