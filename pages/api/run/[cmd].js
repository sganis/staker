export default function handler(req, res) {
    const { cmd } = req.query
    res.end(`cmd: ${cmd}`)
    //res.status(200).json({ name: 'John Doe' })
}