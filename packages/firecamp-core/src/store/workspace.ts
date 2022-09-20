import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import _reject from 'lodash/reject';

import { _object, _string } from '@firecamp/utils';
import { Rest } from '@firecamp/cloud-apis';
import { TId, IWorkspace, IOrganization } from '@firecamp/types';

import { useEnvStore } from './environment';
import AppService from '../services/app';

const initialState = {
  workspace: {
    name: 'My Workspace',
    _meta: {
      id: nanoid(), // only when user is guest
    },
  },
  explorer: {
    tdpInstance: null,
    is_progressing: false,

    collections: [],
    folders: [],
    requests: [],
  },
};

export interface IWorkspaceStore {
  explorer: {
    tdpInstance: any;
    is_progressing: boolean;
    collections?: any[];
    folders?: any[];
    requests?: any[];
  };

  registerTDP: (instance: any) => void;
  unRegisterTDP: () => void;
  toggleProgressBar: (flag?: boolean) => void;

  // organization
  createOrg: (payload: TCreateOrgPayload) => Promise<any>;
  checkOrgNameAvailability: (name: string) => Promise<any>;

  // workspace
  workspace: Partial<IWorkspace>;
  setWorkspace: (workspace: IWorkspace) => void;
  fetchExplorer: (wId: string) => void;
  create: (payload: TCreateWrsPayload) => Promise<any>;
  checkNameAvailability: (name: string, org_id?: string) => Promise<any>;
  switch: (workspace_id: string, activeWorkspace: string) => void;
  update: (updates: any, commitAction: boolean, updateDB: boolean) => void;
  remove: (workspaceId: string) => void;
  getWorkspaceId: () => TId;

  // collection
  createCollection: (payload: { [k: string]: any }) => Promise<any>;
  updateCollection: (cId: string, payload: { [k: string]: any }) => void;
  deleteCollection: (cId: string) => void;

  // folder
  createFolder: (payload: { [k: string]: any }) => Promise<any>;
  updateFolder: (fId: string, payload: { [k: string]: any }) => void;
  deleteFolder: (fId: string) => void;

  // request
  createRequest: (payload: { [k: string]: any }) => void;
  updateRequest: (rId: string, payload: { [k: string]: any }) => void;
  deleteRequest: (rId: string) => void;

  // common
  dispose: () => void;
}

