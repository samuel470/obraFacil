const KEY = 'obrafacil-offline-queue'

export function enqueue(item) {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]')
  q.push(item)
  localStorage.setItem(KEY, JSON.stringify(q))
}

export async function flushQueue(sender) {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]')
  const keep = []
  for (const item of q) {
    try { await sender(item) } catch { keep.push(item) }
  }
  localStorage.setItem(KEY, JSON.stringify(keep))
}
