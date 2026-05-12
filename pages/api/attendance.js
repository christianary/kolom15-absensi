import { database } from '../../lib/firebaseAdmin'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await database.ref('attendance').get()
      const data = snapshot.val() || {}
      res.status(200).json({ data })
    } catch (err) {
      console.error('Error fetching attendance:', err)
      res.status(500).json({ error: 'Gagal mengambil data' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
