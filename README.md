## This project is currently dead.
The platforms on which this project was built on (Chrome Apps and Mobile Chrome Apps) have, sadly, been phased out.
This repo will stay up as reference for anyone that wants to try to do something similar.

# PocketFurc #
PocketFurc is a discreet, light-weight Furcadia (http://www.furcadia.com) chat client written for Chrome.
As such, it runs anywhere Chrome runs.

You can install it from the Chrome Web Store at https://chrome.google.com/webstore/detail/pocketfurc/iomohjfkcfobogchbemlalanocaiedel

It's also available for Android 4.4+ devices: https://play.google.com/store/apps/details?id=com.pocketfurc.client

![screenshot](http://i.imgur.com/VQh22qi.png)

You must have a character already registered with the game in order to log in.
You will appear wherever you last logged off with whatever colors and description you last had in-game.

PocketFurc NOT a graphical client. Some sort of visualization is planned as a long-term goal, but don't expect it to come around any time soon. Ideally, you'll have situated your character in a convenient location prior to logging in, or at least have someone to lead or summon you around.

Basic features currently include:
- Chat (speech, whisper, emotes, raw commands)
- Nearby players list.
- Interactive player names.
- HTML chat support.
- Friends list.

## Building ##

### Dependencies ###
In order to build the chrome app, you should have the following npm dependencies installed on your system:

- `handlebars`
- `browserify`

Building the Android app will require the [Mobile Chrome Apps](https://github.com/MobileChromeApps/mobile-chrome-apps) npm module, `cca`, and the
relevant Android SDKs.

### Running the build script ###
Simply run the shell script `build` in the root directory to build the chrome app. This script will package the files in the `src` directory by running another script. Running the `build` script located inside the `src` directory will build an unpackaged chrome app therein suitable for use in development mode.
