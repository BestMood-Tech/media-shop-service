# Настройкa окружения для запуска unit-tests.

1. Проверьте, что на вашем компьютере установлена JRE. Проверить это можно с помощью комманды `java -version`.

2. Удостовериться, что стоит Node.js версии >=6.10.1 и <7.x.x.

3. Запусть `npm i`.

4. Глобально установить [mocha](https://github.com/mochajs/mocha), [chai](https://github.com/chaijs/chai), [ts-node](https://github.com/TypeStrong/ts-node), [typings](https://github.com/typings/typings) с помощью комманды `npm install mocha chai ts-node typings -g`.

5. Установим определения типов с помощью комманды `typings install dt~mocha --global --save` и `typings install npm~chai --save`

# Запуск serverless-offline и тестирования

1. С помощью команды `sls dynamodb install` следует установить локально базу данных.

2. Запускаем serverless-offline с помощью команды `sls offline start`. Автоматически будут запущены БД, S3 и serverless-offline.

3. С помощью комманды `npm test` будут запущены unit тесты и предоставлен отчет о покрытии кода тестами.

# Руководство для написания тестов

- Перед запуском всех тестов необходимо определить переменне, которые хрянатся в процессе Node, например,
```
process.env.USERS_TABLE = 'bmt-media-shop-service-users';
```
- Так как тестирование AWS функций является ассинхронным, то следует в теле теста возвращать объект lambda-tester, например,
```
it(`my first test`, () => {
    return lambdaTester(myFunc)
            .event(...)
});
```
- В данному случае ожидается, что функция сработает как надо и вернется результат, в теле которого проверяются те, или иные значение/свойства/поля объекта/переменной, использую `expect`, `assert` or `should`.
```
return lambdaTester(myFunc)
            .event(...)
            .expectResult();
```

- В данному случае ожидается, что функция сработает с ошибкой и ожидается именно она, благодаря `.expectError`, в теле которого проверяются те, или иные значение/свойства/поля объекта/переменной, использую `expect`, `assert` or `should`.
```
return lambdaTester(myFunc)
            .event(...)
            .expectError();
```

## Покрытие тестами

- Чтобы тесты прошли, необходимо, чтобы тесты покрывали минимум 85% кода, функций и различных ответвлений, при использовании оператора `if else` или тернарного оператора `условие ? выражение1 : выражение2`

# Использованные пакеты для написания тестов

- [serverless-offline](https://github.com/dherault/serverless-offline)
- [serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
- [serverless-s3-local](https://github.com/ar90n/serverless-s3-local)
- [lambda-tester](https://github.com/vandium-io/lambda-tester)
- [istanbuljs](https://github.com/istanbuljs/istanbuljs)
- [chai](https://github.com/chaijs/chai)

# Возможные проблемы

- данная ошибка возникает, если не установлена JRE, либо забыли установить БД локально - решается с помощью команды`sls dynamodb install`
```
events.js:160
      throw er; // Unhandled 'error' event
      ^
Error: spawn java ENOENT
```

- данная ошибка возникает, если работа serverless-offline была завершена не правильно и процеесс работы dynamoDB находится еще в памяти. Решается путем убивания процесса, который отвечает за работа dynamoDB-local.
```
WARN:oejuc.AbstractLifeCycle:FAILED SelectChannelConnector@0.0.0.0:8000:
java.net.BindException: Адрес уже используется
 ```

# Дополнительная литература

- Понимание, что такое ассинхронное тестирование и для чего нужен [done](https://lostechies.com/derickbailey/2012/08/17/asynchronous-unit-tests-with-mocha-promises-and-winjs/)
- Написание [unit тестов на TS](https://journal.artfuldev.com/write-tests-for-typescript-projects-with-mocha-and-chai-in-typescript-86e053bdb2b6)
- Примеры и написание [ассинхронного кода](https://mochajs.org/#asynchronous-code)
- Описание [assert, expect, should](http://chaijs.com/guide/styles/)