# Pixelosion Demo 

This project is basically an optimization of [Frank's](https://www.youtube.com/c/Frankslaboratory) neat [Images into Particles](https://codepen.io/franksLaboratory/pen/dyYGMwQ)
fireworks effect [demo](https://codepen.io/franksLaboratory/pen/dyYGMwQ) so that it can support larger images more efficiently.

Basically it adds an overlay canvas so that all of the inactive particles can pre-rendered to it once. In effect, this means many multiple draw calls are replaced by a single operation.

If you want just play around with the sample, a live demo is hosted here: https://pixelosion.surge.sh

The default particle size is 2 but you can modify that with a *particleSize* URL param:

```
Examples:
https://pixelosion.surge.sh?particleSize=1
https://pixelosion.surge.sh?particleSize=4
https://pixelosion.surge.sh?particleSize=8
```


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

