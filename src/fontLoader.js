// Import font files as modules to get the correct hashed URLs
import razedBoldUrl from './assets/razed_bold.ttf?url';
import razedLightUrl from './assets/razed_light.ttf?url';
import razedTrendUrl from './assets/razed_trend.ttf?url';

// Function to create and inject font-face declarations
export function loadFonts() {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Razed';
      src: url('${razedBoldUrl}') format('truetype');
      font-weight: bold;
      font-style: normal;
    }

    @font-face {
      font-family: 'Razed';
      src: url('${razedLightUrl}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Razed';
      src: url('${razedTrendUrl}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
  
  document.head.appendChild(style);
}

// Auto-load fonts when module is imported
loadFonts(); 