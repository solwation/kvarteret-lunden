// Renders the home-screen icons in icons/ from the favicon's design (icon.svg). Run: node tools/icons.mjs
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
const svg=await readFile('icon.svg','utf8');
// Full bleed for iOS and maskable icons: the platform rounds the corners; the L stays inside the 80 % safe zone.
const square=svg.replace(/ rx="[^"]*"/,'');
const icons=[['icons/icon-192.png',192,svg],['icons/icon-512.png',512,svg],['icons/icon-maskable-512.png',512,square],['icons/apple-touch-icon.png',180,square]];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH});
try{
  const page=await browser.newPage({deviceScaleFactor:1});
  for(const [path,size,source] of icons){
    await page.setViewportSize({width:size,height:size});
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`);
    await page.screenshot({path,omitBackground:true,clip:{x:0,y:0,width:size,height:size}});
  }
}finally{await browser.close();}
console.log('Icons rendered in icons/.');
