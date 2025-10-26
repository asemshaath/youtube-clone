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
    const full_path = path.join(rawVideoLocalPath, rawVideoName);
    const output_path = path.join(processedVideoLocalPath, processedVideoName);
    
    console.log(`Starting processing video ${full_path} to ${output_path} .......`);

    return new Promise<void>((resolve, reject)=>{
        ffmpeg(full_path)    
        .outputOptions('-vf', 'scale=-1:360') // 360p
        .on('end', ()=>{
            console.log('Processing finished successfully');
            resolve();
        })
        .on('error', (err: Error)=>{
            console.log(`Error occured: ${err}`)
            reject(err);
        })
        .save(output_path);   
    })
}

export async function downloadFromGCS(fileName: string) {
    const fullLocalPath = path.join(rawVideoLocalPath, fileName);
    const options = {
        destination: fullLocalPath,
    };
    console.debug(`DEBUG: Downloading gs://${rawVideoBucket}/${fileName} to ${fullLocalPath} .......`);
    
    // Downloads the file
    await storage.bucket(rawVideoBucket).file(fileName).download(options);
    await listFilesInBucket(rawVideoBucket);
    listFilesInDir(rawVideoLocalPath);

    console.debug("DEBUG 2 typeof options:", typeof options, "keys:", Object.keys(options));

    console.log(`gs://${rawVideoBucket}/${fileName} downloaded to ${fullLocalPath}`);
}


export async function uploadProcessedVideoToGCS(processedVideoName: string){
    const full_path = path.join(processedVideoLocalPath, processedVideoName);
    
    const bucket = storage.bucket(processedVideoBucket);

    await storage.bucket(processedVideoBucket).upload(full_path, {destination: processedVideoName});

    console.log(`${full_path} uploaded to gs://${processedVideoBucket}/${processedVideoName}.`);
        
    bucket.file(processedVideoName).makePublic();
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

export function deleteRawVideo(rawVideoName: string){
    const filePath = path.join(rawVideoLocalPath, rawVideoName);
    return deleteFile(filePath);
}

export function deleteProcessedVideo(processedVideoName: string){
    const filePath = path.join(processedVideoLocalPath, processedVideoName);
    return deleteFile(filePath);
}



export async function listFilesInBucket(bucketName: string){
    return storage.bucket(bucketName).getFiles().then((data)=>{
        const files = data[0];
        console.log(`Files in bucket ${bucketName}:`);
        files.forEach(file => {
            console.log(file.name);
        });
    }).catch((err)=>{
        console.error('Error listing files:', err);
    });
}

export function listFilesInDir(dirPath: string){
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        console.log(`Files in directory ${dirPath}:`);
        files.forEach(file => {
            console.log(file);
        });
    });
}