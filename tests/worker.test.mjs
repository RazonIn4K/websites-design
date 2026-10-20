import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';
for (const method of ['POST','PUT','PATCH','DELETE','OPTIONS']) {
 test(`${method}: rejects before touching asset binding or body`,async()=>{
  let accessed=false;const request=new Request('https://example.test/gallery/a1-auto/',{method,...(['POST','PUT','PATCH','DELETE'].includes(method)?{body:'synthetic-no-contact'}:{})});
  const response=await worker.fetch(request,{ASSETS:{fetch(){accessed=true;throw new Error('must not be called');}}});
  assert.equal(response.status,405);assert.equal(accessed,false);assert.equal(response.headers.get('allow'),'GET, HEAD');assert.equal(request.bodyUsed,false);assert.match(response.headers.get('content-security-policy'),/form-action 'none'/);
 });
}
for(const method of ['GET','HEAD']) {
 test(`${method}: delegates to sole asset binding and preserves response/security`,async()=>{
  let seen;const request=new Request('https://example.test/gallery/leza-nail-spa/',{method});
  const response=await worker.fetch(request,{ASSETS:{async fetch(r){seen=r;return new Response(method==='HEAD'?null:'static-asset',{status:200,headers:{'content-type':'text/html','etag':'testasset'}});}}});
  assert.equal(seen,request);assert.equal(response.status,200);assert.equal(response.headers.get('etag'),'testasset');assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');
  assert.match(response.headers.get('content-security-policy'),/frame-src 'none'/);assert.match(response.headers.get('content-security-policy'),/connect-src 'self'/);assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.equal(await response.text(),method==='HEAD'?'':'static-asset');
 });
}
test('unknown asset remains404; no SPA or backend success fallback',async()=>{const response=await worker.fetch(new Request('https://example.test/api/lead'),{ASSETS:{async fetch(){return new Response('not found',{status:404});}}});assert.equal(response.status,404);assert.equal(await response.text(),'not found');assert.match(response.headers.get('x-robots-tag'),/noindex/);});
