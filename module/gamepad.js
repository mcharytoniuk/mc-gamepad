"use strict";

define([
    "Meddler/Gamepad/GamepadRepository",
    "Meddler/Gamepad/GamepadStateMonitor",
    "Meddler/Gamepad/GamepadStateMonitorAggregator",
    "Meddler/EventDispatcher/EventAggregator"
], function (GamepadRepository, GamepadStateMonitor, GamepadStateMonitorAggregator, EventAggregator) {

    var arbitraryIntervalThatPollsForPluggedGamepads = 300,
        globalGamepadRepository = new GamepadRepository(),
        globalGamepadStateMonitorAggregator = new GamepadStateMonitorAggregator(),
        module = {};

    Object.defineProperty(module, "EVENT_GAMEPAD_AXIS_MOVE", { value: GamepadStateMonitor.EVENT_GAMEPAD_AXIS_MOVE });
    Object.defineProperty(module, "EVENT_GAMEPAD_BUTTON_DOWN", { value: GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_DOWN });
    Object.defineProperty(module, "EVENT_GAMEPAD_BUTTON_UP", { value: GamepadStateMonitor.EVENT_GAMEPAD_BUTTON_UP });
    Object.defineProperty(module, "EVENT_GAMEPAD_PLUGGED_IN", { value: GamepadRepository.EVENT_GAMEPAD_PLUGGED_IN });
    Object.defineProperty(module, "EVENT_GAMEPAD_PLUGGED_OUT", { value: GamepadRepository.EVENT_GAMEPAD_PLUGGED_OUT });

    /**
     * Add global event listener.
     *
     * @acces public
     * @param {string} eventName
     * @param {function} listener
     * @return {void}
     * @throws {Error} if event is not supported
     */
    function addEventListener (eventName, listener) {
        if (globalGamepadRepository.supportsEvent(eventName)) {
            globalGamepadRepository.addListener(eventName, listener);

            return;
        }

        if (globalGamepadStateMonitorAggregator.supportsEvent(eventName)) {
            globalGamepadStateMonitorAggregator.addListener(eventName, listener);

            return;
        }

        throw new Error('Event "' + eventName + '" is not supported in this version of Gamepad module.');
    };

    /**
     * @access public
     * @return {GamepadList}
     */
    function getGamepads () {
        return navigator.webkitGamepads || navigator.webkitGetGamepads();
    };

    /**
     * @access public
     * @return {GamepadList}
     */
    function getPluggedGamepads () {
        var gamepads = getGamepads(),
            i,
            pluggedGamepads = [];

        for (i = 0; i < gamepads.length; i += 1) {
            if (gamepads[i]) {
                pluggedGamepads.push(gamepads[i]);
            }
        }

        return pluggedGamepads;
    };

    /**
     * @param {Meddler/EventDispatcher/Event} evt
     * @return {void}
     */
    function onGamepadPluggedIn (evt) {
        var gamepad = evt.data.gamepad,
            gamepadStateMonitor;

        gamepadStateMonitor = globalGamepadStateMonitorAggregator.findByGamepad(gamepad);

        if (!gamepadStateMonitor) {
            gamepadStateMonitor = new GamepadStateMonitor(gamepad);
            globalGamepadStateMonitorAggregator.attach(gamepadStateMonitor);
        }

        if (!gamepadStateMonitor.isStarted) {
            gamepadStateMonitor.start();
        }
    };

    /**
     * @param {Meddler/EventDispatcher/Event} evt
     * @return {void}
     */
    function onGamepadPluggedOut (evt) {
        var gamepadStateMonitor = globalGamepadStateMonitorAggregator.findByGamepad(evt.data.gamepad);

        if (!gamepadStateMonitor) {
            return;
        }

        if (gamepadStateMonitor.isStarted) {
            gamepadStateMonitor.stop();
        }

        globalGamepadStateMonitorAggregator.detach(gamepadStateMonitor);
    };

    /**
     * @access private
     * @return {void}
     */
    function pollForPluggedGamepads () {
        var pluggedGamepads = getPluggedGamepads();

        globalGamepadRepository.setAll(pluggedGamepads);
    };

    globalGamepadRepository.addListener(module.EVENT_GAMEPAD_PLUGGED_IN, onGamepadPluggedIn)
    globalGamepadRepository.addListener(module.EVENT_GAMEPAD_PLUGGED_OUT, onGamepadPluggedOut);

    setInterval(pollForPluggedGamepads, arbitraryIntervalThatPollsForPluggedGamepads);

    module.addEventListener = addEventListener;
    module.getGamepads = getGamepads;
    module.getPluggedGamepads = getPluggedGamepads;

    return module;

});
