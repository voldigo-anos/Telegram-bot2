const fs = require("fs");
const os = require("os");
const nodePath = require("path");

// Dossier de la base : DB_DIR (ex. un volume persistant) sinon ./database/data.
// Si ce dossier n'est pas inscriptible (hebergeur sans droits d'ecriture), on se replie
// sur le dossier temporaire pour que le bot demarre quand meme (donnees non persistantes).
function getWritableDataDir() {
	const preferred = process.env.DB_DIR
		? nodePath.resolve(process.env.DB_DIR)
		: nodePath.join(__dirname, "..", "data");
	const candidates = [preferred, nodePath.join(os.tmpdir(), "grammchatbot-data")];
	for (const dir of candidates) {
		try {
			fs.mkdirSync(dir, { recursive: true });
			fs.accessSync(dir, fs.constants.W_OK);
			if (dir !== preferred)
				console.warn(`[SQLITE] ${preferred} is not writable. Using ${dir} instead: data will be lost on restart.`);
			return dir;
		}
		catch (_) { /* on essaie le dossier suivant */ }
	}
	return preferred;
}

module.exports = async function () {
	const { Sequelize } = require("sequelize");
	const path = nodePath.join(getWritableDataDir(), "data.sqlite");
	const sequelize = new Sequelize({
		dialect: "sqlite",
		storage: path,
		logging: false
	});

	const threadModel = require("../models/sqlite/thread.js")(sequelize);
	const userModel = require("../models/sqlite/user.js")(sequelize);
	const dashBoardModel = require("../models/sqlite/userDashBoard.js")(sequelize);
	const globalModel = require("../models/sqlite/global.js")(sequelize);

	await sequelize.sync({ force: false });

	return {
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		sequelize
	};
};