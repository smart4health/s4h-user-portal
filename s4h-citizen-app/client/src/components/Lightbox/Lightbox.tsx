import React, { KeyboardEvent, MouseEvent, Ref, TouchEvent } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ReactComponent as IconClose } from './images/close.svg';
import { ReactComponent as IconZoomIn } from './images/zoom-in.svg';
import { ReactComponent as IconZoomOut } from './images/zoom-out.svg';
import './Lightbox.scss';

interface Props extends WithTranslation {
  image: string;
  step: number;
  min: number;
  max: number;
  onCloseRequest: Function;
}

type State = {
  zoom: number;
  offsetX: number;
  offsetY: number;
  storedOffsetX: number;
  storedOffsetY: number;
};

class Lightbox extends React.Component<Props, State> {
  state = {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    storedOffsetX: 0,
    storedOffsetY: 0,
  };

  constructor(props: Props) {
    super(props);

    this._startX = null;
    this._startY = null;
    this._lastWheelZoom = 0;

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onImageShiftEnd = this.onImageShiftEnd.bind(this);
    this.close = this.close.bind(this);
    this.increaseZoom = this.increaseZoom.bind(this);
    this.decreaseZoom = this.decreaseZoom.bind(this);
    this.toggleZoom = this.toggleZoom.bind(this);
    this.startShift = this.startShift.bind(this);
    this.shift = this.shift.bind(this);
    this.endShift = this.endShift.bind(this);
    this.wheelZoom = this.wheelZoom.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);

