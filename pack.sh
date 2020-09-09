zip -r watch_display.zip * --exclude pack.sh --exclude LICENSE --exclude README.md


#### Notes to self
#
# curl -s 'https://www.purpleair.com/json?key=03X8EZQJUG765XQZ&show=37697' | jq '.results|.[0]|.PM2_5Value'
# or:
# node -e "x = $(curl -s 'https://www.purpleair.com/json?key=03X8EZQJUG765XQZ&show=37697'); console.log(x.results[0].PM2_5Value)"
#
# to recompile schema after changes:
# glib-compile-schemas schemas/
#
# to disable extension:
# gnome-shell-extension-tool -d watch_display@christian.fritz.gmail.com
#
# use -e to enable
#
# changes require to restart the shell (alt+f2, r)
#
# watch journalctl -f /usr/bin/gnome-shell to see errors;
# often it's easier to run
# gnome-shell-extension-tool -d watch_display@christian.fritz.gmail.com
# after reloading the shell, to only see errors from this extension


# /home/cfritz/common/watch/index.js
