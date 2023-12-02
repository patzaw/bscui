"use strict";

////////////////////////////////////////////////////////////////////////////////
/**
 * Create an SVG icon
 *
 * @param {string} icon the name of the icon to create
 * @param {string} title the title of the icon
 * @param {string} fill the background color
 *
 */
function create_svg_icon(icon, title, fill = "#FFFFFF00"){

   // Icon definitions
   var icons = [
      {
         name: "menu",
         svg: `
         <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 
         32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 
         0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 
         17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 
         32 14.3 32 32z"/></svg>
         `,
         viewBox: "0 0 448 512"
      },
      {
         name: "fit",
         svg: `
         <path d="m250 850l-187 0-63 0 0-62 0-188 63 0 0 188 187 0 0 62z 
         m688 0l-188 0 0-62 188 0 0-188 62 0 0 188 0 62-62 0z m-875-938l0 
         188-63 0 0-188 0-62 63 0 187 0 0 62-187 0z m875 188l0-188-188 0 
         0-62 188 0 62 0 0 62 0 188-62 0z m-125 188l-1 0-93-94-156 156 156 
         156 92-93 2 0 0 250-250 0 0-2 93-92-156-156-156 156 94 92 0 2-250 0 
         0-250 0 0 93 93 157-156-157-156-93 94 0 0 0-250 250 0 0 0-94 93 156 
         157 156-157-93-93 0 0 250 0 0 250z" 
         transform="matrix(1 0 0 -1 0 850)"></path>
         `,
         viewBox: "0 0 1000 1000"
      },
      {
         name: "zoom_in",
         svg: `
         <path d="m1 787l0-875 875 0 0 875-875 0z m687-500l-187 0 0-187-125 0 0 
         187-188 0 0 125 188 0 0 187 125 0 0-187 187 0 0-125z" 
         transform="matrix(1 0 0 -1 0 850)"></path>
         `,
         viewBox: "0 0 875 1000"
      },
      {
         name: "zoom_out",
         svg: `
         <path d="m0 788l0-876 875 0 0 876-875 0z m688-500l-500 0 0 125 500 0 
         0-125z" transform="matrix(1 0 0 -1 0 850)"></path>
         `,
         viewBox: "0 0 875 1000"
      },
      {
         name: "code",
         svg: `
         <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 
         39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 
         12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 
         45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 
         0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 
         0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 
         45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 
         256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"></path>
         `,
         viewBox: "0 0 640 512"
      },
      {
         name: "photo",
         svg: `
         <path d="m500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 
         150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 
         15-23 28-40 28h-340c-16 
         0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 
         0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 
         100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 
         112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 
         380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 
         0-19-16-35-35-35z" transform="matrix(1 0 0 -1 0 850)"></path>`,
         viewBox: "0 0 1000 1000"
      },
      {
         name: "scale",
         svg: `
         <path d="M344 0H488c13.3 0 24 10.7 24 24V168c0 9.7-5.8 18.5-14.8 
         22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 
         0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 
         41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512H24c-13.3 
         0-24-10.7-24-24V344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 
         87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 
         39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z"></path>`,
         viewBox: "0 0 512 512"
      },
      {
         name: "close",
         svg: `
         <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 
         175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 
         24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 
         9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 
         0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"></path>`,
         viewBox: "0 0 512 512"
      },
      {
         name: "select_all",
         svg: `
         <path d="M342.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160
         178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80
         80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8
         0-45.3s-32.8-12.5-45.3 0L160 402.7 54.6 297.4c-12.5-12.5-32.8-12.5-45.3
         0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z">
         </path>`,
         viewBox: "0 0 448 512"
      },
      {
         name: "invert_sel",
         svg:`
         <path d="M 0 0 L 300 0 L 300 300 L 220.71 220.71 A 100 100 0 0 0 79.29
         79.29 Z M 79.29 79.29 L 220.71 220.71 A 100 100 0 0 1 79.29 79.29 Z">
         </path>
         `,
         viewBox: "0 0 300 300"
      }
   ]

   // Get the icon
   var i = 0;
   for(i = 0; i < icons.length; i++){
      if(icons[i].name === icon){
         break;
      }
   }

   // Create svg
   var toRet = create_svg_element('svg');
   toRet.innerHTML = `
   <g><title>${title}</title>
   <rect width="100%" height="100%" style="fill:${fill};"></rect>
   ${icons[i].svg}
   </g>
   `;
   toRet.setAttribute("viewBox", icons[i].viewBox);

   return(toRet);
};
