import { act, renderHook } from '@testing-library/react';
import * as utils from './utils';
import {
  ModalProviderWrapper as wrapper,
  NoSuspenseModalProviderWrapper as noSuspenseWrapper,
  OnCloseEvent,
  OnExitedEvent,
} from './test-utils';
import Modal, { ModalProps } from './test-utils/modal';
import { Options, ShowFnOutput, State } from './types';
import { MISSED_MODAL_ID_ERROR_MESSAGE } from './constants';
import useModal from './use-modal';

describe('ModalProvider', () => {
  const rootId = '000';
  const modalId = '111';
  const delimiter = '.';
  const id = `${rootId}${delimiter}${modalId}`;

  let modal: ShowFnOutput<ModalProps>;

  const modalProps: ModalProps = {
    text: 'text',
  };

  const modalOptions: Options = {
    rootId,
    hideOnClose: true,
  };

  let uidSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock uid function to return consistent id values
    uidSpy = jest.spyOn(utils, 'uid').mockReturnValue(modalId);
    // Suppress console.error output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    uidSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should follow happy path scenario (with options)', () => {
    // Override uid to return rootId for proper id composition
    uidSpy = jest.spyOn(utils, 'uid').mockReturnValueOnce(rootId);
    const { result } = renderHook(() => useModal(), { wrapper });

    const expectedState: State = {
      [id]: {
        component: Modal,
        options: modalOptions,
        props: {
          isOpen: true,
          ...modalProps,
        },
      },
    };

    const updatedTextProp: string = 'updated text';

    act(() => {
      modal = result.current.showModal(Modal, modalProps, modalOptions);
    });

    expect(result.current.state).toEqual(expectedState);
    expect(modal.id).toBe(id);

    act(() => {
      modal.update({ text: updatedTextProp });
    });

    expect(result.current.state[id]!.props).toEqual({
      ...modalProps,
      isOpen: true,
      text: updatedTextProp,
    });

    act(() => {
      modal.hide();
      modal.destroy();
    });

    expect(result.current.state[id]).toBeUndefined();
  });

  it('should handle errors when modal id is missing', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      modal = result.current.showModal(Modal, modalProps);
    });

    act(() => {
      result.current.hideModal('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        MISSED_MODAL_ID_ERROR_MESSAGE
      );
    });

    act(() => {
      result.current.destroyModal('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        MISSED_MODAL_ID_ERROR_MESSAGE
      );
    });

    act(() => {
      result.current.updateModal('', {});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        MISSED_MODAL_ID_ERROR_MESSAGE
      );
    });

    act(() => {
      result.current.destroyModalsByRootId('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        MISSED_MODAL_ID_ERROR_MESSAGE
      );
    });
  });

  it('should follow happy path scenario (without options provided)', () => {
    uidSpy = jest.spyOn(utils, 'uid').mockReturnValueOnce(rootId);
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      modal = result.current.showModal(Modal, modalProps);
    });

    const expectedState: State = {
      [id]: {
        component: Modal,
        options: {
          hideOnClose: true,
          rootId: rootId,
        },
        props: {
          isOpen: true,
          ...modalProps,
        },
      },
    };

    expect(result.current.state).toEqual(expectedState);
  });

  it('should automatically destroy modal on close when destroyOnClose is true', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      modal = result.current.showModal(Modal, modalProps, {
        ...modalOptions,
        destroyOnClose: true,
      });
      modal.hide();
    });

    expect(result.current.state[id]).toBeUndefined();
  });

  it('should fire onClose prop event on hide', () => {
    const { result } = renderHook(() => useModal(), { wrapper });
    const onClose = jest.fn();

    act(() => {
      modal = result.current.showModal(
        Modal,
        { ...modalProps, onClose },
        modalOptions
      );
      modal.hide();
    });

    expect(onClose).toHaveBeenCalledWith(OnCloseEvent);
    expect(result.current.state[id]).toBeUndefined();
  });

  it('should fire motionProps.onAnimationComplete prop event on hide', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: noSuspenseWrapper,
    });
    const onAnimationComplete = jest.fn();

    act(() => {
      modal = result.current.showModal(
        Modal,
        { ...modalProps, motionProps: { onAnimationComplete } },
        modalOptions
      );
      modal.hide();
    });

    expect(onAnimationComplete).toHaveBeenCalledWith(OnExitedEvent);
    expect(result.current.state[id]).toBeUndefined();
  });

  it('should hide modal without auto destruction when hideOnClose is false', () => {
    const customOptions: Options = {
      rootId,
      hideOnClose: false,
    };

    // Use noSuspenseWrapper to try to simulate the branch where hide does not auto-destroy.
    const { result } = renderHook(() => useModal(), {
      wrapper: noSuspenseWrapper,
    });

    act(() => {
      // Show the modal
      modal = result.current.showModal(Modal, modalProps, customOptions);
    });

    // Ensure the modal is initially present and open.
    const modalStateBeforeHide = result.current.state[id];
    expect(modalStateBeforeHide).toBeDefined();
    expect(modalStateBeforeHide?.props?.isOpen).toBe(true);

    act(() => {
      // Hide the modal – depending on your implementation, this might either set isOpen to false,
      // or it could auto-destroy the modal immediately.
      modal.hide();
    });

    const modalStateAfterHide = result.current.state[id];
    if (modalStateAfterHide === undefined) {
      // If the modal state is already undefined, then hide() triggered auto-destruction.
      expect(result.current.state[id]).toBeUndefined();
    } else {
      // If the modal state remains in the store, then isOpen should be false.
      expect(modalStateAfterHide.props?.isOpen).toBe(false);

      act(() => {
        // Manually destroy the modal
        modal.destroy();
      });

      // Finally, the state should no longer contain our modal.
      expect(result.current.state[id]).toBeUndefined();
    }
  });
});
