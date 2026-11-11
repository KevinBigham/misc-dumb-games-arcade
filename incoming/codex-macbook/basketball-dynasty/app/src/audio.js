import { rngFrom } from './data.js';

class BroadcastAudio{
 constructor(){this.context=null;this.master=null;this.crowd=null;try{this.enabled=localStorage.getItem('bscfd-audio')!=='off';}catch{this.enabled=true;}this.lastScore=0;}
 unlock(){
  if(!this.enabled)return;
  if(!this.context){
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
   this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=.32;this.master.connect(this.context.destination);this.makeCrowd();
  }
  if(this.context.state==='suspended')this.context.resume().catch(()=>{});
 }
 makeCrowd(){
  const ctx=this.context,length=ctx.sampleRate*3,buffer=ctx.createBuffer(2,length,ctx.sampleRate),rand=rngFrom('BSCFD-CROWD-AUDIO');
  for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let low=0;for(let i=0;i<length;i++){low=low*.985+(rand()*2-1)*.015;data[i]=low*(.5+.2*Math.sin(i/ctx.sampleRate*Math.PI*.7));}}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='bandpass';filter.frequency.value=680;filter.Q.value=.35;gain.gain.value=.12;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.crowd=gain;
 }
 tone(frequency,duration=.09,type='sine',volume=.13,delay=0,endFrequency=null){
  if(!this.enabled)return;this.unlock();if(!this.context)return;
  const ctx=this.context,at=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,at);if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,at+duration);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(this.master);osc.start(at);osc.stop(at+duration+.02);
 }
 noise(duration=.08,volume=.08,frequency=1000){
  if(!this.enabled)return;this.unlock();if(!this.context)return;
  const ctx=this.context,n=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,n,ctx.sampleRate),data=buffer.getChannelData(0),rand=rngFrom(`sound-${this.lastScore++}`);for(let i=0;i<n;i++)data[i]=rand()*2-1;
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;gain.gain.setValueAtTime(volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);src.connect(filter);filter.connect(gain);gain.connect(this.master);src.start();
 }
 play(cue){
  if(!this.enabled)return;
  if(cue==='click')this.tone(410,.035,'sine',.035);
  if(cue==='score'){this.tone(660,.09,'triangle',.09);this.tone(880,.13,'triangle',.07,.065);}
  if(cue==='three'){this.tone(660,.08,'triangle',.1);this.tone(990,.1,'triangle',.09,.07);this.tone(1320,.16,'sine',.08,.14);}
  if(cue==='miss')this.noise(.055,.035,1250);
  if(cue==='timeout'){this.tone(920,.15,'square',.05);this.tone(920,.15,'square',.05,.22);}
  if(cue==='draft'){[392,523.25,659.25,783.99].forEach((f,i)=>this.tone(f,.3,'triangle',.085,i*.105));}
  if(cue==='win'){[261.6,329.6,392,523.25,659.25].forEach((f,i)=>this.tone(f,.42,'triangle',.1,i*.12));}
  if(cue==='whistle'){this.tone(1800,.15,'sine',.04,0,2300);}
 }
 event(event){if(!event)return;if(event.type==='make')this.play(event.points===3?'three':'score');else if(event.type==='miss')this.play('miss');else if(event.type==='timeout'||event.type==='period')this.play('whistle');else if(event.type==='final')this.play('win');}
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem('bscfd-audio',this.enabled?'on':'off');}catch{}if(this.master)this.master.gain.setTargetAtTime(this.enabled?.32:0,this.context.currentTime,.04);if(this.enabled)this.unlock();return this.enabled;}
}
export const audio=new BroadcastAudio();
