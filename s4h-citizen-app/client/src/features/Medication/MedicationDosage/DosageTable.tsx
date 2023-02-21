import React from 'react';
import './DosageTable.scss';
import DosageTableItem from './DosageTableItem';

export interface Dosage {
  title: string;
  value: string;
}

interface Props {
  basicInformation: Dosage[];
  detailedInformation: Dosage[];
  comment?: string;
  route?: string;
}

const DosageTable = ({ basicInformation, detailedInformation }: Props) => {
  return (
    <div className="DosageTable">
      {basicInformation.length > 0 && (
        <div className="DosageTable__table" data-testid="dosage-table">
          {basicInformation.map((row, index) => (
            <DosageTableItem title={row.title} value={row.value} key={index} />
          ))}
        </div>
      )}
      {detailedInformation.length > 0 && (
        <div className="DosageTable__table" data-testid="dosage-table">
          {detailedInformation.map((row, index) => (
            <DosageTableItem title={row.title} value={row.value} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DosageTable;
