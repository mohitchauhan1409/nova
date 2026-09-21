import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { IsolatedBrowser } from './isolated-browser';

const exec = promisify(execFile);
const root = path.resolve('artifacts/isolated-browser-proof');
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, 'run-'));
const html = `<!doctype html><html><meta charset="utf-8"><title>Independent browser test</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#101827;color:#eef3fb;font:18px system-ui;padding:50px 64px}
.eyebrow{color:#80eac2;font-size:13px;letter-spacing:2px}h1{font-size:42px;margin:16px 0 12px}p{color:#aebdd0}
.card{border:1px solid #34455b;border-radius:16px;background:#172336;padding:28px;margin-top:26px}
.row{display:flex;justify-content:space-between;gap:24px;align-items:center}#clock{font:36px ui-monospace;color:#82ecc5}
label{display:block;color:#bac9dc;font-size:14px;margin-bottom:8px}input{padding:14px;border:1px solid #59718c;border-radius:8px;background:#0d1726;color:white;font:18px system-ui;width:440px}
button{padding:15px 24px;background:#8aefc6;color:#0c3026;border:0;border-radius:8px;font-size:16px;font-weight:600;margin-left:12px;cursor:pointer}
#status{font-size:22px;color:#f6fbff;margin:24px 0 10px}.track{height:7px;background:#28394f;border-radius:4px;overflow:hidden;margin:28px 0}.dot{height:100%;width:18%;background:#82ecc5;animation:move 2s linear infinite alternate}@keyframes move{to{transform:translateX(455%)}}
.foot{font-size:14px;color:#91a5bd}#trusted{color:#82ecc5}#details{display:none;margin-top:18px;color:#cfdaea}
</style><div class="eyebrow">LIVE TEST · SEPARATE BROWSER PROCESS</div>
<h1>Browser work, without taking your screen.</h1><p>This local test runs in headless Chrome. The desktop is not being recorded.</p>
<div class="card"><div class="row"><strong>Live browser rendering</strong><span id="clock">0.0 s</span></div><div class="track"><div class="dot"></div></div>
<label for="task">Task for this test</label><input id="task" placeholder="Watch the agent type here"><button id="run">Create preview</button>
<div id="status">Ready for browser input</div><button id="details-button" style="margin:8px 0 0;background:#2b405a;color:#fff">Open details</button>
<div id="details">The input and click reached this browser only.</div>
<p class="foot">Trusted input events: <span id="trusted">0</span> &nbsp;·&nbsp; Recording: browser pixels only</p></div>
<p class="foot">Verification fixture · No Nova model response or customer action is simulated.</p>
<script>const start=performance.now();let n=0;window.events=[];setInterval(()=>document.querySelector('#clock').textContent=((performance.now()-start)/1000).toFixed(1)+' s',50);
for(const type of ['click','input'])document.addEventListener(type,e=>{if(e.isTrusted){document.querySelector('#trusted').textContent=String(++n);window.events.push({type,id:e.target.id,trusted:e.isTrusted});}});
document.querySelector('#run').onclick=()=>document.querySelector('#status').textContent='Preview created: '+document.querySelector('#task').value;
document.querySelector('#details-button').onclick=()=>{document.querySelector('#details').style.display='block';document.querySelector('#status').textContent='Completed — browser input stayed isolated';};
</script></html>`;
const server = createServer((_request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
assert.ok(address && typeof address !== 'string');
const url = `http://127.0.0.1:${address.port}`;
const sessions: IsolatedBrowser[] = [];
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
try {
  const agent = await IsolatedBrowser.launch(); sessions.push(agent);
  const independent = await IsolatedBrowser.launch(); sessions.push(independent);
  await Promise.all([agent.page.goto(url), independent.page.goto(url)]);
  await agent.page.evaluate(() => localStorage.setItem('owner', 'agent'));
  await independent.page.evaluate(() => localStorage.setItem('owner', 'independent'));
  await agent.page.evaluate(() => { document.querySelector('#clock')!.textContent = '0.0 s'; });
  const recording = await agent.record({ output: path.join(output, 'independent-chrome.mp4'), keepFrames: true });
  const started = performance.now();
  const at = (seconds: number) => sleep(Math.max(0, started + seconds * 1000 - performance.now()));
  const competing = (async () => {
    for (let i = 0; i < 12; i++) {
      await independent.page.bringToFront();
      await independent.page.locator('#task').fill(`Unrelated session ${i}`);
      await independent.page.locator('#run').click();
      await sleep(240);
    }
  })();
  await at(0.6);
  await agent.page.locator('#task').pressSequentially('Prepare the support preview', { delay: 28 });
  await at(2.0); await agent.page.locator('#run').click();
  assert.equal(await agent.page.locator('#status').innerText(), 'Preview created: Prepare the support preview');
  await at(3.2); await agent.page.locator('#details-button').click();
  await at(5.0);
  const report = await recording.stop();
  await competing;
  assert.equal(await agent.page.locator('#task').inputValue(), 'Prepare the support preview');
  assert.equal(await independent.page.locator('#task').inputValue(), 'Unrelated session 11');
  assert.equal(await agent.page.evaluate(() => localStorage.getItem('owner')), 'agent');
  assert.equal(await independent.page.evaluate(() => localStorage.getItem('owner')), 'independent');
  assert.ok(report.uniqueWebsiteFrames >= 30, 'Live clock and actions must produce changing captured frames');
  const events = await agent.page.evaluate('window.events') as { trusted: boolean }[];
  assert.ok(events.length > 20 && events.every(event => event.trusted));
  const probe = JSON.parse((await exec('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,nb_frames:format=duration', '-of', 'json', report.output])).stdout);
  assert.ok(Math.abs(Number(probe.format.duration) - 5) < 0.3, 'Output preserves wall-clock duration');
  const hashes = (await exec('ffmpeg', ['-v', 'error', '-i', report.output, '-f', 'framemd5', '-'])).stdout.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split(',').at(-1)!.trim());
  assert.ok(new Set(hashes).size >= 30, 'Encoded MP4 must contain changing images, not just repeated frozen frames');
  await agent.page.screenshot({ path: path.join(output, 'completed.png') });
  const verification = { ok: true, output, report, probe, encodedUniqueFrames: new Set(hashes).size, trustedEvents: events.length,
    checks: ['Two separate headless Chrome processes', 'Simultaneous competing clicks and typing stay in their own pages', 'Separate local storage on the same origin', 'Real trusted input reaches the recorded page', 'Clock and animation advance in the encoded MP4', 'No desktop screen recorder or operating-system input used'] };
  await writeFile(path.join(output, 'verification.json'), JSON.stringify(verification, null, 2));
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await Promise.all(sessions.map(session => session.close()));
  server.close();
}
