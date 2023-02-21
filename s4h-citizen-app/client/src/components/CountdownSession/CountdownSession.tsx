import { Component } from 'react';
import { actions, connect } from '../../store';

type Props = {
  loggedIn: boolean;
};

class CountdownSession extends Component<Props> {
  constructor(props: Props) {
    super(props);
    const { loggedIn } = this.props;

    this.timer = 600;

    if (loggedIn) {
      this.initTimer();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { loggedIn } = this.props;

    if (loggedIn !== prevProps.loggedIn) {
      // There's a change in the logged in state of the user
      // We need to do something with the timer

      if (loggedIn) {
        this.initTimer();
      } else {
        this.destroyTimer();
      }
    }
  }

  interval: number | undefined | null; // the type of a Interval apparently?
  timer: number;

  initTimer() {
    // Interval is already running, wtf are you doing
    if (this.interval) {
      return;
    }

    // Initialize the timer
    this.interval = setInterval(this.countdown.bind(this), 1000);

    // Start the click listener
    document.body.onclick = () => {
      this.countdown(true);
    };
  }

  destroyTimer() {
    // Stop the interval
    // @ts-ignore
    clearInterval(this.interval);

    // Remove the onclick handler
    document.body.onclick = null;

    // Nullify the interval
    this.interval = null;
  }

  countdown(reset: Boolean) {
    if (reset) {
      this.timer = 600;
      return;
    }

    this.timer = this.timer - 1;

    if (this.timer === 0) {
      this.destroyTimer();
      actions.onSessionExpired();
    }
  }

  render() {
    return null;
  }
}

export default connect(({ loggedIn }: { loggedIn: boolean }) => ({ loggedIn }))(
  CountdownSession
);
