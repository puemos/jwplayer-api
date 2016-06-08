# jwplayer-api [![Build Status](https://travis-ci.org/babel/gulp-babel.svg?branch=master)](https://travis-ci.org/babel/gulp-babel)

> A warpper for jwplayer platform api



## Install

```
$ npm install --save-dev jwplayer-api
```


## Usage

```js
'use strict';

const
	axios = require("axios"),
	jwplayerUrlGeneretor = require('jwplayer-api');



var api = new jwplayerUrlGeneretor({
	key: 'myKey',
	secret: 'mySecret'
});

/**/



module.exports = {

	getUploadUrl: (params) => {
		return api.getUploadUrl(params);
	},

	delete: (video_key) => {
		return api.delete(video_key);
	},

	getVideoDetails: (video_key) => {
		return axios({
				method: 'get',
				url: api.generateUrl('v1/videos/show', {
					video_key
				})

			})
			.then((res) => {
				return res.data;
			});
	},

	conversionCreate: (video_key, template_key) => {
		return api.conversionCreate(video_key, template_key);
	}

};
```

## License

MIT © Shy Alter
