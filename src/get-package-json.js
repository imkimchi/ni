import fs from 'fs-extra'

export default async dir => (await fs.readJSON(`${dir}/package.json`)).dependencies
