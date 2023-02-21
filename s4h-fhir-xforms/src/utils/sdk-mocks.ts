/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import D4LSDK from "@d4l/js-sdk";
import { IBlobFile } from "@d4l/js-sdk/lib/BlobFile";
import { AppData, DecryptedAppData, FetchResponse, Params, Record } from "@d4l/js-sdk/services/types";

import { uuidv4 } from "./uuid";


/**
 * Values which the mock D4L SDK shall return
 * when the corresponding functions (e.g. `fetchResources`) are called.
 */
export type MockSdkParams = {
    userId:    string;
    resources: unknown[]  // raw FHIR resources
};

/**
 * Return a mock D4L SDK object that returns a fixed set of resources when `fetchResources` is called
 * and throws exceptions for all else functions.
 * The `fetchResources` function honors the `resourceType` filter parameter.
 *
 * See test cases for an exemplary usage.
 *
 * @param   mockedValues Initial values to return when `fetchResources` is called
 * @returns a `D4LSDK` instance implementing the `fetchResources` function
 */
export function readOnlyMockedSdk (mockedValues: MockSdkParams): typeof D4LSDK {
    const records: Record[] = mockedValues.resources.map((res: any) => ({
        id: res.id,
        fhirResource: res
    }));

    return {
        getCurrentUserId: () => mockedValues.userId,
        getCurrentAppId: () => "mock",

        fetchResources: async (ownerId: string, params?: Params): Promise<FetchResponse<Record>> => {
            if (typeof params?.resourceType !== "undefined") {
                const filteredRecords = pipe(records, A.filter(r => r.fhirResource.resourceType === params.resourceType));
                return {
                    totalCount: filteredRecords.length,
                    records: filteredRecords
                };
            } else {
                return {
                    totalCount: records.length,
                    records
                };
            }
        },

        createResource: async (ownerId: string, fhirResource: any, date?: Date, annotations?: string[]): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: createResource: not supported");
        },

        fetchResource: async (ownerId: string, resourceId: string): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: fetchResource: not supported");
        },

        updateResource: async (ownerId: string, fhirResource: any, date: Date, annotations?: string[]): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: updateResource: not supported");
        },

        deleteResource: async (ownerId: string, resourceId: string): Promise<void> => {
            throw new Error("readOnlyMockedSdk: deleteResource: not supported");
        },

        countResources: async (ownerId: string, params?: Params): Promise<number> => {
            throw new Error("readOnlyMockedSdk: countResources: not supported");
        },

        downloadResource: async (ownerId: string, resourceId: string, options?: { imageSize: string; }): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: downloadResource: not supported");
        },

        setup: async ({ clientId, environment, privateKey, requestAccessToken, extendedEnvConfig, fhirVersion }: {
            clientId: string;
            environment: string;
            privateKey: any;
            requestAccessToken: () => Promise<string>;
            extendedEnvConfig?: any;
            fhirVersion?: string;
        }) => mockedValues.userId,

        crypto: ({}) as any,
        ...DUMMY_SDK_FUNCTIONS
    };
}

export type MockSdkRecordsParams = {
    userId:  string;
    records: Record[]
};

export function readOnlyMockedRecordsSdk (mockedValues: MockSdkRecordsParams): typeof D4LSDK {
    const records = mockedValues.records;

    return {
        getCurrentUserId: () => mockedValues.userId,
        getCurrentAppId: () => "mock",

        fetchResources: async (ownerId: string, params?: Params): Promise<FetchResponse<Record>> => {
            if (typeof params?.resourceType !== "undefined") {
                const filteredRecords = pipe(records, A.filter(r => r.fhirResource.resourceType === params.resourceType));
                return {
                    totalCount: filteredRecords.length,
                    records: filteredRecords
                };
            } else {
                return {
                    totalCount: records.length,
                    records
                };
            }
        },

        createResource: async (ownerId: string, fhirResource: any, date?: Date, annotations?: string[]): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: createResource: not supported");
        },

        fetchResource: async (ownerId: string, resourceId: string): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: fetchResource: not supported");
        },

        updateResource: async (ownerId: string, fhirResource: any, date: Date, annotations?: string[]): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: updateResource: not supported");
        },

        deleteResource: async (ownerId: string, resourceId: string): Promise<void> => {
            throw new Error("readOnlyMockedSdk: deleteResource: not supported");
        },

        countResources: async (ownerId: string, params?: Params): Promise<number> => {
            throw new Error("readOnlyMockedSdk: countResources: not supported");
        },

        downloadResource: async (ownerId: string, resourceId: string, options?: { imageSize: string; }): Promise<Record> => {
            throw new Error("readOnlyMockedSdk: downloadResource: not supported");
        },

        setup: async ({ clientId, environment, privateKey, requestAccessToken, extendedEnvConfig, fhirVersion }: {
            clientId: string;
            environment: string;
            privateKey: any;
            requestAccessToken: () => Promise<string>;
            extendedEnvConfig?: any;
            fhirVersion?: string;
        }) => mockedValues.userId,

        crypto: ({}) as any,
        ...DUMMY_SDK_FUNCTIONS
    };
}

