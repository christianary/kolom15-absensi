import { database } from '../../lib/firebaseAdmin'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { data } = req.body
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Data tidak valid' })
      }
      await database.ref('attendance').set(data)
      res.status(200).json({ success: true })
    } catch (err) {
      console.error('Error saving attendance:', err)
      res.status(500).json({ error: 'Gagal menyimpan data' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
