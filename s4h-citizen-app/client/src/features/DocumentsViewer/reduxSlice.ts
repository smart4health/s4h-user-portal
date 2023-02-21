import D4LSDK, { Attachment, Record as SDKRecord } from '@d4l/js-sdk';
import {
  DocumentOperationsOptions,
  FileGroupItem,
  Group,
  GroupItem,
} from '@d4l/s4h-fhir-xforms';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  Draft,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import 'core-js/fn/array/flat-map';
import config from '../../config';
import i18n, { TreatmentCourseTitles } from '../../i18n';
import { AppState } from '../../redux';
import * as sdkService from '../../services/D4L';
import * as groupsService from '../../services/groups';
import { FileZipItem, JSONZipItem, ZipData } from '../../services/types';
import { DOCUMENT_VIEW_DATE_FORMAT, formatDate } from '../../utils/dateHelper';
import determineFilenameForAttachment from '../../utils/determineFilenameForAttachment';
import groupTitle from '../../utils/groupTitle';
import { extractSourceId } from '../../utils/provenance';
import { DocumentFormData } from '../modals/components/ManageGroup/DocumentForm';

const adapters = {
  groupItems: createEntityAdapter<GroupItem>(),
  groups: createEntityAdapter<Group>({
    sortComparer: (group1, group2) => {
      if (!group1.date || !group2.date || group1.date === group2.date) {
        return 0;
      }

      if (group1.date < group2.date) {
        return 1;
      }
      return -1;
    },
  }),
  records: createEntityAdapter<SDKRecord>(),
  files: createEntityAdapter<Attachment>(),
};

enum GroupInteraction {
  ADD,
  EDIT,
}

interface DocumentsViewerState {
  isLoading: boolean;
  isLoadingFile: boolean;
  activeGroupId?: string;
  activeGroupItem: GroupItem | undefined;
  data: {
    groups: EntityState<Group>;
    groupItems: EntityState<GroupItem>;
    records: EntityState<SDKRecord>;
    files: EntityState<Attachment>;
  };
  metaData: {
    recentGroupInteractions: Record<string, GroupInteraction>;
  };
}

const initialState: DocumentsViewerState = {
  isLoading: false,
  isLoadingFile: false,
  activeGroupId: undefined,
  activeGroupItem: undefined,
  data: {
    groups: adapters.groups.getInitialState(),
    groupItems: adapters.groupItems.getInitialState(),
    records: adapters.records.getInitialState(),
    files: adapters.files.getInitialState(),
  },
  metaData: {
    recentGroupInteractions: {},
  },
};

const getGroups = createAsyncThunk(
  'documentsViewer/getGroups',
  async () => await groupsService.fetchGroups()
);

const fetchFiles = createAsyncThunk(
  'documentsViewer/fetchFiles',
  async (documentIds: string[] = []) =>
    Promise.all(documentIds.map(id => groupsService.getAttachmentsForDocument(id)))
);

const upsertDocument = createAsyncThunk(
  'documentsViewer/upsertDocument',
  async (documentFormData: DocumentFormData, thunkAPI) => {
    const provenanceOptions: DocumentOperationsOptions = {
      userId: D4LSDK.getCurrentUserId()!,
      clientId: extractSourceId(config.REACT_APP_OAUTH_CLIENT_ID),
      recorded: new Date(),
    };
    const { documentRecord } = await groupsService.upsertDocument(
      documentFormData,
      provenanceOptions
    );
    const { groupList } = await groupsService.processRecords([documentRecord]);

    const newGroup = groupList
      ? groupList.find(group => group.id === documentRecord.fhirResource.id)
      : undefined;

    if (!newGroup) {
      return thunkAPI.rejectWithValue({ error: 'GroupList is undefined' });
    }
    return { documentRecord, isEdited: !!documentFormData.id, newGroup };
  }
);

const deleteGroup = createAsyncThunk(
  'documentsViewer/deleteGroup',
  async (group: Group, { dispatch }) => {
    const { groupType } = group;

    switch (groupType) {
      case 'Document': {
        await sdkService.deleteSDKResource(group.id);
        break;
      }
      case 'Course': {
        await dispatch(
          deleteGroupItems({
            group,
            groupItemIds: (group.items as GroupItem[]).map(({ id }) => id),
            deleteEntireGroup: true,
          })
        );
        break;
      }
      default:
        throw new Error(`deleteGroup for ${groupType} not implemented`);
    }
  }
);

