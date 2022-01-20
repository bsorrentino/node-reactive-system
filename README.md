## Experiment on developing a Reactive System in Nodejs

Idea is to provide an **Event-Driven Application Framework** to develop a **Reactive System** on top of Nodejs, having as back bones an **Event Bus** based on [RxJS](https://rxjs-dev.firebaseapp.com/guide/overview) and a simple and flexible **Modules System** to develop complex and scalable backend services.


### Build project

1. Ensure to have **nodejs** version `>=12.20.x`
1. install base dependencies
    ```
    npm install
    ```
1. prepare & build lerna project
    ```
    npx lerna clean
    npx lerna bootstap
    ```
1. start sample
    ```
    npx lerna run start --scope=rxbus-sample --stream
    ```
