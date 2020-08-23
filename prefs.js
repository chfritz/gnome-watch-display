'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {

  // Copy the same GSettings code from `extension.js`
  let gschema = Gio.SettingsSchemaSource.new_from_directory(
    Me.dir.get_child('schemas').get_path(),
    Gio.SettingsSchemaSource.get_default(),
    false
  );

  this.settings = new Gio.Settings({
    settings_schema: gschema.lookup('org.gnome.shell.extensions.watchdisplay', true)
  });

  // Create a parent widget that we'll return from this function
  let prefsWidget = new Gtk.Grid({
    margin: 18,
    column_spacing: 12,
    row_spacing: 12,
  });

  // Add a simple title and add it to the prefsWidget
  let title = new Gtk.Label({
    label: '<b>' + Me.metadata.name + ' Extension Preferences</b>',
    halign: Gtk.Align.START,
    use_markup: true,
  });
  prefsWidget.attach(title, 0, 0, 2, 1);


  const labelCmd = new Gtk.Label({
    label: "Shell command to execute",
    hexpand: false,
    halign: Gtk.Align.START,
  });
  prefsWidget.attach(labelCmd, 0, 1, 1, 1);

  // See attributes at https://gjs-docs.gnome.org/gtk40~4.0_api/gtk.entry
  const entryCmd = new Gtk.Entry({
    halign: Gtk.Align.START,
    text: this.settings.get_string('command'),
    'width-chars': 100
  });
  entryCmd.set_sensitive(true);
  entryCmd.connect('changed', Lang.bind(this, function (w) {
      this.settings.set_string('command', w.get_text());
  }));
  prefsWidget.attach(entryCmd, 0, 2, 2, 2);


  const labelInterval = new Gtk.Label({
    label: "Refresh interval in seconds",
    hexpand: false,
    halign: Gtk.Align.START,
  });
  prefsWidget.attach(labelInterval, 0, 4, 1, 1);

  const spinInterval = Gtk.SpinButton.new_with_range(0, 60 * 60 * 24, 1);
  spinInterval.value = this.settings.get_int("refresh-interval");
  spinInterval.connect("value_changed", Lang.bind(this, () => {
    this.settings.set_int("refresh-interval", spinInterval.value);
  }))
  prefsWidget.attach(spinInterval, 1, 4, 1, 1);

  prefsWidget.attach(new Gtk.Label({
      label: "<i>Changes take effect immediately but each change (keystroke) resets the timer.</i>",
      hexpand: false,
      halign: Gtk.Align.START,
      use_markup: true,
    }), 0, 5, 1, 1);

  prefsWidget.show_all();

  // Return our widget which will be added to the window
  return prefsWidget;
}
