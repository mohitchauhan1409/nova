// Uses synthetic test audio and an isolated browser profile, not the user's microphone.
import type { Page } from 'playwright';
import { ControlledBrowser } from '../BE/src/browser/controlled';
import { AgentRunner } from '../BE/src/agent/runner';
import { WebsiteCompanion } from '../BE/src/agent/website-companion';
import { OpenAIPlanner } from '../BE/src/providers/openai';
import type { Session, SiteProfile, ServerEvent } from '../shared/types';
import { writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { config } from '../BE/src/config';
const response=await fetch('https://api.sarvam.ai/text-to-speech',{method:'POST',headers:{'api-subscription-key':config.sarvamKey,'Content-Type':'application/json'},body:JSON.stringify({model:config.ttsModel,text:'What is the price of this adapter?',language_code:'en-IN',speaker:config.speaker,speech_sample_rate:16000,output_audio_codec:'wav'})});
assert.equal(response.status,200);const data=await response.json() as {audios:string[]};const wav=Buffer.from(data.audios[0],'base64');let offset=12;let pcm=Buffer.alloc(0);while(offset+8<=wav.length){const size=wav.readUInt32LE(offset+4);if(wav.toString('ascii',offset,offset+4)==='data'){pcm=wav.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}assert.ok(pcm.length);
const audio=Buffer.concat([Buffer.alloc(32000),pcm,Buffer.alloc(320000)]);const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+audio.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(16000,24);header.writeUInt32LE(32000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(audio.length,40);const file=path.resolve('BE/data/synthetic-test-mic.wav');await writeFile(file,Buffer.concat([header,audio]));
const driver=new ControlledBrowser({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',`--use-file-for-fake-audio-capture=${file}`]});
let companion:WebsiteCompanion|undefined;
try {
 await driver.open(`http://127.0.0.1:${config.port}/demo/shop`);
 const snapshot=await driver.snapshot();const site:SiteProfile={id:'voice-fixture',name:'Nova Demo Shop',url:snapshot.url,domain:'127.0.0.1',color:'#7560cc',description:'Local fictional shop',instructions:'Products and prices are fictional. Report the visible price.',flows:[],observations:1};
 const session:Session={id:'voice-smoke',siteId:site.id,mode:'browser',status:'ready',url:site.url,title:snapshot.title,messages:[],traces:[],steps:0,model:config.model,startedAt:Date.now()};
 const runner=new AgentRunner(session,driver,new OpenAIPlanner(),site,s=>driver.companion({type:'session',session:s}),text=>companion?.speak(text));
 companion=new WebsiteCompanion(runner);let voiceStarts=0;let answerUtterance='';let answerAudio=false;let transcriptAt=0;let firstReplyAudioMs:number|undefined;let answerAudioMs:number|undefined;
 const deliver=driver.companion.bind(driver);driver.companion=(event:ServerEvent)=>{if(event.type==='voice'&&event.event==='transcript'&&!transcriptAt)transcriptAt=Date.now();if(event.type==='voice'&&event.event==='audio'&&transcriptAt&&firstReplyAudioMs===undefined)firstReplyAudioMs=Date.now()-transcriptAt;if(event.type==='voice'&&event.event==='speaking'&&event.text?.includes('799'))answerUtterance=event.utteranceId||'';if(event.type==='voice'&&event.event==='audio'&&event.utteranceId===answerUtterance){answerAudio=true;answerAudioMs??=Date.now()-transcriptAt;}deliver(event);};
 await driver.bindCompanion(session,message=>{if((message as any).type==='voice-start')voiceStarts++;void companion!.handle(message);});
 const internals=driver as unknown as {page:Page;evaluate<T>(expression:string):Promise<T>};const page=internals.page;const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await internals.evaluate(`{ const original=AudioBufferSourceNode.prototype.start;window.__novaTestPlayback=0;AudioBufferSourceNode.prototype.start=function(...args){original.apply(this,args);window.__novaTestPlayback++}; }`);
 await page.getByRole('button',{name:'Open Nova assistant',exact:true}).click();
 await page.locator('.message.user span').first().waitFor({timeout:25000,state:'attached'});const transcript=await page.locator('.message.user span').first().innerText();assert.match(transcript,/price/i);
 await page.locator('.message.assistant span').first().waitFor({timeout:30000});const answer=await page.locator('.message.assistant span').first().innerText();assert.match(answer,/799/);
 for(let i=0;i<100&&!answerAudio;i++)await page.waitForTimeout(100);assert.ok(answerAudio,'The grounded answer must reach streamed speech audio');
 assert.ok(await internals.evaluate<number>('window.__novaTestPlayback')>0,'Audio playback must start in the browser');
 await page.reload();await page.getByRole('button',{name:'Open Nova assistant',exact:true}).waitFor();
 for(let i=0;i<80&&voiceStarts<2;i++)await page.waitForTimeout(100);assert.ok(voiceStarts>=2,'Consented voice resumes after same-origin navigation');
 await driver.focus();await page.getByRole('button',{name:'Stop voice',exact:true}).click();
 await page.getByText('Microphone off',{exact:true}).waitFor();assert.deepEqual(errors,[]);
 await page.screenshot({path:'BE/data/website-companion-voice.png'});
 const report={at:new Date().toISOString(),ok:true,source:'Synthetic microphone in a dedicated website browser',transcript,answer,latency:{firstReplyAudioAfterTranscriptMs:firstReplyAudioMs,groundedAnswerAudioAfterTranscriptMs:answerAudioMs},checks:['Floating button starts voice on the target website','Microphone PCM reaches Sarvam','OpenAI answers from the actual website observation','Grounded answer streams to Web Audio playback','Voice resumes after same-origin page reload','Stop voice tears down capture on the website']};console.log(JSON.stringify(report,null,2));await writeFile('BE/data/voice-ui-smoke-report.json',JSON.stringify(report,null,2));
}finally{companion?.close();await driver.close();await unlink(file).catch(()=>{});}
