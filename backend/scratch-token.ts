import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '.env') })
import { prisma } from './src/config/db'
import { signAccessToken } from './src/utils/jwt'

async function main() {
  const user = await prisma.user.findUnique({ where: { phone: '9812345678' }, include: { provider: true } })
  if (!user || !user.provider) throw new Error('not found')
  const token = signAccessToken({ id: user.id, role: 'PROVIDER', providerId: user.provider.id })
  console.log(JSON.stringify({ id: user.id, name: user.name, phone: user.phone, role: user.role, token }))
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
