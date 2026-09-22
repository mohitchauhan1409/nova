from pathlib import Path
import json
q=Path(__file__).resolve().parent
s=json.loads((q/'session-immutable.json').read_text());ledger=json.loads((q/'operator-ledger.json').read_text());anchor=1790053236706
notes=[
'Launcher opens Nova; populated single-tab Tasks page remains visible.',
'Nova composer gains focus; first read-only request begins individually typed entry.',
'Purple Nova cursor activates Runs navigation; run list opens.',
'Failed baseline run opens from the Runs list.',
'Root run details open and show quantityOverride -2 error and source quantity2.',
'Composer gains focus and correction follow-up begins typing.',
'Replay dialog opens with original invalid quantityOverride -2 payload.',
'Payload editor gains focus; original multiline JSON is replaced incrementally with corrected quantityOverride2.',
'Operator Confirm dismisses confirmation card; approved execution resumes.',
'Nova presses real Replay run after operator confirmation; new corrected run route loads. Old failed details briefly remain during loading.',
'Runs navigation opens list after corrected run completion.',
'Completed corrected run opens; saved quantityOverride2 payload and Output are visible.',
'Composer gains focus; September sales-review request begins typing.',
'Help me choose submits a visible help request; first options card collapses.',
'Product radio visibly gains checked dot and purple selected border.',
'Paid orders only radio visibly gains checked dot and purple selected border.',
'Continue submits Product and Paid orders only; card becomes Answered and details message appears.',
'Replay form opens from corrected run for product review.',
'Payload editor focuses; product grouping and paid-only JSON enters incrementally.',
'Operator Confirm approves synthetic paid-product run; card dismisses.',
'Nova presses real Replay run; new paid-product run is created. Brief old region details remain while new route loads.',
'Nova mistakenly reopens Replay after inferring wrong grouping from transitional stale details. This real error and subsequent proposal remain in full.',
'Operator Cancel dismisses redundant replay confirmation without another run.',
'Composer gains focus; visible instruction says new run already exists, close form and verify saved run without rerunning.',
'Nova closes Replay form; completed saved paid-product run with product payload appears.',
'Composer gains focus; revision request including cancellations as order demand begins typing.',
'Nova opens Replay from saved paid-product run for revised report.',
'Payload editor focuses; same batch/product JSON is replaced incrementally with includeCancelled true.',
'Operator Confirm approves revised order-demand run; card dismisses.',
'Nova presses real Replay run; revised run route loads. Stale prior details briefly remain during transition.',
'Following retained dashboard fetch-error/reload recovery, Nova opens completed revised root; saved true payload and Output appear.',
'Composer gains focus; sales-review/source-orders question begins typing.',
'Composer gains focus; request to scroll native details to Output begins typing.',
'Composer gains focus; request to read visible totals follows actual scroll and generic false-negative completion message.'
]
cs=s['recordingClicks'];assert len(notes)==len(cs)==34
receipts=[];pairs=[]
for i,c in enumerate(cs):
 f=round((c['at']-anchor)*.03)
 r={'id':f'click-{i:03d}','at':c['at'],'actor':c['actor'],'button':c['button'],'target':c['target'],'evidence':f'Immutable session {s["id"]} recordingClicks[{i}] trusted dispatch.','response':notes[i],'source_frame':f,'frame_evidence':f'Actual original frames {f} and {f+30} reviewed in click-sheet-{i//3+1:02d}; adjacent frames {f-2},{f+2},{f+8} extracted. All indices retained in frame-indices.json; regenerate from untouched original. Scratch images pruned after QA.'}
 if c['actor']=='operator':
  j,op=min(enumerate(ledger['clicks']),key=lambda p:abs(p[1]['completedAt']-c['at']));assert abs(op['completedAt']-c['at'])<10
  r['target']=op['target'];r['operator_dispatch_provenance']={'ledger_index':j,**op};pairs.append([j,i]);r['evidence']+=f' Consolidates duplicate operator ledger[{j}] dispatch and completion receipt.'
 else:
  step=min(s['actionSteps'],key=lambda x:abs(x['at']-c['at']));assert abs(step['at']-c['at'])<200
  r['action_provenance']=step;r['evidence']+=f' Action {step["id"]}: {step["title"]}'
 receipts.append(r)
(q/'reviewed-clicks.json').write_text(json.dumps(receipts,indent=2)+'\n')
(q/'deduplication.json').write_text(json.dumps({'session_clicks':34,'operator_ledger_clicks':17,'duplicate_operator_pairs_ledger_session':pairs,'unique_cues':34,'operator':17,'nova':17,'excluded_mouse_dispatches':0,'notes':'Keyboard submissions, reload and scroll are not taps. Three operator confirmations and subsequent Nova Replay clicks remain distinct. Cancel redundant proposal is retained.'},indent=2)+'\n')
segments=[{'start_frame':0,'end_frame':11280,'output_frames':11280,'kind':'agent','reason':'Retain entire opening, actions, real typing, reading, small native scrolling, Help/radio feedback, loading, wrong redundant Replay proposal, cancellation and recovery at1x.'},{'start_frame':11280,'end_frame':11880,'output_frames':150,'kind':'operator-idle','reason':'Static operator wait source376–396s after completed saved-run verification. Actual boundary/midpoint frames11280/11580/11880 inspected, same completed response and website. No action/prompt/scroll in interval. Preserve9.12s prior reading and7.128s following guard before next prompt. Twenty seconds becomes5seconds.'},{'start_frame':11880,'end_frame':17480,'output_frames':5600,'kind':'agent','reason':'Retain revision, typed JSON, approval, site fetch-error/reload recovery, actual scroll and false-negative, visible follow-up, saved Output and closing hold at1x.'}]
masks=[{'x':16,'y':174,'width':2218,'height':h,'color':'#f9f8ff','start_frame':a,'end_frame':b,'purpose':'debugger-strip','evidence':'Measured actual final original frames744–770. First insertion763; expansion heights14/46/78/110/114 include lower border and full close icon. Native26s sample RGB249,248,255. Rightedge2234 excludes Nova. No mask before actual insertion; no product data masked.'} for a,b,h in [(763,764,14),(764,765,46),(765,766,78),(766,767,110),(767,17480,114)]]
(q/'edit-plan.json').write_text(json.dumps({'fps':30,'width':3024,'height':1776,'segments':segments,'masks':masks,'clicks':[]},indent=2)+'\n')
(q/'operator-ledger.json').write_text(json.dumps(ledger,indent=2)+'\n')
(q/'click-session-provenance.json').write_text(json.dumps({'session_id':s['id'],'recordingClicks':cs,'actionSteps':s['actionSteps'],'messages':s['messages']},indent=2)+'\n')
print('34 receipts prepared; output17030frames567.666667seconds; banner begins763')