export const useWorkspaceStore = create<IWorkspaceStore>(
  devtools((set, get) => ({
    workspace: { ...initialState.workspace },
    explorer: { ...initialState.explorer },

    // register TreeDatProvider instance
    registerTDP: (instance: any) => {
      const { collections, folders, requests } = get().explorer;
      instance.init(collections, folders, requests);
      set((s) => {
        return { explorer: { ...s.explorer, tdpInstance: instance } };
      });
    },

    // unregister TreeDatProvider instance
    unRegisterTDP: () => {
      set((s) => ({ explorer: { ...s.explorer, tdpInstance: null } }));
    },

    toggleProgressBar: (flag?: boolean) => {
      set((s) => ({
        explorer: {
          ...s.explorer,
          is_progressing:
            typeof flag == 'boolean' ? flag : !s.explorer.is_progressing,
        },
      }));
    },

    setWorkspace: (workspace: IWorkspace) => {
      set((s) => ({ workspace }));
    },

    // fetch remote collections of workspace... replacement of fetchAndSetAll
    fetchExplorer: async (workspaceId: string) => {
      const state = get();

      state.toggleProgressBar(true);
      await Rest.workspace
        .fetchWorkspaceArtifacts(workspaceId)
        .then((res: any) => {
          if (Array.isArray(res.data?.collections)) {
            let {
              workspace = {},
              collections = [],
              folders = [],
              requests = [],
              environments = [],
            } = res.data;

            // console.log(res.data, "res.data wCollection...");

            set((s) => {
              s.explorer?.tdpInstance?.init(collections, folders, requests);
              return {
                workspace,
                explorer: { ...s.explorer, collections, folders, requests },
              };
            });

            //TODO: set env from here atm, but improve this logic in future to fetch directly in Env store
            useEnvStore.getState().initialize(environments);
          }
        })
        .catch((e) => {
          console.log(e.response, 'e');
          AppService.notify.alert(e.response?.data?.message || e.message);
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
    },

    // create a new workspace #v3
    // if `org_id` is presented then It'll be an organizational wrs or else personal
    create: async (payload: TCreateWrsPayload) => {
      return Rest.workspace.createV3(payload);
    },

    // check the workspace name is available or not
    // if `org_id` is presented then It'll be an organizational wrs or else personal
    checkNameAvailability: (name: string, org_id?: string) => {
      return Rest.workspace.availability({ name, org_id });
    },

    /**
     * switch: To switch another workspace
     */
    switch: async (workspace_id: string, activeWorkspace: string) => {},

    update: async (updates = {}) => {
      // const workspace = get().workspace;
      // const updatedWorkspace = new Object(_object.mergeDeep(workspace, updates));
      // set((s) => ({
      //   workspace: { ...s.workspace, ...updatedWorkspace },
      // }));
    },

    remove: async (workspaceId = '') => {},

    getWorkspaceId: (): TId => {
      const state = get();
      return state.workspace._meta.id;
    },

    // collection
    createCollection: async (payload: { [k: string]: any }) => {
      const state = get();
      const _collection = {
        name: payload?.name,
        description: payload?.description,
        _meta: {
          id: nanoid(),
          workspace_id: state.workspace._meta.id,
        },
      };
      state.toggleProgressBar(true);
      const res = await Rest.collection
        .create(_collection)
        .then((r) => {
          set((s) => {
            s.explorer?.tdpInstance.addCollectionItem(_collection);
            return {
              explorer: {
                ...s.explorer,
                collections: [...s.explorer.collections, _collection],
              },
            };
          });
          return r;
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },
    updateCollection: async (cId: string, payload: { [k: string]: any }) => {
      const state = get();
      state.toggleProgressBar(true);
      const res = await Rest.collection
        .update(cId, payload)
        .then((r) => {
          set((s) => {
            const collections = s.explorer.collections.map((c) => {
              if (c._meta.id == cId) c = { ...c, ...payload }; //note: this condition is used considering only renaming usecase
              return c;
            });
            return { explorer: { ...s.explorer, collections } };
          });
          return r;
        })
        .catch((e) => {})
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },
    deleteCollection: async (cId: string) => {
      const state = get();

      state.toggleProgressBar(true);
      const res = await Rest.collection
        .delete(cId)
        .then((r) => {
          set((s) => {
            const collections = s.explorer.collections.filter(
              (c) => c._meta.id == cId
            );
            s.explorer.tdpInstance.deleteCollectionItem(cId);
            return { explorer: { ...s.explorer, collections } };
          });
          return r;
        })
        .catch((e) => {})
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },

    // folder
    createFolder: async (payload: { [k: string]: any }) => {
      const state = get();
      const _folder = {
        name: payload?.name,
        description: payload?.description,
        _meta: {
          id: nanoid(),
          collection_id: payload?._meta?.collection_id,
          folder_id: payload?._meta?.folder_id,
        },
      };

      state.toggleProgressBar(true);
      const res = await Rest.folder.create(_folder);
      state.toggleProgressBar(false);

      //@ts-ignore
      _folder.meta = { type: 'F' };
      set((s) => {
        s.explorer?.tdpInstance.addFolderItem(_folder);
        return {
          explorer: {
            ...s.explorer,
            folders: [...s.explorer.folders, _folder],
          },
        };
      });
      return res;
    },
    updateFolder: async (fId: string, payload: { [k: string]: any }) => {
      const state = get();
      state.toggleProgressBar(true);
      const res = await Rest.folder
        .update(fId, payload)
        .then((r) => {
          set((s) => {
            const folders = s.explorer.folders.map((f) => {
              if (f._meta.id == fId) f = { ...f, ...payload }; //note: this condition is used considering only renaming usecase
              return f;
            });
            return { explorer: { ...s.explorer, folders } };
          });
          return r;
        })
        .catch((e) => {
          if (e.message == 'Network Error') {
            //TODO: show error notification
          }
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },
    deleteFolder: async (fId: string) => {
      const state = get();
      state.toggleProgressBar(true);
      const res = await Rest.folder
        .delete(fId)
        .then((r) => {
          set((s) => {
            const folders = s.explorer.folders.filter((f) => f._meta.id == fId);
            s.explorer.tdpInstance.deleteFolderItem(fId);
            return { explorer: { ...s.explorer, folders } };
          });
          return r;
        })
        .catch((e) => {
          if (e.message == 'Network Error') {
            //TODO: show error notification
          }
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },

    // request
    createRequest: async (payload: { [k: string]: any }) => {
      const state = get();
      const _request = {
        ...payload,
        _meta: { ...payload._meta, workspace_id: state.workspace._meta.id },
      };
      state.toggleProgressBar(true);
      const res = await Rest.request
        .create(_request)
        .then((r) => {
          set((s) => {
            s.explorer?.tdpInstance.addRequestItem(_request);
            return {
              explorer: {
                ...s.explorer,
                requests: [...s.explorer.requests, _request],
              },
            };
          });
          return r;
        })
        .catch((e) => {})
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },
    updateRequest: async (rId: string, payload: { [k: string]: any }) => {
      const state = get();
      state.toggleProgressBar(true);
      const res = await Rest.request
        .update(rId, payload)
        .then((r) => {
          set((s) => {
            const requests = s.explorer.requests.map((r) => {
              if (r._meta.id == rId)
                r = { ...r, meta: { ...r.meta, ...payload.meta } }; //note: this condition is used considering only renaming usecase
              return r;
            });
            return { explorer: { ...s.explorer, requests } };
          });
          return r;
        })
        .catch((e) => {
          if (e.message == 'Network Error') {
            //TODO: show error notification
          }
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },
    deleteRequest: async (rId: string) => {
      const state = get();
      state.toggleProgressBar(true);
      const res = await Rest.request
        .delete(rId)
        .then((r) => {
          set((s) => {
            const requests = s.explorer.requests.filter(
              (r) => r._meta.id == rId
            );
            s.explorer.tdpInstance.deleteRequestItem(rId);
            return { explorer: { ...s.explorer, requests } };
          });
          return r;
        })
        .catch((e) => {
          if (e.message == 'Network Error') {
            //TODO: show error notification
          }
        })
        .finally(() => {
          state.toggleProgressBar(false);
        });
      return res;
    },

    //organization
    // create a new workspace #v3
    createOrg: async (payload: TCreateOrgPayload) => {
      return Rest.organization.create(payload);
    },
    // check the org name is available or not
    checkOrgNameAvailability: (name: string) => {
      return Rest.organization.availability({ name });
    },

    // dispose whole store and reset to initial state
    dispose: () =>
      set((s) => {
        s.explorer?.tdpInstance?.init([], [], []);
        return {
          ...initialState,
          explorer: {
            ...initialState.explorer,
            tdpInstance: s.explorer.tdpInstance,
          },
        };
      }),
  }))
);

type TCreateOrgPayload = { name: string; default_workspace_name: string };
type TCreateWrsPayload = {
  name: string;
  description?: string;
  _meta?: { org_id: string };
};
