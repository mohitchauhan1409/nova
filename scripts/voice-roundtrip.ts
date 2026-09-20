import { WebSocket } from 'ws';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { config } from '../BE/src/config';
const phrase='What is the price of this adapter?';
const response=await fetch('https://api.sarvam.ai/text-to-speech',{method:'POST',headers:{'api-subscription-key':config.sarvamKey,'Content-Type':'application/json'},body:JSON.stringify({model:config.ttsModel,text:phrase,language_code:'en-IN',speaker:config.speaker,speech_sample_rate:16000,output_audio_codec:'wav'}),signal:AbortSignal.timeout(15000)});
assert.equal(response.status,200);const result=await response.json() as {audios:string[]};const wav=Buffer.from(result.audios[0],'base64');
let offset=12;let pcm:Buffer|undefined;while(offset+8<=wav.length){const name=wav.toString('ascii',offset,offset+4);const size=wav.readUInt32LE(offset+4);if(name==='data'){pcm=wav.subarray(offset+8,Math.min(offset+8+size,wav.length));break;}offset+=8+size+(size%2);}assert.ok(pcm?.length);console.log('Audio format',JSON.stringify({sampleRate:wav.readUInt32LE(24),channels:wav.readUInt16LE(22),bits:wav.readUInt16LE(34),bytes:pcm.length}));
const transcript=await new Promise<string>((resolve,reject)=>{
 const params=new URLSearchParams({model:config.sttModel,language_code:'en-IN',stream_type:'fast',encoding:'linear16',sample_rate:'16000',endpointing:'vad',silence_duration_ms:'500'});
 const ws=new WebSocket(`wss://api.sarvam.ai/speech-to-text-realtime/ws?${params}`,{headers:{'api-subscription-key':config.sarvamKey}});let complete=false;
 const timer=setTimeout(()=>{ws.terminate();reject(new Error('No final transcript after 20 seconds'));},20000);
 ws.on('message',raw=>{const event=JSON.parse(raw.toString());if(event.event==='transcript.final')console.log('STT final',event.text);if(event.event==='session.begin'){void(async()=>{const audio=Buffer.concat([pcm!,Buffer.alloc(96000)]);for(let i=0;i<audio.length&&ws.readyState===WebSocket.OPEN;i+=3200){ws.send(JSON.stringify({event:'audio_input',audio:audio.subarray(i,i+3200).toString('base64')}));await new Promise(resolve=>setTimeout(resolve,100));}})();}if(event.event==='transcript.final'){complete=true;clearTimeout(timer);ws.close();resolve(event.text);}if(event.event==='error'){clearTimeout(timer);ws.close();reject(new Error(event.message));}});ws.on('error',reject);ws.on('close',code=>{if(!complete){clearTimeout(timer);reject(new Error(`STT closed ${code}`));}});
});
assert.match(transcript,/price/i);assert.match(transcript,/adapt[eo]r/i);
const report={at:new Date().toISOString(),ok:true,source:'Synthetic Sarvam speech; no microphone recording',phrase,transcript,audioBytes:pcm.length};console.log(JSON.stringify(report,null,2));await writeFile('BE/data/voice-roundtrip-report.json',JSON.stringify(report,null,2));
