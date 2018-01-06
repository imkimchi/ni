import successMsg from './success'

export default async (deps, modsBeforeInstall, modsAfterInstall) => {
	if (modsBeforeInstall < modsAfterInstall) {
      // When successfully run initial npm install without unspecified deps
		successMsg(deps.length)
	} else {
      // Nothing updated
		console.log(`\nThere's no uninstalled dependencies 🙂`)
	}
}
