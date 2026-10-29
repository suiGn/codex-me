// OBS WebSocket v5. Fixed loopback transport; no arbitrary RPC or stream-key access.
import { WebSocket } from 'ws';
import { createHash, randomUUID } from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest('base64');
export function createObsControl({ port = 4455, password = '', timeout = 5000 } = {}) {
  let socket = null, ready = false, connecting = false, connectJob = null, statusJob = null, cached = null, updatedAt = 0;
  let endpointPort = Number(port);
  const pending = new Map();
  const snapshot = () => ({ connected: ready, connecting, port: endpointPort, ...cached });
  function clear() {
    ready = false; cached = null; updatedAt = 0;
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(Error('OBS disconnected. Reconnect to check the stream.')); }
    pending.clear();
  }
  function disconnect() {
    const previous = socket; socket = null; clear(); previous?.terminate();
  }
  function request(requestType, requestData = {}) {
    if (!ready || socket?.readyState !== WebSocket.OPEN) return Promise.reject(Error('Connect OBS first.'));
    const requestId = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(requestId); reject(Error('OBS did not confirm the request. Check OBS before retrying.')); }, timeout);
      pending.set(requestId, { resolve, reject, timer });
      socket.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
    });
  }
  async function status(force = false) {
    if (!ready) return snapshot();
    if (statusJob) return statusJob;
    if (!force && Date.now() - updatedAt < 1000) return snapshot();
    statusJob = (async () => {
      const [stream, scene] = await Promise.all([request('GetStreamStatus'), request('GetCurrentProgramScene')]);
      cached = { streaming: stream.outputActive === true, reconnecting: stream.outputReconnecting === true, timecode: String(stream.outputTimecode || ''), scene: String(scene.currentProgramSceneName || ''), skippedFrames: Number(stream.outputSkippedFrames) || 0, totalFrames: Number(stream.outputTotalFrames) || 0 };
      updatedAt = Date.now(); return snapshot();
    })().finally(() => { statusJob = null; });
    return statusJob;
  }
  function connect(options = {}) {
    if (connectJob) return connectJob;
    const selectedPort = Number(options.port ?? port);
    const selectedPassword = options.password ?? password;
    if (!Number.isInteger(selectedPort) || selectedPort < 1024 || selectedPort > 65535 || typeof selectedPassword !== 'string' || selectedPassword.length > 512) return Promise.reject(Error('Use a local OBS port from 1024 to 65535 and a valid password.'));
    disconnect(); endpointPort = selectedPort; connecting = true;
    connectJob = new Promise((resolve, reject) => {
      let identified = false, finished = false;
      const finish = (error) => {
        if (finished) return; finished = true; clearTimeout(timer); connecting = false;
        if (error) { if (socket === client) disconnect(); reject(error); } else resolve();
      };
      const timer = setTimeout(() => finish(Error('OBS connection timed out. Check its WebSocket settings.')), timeout);
      const client = new WebSocket(`ws://127.0.0.1:${selectedPort}`, { maxPayload: 2 * 1024 * 1024, handshakeTimeout: timeout }); socket = client;
      client.on('error', () => finish(Error('Cannot reach OBS. Open OBS and enable its WebSocket server.')));
      client.on('close', code => {
        if (socket === client) { socket = null; clear(); }
        finish(Error(code === 4009 ? 'OBS password rejected. Check the password in OBS.' : 'OBS disconnected. Check its WebSocket settings.'));
      });
      client.on('message', raw => {
        if (socket !== client) return;
        try {
          const { op, d } = JSON.parse(raw.toString());
          if (op === 0 && !identified) {
            identified = true;
            const authentication = d.authentication ? hash(hash(selectedPassword + d.authentication.salt) + d.authentication.challenge) : undefined;
            client.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, eventSubscriptions: 0, ...(authentication ? { authentication } : {}) } }));
          } else if (op === 2 && identified) { ready = true; finish(); }
          else if (op === 7) {
            const item = pending.get(d.requestId); if (!item) return;
            pending.delete(d.requestId); clearTimeout(item.timer);
            d.requestStatus?.result ? item.resolve(d.responseData || {}) : item.reject(Error('OBS rejected the request. Check OBS configuration and output state.'));
          }
        } catch { finish(Error('Invalid OBS WebSocket response. Use OBS WebSocket v5.')); }
      });
    }).then(() => status(true)).finally(() => { connectJob = null; connecting = false; });
    return connectJob;
  }
  async function action(name) {
    if (!['start', 'stop', 'preview'].includes(name)) throw Error('Unsupported OBS action.');
    if (name === 'preview') {
      const state = await status(true);
      if (!state.scene) throw Error('No OBS program scene is available.');
      const result = await request('GetSourceScreenshot', { sourceName: state.scene, imageFormat: 'jpg', imageWidth: 640, imageCompressionQuality: 60 });
      if (typeof result.imageData !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(result.imageData) || result.imageData.length > 1500000) throw Error('OBS preview unavailable.');
      return { image: result.imageData, scene: state.scene };
    }
    // Never toggle or retry a stream command: every change follows one explicit UI click.
    await request(name === 'start' ? 'StartStream' : 'StopStream');
    return status(true);
  }
  return { connect, disconnect, status, snapshot, action };
}
