import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "path";
import { rejects } from "assert";
import path from "path";

/**
 * 
 * 
A user uploads a video to Google Cloud Storage

The video processing service will be notified of the upload via Cloud Pub/Sub
The video processing service will download the video from Google Cloud Storage (DONE)
The video processing service will process the video (DONE)
The video processing service will upload the processed video to Google Cloud Storage (DONE)

user -> gcs -> local server -> process -> local server -> gcs 




DONE
 */

const storage = new Storage();

const rawVideoLocalPath = path.join(process.cwd(), "raw-videos");
const processedVideoLocalPath = path.join(process.cwd(), "processed-videos");

const rawVideoBucket = 'asem-raw-yt-vids';
const processedVideoBucket = 'asem-processed-yt-vids'

export function convertVideoSize(rawVideoName: string, processedVideoName: string){
    return new Promise<void>((resolve, reject)=>{
        ffmpeg(`${rawVideoLocalPath}/${rawVideoName}`)    
        .outputOptions('-vf', 'scale=-1:360') // 360p
        .on('end', ()=>{
            console.log('Processing finished successfully');
            resolve();
        })
        .on('error', (err: Error)=>{
            console.log(`Error occured: ${err}`)
            reject(err);
        })
        .save(`${processedVideoLocalPath}/${processedVideoName}`)   
    })
}

export async function downloadFromGCS(fileName: string) {
    const options = {
        destination: `${rawVideoLocalPath}/${fileName}`,
    };
    console.debug(`DEBUG: Downloading gs://${rawVideoBucket}/${fileName} to ${options.destination} .......`);
    
    // Downloads the file
    await storage.bucket(rawVideoBucket).file(fileName).download(options);

    console.log(`gs://${rawVideoBucket}/${fileName} downloaded to ${options.destination}`);
}


export async function uploadProcessedVideoToGCS(processedVideoPath: string){
    const bucket = storage.bucket(processedVideoBucket);

    await storage.bucket(processedVideoBucket).upload(`${processedVideoLocalPath}/${processedVideoPath}`, {
            destination: processedVideoPath});

    console.log(`${processedVideoLocalPath}/${processedVideoPath} uploaded to gs://${processedVideoBucket}/${processedVideoPath}.`);
        
    bucket.file(processedVideoPath).makePublic();
}

export function setupDirectory(){
    ensureDirectoryExistance(rawVideoLocalPath);
    ensureDirectoryExistance(processedVideoLocalPath);
}

function ensureDirectoryExistance(path: string) {
    if(!fs.existsSync(path)){
        fs.mkdirSync(path, {recursive: true});
        console.log(`Directory created at ${path}`);
    }
}

// delete files from the file system

function deleteFile(filePath: string){
    return new Promise<void>((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                reject();
            } else {
                console.log('File deleted successfully.');
                resolve();
            }
        });
    })
}

export function deleteRawVideo(filePath: string){
    return deleteFile(filePath);
}

export function deleteProcessedVideo(filePath: string){
    return deleteFile(filePath);
}

