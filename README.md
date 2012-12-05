# composer

The goal here is to teach a computer how to generate music through some form of
supervised machine learning.

There isn't a whole lot here at the moment, look at [TODO.md][TODO] if you
are interested in what's down the road.

You can find the latest version on Heroku at: <http://mcmire-composer.heroku.com>


## Architecture

* node.js / [Express][express] to serve files and provide backend logic
* MongoDB as the "brain" (i.e. persistent data store)
* [Ender.js][ender] (domReady, Valentine, Qwery, Bean, Bonzo, Reqwest) on the
  front end for DOM selection/interaction/manipulation and utility methods
* Very simple techniques for sharing code between server and browser
* [Web Audio API][web-audio-api] to play the audio samples


## Running it locally

First install the essentials:

* node.js: `brew install nodejs`
* MongoDB: `brew install mongodb`

Next, clone this repo:

    git clone http://github.com/mcmire/composer

Then cd into the 'composer' directory just created and run:

    make setup

This will install the npm dependencies necessary to run this app.

Now say:

    make start

This will ensure that MongoDB is started, and then start the web server.

Now go to http://localhost:5000 in your browser.


## Notes on code style

In my day to day I write CoffeeScript, and I have used it heavily in the past,
too (see [rpg][], [sprite-editor][], etc.). I actually really like CoffeeScript
-- concise syntax, array comprehensions, etc. But there are improvements I would
like to see in CoffeeScript that will never happen because of the limitations of
JavaScript, and ultimately this is a showstopper for me.

So I going back to JavaScript in this app, but this time I am experimenting with
a different code style:

* Comma-first (npm) style. I know -- it looks retarded. But I've read the
  article that Isaac wrote and I actually agree with his points. It actually
  works pretty well.
* Hoist all of the variable definitions within a scope to the very top
  (constants go first, then defaults, then emptys, then methods). Define methods
  as locals, then expose them at the bottom explicitly. This goes for classes
  too.
* Actually make real private properties/methods, none of this fake `this._foo`
  crap. For classes, it's okay to define private functions inside of your
  constructor -- optimization shoptimization.
* Initially I thought Thou Shalt Always Use Curlies for If Statements, but I've
  slacked on that rule. I am not going to go as far as @ded and @fat, but on the
  other hand, we've got shorter ways of writing conditions, we might as well use
  some of them.

So this ends up being kind of similar to @dedfat style, with the exception
that I am not so concerned with sacrificing readability in favor of compactness.


## Author/Copyright

(c) 2012 Elliot Winkler (<elliot.winkler@gmail.com>)


## License/Support

You are free to use any code here as you like, whether for commercial
or personal purposes.

As this is a personal project, I do not provide any support or warranty.


[TODO]: TODO.md
[express]: http://expressjs.com/
[ender]: http://ender.jit.su/
[hem]: https://github.com/maccman/hem
[web-audio-api]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
[rpg]: http://github.com/mcmire/rpg
[sprite-editor]: http://github.com/mcmire/sprite-editor


