import React from 'react';
import Lightbox from '../../../../components/Lightbox';
import './ImageView.scss';

interface Props {
  fileData: string;
  toggleLightboxVisibility: (value: boolean) => void;
  isLightboxVisible: boolean;
}

const ImageView: React.FunctionComponent<Props> = props => {
  const { fileData, toggleLightboxVisibility, isLightboxVisible } = props;

  return (
    <div className="GroupItemImageView">
      <button onClick={() => toggleLightboxVisibility(true)}>
        <img src={fileData} alt="" />
      </button>
      {isLightboxVisible && (
        <Lightbox
          image={fileData}
          step={0.35}
          min={1}
          max={4}
          onCloseRequest={() => toggleLightboxVisibility(false)}
        />
      )}
    </div>
  );
};

export default ImageView;
