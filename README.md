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
In order to build, you must have the following dependencies installed on your system:

- `handlebars`
- `browserify`

### Running the build script ###
Simply run the shell script `build` in the root directory to build the project. This script will package the files in the `src` directory by running another script. Depending on how your system is set up, you may have to manually run the `build` script in the `src` directory.