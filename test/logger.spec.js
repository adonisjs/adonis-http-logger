'use strict'

/**
 * adonis-logger
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const supertest = require('supertest')
const http = require('http')
const Logger = require('../src/Logger')

const getAdLogger = function () {
  return {
    messages: {
      info: [],
      error: [],
      warning: []
    },
    driver: {
      config: {
        json: true
      }
    },
    info (...args) {
      this.messages.info.push(...args)
    },
    warning (...args) {
      this.messages.warning.push(...args)
    },
    error (...args) {
      this.messages.error.push(...args)
    }
  }
}

test.group('Logger', (group) => {
  test('hook into http response end event and log request', async (assert) => {
    const adLogger = getAdLogger()
    const server = http.createServer((req, res) => {
      const request = {
        method: () => req.method,
        originalUrl: () => req.url
      }

      const response = {
        response: res
      }

      const logger = new Logger({ request, response }, adLogger)
      logger.hook()

      setTimeout(() => {
        res.end()
      }, 200)
    })

    await supertest(server).get('/')
    assert.equal(adLogger.messages.info[0], 'http request')
    assert.equal(adLogger.messages.info[1].url, '/')
    assert.equal(adLogger.messages.info[1].method, 'GET')
    assert.equal(adLogger.messages.info[1].statusCode, 200)
  })

  test('report as warning when status code in 400 family', async (assert) => {
    const adLogger = getAdLogger()
    const server = http.createServer((req, res) => {
      const request = {
        method: () => req.method,
        originalUrl: () => req.url
      }

      const response = {
        response: res
      }

      const logger = new Logger({ request, response }, adLogger)
      logger.hook()

      setTimeout(() => {
        res.writeHead(400)
        res.end()
      }, 200)
    })

    await supertest(server).get('/')
    assert.equal(adLogger.messages.warning[0], 'http request')
    assert.equal(adLogger.messages.warning[1].url, '/')
    assert.equal(adLogger.messages.warning[1].method, 'GET')
    assert.equal(adLogger.messages.warning[1].statusCode, 400)
  })

  test('report as error when status code in 500 family', async (assert) => {
    const adLogger = getAdLogger()
    const server = http.createServer((req, res) => {
      const request = {
        method: () => req.method,
        originalUrl: () => req.url
      }

      const response = {
        response: res
      }

      const logger = new Logger({ request, response }, adLogger)
      logger.hook()

      setTimeout(() => {
        res.writeHead(500)
        res.end()
      }, 200)
    })

    await supertest(server).get('/')
    assert.equal(adLogger.messages.error[0], 'http request')
    assert.equal(adLogger.messages.error[1].url, '/')
    assert.equal(adLogger.messages.error[1].method, 'GET')
    assert.equal(adLogger.messages.error[1].statusCode, 500)
  })

  test('do not mix with other concurrent requests', async (assert) => {
    const adLogger = getAdLogger()

    function waitAndWrite (timeout, statusCode, res) {
      setTimeout(() => {
        res.writeHead(statusCode)
        res.end()
      }, timeout)
    }

    const server = http.createServer((req, res) => {
      const request = {
        method: () => req.method,
        originalUrl: () => req.url
      }

      const response = {
        response: res
      }

      const logger = new Logger({ request, response }, adLogger)
      logger.hook()

      const timeout = req.url === '/' ? 400 : 200
      const statusCode = req.url === '/' ? 400 : 201
      waitAndWrite(timeout, statusCode, res)
    })

    await Promise.all([supertest(server).get('/'), supertest(server).get('/info')])

    assert.equal(adLogger.messages.info[0], 'http request')
    assert.equal(adLogger.messages.info[1].url, '/info')
    assert.equal(adLogger.messages.info[1].method, 'GET')
    assert.equal(adLogger.messages.info[1].statusCode, 201)

    assert.equal(adLogger.messages.warning[0], 'http request')
    assert.equal(adLogger.messages.warning[1].url, '/')
    assert.equal(adLogger.messages.warning[1].method, 'GET')
    assert.equal(adLogger.messages.warning[1].statusCode, 400)
  })

  test('write as raw string when json is false', async (assert) => {
    const adLogger = getAdLogger()
    adLogger.driver.config.json = false

    const server = http.createServer((req, res) => {
      const request = {
        method: () => req.method,
        originalUrl: () => req.url
      }

      const response = {
        response: res
      }

      const logger = new Logger({ request, response }, adLogger)
      logger.hook()

      setTimeout(() => {
        res.end()
      }, 200)
    })

    await supertest(server).get('/test?query=OK')
    assert.equal(adLogger.messages.info[0], '%s | %s %s %s %s')
    assert.equal(adLogger.messages.info[2], 'GET')
    assert.equal(adLogger.messages.info[3], 200)
    assert.equal(adLogger.messages.info[4], '/test?query=OK')
  })
})
