"use strict";

define([
    "Meddler/EventDispatcher/EventAggregator",
    "Meddler/Gamepad/GamepadStateMonitor"
], function (EventAggregator, GamepadStateMonitor) {

    /**
     * @auguments Meddler/EventDispatcher/EventAggregator
     * @borrows GamepadStateMonitor#getSupportedEvents as GamepadStateMonitorAggregator#getSupportedEvents
     * @constructor Meddler/Gamepad/GamepadStateMonitor
     */
    function GamepadStateMonitorAggregator () {
        EventAggregator.call(this);
    };
    GamepadStateMonitorAggregator.prototype = Object.create(EventAggregator.prototype);

    /**
     * @return {void}
     */
    GamepadStateMonitorAggregator.prototype.getSupportedEvents = GamepadStateMonitor.prototype.getSupportedEvents;

    /**
     * @param {Gamepad} gamepad
     * @return {null|Meddler/Gamepad/GamepadStateMonitor}
     */
    GamepadStateMonitorAggregator.prototype.findByGamepad = function (gamepad) {
        var i;

        for (i = 0; i < this.items.length; i += 1) {
            if (gamepad === this.items[i].gamepad) {
                return this.items[i];
            }
        }
    };

    /**
     * @param {Meddler/Gamepad/GamepadStateMonitor} gamepadStateMonitor
     * @return {bool}
     */
    GamepadStateMonitorAggregator.prototype.isItemAllowed = function (gamepadStateMonitor) {
        return gamepadStateMonitor instanceof GamepadStateMonitor;
    };

    return GamepadStateMonitorAggregator;

});
