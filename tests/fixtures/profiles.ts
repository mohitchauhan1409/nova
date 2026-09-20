import type { SiteProfile } from '../../shared/types';

// Fictional, vendor-neutral workspace for the reusable workflow engine tests.
export const workflowProfile: SiteProfile = {
  id: 'workspace', name: 'Workflow Workspace', domain: 'workspace.example',
  url: 'https://workspace.example', color: '#7360db', description: 'Manage projects and workflows.',
  instructions: 'Use the visible controls. Keep drafts unpublished unless asked. Inspect values once, correct only mismatches, and verify persisted results. Never dispatch communications as a side effect of editing a draft.',
  observations: 0, builtIn: false,
  flows: [
    {id:'workspace-workflow',name:'Inspect and update a workflow',trigger:'Review workflow nodes, timing and outcomes',verified:false,steps:[
      'Open the existing workflow and inspect its Start, Wait and End nodes.',
      'Close an open dropdown with Escape before moving to another control. Use current selected values as evidence.',
      'Change only the requested mismatching field. Use Fit view if a node is covered or outside the viewport.',
      'Validate once. If the user asks for a reload, reload once and inspect each required setting once.',
      'Confirm completion using the observed schema, node settings and validation result. Keep the draft unpublished.'
    ]},
    {id:'workspace-projects',name:'Manage projects',trigger:'Find or create a project',verified:false,steps:['Inspect projects and their owners.','Collect the missing name and purpose before creating a project.']},
    {id:'workspace-reports',name:'Review reports',trigger:'Summarize reporting data',verified:false,steps:['Read the visible report filters and dates.','Summarize only the observed metrics.']},
    {id:'workspace-settings',name:'Account settings',trigger:'Inspect account settings',verified:false,steps:['Open account preferences.','Read the requested setting without changing unrelated values.']}
  ]
};
