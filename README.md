# v3-workbench

## Storybook
```
npm run storybook -- --ci
```

## Project setup
```
npm install
```

## Use specified node version (recommended, requires [nvm](https://github.com/nvm-sh/nvm))
```
nvm use
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Authentication
currently credentials need to be set in localstorage
```
localStorage.setItem('USER', '[user]')
localStorage.setItem('ORGANIZATION', 'V3')
localStorage.setItem('JWT', '[token]')
location.reload()
```