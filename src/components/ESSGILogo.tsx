import React, { useState, useEffect } from "react"; 
import fallbackLogo from "../assets/images/essgi-logo.png"; 
 
interface ESSGILogoProps { 
  className?: string; 
} 
 
export const ESSGILogo: React.FC<ESSGILogoProps> = ({ className = "h-64 w-auto" }) => { 
  const [logoSrc, setLogoSrc] = useState<string>(fallbackLogo); 
 
  useEffect(() => { 
    // Attempt to load user's custom uploaded authentic logo from the assets folder. 
    // This allows the preview to immediately pick up the uploaded image once drag-and-dropped 
    // as "ssgi_logo.png" or "ssgi_logo.jpg" inside src/assets/images/ without breaking builds. 
    const testPng = new Image(); 
    testPng.src = "/src/assets/images/ssgi_logo.png"; 
    testPng.onload = () => { 
      setLogoSrc("/src/assets/images/ssgi_logo.png"); 
    }; 
    testPng.onerror = () => { 
      const testJpg = new Image(); 
      testJpg.src = "/src/assets/images/ssgi_logo.jpg"; 
      testJpg.onload = () => { 
        setLogoSrc("/src/assets/images/ssgi_logo.jpg"); 
      }; 
    }; 
  }, []); 
 
  return ( 
    <div className={`flex items-center select-none ${className}`}> 
      <img 
        src={logoSrc} 
        alt="Space Science and Geospatial Institute Logo" 
        className="h-full w-auto object-contain max-w-full" 
        referrerPolicy="no-referrer" 
      /> 
    </div> 
  ); 
}; 
