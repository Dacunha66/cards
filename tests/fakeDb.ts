// In-memory stand-in for the platform card database, with the same admin-only write rule.
import type { CollectionRef, Db, DocSnap } from '../src/game/cardStore';

export function fakeDb(opts: { admin: boolean } = { admin: true }) {
  const store = new Map<string, Record<string, unknown>>();
  const listeners = new Set<() => void>();
  const snap = (id: string): DocSnap => ({ id, exists: store.has(id), data: () => (store.has(id) ? structuredClone(store.get(id)) : undefined) });
  const notify = () => listeners.forEach((l) => l());
  const denied = () => Promise.reject({ code: 'invalid_argument', message: 'write below minimum level' });
  const col: CollectionRef = {
    doc: (id = Math.random().toString(36).slice(2)) => ({
      get: async () => snap(id),
      set: async (data) => {
        if (!opts.admin) return denied();
        store.set(id, structuredClone(data));
        notify();
      },
      delete: async () => {
        if (!opts.admin) return denied();
        store.delete(id);
        notify();
      },
    }),
    get: async () => ({ docs: [...store.keys()].sort().map(snap) }),
    onSnapshot: (next) => {
      const l = () => next({ docs: [...store.keys()].sort().map(snap) });
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
  };
  const db: Db = { collection: (path) => {
    if (path !== 'cards') throw new Error('unexpected collection ' + path);
    return col;
  } };
  return { db, store };
}
