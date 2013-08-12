"use strict";

define([
    "Meddler/Canvas/module/timing",
    "Meddler/EventDispatcher/Event",
    "Meddler/EventDispatcher/EventDispatcher"
], function (timing, Event, EventDispatcher) {

    /**
     * @param {Meddler/Gamepad/GamepadStateMonitor} gamepadStateMonitor
     * @param {Gamepad} gamepad
     * @return {void}
     */
    function pollForGamepadStateUpdates (gamepadStateMonitor, gamepad) {
        var pollingFunction,
            previousAxes,
            previousButtons;

        (pollingFunction = function () {
            if (navigator.webkitGetGamepads) {
                // somehow, without this hack, gamepad becomes less responsive
                gamepad = navigator.webkitGetGamepads()[gamepad.index];
            }

            if (!gamepad) {
                // gamepad might be disconnected in the meantime
                gamepadStateMonitor.stop();

                return;
            }

            // skip this frame
            if (previousAxes && previousButtons) {
                gamepadStateMonitor.updateGamepadStatus(gamepad, previousAxes, previousButtons);
            }

            previousAxes = Array.prototype.slice.call(gamepad.axes);
            previousButtons = Array.prototype.slice.call(gamepad.buttons);

            if (gamepadStateMonitor.isStarted) {
                timing.requestAnimationFrame(pollingFunction);
            }
        })();
    };

    /**
     * @auguments Meddler/EventDispatcher/EventDispatcher
     * @constructor
     * @param {Gamepad} gamepad
     */
    function GamepadStateMonitor (gamepad) {
        EventDispatcher.call(this);

        this.gamepad = gamepad;
        this.isStarted = false;
    };
    GamepadStateMonitor.prototype = Object.create(EventDispatcher.prototype);

    Object.defineProperty(GamepadStateMonitor, "EVENT_GAMEPAD_AXIS_MOVE", { value: "event.gamepad.axis.move" });
    Object.defineProperty(GamepadStateMonitor, "EVENT_GAMEPAD_BUTTON_DOWN", { value: "event.gamepad.button.down" });
    Object.defineProperty(GamepadStateMonitor, "EVENT_GAMEPAD_BUTTON_UP", { value: "event.gamepad.button.up" });

    /**
     * @return {array}
     */
    GamepadStateMonitor.prototype.getSupportedEvents = function () {
        return [
            GamepadStateMonitor.EVENT_GAMEPAD_AXIS_MOVE,
            GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_DOWN,
            GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_UP
        ];
    };

    /**
     * @param {Gamepad} gamepad
     * @param {int} axis
     * @param {float} currentOffset
     * @param {float} previousOffset
     * @return {void}
     */
    GamepadStateMonitor.prototype.processAxisMove = function (gamepad, axis, currentOffset, previousOffset) {
        this.dispatch(GamepadStateMonitor.EVENT_GAMEPAD_AXIS_MOVE, new Event({
            axis: axis,
            gamepad: gamepad,
            offset: currentOffset,
            previousOffset: previousOffset
        }));
    };

    /**
     * @param {Gamepad} gamepad
     * @param {int} button
     * @param {int} currentState
     * @param {int} previousState
     * @return {void}
     */
    GamepadStateMonitor.prototype.processButtonStateChange = function (gamepad, button, currentState, previousState) {
        var evt = new Event({ gamepad: gamepad, button: button });

        if (currentState) {
            this.dispatch(GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_DOWN, evt);
        } else {
            this.dispatch(GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_UP, evt);
        }
    };

    /**
     * @return {void}
     * @throws {Error} if gamepad state monitor is already started
     */
    GamepadStateMonitor.prototype.start = function () {
        if (this.isStarted) {
            throw new Error("Gamepad state monitor is already started");
        }

        this.isStarted = true;
        pollForGamepadStateUpdates(this, this.gamepad);
    };

    /**
     * @return {void}
     * @throws {Error} if gamepad state monitor is not started
     */
    GamepadStateMonitor.prototype.stop = function () {
        if (!this.isStarted) {
            throw new Error("Gamepad state monitor is not started");
        }

        this.isStarted = false;
    };

    /**
     * @param {Gamepad} gamepad
     * @param {array} previousAxes
     * @param {array} previousButtons
     * @return {void}
     */
    GamepadStateMonitor.prototype.updateGamepadStatus = function (gamepad, previousAxes, previousButtons) {
        var i = 0;

        for (i = 0; i < gamepad.axes.length; i += 1) {
            if (gamepad.axes[i] !== previousAxes[i]) {
                this.processAxisMove(gamepad, i, gamepad.axes[i], previousAxes[i]);
            }
        }

        for (i = 0; i < gamepad.buttons.length; i += 1) {
            if (gamepad.buttons[i] !== previousButtons[i]) {
                this.processButtonStateChange(gamepad, i, gamepad.buttons[i], previousButtons[i]);
            }
        }
    };

    return GamepadStateMonitor;

});
