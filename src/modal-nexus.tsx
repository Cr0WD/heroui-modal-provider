import useModal from './use-modal';

type Nexus = {
  getModal?: ReturnType<typeof useModal>;
};

const nexus: Nexus = {};

export default function ModalNexus() {
  nexus.getModal = useModal();
  return null;
}

export const getModal = () => nexus.getModal;
