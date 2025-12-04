import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const user = await auth.login(req.body);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ error: 'Login failed' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await auth.logout(req.body);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Logout failed' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}