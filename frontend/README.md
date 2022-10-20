# Frontend


Bootstrapped with [create-react-app](https://www.npmjs.com/package/create-react-app).
A [leaflet](https://leafletjs.com/) app with a [plotly](https://plotly.com/) windrose and [grommet](https://v2.grommet.io/) components.

- [CRA_README.md](./CRA_README.md) original create-react-app README
- [package.json](./package.json) for commands

From the backend I get data points which cover 1°-lat x 1°-lng.
So, that's the smallest area I can use for showing winds.
This is shown to the user with a rectangle.
As the user zooms out, the area is increased.
At the equator the smallest rectangle is 3600M^2 big and is layed out
at -0.5° to +0.5° lat-lng from where the user clicked.
Further away from the equator meridians move closer together.
I compensate for that when drawing the rectangle with factor _cos(lat)_.

Currently got [this problem](https://stackoverflow.com/questions/69394632/webpack-build-failing-with-err-ossl-evp-unsupported), so:

```
NODE_OPTIONS=--openssl-legacy-provider yarn start
```

## Deploy

Currently trying out [cloudflare pages](https://pages.cloudflare.com/) for deployment.
I followed the [getting startet tutorial](https://developers.cloudflare.com/pages/getting-started#adding-a-custom-domain)
almost exactly:

1. Connect github account to cloudflare pages
2. Configured the deployment (I used `/frontend` as root dir and `yarn build` as build command and set environment variable `NODE_VERSION=16.15.0`)
3. Run first deploy (>4min)
4. Add custom domains (prevailing-winds.de, www.prevailing-winds.de). Will enter CNAMEs automatically.
5. Set TLS policy to _strict_
