const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure Cloudinary  
cloudinary.config({ 
  cloud_name: 'dxcqsozk6', 
  api_key: '536324714396899', 
  api_secret: '2mkdXGiSQ5VqLc0i4e3XRxOqKmM' 
});

async function main(){
  // cloudinary.uploader.upload()
}

module.exports = cloudinary;