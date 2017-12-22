# RxRelayJS
RxRelayJS is a TS/JS implementation of [Jake Wharton's RxRelay](https://github.com/JakeWharton/RxRelay). `Relay` types are analogous to `Subject` types, but without the ability to call `complete()` or `error()`. Therefore, they are _stateless_ in the sense that they cannot enter a terminal state. 

The most common usecase of `Subject` is to bridge between non-reactive APIs and reactive APIs. Typically, you do not want these bridges to enter any terminal state. The `Relay` types remove the possibility of this accidentally occuring.

## Installation
Via NPM:
```sh
npm install rxrelayjs
```

Note: The `rxjs` package is listed as a required peerDependency.

## Usage
RxRelayJS contains `Relay` types for each `Subject` type:
1. `Relay`
2. `BehaviorRelay`
3. `ReplayRelay`

There is no `AsyncRelay` because the `Relay` type does not support the terminal state.

### Relay
Emits all subsequent events to observers once they have subscribed.

```js
var relay = new Relay();

relay.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

relay.next(1);
relay.next(2);

relay.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

relay.next(3);

```

Console output:
```none
observerA: 1
observerA: 2
observerA: 3
observerB: 3
```

### BehaviorRelay
Emits the most recent observed event and all subsequent events to observers once they have subscribed.

```js
var relay = new BehaviorRelay();

relay.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

relay.next(1);
relay.next(2);

relay.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

relay.next(3);
```

Console output:

```none
observerA: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
```

### ReplayRelay
Emits all previously observed and subsequent events to observers once they have subscribed.

```js
var relay = new ReplayRelay();

relay.subscribe({
  next: (v) => console.log('observerA: ' + v)
});

relay.next(1);
relay.next(2);

relay.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

relay.next(3);
```

Console output:
```none
observerA: 1
observerA: 2
observerB: 1
observerB: 2
observerA: 3
observerB: 3
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

**Commit messages should follow the [conventional-changelog-standard](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md).** (the same used by [RxJS](https://github.com/ReactiveX/rxjs))

e.g.

```
fix(imports): No longer automatically imports all of rxjs, respecting your bundle size strategy (e.g. if you use operator patching or `.pipe()`)

Closes #123
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.