'use strict'

/**
 * adonis-logger
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class LoggerProvider extends ServiceProvider {
  boot () {
    const env = use('Adonis/Src/Config').get('app.http.loggerEnv')
    const ignoredUrls = use('Adonis/Src/Config').get('app.http.ignoredUrls')

    /**
     * Hook only when enabled for current NODE_ENV
     */
    if (!Array.isArray(env) || env.indexOf(process.env.NODE_ENV) > -1) {
      const HttpContext = use('Adonis/Src/HttpContext')
      const AdonisLogger = use('Adonis/Src/Logger')
      const Logger = require('../src/Logger')

      HttpContext.onReady(function (ctx) {
        if (!ignoredUrls.includes(ctx.request.url())) {
          const logger = new Logger(ctx, AdonisLogger)
          logger.hook()
        }
      })
    }
  }
}

module.exports = LoggerProvider
