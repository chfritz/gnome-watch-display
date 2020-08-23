'use strict';

const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;

// https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing#Creating_the_Extension
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

let indicator;

// https://github.com/murat-cileli/gnome-shell-extension-shell-clock/blob/master/convenience.js
function byteArrayToString(array) {
  return array instanceof Uint8Array ? ByteArray.toString(array) : array;
}

const mylog = (...args) => {
  args.unshift(Me.metadata.name);
  log(...args);
};


let CMD = 'date';
let interval_seconds = 3;

const ExampleIndicator = class ExampleIndicator extends PanelMenu.Button {

  _monitor() {
    // mylog('running command', CMD);
    // https://gjs-docs.gnome.org/glib20~2.64.1/glib.spawn_async
    const res = GLib.spawn_command_line_sync(`bash -c "${CMD}"`);
    const resText = byteArrayToString(res[1])
        .toString()
        .split('\n')
        .filter(line => line != '')
        .join('; ');
    this.label.set_text(resText);

    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
        interval_seconds * 1e3, this._monitor.bind(this));
  }

  reloadSetting() {
    mylog('reloading settings');
    CMD = this.settings.get_string('command');
    interval_seconds = this.settings.get_int('refresh-interval') || 1;
  }

  restartMonitor() {
    this.reloadSetting();

    mylog('restarting monitor');
    this.stopTimer();
    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
        interval_seconds * 1e3, this._monitor.bind(this));
  }

  stopTimer() {
    this.timer && GLib.source_remove(this.timer);
  }

  _init() {
    mylog('init');

    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    // Get the GSchema source so we can lookup our settings
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
      Me.dir.get_child('schemas').get_path(),
      Gio.SettingsSchemaSource.get_default(),
      false
    );

    this.settings = new Gio.Settings({
      settings_schema: gschema.lookup('org.gnome.shell.extensions.watchdisplay', true)
    });

    // Watch the settings for changes
    this._onCommandChangedId = this.settings.connect(
      'changed::command', this.restartMonitor.bind(this));
    this._onIntervalChangedId = this.settings.connect(
      'changed::refresh-interval', this.restartMonitor.bind(this));

    // https://gjs-docs.gnome.org/st10~1.0_api/st.label
    this.label = new St.Label({
      text: 'waiting..',
      style_class: 'watchdisplay-label'
    });
    this.actor.add_child(this.label);

    this.reloadSetting();
    this._monitor();
  }
};

function init() {
  mylog('started');
}

function enable() {
  indicator = new ExampleIndicator();
  Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
  indicator.stopTimer();
  indicator.destroy();
}
