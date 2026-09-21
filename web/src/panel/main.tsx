import { recordingMode } from '../../../shared/recording';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PanelApp } from './PanelApp';
import './panel.css';
import './customization.css';
createRoot(document.getElementById('root')!).render(<PanelApp/>);

if (recordingMode) document.addEventListener('click', event => {
  if (!event.isTrusted || !(event.target instanceof Element)) return;
  const target = event.target.closest('button,input,textarea,[role="radio"],[role="checkbox"]');
  if (!target) return;
  // Labels only: never capture field values, arbitrary page text or credentials.
  const label = target.getAttribute('aria-label') || target.getAttribute('title') || target.tagName.toLowerCase();
  void chrome.runtime.sendMessage({type:'nova-recording-click',at:Date.now(),target:label.slice(0,120)}).catch(()=>{});
}, true);
