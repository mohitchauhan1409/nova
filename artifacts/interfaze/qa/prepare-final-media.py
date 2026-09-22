from pathlib import Path
import json,shutil,hashlib
base=Path('/Users/macbook/Desktop/Nova-batch-20260922')
root=base/'worktrees/interfaze/artifacts/interfaze'; q=root/'qa'
session=json.loads((base/'private/interfaze-final-sessions.json').read_text())[0]
ledger=json.loads((base/'private/interfaze-final-operator.json').read_text())
anchor=1790049469029
clicks=session['recordingClicks'];steps=session['actionSteps'];frames=json.loads((q/'final-frame-indices.json').read_text())
notes=[
'Launcher activation opens Nova and resizes the website.',
'Nova composer receives caret and begins individually typed first prompt.',
'Nova black cursor focuses native website textarea; exact prompt begins typing.',
'Black cursor/ring targets Send; prompt becomes a chat message and native processing begins.',
'Nova composer receives individually typed JSON-triage follow-up.',
'Help me choose activates; prior card collapses and help request appears in chat.',
'Category + summary radio becomes visibly checked with a selected border.',
'Continue submits selected category + summary; card becomes Answered and details message appears.',
'System Prompt expands and reveals its textarea.',
'System prompt textarea receives focus; concise policy enters individually.',
'Configuration expands and exposes Temperature, Top P and completion-token sliders.',
'JSON toggle becomes checked; structured schema editor appears.',
'Property input focuses and category is typed.',
'Category Required asterisk becomes blue/pressed.',
'Add Property appends the second schema row.',
'Second property input focuses and summary is typed.',
'Summary Required asterisk becomes blue/pressed.',
'Nova composer receives individually typed CD-104 test request.',
'Website textarea focuses and CD-104 prompt begins typing.',
'Send moves CD-104 prompt into chat; model processing begins.',
'Logs navigation opens the request list/loading state.',
'Latest request row opens Log detail with CD-104 prompt, status200 and damage JSON.',
'Nova composer receives individually typed escalation-policy follow-up.',
'Playground navigation returns to persisted policy/schema/chat.',
'System Prompt expands to expose current policy.',
'Policy textarea focuses; revised escalation rule enters individually.',
'Add Property appends third row below visible viewport; subsequent retry interval is retained.',
'Nova composer receives visible operator instruction to scroll settings and finish the test.',
'After native settings scroll, third property input focuses and escalate is typed.',
'Boolean escalate Required asterisk becomes blue/pressed.',
'Website textarea focuses and exact CD-105 test begins typing.',
'Operator confirms ordinary synthetic model Send; confirmation card dismisses and execution resumes.',
'Nova targets native Send after operator confirmation; CD-105 enters chat and processing begins. This is distinct from the operator click four source frames earlier.',
'Logs navigation opens; failed-to-fetch toast and empty list are visibly retained.',
'Logs refresh triggers loading, then failed-to-fetch state remains visible.',
'Playground navigation shows completed CD-105 delivery/escalate:true JSON despite Logs failure.',
'Logs navigation reopens; populated latest list appears.',
'Latest request opens CD-105 Log detail with status200 and matching input.',
'Nova composer receives individually typed exact-seven-day CD-106 request.',
'Playground navigation returns to current schema and previous results.',
'Website textarea focuses and exact CD-106 prompt begins typing.',
'Send moves CD-106 into chat and starts model processing.',
'Logs navigation follows visible native Failed to fetch result; recovery is retained.',
'Newest currently listed row opens CD-105 detail, visibly the stale result; Nova later closes and retries navigation.',
'Playground navigation returns to CD-106 result area after stale log detection.',
'Logs navigation now shows new CD-106 row at top.',
'Latest row opens CD-106 Log detail with status200; later real scroll exposes complete output.',
'Nova composer receives individually typed rule/temperature question.',
'Nova composer receives individually typed Show the saved output follow-up.',
'Nova composer receives individually typed request to scroll Log detail down to Output.'
]
assert len(notes)==len(clicks)==50
receipts=[];matches=[]
for i,c in enumerate(clicks):
 f=round((c['at']-anchor)*.03)
 r={'id':f'click-{i:03d}','at':c['at'],'actor':c['actor'],'button':c['button'],'target':c['target'],
 'evidence':f'Private interfaze-final-sessions.json session {session["id"]} recordingClicks[{i}] trusted mouse dispatch.',
 'response':notes[i],'source_frame':f,
 'frame_evidence':f'qa/click-sheet-{i//3+1:02d}.png click{i:02d}; actual raw frames {f} and {f+30}, with adjacent {f-2},{f+2},{f+8} retained in qa/final-frames. Native recording; source frame indices in qa/final-frame-indices.json.'}
 if c['actor']=='operator':
  j,op=min(enumerate(ledger['clicks']),key=lambda pair:abs(pair[1]['completedAt']-c['at']))
  assert abs(op['completedAt']-c['at'])<10
  r['target']=op['target'];r['operator_dispatch_provenance']={'ledger_index':j,**op};r['evidence']+=f' Consolidates operator ledger clicks[{j}], dispatch {op["at"]}, completed {op["completedAt"]}.';matches.append([j,i])
 else:
  step=min(steps,key=lambda x:abs(x['at']-c['at']))
  assert abs(step['at']-c['at'])<200,(i,step)
  r['action_provenance']=step;r['evidence']+=f' Action {step["id"]}: {step["title"]}'
 receipts.append(r)
