# composer

The goal here is to teach a computer how to generate music through some form of
supervised machine learning.

There isn't a whole lot here at the moment, look at the TODO if you are
interested in what's down the road.


## Prerequisites

You will need:

* node.js
* MongoDB

First, install node.js. If you are on OS X, run:

    brew install nodejs

Next, install MongoDB. Again, on OS X:

    brew install mongodb


## Bootstrapping

Next, clone this repo:

    git clone http://github.com/mcmire/composer

Then cd into the 'composer' directory just created and run:

    npm install

This will install the npm packages necessary to run this app, within a
local node_modules directory.


## Running the app

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

