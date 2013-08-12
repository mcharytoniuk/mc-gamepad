"use strict";

define([
    "Meddler/EventDispatcher/Event",
    "Meddler/Repository/Repository"
], function (Event, Repository) {

    /**
     * @auguments Meddler/Repository/Repository
     * @constructor
     * @param {array} pluggedGamepads (optional)
     */
    function GamepadRepository (pluggedGamepads) {
        Repository.call(this, pluggedGamepads);
    };
    GamepadRepository.prototype = Object.create(Repository.prototype);

    Object.defineProperty(GamepadRepository, "EVENT_GAMEPAD_PLUGGED_IN", { value: "event.gamepad.plugged.in" });
    Object.defineProperty(GamepadRepository, "EVENT_GAMEPAD_PLUGGED_OUT", { value: "event.gamepad.plugged.out" });

    /**
     * @return {void}
     */
    GamepadRepository.prototype.getSupportedEvents = function () {
        return [
            GamepadRepository.EVENT_GAMEPAD_PLUGGED_IN,
            GamepadRepository.EVENT_GAMEPAD_PLUGGED_OUT
        ];
    };

    /**
     * @param {Gamepad} gamepad
     * @return {void}
     */
    GamepadRepository.prototype.onItemAttached = function (gamepad) {
        this.dispatch(GamepadRepository.EVENT_GAMEPAD_PLUGGED_IN, new Event({ gamepad: gamepad, repository: this }));
    };

    /**
     * @param {Gamepad} gamepad
     * @return {void}
     */
    GamepadRepository.prototype.onItemDetached = function (gamepad) {
        this.dispatch(GamepadRepository.EVENT_GAMEPAD_PLUGGED_OUT, new Event({ gamepad: gamepad, repository: this }));
    };

    return GamepadRepository;

});
