import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await kv.get('kolom15_attendance')
      res.status(200).json({ data: data || {} })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Gagal mengambil data' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
