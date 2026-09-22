from pathlib import Path
import hashlib,json,subprocess,sys
from datetime import datetime,timezone
q=Path(__file__).resolve().parent
paths=[Path(x) for x in sys.argv[1:]]
assert len(paths)==3
records=[]
for p in paths:
 meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,nb_frames,duration,sample_rate,channels','-of','json',str(p)]))
 v=next(s for s in meta['streams'] if s['codec_type']=='video')
 israw=p.suffix=='.mov';n=14355 if israw else 14175
 assert int(v['nb_frames'])==n and v['width']==3024 and v['height']==1776 and v['r_frame_rate']=='30/1' and v['avg_frame_rate']=='30/1'
 assert abs(float(meta['format']['duration'])-n/30)<.04
 assert len(meta['streams'])==(2 if 'clicks' in p.name else 1)
 sha=hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
 if israw: assert sha=='81efdc5a1a641e1ac0cf48b66fce66bd1b136b1050f5832d2e443cc8fbf02fc8'
 records.append({'path':'artifacts/interfaze/media/'+('nova-interfaze-original.mov' if israw else p.name),'sha256':sha,'bytes':p.stat().st_size,'metadata':meta})
now=datetime.now(timezone.utc).isoformat()
t=json.loads((q/'timings.json').read_text());t['exportsReadyAt']=now
start=datetime.fromisoformat(t['startupWorkBegunAt'].replace('Z','+00:00'));t['elapsedWallSecondsThroughExports']=(datetime.now(timezone.utc)-start).total_seconds()
(q/'timings.json').write_text(json.dumps(t,indent=2)+'\n')
m={'startup':'Interfaze','branch':'interfaze-nova','status':'Local exports validated; independent final visual review and remote recovery pending','sessionId':'afbb051f-28e4-496d-a4e1-dc228e111c1a','recordedBackendCommit':'bd98d2500625f8821aa38836272b2568cb0fb4e5','recordedFrontendCommit':'1f7c8755a8cf1133534272c0083615156639d91e','recordedMainCommit':'dad9db1f1ff9a172d47a2f3e095eab4a6c96daf7','files':records,'sourceSeconds':478.5,'editedSeconds':472.5,'idleReductionSeconds':6,'allExecutionSpeed':'1x','clicks':{'total':43,'nova':33,'operator':10},'timingScope':'Media duration is not measured agent latency. See timings.json for inclusive wall-clock span.','soundVerification':json.loads((q/'sound-verification.json').read_text()),'decodedAudio':{k:v for k,v in json.loads((q/'decoded-audio.json').read_text()).items() if k!='events'},'decodedFrames':{k:v for k,v in json.loads((q/'decoded-frame-comparison.json').read_text()).items() if k!='frames'},'limitations':['Limited demonstrated dashboard workflows; no claim of exhaustive coverage or accuracy guarantee.','Cursor labels may overlap controls or clip at the viewport. Pointer review is sampled, not every-frame certification.','Baseline CD-300 conversation was prepared before capture.','Approximately 30-minute target was exceeded; elapsed wall time includes other startup work, fixes and interruptions. Classified exclusive labor totals unavailable.']}
(q/'media-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
print(json.dumps({'files':[{k:f[k] for k in ('path','sha256','bytes')} for f in records],'exportsReadyAt':now},indent=2))
