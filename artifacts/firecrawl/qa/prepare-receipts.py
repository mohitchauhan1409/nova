from pathlib import Path
import json
q=Path(__file__).resolve().parent;s=json.loads((q/'session-immutable.json').read_text());cs=[x for x in s['actionSteps'] if x['kind']=='click'];anchor=1790057516342
notes=[
'Scrape sidebar link opens the Scrape playground.',
'Format menu opens from Markdown.',
'JSON is added alongside Markdown and the visual schema dialog opens.',
'String type menu opens for price_gbp.',
'Number is selected for price_gbp.',
'Save options closes the configured two-field dialog.',
'Format menu reopens showing two enabled formats.',
'Edit options reopens saved JSON prompt/title/price schema.',
'Save options closes the verified JSON dialog.',
'Start scraping changes to Loading and runs configured job.',
'Newest Recent Runs entry opens saved base scrape N5aXjuX8lhZKI0RYWSH56.',
'Nova clicks the JSON download control, opening the browser downloads popover instead of changing the result tab. Genuine misclick retained.',
'JSON result tab displays structured title A Light in the Attic and price_gbp51.77.',
'Activity Logs navigation opens the request list/loading state.',
'After Back, the actual JSON tab displays the same saved base output.',
'Go back activates; the public Playground loads shortly afterward.',
'Dashboard navigation returns to the Personal Team account.',
'Scrape sidebar navigation opens the team playground for revision.',
'Format menu opens for the stock revision.',
'JSON enables and opens the default visual schema dialog.',
'Price field String type menu opens.',
'Price field type becomes Number.',
'Add-row control appends a third empty String field.',
'Stock_count String type menu opens.',
'Stock_count type becomes Number.',
'Save options closes the title/price_gbp/stock_count dialog.',
'Format menu reopens for configuration verification.',
'Edit options reopens the saved three-field schema.',
'Save options closes verified revised schema.',
'Start scraping changes to Loading for separate stock revision.',
'JSON download control triggers a download/popover; it does not switch result tab. Retained.',
'Newest Recent Runs entry opens saved revision htmPdl4_f8Macad7e6Cod.',
'JSON download control is clicked again while Markdown remains selected. Retained.',
'Actual JSON tab displays title,price_gbp51.77 and stock_count22.',
'Go back returns to public Playground/Recent Runs.',
'Original11:44 Recent Runs entry reopens base saved scrape.',
'Actual JSON tab shows original title/price output without stock_count.',
'Go back returns to public Playground/Recent Runs.',
'Revision11:47 entry reopens stock revision.',
'JSON download control again opens downloads popover. Retained.',
'Actual JSON result tab exposes stock_count22 alongside title and price.',
'Dashboard navigation returns from saved public result to verified Personal Team.',
'Crawl endpoint card opens the team Crawl playground.',
'Crawl options popover opens with defaults.',
'Close options dismisses verified limit2,depth1,entireWebsiteoff configuration.',
'Start crawling runs bounded two-page job; new Recent Runs entry initially Pending.',
'Newest successful crawl entry opens persisted two-page crawl01a0c7c5-8ba1-749d-977a-02db35a0d6cb.',
'Go back leaves two-page saved result for public Playground.',
'Dashboard navigation returns to Personal Team for separate revision.',
'Crawl endpoint card opens fresh team playground.',
'Crawl options opens for one-page revision.',
'Start crawling runs with visible limit1,depth1,entireWebsiteoff; new run initially Pending.',
'Newest successful entry opens saved one-page crawl01a0c7c6-f402-739b-8f6f-9c013cd29001.',
'Go back leaves one-page result, whose Results(1) and native coverage hint remain visible during transition.',
'Earlier two-page entry reopens persisted Results(2), with All products and Books pages visible.'
]
assert len(notes)==len(cs)==55
rs=[]
for i,c in enumerate(cs):
 f=round((c['at']-anchor)*.03)
 rs.append({'id':f'nova-action-click-{i:03d}','at':c['at'],'actor':'nova','button':'left','target':c['title'],'evidence':f'Immutable accepted session {s["id"]}, verified actionSteps click receipt {c["id"]}. Timestamp is beginStep/action-start before driver.execute, NOT trusted mouse-dispatch time. Coordinator explicitly requested this available receipt basis.','response':notes[i],'source_frame':f,'frame_evidence':f'Original frames{f+4} and{f+30} visually inspected in click-sheet-{i//4+1:02d}; adjacent action-start{f} and{f+10} extracted. Index map retained. Cursor/response support real action; cannot establish one-frame physical dispatch timing.','timing_basis':'Nearest captured frame to immutable Nova action-start epoch; exact mouse dispatch unavailable.','action_receipt':c})
(q/'reviewed-clicks.json').write_text(json.dumps(rs,indent=2)+'\n')
(q/'provenance-limits.json').write_text(json.dumps({'session_id':s['id'],'action_steps':72,'verified_click_actions':55,'excluded':{'fills':15,'scroll':1,'back':1,'operator_clicks':'all, no trustworthy ledger'},'recordingClicks':'absent in accepted session','timing_limitation':'actionSteps.at is created before driver.execute, so sound timing is aligned to recorded action start, not proven actual dispatch. No fabricated fixed delay is applied. Decoded onset QA measures chosen cues only.','duplicate_action_ids':len(cs)-len(set(x['id'] for x in cs))},indent=2)+'\n')
print('55 reviewed Nova click action receipts; timing limitation explicitly recorded')
