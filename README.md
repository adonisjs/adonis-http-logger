# Adonis Http Logger
> Add-on to log your Http requests using Adonis inbuilt logger.

![](https://res.cloudinary.com/adonisjs/image/upload/q_100/v1523126720/Adonis%20Logger.png)

## Setup
Start by installing it from npm.

```bash
adonis install @adonisjs/http-logger

# yarn
adonis install @adonisjs/http-logger --yarn
```

## Register provider
Register the provider inside `start/app.js` file.

```js
const providers = [
  '@adonisjs/http-logger/providers/LoggerProvider'
]
```

That's all :)

## Config
There is only one config setting, that is to define the environments in which the logger should run.

You have to modify the existing `config/app.js` file and the following setting.

```js
module.exports = {
  http: {
    loggerEnv: ['development', 'production']
  }
}
```

By default, it will log in every environment.

## Sane defaults
This module will internally make use of AdonisJs `Logger` provider, which means it will log messages using the default driver.

When `json:true` config is set. It will log request properties as a JSON object, so that you can easily query over them.

Check the following screenshot when `json=true` and logs are sent to **Loggly**.

![](http://res.cloudinary.com/adonisjs/image/upload/v1523126728/adonis-logger-loggly.png)
