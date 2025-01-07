// convert-svg-to-png.js
const fs = require('fs');
const svg2img = require('svg2img');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
  <style>
    .text { font-family: 'Suisse', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; fill: yellow; }
  </style>
  <text x="50" y="150" class="text" font-size="150">NG</text>
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