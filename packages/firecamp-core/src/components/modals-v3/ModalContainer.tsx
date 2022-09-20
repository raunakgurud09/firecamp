import shallow from 'zustand/shallow';
// import Environment from '../modals/environment/Environment';
// import WorkspaceSetting from '../modals/workspace-setting/WorkspaceSetting';
// import SSLnProxyManager from '../modals/ssl-proxy-manager/SSLnProxyManager';
// import AuthContainer from '../common/auth/AuthContainer';
// import CollectionSetting from '../modals/collection-setting/CollectionSetting';
// import FolderSetting from '../modals/folder-setting/FolderSetting';
// import CookieManager from '../modals/cookie-manager/CookieManager';
// import RefreshToken from '../common/auth/RefreshToken';
// import UserSetting from '../modals/user-setting/UserSetting';
import { useModalStore } from '../../store/modal';
import { EPlatformModalDefaultProps, EPlatformModalTypes } from '../../types';
import ForgotPassword from './auth/ForgotPassword';
import RefreshToken from './auth/RefreshToken';
import ResetPassword from './auth/ResetPassword';
import SignIn from './auth/SignIn';
import SignInWithEmail from './auth/SignInWithEmail';
import SignUp from './auth/SignUp';
import SwitchOrg from './organization/SwitchOrg';
import CreateOrg from './organization/CreateOrg';
import CreateWorkspace from './workspace/CreateWorkspace';
import Invite from './workspace/Invite';
import OrgManagement from './organization/OrgManagement';
import WorkspaceManagement from './workspace/WorkspaceManagement';
import SwitchWorkspace from './workspace/SwitchWorkspace';
import CreateCollection from './collection/CreateCollection';
import SaveRequest from './request/save-request/SaveRequest';
import { Modal } from '@firecamp/ui-kit';
import CreateEnvironment from './environment/CreateEnvironment';
import CreateFolder from './folder/CreateFolder';
import CollectionSetting from './collection/CollectionSetting';
import ManageEnvironment from './environment/ManageEnvironment';
import FolderSetting from './folder/FolderSetting';
import EditRequest from './request/edit-request/EditRequest';

export const ModalContainer = () => {
  let { currentOpenModal, isOpen, close } = useModalStore(
    (s) => ({
      currentOpenModal: s.currentOpenModalType,
      isOpen: s.isOpen,
      open: s.open,
      close: s.close,
    }),
    shallow
  );

  const renderModal = (modalType: EPlatformModalTypes) => {
    switch (modalType) {
      case EPlatformModalTypes.None:
        return <></>;

      // Organization
      case EPlatformModalTypes.CreateOrg:
        return <CreateOrg isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.OrgManagement:
        return <OrgManagement isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.SwitchOrg:
        return <SwitchOrg isOpen={isOpen} onClose={close} />;

      // Workspace
      case EPlatformModalTypes.CreateWorkspace:
        return <CreateWorkspace isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.InviteMembers:
        return <Invite isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.WorkspaceManagement:
        return <WorkspaceManagement isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.SwitchWorkspace:
        return <SwitchWorkspace isOpen={isOpen} onClose={close} />;

      // Collection
      case EPlatformModalTypes.CreateCollection:
        return <CreateCollection onClose={close} />;
      case EPlatformModalTypes.CollectionSetting:
        return <CollectionSetting onClose={close} />;

      // Fodler
      case EPlatformModalTypes.CreateFolder:
        return <CreateFolder onClose={close} />;
      case EPlatformModalTypes.FolderSetting:
        return <FolderSetting onClose={close} />;

      // Request
      case EPlatformModalTypes.SaveRequest:
        return <SaveRequest onClose={close} />;
      case EPlatformModalTypes.EditRequest:
        return <EditRequest onClose={close} />;

      // Environemnt
      case EPlatformModalTypes.CreateEnvironment:
        return <CreateEnvironment onClose={close} />;
      case EPlatformModalTypes.ManageEnvironment:
        return <ManageEnvironment onClose={close} />;

      // User
      // case EPlatformModalTypes.UserProfile: return <UserProfile isOpen={isOpen} onClose={close} />;

      // Auth
      case EPlatformModalTypes.SignIn:
        return <SignIn isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.SignInWithEmail:
        return <SignInWithEmail isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.SignUp:
        return <SignUp isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.ForgotPassword:
        return <ForgotPassword isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.ResetPassword:
        return <ResetPassword isOpen={isOpen} onClose={close} />;
      case EPlatformModalTypes.RefreshToken:
        return <RefreshToken isOpen={isOpen} onClose={close} />;
      default:
        return <></>;
    }
  };
  // return renderModal(currentOpenModal);

  const modalProps = EPlatformModalDefaultProps[currentOpenModal];
  console.log(modalProps, '.....');
  return (
    <Modal isOpen={isOpen} onClose={close} {...modalProps}>
      {renderModal(currentOpenModal)}
    </Modal>
  );

  const modalType = currentOpenModal;
  return (
    <Modal isOpen={isOpen} onClose={close} {...modalProps}>
      <>
        {/* Organization */}
        <CreateOrg
          isOpen={modalType == EPlatformModalTypes.CreateOrg && isOpen}
          onClose={close}
        />
        <OrgManagement
          isOpen={modalType == EPlatformModalTypes.OrgManagement && isOpen}
          onClose={close}
        />
        <SwitchOrg
          isOpen={modalType == EPlatformModalTypes.SwitchOrg && isOpen}
          onClose={close}
        />

        {/* Workspace */}
        <CreateWorkspace
          isOpen={modalType == EPlatformModalTypes.CreateWorkspace && isOpen}
          onClose={close}
        />
        <Invite
          isOpen={modalType == EPlatformModalTypes.InviteMembers && isOpen}
          onClose={close}
        />
        <WorkspaceManagement
          isOpen={
            modalType == EPlatformModalTypes.WorkspaceManagement && isOpen
          }
          onClose={close}
        />
        <SwitchWorkspace
          isOpen={modalType == EPlatformModalTypes.SwitchWorkspace && isOpen}
          onClose={close}
        />

        {/* Collection */}
        <CreateCollection
          isOpen={modalType == EPlatformModalTypes.CreateCollection && isOpen}
          onClose={close}
        />

        {/* Request */}
        {modalType == EPlatformModalTypes.SaveRequest && (
          <SaveRequest onClose={close} />
        )}

        {/* User */}
        {/* <UserProfile isOpen={modalType == EPlatformModalTypes.UserProfile && isOpen} onClose={close} />; */}

        {/* Auth */}
        <SignIn
          isOpen={modalType == EPlatformModalTypes.SignIn && isOpen}
          onClose={close}
        />
        <SignInWithEmail
          isOpen={modalType == EPlatformModalTypes.SignInWithEmail && isOpen}
          onClose={close}
        />
        <SignUp
          isOpen={modalType == EPlatformModalTypes.SignUp && isOpen}
          onClose={close}
        />
        <ForgotPassword
          isOpen={modalType == EPlatformModalTypes.ForgotPassword && isOpen}
          onClose={close}
        />
        <ResetPassword
          isOpen={modalType == EPlatformModalTypes.ResetPassword && isOpen}
          onClose={close}
        />
        <RefreshToken
          isOpen={modalType == EPlatformModalTypes.RefreshToken && isOpen}
          onClose={close}
        />
      </>
    </Modal>
  );
};