/**
 * Return a mock D4L SDK object that is initialized with a fixed set of resources.
 * These resources are returned when calling `fetchResources` (it does not honor the `fetchResources` filter parameter).
 * Furthermore, the following functions are implemented as well (but not supporting any optional parameters):
 * - `fetchResource`
 * - `createResource`
 * - `updateResource`
 * - `countResources`
 * - `deleteResource`
 *
 * See test cases for an exemplary usage.
 *
 * @param   mockedValues Initial values for the mock SDK object
 * @returns a `D4LSDK` instance implementing the above-mentioned functions
 */
export function simpleMockedSdk (mockedValues: MockSdkParams): typeof D4LSDK {
    let records: Record[] = mockedValues.resources.map((res: any) => ({
        id: res.id,
        fhirResource: res
    }));

    return {
        getCurrentUserId: () => mockedValues.userId,
        getCurrentAppId: () => "mock",

        fetchResources: async (ownerId: string, params?: Params): Promise<FetchResponse<Record>> => {
            if (typeof params?.resourceType !== "undefined") {
                const filteredRecords = pipe(records, A.filter(r => r.fhirResource.resourceType === params.resourceType));
                return {
                    totalCount: filteredRecords.length,
                    records: filteredRecords
                };
            } else {
                return {
                    totalCount: records.length,
                    records
                };
            }
        },

        createResource: async (ownerId: string, fhirResource: any, date?: Date, annotations?: string[]): Promise<Record> => {
            const copy = JSON.parse(JSON.stringify(fhirResource));
            copy.id = uuidv4();

            records.push({
                id: copy.id,
                fhirResource: copy
            });

            return {
                fhirResource: copy
            };
        },

        fetchResource: async (ownerId: string, resourceId: string): Promise<Record> => {
            const record = records.filter(r => r.id === resourceId);
            if (record.length > 0) {
                return {
                    fhirResource: record[0]
                };
            } else {
                throw new Error("resource not found: " + resourceId);
            }
        },

        updateResource: async (ownerId: string, fhirResource: any, date: Date, annotations?: string[]): Promise<Record> => {
            const copy = JSON.parse(JSON.stringify(fhirResource));

            for (const record of records) {
                if (record.id === fhirResource.id) {
                    record.fhirResource = copy;
                    return record;
                }
            }

            throw new Error("resource update failed, resource not found: " + fhirResource.id);
        },

        deleteResource: async (ownerId: string, resourceId: string): Promise<void> => {
            const idx = pipe(records, A.findIndex(r => r.id === resourceId));
            if (O.isSome(idx)) {
                const result = pipe(records, A.deleteAt(idx.value));
                if (O.isSome(result)) {
                    records = result.value;
                }
            }
        },

        countResources: async (ownerId: string, params?: Params): Promise<number> => {
            return records.length;
        },

        downloadResource: async (ownerId: string, resourceId: string, options?: { imageSize: string; }): Promise<Record> => {
            throw new Error("downloadResource not implemented");
        },

        setup: async ({ clientId, environment, privateKey, requestAccessToken, extendedEnvConfig, fhirVersion }: {
            clientId: string;
            environment: string;
            privateKey: any;
            requestAccessToken: () => Promise<string>;
            extendedEnvConfig?: any;
            fhirVersion?: string;
        }) => mockedValues.userId,

        crypto: ({}) as any,
        ...DUMMY_SDK_FUNCTIONS
    };
}

const DUMMY_SDK_FUNCTIONS = {
    grantPermission: (appId: string, annotations?: string[]) => undefined,
    getReceivedPermissions: async () => [],
    setCurrentUserLanguage: (languageCode: string) => undefined,
    createAppData:   async (ownerId: string, data: any, date?: Date, annotations?: string[]): Promise<any> => undefined,
    fetchAppData:    async (ownerId: string, appDataId: string): Promise<DecryptedAppData> => ({}) as any,
    updateAppData:   async (ownerId: string, data: any, id: string, date: any, annotations?: string[]): Promise<any> => undefined,
    deleteAppData:   async (ownerId: string, resourceId: string): Promise<void> => undefined,
    fetchAllAppData: async (ownerId: string, params?: Params): Promise<FetchResponse<AppData>> => ({}) as any,
    createCodeableConcept: (display?: string, code?: string, system?: string) => ({}) as any,
    getCodeFromCodeableConcept: (fhirCodeableConcept: any) => "",
    getDisplayFromCodeableConcept: (fhirCodeableConcept: any) => "",
    isAllowedFileType: async (file: IBlobFile) => undefined,

    createCAP: () => undefined,
    sealCAP: (privateKey: any) => undefined,
    throttleRequest: async (interval?: number) => undefined,

    models: ({}) as any,

    reset: () => undefined
};
