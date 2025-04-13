import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { getModal } from './modal-nexus';
import ModalProvider from './modal-provider';

const SomeModal = ({
  text,
  onClose,
}: {
  text: string;
  onClose?: () => void;
}) => (
  <div>
    <p>{text}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

describe('ModalNexus integration', () => {
  beforeEach(() => {
    jest.resetModules(); // reset internal nexus ref
  });

  const mountWithProvider = () => {
    render(
      <ModalProvider>
        <div />
      </ModalProvider>
    );
  };

  it('renders a modal via getModal().showModal()', async () => {
    mountWithProvider();

    act(() => {
      getModal()?.showModal(SomeModal, { text: 'Hello Modal' });
    });

    await waitFor(() => {
      expect(screen.getByText('Hello Modal')).toBeInTheDocument();
    });
  });

  it('destroys modal via destroy()', async () => {
    mountWithProvider();

    let modal: any;
    act(() => {
      modal = getModal()?.showModal(SomeModal, { text: 'To Destroy' });
    });

    await waitFor(() => {
      expect(screen.getByText('To Destroy')).toBeInTheDocument();
    });

    act(() => {
      modal?.destroy();
    });

    await waitFor(() => {
      expect(screen.queryByText('To Destroy')).not.toBeInTheDocument();
    });
  });

  it('removes modal on onClose + destroyOnClose', async () => {
    mountWithProvider();

    const onClose = jest.fn();

    act(() => {
      getModal()?.showModal(
        SomeModal,
        { text: 'Close me', onClose },
        { hideOnClose: true, destroyOnClose: true }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Close me')).toBeInTheDocument();
    });

    act(() => {
      screen.getByText('Close').click();
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(screen.queryByText('Close me')).not.toBeInTheDocument();
    });
  });
});
