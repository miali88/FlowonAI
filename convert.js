// convert-svg-to-png.js
const fs = require('fs');
const svg2img = require('svg2img');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 250 75">
  <path class="cls-3" fill="rgb(250, 250, 0)" d="M0,0h26.37l23.35,29.76c3.61,4.6,10.11,2.54,10.11-2.9V0h23.36v75h-26.37l-23.35-29.76c-3.61-4.6-10.11-2.54-10.11,2.9v26.85H0V0Z"/>
  <path xmlns="http://www.w3.org/2000/svg" class="cls-3" fill="rgb(250, 250, 0)" d="M95.19,75V0h76.81v18.63h-48.17c-1.59,0-2.88,1.3-2.88,2.89v31.95c0,1.6,1.29,2.89,2.88,2.89h23.59c.87,0,1.7-.38,2.24-1.07,3.11-4,.6-8.61-3.42-8.61h-17.46v-16.33h43.1v44.64h-76.69Z"/>
</svg>
`;

svg2img(svg, function(error, buffer) {
  if (error) {
    console.error('Error converting SVG to PNG:', error);
    return;
  }
  fs.writeFileSync('ng.png', buffer);
  console.log('PNG file created: ng.png');
});