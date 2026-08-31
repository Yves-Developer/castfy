const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (cb) => {
  const handler = (_e, payload) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld('castfy', {
  // library
  list: () => ipcRenderer.invoke('library:list'),
  get: (id) => ipcRenderer.invoke('library:get', id),
  runs: () => ipcRenderer.invoke('runs:list'),

  // projects
  projects: () => ipcRenderer.invoke('projects:list'),
  project: (id) => ipcRenderer.invoke('projects:get', id),
  createProject: (title) => ipcRenderer.invoke('projects:create', title),
  renameProject: (id, title) => ipcRenderer.invoke('projects:rename', id, title),
  removeProject: (id) => ipcRenderer.invoke('projects:remove', id),
  saveEditor: (id, editor) => ipcRenderer.invoke('projects:saveEditor', id, editor),
  saveCuts: (id, cuts) => ipcRenderer.invoke('projects:saveCuts', id, cuts),
  recut: (sessionId, cuts) => ipcRenderer.invoke('export:recut', sessionId, cuts),

  // export
  render: (sessionId, spec) => ipcRenderer.invoke('export:render', sessionId, spec),
  onExportProgress: on('export:progress'),
  reveal: (dir) => ipcRenderer.invoke('library:reveal', dir),
  onChange: on('library:changed'),

  // connect
  detect: () => ipcRenderer.invoke('clients:detect'),
  connect: (id) => ipcRenderer.invoke('clients:connect', id),
  disconnect: (id) => ipcRenderer.invoke('clients:disconnect', id),
  openExternal: (url) => ipcRenderer.invoke('shell:open', url),
  agents: () => ipcRenderer.invoke('agents:list'),
  selectAgent: (id) => ipcRenderer.invoke('agents:select', id),

  // new demo
  compose: (input) => ipcRenderer.invoke('demo:compose', input),
  copyPrompt: (input) => ipcRenderer.invoke('demo:copy', input),
  run: (input) => ipcRenderer.invoke('demo:run', input),
  cancel: () => ipcRenderer.invoke('demo:cancel'),
  onLog: on('demo:log'),
  onDone: on('demo:done'),
});
