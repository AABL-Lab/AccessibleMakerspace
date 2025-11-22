import React, { useEffect, useState } from 'react';

export default function PhotoSlider(prop){
  const [currentImage, setCurrentImage] = useState(prop.images && prop.images.length > 0 ? prop.images[0] : {url: '', alt: ''});
  
  useEffect(() => { 
    if (prop.images && prop.images.length > 0) {
        setCurrentImage(prop.images[0]);
    }
  },[prop.images]);

  const handleImageClick = (image) => {
    setCurrentImage(image);
  };
  
  if (!prop.images || prop.images.length === 0) {
      return null; 
  }

  return(
    <div>
      <div className="coverImage">
        <div className='photo'>
          <img 
            src={currentImage.url} 
            alt={currentImage.alt || "Project Main Image"} 
          />
        </div>
      </div>
      
      <div className="miniImages">
        {prop.images.map((image, index) => (
            <img 
                key={index} 
                src={image.url} 
                alt={image.alt || `Project Thumbnail ${index + 1}`} 
                onClick={() => handleImageClick(image)} 
                style={{ cursor: 'pointer' }}
            />
        ))}   
      </div>
    </div>
  )
}