    this.wrapperEl = React.createRef();
    document.body.classList.add('ReactModal__Body--open');
  }

  componentDidMount() {
    // @ts-ignore
    this.wrapperEl.current.focus();
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.body.classList.remove('ReactModal__Body--open');
    document.fullscreenElement && document.exitFullscreen();
  }

  onFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    !isFullscreen && this.close();
  }

  onKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    const isEscape = event.key === 'Escape';
    const isPlus = event.key === '+';
    const isMinus = event.key === '-';

    if (isEscape || isPlus || isMinus) {
      event.preventDefault();
    }

    isEscape && this.close();
    isPlus && this.increaseZoom();
    isMinus && this.decreaseZoom();
  }

  onImageShiftEnd(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    this.endShift(event, false);
  }

  get step() {
    const { step = 0.3 } = this.props;
    return step;
  }

  get min() {
    const { min = 1 } = this.props;
    return min;
  }

  get max() {
    const { max = 3 } = this.props;
    return max;
  }

  get offsetX() {
    const { offsetX, storedOffsetX } = this.state;
    return offsetX + storedOffsetX;
  }

  get offsetY() {
    const { offsetY, storedOffsetY } = this.state;
    return offsetY + storedOffsetY;
  }

  get isDecreaseDisabled() {
    const { zoom } = this.state;
    return zoom - this.step < this.min;
  }

  get isIncreaseDisabled() {
    const { zoom } = this.state;
    return zoom + this.step > this.max;
  }

  getCoords(event: MouseEvent | TouchEvent) {
    // @ts-ignore
    const coordsObject = event.chagedTouches ? event.changedTouches[0] : event;
    const { clientX: x, clientY: y } = coordsObject;

    return { x, y };
  }

  close() {
    const { onCloseRequest } = this.props;
    onCloseRequest();
  }

  decreaseZoom() {
    const { step, min } = this;
    const { zoom } = this.state;
    const target = zoom - step;
    this.zoom(target < min ? min : target);
  }

  increaseZoom() {
    const { step, max } = this;
    const { zoom } = this.state;
    const target = zoom + step;
    this.zoom(target > max ? max : target);
  }

  toggleZoom() {
    const { min, max } = this;
    const { zoom } = this.state;
    const target = min + (max - min) / 2;
    this.zoom(zoom === target ? min : target);
  }

  zoom(zoom: number) {
    this.setState({ zoom });
  }

  wheelZoom({ deltaY }: { deltaY: number }) {
    const now = new Date().getTime();
    const then = this._lastWheelZoom;

    if (!deltaY || now - then < 300) {
      return;
    }

    deltaY > 0 && this.increaseZoom();
    deltaY < 0 && this.decreaseZoom();

    this._lastWheelZoom = now;
  }

  startShift(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const coords = this.getCoords(event);

    this._startX = coords.x;
    this._startY = coords.y;
  }

  shift(event: MouseEvent | TouchEvent) {
    if (this._startX === null || this._startY === null) {
      return;
    }

    event.preventDefault();

    const coords = this.getCoords(event);
    const deltaX = coords.x - this._startX;
    const deltaY = coords.y - this._startY;

    this.setState({
      offsetX: deltaX,
      offsetY: deltaY,
    });
  }

  endShift(event: MouseEvent | TouchEvent, closeIfClicked = true) {
    event.preventDefault();

    const { storedOffsetX, storedOffsetY } = this.state;
    const coords = this.getCoords(event);
    const deltaX = this._startX !== null ? coords.x - this._startX : coords.x;
    const deltaY = this._startY !== null ? coords.y - this._startY : coords.y;

    this._startX = null;
    this._startY = null;

    this.setState({
      offsetX: 0,
      offsetY: 0,
      storedOffsetX: storedOffsetX + deltaX,
      storedOffsetY: storedOffsetY + deltaY,
    });

    if (closeIfClicked && Math.abs(deltaX) + Math.abs(deltaY) < 10) {
      this.close();
    }
  }

  _startX: number | null;
  _startY: number | null;
  _lastWheelZoom: number;
  wrapperEl: Ref<HTMLDivElement>;

  render() {
    const { t, image } = this.props;
    const { zoom } = this.state;
    const {
      close,
      increaseZoom,
      decreaseZoom,
      toggleZoom,
      offsetX,
      offsetY,
      startShift,
      shift,
      endShift,
      onImageShiftEnd,
      onKeyUp,
      isIncreaseDisabled,
      isDecreaseDisabled,
      wheelZoom,
    } = this;

    return (
      <>
        {/* eslint-disable-next-line */}
        <div
          className="Lightbox"
          onKeyUp={onKeyUp}
          onContextMenu={event => event.preventDefault()}
          tabIndex={-1}
          ref={this.wrapperEl}
          role="dialog"
          aria-label={t('fullscreen_dialog')}
        >
          <div className="Lightbox__header">
            <button
              type="button"
              onClick={increaseZoom}
              className="Lightbox__action"
              disabled={isIncreaseDisabled}
              aria-label={t('zoom_in')}
            >
              <IconZoomIn />
            </button>
            <button
              type="button"
              onClick={decreaseZoom}
              className="Lightbox__action"
              disabled={isDecreaseDisabled}
              aria-label={t('zoom_out')}
            >
              <IconZoomOut />
            </button>
            <button
              type="button"
              onClick={close}
              className="Lightbox__action"
              aria-label={t('exit_fullscreen')}
            >
              <IconClose />
            </button>
          </div>
          {/* eslint-disable-next-line */}
          <div
            className="Lightbox__body"
            onMouseDown={startShift}
            onTouchStart={startShift}
            onMouseMove={shift}
            onTouchMove={shift}
            onMouseUp={endShift}
            onTouchEnd={endShift}
            onWheel={wheelZoom}
            role="img"
            aria-label={t('fullscreen_preview')}
          >
            <div
              className="Lightbox__offset"
              style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
            >
              {/* eslint-disable-next-line */}
              <div
                className="Lightbox__zoom"
                onMouseUp={onImageShiftEnd}
                onTouchEnd={onImageShiftEnd}
                onDoubleClick={toggleZoom}
                style={{ transform: `scale(${zoom})` }}
              >
                <img className="Lightbox__image" src={image} alt="" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withTranslation()(Lightbox);
