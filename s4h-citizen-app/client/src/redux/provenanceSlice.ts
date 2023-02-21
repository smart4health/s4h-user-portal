import { Provenance } from '@d4l/s4h-fhir-xforms';
import { FHIR_Identifier } from '@d4l/s4h-fhir-xforms/dist/typings/fhir-resources/types';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AppState } from '.';
import { fetchProvenance } from '../services/provenance';

type TransformedProvenance = {
  resourceId: string;
  provenances: Provenance[];
};

const adapters = {
  provenance: createEntityAdapter<TransformedProvenance>({
    selectId: (provenance: TransformedProvenance) => provenance.resourceId,
  }),
};

interface ProvenanceState {
  data: {
    provenance: EntityState<TransformedProvenance>;
  };
}

const initialState: ProvenanceState = {
  data: {
    provenance: adapters.provenance.getInitialState(),
  },
};

const getProvenance = createAsyncThunk(
  'provenance/getProvenance',
  async ({
    resourceId,
    resourceIdentifiers,
  }: {
    resourceId: string;
    resourceIdentifiers: FHIR_Identifier[][];
  }) => {
    // resourceId would be the id of the resource for which the provenance is fetched
    // In case of Groups, it would be groupId and so on
    const provenanceList = await fetchProvenance(resourceIdentifiers);
    return {
      resourceId,
      provenances: provenanceList ?? [],
    };
  }
);

const provenanceSlice = createSlice({
  name: 'provenance',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addCase(
      getProvenance.fulfilled,
      (state, action: PayloadAction<TransformedProvenance>) => {
        adapters.provenance.upsertOne(state.data.provenance, action.payload);
      }
    ),
});

const { reducer } = provenanceSlice;

const { selectById: selectProvenanceById } = adapters.provenance.getSelectors(
  (state: AppState) => state.provenance.data.provenance
);

export { selectProvenanceById };
export { getProvenance };

export default reducer;
