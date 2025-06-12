import React, { useEffect, useState } from 'react';

export default function PhotoSlider(prop){
  //once the images are recieved on the single projects page, store the first image
  let initPhoto = prop.images[0];
  const [imageUrl, setImageUrl] = useState(prop.images[0]);
  
  //set that first image as the first big picture in slider
  useEffect(() => { 
    setImageUrl(initPhoto);
  },[initPhoto]);

  //as you click on the image thats not highlighed (i.e. biggeest one), highlight that image
  const handleImageClick = (url) => {
    setImageUrl(url);
  };
  
  return(
    <div>
      <div className="coverImage">
        <div className='photo'>
          {/* TODO: set ALT as the associated image description */}
          <img src={imageUrl} alt="Displayed Image" />
        </div>
      </div>
      
      <div className="miniImages">
        {prop.images.map((url, index) => (
        <img key={index} src={url} alt={`Image ${index}`} onClick={() => handleImageClick(url)} />
        ))}   
      </div>
    </div>
  )}