const deleteGroupItems = createAsyncThunk(
  'documentsViewer/deleteGroupItems',
  async (
    {
      group,
      groupItemIds,
      deleteEntireGroup,
    }: { group: Group; groupItemIds: string[]; deleteEntireGroup: boolean },
    { getState }
  ) => {
    const state = getState() as AppState;
    const fileIds: string[] = [];
    const recordIds: string[] = groupItemIds
      .map(id => selectGroupItemById(state, id))
      .flatMap(item => {
        if (!item) return [];

        if (item.type === 'File') {
          fileIds.push(item.fileId);
          return [item.id];
        }

        if (item.type === 'Questionnaire') {
          return item.sections.flatMap(
            section =>
              [section.questionnaireId, section.questionnaireResponseId].filter(
                Boolean
              ) as string[]
          );
        }

        return [];
      });

    await Promise.all(recordIds.flatMap(id => sdkService.deleteSDKResource(id)));

    return {
      deleteEntireGroup,
      fileIds,
      group,
      groupItemIds,
      recordIds,
    };
  }
);

const documentsViewerSlice = createSlice({
  name: 'documentsViewer',
  initialState,
  reducers: {
    deselectGroup: state => {
      state.activeGroupId = undefined;
      state.activeGroupItem = undefined;
    },
    setGroupItemActive: (state, action: PayloadAction<GroupItem | undefined>) => {
      // The explicit typing is due to the mismatch between readonly type
      // not assignable to a WritableDraft type
      state.activeGroupItem = action.payload as Draft<GroupItem>;
    },
    setGroupActive: (state, action: PayloadAction<string>) => {
      // All usecases need to have action payload to be defined
      state.activeGroupId = action.payload;
      const activeGroup = adapters.groups
        .getSelectors()
        .selectById(state.data.groups, action.payload);
      state.activeGroupItem = activeGroup?.items[0] as Draft<GroupItem>;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(getGroups.pending, state => {
        state.isLoading = true;
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        const { groupList, records } = action.payload;
        if (groupList !== undefined) {
          const nonEmptyGroups = groupList.filter(group => group.items.length > 0);

          adapters.groups.setAll(state.data.groups, nonEmptyGroups);

          const groupItems = nonEmptyGroups
            .map(group => group.items as GroupItem[])
            .reduce((acc, val) => acc.concat(val), []);

          adapters.groupItems.setAll(state.data.groupItems, groupItems);
        }

        adapters.records.setAll(state.data.records, records);
      })
      .addCase(getGroups.rejected, state => {
        state.isLoading = false;
      })
      .addCase(fetchFiles.pending, state => {
        state.isLoadingFile = true;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        const { payload } = action;

        // Get the attachments and flatten the array
        const files = payload
          .map(element => Object.values(element))
          .reduce((flattened, toFlatten) => flattened.concat(toFlatten), []);

        adapters.files.addMany(state.data.files, files);
        state.isLoadingFile = false;
      })
      .addCase(fetchFiles.rejected, state => {
        state.isLoadingFile = false;
      })
      .addCase(upsertDocument.fulfilled, (state, action) => {
        const { documentRecord, isEdited, newGroup } = action.payload;
        if (isEdited) {
          // Due to the deeply nested structure of records, solely calling
          // `updateOne` is not sufficient for updating the entity adapters
          // contents. Instead, here we remove the updated records first
          // and recreate them below.
          // We can assume that documentRecord.id is defined as the document
          // record is returned by the SDK without failing. So we can safely
          // use "id!".
          adapters.records.removeOne(state.data.records, documentRecord.id!);
          adapters.groups.removeOne(state.data.groups, newGroup.id);
          adapters.groupItems.removeOne(state.data.groupItems, newGroup.items[0].id);
          state.metaData.recentGroupInteractions[newGroup.id] =
            GroupInteraction.EDIT;
        } else {
          state.metaData.recentGroupInteractions[newGroup.id] = GroupInteraction.ADD;
        }

        adapters.records.addOne(state.data.records, documentRecord);
        adapters.groups.addOne(state.data.groups, newGroup);
        adapters.groupItems.addOne(state.data.groupItems, newGroup.items[0]);

        state.activeGroupId = newGroup.id;
        state.activeGroupItem = (newGroup.items[0] as Draft<GroupItem>) ?? undefined;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        const deletedGroup = action.meta.arg;
        const deletedGroupId = deletedGroup.id;

        switch (deletedGroup.groupType) {
          case 'Document': {
            const associatedGroupItem = state.data.groups.entities[deletedGroupId]
              ?.items[0] as FileGroupItem;
            const toBeRemovedFileId = associatedGroupItem.fileId;
            adapters.groups.removeOne(state.data.groups, deletedGroupId);
            adapters.files.removeOne(state.data.files, toBeRemovedFileId);
            break;
          }
          default:
            console.debug(
              `deleteGroup.fulfilled called for ${deletedGroup.groupType}`
            );
        }
      })
      .addCase(deleteGroupItems.fulfilled, (state, action) => {
        const { fileIds, group, groupItemIds, recordIds, deleteEntireGroup } =
          action.payload;
        if (groupItemIds.length > 0) {
          adapters.groupItems.removeMany(state.data.groupItems, groupItemIds);
        }
        if (recordIds.length > 0) {
          adapters.records.removeMany(state.data.records, recordIds);
        }
        if (fileIds.length > 0) {
          adapters.files.removeMany(state.data.files, fileIds);
        }
        adapters.groups.removeOne(state.data.groups, group.id);
        if (!deleteEntireGroup) {
          const remainingGroupItems = group.items.filter(
            ({ id }) => !groupItemIds.includes(id)
          );

          adapters.groups.addOne(state.data.groups, {
            ...group,
            items: remainingGroupItems,
          } as Group);
          state.activeGroupItem = remainingGroupItems[0] as Draft<GroupItem>;
        }
      }),
});

const { actions, reducer } = documentsViewerSlice;

// Selectors
export const {
  selectById: selectGroupById,
  selectIds: selectGroupIds,
  selectEntities: selectGroupEntities,
  selectAll: selectAllGroups,
  selectTotal: selectTotalGroups,
} = adapters.groups.getSelectors(
  (state: AppState) => state.documentsViewer.data.groups
);

export const {
  selectById: selectGroupItemById,
  selectIds: selectGroupItemIds,
  selectEntities: selectGroupItemEntities,
  selectAll: selectAllGroupItems,
  selectTotal: selectTotalGroupItems,
} = adapters.groupItems.getSelectors(
  (state: AppState) => state.documentsViewer.data.groupItems
);

export const {
  selectById: selectRecordById,
  selectIds: selectRecordIds,
  selectEntities: selectRecordEntities,
  selectAll: selectAllRecords,
  selectTotal: selectTotalRecords,
} = adapters.records.getSelectors(
  (state: AppState) => state.documentsViewer.data.records
);

export const {
  selectById: selectFileById,
  selectIds: selectFileIds,
  selectEntities: selectFileEntities,
  selectAll: selectAllFiles,
  selectTotal: selectTotalFiles,
} = adapters.files.getSelectors(
  (state: AppState) => state.documentsViewer.data.files
);

export const selectFilesLoadedStatus = (groupId: string) => (state: AppState) => {
  const group = selectGroupById(state, groupId);

  const someFileNotLoadedYet = group?.items
    .filter(item => item.type === 'File')
    .map(item => (item as FileGroupItem).fileId)
    .some((fileId: string) => !selectFileById(state, fileId));

  return someFileNotLoadedYet;
};

export const selectActiveGroupId = (state: AppState): string | undefined =>
  state.documentsViewer.activeGroupId;

export const selectActiveGroup = (state: AppState): Group | undefined => {
  const { activeGroupId } = state.documentsViewer;
  return activeGroupId ? selectGroupById(state, activeGroupId) : undefined;
};

export const selectActiveRecord = (state: AppState): SDKRecord | undefined => {
  const activeGroupItem = state.documentsViewer.activeGroupItem;
  if (!activeGroupItem) {
    return undefined;
  }
  const activeRecord = selectRecordById(state, activeGroupItem.id);
  if (!activeRecord) {
    return undefined;
  }
  return activeRecord;
};

export const selectFileByGroupItemId = (
  state: AppState,
  groupItemId: string
): Attachment | undefined => {
  const groupItem = selectGroupItemById(state, groupItemId) as FileGroupItem;
  const file = selectFileById(state, groupItem.fileId);
  return file ?? undefined;
};

export const selectDownloadableGroupData = (
  state: AppState,
  group: Group
): ZipData => {
  let groupData;

  const itemsByFilename: {
    [filename: string]: FileZipItem | JSONZipItem;
  } = {};

  group.items.forEach(groupItem => {
    switch (groupItem.type) {
      case 'File': {
        // A FileGroupItem produces two files. One for the image or PDF itself and one JSON file with metadata.
        const fileAttachment = selectFileByGroupItemId(state, groupItem.id);
        const documentResource = selectRecordById(state, groupItem.id)?.fhirResource;

        if (!fileAttachment || !documentResource) {
          console.error(
            `Either file attachment or record for group item with id "${groupItem.id} was not found. Skipping during zipping process."`
          );
          return;
        }

        const filename = determineFilenameForAttachment(fileAttachment);

        itemsByFilename[filename] = {
          type: 'File',
          filename,
          data: fileAttachment.file,
        };

        const metadataFilename = [
          'Document info',
          // @ts-ignore TS-FIXME
          documentResource.title,
          fileAttachment.id,
        ]
          .filter(Boolean)
          .join(' ')
          .concat('.json');

        itemsByFilename[metadataFilename] = {
          type: 'JSON',
          filename: metadataFilename,
          data: documentResource,
        };

        break;
      }
      case 'Questionnaire': {
        /*
          A QuestionnaireGroupItem can have multiple sections with each of them
          producing two files. One JSON file for the questionnaire
          and one JSON file for the questionnaire response
        */
        groupItem.sections.forEach(questionnaireSection => {
          const { questionnaireId } = questionnaireSection;
          const { questionnaireResponseId } = questionnaireSection;

          const questionnaireRecord = questionnaireId
            ? selectRecordById(state, questionnaireId)?.fhirResource
            : undefined;

          const questionnaireResponseRecord = selectRecordById(
            state,
            questionnaireResponseId
          )?.fhirResource;

          if (!questionnaireRecord || !questionnaireResponseRecord) {
            console.error(
              `Either the questionnaire or the questionnaire response for group item with id "${groupItem.id} was not found. Skipping during zipping process."`
            );

            return;
          }

          const questionnaireFilename = [groupItem.thumbnailText, questionnaireId]
            .filter(Boolean)
            .join(' ')
            .concat('.json');

          itemsByFilename[questionnaireFilename] = {
            type: 'JSON',
            filename: questionnaireFilename,
            data: questionnaireRecord,
          };

          const questionnaireResponseFilename = [
            groupItem.thumbnailText,
            questionnaireResponseId,
          ]
            .filter(Boolean)
            .join(' ')
            .concat('.json');

          itemsByFilename[questionnaireResponseFilename] = {
            type: 'JSON',
            filename: questionnaireResponseFilename,
            data: questionnaireResponseRecord,
          };
        });
      }
    }
  });

  const dateString = group.date
    ? formatDate(new Date(group.date), DOCUMENT_VIEW_DATE_FORMAT, i18n.language)
    : '';
  const title = groupTitle(group);

  groupData = {
    filename: `${title} ${dateString}`.trim(),
    items: Object.values(itemsByFilename),
  };

  return groupData;
};

// selectors

export const selectHasHealthData = (state: AppState) => {
  const groups = selectAllGroups(state);
  return groups.some(group => group.items.length > 0);
};

export const selectIsGroupRecentlyAdded = (
  state: AppState,
  groupId: string
): boolean =>
  state.documentsViewer.metaData.recentGroupInteractions[groupId] ===
  GroupInteraction.ADD;

export const selectIsGroupRecentlyEdited = (
  state: AppState,
  groupId: string
): boolean =>
  state.documentsViewer.metaData.recentGroupInteractions[groupId] ===
  GroupInteraction.EDIT;

export const selectLastAddedDocumentGroupTitle = (state: AppState): string => {
  // using it for showing in the dashboard
  const documentGroups = selectAllGroups(state);

  const titles = documentGroups.map(group => {
    if (group.groupType === 'Document') {
      return group.title;
    } else if (group.groupType === 'Course') {
      return group.courseTypes.reduce((prev, next) => {
        const key = next.split('$$')[1];
        return i18n.t(`${prev}${TreatmentCourseTitles[key] ?? ''}`);
      }, '');
    } else {
      return null;
    }
  }) as string[] | null;

  return titles?.length ? titles[0] : '';
};

export const selectAllHealthDataInputResourceIds = (state: AppState) => {
  const allInputResourceIds = selectAllGroups(state).reduce<string[]>(
    (result, group) => {
      const resourceIds = selectHealthDataInputResourceIdsForGroup(state, group.id);
      return [...result, ...resourceIds];
    },
    []
  );

  return allInputResourceIds;
};

export const selectHealthDataInputResourceIdsForGroup = (
  state: AppState,
  groupId: string
) => {
  const group = selectGroupById(state, groupId);

  if (!group) {
    return [];
  }

  return group.groupType === 'Document' ? [group.id] : [...group.inputResourceIds];
};

export const selectActiveGroupItem = (state: AppState): GroupItem | undefined =>
  state.documentsViewer.activeGroupItem;

// Thunks
export { getGroups, fetchFiles, deleteGroup, deleteGroupItems, upsertDocument };

// Actions
export const { deselectGroup, setGroupActive, setGroupItemActive } = actions;

// Reducer
export default reducer;
