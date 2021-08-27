(()=>{"use strict";const e=(e={},t={payload:Number})=>{if(e){const o=e;o.playbackRate=t.payload,o.dataset.CustomPlaybackRate=e.playbackRate}},t=(e={},t={payload:Number})=>{if(e){const o=document.querySelector("[data--custom-playback-rate]")||document.querySelector("video");o.playbackRate=t.payload,o.dataset.CustomPlaybackRate=e.playbackRate}},o=(e={payload:Number},t={})=>{if(console.log({request:e,videoElement:t}),void 0===e.payload||!t)return!0;const o=t.playbackRate,l=Number(e.payload);if(o!==l){const e=t;return e.playbackRate=l,e.dataset.CustomPlaybackRate=t.playbackRate,!1}return!0},l={verticalPosition:null,fontSize:null,fontColor:null,fontWeight:null},a=(e=0,t=32,o="currentColor",a="currentColor")=>{console.log("%cnetflix-subtitles-styler : observer is working... ","color: red;"),new MutationObserver((()=>{const n=document.querySelector(".player-timedtext");n&&(null===l.verticalPosition&&(l.verticalPosition=parseFloat(n.style.bottom)),n.style.bottom=`${e}px`,[...n.querySelectorAll(".player-timedtext-text-container")].forEach((e=>{if(e){const n=e;n.style.left="0",n.style.right="0",((e={})=>{const n=e.children;n.length&&[...n].forEach((e=>{const n=e;null===l.fontSize&&(l.fontSize=parseFloat(n.style.fontSize)),null===l.fontColor&&(l.fontColor=((e="")=>{if(!e.includes("rgb("))return e;const t=e.indexOf(",")>-1?",":" ",o=e.substr(4).split(")")[0].split(t);let l=(+o[0]).toString(16),a=(+o[1]).toString(16),n=(+o[2]).toString(16);return 1===l.length&&(l=`0${l}`),1===a.length&&(a=`0${a}`),1===n.length&&(n=`0${n}`),`#${l}${a}${n}`})(n.style.color)),null===l.fontWeight&&(l.fontWeight=n.style.fontWeight),n.style.fontSize=`${t}px`,n.style.fontWeight=a,n.style.color=o}))})(n)}})))})).observe(document.body.querySelector(".VideoContainer"),{subtree:!0,attributes:!1,childList:!0})};chrome.runtime.onMessage.hasListeners()||((()=>{const l=()=>document.querySelector("video"),a=setInterval((()=>{l()&&(console.count("video found"),((l={},a=!1)=>{let n=l.querySelector("video");if(!n)return!1;const s={request:{payload:n.playbackRate}};a?t(n,s.request):e(n,s.request),console.log("adding video listeners..."),chrome.runtime.onMessage.addListener(((l,a,s)=>{if(console.log({request:l,sender:a,sendResponse:s}),"changePlaybackSpeed"===l.message||"getPlayBackSpeedOnPageLoad"===l.message){if("www.netflix.com"===document.location.hostname&&"getPlayBackSpeedOnPageLoad"===l.message){console.count("location and message");const e=setTimeout((()=>{const t=setInterval((()=>{n=document.querySelector("video"),n&&o(l,n)&&clearInterval(t)}),500);clearTimeout(e)}),500)}else if("getPlayBackSpeedOnPageLoad"===l.message){const e=setTimeout((()=>{const t=setInterval((()=>{o(l,n)&&clearInterval(t)}),500);clearTimeout(e)}),500)}return"changePlaybackSpeed"===l.message&&"www.netflix.com"===document.location.hostname?t(n,l):"changePlaybackSpeed"===l.message&&e(n,l),s({message:"success",payload:n.playbackRate}),!0}return!0})),console.log("found video and sending message..."),((e={})=>{chrome.runtime.sendMessage({message:"foundVideo",payload:e.playbackRate},(t=>{const{lastError:o=""}=chrome.runtime;if(o)console.log(o);else if("foundVideoSuccess"===t?.message&&null!==t.payload){const o=e;o.playbackRate=t.payload,o.dataset.CustomPlaybackRate=o.playbackRate}}))})(n)})(window.document.body,!0),console.log("adding listeners for netflix..."),console.log(l()),clearInterval(a))}),1e3)})(),chrome.runtime.onMessage.addListener(((e,t,o)=>{if("update_netflix_subtitles_styles"===e.message){const{verticalPosition:t=0,fontSize:l=32,fontColor:n="currentColor",fontWeight:s="normal"}=e.payload;console.log("Waiting for subtitles selector");const r=setInterval((()=>{document?.querySelector(".player-timedtext")?.firstChild&&(console.log("found subtitles..."),a(t,l,n,s),clearInterval(r))}),1e3);return o({message:"netflix subtitles styles enabled",payload:null}),!0}if("reset_subtitles"===e.message){const{verticalPosition:e,fontSize:t,fontColor:n,fontWeight:s}=l;if(Object.keys(l).every((e=>null===l[e])))return null;a(e,t,n,s),((e={payload:{verticalPosition:Number,fontColor:"",fontSize:Number,fontWeight:Number}})=>{chrome.storage.local.set({subtitlesOptions:e.payload})})({payload:{verticalPosition:e,fontSize:t,fontWeight:s,fontColor:n}}),o({message:"reset_subtitles",payload:{verticalPosition:e,fontSize:t,fontColor:n,fontWeight:s}}),Object.keys(l).forEach((e=>{l[e]=null}))}return!0})))})();