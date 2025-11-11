"use client"
import { useState, useEffect } from "react"
import { Globe } from "lucide-react"

const GoogleTranslate = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement("script")
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.head.appendChild(script)

    // Initialize Google Translate
    ;(window as any).googleTranslateElementInit = () => {
      ;new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "af,sq,am,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,ny,zh,co,hr,cs,da,nl,en,eo,et,tl,fi,fr,fy,gl,ka,de,el,gu,ht,ha,haw,he,hi,hmn,hu,is,ig,id,ga,it,ja,jw,kn,kk,km,rw,ko,ku,ky,lo,la,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,or,ps,fa,pl,pt,pa,ro,ru,sm,gd,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tg,ta,tt,te,th,tr,tk,uk,ur,ug,uz,vi,cy,xh,yi,yo,zu",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true,
        },
        "google_translate_element",
      )
      
      // Small delay to ensure the widget is fully rendered
      setTimeout(() => {
        setIsLoaded(true)
      }, 500)
    }

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const handleTranslateClick = () => {
    if (!isLoaded) return;
    
    // Try multiple selectors to find the Google Translate button
    const selectors = [
      '.goog-te-gadget-simple .goog-te-menu-value',
      '.goog-te-gadget-simple',
      '#google_translate_element .goog-te-gadget-simple',
      '#google_translate_element .goog-te-menu-value'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.click();
        break;
      }
    }
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-1 px-2 py-1.5 h-8 rounded-lg cursor-pointer border border-orange-300 text-orange-600 text-xs font-medium shadow-sm transition-all duration-300 hover:bg-orange-50 hover:border-orange-400 hover:shadow-md bg-transparent"
        onClick={handleTranslateClick}
        disabled={!isLoaded}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Translate</span>
      </button>
      
      {/* Hidden Google Translate Element - positioned for interaction */}
      <div id="google_translate_element" className="absolute top-0 left-0 opacity-0 pointer-events-none w-0 h-0"></div>
      
      <style jsx global>{`
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 0 !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          z-index: -1 !important;
        }
        .goog-te-gadget-simple {
          background: transparent !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 0 !important;
          font-size: 0 !important;
          color: transparent !important;
          width: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          display: none !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value {
          display: none !important;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-te-menu-frame {
          max-height: 400px !important;
          overflow-y: auto !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid rgba(249, 115, 22, 0.2) !important;
        }
        .goog-te-menu2 {
          border-radius: 12px !important;
          overflow: hidden !important;
          background: white !important;
        }
        .goog-te-menu2-item {
          padding: 12px 20px !important;
          font-size: 14px !important;
          transition: background-color 0.2s ease !important;
        }
        .goog-te-menu2-item:hover {
          background-color: #fff7ed !important;
        }
      `}</style>
    </div>
  )
}

export default GoogleTranslate