import request from 'request-promise'
import validator from 'email-validator'

export default async (req, res) => {
  if (req.body.email && validator.validate(req.body.email)) {
    try {
      await request({
        url:
          'https://discordapp.com/api/webhooks/729430684824895498/5k6YM4pMlrPkKaWKzVTzEoeU2RBsAMhL-WVICqgPTQDQLAi2vC1IGksJ8pYizITdpERL',
        method: 'post',
        json: {
          content: `New registration: ${req.body.email}`,
        },
      })
      res.statusCode = 200
      res.end()
    } catch (err) {
      res.statusCode = 500
      res.end()
    }
  } else {
    res.statusCode = 400
    res.end()
  }
}
