# composer

The goal here is to teach a computer how to generate music through some form of
supervised machine learning.

There isn't a whole lot here at the moment, look at [TODO.md](TODO.md) if you
are interested in what's down the road.

You can find the latest version on Heroku at: <http://mcmire-composer.heroku.com>


## Architecture

* node.js / [Express](http://expressjs.com/) to serve files and provide backend
  logic
* MongoDB as the "brain" (i.e. persistent data store)
* [Ender.js](http://ender.jit.su/) (domReady, Valentine, Qwery, Bean, Bonzo,
  Reqwest) on the front end for DOM selection/interaction/manipulation and
  utility methods
* [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
  to play the audio samples


## Code style

As most of the app is JavaScript, I am experimenting with a different code style
in this project:

* No CoffeeScript this time around. I like CoffeeScript, but it's really
  lipstick on a pig if you think about it. You're still going to have to deal
  with JavaScript at some point, and is writing JavaScript really *that*
  painful?
* Comma-first (npm) style. I know -- it looks retarded. It actually works
  pretty well, though.
* Hoist all of the variable definitions within a scope to the very top
  (constants go first, then defaults, then emptys, then methods). Define methods
  as locals, then expose them at the bottom explicitly. This goes for classes
  too.
* Actually make real private properties/methods, none of this fake this._foo
  crap. For classes, it's okay to define private functions inside of your
  constructor -- optimization shoptimization.
* Initially I thought Thou Shalt Always Use Curlies for If Statements, but I've
  slacked on that rule. I am not going to go as far as @ded and @fat, but on the
  other hand, we've got shorter ways of writing conditions, we might as well use
  some of them.


## Running it locally

First install the essentials:

* node.js: `brew install nodejs`
* MongoDB: `brew install mongodb`

Next, clone this repo:

    git clone http://github.com/mcmire/composer

Then cd into the 'composer' directory just created and run:

    npm install

This will install the npm packages necessary to run this app, within a
local node_modules directory.

If MongoDB is not running yet, run:

    make mongo

To run the app, say:

    make server

Now go to http://localhost:5010 in your browser.


## Author/Copyright

(c) 2012 Elliot Winkler (<elliot.winkler@gmail.com>)


## License/Support

You are free to use any code here as you like, whether for commercial
or personal purposes.

As this is a personal project, I do not provide any support or warranty.


