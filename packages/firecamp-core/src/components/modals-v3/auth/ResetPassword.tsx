import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, IModal, Button, Input } from '@firecamp/ui-kit';
import { VscEye } from '@react-icons/all-files/vsc/VscEye';
import { Rest } from '@firecamp/cloud-apis';

import AppService from '../../../services/app';

/**
 * ResetPassword component
 */
const ResetPassword: FC<IModal> = ({ isOpen = false, onClose = () => {} }) => {
  const [isRequesting, setFlagIsRequesting] = useState(false);
  const form = useForm();
  let { handleSubmit, errors } = form;

  const _onSubmit = async (payload: {
    token: string;
    email: string;
    password: string;
  }) => {
    if (isRequesting) return;
    let { token, email, password } = payload;

    setFlagIsRequesting(true);
    await Rest.auth
      .resetPassword({ token, new_password: password })
      .then((res) => {
        if ([200, 201].includes(res?.status)) {
          AppService.notify.success(res.data?.message, {
            labels: { success: 'Reset password' },
          });
          AppService.modals.openSignIn();
        } else {
          AppService.notify.alert(`Failed to reset password!`, {
            labels: { alert: 'Reset password' },
          });
        }
      })
      .catch((e) => {
        AppService.notify.alert(e?.response?.data?.message || e.message, {
          labels: { alert: 'error!' },
        });
      })
      .finally(() => {
        setFlagIsRequesting(false);
      });
  };

  const _onKeyDown = (e: any) => e.key === 'Enter' && handleSubmit(_onSubmit);

  return (
    <>
      <Modal.Header>
        <img className="mx-auto w-12 mb-6" src={'img/reset-icon.png'} />
        <div className="text-xl mb-6 w-full text-center font-semibold">
          Reset Password
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="">
          <form onSubmit={handleSubmit(_onSubmit)}>
            <Input
              placeholder="Enter E-mail"
              key={'email'}
              name={'email'}
              label="Email"
              registerMeta={{
                required: true,
                maxLength: 50,
                minLength: 1,
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
              }}
              useformRef={form}
              onKeyDown={_onKeyDown}
              error={
                errors?.email ? errors?.email?.message || 'Invalid email' : ''
              }
              wrapperClassName="!mb-2"
            />
            <Input
              placeholder="Enter Token"
              key={'token'}
              name={'token'}
              label="Token"
              type="text"
              registerMeta={{
                required: true,
                maxLength: 50,
                minLength: 4,
              }}
              useformRef={form}
              onKeyDown={_onKeyDown}
              error={
                errors?.token ? errors?.token?.message || 'Invalid token' : ''
              }
              wrapperClassName="!mb-2"
            />
            <Input
              placeholder="Enter password"
              key={'password'}
              name={'password'}
              type={'password'}
              label="Password"
              iconPosition="right"
              icon={<VscEye title="password" size={16} />}
              registerMeta={{
                required: true,
                maxLength: 50,
                minLength: 8,
              }}
              useformRef={form}
              onKeyDown={_onKeyDown}
              error={
                errors?.password
                  ? errors?.password?.message || 'Invalid password'
                  : ''
              }
            />
            <Button
              color="primary"
              text={isRequesting ? `Resetting password...` : 'Reset Password'}
              fullWidth={true}
              size="md"
              onClick={handleSubmit(_onSubmit)}
            />
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex-col">
          <div className="text-sm mt-6 text-center text-appForegroundInActive">
            Not have an account?
            <a
              href="#"
              onClick={(e) => {
                if (e) e.preventDefault();
                AppService.modals.openSignUp();
              }}
              tabIndex={1}
              className="font-bold underline"
            >
              {' '}
              Sign Up
            </a>
          </div>
          <div className="text-sm mt-2 text-center text-appForegroundInActive">
            Already have an account?
            <a
              href="#"
              onClick={(e) => {
                if (e) e.preventDefault();
                AppService.modals.openSignIn();
              }}
              tabIndex={1}
              className="font-bold underline"
            >
              {' '}
              Sign In
            </a>
          </div>
        </div>
        {/* <div className="text-sm mt-6">

      <a
        href="#"
        id="Signup"
        className="fc-auth-footer-link with-underline"
        onClick={e => {
          if (e) e.preventDefault();
          AppService.modals.openSignUp();
        }}>
        Not have an account? Sign Up
      </a>
      <a
        href="#"
        id="signin"
        className="fc-auth-footer-link with-underline"
        onClick={e => {
          if (e) e.preventDefault();
          AppService.modals.openSignIn();
        }}
      >
        Already have an account? Sign In
      </a>
    </div> */}
      </Modal.Footer>
    </>
  );
};

export default ResetPassword;
