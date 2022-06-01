const { parse } = require('../utils/error')
const { createApiRoute } = require('../utils/app')
const formidable = require('formidable')
const uploadService = require('../services/upload')

const { saveFile } = uploadService()

const filesController = () => ({
	post: async (req, res, next) => {
		try {
			const form = formidable({ multiples: false })

			form.parse(req, async (err, fields, { file }) => {
				if (err) throw err
				await saveFile(file, `${fields.year}`)
				res.status(200).send({ message: 'Operação realizadao com sucesso' })
			})
		} catch (e) {
			console.error(e)
			next(parse(e))
		}
	}
})

module.exports = {
	mapRoutes: server => {
		const { post } = filesController()

		server.route(createApiRoute('upload'))
			.post(post)
	}
}