/* Howl — the network. Phones meet through a free public MQTT relay (no accounts, no server of our own):
   the host's phone runs the game and every phone talks to it through room topics.
     <room>/s          public table state (retained, so a phone that reconnects gets it at once)
     <room>/b          host heartbeat (every few seconds; tells phones the host is still there)
     <room>/h          messages from phones to the host
     <room>/p/<secret> one player's private view (retained; only that phone knows the secret) */
(function (root) {
  'use strict';
  const RELAYS = [
    'wss://mqtt.eclipseprojects.io:443/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://broker.emqx.io:8084/mqtt',
  ];
  const PREFIX = 'howl-randoms-v1/';
  const qs = new URLSearchParams(location.search);
  const relays = () => (qs.get('broker') ? [qs.get('broker')] : RELAYS);
  const rid = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, x => 'abcdefghijkmnpqrstuvwxyz23456789'[x % 32]).join(''); };

  function open(url, timeoutMs) {
    return new Promise((resolve, reject) => {
      let done = false;
      const c = root.mqtt.connect(url, {
        clientId: 'howl_' + rid(12), clean: true, protocolVersion: 4, keepalive: 25,
        connectTimeout: timeoutMs, reconnectPeriod: 2000, resubscribe: true,
      });
      const timer = setTimeout(() => { if (!done) { done = true; try { c.end(true); } catch (e) { /* closing anyway */ } reject(new Error('timeout')); } }, timeoutMs + 300);
      c.once('connect', () => { if (done) return; done = true; clearTimeout(timer); resolve(c); });
    });
  }

  function Link(client, code, relayIndex) {
    const base = PREFIX + code + '/';
    const handlers = new Map(), statusFns = new Set();
    let online = true;
    client.on('message', (topic, payload) => {
      const fn = handlers.get(topic);
      if (!fn) return;
      let data = null;
      try { data = payload && payload.length ? JSON.parse(new TextDecoder().decode(payload)) : null; } catch (e) { return; }
      fn(data, topic);
    });
    const setOnline = v => { if (v !== online) { online = v; statusFns.forEach(f => f(v)); } };
    client.on('connect', () => setOnline(true));
    client.on('offline', () => setOnline(false));
    client.on('close', () => setOnline(false));
    client.on('error', () => { /* mqtt.js reconnects by itself */ });
    return {
      code, relayIndex,
      online: () => online && client.connected,
      sub(name, fn) { handlers.set(base + name, fn); client.subscribe(base + name, { qos: 1 }); },
      unsub(name) { handlers.delete(base + name); client.unsubscribe(base + name); },
      pub(name, data, retain) {
        const body = data == null ? '' : JSON.stringify(data);
        client.publish(base + name, body, { qos: 1, retain: !!retain });
      },
      onStatus(fn) { statusFns.add(fn); return () => statusFns.delete(fn); },
      end() { handlers.clear(); statusFns.clear(); try { client.end(true); } catch (e) { /* already closed */ } },
    };
  }

  /* host: the first relay that answers */
  async function host(code, prefer) {
    const list = relays();
    const order = prefer != null && list[prefer] ? [prefer, ...list.keys()].filter((v, i, a) => a.indexOf(v) === i) : [...list.keys()];
    for (const i of order) {
      try { const c = await open(list[i], 6000); return Link(c, code, i); } catch (e) { /* try the next relay */ }
    }
    throw new Error('no-relay');
  }

  /* player: look for a live host on each relay in turn. onLook(i, total) reports progress. */
  async function find(code, prefer, onLook) {
    const list = relays();
    const order = prefer != null && list[prefer] ? [prefer, ...list.keys()].filter((v, i, a) => a.indexOf(v) === i) : [...list.keys()];
    let reached = 0;
    for (const i of order) {
      if (onLook) onLook(i, list.length);
      let c;
      try { c = await open(list[i], 6000); } catch (e) { continue; }
      reached++;
      const link = Link(c, code, i);
      const found = await new Promise(resolve => {
        const t = setTimeout(() => resolve(false), 4500);
        link.sub('b', () => { clearTimeout(t); resolve(true); });
      });
      if (found) return link;
      link.end();
    }
    throw new Error(reached ? 'no-room' : 'no-relay');
  }

  root.NET = { host, find, rid };
})(self);