(q/'reviewed-clicks.json').write_text(json.dumps(receipts,indent=2)+'\n')
(q/'deduplication.json').write_text(json.dumps({'session_clicks':50,'operator_ledger_clicks':14,'duplicate_operator_pairs_ledger_session':matches,'unique_cues':50,'operator':14,'nova':36,'excluded_mouse_dispatches':0,'notes':'Keyboard submissions, select-value operation and scroll events are not mouse taps. Operator Confirm and subsequent Nova Send remain two separate clicks.'},indent=2)+'\n')
idle=[(64,76,3),(228,244,4),(502,518,4),(680,697,4),(724,733,3),(751,768,4)]
segments=[];prev=0
for i,(a,b,n) in enumerate(idle):
 a*=30;b*=30
 segments.append({'start_frame':prev,'end_frame':a,'output_frames':a-prev,'kind':'agent','reason':'Retain all real actions, typing, scrolling, card feedback, reading guards, loading, failures and recovery at1x.'})
 segments.append({'start_frame':a,'end_frame':b,'output_frames':n*30,'kind':'operator-idle','reason':f'Prolonged static operator wait after completed response or while awaiting operator confirmation. No action/typing/scroll dispatch in interval. Boundaries and midpoint inspected in qa/idle-sheet-{i+1:02d}.png. At least5s reading guard before/after acceleration, entire response/card and real next click retained.'})
 prev=b
segments.append({'start_frame':prev,'end_frame':23970,'output_frames':23970-prev,'kind':'agent','reason':'Retain final operator prompt, Nova actual log scroll, complete saved Output and closing hold at1x.'})
masks=[]
for start,end,h in [(757,758,10),(758,759,48),(759,760,80),(760,761,112),(761,23970,114)]:
 masks.append({'x':16,'y':174,'width':2218,'height':h,'color':'#f9f8ff','start_frame':start,'end_frame':end,'purpose':'debugger-strip','evidence':'Measured from actual final raw frames747-764 (qa/banner-sheet.png), native-mask-sample.png confirms RGB249,248,255 and right boundary2234. Row insertion expands10/48/80/112/114px including lower border. Close icon included; no product evidence or Nova panel covered.'})
plan={'fps':30,'width':3024,'height':1776,'segments':segments,'masks':masks,'clicks':[]}
(q/'edit-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
shutil.copyfile(base/'private/interfaze-final-recorder.log',q/'recorder.log')
(q/'operator-ledger.json').write_text(json.dumps(ledger,indent=2)+'\n')
(q/'click-session-provenance.json').write_text(json.dumps({'session_id':session['id'],'recordingClicks':clicks,'actionSteps':steps,'messages':session['messages']},indent=2)+'\n')
print('Prepared',len(receipts),'receipts; edited frames',sum(x['output_frames'] for x in segments),'seconds',sum(x['output_frames'] for x in segments)/30)
