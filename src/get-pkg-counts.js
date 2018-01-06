import fs from 'fs-extra'

export default async dir => {
	try {
		const modArr = await fs.readdir(`${dir}/node_modules`)
		return modArr.length
	} catch (err) {
		return 0
	}
}
