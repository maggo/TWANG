import Joystick from "react-joystick";
import React, { Component } from "react";

const joyOptions = {
  mode: "dynamic",
  catchDistance: 150,
  color: "white"
};

const containerStyle = {
  position: "relative",
  height: "90vh",
  width: "100%",
  background: "linear-gradient(to right, #E684AE, #79CBCA, #77A1D3)"
};

export default class JoyWrapper extends Component {
  constructor() {
    super();
    this.managerListener = this.managerListener.bind(this);
  }

  managerListener(manager) {
    const { onMove, onEnd, onStart } = this.props;

    manager.on("start", e => {
      onStart && onStart();
    });

    manager.on("move", (e, stick) => {
      const x =
        ((stick.position.x - stick.instance.position.x) /
          stick.instance.options.size) *
        2;
      const y =
        ((stick.position.y - stick.instance.position.y) /
          stick.instance.options.size) *
        2;
      onMove && onMove(x, y);
    });
    manager.on("end", () => {
      onEnd && onEnd();
    });
  }

  render() {
    return (
      <Joystick
        options={joyOptions}
        containerStyle={containerStyle}
        managerListener={this.managerListener}
      />
    );
  }
}
