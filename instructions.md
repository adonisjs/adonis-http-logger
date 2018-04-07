## Register provider

Register the provider inside `start/app.js` file.

```js
const providers = [
  '@adonisjs/http-logger/providers/LoggerProvider'
]
```

That's all :)

## Optional Config
There is only one config setting, that is to define the environments in which the logger should run.

You have to modify the existing `config/app.js` file and the following setting.

```js
module.exports = {
  http: {
    loggerEnv: ['development', 'production']
  }
}
```
