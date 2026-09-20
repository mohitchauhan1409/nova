import { clientMessageSchema, type ServerEvent } from '../../../shared/types';
import type { AgentRunner } from './runner';
import { SarvamVoice } from '../providers/sarvam';
import { quickAction } from './quick-actions';
import { safeError } from '../config';

// This transport is bound by the controlled browser's isolated CDP world to one
// runner. A website never receives a pairing token or an unrestricted API client.
export class WebsiteCompanion {
  private voice?:SarvamVoice;
  private greeted=false;
  constructor(private runner:AgentRunner){}
  private event=(event:ServerEvent)=>this.runner.driver.companion?.(event);
  speak(text:string){this.voice?.speak(text);}
  progress(text:string){this.voice?.progress(text);}
  close(){this.voice?.close();this.voice=undefined;}
  private command=(text:string,spoken=false)=>{
    const runner=this.runner;const normalized=text.trim();
    if(/^(stop|cancel|pause|never mind|nevermind)[.!]?$/i.test(normalized)){runner.stop();this.voice?.interrupt();return;}
    if(runner.session.approval&&/^(yes|yes please|confirm|proceed|approve|go ahead|no)[.!]?$/i.test(normalized)){void runner.approve(runner.session.approval.id,!/^no/i.test(normalized)).catch(error=>this.event({type:'error',message:safeError(error)}));return;}
    void runner.command(text);
  };
  async handle(raw:unknown){
    try{
      const message=clientMessageSchema.parse(raw);const runner=this.runner;
      if('sessionId' in message&&message.sessionId!==runner.session.id)throw new Error('This companion belongs to a different website session.');
      if(message.type==='command')this.command(message.text,message.voice);
      else if(message.type==='answer')await runner.answer(message.clarificationId,message.answers);
      else if(message.type==='approve')await runner.approve(message.approvalId,message.approved);
      else if(message.type==='stop'||message.type==='interrupt'){runner.stop();this.voice?.interrupt();}
      else if(message.type==='voice-start'){
        this.voice?.close();this.voice=new SarvamVoice(this.event,text=>this.command(text,true),()=>{if(runner.session.status==='running')runner.stop(false);});
        this.voice.start();if(!this.greeted){this.greeted=true;this.voice.speak("Hi, I'm Nova. I'm here with you on this website. What would you like to do?");}
      }else if(message.type==='voice-stop'){this.close();this.event({type:'voice',event:'off'});}
      else if(message.type==='audio')this.voice?.audio(message.audio);
    }catch(error){this.event({type:'error',message:safeError(error)});}
  }
}
